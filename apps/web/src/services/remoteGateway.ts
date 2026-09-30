import { type DateKey } from '../lib/clinicTime';
import {
  type AppointmentFilters,
  type AvailableDay,
  type AvailableSlot,
  type BookInput,
  type Gateway,
} from './gateway';
import {
  appointmentFromRpc,
  doctorFromRpc,
  insuranceFromRpc,
  patientFromRpc,
  type AppointmentRpcRow,
  type DoctorRpcRow,
  type PatientInsuranceRpcRow,
  type PatientRpcRow,
} from './mappers';
import { callRpc } from './rpc';

/**
 * Implementação com Supabase: cada método é uma chamada às funções SQL de
 * db/migrations/002_agendamento_v1.sql. Os nomes dos parâmetros (`p_*`) precisam
 * bater com o SQL — `remoteGateway.test.ts` confere isso lendo o próprio arquivo.
 */

interface DayRow {
  day: string;
  total_slots: number;
  free_slots: number;
}

interface SlotRow {
  slot_start: string;
  slot_end: string;
  available: boolean;
}

export const remoteGateway: Gateway = {
  async listDoctors() {
    const rows = await callRpc<DoctorRpcRow[] | null>('list_doctors');
    return (rows ?? []).map(doctorFromRpc);
  },

  async listAppointments(filters: AppointmentFilters = {}) {
    const rows = await callRpc<AppointmentRpcRow[] | null>('list_appointments', {
      p_from: filters.from ?? null,
      p_to: filters.to ?? null,
      p_statuses: filters.statuses && filters.statuses.length > 0 ? filters.statuses : null,
      p_doctor_id: filters.doctorId ?? null,
      p_patient_id: filters.patientId ?? null,
      p_search: filters.search?.trim() || null,
      p_limit: filters.limit ?? 300,
    });
    return (rows ?? []).map(appointmentFromRpc);
  },

  async listAvailableDays(doctorId: string, days = 21): Promise<AvailableDay[]> {
    const rows = await callRpc<DayRow[] | null>('get_available_days', {
      p_doctor_id: doctorId,
      p_days: days,
    });
    return (rows ?? []).map((row) => ({
      date: row.day,
      totalSlots: row.total_slots,
      freeSlots: row.free_slots,
    }));
  },

  async listAvailableSlots(doctorId: string, date: DateKey): Promise<AvailableSlot[]> {
    const rows = await callRpc<SlotRow[] | null>('get_available_slots', {
      p_doctor_id: doctorId,
      p_date: date,
    });
    return (rows ?? []).map((row) => ({
      start: row.slot_start,
      end: row.slot_end,
      available: row.available,
    }));
  },

  async bookAppointment(input: BookInput) {
    return callRpc<string>('book_appointment', {
      p_doctor_id: input.doctorId,
      p_start: input.startsAt,
      p_type: input.type ?? 'FIRST_VISIT',
      p_insurance_id: input.insuranceId ?? null,
      p_notes: input.notes?.trim() || null,
      p_patient_id: input.patientId ?? null,
    });
  },

  async rescheduleAppointment(id, newStartIso) {
    await callRpc('reschedule_appointment', { p_id: id, p_new_start: newStartIso });
  },

  async setAppointmentStatus(id, status, reason) {
    await callRpc('set_appointment_status', {
      p_id: id,
      p_status: status,
      p_reason: reason?.trim() || null,
    });
  },

  async listPatients(search) {
    const rows = await callRpc<PatientRpcRow[] | null>('list_patients', {
      p_search: search?.trim() || null,
    });
    return (rows ?? []).map(patientFromRpc);
  },

  async listPatientInsurances(patientId) {
    const rows = await callRpc<PatientInsuranceRpcRow[] | null>('list_patient_insurances', {
      p_patient_id: patientId ?? null,
    });
    return (rows ?? []).map(insuranceFromRpc);
  },
};
