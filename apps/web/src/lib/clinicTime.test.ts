import { describe, expect, it } from 'vitest';

import {
  addDays,
  clinicWallTimeToDate,
  dateKeyOf,
  daysBetween,
  describeDistance,
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatLongDate,
  formatLongDateKey,
  formatTime,
  hoursUntil,
  isPast,
  monthName,
  parseDateKey,
  patientCanChange,
  todayKey,
  weekdayOf,
  weekdayShort,
} from './clinicTime';

describe('clinicTime — dia e hora no fuso da clínica (America/Sao_Paulo)', () => {
  it('converte UTC para o dia da clínica (UTC-3)', () => {
    expect(dateKeyOf('2026-10-01T02:59:00Z')).toBe('2026-09-30');
    expect(dateKeyOf('2026-10-01T03:00:00Z')).toBe('2026-10-01');
    expect(dateKeyOf(new Date('2026-12-31T23:30:00Z'))).toBe('2026-12-31');
  });

  it('formata a hora sem virar "24:00" na meia-noite', () => {
    expect(formatTime('2026-10-01T11:00:00Z')).toBe('08:00');
    expect(formatTime('2026-10-01T03:00:00Z')).toBe('00:00');
    expect(formatTime('2026-10-01T02:59:00Z')).toBe('23:59');
  });

  it('formata datas curtas e longas', () => {
    expect(formatDate('2026-10-01T11:00:00Z')).toBe('01/10/2026');
    expect(formatDateTime('2026-10-01T17:30:00Z')).toBe('01/10/2026 às 14:30');
    expect(formatLongDate('2026-10-01T11:00:00Z')).toBe('Quinta-feira, 1 de Outubro de 2026');
    expect(formatLongDateKey('2026-03-08')).toBe('Domingo, 8 de Março de 2026');
    expect(formatDayMonth('2026-03-08')).toBe('08/03');
    expect(weekdayShort('2026-10-01')).toBe('Qui');
    expect(monthName('2026-10-01')).toBe('Outubro');
  });

  it('todayKey usa o dia da clínica, não o do navegador', () => {
    // 01:00 UTC ainda é "ontem" em São Paulo.
    expect(todayKey(new Date('2026-06-15T01:00:00Z'))).toBe('2026-06-14');
    expect(todayKey(new Date('2026-06-15T15:00:00Z'))).toBe('2026-06-15');
  });
});

describe('clinicTime — aritmética de calendário', () => {
  it('soma e subtrai dias atravessando mês, ano e bissexto', () => {
    expect(addDays('2026-02-27', 2)).toBe('2026-03-01');
    expect(addDays('2024-02-28', 2)).toBe('2024-03-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-10-01', 0)).toBe('2026-10-01');
  });

  it('descobre o dia da semana (0 = domingo) igual ao banco', () => {
    expect(weekdayOf('2026-10-01')).toBe(4); // quinta
    expect(weekdayOf('2026-10-04')).toBe(0); // domingo
    expect(weekdayOf('2026-10-03')).toBe(6); // sábado
  });

  it('rejeita datas impossíveis', () => {
    expect(parseDateKey('2026-02-30')).toBeNull();
    expect(parseDateKey('2026-13-01')).toBeNull();
    expect(parseDateKey('01/10/2026')).toBeNull();
    expect(parseDateKey('2026-10-01')).toEqual({ year: 2026, month: 10, day: 1 });
    expect(() => addDays('lixo', 1)).toThrow();
  });

  it('calcula a diferença em dias', () => {
    expect(daysBetween('2026-10-01', '2026-10-01')).toBe(0);
    expect(daysBetween('2026-10-01', '2026-10-04')).toBe(3);
    expect(daysBetween('2026-10-04', '2026-10-01')).toBe(-3);
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
  });
});

describe('clinicTime — horário de parede da clínica → instante UTC', () => {
  it('08:00 em São Paulo são 11:00 UTC', () => {
    expect(clinicWallTimeToDate('2026-10-01', '08:00').toISOString()).toBe(
      '2026-10-01T11:00:00.000Z',
    );
  });

  it('respeita o horário de verão de anos antigos (UTC-2 em dezembro/2018)', () => {
    expect(clinicWallTimeToDate('2018-12-01', '08:00').toISOString()).toBe(
      '2018-12-01T10:00:00.000Z',
    );
    expect(clinicWallTimeToDate('2018-07-01', '08:00').toISOString()).toBe(
      '2018-07-01T11:00:00.000Z',
    );
  });

  it('faz o caminho de ida e volta sem perder o horário', () => {
    for (const hhmm of ['00:00', '07:30', '12:00', '18:45', '23:59']) {
      const instant = clinicWallTimeToDate('2026-05-20', hhmm);
      expect(formatTime(instant)).toBe(hhmm);
      expect(dateKeyOf(instant)).toBe('2026-05-20');
    }
  });

  it('rejeita entrada inválida', () => {
    expect(() => clinicWallTimeToDate('2026-10-01', 'oito')).toThrow();
    expect(() => clinicWallTimeToDate('2026-99-01', '08:00')).toThrow();
  });
});

describe('clinicTime — regra de antecedência do paciente (2 h)', () => {
  const now = new Date('2026-10-01T12:00:00Z');

  it('calcula as horas que faltam', () => {
    expect(hoursUntil('2026-10-01T14:00:00Z', now)).toBe(2);
    expect(hoursUntil('2026-10-01T11:00:00Z', now)).toBe(-1);
  });

  it('permite alterar com 2 h ou mais e bloqueia com menos', () => {
    expect(patientCanChange('2026-10-01T14:00:00Z', now)).toBe(true);
    expect(patientCanChange('2026-10-01T13:59:00Z', now)).toBe(false);
    expect(patientCanChange('2026-10-01T11:00:00Z', now)).toBe(false);
    expect(patientCanChange('2026-10-05T11:00:00Z', now)).toBe(true);
  });

  it('identifica consultas que já começaram', () => {
    expect(isPast('2026-10-01T12:00:00Z', now)).toBe(true);
    expect(isPast('2026-10-01T12:00:01Z', now)).toBe(false);
  });

  it('descreve a distância em linguagem natural (no fuso da clínica)', () => {
    expect(describeDistance('2026-10-01T15:00:00Z', now)).toBe('hoje');
    expect(describeDistance('2026-10-02T15:00:00Z', now)).toBe('amanhã');
    expect(describeDistance('2026-10-04T15:00:00Z', now)).toBe('em 3 dias');
    expect(describeDistance('2026-09-30T15:00:00Z', now)).toBe('ontem');
    expect(describeDistance('2026-09-27T15:00:00Z', now)).toBe('há 4 dias');
  });
});
