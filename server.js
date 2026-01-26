import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
import nodemailer from 'nodemailer';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY; 

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false
});

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Erro ao conectar BD:', err);
  else console.log('✅ Base de dados conectada:', res.rows[0].now);
});


// CONFIGURAÇÃO DO NODEMAILER (EMAIL) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Ex: smtp.gmail.com ou sandbox.smtp.mailtrap.io
  port: process.env.SMTP_PORT, // Ex: 587 ou 2525
  secure: false, // true apenas para a porta 465, false para outras
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar se o servidor de email está pronto (COM PROTEÇÃO PARA BUILD)
if (process.env.SMTP_HOST) {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('❌ Erro na configuração do Email (SMTP):', error);
    } else {
      console.log('✅ Servidor de Email pronto a enviar.');
    }
  });
} else {
  console.log('⚠️ Aviso: Credenciais SMTP não encontradas. O envio de emails não funcionará neste ambiente.');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (apenas para desenvolvimento local)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- API ROUTES ---

// 1. Receber Pedido de Ajuda (Com Email e Captcha)
app.post('/api/ajuda', async (req, res) => {
  try {
    const { text, email, captcha } = req.body;

    // Validações
    if (!text || !email) {
      return res.status(400).json({ message: 'Texto e email são obrigatórios.' });
    }

    // Verificar ReCaptcha com a Google
    if (RECAPTCHA_SECRET && captcha) {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}`;
        const googleRes = await fetch(verifyUrl, { method: 'POST' });
        const googleData = await googleRes.json();
        if (!googleData.success || googleData.score < 0.5) {
            console.warn('Bot bloqueado pelo Recaptcha:', googleData);
            return res.status(400).json({ message: 'Atividade suspeita detetada.' });
        }
    }

    // Inserir na BD
    const result = await pool.query(
      `INSERT INTO pedidos_ajuda (texto, email, data_envio, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [text, email, new Date().toISOString(), 'pending']
    );

    res.status(200).json({ message: 'Pedido enviado!', id: result.rows[0].id });

  } catch (error) {
    console.error('Erro no pedido de ajuda:', error);
    res.status(500).json({ message: 'Erro interno.', error: error.message });
  }
});

// 2. Listar Pedidos (Para o Admin)
app.get('/api/pedidos', async (req, res) => {
  try {
    // Agora incluímos o email na seleção
    const result = await pool.query(
      `SELECT id, texto, email, data_envio, status, resposta, data_resposta
       FROM pedidos_ajuda ORDER BY data_envio DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Responder a Pedido (COM ENVIO DE EMAIL)
app.post('/api/responder', async (req, res) => {
  try {
    const { id, resposta } = req.body;
    if (!id || !resposta) return res.status(400).json({ message: 'Dados incompletos.' });

    // PASSO A: Buscar o email e a pergunta original
    const pedidoQuery = await pool.query('SELECT email, texto FROM pedidos_ajuda WHERE id = $1', [id]);
    
    if (pedidoQuery.rowCount === 0) {
        return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    const emailDestino = pedidoQuery.rows[0].email;
    const perguntaOriginal = pedidoQuery.rows[0].texto;

    // PASSO B: Enviar o Email via Nodemailer
    // Nota: O await aqui garante que só atualizamos a BD se o email for enviado sem erro
    await transporter.sendMail({
      from: `"Núcleo EI" <${process.env.SMTP_USER}>`, // Nome e Email do Remetente
      to: emailDestino,
      subject: `Resposta ao teu pedido #${id} - Núcleo EI`,
      text: `Olá!\n\nRecebemos o teu pedido: "${perguntaOriginal}"\n\nNossa Resposta:\n${resposta}\n\nCumprimentos,\nEquipa NEI`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #0d1117; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: #00d9a3; margin: 0;">Núcleo EI</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Olá! 👋</p>
                <p>Obrigado por entrares em contacto connosco.</p>
                
                <div style="background-color: #f6f8fa; padding: 15px; border-left: 4px solid #00d9a3; margin: 20px 0;">
                    <small style="color: #666; display: block; margin-bottom: 5px;">A tua pergunta:</small>
                    <em style="color: #24292f;">"${perguntaOriginal}"</em>
                </div>

                <h3>A nossa resposta:</h3>
                <p style="font-size: 16px; line-height: 1.6; color: #24292f;">
                    ${resposta.replace(/\n/g, '<br>')}
                </p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    Esta é uma mensagem automática do sistema do Núcleo de Engenharia Informática.<br>
                    Universidade Fernando Pessoa
                </p>
            </div>
        </div>
      `, 
    });

    console.log(`📧 Email enviado com sucesso para ${emailDestino}`);

    // PASSO C: Atualizar a Base de Dados
    const result = await pool.query(
      `UPDATE pedidos_ajuda
       SET resposta = $1, data_resposta = $2, status = 'respondido'
       WHERE id = $3 RETURNING id`,
      [resposta, new Date().toISOString(), id]
    );


    if (result.rowCount === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });

    // RESPOSTA FINAL (CORRIGIDA: Apenas uma resposta JSON)
    res.json({ message: 'Resposta enviada por email e guardada.' });

  } catch (error) {
    console.error("❌ Erro ao responder:", error);
    // Garantir que enviamos apenas uma resposta de erro se algo falhar
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao enviar email ou guardar na BD.', details: error.message });
    }
  }
});

    

// 4. Perfil Admin (Ler e Atualizar)
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios LIMIT 1');
        res.json(result.rows);
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.put('/api/usuarios', async (req, res) => {
    try {
        const { nome, linkedin_url, instagram_url } = req.body;
        // Assume que existe um user com ID 1
        await pool.query(
            `UPDATE usuarios SET nome=$1, linkedin_url=$2, instagram_url=$3 WHERE id=1`,
            [nome, linkedin_url, instagram_url]
        );
        res.json({ message: 'Perfil atualizado' });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// Servir Ficheiros Estáticos (Frontend)
// Nota: O Docker copia para 'dist', mas localmente pode ser 'public'.
// O código abaixo tenta servir do 'dist' primeiro.
app.use(express.static(join(__dirname, 'dist')));

// Fallback para SPA (Single Page Application) ou rotas não encontradas
app.get('*', (req, res) => {
  // VERIFICAÇÃO NOVA:
  // Se o pedido for para uma API ou ficheiro estático (.js, .css, .png) e não existir,
  // devolvemos Erro 404 em vez de enviarmos o index.html por engano.
  if (req.url.startsWith('/api/') || req.url.match(/\.(js|css|png|jpg|ico|json)$/)) {
    return res.status(404).send('Not found');
  }
  
  // Só devolve o HTML se for navegação real
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Iniciar Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});