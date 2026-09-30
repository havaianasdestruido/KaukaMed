import { canTransitionAppointmentStatus, type AppointmentStatus } from '@kaukamed/shared';

import { INITIAL_DOCTORS, MOCK_PROFILES } from '../data/mockData';
import { initialsAvatar } from '../lib/avatar';
import {
  addDays,
  clinicWallTimeToDate,
  dateKeyOf,
  patientCanChange,
  todayKey,
  weekdayOf,
  type DateKey,
} from '../lib/clinicTime';
import { DEMO_SCHEDULE, generateDaySlots, generateDaySummaries } from '../lib/slots';
import {
  type Doctor,
  type PatientInsurance,
  type PatientSummary,
  type UserProfile,
} from '../types';
import {
  type AppointmentFilters,
  type AvailableDay,
  type AvailableSlot,
  type BookInput,
  type Gateway,
} from './gateway';
import { appointmentFromRpc, type AppointmentRpcRow } from './mappers';

/**
 * Implementação em memória do {@link Gateway}, usada no modo demonstração
 * (app sem VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
 *
 * Repete as regras principais do banco (horário na grade, sem duplo
 * agendamento, máquina de estados, antecedência de 2 h do paciente) para a
 * demonstração se comportar como o sistema real — mas sem autenticação: quem
 * manda é o perfil escolhido no seletor de papéis do cabeçalho.
 */

const LOCATION_NAME = 'OdontoAura Unidade Jardins';
const LOCATION_ADDRESS = 'Av. Paulista, 1578 — São Paulo/SP';
const DEMO_PRICE = 220;

/** Pacientes de exemplo (o primeiro é o usuário do perfil "paciente"). */
const DEMO_PATIENTS: PatientSummary[] = [
  {
    id: MOCK_PROFILES.paciente!.id,
    name: MOCK_PROFILES.paciente!.name,
    cpf: '529.982.247-25',
    phone: '(11) 98888-1001',
    email: MOCK_PROFILES.paciente!.email,
    isActive: true,
    insuranceName: 'Unimed Odonto',
    insuranceCard: '0048.9123.8821-00',
    appointmentsCount: 0,
  },
  {
    id: 'demo-paciente-2',
    name: 'Jorge Mendes',
    cpf: '111.444.777-35',
    phone: '(11) 97777-2002',
    email: 'jorge.mendes@email.com',
    isActive: true,
    appointmentsCount: 0,
  },
  {
    id: 'demo-paciente-3',
    name: 'Lucas Ferraz',
    cpf: '123.456.789-09',
    phone: '(11) 96666-3003',
    email: 'lucas.ferraz@email.com',
    isActive: true,
    insuranceName: 'Amil Dental',
    insuranceCard: '7781.0042.1120-33',
    appointmentsCount: 0,
  },
];

function bookableDoctors(): Doctor[] {
  return INITIAL_DOCTORS.filter(
    (d) => d.cro.toUpperCase().startsWith('CRO') && d.status !== 'Em Férias',
  ).map((d) => ({
    ...d,
    // No banco o id do dentista é o mesmo do usuário; na demonstração, o perfil "dentista" é o Dr. Marcelo.
    id: d.name === MOCK_PROFILES.dentista!.name ? MOCK_PROFILES.dentista!.id : d.id,
    avatar: initialsAvatar(d.name),
    weekdays: [1, 2, 3, 4, 5],
    schedule: 'Seg a Sex',
    consultationPrice: DEMO_PRICE,
    locationAddress: LOCATION_ADDRESS,
    isActive: true,
  }));
}

/** Segunda a sexta mais próxima de `key` (para frente se `step` > 0, para trás se < 0). */
function nearestWeekday(key: DateKey, step: 1 | -1): DateKey {
  let day = key;
  while (weekdayOf(day) === 0 || weekdayOf(day) === 6) day = addDays(day, step);
  return day;
}

