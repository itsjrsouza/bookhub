import React, { useState } from 'react';

const initialState = { title: '', author: '', status: 'Não lido' };

function BookForm({ onAddBook, isSubmitting }) {
  const [formData, setFormData] = useState(initialState);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) return;

    await onAddBook(formData);
    setFormData(initialState);
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2>➕ Novo livro</h2>

      <div className="field">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Ex: O Hobbit"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="author">Autor</label>
        <input
          id="author"
          name="author"
          type="text"
          placeholder="Ex: J.R.R. Tolkien"
          value={formData.author}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="Não lido">Não lido</option>
          <option value="Lido">Lido</option>
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Adicionando…' : 'Adicionar ao catálogo'}
      </button>
    </form>
  );
}

export default BookForm;
