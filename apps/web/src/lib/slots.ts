/**
 * Grade de horários para o modo demonstração (sem Supabase).
 *
 * Com Supabase, quem calcula os horários é o banco (`get_available_days` /
 * `get_available_slots`, migration 002), a partir de `doctor_schedules`. Esta é
 * a mesma regra em TypeScript, usada só quando o app roda com dados locais.
 * Também é testada para garantir que as duas pontas pensam igual.
 */
import { addDays, clinicWallTimeToDate, type DateKey, weekdayOf } from './clinicTime';

/** Um horário atendível (início/fim em ISO UTC). */
export interface Slot {
  start: string;
  end: string;
  available: boolean;
}

/** Resumo de um dia para o seletor de datas. */
export interface DaySummary {
  date: DateKey;
  totalSlots: number;
  freeSlots: number;
}

/** Uma janela de atendimento (horário de parede da clínica). */
export interface ScheduleWindow {
  /** 0 = domingo … 6 = sábado. */
  weekday: number;
  /** `08:00` */
  startTime: string;
  /** `12:00` */
  endTime: string;
  slotMinutes: number;
}

/** Intervalo já ocupado (consulta marcada). */
export interface BusyRange {
  start: string;
  end: string;
}

/** Agenda padrão do modo demonstração: segunda a sexta, 08–12h e 14–18h, 30 min. */
export const DEMO_SCHEDULE: readonly ScheduleWindow[] = [1, 2, 3, 4, 5].flatMap((weekday) => [
  { weekday, startTime: '08:00', endTime: '12:00', slotMinutes: 30 },
  { weekday, startTime: '14:00', endTime: '18:00', slotMinutes: 30 },
]);

const minutesOf = (hhmm: string): number => {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};

const hhmmOf = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Horários futuros de um dia, marcando como indisponíveis os que colidem com `busy`. */
export function generateDaySlots(
  day: DateKey,
  schedule: readonly ScheduleWindow[],
  busy: readonly BusyRange[],
  now: Date = new Date(),
): Slot[] {
  const weekday = weekdayOf(day);
  const busyRanges = busy.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
  const slots: Slot[] = [];

  for (const window of schedule) {
    if (window.weekday !== weekday || window.slotMinutes <= 0) continue;
    const endMinutes = minutesOf(window.endTime);
    for (
      let at = minutesOf(window.startTime);
      at + window.slotMinutes <= endMinutes;
      at += window.slotMinutes
    ) {
      const start = clinicWallTimeToDate(day, hhmmOf(at));
      const end = clinicWallTimeToDate(day, hhmmOf(at + window.slotMinutes));
      if (start.getTime() <= now.getTime()) continue;

      const taken = busyRanges.some((b) => b.start < end.getTime() && b.end > start.getTime());
      slots.push({ start: start.toISOString(), end: end.toISOString(), available: !taken });
    }
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

/** Resumo dos próximos `days` dias a partir de `from`; dias sem horário ficam de fora. */
export function generateDaySummaries(
  from: DateKey,
  days: number,
  schedule: readonly ScheduleWindow[],
  busy: readonly BusyRange[],
  now: Date = new Date(),
): DaySummary[] {
  const summaries: DaySummary[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = addDays(from, i);
    const slots = generateDaySlots(date, schedule, busy, now);
    if (slots.length === 0) continue;
    summaries.push({
      date,
      totalSlots: slots.length,
      freeSlots: slots.filter((s) => s.available).length,
    });
  }
  return summaries;
}

/** Período do dia de um horário (para agrupar os botões de horário). */
export type DayPeriod = 'manha' | 'tarde' | 'noite';

export function periodOf(hhmm: string): DayPeriod {
  const hour = Number(hhmm.split(':')[0]);
  if (hour < 12) return 'manha';
  if (hour < 18) return 'tarde';
  return 'noite';
}
