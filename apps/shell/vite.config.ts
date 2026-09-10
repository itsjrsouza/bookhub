import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

// O shell é o Container da arquitetura de micro frontends do BookHub:
// consome os micros Catálogo e Estante (construídos com Webpack +
// @module-federation/enhanced) via Module Federation.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'shell',
      remotes: {
        micro_catalogo: {
          type: 'var',
          name: 'micro_catalogo',
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'micro_catalogo',
          shareScope: 'default',
        },
        micro_estante: {
          type: 'var',
          name: 'micro_estante',
          entry: 'http://localhost:3002/remoteEntry.js',
          entryGlobalName: 'micro_estante',
          shareScope: 'default',
        },
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3000,
    origin: 'http://localhost:3000',
  },
  build: {
    target: 'esnext',
  },
});
