import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configuração do front-end do KaukaMed/OdontoAura (Vite + React).
 *
 * - `base` vem de `VITE_BASE_PATH`, necessário para publicar em GitHub Pages
 *   (ex.: `/KaukaMed/`). Em desenvolvimento e em hospedagem na raiz, use `/`.
 * - O servidor de desenvolvimento escuta em `0.0.0.0` e aceita os hosts dos
 *   previews remotos (`*.e2b.app`), além de `localhost`.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectDir, '');

  const base = env.VITE_BASE_PATH || '/';
  const devPort = Number(env.VITE_DEV_PORT || 3000);
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173);

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(projectDir, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: devPort,
      strictPort: true,
      allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    },
    preview: {
      host: '0.0.0.0',
      port: previewPort,
      strictPort: true,
      allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1'],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      // As telas do protótipo ficam num único bundle (~750 kB / ~180 kB gzip).
      chunkSizeWarningLimit: 1000,
    },
  };
});
