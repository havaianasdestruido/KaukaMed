import { type Appointment, type UserProfile } from '../types';
import { requireSupabase } from '../lib/supabase';
import { appointmentFromRow, parseLongDate, type AppointmentRow } from './mappers';
import { getDoctorPublicProfiles } from './doctorPublicProfiles';

/**
 * Agendamentos (tabela `appointments`).
 *
 * O filtro por usuário é feito pelo RLS: paciente só enxerga as próprias
 * consultas, médico as suas e staff (ADMIN/EMPLOYEE) todas.
 */

const APPOINTMENT_SELECT = `
  id, status, type, scheduled_start, scheduled_end, price, notes,
  doctor:doctors(id, crm, specialty:specialties(name)),
  location:locations(name, address),
  insurance:patient_insurances(card_number, insurance:health_insurances(name))
`;

const DEFAULT_DURATION_MINUTES = 45;

export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await requireSupabase()
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .order('scheduled_start', { ascending: true })
    .returns<AppointmentRow[]>();

  if (error) throw error;
  const profiles = await getDoctorPublicProfiles();
  return (data ?? []).map((row) =>
    appointmentFromRow({
      ...row,
      doctor: row.doctor ? { ...row.doctor, profile: profiles.get(row.doctor.id) ?? null } : null,
    }),
  );
}

export interface CreateAppointmentInput {
  patient: UserProfile;
  /** Id do médico escolhido; se ausente, usa o médico cujo nome bate com `doctorName`. */
  doctorId?: string;
  doctorName?: string;
  date: string;
  time: string;
  procedure?: string;
  notes?: string;
  durationMinutes?: number;
  modality?: Appointment['modality'];
}

/** Descobre o médico pelo id ou nome; só usa o primeiro quando não há escolha. */
async function resolveDoctor(input: CreateAppointmentInput): Promise<{
  id: string;
  location_id: string | null;
  consultation_price: number | null;
  full_name: string;
}> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('doctors')
    .select('id, location_id, consultation_price')
    .returns<
      {
        id: string;
        location_id: string | null;
        consultation_price: number | null;
      }[]
    >();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Nenhum profissional cadastrado no sistema para receber agendamentos.');
  }

  const profiles = await getDoctorPublicProfiles();
  const wanted = input.doctorName?.toLowerCase().replace(/^dra?\.\s*/, '');
  const found =
    (input.doctorId && data.find((d) => d.id === input.doctorId)) ||
    (wanted && data.find((d) => profiles.get(d.id)?.full_name.toLowerCase().includes(wanted))) ||
    (!input.doctorId && !input.doctorName ? data[0] : undefined);
  if (!found) throw new Error('O profissional selecionado não foi encontrado.');
  return { ...found, full_name: profiles.get(found.id)?.full_name ?? 'Profissional' };
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const sb = requireSupabase();

  const start = parseLongDate(input.date, input.time);
  if (!start) throw new Error(`Data/horário inválidos: ${input.date} ${input.time}`);
  const end = new Date(
    start.getTime() + (input.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60000,
  );

  const doctor = await resolveDoctor(input);

  // Convênio ativo do paciente (se houver) — null = particular.
  const { data: insurance } = await sb
    .from('patient_insurances')
    .select('id')
    .eq('patient_id', input.patient.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle<{ id: string }>();

  const notes = [input.procedure, input.notes].filter(Boolean).join('\n') || null;

  const { data, error } = await sb
    .from('appointments')
    .insert({
      patient_id: input.patient.id,
      doctor_id: doctor.id,
      location_id: doctor.location_id,
      insurance_id: insurance?.id ?? null,
      type: input.modality === 'teleorientacao' ? 'TELEMEDICINE' : 'FIRST_VISIT',
      status: 'SCHEDULED',
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      price: doctor.consultation_price,
      notes,
      created_by: input.patient.id,
    })
    .select(APPOINTMENT_SELECT)
    .single<AppointmentRow>();

  if (error) throw error;
  return appointmentFromRow({
    ...data,
    doctor: data.doctor ? { ...data.doctor, profile: { full_name: doctor.full_name } } : null,
  });
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  time: string,
  durationMinutes = DEFAULT_DURATION_MINUTES,
): Promise<Appointment> {
  const start = parseLongDate(date, time);
  if (!start) throw new Error(`Data/horário inválidos: ${date} ${time}`);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const { data, error } = await requireSupabase()
    .from('appointments')
    .update({
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      status: 'SCHEDULED',
    })
    .eq('id', id)
    .select(APPOINTMENT_SELECT)
    .single<AppointmentRow>();

  if (error) throw error;
  const profiles = await getDoctorPublicProfiles();
  return appointmentFromRow({
    ...data,
    doctor: data.doctor ? { ...data.doctor, profile: profiles.get(data.doctor.id) ?? null } : null,
  });
}

export async function cancelAppointment(id: string, reason?: string): Promise<void> {
  const { data, error } = await requireSupabase()
    .from('appointments')
    .update({
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason ?? 'Cancelado pelo portal',
    })
    .eq('id', id)
    .select('id')
    .maybeSingle<{ id: string }>();

  if (error) throw error;
  if (!data) throw new Error('A consulta não foi encontrada ou não pôde ser cancelada.');
}
