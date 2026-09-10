export type BookStatus = 'Lido' | 'Não lido';

export interface Book {
  _id?: string;
  title: string;
  author: string;
  status: BookStatus;
}

export type NewBook = Omit<Book, '_id'>;

/**
 * Nome do evento global usado para o micro Catálogo avisar o micro
 * Estante que um livro foi adicionado à estante pessoal do usuário.
 * É o único "contrato" combinado entre os dois micros — eles não
 * compartilham código além deste nome de evento.
 */
export const ADD_TO_SHELF_EVENT = 'bookhub:add-to-shelf';

export function isBookRead(book: Pick<Book, 'status'>): boolean {
  return book.status === 'Lido';
}
