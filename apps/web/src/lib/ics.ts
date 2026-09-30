/**
 * Arquivo de calendário (.ics, RFC 5545) de uma consulta, para o paciente adicionar
 * ao Google Agenda, Outlook ou Apple Calendar. Gerado no próprio navegador.
 */

export interface IcsAppointment {
  id: string;
  /** ISO 8601 (UTC). */
  startsAt: string;
  endsAt: string;
  doctorName: string;
  procedure: string;
  location?: string;
  notes?: string;
}

/** `2026-10-01T12:30:00Z` → `20261001T123000Z` */
function icsDate(iso: string | Date): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

/** Escapa vírgula, ponto e vírgula, barra invertida e quebras de linha (RFC 5545 §3.3.11). */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Dobra linhas com mais de 75 caracteres (continuação começa com espaço). */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join('\r\n');
}

export function buildIcs(apt: IcsAppointment, now: Date = new Date()): string {
  const description = [apt.procedure, apt.notes].filter(Boolean).join(' — ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KaukaMed//OdontoAura//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${apt.id}@kaukamed`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(apt.startsAt)}`,
    `DTEND:${icsDate(apt.endsAt)}`,
    `SUMMARY:${escapeText(`Consulta odontológica — ${apt.doctorName}`)}`,
    ...(apt.location ? [`LOCATION:${escapeText(apt.location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Consulta em 2 horas',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

/** Baixa o `.ics` no navegador (cria um link temporário). */
export function downloadIcs(apt: IcsAppointment): void {
  const blob = new Blob([buildIcs(apt)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `consulta-${apt.startsAt.slice(0, 10)}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
