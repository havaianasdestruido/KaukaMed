import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Testes do front-end: funções puras (src/lib, src/services) e fluxos de tela no modo
 * demonstração (src/App.demo.test.tsx, com jsdom). Não carrega os plugins do Vite
 * (React/Tailwind): o esbuild do Vitest já entende TSX.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(projectDir, 'src') },
  },
  test: {
    // Funções puras rodam em Node; testes de tela (`*.test.tsx`) pedem jsdom no próprio arquivo.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Os testes de tela sempre rodam no modo demonstração, mesmo que exista um .env local.
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
  },
});
