import globals from 'globals';

import { baseConfig } from '../../eslint.config.mjs';

/**
 * ESLint da API (NestJS).
 * Além das regras comuns do monorepo, declara os globais do Node — a API é
 * escrita em ESM e usa decorators do NestJS.
 */
export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // O NestJS resolve as dependências em tempo de execução (emitDecoratorMetadata),
      // então classes injetadas precisam ser importadas como valor — e não com `import type`.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