function rowFor(params: {
  id: string;
  doctor: Doctor;
  patient: PatientSummary;
  start: Date;
  status: AppointmentStatus;
  type?: AppointmentRpcRow['type'];
  notes?: string | null;
  cancelReason?: string | null;
  insurance?: { id: string; name: string; card: string } | null;
  minutes?: number;
  now: Date;
}): AppointmentRpcRow {
  const start = params.start;
  const end = new Date(start.getTime() + (params.minutes ?? 30) * 60000);
  return {
    id: params.id,
    status: params.status,
    type: params.type ?? 'FIRST_VISIT',
    scheduled_start: start.toISOString(),
    scheduled_end: end.toISOString(),
    price: DEMO_PRICE,
    notes: params.notes ?? null,
    cancel_reason: params.cancelReason ?? null,
    confirmed_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: params.now.toISOString(),
    patient_id: params.patient.id,
    patient_name: params.patient.name,
    patient_cpf: params.patient.cpf ?? null,
    patient_phone: params.patient.phone ?? null,
    doctor_id: params.doctor.id,
    doctor_name: params.doctor.name,
    doctor_crm: params.doctor.cro,
    specialty_name: params.doctor.specialties[0] ?? 'Odontologia',
    location_id: 'demo-location',
    location_name: LOCATION_NAME,
    location_address: LOCATION_ADDRESS,
    insurance_id: params.insurance?.id ?? null,
    insurance_name: params.insurance?.name ?? null,
    insurance_card: params.insurance?.card ?? null,
  };
}

/** Consultas de exemplo com datas relativas a hoje (sempre em dias úteis, na grade). */
export function buildDemoAppointments(now: Date = new Date()): AppointmentRpcRow[] {
  const doctors = bookableDoctors();
  const [marcelo, renata, helena] = [doctors[0]!, doctors[1]!, doctors[2]!];
  const [camila, jorge, lucas] = [DEMO_PATIENTS[0]!, DEMO_PATIENTS[1]!, DEMO_PATIENTS[2]!];
  const today = todayKey(now);
  const plan = { id: 'demo-ins-1', name: 'Unimed Odonto', card: '0048.9123.8821-00' };

  const future = (days: number) => nearestWeekday(addDays(today, days), 1);
  const past = (days: number) => nearestWeekday(addDays(today, -days), -1);
  const at = (dayKey: DateKey, hhmm: string) => clinicWallTimeToDate(dayKey, hhmm);

  return [
    rowFor({
      id: 'demo-apt-1',
      doctor: marcelo,
      patient: camila,
      start: at(past(21), '09:00'),
      status: 'COMPLETED',
      insurance: plan,
      notes: 'Ajuste de aparelho.',
      now,
    }),
    rowFor({
      id: 'demo-apt-2',
      doctor: helena,
      patient: camila,
      start: at(past(10), '14:30'),
      status: 'COMPLETED',
      type: 'FOLLOW_UP',
      now,
    }),
    rowFor({
      id: 'demo-apt-3',
      doctor: marcelo,
      patient: camila,
      start: at(past(4), '10:00'),
      status: 'CANCELLED',
      insurance: plan,
      cancelReason: 'Imprevisto no trabalho.',
      now,
    }),
    rowFor({
      id: 'demo-apt-4',
      doctor: marcelo,
      patient: camila,
      start: at(future(3), '09:30'),
      status: 'CONFIRMED',
      type: 'RETURN',
      insurance: plan,
      notes: 'Troca de ligaduras.',
      now,
    }),
    rowFor({
      id: 'demo-apt-5',
      doctor: renata,
      patient: camila,
      start: at(future(9), '15:00'),
      status: 'SCHEDULED',
      now,
    }),
    rowFor({
      id: 'demo-apt-6',
      doctor: marcelo,
      patient: jorge,
      start: at(future(1), '08:30'),
      status: 'SCHEDULED',
      now,
    }),
    rowFor({
      id: 'demo-apt-7',
      doctor: helena,
      patient: lucas,
      start: at(future(2), '16:00'),
      status: 'CONFIRMED',
      now,
    }),
  ];
}

