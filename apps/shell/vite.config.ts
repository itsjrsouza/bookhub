import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

// O shell é o Container da arquitetura de micro frontends do BookHub:
// consome os micros Catálogo e Estante (construídos com Webpack +
// @module-federation/enhanced) via Module Federation.
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente injetadas pela Vercel (Production/
  // Preview) ou por um .env local — '' desativa o filtro por prefixo
  // VITE_, já que este arquivo roda em Node (build time), não no browser.
  const env = loadEnv(mode, process.cwd(), '');

  // Em desenvolvimento local, sem essas variáveis definidas, cai nos
  // micros rodando localmente. Em produção (Vercel), configure
  // CATALOGO_REMOTE_URL e ESTANTE_REMOTE_URL nas variáveis de ambiente do
  // projeto do shell, apontando para as URLs publicadas de cada micro.
  const catalogoRemoteUrl = env.CATALOGO_REMOTE_URL || 'http://localhost:3001';
  const estanteRemoteUrl = env.ESTANTE_REMOTE_URL || 'http://localhost:3002';

  return {
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
  };
});
