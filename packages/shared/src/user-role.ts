/**
 * Papéis (roles) disponíveis no sistema.
 * Mantidos em sincronia com o enum `user_role` do banco
 * (ver db/kaukamed_schema.sql).
 */
export const USER_ROLES = ['PATIENT', 'EMPLOYEE', 'DOCTOR', 'ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Rótulos em pt-BR para exibição dos papéis na interface. */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  PATIENT: 'Paciente',
  EMPLOYEE: 'Funcionário',
  DOCTOR: 'Médico',
  ADMIN: 'Administrador',
};

/** Descrição do que cada papel pode fazer no sistema. */
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  PATIENT: 'Agenda consultas, acompanha o histórico e os convênios.',
  EMPLOYEE: 'Gerencia a agenda da clínica e confirma atendimentos.',
  DOCTOR: 'Atende consultas, registra prontuários e prescrições.',
  ADMIN: 'Administra usuários, médicos, especialidades e convênios.',
};

/** Verifica se um valor recebido (ex.: vindo da API) é um papel válido. */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}
