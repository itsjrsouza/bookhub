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
// do runtime — o que gera um 502 antes mesmo do try/catch rodar.

function getCrudcrudUrl() {
  const raw = process.env.CRUDCRUD_URL || '';
  // Remove barra(s) no final para nunca gerar "//livros" ao concatenar um id.
  return raw.replace(/\/+$/, '');
}

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

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
      const upstream = await fetch(CRUDCRUD_URL);
      const text = await upstream.text();
      const data = text ? JSON.parse(text) : [];
      res.status(upstream.status).json(data);
      return;
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const upstream = await fetch(CRUDCRUD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await upstream.text();
      const data = text ? JSON.parse(text) : null;
      res.status(upstream.status).json(data);
      return;
    }

    res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('[api/livros] erro:', error);
    res.status(502).json({
      error: 'Falha ao comunicar com o crudcrud.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
