/**
 * Regras de agendamento no front-end.
 *
 * ATENÇÃO: quem decide é o banco (`set_appointment_status`, `reschedule_appointment`
 * e `book_appointment` em db/migrations/002). Estas funções só espelham as regras
 * para a interface mostrar apenas os botões que vão funcionar. Se uma regra mudar
 * no SQL, mude aqui e em `appointmentRules.test.ts`.
 */
import {
  type AppointmentStatus,
  type UserRole as DbUserRole,
  APPOINTMENT_STATUS_LABELS,
} from '@kaukamed/shared';

import { patientCanChange } from './clinicTime';

/** Ações que a interface pode oferecer sobre uma consulta. */
export type AppointmentAction =
  'confirm' | 'start' | 'complete' | 'cancel' | 'no_show' | 'reschedule';

/** Status que ocupam o horário do dentista. */
export const ACTIVE_STATUSES: readonly AppointmentStatus[] = [
  'SCHEDULED',
  'CONFIRMED',
  'IN_PROGRESS',
];

export interface RuleActor {
  userId: string;
  role: DbUserRole;
}

export interface RuleAppointment {
  status: AppointmentStatus;
  startsAt: string;
  patientId?: string;
  doctorId?: string;
}

/** Status de banco que cada ação produz (para `set_appointment_status`). */
export const ACTION_TARGET_STATUS: Record<
  Exclude<AppointmentAction, 'reschedule'>,
  AppointmentStatus
> = {
  confirm: 'CONFIRMED',
  start: 'IN_PROGRESS',
  complete: 'COMPLETED',
  cancel: 'CANCELLED',
  no_show: 'NO_SHOW',
};

/** Ações permitidas ao usuário sobre a consulta, na ordem em que aparecem na tela. */
export function allowedActions(
  actor: RuleActor,
  apt: RuleAppointment,
  now: Date = new Date(),
): AppointmentAction[] {
  const isPatient = actor.role === 'PATIENT' && apt.patientId === actor.userId;
  const isDoctor = actor.role === 'DOCTOR' && apt.doctorId === actor.userId;
  const isAdmin = actor.role === 'ADMIN';
  const isFrontDesk = actor.role === 'EMPLOYEE' || isAdmin;
  if (!isPatient && !isDoctor && !isFrontDesk) return [];

  // O paciente só mexe na própria consulta com a antecedência mínima; a recepção não tem limite.
  const canChange = isFrontDesk || (isPatient && patientCanChange(apt.startsAt, now));
  const actions: AppointmentAction[] = [];

  switch (apt.status) {
    case 'SCHEDULED':
      if (isPatient || isFrontDesk) actions.push('confirm');
      if (canChange) actions.push('reschedule', 'cancel');
      if (isFrontDesk) actions.push('no_show');
      break;
    case 'CONFIRMED':
      if (isDoctor || isAdmin) actions.push('start');
      if (canChange) actions.push('reschedule', 'cancel');
      if (isFrontDesk) actions.push('no_show');
      break;
    case 'IN_PROGRESS':
      if (isDoctor || isAdmin) actions.push('complete');
      if (isFrontDesk) actions.push('cancel');
      break;
    default:
      break; // COMPLETED, CANCELLED e NO_SHOW são estados finais
  }
  return actions;
}

/** A recepção precisa informar o motivo ao cancelar; o paciente, não. */
export function cancelRequiresReason(role: DbUserRole): boolean {
  return role === 'EMPLOYEE' || role === 'ADMIN';
}

/** Onde a consulta aparece na tela "Minhas Consultas". */
export type AppointmentBucket = 'upcoming' | 'history' | 'cancelled';

export function bucketOf(status: AppointmentStatus): AppointmentBucket {
  if (status === 'CANCELLED') return 'cancelled';
  if (status === 'COMPLETED' || status === 'NO_SHOW') return 'history';
  return 'upcoming';
}

/** Próxima consulta ativa e ainda no futuro (ou em andamento agora). */
export function nextAppointment<
  T extends { status: AppointmentStatus; startsAt?: string; endsAt?: string },
>(list: readonly T[], now: Date = new Date()): T | undefined {
  const time = (iso?: string) => (iso ? new Date(iso).getTime() : Number.POSITIVE_INFINITY);
  return list
    .filter((a) => ACTIVE_STATUSES.includes(a.status))
    .filter((a) => !a.endsAt || time(a.endsAt) > now.getTime())
    .sort((a, b) => time(a.startsAt) - time(b.startsAt))[0];
}

/** Cores do selo de status (classes Tailwind já usadas pelo restante do app). */
export function statusBadge(status: AppointmentStatus): { label: string; className: string } {
  const label = APPOINTMENT_STATUS_LABELS[status];
  switch (status) {
    case 'SCHEDULED':
      return { label, className: 'bg-[#fff0c2] text-[#6b5200]' };
    case 'CONFIRMED':
      return { label, className: 'bg-[#cce8e7] text-[#051f20]' };
    case 'IN_PROGRESS':
      return { label, className: 'bg-[#d2e4ff] text-[#1e3a5f]' };
    case 'COMPLETED':
      return { label, className: 'bg-[#B2F1B8] text-[#002107]' };
    case 'CANCELLED':
      return { label, className: 'bg-[#ffdad6] text-[#93000a]' };
    case 'NO_SHOW':
      return { label, className: 'bg-[#e2e2e2] text-[#3a3a3a]' };
  }
}
