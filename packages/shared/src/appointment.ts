/**
 * Ciclo de vida dos agendamentos.
 * Mantido em sincronia com o enum `appointment_status` do banco
 * (ver db/kaukamed_schema.sql).
 */
export const APPOINTMENT_STATUSES = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Rótulos em pt-BR para exibição dos status na interface. */
export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

/** Status finais: não permitem novas transições. */
export const APPOINTMENT_FINAL_STATUSES: readonly AppointmentStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

/**
 * Transições permitidas no ciclo de vida do agendamento:
 *
 * SCHEDULED -> CONFIRMED -> IN_PROGRESS -> COMPLETED
 *         \\-> CANCELLED / NO_SHOW (a partir de SCHEDULED ou CONFIRMED)
 */
export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> =
  {
    SCHEDULED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
    CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
  };

/** Indica se a mudança de status é permitida pelas regras de negócio. */
export function canTransitionAppointmentStatus(
  current: AppointmentStatus,
  next: AppointmentStatus,
): boolean {
  return APPOINTMENT_STATUS_TRANSITIONS[current].includes(next);
}

/** Tipos de atendimento disponíveis na agenda. */
export const APPOINTMENT_TYPES = [
  'FIRST_VISIT',
  'FOLLOW_UP',
  'RETURN',
  'EMERGENCY',
  'TELEMEDICINE',
] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

/** Rótulos em pt-BR para exibição dos tipos de atendimento na interface. */
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  FIRST_VISIT: 'Primeira consulta',
  FOLLOW_UP: 'Retorno',
  RETURN: 'Reavaliação',
  EMERGENCY: 'Urgência/Emergência',
  TELEMEDICINE: 'Teleconsulta',
};

/** Agendamento no formato devolvido pelas listagens da API. */
export interface AppointmentSummary {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialtyName: string;
  locationName: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  /** Início do atendimento em ISO 8601 (UTC). */
  scheduledStart: string;
  /** Fim do atendimento em ISO 8601 (UTC). */
  scheduledEnd: string;
  price: number | null;
}
