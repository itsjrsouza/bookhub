import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

// URLs dos remotes configuráveis por variável de ambiente: em desenvolvimento
// apontam para os micros rodando localmente; em produção (Vercel), defina
// CATALOGO_REMOTE_URL e ESTANTE_REMOTE_URL nas variáveis de ambiente do
// projeto do shell, apontando para as URLs publicadas de cada micro
// (ex: https://bookhub-micro-catalogo.vercel.app).
const catalogoRemoteUrl = process.env.CATALOGO_REMOTE_URL || 'http://localhost:3001';
const estanteRemoteUrl = process.env.ESTANTE_REMOTE_URL || 'http://localhost:3002';

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
          entry: `${catalogoRemoteUrl}/remoteEntry.js`,
          entryGlobalName: 'micro_catalogo',
          shareScope: 'default',
        },
        micro_estante: {
          type: 'var',
          name: 'micro_estante',
          entry: `${estanteRemoteUrl}/remoteEntry.js`,
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
