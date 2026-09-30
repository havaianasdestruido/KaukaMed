import { describe, expect, it } from 'vitest';

import {
  ACTION_TARGET_STATUS,
  allowedActions,
  bucketOf,
  cancelRequiresReason,
  nextAppointment,
  statusBadge,
  type RuleActor,
} from './appointmentRules';

const NOW = new Date('2026-10-01T12:00:00Z');
const IN_1_DAY = '2026-10-02T12:00:00Z';
const IN_1_HOUR = '2026-10-01T13:00:00Z';
const IN_2_HOURS = '2026-10-01T14:00:00Z';

const patient: RuleActor = { userId: 'pat-1', role: 'PATIENT' };
const doctor: RuleActor = { userId: 'doc-1', role: 'DOCTOR' };
const frontDesk: RuleActor = { userId: 'emp-1', role: 'EMPLOYEE' };
const admin: RuleActor = { userId: 'adm-1', role: 'ADMIN' };

const apt = (status: Parameters<typeof allowedActions>[1]['status'], startsAt = IN_1_DAY) => ({
  status,
  startsAt,
  patientId: 'pat-1',
  doctorId: 'doc-1',
});

describe('appointmentRules.allowedActions — espelha set_appointment_status / reschedule_appointment', () => {
  it('paciente: confirma, remarca e cancela a própria consulta com antecedência', () => {
    expect(allowedActions(patient, apt('SCHEDULED'), NOW)).toEqual([
      'confirm',
      'reschedule',
      'cancel',
    ]);
    expect(allowedActions(patient, apt('CONFIRMED'), NOW)).toEqual(['reschedule', 'cancel']);
  });

  it('paciente: a menos de 2 h só pode confirmar — não remarca nem cancela', () => {
    expect(allowedActions(patient, apt('SCHEDULED', IN_1_HOUR), NOW)).toEqual(['confirm']);
    expect(allowedActions(patient, apt('CONFIRMED', IN_1_HOUR), NOW)).toEqual([]);
    // exatamente 2 h ainda vale (o banco usa "< 2 h" para bloquear)
    expect(allowedActions(patient, apt('SCHEDULED', IN_2_HOURS), NOW)).toContain('cancel');
  });

  it('paciente não mexe em consulta de outro paciente', () => {
    expect(allowedActions(patient, { ...apt('SCHEDULED'), patientId: 'pat-2' }, NOW)).toEqual([]);
  });

  it('recepção: confirma, remarca, cancela e marca falta a qualquer hora', () => {
    expect(allowedActions(frontDesk, apt('SCHEDULED', IN_1_HOUR), NOW)).toEqual([
      'confirm',
      'reschedule',
      'cancel',
      'no_show',
    ]);
    expect(allowedActions(frontDesk, apt('CONFIRMED'), NOW)).toEqual([
      'reschedule',
      'cancel',
      'no_show',
    ]);
    // a recepção não inicia atendimento
    expect(allowedActions(frontDesk, apt('CONFIRMED'), NOW)).not.toContain('start');
  });

  it('dentista: só inicia e conclui as próprias consultas', () => {
    expect(allowedActions(doctor, apt('SCHEDULED'), NOW)).toEqual([]);
    expect(allowedActions(doctor, apt('CONFIRMED'), NOW)).toEqual(['start']);
    expect(allowedActions(doctor, apt('IN_PROGRESS'), NOW)).toEqual(['complete']);
    expect(allowedActions(doctor, { ...apt('CONFIRMED'), doctorId: 'doc-2' }, NOW)).toEqual([]);
  });

  it('administrador pode tudo o que o grafo de status permite', () => {
    expect(allowedActions(admin, apt('SCHEDULED'), NOW)).toEqual([
      'confirm',
      'reschedule',
      'cancel',
      'no_show',
    ]);
    expect(allowedActions(admin, apt('CONFIRMED'), NOW)).toEqual([
      'start',
      'reschedule',
      'cancel',
      'no_show',
    ]);
    expect(allowedActions(admin, apt('IN_PROGRESS'), NOW)).toEqual(['complete', 'cancel']);
    expect(allowedActions(frontDesk, apt('IN_PROGRESS'), NOW)).toEqual(['cancel']);
  });

  it('estados finais não têm ações', () => {
    for (const status of ['COMPLETED', 'CANCELLED', 'NO_SHOW'] as const) {
      for (const actor of [patient, doctor, frontDesk, admin]) {
        expect(allowedActions(actor, apt(status), NOW)).toEqual([]);
      }
    }
  });

  it('mapeia cada ação para o status de banco e exige motivo só da equipe', () => {
    expect(ACTION_TARGET_STATUS).toEqual({
      confirm: 'CONFIRMED',
      start: 'IN_PROGRESS',
      complete: 'COMPLETED',
      cancel: 'CANCELLED',
      no_show: 'NO_SHOW',
    });
    expect(cancelRequiresReason('PATIENT')).toBe(false);
    expect(cancelRequiresReason('DOCTOR')).toBe(false);
    expect(cancelRequiresReason('EMPLOYEE')).toBe(true);
    expect(cancelRequiresReason('ADMIN')).toBe(true);
  });
});

describe('appointmentRules — agrupamento e próxima consulta', () => {
  it('separa próximas, histórico e canceladas', () => {
    expect(bucketOf('SCHEDULED')).toBe('upcoming');
    expect(bucketOf('CONFIRMED')).toBe('upcoming');
    expect(bucketOf('IN_PROGRESS')).toBe('upcoming');
    expect(bucketOf('COMPLETED')).toBe('history');
    expect(bucketOf('NO_SHOW')).toBe('history');
    expect(bucketOf('CANCELLED')).toBe('cancelled');
  });

  it('escolhe a consulta ativa mais próxima que ainda não terminou', () => {
    const list = [
      {
        id: 'passada',
        status: 'COMPLETED' as const,
        startsAt: '2026-09-20T12:00:00Z',
        endsAt: '2026-09-20T12:30:00Z',
      },
      {
        id: 'cancelada',
        status: 'CANCELLED' as const,
        startsAt: '2026-10-02T12:00:00Z',
        endsAt: '2026-10-02T12:30:00Z',
      },
      {
        id: 'depois',
        status: 'SCHEDULED' as const,
        startsAt: '2026-10-09T12:00:00Z',
        endsAt: '2026-10-09T12:30:00Z',
      },
      {
        id: 'proxima',
        status: 'CONFIRMED' as const,
        startsAt: '2026-10-03T12:00:00Z',
        endsAt: '2026-10-03T12:30:00Z',
      },
      {
        id: 'esquecida',
        status: 'SCHEDULED' as const,
        startsAt: '2026-09-25T12:00:00Z',
        endsAt: '2026-09-25T12:30:00Z',
      },
    ];
    expect(nextAppointment(list, NOW)?.id).toBe('proxima');
    expect(nextAppointment([], NOW)).toBeUndefined();
  });

  it('tem selo para todos os status', () => {
    const labels = (
      ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const
    ).map((s) => statusBadge(s).label);
    expect(labels).toEqual([
      'Agendado',
      'Confirmado',
      'Em andamento',
      'Finalizado',
      'Cancelado',
      'Não compareceu',
    ]);
  });
});
