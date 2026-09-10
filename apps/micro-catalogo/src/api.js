import axios from 'axios';

/**
 * Gere seu endpoint gratuito em https://crudcrud.com (não exige login).
 * Cole a URL única recebida abaixo, terminando com /livros, ex:
 * https://crudcrud.com/api/1a2b3c4d5e6f7g8h9i0j/livros
 *
 * Atenção: endpoints do crudcrud expiram após alguns dias de uso.
 */
export const API_BASE_URL =
  process.env.CRUDCRUD_URL || 'https://crudcrud.com/api/SEU_ENDPOINT_AQUI/livros';

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
