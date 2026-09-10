import { useCallback, useEffect, useState } from 'react';
import type { Tab } from '../types';

function routeFromPath(pathname: string): Tab {
  return pathname.startsWith('/estante') ? 'estante' : 'catalogo';
}

function pathFromRoute(route: Tab): string {
  return route === 'estante' ? '/estante' : '/catalogo';
}

/**
 * Roteador mínimo baseado na History API — sem dependências externas,
 * já que o shell só tem duas rotas internas ("/catalogo" e "/estante").
 * Sincroniza a aba ativa com a URL, então dá pra acessar/atualizar a
 * página diretamente em /catalogo ou /estante (o vercel.json do shell
 * reescreve essas rotas para index.html) e o botão voltar do navegador
 * funciona normalmente.
 */
export function useRoute() {
  const [route, setRoute] = useState<Tab>(() => routeFromPath(window.location.pathname));

  useEffect(() => {
    function handlePopState() {
      setRoute(routeFromPath(window.location.pathname));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((next: Tab) => {
    const path = pathFromRoute(next);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(next);
  }, []);

  return { route, navigate };
}
