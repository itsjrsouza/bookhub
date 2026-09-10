import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startShelfPersistence } from '@bookhub/shared';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root não encontrado em index.html');

// Precisa rodar assim que o shell inicia (e não só quando a aba "Minha
// Estante" é aberta) para não perder livros adicionados à estante
// enquanto o usuário está no Catálogo — ver estanteStore.ts.
startShelfPersistence();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
