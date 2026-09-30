import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from './env';

/**
 * O app foi aberto pelo link de "Esqueci minha senha"? Precisa ser lido AQUI,
 * antes de criar o cliente: o supabase-js consome e apaga o `#access_token=…&type=recovery`
 * da URL durante a inicialização, e o evento PASSWORD_RECOVERY pode disparar antes de
 * o React conseguir escutá-lo.
 */
export const openedFromRecoveryLink: boolean =
  typeof window !== 'undefined' && /[#&?]type=recovery(?:&|$)/.test(window.location.href);

/**
 * Cliente Supabase compartilhado pelo front-end.
 *
 * É `null` quando as variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não
 * estão definidas — nesse caso os services caem no dataset local.
 *
 * Apenas a chave pública (anon) chega ao navegador. A segurança dos dados é
 * garantida pelo RLS e pelas funções do banco (db/kaukamed_schema.sql +
 * db/migrations/), nunca pelo front-end.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'kaukamed-auth',
      },
    })
  : null;

/** Retorna o cliente ou lança um erro claro se o Supabase não estiver configurado. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado (defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).',
    );
  }
  return supabase;
}

export { toErrorMessage } from './errors';
