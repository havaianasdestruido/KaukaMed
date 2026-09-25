import { type Appointment, type UserProfile } from '../types';
import { requireSupabase } from '../lib/supabase';
import { appointmentFromRow, parseLongDate, type AppointmentRow } from './mappers';

/**
 * Agendamentos (tabela `appointments`).
 *
 * O filtro por usuário é feito pelo RLS: paciente só enxerga as próprias
 * consultas, médico as suas e staff (ADMIN/EMPLOYEE) todas.
 */

const APPOINTMENT_SELECT = `
  id, status, type, scheduled_start, scheduled_end, price, notes,
  doctor:doctors(id, crm, profile:profiles(full_name), specialty:specialties(name)),
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
  return (data ?? []).map(appointmentFromRow);
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
}

/** Descobre o médico pelo id ou nome (fallback: primeiro médico ativo). */
async function resolveDoctor(
  input: CreateAppointmentInput,
): Promise<{ id: string; location_id: string | null; consultation_price: number | null }> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('doctors')
    .select('id, location_id, consultation_price, profile:profiles(full_name)')
    .returns<
      {
        id: string;
        location_id: string | null;
        consultation_price: number | null;
        profile: { full_name: string } | null;
      }[]
    >();
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Nenhum profissional cadastrado no sistema para receber agendamentos.');
  }

  const wanted = input.doctorName?.toLowerCase().replace(/^dra?\.\s*/, '');
  const found =
    (input.doctorId && data.find((d) => d.id === input.doctorId)) ||
    (wanted && data.find((d) => d.profile?.full_name.toLowerCase().includes(wanted))) ||
    data[0]!;
  return found;
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
      type: 'FIRST_VISIT',
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
  return appointmentFromRow(data);
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
  return appointmentFromRow(data);
}

export async function cancelAppointment(id: string, reason?: string): Promise<void> {
  const { error } = await requireSupabase()
    .from('appointments')
    .update({
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason ?? 'Cancelado pelo portal',
    })
    .eq('id', id);

  if (error) throw error;
}
