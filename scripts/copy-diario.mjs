// Copia a PWA "Diário de Leitura" (public/diario) para dentro do build do
// shell (apps/shell/dist/diario), para que fique acessível em /diario/
// no mesmo domínio publicado do BookHub.
import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(rootDir, 'public', 'diario');
const destination = path.join(rootDir, 'apps', 'shell', 'dist', 'diario');

if (!existsSync(source)) {
  throw new Error(`Pasta não encontrada: ${source}`);
}

cpSync(source, destination, { recursive: true });
console.log(`Diário de Leitura copiado para ${destination}`);
