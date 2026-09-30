import { describe, expect, it } from 'vitest';

import { MOCK_PROFILES } from '../data/mockData';
import { dateKeyOf, formatTime, todayKey } from '../lib/clinicTime';
import { type UserProfile } from '../types';
import { createLocalGateway } from './localGateway';

// Quinta-feira, 1º/10/2026, 09:00 em São Paulo.
const NOW = new Date('2026-10-01T12:00:00Z');

function setup(role: keyof typeof MOCK_PROFILES = 'paciente') {
  let user: UserProfile = MOCK_PROFILES[role]!;
  const gateway = createLocalGateway(() => user, { now: () => NOW });
  return {
    gateway,
    as: (next: keyof typeof MOCK_PROFILES) => {
      user = MOCK_PROFILES[next]!;
    },
  };
}

/** Primeiro horário livre a partir de amanhã (fora da janela de 2 h do paciente). */
async function firstFreeSlot(gateway: ReturnType<typeof setup>['gateway'], doctorId: string) {
  const days = await gateway.listAvailableDays(doctorId, 14);
  const day = days.find((d) => d.date > todayKey(NOW) && d.freeSlots > 0)!;
  const slots = await gateway.listAvailableSlots(doctorId, day.date);
  return slots.find((s) => s.available)!;
}

