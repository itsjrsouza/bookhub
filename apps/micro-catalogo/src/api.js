import axios from 'axios';

/**
 * Em desenvolvimento local, chama o crudcrud.com direto — gere seu
 * endpoint gratuito em https://crudcrud.com (não exige login) e configure
 * CRUDCRUD_URL em apps/micro-catalogo/.env, terminando com /livros, ex:
 * https://crudcrud.com/api/1a2b3c4d5e6f7g8h9i0j/livros
 *
 * Em produção (Vercel), chama /api/livros — uma Serverless Function
 * própria (ver api/livros/) que repassa a requisição para o crudcrud do
 * lado do servidor. Isso mantém a URL do crudcrud fora do bundle público
 * e evita qualquer ambiguidade de CORS entre domínios diferentes.
 *
 * Atenção: endpoints do crudcrud expiram após pouco tempo de uso — se as
 * chamadas começarem a falhar com "Endpoint has expired", gere um novo em
 * crudcrud.com e atualize CRUDCRUD_URL (no .env local ou nas variáveis de
 * ambiente do projeto bookhub-micro-catalogo na Vercel).
 */
const isProduction = process.env.NODE_ENV === 'production';
const PUBLIC_URL = process.env.PUBLIC_URL;

export const API_BASE_URL =
  isProduction && PUBLIC_URL
    ? `${PUBLIC_URL}/api/livros`
    : process.env.CRUDCRUD_URL || 'https://crudcrud.com/api/SEU_ENDPOINT_AQUI/livros';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchBooks() {
  const response = await api.get('');
  return response.data;
}

export async function createBook(book) {
  const response = await api.post('', book);
  return response.data;
}

export async function deleteBook(id) {
  await api.delete(`/${id}`);
}

export async function updateBookStatus(id, book) {
  await api.put(`/${id}`, book);
}
