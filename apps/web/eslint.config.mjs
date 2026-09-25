import globals from 'globals';

import { baseConfig } from '../../eslint.config.mjs';

/**
 * ESLint do front-end (Vite + React).
 *
 * Reaproveita as regras comuns do monorepo (`baseConfig`) e adiciona os
 * globais de navegador. Como o app é 100% client-side, os globais de Node
 * entram apenas para os arquivos de configuração (vite.config.ts).
 */
export default [
  ...baseConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
