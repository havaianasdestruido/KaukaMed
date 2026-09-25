import { type AppointmentStatus, type UserRole as DbUserRole } from '@kaukamed/shared';

import { ASSETS } from '../data/mockData';
import { type Appointment, type Doctor, type UserProfile, type UserRole } from '../types';

/**
 * Conversões entre o formato do banco (db/kaukamed_schema.sql, enums em
 * inglês e maiúsculas) e o formato usado pelas telas do protótipo
 * (src/types, em pt-BR).
 */

// ---------------------------------------------------------------------------
// Papéis
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

// ---------------------------------------------------------------------------
// Status de agendamento
// ---------------------------------------------------------------------------

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
// Datas (as telas usam "Quinta-feira, 24 de Outubro de 2024" + "14:30")
// ---------------------------------------------------------------------------

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** ISO → "Quinta-feira, 24 de Outubro de 2024" (horário local). */
export function formatLongDate(iso: string): string {
  const d = new Date(iso);
  const weekday = capitalize(d.toLocaleDateString('pt-BR', { weekday: 'long' }));
  const month = capitalize(MONTHS_PT[d.getMonth()] ?? '');
  return `${weekday}, ${d.getDate()} de ${month} de ${d.getFullYear()}`;
}

/** ISO → "14:30" (horário local). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * "Quinta-feira, 24 de Outubro de 2024" + "14:30" → Date local.
 * Também aceita datas ISO (`2024-10-24`). Retorna `null` se não reconhecer.
 */
export function parseLongDate(dateText: string, time: string): Date | null {
  const [hh, mm] = time.split(':').map((n) => Number(n));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateText);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), hh, mm);
  }

  const match = /(\d{1,2})\s+de\s+([a-zà-ú]+)\s+de\s+(\d{4})/i.exec(dateText);
  if (!match) return null;
  const month = MONTHS_PT.indexOf(match[2]!.toLowerCase());
  if (month < 0) return null;
  return new Date(Number(match[3]), month, Number(match[1]), hh, mm);
}

// ---------------------------------------------------------------------------
// Linhas do banco (apenas as colunas selecionadas pelos services)
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  role: DbUserRole;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
}

export interface PatientInsuranceRow {
  card_number: string;
  status: string;
  insurance: { name: string } | null;
}

export interface DoctorRow {
  id: string;
  crm: string;
  bio: string | null;
  consultation_price: number | string | null;
  profile: { full_name: string; is_active: boolean } | null;
  specialty: { name: string } | null;
  location: { name: string } | null;
}

export interface AppointmentRow {
  id: string;
  status: AppointmentStatus;
  type: string;
  scheduled_start: string;
  scheduled_end: string;
  price: number | string | null;
  notes: string | null;
  doctor: {
    id: string;
    crm: string;
    profile: { full_name: string } | null;
    specialty: { name: string } | null;
  } | null;
  location: { name: string; address: string | null } | null;
  insurance: { card_number: string; insurance: { name: string } | null } | null;
}

// ---------------------------------------------------------------------------
// Row → modelo das telas
// ---------------------------------------------------------------------------

export function profileFromRow(
  row: ProfileRow,
  extras: { insurance?: PatientInsuranceRow | null; doctor?: DoctorRow | null } = {},
): UserProfile {
  const role = roleFromDb(row.role);
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? '',
    role,
    avatar: role === 'paciente' ? ASSETS.drMariana : ASSETS.camilaFerraz,
    specialty: extras.doctor?.specialty?.name,
    cro: extras.doctor?.crm,
    planName: extras.insurance?.insurance?.name,
    planNumber: extras.insurance?.card_number,
  };
}

export function appointmentFromRow(row: AppointmentRow): Appointment {
  const start = new Date(row.scheduled_start).getTime();
  const end = new Date(row.scheduled_end).getTime();
  const price = row.price === null ? 0 : Number(row.price);
  const insuranceName = row.insurance?.insurance?.name;

  return {
    id: row.id,
    date: formatLongDate(row.scheduled_start),
    time: formatTime(row.scheduled_start),
    doctorName: row.doctor?.profile?.full_name ?? 'Profissional',
    doctorSpecialty: row.doctor?.specialty?.name ?? '',
    doctorCro: row.doctor?.crm ?? '',
    doctorAvatar: ASSETS.drMarcelo,
    room: row.location?.name ?? 'A definir',
    unit: row.location?.name ?? 'OdontoAura',
    procedure: row.notes?.split('\n')[0] || 'Consulta odontológica',
    status: statusFromDb(row.status),
    insuranceName: insuranceName ?? 'Particular',
    insuranceCoverage: insuranceName ? 'Coberto pelo convênio' : 'Particular',
    copayAmount: insuranceName ? 0 : price,
    notes: row.notes ?? undefined,
    durationMinutes: Math.max(15, Math.round((end - start) / 60000)),
  };
}

export function doctorFromRow(row: DoctorRow): Doctor {
  return {
    id: row.id,
    name: row.profile?.full_name ?? 'Profissional',
    cro: row.crm,
    specialties: row.specialty ? [row.specialty.name] : [],
    contractType: 'Corpo clínico',
    schedule: 'Conforme agenda',
    room: row.location?.name ?? 'A definir',
    appointmentsCount: 0,
    commissionPercentage: 0,
    monthlyRevenue: 0,
    npsScore: 0,
    npsPercentage: 0,
    status: row.profile?.is_active === false ? 'Em Férias' : 'Ativo',
    avatar: ASSETS.drMarcelo,
    isCertified: true,
  };
}
