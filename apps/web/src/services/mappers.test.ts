import { describe, expect, it } from 'vitest';

import {
  appointmentFromRpc,
  doctorFromRpc,
  insuranceFromRpc,
  patientFromRpc,
  profileFromRow,
  roleFromDb,
  roleToDb,
  statusFromDb,
  type AppointmentRpcRow,
} from './mappers';

const ROW: AppointmentRpcRow = {
  id: '0b9f2c3e-0000-4000-8000-000000000001',
  status: 'CONFIRMED',
  type: 'RETURN',
  scheduled_start: '2026-10-01T12:30:00+00:00', // 09:30 em São Paulo
  scheduled_end: '2026-10-01T13:00:00+00:00',
  price: '180.00',
  notes: 'Troca de ligaduras.',
  cancel_reason: null,
  confirmed_at: null,
  completed_at: null,
  cancelled_at: null,
  created_at: '2026-09-20T10:00:00+00:00',
  patient_id: 'pat-1',
  patient_name: 'Camila Santos',
  patient_cpf: '529.982.247-25',
  patient_phone: '(11) 98888-1001',
  doctor_id: 'doc-1',
  doctor_name: 'Dr. Marcelo Arantes',
  doctor_crm: 'CRO/SP 89412',
  specialty_name: 'Ortodontia',
  location_id: 'loc-1',
  location_name: 'OdontoAura Unidade Jardins',
  location_address: 'Av. Paulista, 1578 — São Paulo/SP',
  insurance_id: 'ins-1',
  insurance_name: 'Unimed Odonto',
  insurance_card: '0048.9123.8821-00',
};

describe('mappers', () => {
  it('converte papéis e status entre banco e telas', () => {
    expect(roleFromDb('PATIENT')).toBe('paciente');
    expect(roleFromDb('EMPLOYEE')).toBe('funcionario');
    expect(roleFromDb('DOCTOR')).toBe('dentista');
    expect(roleFromDb('ADMIN')).toBe('administrador');
    expect(roleFromDb(null)).toBe('paciente');
    expect(roleToDb('dentista')).toBe('DOCTOR');
    expect(statusFromDb('NO_SHOW')).toBe('cancelado');
    expect(statusFromDb('IN_PROGRESS')).toBe('confirmado');
    expect(statusFromDb('COMPLETED')).toBe('finalizado');
  });

  it('monta a consulta com data e hora no fuso da clínica', () => {
    const apt = appointmentFromRpc(ROW);
    expect(apt).toMatchObject({
      id: ROW.id,
      date: 'Quinta-feira, 1 de Outubro de 2026',
      time: '09:30',
      doctorName: 'Dr. Marcelo Arantes',
      doctorSpecialty: 'Ortodontia',
      procedure: 'Reavaliação',
      status: 'confirmado',
      dbStatus: 'CONFIRMED',
      durationMinutes: 30,
      insuranceName: 'Unimed Odonto',
      copayAmount: 0,
      modality: 'presencial',
      price: 180,
      patientName: 'Camila Santos',
      doctorId: 'doc-1',
      patientId: 'pat-1',
      startsAt: ROW.scheduled_start,
    });
  });

  it('consulta particular mostra o valor e teleconsulta vira teleorientação', () => {
    const apt = appointmentFromRpc({
      ...ROW,
      insurance_id: null,
      insurance_name: null,
      insurance_card: null,
      type: 'TELEMEDICINE',
      price: null,
    });
    expect(apt.insuranceName).toBe('Particular');
    expect(apt.insuranceCoverage).toBe('pagamento na clínica');
    expect(apt.copayAmount).toBe(0);
    expect(apt.modality).toBe('teleorientacao');
    expect(apt.price).toBe(0);

    const priced = appointmentFromRpc({ ...ROW, insurance_name: null, insurance_id: null });
    expect(priced.copayAmount).toBe(180);
  });

  it('monta o perfil do usuário', () => {
    const profile = profileFromRow(
      {
        id: 'u1',
        role: 'DOCTOR',
        full_name: 'Dr. Marcelo Arantes',
        email: 'dentista@example.com',
        phone: null,
        cpf: null,
      },
      {
        doctor: {
          id: 'u1',
          full_name: 'Dr. Marcelo Arantes',
          crm: 'CRO/SP 89412',
          bio: null,
          consultation_price: 180,
          specialty_id: 's',
          specialty_name: 'Ortodontia',
          specialty_ids: [],
          specialties: [],
          location_id: null,
          location_name: null,
          location_address: null,
          is_active: true,
          weekdays: [],
        },
      },
    );
    expect(profile).toMatchObject({
      id: 'u1',
      role: 'dentista',
      name: 'Dr. Marcelo Arantes',
      specialty: 'Ortodontia',
      cro: 'CRO/SP 89412',
    });
    expect(profile.avatar.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('monta pacientes e convênios', () => {
    expect(
      patientFromRpc({
        id: 'p1',
        full_name: 'Camila Santos',
        cpf: null,
        phone: null,
        email: 'camila@example.com',
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
        insurance_name: null,
        insurance_card: null,
        appointments_count: 3,
        last_visit: null,
        next_visit: '2026-10-01T12:30:00Z',
      }),
    ).toMatchObject({
      id: 'p1',
      name: 'Camila Santos',
      appointmentsCount: 3,
      nextVisit: '2026-10-01T12:30:00Z',
    });

    expect(
      insuranceFromRpc({
        id: 'i1',
        patient_id: 'p1',
        insurance_id: 'h1',
        insurance_name: 'Amil Dental',
        card_number: '123',
        status: 'EXPIRED',
        valid_until: '2025-12-31',
      }),
    ).toEqual({
      id: 'i1',
      insuranceId: 'h1',
      insuranceName: 'Amil Dental',
      cardNumber: '123',
      status: 'EXPIRED',
      validUntil: '2025-12-31',
    });
  });

  it('dentista inativo aparece como "Inativo"', () => {
    const doctor = doctorFromRpc({
      id: 'd1',
      full_name: 'Dra. X',
      crm: 'CRO/SP 1',
      bio: null,
      consultation_price: null,
      specialty_id: 's',
      specialty_name: 'Clínica Geral',
      specialty_ids: null,
      specialties: null,
      location_id: null,
      location_name: null,
      location_address: null,
      is_active: false,
      weekdays: null,
    });
    expect(doctor.status).toBe('Inativo');
    expect(doctor.specialties).toEqual(['Clínica Geral']);
    expect(doctor.schedule).toBe('Sem agenda');
    expect(doctor.consultationPrice).toBeUndefined();
  });
});
