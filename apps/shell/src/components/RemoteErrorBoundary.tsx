import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface RemoteErrorBoundaryProps {
  nome: string;
  children: ReactNode;
}

interface RemoteErrorBoundaryState {
  hasError: boolean;
}

/**
 * Evita que uma falha ao carregar um micro remoto (servidor daquele
 * micro fora do ar, ou o BookHub publicado em produção sem os micros
 * disponíveis) derrube o shell inteiro.
 */
class RemoteErrorBoundary extends Component<RemoteErrorBoundaryProps, RemoteErrorBoundaryState> {
  state: RemoteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RemoteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha ao carregar micro frontend:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="remote-error flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="m-0">
            Não foi possível carregar <strong>{this.props.nome}</strong>. Rode esse micro
            localmente (veja o README) — em produção, esta seção depende dos micros estarem
            publicados.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RemoteErrorBoundary;
