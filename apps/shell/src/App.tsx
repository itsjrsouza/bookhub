import { useState } from 'react';
import Nav from './components/Nav';
import CatalogoPage from './pages/CatalogoPage';
import EstantePage from './pages/EstantePage';
import type { Tab } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');

  return (
    <div className="min-h-screen">
      <Nav activeTab={activeTab} onChangeTab={setActiveTab} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/*
          Cada aba só é montada quando está ativa. Isso evita baixar o
          código dos dois micros (via Module Federation) enquanto o
          usuário não visitou aquela aba — ver docs/performance/README.md
          para o ganho de performance medido com essa técnica.
        */}
        {activeTab === 'catalogo' && <CatalogoPage />}
        {activeTab === 'estante' && <EstantePage />}
      </main>
    </div>
  );
}

export default App;
