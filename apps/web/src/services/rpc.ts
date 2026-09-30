import { requireSupabase } from '../lib/supabase';

/**
 * Chamada de funções do banco (RPC do PostgREST).
 *
 * Toda a regra de agenda vive em funções SQL (db/migrations/002_agendamento_v1.sql);
 * o front-end só as chama. Os erros levantados pelo banco já vêm em pt-BR
 * (ex.: "Este horário acabou de ser reservado."), então são repassados como estão.
 */

/** Erro de uma chamada ao banco, com o código do PostgreSQL/PostgREST quando houver. */
export class RpcError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
  }
}

interface PostgrestLikeError {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

/** Converte o erro do supabase-js numa mensagem que ajuda quem está operando o sistema. */
export function toRpcError(error: PostgrestLikeError, fn: string): RpcError {
  const code = error.code;
  const message = error.message ?? '';

  // Função inexistente: o projeto Supabase não recebeu a migration 002.
  if (code === 'PGRST202' || code === '42883' || /could not find the function/i.test(message)) {
    return new RpcError(
      `O banco de dados ainda não tem a função "${fn}". ` +
        'Execute db/migrations/002_agendamento_v1.sql no SQL Editor do Supabase.',
      code,
    );
  }
  // Tabela ou coluna inexistente: schema base ausente ou desatualizado.
  if (code === '42P01' || code === '42703') {
    return new RpcError(
      'O schema do banco está desatualizado. Reaplique db/kaukamed_schema.sql e as migrations em db/migrations/.',
      code,
    );
  }
  return new RpcError(message || 'Erro ao falar com o banco de dados.', code);
}

/** Chama `public.<fn>(args)` como o usuário logado e devolve o resultado tipado. */
export async function callRpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await requireSupabase().rpc(fn, args);
  if (error) throw toRpcError(error, fn);
  return data as T;
}
