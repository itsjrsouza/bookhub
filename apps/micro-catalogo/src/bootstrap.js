import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Usado apenas quando este micro roda standalone (npm run dev), fora do
// shell do BookHub.
const container = document.getElementById('root');
createRoot(container).render(<App />);
