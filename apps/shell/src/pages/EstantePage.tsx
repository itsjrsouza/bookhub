import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RemoteErrorBoundary from '../components/RemoteErrorBoundary';

const EstanteApp = lazy(() => import('micro_estante/App'));

function EstantePage() {
  return (
    <RemoteErrorBoundary nome="Minha Estante (micro-estante, localhost:3002)">
      <Suspense
        fallback={
          <div className="loading-state">
            <Loader2 className="size-4 animate-spin" />
            Carregando estante…
          </div>
        }
      >
        <EstanteApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

export default EstantePage;
