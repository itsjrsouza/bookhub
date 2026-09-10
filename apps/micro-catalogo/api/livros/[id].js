// Vercel Serverless Function: proxy para um livro específico do crudcrud.
// Rota: PUT/DELETE /api/livros/:id
//
// CommonJS de propósito — ver comentário em api/livros/index.js.

function getCrudcrudUrl() {
  const raw = process.env.CRUDCRUD_URL || '';
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
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
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

    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: 'Parâmetro "id" ausente na rota.' });
      return;
    }
    const upstreamUrl = `${CRUDCRUD_URL}/${id}`;

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const upstream = await fetch(upstreamUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (upstream.status === 200 || upstream.status === 204) {
        res.status(200).end();
        return;
      }
      const text = await upstream.text();
      const data = text ? JSON.parse(text) : null;
      res.status(upstream.status).json(data);
      return;
    }

    if (req.method === 'DELETE') {
      const upstream = await fetch(upstreamUrl, { method: 'DELETE' });
      res.status(upstream.status).end();
      return;
    }

    res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('[api/livros/[id]] erro:', error);
    res.status(502).json({
      error: 'Falha ao comunicar com o crudcrud.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