describe('localGateway — modo demonstração', () => {
  it('o paciente só enxerga as próprias consultas; a recepção, todas; o dentista, as dele', async () => {
    const { gateway, as } = setup('paciente');
    const mine = await gateway.listAppointments();
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((a) => a.patientId === MOCK_PROFILES.paciente!.id)).toBe(true);

    as('funcionario');
    const all = await gateway.listAppointments();
    expect(all.length).toBeGreaterThan(mine.length);

    as('dentista');
    const doctorOwn = await gateway.listAppointments();
    expect(doctorOwn.length).toBeGreaterThan(0);
    expect(doctorOwn.every((a) => a.doctorName === MOCK_PROFILES.dentista!.name)).toBe(true);
  });

  it('entrega as consultas ordenadas por horário e já com todos os campos do banco', async () => {
    const { gateway } = setup('funcionario');
    const list = await gateway.listAppointments();
    const starts = list.map((a) => a.startsAt!);
    expect([...starts].sort()).toEqual(starts);
    for (const apt of list) {
      expect(apt.dbStatus).toBeDefined();
      expect(apt.doctorId).toBeDefined();
      expect(apt.patientId).toBeDefined();
    }
    const statuses = new Set(list.map((a) => a.dbStatus));
    expect(statuses).toContain('COMPLETED');
    expect(statuses).toContain('CANCELLED');
    expect(statuses).toContain('CONFIRMED');
    expect(statuses).toContain('SCHEDULED');
  });

  it('filtra por status, dentista e busca', async () => {
    const { gateway } = setup('funcionario');
    const cancelled = await gateway.listAppointments({ statuses: ['CANCELLED'] });
    expect(cancelled.every((a) => a.dbStatus === 'CANCELLED')).toBe(true);

    const doctors = await gateway.listDoctors();
    const byDoctor = await gateway.listAppointments({ doctorId: doctors[0]!.id });
    expect(byDoctor.every((a) => a.doctorId === doctors[0]!.id)).toBe(true);

    const search = await gateway.listAppointments({ search: 'jorge' });
    expect(search.length).toBeGreaterThan(0);
    expect(search.every((a) => a.patientName === 'Jorge Mendes')).toBe(true);
  });

  it('só oferece dentistas (não técnicos) para agendar', async () => {
    const { gateway } = setup();
    const doctors = await gateway.listDoctors();
    expect(doctors.length).toBeGreaterThanOrEqual(4);
    expect(doctors.every((d) => d.cro.startsWith('CRO'))).toBe(true);
    expect(doctors.some((d) => d.name.includes('TSB'))).toBe(false);
  });

  it('agenda, mostra o horário como ocupado e recusa o duplo agendamento', async () => {
    const { gateway, as } = setup('paciente');
    const doctor = (await gateway.listDoctors())[3]!; // sem consultas de exemplo
    const slot = await firstFreeSlot(gateway, doctor.id);

    const id = await gateway.bookAppointment({ doctorId: doctor.id, startsAt: slot.start });
    const created = (await gateway.listAppointments()).find((a) => a.id === id)!;
    expect(created.dbStatus).toBe('SCHEDULED');
    expect(created.patientId).toBe(MOCK_PROFILES.paciente!.id);
    expect(created.startsAt).toBe(slot.start);

    const again = (await gateway.listAvailableSlots(doctor.id, dateKeyOf(slot.start))).find(
      (s) => s.start === slot.start,
    );
    expect(again?.available).toBe(false);

    as('funcionario');
    await expect(
      gateway.bookAppointment({
        doctorId: doctor.id,
        startsAt: slot.start,
        patientId: 'demo-paciente-2',
      }),
    ).rejects.toThrow(/acabou de ser reservado/);
  });

  it('valida horário passado, fora da grade, dentista e regras por papel', async () => {
    const { gateway, as } = setup('paciente');
    const doctor = (await gateway.listDoctors())[3]!;
    await expect(
      gateway.bookAppointment({ doctorId: doctor.id, startsAt: '2026-09-30T12:00:00Z' }),
    ).rejects.toThrow(/futuro/);
    await expect(
      gateway.bookAppointment({ doctorId: doctor.id, startsAt: '2026-10-02T11:10:00Z' }),
    ).rejects.toThrow(/agenda do profissional/);
    await expect(
      gateway.bookAppointment({ doctorId: 'nao-existe', startsAt: '2026-10-02T11:00:00Z' }),
    ).rejects.toThrow(/não encontrado/);
    await expect(
      gateway.bookAppointment({
        doctorId: doctor.id,
        startsAt: '2026-10-02T11:00:00Z',
        patientId: 'demo-paciente-2',
      }),
    ).rejects.toThrow(/para você mesmo/);

    as('funcionario');
    await expect(
      gateway.bookAppointment({ doctorId: doctor.id, startsAt: '2026-10-02T11:00:00Z' }),
    ).rejects.toThrow(/Informe o paciente/);

    as('dentista');
    await expect(
      gateway.bookAppointment({ doctorId: doctor.id, startsAt: '2026-10-02T11:00:00Z' }),
    ).rejects.toThrow(/não pode criar/);
  });

  it('remarca para outro horário livre e libera o antigo', async () => {
    const { gateway } = setup('paciente');
    const doctor = (await gateway.listDoctors())[3]!;
    const slot = await firstFreeSlot(gateway, doctor.id);
    const id = await gateway.bookAppointment({ doctorId: doctor.id, startsAt: slot.start });

    const slots = await gateway.listAvailableSlots(doctor.id, dateKeyOf(slot.start));
    const other = slots.find((s) => s.available && s.start !== slot.start)!;
    await gateway.rescheduleAppointment(id, other.start);

    const moved = (await gateway.listAppointments()).find((a) => a.id === id)!;
    expect(moved.startsAt).toBe(other.start);
    expect(moved.dbStatus).toBe('SCHEDULED');

    const after = await gateway.listAvailableSlots(doctor.id, dateKeyOf(slot.start));
    expect(after.find((s) => s.start === slot.start)?.available).toBe(true);
    await expect(gateway.rescheduleAppointment(id, other.start)).rejects.toThrow(/diferente/);
  });

  it('respeita a máquina de estados e as permissões de cancelamento', async () => {
    const { gateway, as } = setup('paciente');
    const apts = await gateway.listAppointments();
    const scheduled = apts.find((a) => a.dbStatus === 'SCHEDULED')!;
    const completed = apts.find((a) => a.dbStatus === 'COMPLETED')!;

    await expect(gateway.setAppointmentStatus(completed.id, 'CANCELLED')).rejects.toThrow(
      /Transição inválida/,
    );
    await expect(gateway.setAppointmentStatus(scheduled.id, 'COMPLETED')).rejects.toThrow(
      /Transição inválida/,
    );

    await gateway.setAppointmentStatus(scheduled.id, 'CONFIRMED');
    expect((await gateway.listAppointments()).find((a) => a.id === scheduled.id)?.dbStatus).toBe(
      'CONFIRMED',
    );

    as('funcionario');
    await expect(gateway.setAppointmentStatus(scheduled.id, 'CANCELLED')).rejects.toThrow(/motivo/);
    await gateway.setAppointmentStatus(scheduled.id, 'CANCELLED', 'Paciente pediu');
    const cancelled = (await gateway.listAppointments()).find((a) => a.id === scheduled.id)!;
    expect(cancelled.dbStatus).toBe('CANCELLED');
    expect(cancelled.cancelReason).toBe('Paciente pediu');
  });

  it('o paciente não cancela nem remarca com menos de 2 h de antecedência', async () => {
    let now = NOW;
    const user = MOCK_PROFILES.paciente!;
    const gateway = createLocalGateway(() => user, { now: () => now });
    const confirmed = (await gateway.listAppointments()).find((a) => a.dbStatus === 'CONFIRMED')!;
    const startsAt = new Date(confirmed.startsAt!).getTime();

    // O tempo passa: agora faltam 59 minutos para a consulta.
    now = new Date(startsAt - 59 * 60 * 1000);
    await expect(gateway.setAppointmentStatus(confirmed.id, 'CANCELLED')).rejects.toThrow(/2 hora/);
    await expect(gateway.rescheduleAppointment(confirmed.id, NOW.toISOString())).rejects.toThrow(
      /2 hora/,
    );

    // Com 3 horas de folga o cancelamento é aceito.
    now = new Date(startsAt - 3 * 60 * 60 * 1000);
    await gateway.setAppointmentStatus(confirmed.id, 'CANCELLED');
    expect((await gateway.listAppointments()).find((a) => a.id === confirmed.id)?.dbStatus).toBe(
      'CANCELLED',
    );
  });

  it('lista pacientes e convênios para a recepção agendar', async () => {
    const { gateway } = setup('funcionario');
    const patients = await gateway.listPatients();
    expect(patients.length).toBeGreaterThanOrEqual(3);
    expect((await gateway.listPatients('lucas'))[0]?.name).toBe('Lucas Ferraz');
    expect((await gateway.listPatients('529.982'))[0]?.name).toBe(MOCK_PROFILES.paciente!.name);

    const camila = patients.find((p) => p.id === MOCK_PROFILES.paciente!.id)!;
    expect(camila.appointmentsCount).toBeGreaterThan(0);
    const insurances = await gateway.listPatientInsurances(camila.id);
    expect(insurances).toHaveLength(1);
    expect(insurances[0]).toMatchObject({ insuranceName: 'Unimed Odonto', status: 'ACTIVE' });
    expect(await gateway.listPatientInsurances('demo-paciente-2')).toEqual([]);
  });

  it('gera dias e horários a partir de hoje, só em dias úteis', async () => {
    const { gateway } = setup();
    const doctor = (await gateway.listDoctors())[0]!;
    const days = await gateway.listAvailableDays(doctor.id, 14);
    expect(days.length).toBeGreaterThan(5);
    expect(days[0]!.date >= todayKey(NOW)).toBe(true);
    for (const day of days) {
      const weekday = new Date(`${day.date}T12:00:00Z`).getUTCDay();
      expect([0, 6]).not.toContain(weekday);
      expect(day.freeSlots).toBeLessThanOrEqual(day.totalSlots);
    }
    const slots = await gateway.listAvailableSlots(doctor.id, days[0]!.date);
    expect(formatTime(slots[0]!.start)).toMatch(/^\d\d:\d\d$/);
  });
});
