import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RemoteErrorBoundary from '../components/RemoteErrorBoundary';

// Carregado sob demanda: o código do micro Catálogo (Webpack Module
// Federation) só é baixado quando esta página é montada — ver App.tsx,
// que só renderiza a aba ativa.
const CatalogoApp = lazy(() => import('micro_catalogo/App'));

function CatalogoPage() {
  return (
    <RemoteErrorBoundary nome="Catálogo (micro-catalogo, localhost:3001)">
      <Suspense
        fallback={
          <div className="loading-state">
            <Loader2 className="size-4 animate-spin" />
            Carregando catálogo…
          </div>
        }
      >
        <CatalogoApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

export default CatalogoPage;
