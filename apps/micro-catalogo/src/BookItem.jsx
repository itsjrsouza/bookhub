import React from 'react';
import { isBookRead } from '@bookhub/shared';

function BookItem({ book, onDelete, onToggleStatus, onAddToShelf, isBusy, isOnShelf }) {
  const read = isBookRead(book);

  return (
    <li className={`book-item ${isBusy ? 'is-busy' : ''}`}>
      <div className="book-info">
        <span className="book-cover" aria-hidden="true">
          {read ? '✅' : '📕'}
        </span>
        <div>
          <p className="book-title">{book.title}</p>
          <p className="book-author">{book.author}</p>
        </div>
      </div>

      <div className="book-actions">
        <button
          type="button"
          className={`badge-status ${read ? 'read' : 'unread'}`}
          onClick={() => onToggleStatus(book)}
          disabled={isBusy}
          title="Alternar status de leitura"
        >
          {book.status}
        </button>
        {isOnShelf ? (
          <span className="badge-on-shelf" title="Este livro já está na sua estante">
            ✓ Na estante
          </span>
        ) : (
          <button
            type="button"
            className="btn-shelf"
            onClick={() => onAddToShelf(book)}
            disabled={isBusy}
            title="Adicionar à minha estante"
          >
            📚 Adicionar à estante
          </button>
        )}
        <button
          type="button"
          className="btn-delete"
          onClick={() => onDelete(book._id)}
          disabled={isBusy}
          title="Remover do catálogo"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}

export default BookItem;
