import React from 'react';
import BookItem from './BookItem';

function BookList({ books, isLoading, busyId, onDelete, onToggleStatus, onAddToShelf }) {
  if (isLoading) {
    return <p className="state-message">Carregando catálogo…</p>;
  }

  if (books.length === 0) {
    return <p className="state-message">Nenhum livro cadastrado ainda. Adicione o primeiro! 🚀</p>;
  }

  return (
    <ul className="book-list">
      {books.map((book) => (
        <BookItem
          key={book._id}
          book={book}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onAddToShelf={onAddToShelf}
          isBusy={busyId === book._id}
        />
      ))}
    </ul>
  );
}

export default BookList;
