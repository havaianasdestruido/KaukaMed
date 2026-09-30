import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: { fn: string; args: Record<string, unknown> }[] = [];
const responses: Record<string, unknown> = {};

vi.mock('./rpc', () => ({
  callRpc: vi.fn(async (fn: string, args: Record<string, unknown> = {}) => {
    calls.push({ fn, args });
    return responses[fn] ?? [];
  }),
}));

import { remoteGateway } from './remoteGateway';

/** Divide por vírgulas fora de parênteses (ex.: `numeric(10,2)` não quebra). */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim() !== '') parts.push(current);
  return parts;
}

/** Lê db/migrations/002 e devolve, por função, os parâmetros e se têm valor padrão. */
function sqlSignatures(): Map<string, Map<string, { hasDefault: boolean }>> {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../../db/migrations/002_agendamento_v1.sql',
  );
  const sql = readFileSync(file, 'utf8');
  const signatures = new Map<string, Map<string, { hasDefault: boolean }>>();
  const header = /create or replace function public\.(\w+)\(([\s\S]*?)\)\s*(?:returns|language)/gi;

  for (const match of sql.matchAll(header)) {
    const params = new Map<string, { hasDefault: boolean }>();
    const body = (match[2] ?? '').replace(/--.*$/gm, '');
    for (const piece of splitTopLevel(body)) {
      const param = /^\s*(p_\w+)\s+\S+([\s\S]*)$/i.exec(piece);
      if (param) params.set(param[1]!, { hasDefault: /\bdefault\b/i.test(param[2] ?? '') });
    }
    signatures.set(match[1]!, params);
  }
  return signatures;
}

const signatures = sqlSignatures();

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(responses)) delete responses[key];
});

describe('remoteGateway — contrato com as funções SQL da migration 002', () => {
  it('encontra no SQL todas as funções que o front-end chama', () => {
    for (const fn of [
      'list_doctors',
      'get_available_days',
      'get_available_slots',
      'book_appointment',
      'reschedule_appointment',
      'set_appointment_status',
      'list_appointments',
      'list_patients',
      'list_patient_insurances',
    ]) {
      expect(signatures.has(fn), `função ${fn} não encontrada no SQL`).toBe(true);
    }
  });

  it('só envia parâmetros que existem no SQL e nunca esquece um obrigatório', async () => {
    await remoteGateway.listDoctors();
    await remoteGateway.listAppointments({
      from: '2026-10-01T00:00:00Z',
      to: '2026-10-08T00:00:00Z',
      statuses: ['SCHEDULED', 'CONFIRMED'],
      doctorId: 'd1',
      patientId: 'p1',
      search: ' ana ',
      limit: 50,
    });
    await remoteGateway.listAppointments();
    await remoteGateway.listAvailableDays('d1', 14);
    await remoteGateway.listAvailableSlots('d1', '2026-10-01');
    await remoteGateway.bookAppointment({ doctorId: 'd1', startsAt: '2026-10-01T11:00:00Z' });
    await remoteGateway.bookAppointment({
      doctorId: 'd1',
      startsAt: '2026-10-01T11:00:00Z',
      type: 'RETURN',
      insuranceId: 'i1',
      notes: ' dor ',
      patientId: 'p1',
    });
    await remoteGateway.rescheduleAppointment('a1', '2026-10-02T11:00:00Z');
    await remoteGateway.setAppointmentStatus('a1', 'CANCELLED', ' motivo ');
    await remoteGateway.setAppointmentStatus('a1', 'CONFIRMED');
    await remoteGateway.listPatients();
    await remoteGateway.listPatients(' ana ');
    await remoteGateway.listPatientInsurances();
    await remoteGateway.listPatientInsurances('p1');

    expect(calls.length).toBeGreaterThan(10);
    for (const { fn, args } of calls) {
      const params = signatures.get(fn);
      expect(params, `função ${fn} sem assinatura no SQL`).toBeDefined();
      for (const key of Object.keys(args)) {
        expect(params!.has(key), `${fn}: parâmetro "${key}" não existe no SQL`).toBe(true);
      }
      for (const [name, { hasDefault }] of params!) {
        if (!hasDefault) {
          expect(name in args, `${fn}: parâmetro obrigatório "${name}" não enviado`).toBe(true);
        }
      }
    }
  });

  it('normaliza filtros vazios para null e aplica os padrões', async () => {
    await remoteGateway.listAppointments({ search: '   ', statuses: [] });
    expect(calls[0]).toEqual({
      fn: 'list_appointments',
      args: {
        p_from: null,
        p_to: null,
        p_statuses: null,
        p_doctor_id: null,
        p_patient_id: null,
        p_search: null,
        p_limit: 300,
      },
    });

    await remoteGateway.bookAppointment({
      doctorId: 'd1',
      startsAt: '2026-10-01T11:00:00Z',
      notes: '  ',
    });
    expect(calls[1]).toEqual({
      fn: 'book_appointment',
      args: {
        p_doctor_id: 'd1',
        p_start: '2026-10-01T11:00:00Z',
        p_type: 'FIRST_VISIT',
        p_insurance_id: null,
        p_notes: null,
        p_patient_id: null,
      },
    });
  });

  it('converte as linhas do banco para o modelo das telas', async () => {
    responses.get_available_days = [{ day: '2026-10-01', total_slots: 8, free_slots: 7 }];
    responses.get_available_slots = [
      {
        slot_start: '2026-10-01T11:00:00+00:00',
        slot_end: '2026-10-01T11:30:00+00:00',
        available: false,
      },
    ];
    responses.list_doctors = [
      {
        id: 'd1',
        full_name: 'Dr. Marcelo Arantes',
        crm: 'CRO/SP 89412',
        bio: null,
        consultation_price: '180.00',
        specialty_id: 's1',
        specialty_name: 'Ortodontia',
        specialty_ids: ['s1'],
        specialties: ['Ortodontia'],
        location_id: 'l1',
        location_name: 'OdontoAura Unidade Jardins',
        location_address: 'Av. Paulista, 1578 — São Paulo/SP',
        is_active: true,
        weekdays: [1, 2, 3, 4, 5],
      },
    ];

    expect(await remoteGateway.listAvailableDays('d1')).toEqual([
      { date: '2026-10-01', totalSlots: 8, freeSlots: 7 },
    ]);
    expect(await remoteGateway.listAvailableSlots('d1', '2026-10-01')).toEqual([
      { start: '2026-10-01T11:00:00+00:00', end: '2026-10-01T11:30:00+00:00', available: false },
    ]);

    const [doctor] = await remoteGateway.listDoctors();
    expect(doctor).toMatchObject({
      id: 'd1',
      name: 'Dr. Marcelo Arantes',
      cro: 'CRO/SP 89412',
      specialties: ['Ortodontia'],
      schedule: 'Seg a Sex',
      room: 'OdontoAura Unidade Jardins',
      consultationPrice: 180,
      status: 'Ativo',
    });
    expect(doctor?.avatar.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('trata respostas nulas como lista vazia', async () => {
    responses.list_appointments = null;
    responses.list_patients = null;
    expect(await remoteGateway.listAppointments()).toEqual([]);
    expect(await remoteGateway.listPatients()).toEqual([]);
  });
});
