// api/ajuda.js

import { neon } from '@neondatabase/serverless';

// A função neon() irá ler automaticamente process.env.DATABASE_URL se estiver disponível.
// Embora seja bom prática passar a string, no Vercel ele costuma ler a variável.
const sql = neon(process.env.DATABASE_URL); 

// Este é o handler que o Vercel irá executar quando o seu site chamar /api/ajuda
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const { text, at } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'O campo de texto é obrigatório.' });
    }

    // A ligação é feita usando process.env.DATABASE_URL
    const result = await sql`
      INSERT INTO pedidos_ajuda (texto, data_envio)
      VALUES (${text}, ${at ? new Date(at).toISOString() : new Date().toISOString()})
      RETURNING id, data_envio;
    `;

    res.status(200).json({ 
      message: 'Pedido de ajuda guardado com sucesso.', 
      id: result[0].id,
      data_envio: result[0].data_envio
    });

  } catch (error) {
    console.error('Erro ao guardar o pedido de ajuda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor. Não foi possível guardar o pedido.', 
      error: error.message 
    });
  }
};