export function createLocalGateway(
  getUser: () => UserProfile,
  options: { now?: () => Date } = {},
): Gateway {
  const clock = options.now ?? (() => new Date());
  const rows: AppointmentRpcRow[] = buildDemoAppointments(clock());
  const doctors = bookableDoctors();

  const isStaff = () => getUser().role === 'funcionario' || getUser().role === 'administrador';

  const visibleRows = (): AppointmentRpcRow[] => {
    const user = getUser();
    if (user.role === 'paciente') return rows.filter((r) => r.patient_id === user.id);
    if (user.role === 'dentista') return rows.filter((r) => r.doctor_id === user.id);
    return rows;
  };

  const busyRanges = (doctorId: string) =>
    rows
      .filter(
        (r) =>
          r.doctor_id === doctorId && ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(r.status),
      )
      .map((r) => ({ start: r.scheduled_start, end: r.scheduled_end }));

  const insurancesOf = async (patientId: string): Promise<PatientInsurance[]> => {
    const patient = DEMO_PATIENTS.find((p) => p.id === patientId);
    if (!patient?.insuranceName) return [];
    return [
      {
        id: patientId === MOCK_PROFILES.paciente!.id ? 'demo-ins-1' : `demo-ins-${patientId}`,
        insuranceId: `demo-health-${patient.insuranceName}`,
        insuranceName: patient.insuranceName,
        cardNumber: patient.insuranceCard ?? '',
        status: 'ACTIVE',
      },
    ];
  };

  const findRow = (id: string): AppointmentRpcRow => {
    const row = visibleRows().find((r) => r.id === id);
    if (!row) throw new Error('Consulta não encontrada.');
    return row;
  };

  const requireFutureSlot = (
    doctorId: string,
    startIso: string,
    ignoreId?: string,
  ): AvailableSlot => {
    const now = clock();
    const start = new Date(startIso);
    if (start.getTime() <= now.getTime()) throw new Error('Escolha um horário futuro.');
    const busy = rows
      .filter((r) => r.id !== ignoreId)
      .filter(
        (r) =>
          r.doctor_id === doctorId && ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(r.status),
      )
      .map((r) => ({ start: r.scheduled_start, end: r.scheduled_end }));
    const slot = generateDaySlots(dateKeyOf(start), DEMO_SCHEDULE, busy, now).find(
      (s) => s.start === start.toISOString(),
    );
    if (!slot) throw new Error('Este horário não faz parte da agenda do profissional.');
    if (!slot.available)
      throw new Error('Este horário acabou de ser reservado. Escolha outro horário.');
    return slot;
  };

  return {
    async listDoctors() {
      return doctors;
    },

    async listAppointments(filters: AppointmentFilters = {}) {
      const search = filters.search?.trim().toLowerCase();
      return visibleRows()
        .filter((r) => !filters.from || r.scheduled_start >= new Date(filters.from).toISOString())
        .filter((r) => !filters.to || r.scheduled_start < new Date(filters.to).toISOString())
        .filter((r) => !filters.statuses?.length || filters.statuses.includes(r.status))
        .filter((r) => !filters.doctorId || r.doctor_id === filters.doctorId)
        .filter((r) => !filters.patientId || r.patient_id === filters.patientId)
        .filter(
          (r) =>
            !search ||
            r.patient_name.toLowerCase().includes(search) ||
            r.doctor_name.toLowerCase().includes(search) ||
            (r.patient_cpf ?? '').includes(search),
        )
        .sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start))
        .slice(0, filters.limit ?? 300)
        .map(appointmentFromRpc);
    },

    async listAvailableDays(doctorId: string, days = 21): Promise<AvailableDay[]> {
      const now = clock();
      return generateDaySummaries(todayKey(now), days, DEMO_SCHEDULE, busyRanges(doctorId), now);
    },

    async listAvailableSlots(doctorId: string, date: DateKey): Promise<AvailableSlot[]> {
      return generateDaySlots(date, DEMO_SCHEDULE, busyRanges(doctorId), clock());
    },

    async bookAppointment(input: BookInput) {
      const user = getUser();
      if (user.role === 'dentista') throw new Error('Seu perfil não pode criar agendamentos.');
      const doctor = doctors.find((d) => d.id === input.doctorId);
      if (!doctor) throw new Error('Profissional não encontrado ou inativo.');

      let patient = DEMO_PATIENTS.find((p) => p.id === user.id);
      if (isStaff()) {
        if (!input.patientId) throw new Error('Informe o paciente da consulta.');
        patient = DEMO_PATIENTS.find((p) => p.id === input.patientId);
      } else if (input.patientId && input.patientId !== user.id) {
        throw new Error('Você só pode agendar consultas para você mesmo.');
      }
      if (!patient)
        patient = { id: user.id, name: user.name, isActive: true, appointmentsCount: 0 };

      const slot = requireFutureSlot(doctor.id, input.startsAt);
      const insurance = input.insuranceId
        ? (await insurancesOf(patient.id)).find((i) => i.id === input.insuranceId)
        : undefined;
      if (input.insuranceId && !insurance) {
        throw new Error('Convênio inválido, vencido ou não pertence ao paciente.');
      }

      const row = rowFor({
        id: crypto.randomUUID(),
        doctor,
        patient,
        start: new Date(slot.start),
        minutes: Math.round(
          (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60000,
        ),
        status: 'SCHEDULED',
        type: input.type,
        notes: input.notes?.trim() || null,
        insurance: insurance
          ? { id: insurance.id, name: insurance.insuranceName, card: insurance.cardNumber }
          : null,
        now: clock(),
      });
      rows.push(row);
      return row.id;
    },

    async rescheduleAppointment(id, newStartIso) {
      const row = findRow(id);
      const user = getUser();
      if (user.role === 'dentista') throw new Error('Consulta não encontrada.');
      if (!['SCHEDULED', 'CONFIRMED'].includes(row.status)) {
        throw new Error('Só é possível remarcar consultas agendadas ou confirmadas.');
      }
      if (user.role === 'paciente' && !patientCanChange(row.scheduled_start, clock())) {
        throw new Error(
          'A remarcação pelo portal exige pelo menos 2 hora(s) de antecedência. Fale com a clínica.',
        );
      }
      if (newStartIso === new Date(row.scheduled_start).toISOString()) {
        throw new Error('Escolha um horário diferente do atual.');
      }
      const slot = requireFutureSlot(row.doctor_id, newStartIso, row.id);
      row.scheduled_start = slot.start;
      row.scheduled_end = slot.end;
      row.status = 'SCHEDULED';
      row.confirmed_at = null;
    },

    async setAppointmentStatus(id, status, reason) {
      const row = findRow(id);
      const user = getUser();
      if (!canTransitionAppointmentStatus(row.status, status)) {
        throw new Error(`Transição inválida: ${row.status} → ${status}.`);
      }
      if (status === 'CANCELLED' && user.role === 'paciente') {
        if (!patientCanChange(row.scheduled_start, clock())) {
          throw new Error(
            'O cancelamento pelo portal exige pelo menos 2 hora(s) de antecedência. Fale com a clínica.',
          );
        }
      } else if (status === 'CANCELLED' && isStaff() && !reason?.trim()) {
        throw new Error('Informe o motivo do cancelamento.');
      }
      row.status = status;
      if (status === 'CONFIRMED') row.confirmed_at = clock().toISOString();
      if (status === 'COMPLETED') row.completed_at = clock().toISOString();
      if (status === 'CANCELLED') {
        row.cancelled_at = clock().toISOString();
        row.cancel_reason = reason?.trim() || null;
      }
    },

    async listPatients(search) {
      const term = search?.trim().toLowerCase();
      return DEMO_PATIENTS.filter(
        (p) => !term || p.name.toLowerCase().includes(term) || (p.cpf ?? '').includes(term),
      ).map((p) => {
        const own = rows.filter((r) => r.patient_id === p.id);
        const next = own
          .filter((r) => ['SCHEDULED', 'CONFIRMED'].includes(r.status))
          .map((r) => r.scheduled_start)
          .sort()[0];
        return { ...p, appointmentsCount: own.length, nextVisit: next };
      });
    },

    async listPatientInsurances(patientId) {
      return insurancesOf(patientId ?? getUser().id);
    },
  };
}
