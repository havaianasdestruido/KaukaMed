// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** Pastas e arquivos ignorados em todos os pacotes do monorepo. */
export const ignores = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/coverage/**',
  '**/*.tsbuildinfo',
  '**/next-env.d.ts',
];

/**
 * Regras compartilhadas por todos os pacotes do monorepo.
 * A última entrada (`prettier`) desativa as regras de estilo que conflitam
 * com a formatação do Prettier — por isso ela precisa ficar sempre no final.
 */
export const baseConfig = [
  { ignores },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Proteção extra para o pacote da API caso o ESLint seja executado a partir
    // da raiz do monorepo: o NestJS depende de imports de valor para a injeção
    // de dependência, então a conversão automática para `import type` fica
    // desativada nesse pacote (o mesmo ajuste existe em apps/api/eslint.config.mjs,
    // que é o arquivo aplicado quando o lint roda dentro do pacote).
    files: ['**/apps/api/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  prettier,
];

export default baseConfig;
