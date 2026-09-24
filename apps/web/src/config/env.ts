/**
 * Variáveis de ambiente públicas do front-end.
 *
 * O Next.js injeta as variáveis `NEXT_PUBLIC_*` em tempo de build; este módulo
 * centraliza a leitura e define valores padrão para o desenvolvimento local,
 * evitando `process.env` espalhado pelos componentes.
 */
export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'KaukaMed',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1',
} as const;
