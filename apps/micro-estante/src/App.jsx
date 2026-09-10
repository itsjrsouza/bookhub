import React, { useEffect, useState } from 'react';
import {
  ADD_TO_SHELF_EVENT,
  getShelfBooks,
  isBookRead,
  removeBookFromShelf,
} from '@bookhub/shared';
import './styles.css';

function App() {
  // O shell já escuta ADD_TO_SHELF_EVENT desde que a aplicação inicia e
  // persiste a estante em localStorage (ver estanteStore.ts em
  // @bookhub/shared) — por isso o estado inicial já vem de lá, e não de
  // um array vazio. Sem isso, um livro adicionado enquanto o usuário
  // está na aba Catálogo (antes deste micro ser montado) se perderia.
  const [shelf, setShelf] = useState(() => getShelfBooks());

  useEffect(() => {
    function handleAddToShelf(event) {
      const book = event.detail;
      setShelf((prev) => {
        const alreadyOnShelf = prev.some((item) => item._id === book._id);
        if (alreadyOnShelf) return prev;
        return [...prev, book];
      });
    }

    window.addEventListener(ADD_TO_SHELF_EVENT, handleAddToShelf);
    return () => window.removeEventListener(ADD_TO_SHELF_EVENT, handleAddToShelf);
  }, []);

  function removeFromShelf(id) {
    setShelf(removeBookFromShelf(id));
  }

  const readCount = shelf.filter((book) => isBookRead(book)).length;

  return (
    <section className="micro-estante">
      <header className="micro-estante-header">
        <h1>🗄️ Minha Estante</h1>
        <p>
          {shelf.length === 0
            ? 'Livros que você adicionar no Catálogo aparecem aqui automaticamente.'
            : `${shelf.length} livro(s) na estante · ${readCount} lido(s)`}
        </p>
      </header>

      {shelf.length === 0 ? (
        <p className="estante-vazia">Sua estante está vazia. 📭</p>
      ) : (
        <ul className="estante-lista">
          {shelf.map((book) => (
            <li key={book._id} className="estante-item">
              <span className="estante-item-emoji" aria-hidden="true">
                {isBookRead(book) ? '✅' : '📗'}
              </span>
              <div className="estante-item-info">
                <p className="estante-item-titulo">{book.title}</p>
                <p className="estante-item-autor">{book.author}</p>
              </div>
              <button
                type="button"
                className="btn-remover"
                onClick={() => removeFromShelf(book._id)}
                title="Remover da estante"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default App;
