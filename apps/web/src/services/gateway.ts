import { type AppointmentStatus, type AppointmentType } from '@kaukamed/shared';

import { type DateKey } from '../lib/clinicTime';
import { type DaySummary, type Slot } from '../lib/slots';
import {
  type Appointment,
  type Doctor,
  type PatientInsurance,
  type PatientSummary,
} from '../types';

/**
 * Contrato de acesso a dados da agenda.
 *
 * Existem duas implementações, escolhidas em `AppContext` conforme a
 * configuração do ambiente:
 *  - `remoteGateway` — Supabase: chama as funções SQL de db/migrations/002
 *    (as regras de negócio e as permissões ficam no banco);
 *  - `createLocalGateway` — modo demonstração, em memória (sem Supabase).
 *
 * As telas só conhecem esta interface.
 */

export type AvailableDay = DaySummary;
export type AvailableSlot = Slot;

export interface AppointmentFilters {
  /** Início da janela (ISO). Inclusivo. */
  from?: string;
  /** Fim da janela (ISO). Exclusivo. */
  to?: string;
  statuses?: AppointmentStatus[];
  doctorId?: string;
  patientId?: string;
  /** Nome do paciente/dentista ou CPF. */
  search?: string;
  limit?: number;
}

export interface BookInput {
  doctorId: string;
  /** Início do horário escolhido (ISO UTC, exatamente como veio da grade). */
  startsAt: string;
  type?: AppointmentType;
  /** `null`/ausente = particular. */
  insuranceId?: string | null;
  notes?: string;
  /** Só a recepção informa: paciente para quem se agenda. */
  patientId?: string;
}

export interface Gateway {
  listDoctors(): Promise<Doctor[]>;
  listAppointments(filters?: AppointmentFilters): Promise<Appointment[]>;
  listAvailableDays(doctorId: string, days?: number): Promise<AvailableDay[]>;
  listAvailableSlots(doctorId: string, date: DateKey): Promise<AvailableSlot[]>;
  /** Devolve o id da consulta criada. */
  bookAppointment(input: BookInput): Promise<string>;
  rescheduleAppointment(id: string, newStartIso: string): Promise<void>;
  setAppointmentStatus(id: string, status: AppointmentStatus, reason?: string): Promise<void>;
  listPatients(search?: string): Promise<PatientSummary[]>;
  /** Convênios do paciente logado (ou, para a recepção, do paciente informado). */
  listPatientInsurances(patientId?: string): Promise<PatientInsurance[]>;
}
