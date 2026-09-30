import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from './env';

/**
 * Cliente Supabase compartilhado pelo front-end.
 *
 * É `null` quando as variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não
 * estão definidas — nesse caso os services caem no dataset local.
 *
 * A segurança dos dados é garantida pelas policies de RLS do banco
 * (db/kaukamed_schema.sql + db/migrations/), nunca pelo front-end.
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

/** Converte qualquer erro (Supabase, rede, etc.) em mensagem legível em pt-BR. */
export function toErrorMessage(error: unknown, fallback = 'Erro inesperado.'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    const msg = error.message;
    if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha inválidos.';
    if (/email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar.';
    if (/user already registered/i.test(msg)) return 'Este e-mail já está cadastrado.';
    if (/password should be at least/i.test(msg))
      return 'A senha deve ter pelo menos 6 caracteres.';
    if (/row-level security/i.test(msg)) return 'Você não tem permissão para esta ação.';
    if (/uq_doctor_schedule_overlap|uq_patient_schedule_overlap/i.test(msg)) {
      return 'Este horário já está ocupado. Escolha outro.';
    }
    return msg;
  }
  return fallback;
}
