import { ADD_TO_SHELF_EVENT, type Book } from './types';

const STORAGE_KEY = 'bookhub-estante';

export function getShelfBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

function saveShelfBooks(books: Book[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function addBookToShelf(book: Book): Book[] {
  const current = getShelfBooks();
  if (current.some((item) => item._id === book._id)) return current;
  const updated = [...current, book];
  saveShelfBooks(updated);
  return updated;
}

export function removeBookFromShelf(id: string | undefined): Book[] {
  const updated = getShelfBooks().filter((item) => item._id !== id);
  saveShelfBooks(updated);
  return updated;
}

/**
 * Registra, uma única vez, um listener global de ADD_TO_SHELF_EVENT que
 * persiste a estante em localStorage independentemente de o micro
 * Estante estar montado no momento. Sem isso, um livro adicionado à
 * estante enquanto o usuário está na aba Catálogo (e o micro Estante
 * ainda não foi carregado) seria perdido, porque eventos do DOM não
 * ficam "em espera" para listeners que ainda não existem.
 *
 * Deve ser chamado uma vez pelo shell, assim que o app inicia.
 */
export function startShelfPersistence(): () => void {
  function handleAddToShelf(event: Event): void {
    const book = (event as CustomEvent<Book>).detail;
    addBookToShelf(book);
  }

  window.addEventListener(ADD_TO_SHELF_EVENT, handleAddToShelf);
  return () => window.removeEventListener(ADD_TO_SHELF_EVENT, handleAddToShelf);
}
