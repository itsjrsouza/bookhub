// Vercel Serverless Function: proxy para a coleção de livros do crudcrud.
// Rota: GET/POST /api/livros
//
// Existe para que a URL do crudcrud (com o ID único do endpoint) nunca
// apareça no bundle JS público — ela fica só como variável de ambiente
// do lado do servidor (CRUDCRUD_URL).
//
// CommonJS de propósito (module.exports, não export default): o
// package.json deste app não declara "type": "module", então um .js com
// sintaxe ESM pode falhar a carregar como função serverless dependendo
// do runtime — o que geraria um 502 antes mesmo do try/catch rodar.
const { getCrudcrudUrl, parseBody, parseResponseBody, fetchWithRetry } = require('../_lib/crudcrud');

module.exports = async function handler(req, res) {
  // Bloco try/catch envolvendo TUDO: qualquer erro inesperado (inclusive
  // fora da chamada ao crudcrud) sempre vira uma resposta JSON com status
  // e mensagem claros, nunca um 502 "mudo" da plataforma.
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const CRUDCRUD_URL = getCrudcrudUrl();
    if (!CRUDCRUD_URL) {
      res.status(500).json({ error: 'CRUDCRUD_URL não configurada nas variáveis de ambiente do projeto.' });
      return;
    }

    if (req.method === 'GET') {
      console.log('[api/livros] GET recebido, consultando crudcrud…');
      const upstream = await fetchWithRetry(CRUDCRUD_URL);
      const data = await parseResponseBody(upstream);
      console.log('[api/livros] GET concluído, status upstream:', upstream.status);
      res.status(upstream.status).json(data);
      return;
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      console.log('[api/livros] POST recebido, enviando ao crudcrud…', body);
      const upstream = await fetchWithRetry(CRUDCRUD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await parseResponseBody(upstream);
      console.log('[api/livros] POST concluído, status upstream:', upstream.status);
      res.status(upstream.status).json(data);
      return;
    }

    res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('[api/livros] erro não tratado:', error);
    res.status(502).json({
      error: 'Falha ao comunicar com o crudcrud.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
