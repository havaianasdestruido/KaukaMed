import {
  APPOINTMENT_TYPE_LABELS,
  type AppointmentStatus,
  type AppointmentType,
  type UserRole as DbUserRole,
} from '@kaukamed/shared';

import { initialsAvatar } from '../lib/avatar';
import { formatLongDate, formatTime } from '../lib/clinicTime';
import { describeWeekdays } from '../lib/format';
import {
  type Appointment,
  type Doctor,
  type PatientInsurance,
  type PatientSummary,
  type UserProfile,
  type UserRole,
} from '../types';

/**
 * Conversões entre o formato do banco (db/kaukamed_schema.sql + funções da
 * migration 002: colunas em snake_case, enums em inglês e maiúsculas) e o
 * formato usado pelas telas (src/types, em pt-BR).
 *
 * Só há linhas PLANAS aqui: as funções do banco já devolvem tudo junto, então o
 * front-end não usa "embeds" do PostgREST (que dependem de relacionamentos).
 */

// ---------------------------------------------------------------------------
// Papéis e status
// ---------------------------------------------------------------------------

const ROLE_DB_TO_UI: Record<DbUserRole, UserRole> = {
  PATIENT: 'paciente',
  EMPLOYEE: 'funcionario',
  DOCTOR: 'dentista',
  ADMIN: 'administrador',
};

export function roleFromDb(role: DbUserRole | null | undefined): UserRole {
  return (role && ROLE_DB_TO_UI[role]) || 'paciente';
}

const ROLE_UI_TO_DB: Record<UserRole, DbUserRole> = {
  paciente: 'PATIENT',
  funcionario: 'EMPLOYEE',
  dentista: 'DOCTOR',
  administrador: 'ADMIN',
};

export function roleToDb(role: UserRole): DbUserRole {
  return ROLE_UI_TO_DB[role];
}

/** Status simplificado usado pelos cartões das telas do protótipo. */
const STATUS_DB_TO_UI: Record<AppointmentStatus, Appointment['status']> = {
  SCHEDULED: 'agendado',
  CONFIRMED: 'confirmado',
  IN_PROGRESS: 'confirmado',
  COMPLETED: 'finalizado',
  CANCELLED: 'cancelado',
  NO_SHOW: 'cancelado',
};

export function statusFromDb(status: AppointmentStatus): Appointment['status'] {
  return STATUS_DB_TO_UI[status] ?? 'agendado';
}

// ---------------------------------------------------------------------------
// Linhas do banco
// ---------------------------------------------------------------------------

/** `public.profiles` (colunas lidas no login). */
export interface ProfileRow {
  id: string;
  role: DbUserRole;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
}

/** Retorno de `public.list_doctors()`. */
export interface DoctorRpcRow {
  id: string;
  full_name: string;
  crm: string;
  bio: string | null;
  consultation_price: number | string | null;
  specialty_id: string;
  specialty_name: string;
  specialty_ids: string[] | null;
  specialties: string[] | null;
  location_id: string | null;
  location_name: string | null;
  location_address: string | null;
  is_active: boolean;
  weekdays: number[] | null;
}

/** Retorno de `public.list_appointments(...)`. */
export interface AppointmentRpcRow {
  id: string;
  status: AppointmentStatus;
  type: AppointmentType;
  scheduled_start: string;
  scheduled_end: string;
  price: number | string | null;
  notes: string | null;
  cancel_reason: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  patient_id: string;
  patient_name: string;
  patient_cpf: string | null;
  patient_phone: string | null;
  doctor_id: string;
  doctor_name: string;
  doctor_crm: string;
  specialty_name: string;
  location_id: string | null;
  location_name: string | null;
  location_address: string | null;
  insurance_id: string | null;
  insurance_name: string | null;
  insurance_card: string | null;
}

/** Retorno de `public.list_patients(...)`. */
export interface PatientRpcRow {
  id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  insurance_name: string | null;
  insurance_card: string | null;
  appointments_count: number;
  last_visit: string | null;
  next_visit: string | null;
}

/** Retorno de `public.list_patient_insurances(...)`. */
export interface PatientInsuranceRpcRow {
  id: string;
  patient_id: string;
  insurance_id: string;
  insurance_name: string;
  card_number: string;
  status: PatientInsurance['status'];
  valid_until: string | null;
}

