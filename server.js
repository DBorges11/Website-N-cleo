import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
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
        if (!googleData.success) {
            return res.status(400).json({ message: 'Falha na verificação de robô (ReCaptcha).' });
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

// 3. Responder a Pedido (Para o Admin)
app.post('/api/responder', async (req, res) => {
  try {
    const { id, resposta } = req.body;
    if (!id || !resposta) return res.status(400).json({ message: 'Dados incompletos.' });

    const result = await pool.query(
      `UPDATE pedidos_ajuda
       SET resposta = $1, data_resposta = $2, status = 'respondido'
       WHERE id = $3 RETURNING id`,
      [resposta, new Date().toISOString(), id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });
    
    // AQUI FUTURAMENTE PODESse ADICIONAR ENVIO DE EMAIL AUTOMÁTICO (Nodemailer)
    
    res.json({ message: 'Resposta guardada.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Iniciar Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});