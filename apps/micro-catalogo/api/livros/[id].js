// Vercel Serverless Function: proxy para um livro específico do crudcrud.
// Rota: PUT/DELETE /api/livros/:id
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
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

  const { id } = req.query;
  const upstreamUrl = `${CRUDCRUD_URL}/${id}`;

  try {
    if (req.method === 'PUT') {
      const upstream = await fetch(upstreamUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      if (upstream.status === 200 || upstream.status === 204) {
        res.status(200).end();
        return;
      }
      const data = await upstream.json().catch(() => null);
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
    res.status(502).json({ error: 'Falha ao comunicar com o crudcrud.', details: String(error) });
  }
}
