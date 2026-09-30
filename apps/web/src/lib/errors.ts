/**
 * Mensagens de erro legíveis (pt-BR).
 *
 * As funções do banco (db/migrations/002) já levantam erros em português e eles
 * são repassados como estão; aqui só se traduzem as mensagens em inglês do
 * GoTrue (login/cadastro) e do PostgREST/rede.
 */

/** Converte qualquer erro (Supabase, rede, etc.) em mensagem legível em pt-BR. */
export function toErrorMessage(error: unknown, fallback = 'Erro inesperado.'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return translateMessage(error.message) || fallback;
  }
  return fallback;
}

/** Traduz as mensagens em inglês do GoTrue/PostgREST; as do banco já vêm em pt-BR. */
export function translateMessage(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha inválidos.';
  if (/email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar.';
  if (/user already registered/i.test(msg)) return 'Este e-mail já está cadastrado.';
  // O mínimo é configurável no projeto Supabase: repete o número que o servidor informou.
  const minLength = /password should be at least (\d+)/i.exec(msg);
  if (minLength) return `A senha deve ter pelo menos ${minLength[1]} caracteres.`;
  if (/should be different from the old password/i.test(msg)) {
    return 'A nova senha deve ser diferente da anterior.';
  }
  // Sem sessão para trocar a senha: o link de recuperação expirou ou já foi usado.
  if (/auth session missing/i.test(msg)) {
    return 'O link de recuperação expirou ou já foi usado. Volte ao login e peça um novo em "Esqueci minha senha".';
  }
  if (/weak and easy to guess/i.test(msg)) return 'Senha muito fraca. Escolha outra, mais difícil.';
  if (/signups? not allowed|signup is disabled/i.test(msg)) {
    return 'O cadastro de novos usuários está desativado neste projeto.';
  }
  if (/email address .* is invalid|unable to validate email address/i.test(msg)) {
    return 'E-mail inválido. Informe um endereço de e-mail real.';
  }
  if (/rate limit|too many requests|over_email_send_rate_limit/i.test(msg)) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.';
  }
  // O trigger handle_new_user falhou no banco (o GoTrue esconde o motivo). O caso
  // mais comum é CPF já cadastrado em outra conta.
  if (/database error saving new user/i.test(msg)) {
    return 'Não foi possível criar a conta. Confira os dados — o CPF informado pode já estar cadastrado.';
  }
  if (/jwt expired|invalid jwt|refresh token/i.test(msg)) {
    return 'Sua sessão expirou. Entre novamente.';
  }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) {
    return 'Sem conexão com o servidor. Verifique a internet e tente novamente.';
  }
  if (/row-level security|permission denied/i.test(msg)) {
    return 'Você não tem permissão para esta ação.';
  }
  if (/uq_doctor_schedule_overlap|uq_patient_schedule_overlap/i.test(msg)) {
    return 'Este horário já está ocupado. Escolha outro.';
  }
  return msg;
}
