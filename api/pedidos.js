// api/pedidos.js

import { neon } from '@neondatabase/serverless';

// Usa a mesma variável de ambiente DATABASE_URL que já configurou
const sql = neon(process.env.DATABASE_URL);

// Exportar o handler para a Serverless Function
module.exports = async (req, res) => {
  // Apenas aceitar pedidos GET para ler os dados
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    // 1. Executar a query SQL para buscar todos os pedidos.
    // ORDER BY data_envio DESC: mostra os mais recentes primeiro
    const pedidos = await sql`
      SELECT id, texto, data_envio
      FROM pedidos_ajuda
      ORDER BY data_envio DESC;
    `;

    // 2. Resposta de sucesso com os dados
    res.status(200).json(pedidos);

  } catch (error) {
    console.error('Erro ao buscar os pedidos de ajuda:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao buscar os pedidos.', 
      error: error.message 
    });
  }
};