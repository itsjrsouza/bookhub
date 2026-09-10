/**
 * Tipos, constantes e utilitários compartilhados entre o shell e os
 * micro frontends do BookHub. Consumido diretamente como fonte (sem
 * build próprio) tanto pelo shell (Vite/TS) quanto pelos micros
 * (Webpack/Babel, que apenas removem os tipos em tempo de build).
 */

export * from './types';
export * from './estanteStore';