// ---------------------------------------------------------------------------
// Linha → modelo das telas
// ---------------------------------------------------------------------------

const toNumber = (value: number | string | null | undefined): number | undefined =>
  value === null || value === undefined || value === '' ? undefined : Number(value);

export function profileFromRow(
  row: ProfileRow,
  extras: { insurance?: PatientInsuranceRpcRow | null; doctor?: DoctorRpcRow | null } = {},
): UserProfile {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? '',
    role: roleFromDb(row.role),
    avatar: initialsAvatar(row.full_name),
    specialty: extras.doctor?.specialty_name,
    cro: extras.doctor?.crm,
    planName: extras.insurance?.insurance_name,
    planNumber: extras.insurance?.card_number,
    phone: row.phone ?? undefined,
    cpf: row.cpf ?? undefined,
  };
}

export function appointmentFromRpc(row: AppointmentRpcRow): Appointment {
  const durationMinutes = Math.max(
    5,
    Math.round(
      (new Date(row.scheduled_end).getTime() - new Date(row.scheduled_start).getTime()) / 60000,
    ),
  );
  const price = toNumber(row.price) ?? 0;
  const hasInsurance = Boolean(row.insurance_name);
  const typeLabel = APPOINTMENT_TYPE_LABELS[row.type] ?? 'Consulta odontológica';

  return {
    id: row.id,
    date: formatLongDate(row.scheduled_start),
    time: formatTime(row.scheduled_start),
    doctorName: row.doctor_name,
    doctorSpecialty: row.specialty_name,
    doctorCro: row.doctor_crm,
    doctorAvatar: initialsAvatar(row.doctor_name),
    room: row.location_name ?? 'A definir',
    unit: row.location_name ?? 'OdontoAura',
    procedure: typeLabel,
    status: statusFromDb(row.status),
    insuranceName: row.insurance_name ?? 'Particular',
    insuranceCoverage: hasInsurance ? 'cobertura a confirmar na clínica' : 'pagamento na clínica',
    copayAmount: hasInsurance ? 0 : price,
    notes: row.notes ?? undefined,
    durationMinutes,
    modality: row.type === 'TELEMEDICINE' ? 'teleorientacao' : 'presencial',

    startsAt: row.scheduled_start,
    endsAt: row.scheduled_end,
    dbStatus: row.status,
    type: row.type,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientCpf: row.patient_cpf ?? undefined,
    patientPhone: row.patient_phone ?? undefined,
    insuranceId: row.insurance_id ?? undefined,
    price,
    cancelReason: row.cancel_reason ?? undefined,
  };
}

export function doctorFromRpc(row: DoctorRpcRow): Doctor {
  const weekdays = row.weekdays ?? [];
  const specialties =
    row.specialties && row.specialties.length > 0 ? row.specialties : [row.specialty_name];

  return {
    id: row.id,
    name: row.full_name,
    cro: row.crm,
    specialties,
    contractType: 'Corpo clínico',
    schedule: describeWeekdays(weekdays),
    room: row.location_name ?? 'A definir',
    appointmentsCount: 0,
    commissionPercentage: 0,
    monthlyRevenue: 0,
    npsScore: 0,
    npsPercentage: 0,
    status: row.is_active ? 'Ativo' : 'Inativo',
    avatar: initialsAvatar(row.full_name),
    isCertified: true,

    locationId: row.location_id ?? undefined,
    locationAddress: row.location_address ?? undefined,
    weekdays,
    consultationPrice: toNumber(row.consultation_price),
    bio: row.bio ?? undefined,
    isActive: row.is_active,
  };
}

export function patientFromRpc(row: PatientRpcRow): PatientSummary {
  return {
    id: row.id,
    name: row.full_name,
    cpf: row.cpf ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    isActive: row.is_active,
    insuranceName: row.insurance_name ?? undefined,
    insuranceCard: row.insurance_card ?? undefined,
    appointmentsCount: row.appointments_count,
    lastVisit: row.last_visit ?? undefined,
    nextVisit: row.next_visit ?? undefined,
  };
}

export function insuranceFromRpc(row: PatientInsuranceRpcRow): PatientInsurance {
  return {
    id: row.id,
    insuranceId: row.insurance_id,
    insuranceName: row.insurance_name,
    cardNumber: row.card_number,
    status: row.status,
    validUntil: row.valid_until ?? undefined,
  };
}
