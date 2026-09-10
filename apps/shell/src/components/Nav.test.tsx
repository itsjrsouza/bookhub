import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Nav from './Nav';

describe('Nav', () => {
  it('destaca a aba ativa', () => {
    render(<Nav activeTab="catalogo" onChangeTab={vi.fn()} />);

    expect(screen.getByRole('button', { name: /catálogo/i })).toHaveClass('text-white');
  });

  it('chama onChangeTab ao clicar em "Minha Estante"', async () => {
    const user = userEvent.setup();
    const onChangeTab = vi.fn();
    render(<Nav activeTab="catalogo" onChangeTab={onChangeTab} />);

    await user.click(screen.getByRole('button', { name: /minha estante/i }));

    expect(onChangeTab).toHaveBeenCalledWith('estante');
  });

  it('tem um link para o Diário de Leitura em /diario/', () => {
    render(<Nav activeTab="catalogo" onChangeTab={vi.fn()} />);

    expect(screen.getByRole('link', { name: /diário de leitura/i })).toHaveAttribute(
      'href',
      '/diario/',
    );
  });
});
