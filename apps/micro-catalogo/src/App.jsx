import React, { useEffect, useRef, useState } from 'react';
import { ADD_TO_SHELF_EVENT, getShelfBooks, removeBookFromShelf } from '@bookhub/shared';
import { createBook, deleteBook, fetchBooks, updateBookStatus } from './api';
import BookForm from './BookForm';
import BookList from './BookList';
import Toast from './Toast';
import './styles.css';

function App() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  // IDs dos livros já presentes na estante — lido do mesmo localStorage
  // que o micro Estante usa (via @bookhub/shared), para esconder o botão
  // "Adicionar à estante" nos livros que já foram adicionados.
  const [shelfIds, setShelfIds] = useState(() => new Set(getShelfBooks().map((book) => book._id)));
  const toastTimeoutRef = useRef(null);

  async function loadBooks() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError(
        'Não foi possível carregar o catálogo. Configure CRUDCRUD_URL em micro-catalogo/.env com um endpoint válido do crudcrud.com.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  function showToast(message) {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  }

  async function handleAddBook(newBook) {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createBook(newBook);
      setBooks((prev) => [...prev, created]);
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar o livro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBook(id) {
    setBusyId(id);
    setError(null);
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((book) => book._id !== id));
      // Se o livro removido do catálogo estava na estante, remove de lá
      // também — a estante não deveria mostrar um livro que não existe
      // mais no catálogo.
      removeBookFromShelf(id);
      setShelfIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error(err);
      setError('Erro ao remover o livro. Tente novamente.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleStatus(book) {
    setBusyId(book._id);
    setError(null);
    const nextStatus = book.status === 'Lido' ? 'Não lido' : 'Lido';
    try {
      await updateBookStatus(book._id, { title: book.title, author: book.author, status: nextStatus });
      setBooks((prev) => prev.map((item) => (item._id === book._id ? { ...item, status: nextStatus } : item)));
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar o status. Tente novamente.');
    } finally {
      setBusyId(null);
    }
  }

  function handleAddToShelf(book) {
    window.dispatchEvent(new CustomEvent(ADD_TO_SHELF_EVENT, { detail: book }));
    setShelfIds((prev) => new Set(prev).add(book._id));
    showToast(`"${book.title}" foi adicionado à sua estante! 📚`);
  }

  return (
    <section className="micro-catalogo">
      <header className="micro-catalogo-header">
        <h1>📚 Catálogo de Livros</h1>
        <p>Cadastre livros e adicione os que quiser à sua estante pessoal.</p>
      </header>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="micro-catalogo-layout">
        <BookForm onAddBook={handleAddBook} isSubmitting={isSubmitting} />
        <BookList
          books={books}
          isLoading={isLoading}
          busyId={busyId}
          shelfIds={shelfIds}
          onDelete={handleDeleteBook}
          onToggleStatus={handleToggleStatus}
          onAddToShelf={handleAddToShelf}
        />
      </div>

      <Toast message={toastMessage} />
    </section>
  );
}

export default App;
