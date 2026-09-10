// Vercel Serverless Function: proxy para a coleção de livros do crudcrud.
// Rota: GET/POST /api/livros
//
// Existe para que a URL do crudcrud (com o ID único do endpoint) nunca
// apareça no bundle JS público — ela fica só como variável de ambiente
// do lado do servidor (CRUDCRUD_URL).
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const CRUDCRUD_URL = process.env.CRUDCRUD_URL;
  if (!CRUDCRUD_URL) {
    res.status(500).json({ error: 'CRUDCRUD_URL não configurada nas variáveis de ambiente do projeto.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const upstream = await fetch(CRUDCRUD_URL);
      const data = await upstream.json();
      res.status(upstream.status).json(data);
      return;
    }

    if (req.method === 'POST') {
      const upstream = await fetch(CRUDCRUD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      const data = await upstream.json();
      res.status(upstream.status).json(data);
      return;
    }

    res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    res.status(502).json({ error: 'Falha ao comunicar com o crudcrud.', details: String(error) });
  }
}
