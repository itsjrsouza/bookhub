import Nav from './components/Nav';
import CatalogoPage from './pages/CatalogoPage';
import EstantePage from './pages/EstantePage';
import { useRoute } from './hooks/useRoute';

function App() {
  const { route, navigate } = useRoute();

  return (
    <div className="min-h-screen">
      <Nav activeTab={route} onChangeTab={navigate} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/*
          Cada rota só é montada quando está ativa. Isso evita baixar o
          código dos dois micros (via Module Federation) enquanto o
          usuário não visitou aquela rota — ver docs/performance/README.md
          para o ganho de performance medido com essa técnica.
        */}
        {route === 'catalogo' && <CatalogoPage />}
        {route === 'estante' && <EstantePage />}
      </main>
    </div>
  );
}

export default App;
