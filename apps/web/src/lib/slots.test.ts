import { describe, expect, it } from 'vitest';

import { formatTime } from './clinicTime';
import {
  DEMO_SCHEDULE,
  generateDaySlots,
  generateDaySummaries,
  periodOf,
  type ScheduleWindow,
} from './slots';

// Quinta-feira, 1º/10/2026. Antes do expediente (06:00 em São Paulo).
const EARLY = new Date('2026-10-01T09:00:00Z');

const MORNING_THURSDAY: ScheduleWindow[] = [
  { weekday: 4, startTime: '08:00', endTime: '10:00', slotMinutes: 30 },
];

describe('slots — grade do modo demonstração', () => {
  it('gera os horários do dia conforme a janela e a duração', () => {
    const slots = generateDaySlots('2026-10-01', MORNING_THURSDAY, [], EARLY);
    expect(slots.map((s) => formatTime(s.start))).toEqual(['08:00', '08:30', '09:00', '09:30']);
    expect(slots.every((s) => s.available)).toBe(true);
    expect(slots[0]?.start).toBe('2026-10-01T11:00:00.000Z');
    expect(slots[0]?.end).toBe('2026-10-01T11:30:00.000Z');
  });

  it('não gera horário em dia sem expediente', () => {
    expect(generateDaySlots('2026-10-03', MORNING_THURSDAY, [], EARLY)).toEqual([]); // sábado
    expect(generateDaySlots('2026-10-02', MORNING_THURSDAY, [], EARLY)).toEqual([]); // sexta
  });

  it('descarta horários que já passaram', () => {
    const now = new Date('2026-10-01T12:15:00Z'); // 09:15 em São Paulo
    const slots = generateDaySlots('2026-10-01', MORNING_THURSDAY, [], now);
    expect(slots.map((s) => formatTime(s.start))).toEqual(['09:30']);
  });

  it('marca como indisponível o horário ocupado — inclusive por consulta mais longa', () => {
    const busy = [{ start: '2026-10-01T11:30:00.000Z', end: '2026-10-01T12:30:00.000Z' }]; // 08:30–09:30
    const slots = generateDaySlots('2026-10-01', MORNING_THURSDAY, busy, EARLY);
    expect(slots.map((s) => [formatTime(s.start), s.available])).toEqual([
      ['08:00', true],
      ['08:30', false],
      ['09:00', false],
      ['09:30', true],
    ]);
  });

  it('respeita a duração do slot (60 min) e ignora janela que não fecha um slot inteiro', () => {
    const hourly: ScheduleWindow[] = [
      { weekday: 4, startTime: '09:00', endTime: '11:30', slotMinutes: 60 },
    ];
    const slots = generateDaySlots('2026-10-01', hourly, [], EARLY);
    expect(slots.map((s) => formatTime(s.start))).toEqual(['09:00', '10:00']);
  });

  it('resume os dias com horário (pula fins de semana) e conta os livres', () => {
    const busy = [{ start: '2026-10-01T11:00:00.000Z', end: '2026-10-01T11:30:00.000Z' }];
    const days = generateDaySummaries('2026-10-01', 7, DEMO_SCHEDULE, busy, EARLY);
    // 1/10 (qui), 2/10 (sex), 5/10 (seg), 6/10 (ter), 7/10 (qua) — sáb. e dom. ficam de fora.
    expect(days.map((d) => d.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
    ]);
    expect(days[0]).toEqual({ date: '2026-10-01', totalSlots: 16, freeSlots: 15 });
    expect(days[1]).toEqual({ date: '2026-10-02', totalSlots: 16, freeSlots: 16 });
  });

  it('agrupa por período do dia', () => {
    expect(periodOf('08:00')).toBe('manha');
    expect(periodOf('11:59')).toBe('manha');
    expect(periodOf('12:00')).toBe('tarde');
    expect(periodOf('17:30')).toBe('tarde');
    expect(periodOf('18:00')).toBe('noite');
  });
});
