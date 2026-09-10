import { beforeEach, describe, expect, it } from 'vitest';
import { addBookToShelf, getShelfBooks, removeBookFromShelf } from '@bookhub/shared';

describe('estanteStore (via @bookhub/shared)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa vazia quando não há nada salvo', () => {
    expect(getShelfBooks()).toEqual([]);
  });

  it('adiciona um livro e persiste no localStorage', () => {
    const shelf = addBookToShelf({ _id: '1', title: 'Duna', author: 'Frank Herbert', status: 'Não lido' });

    expect(shelf).toHaveLength(1);
    expect(getShelfBooks()).toHaveLength(1);
  });

  it('não duplica o mesmo livro (mesmo _id) na estante', () => {
    const book = { _id: '1', title: 'Duna', author: 'Frank Herbert', status: 'Não lido' as const };
    addBookToShelf(book);
    const shelf = addBookToShelf(book);

    expect(shelf).toHaveLength(1);
  });

  it('remove um livro da estante pelo id', () => {
    addBookToShelf({ _id: '1', title: 'Duna', author: 'Frank Herbert', status: 'Não lido' });
    addBookToShelf({ _id: '2', title: 'O Hobbit', author: 'J.R.R. Tolkien', status: 'Lido' });

    const shelf = removeBookFromShelf('1');

    expect(shelf).toHaveLength(1);
    expect(shelf[0].title).toBe('O Hobbit');
  });
});
