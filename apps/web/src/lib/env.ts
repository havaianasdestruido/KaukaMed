/**
 * Acesso tipado às variáveis de ambiente do front-end.
 *
 * O app tem duas fontes de dados possíveis:
 *  - `supabase` — quando VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão
 *    definidas (ambiente real, com RLS aplicado no banco);
 *  - `local`    — quando não estão, o app usa o dataset embutido em
 *    src/data/mockData.ts e continua 100% navegável (modo demonstração).
 *
 * Essa alternância é automática: nenhuma tela precisa saber de onde os dados
 * vieram, apenas consultar os services em src/services/.
 */

/** De onde os dados estão vindo nesta execução. */
export type DataSource = 'supabase' | 'local';

export interface WebEnv {
  appName: string;
  /** URL base da API REST (apps/api, NestJS). Vazia se não configurada. */
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** Base pública dos assets (ex.: `/KaukaMed/` no GitHub Pages). */
  basePath: string;
}

function read(name: keyof ImportMetaEnv, fallback = ''): string {
  const value = import.meta.env[name];
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

export const env: WebEnv = {
  appName: read('VITE_APP_NAME', 'OdontoAura'),
  apiUrl: read('VITE_API_URL'),
  supabaseUrl: read('VITE_SUPABASE_URL'),
  supabaseAnonKey: read('VITE_SUPABASE_ANON_KEY'),
  basePath: read('VITE_BASE_PATH', '/'),
};

/** Indica se há credenciais suficientes para falar com o Supabase. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** Indica se há uma API REST configurada (usada só para info/health-check). */
export const isApiConfigured = Boolean(env.apiUrl);

/** Fonte de dados ativa nesta execução. */
export const activeDataSource: DataSource = isSupabaseConfigured ? 'supabase' : 'local';

/**
 * Registra no console (uma única vez) o modo de dados em que o app subiu.
 * Ajuda a diagnosticar rapidamente por que as telas mostram dados de exemplo.
 */
let warned = false;
export function reportDataSource(): void {
  if (warned) return;
  warned = true;

  if (isSupabaseConfigured) {
    console.warn(`[kaukamed] fonte de dados: Supabase (${env.supabaseUrl})`);
  } else {
    console.warn(
      '[kaukamed] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas — ' +
        'usando dataset local (modo demonstração).',
    );
  }
}
