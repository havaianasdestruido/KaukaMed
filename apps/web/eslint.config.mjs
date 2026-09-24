import nextConfig from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

import { baseConfig } from '../../eslint.config.mjs';

/**
 * ESLint do front-end (Next.js App Router).
 * Combina a configuração oficial do Next.js (Core Web Vitals e regras do React)
 * com as regras comuns do monorepo.
 */
export default [
  ...nextConfig,
  ...baseConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
