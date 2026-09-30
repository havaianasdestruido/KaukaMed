/**
 * Datas e horários da clínica.
 *
 * O banco guarda todo horário em UTC (`timestamptz`) e a agenda é definida em
 * horário de parede da clínica (`doctor_schedules`, 08:00–12:00 etc.). Por isso
 * o front-end SEMPRE formata no fuso da clínica — nunca no fuso do navegador —
 * e quem agenda de outro fuso enxerga as mesmas horas que a recepção.
 *
 * Tudo aqui é função pura (sem estado nem rede) e está coberto por testes em
 * `clinicTime.test.ts`.
 */

/** Fuso da clínica. Precisa ser o mesmo de `public.clinic_timezone()` no banco. */
export const CLINIC_TIME_ZONE = 'America/Sao_Paulo';

/**
 * Antecedência mínima (em horas) para o paciente cancelar/remarcar pelo portal.
 * Espelha `public.patient_change_min_notice()` (db/migrations/002). A regra é
 * aplicada pelo banco; aqui serve só para esconder botões que falhariam.
 */
export const PATIENT_MIN_NOTICE_HOURS = 2;

/** Data de calendário no formato `YYYY-MM-DD` (sem fuso — é o dia na clínica). */
export type DateKey = string;

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const WEEKDAYS_PT = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const WEEKDAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const wallClock = new Intl.DateTimeFormat('en-US', {
  timeZone: CLINIC_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

interface WallParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Componentes do horário de parede da clínica para um instante. */
function wallPartsOf(instant: Date): WallParts {
  const parts: Record<string, number> = {};
  for (const part of wallClock.formatToParts(instant)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year ?? 0,
    month: parts.month ?? 0,
    day: parts.day ?? 0,
    hour: (parts.hour ?? 0) % 24,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  };
}

const pad = (n: number, size = 2) => String(n).padStart(size, '0');

function toDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

/** Dia (na clínica) em que um instante cai, como `YYYY-MM-DD`. */
export function dateKeyOf(input: Date | string | number): DateKey {
  const p = wallPartsOf(toDate(input));
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
}

/** Hoje na clínica. */
export function todayKey(now: Date = new Date()): DateKey {
  return dateKeyOf(now);
}

/** Separa `YYYY-MM-DD` em números; devolve `null` se o formato for inválido. */
export function parseDateKey(key: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  const valid =
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day;
  return valid ? { year, month, day } : null;
}

/** Soma (ou subtrai) dias de calendário a uma data. */
export function addDays(key: DateKey, days: number): DateKey {
  const parsed = parseDateKey(key);
  if (!parsed) throw new Error(`Data inválida: ${key}`);
  const moved = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days));
  return `${pad(moved.getUTCFullYear(), 4)}-${pad(moved.getUTCMonth() + 1)}-${pad(moved.getUTCDate())}`;
}

/** Dia da semana de uma data: 0 = domingo … 6 = sábado (igual ao `weekday` do banco). */
export function weekdayOf(key: DateKey): number {
  const parsed = parseDateKey(key);
  if (!parsed) throw new Error(`Data inválida: ${key}`);
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay();
}

/** `14:30` no horário da clínica. */
export function formatTime(input: Date | string | number): string {
  const p = wallPartsOf(toDate(input));
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** `24/10/2024` no horário da clínica. */
export function formatDate(input: Date | string | number): string {
  const p = wallPartsOf(toDate(input));
  return `${pad(p.day)}/${pad(p.month)}/${pad(p.year, 4)}`;
}

/** `24/10/2024 às 14:30`. */
export function formatDateTime(input: Date | string | number): string {
  return `${formatDate(input)} às ${formatTime(input)}`;
}

/** `Quinta-feira, 24 de Outubro de 2024` (formato usado pelas telas do protótipo). */
export function formatLongDate(input: Date | string | number): string {
  const key = dateKeyOf(input);
  return formatLongDateKey(key);
}

/** Mesmo formato de {@link formatLongDate}, a partir de um `YYYY-MM-DD`. */
export function formatLongDateKey(key: DateKey): string {
  const parsed = parseDateKey(key);
  if (!parsed) return key;
  const weekday = capitalize(WEEKDAYS_PT[weekdayOf(key)] ?? '');
  const month = capitalize(MONTHS_PT[parsed.month - 1] ?? '');
  return `${weekday}, ${parsed.day} de ${month} de ${parsed.year}`;
}

/** `Qui` */
export function weekdayShort(key: DateKey): string {
  return WEEKDAYS_SHORT_PT[weekdayOf(key)] ?? '';
}

/** `Outubro` */
export function monthName(key: DateKey): string {
  const parsed = parseDateKey(key);
  return parsed ? capitalize(MONTHS_PT[parsed.month - 1] ?? '') : '';
}

/** Número do dia do mês (`24`). */
export function dayOfMonth(key: DateKey): number {
  return parseDateKey(key)?.day ?? 0;
}

/** `24/10` */
export function formatDayMonth(key: DateKey): string {
  const parsed = parseDateKey(key);
  return parsed ? `${pad(parsed.day)}/${pad(parsed.month)}` : key;
}

/**
 * Converte um horário de parede da clínica (`2026-10-01` + `08:30`) no instante
 * UTC correspondente. Considera o offset do fuso naquela data (horário de verão).
 */
export function clinicWallTimeToDate(key: DateKey, hhmm: string): Date {
  const parsed = parseDateKey(key);
  const time = /^(\d{1,2}):(\d{2})/.exec(hhmm);
  if (!parsed || !time) throw new Error(`Data/horário inválidos: ${key} ${hhmm}`);
  const hour = Number(time[1]);
  const minute = Number(time[2]);

  const asIfUtc = Date.UTC(parsed.year, parsed.month - 1, parsed.day, hour, minute);
  const offsetAt = (utcMs: number) => {
    const p = wallPartsOf(new Date(utcMs));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - utcMs;
  };

  let utc = asIfUtc - offsetAt(asIfUtc);
  const corrected = asIfUtc - offsetAt(utc);
  if (corrected !== utc) utc = corrected;
  return new Date(utc);
}

/** Horas (fracionadas) que faltam entre `now` e o início da consulta. Negativo = já passou. */
export function hoursUntil(startIso: string | Date, now: Date = new Date()): number {
  return (toDate(startIso).getTime() - now.getTime()) / 3_600_000;
}

/** Se a consulta já começou (ou passou). */
export function isPast(startIso: string | Date, now: Date = new Date()): boolean {
  return toDate(startIso).getTime() <= now.getTime();
}

/**
 * O paciente ainda pode cancelar/remarcar pelo portal? (antecedência mínima)
 * A recepção e o administrador não têm essa limitação.
 */
export function patientCanChange(startIso: string | Date, now: Date = new Date()): boolean {
  return hoursUntil(startIso, now) >= PATIENT_MIN_NOTICE_HOURS;
}

/** Textos curtos de contagem regressiva: "hoje", "amanhã", "em 3 dias". */
export function describeDistance(startIso: string | Date, now: Date = new Date()): string {
  const days = daysBetween(todayKey(now), dateKeyOf(startIso));
  if (days < 0) return days === -1 ? 'ontem' : `há ${-days} dias`;
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  return `em ${days} dias`;
}

/** Diferença em dias de calendário entre duas datas (`to - from`). */
export function daysBetween(from: DateKey, to: DateKey): number {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  if (!a || !b) throw new Error(`Data inválida: ${from} / ${to}`);
  const ms = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  return Math.round(ms / 86_400_000);
}
