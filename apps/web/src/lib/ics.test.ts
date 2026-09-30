import { describe, expect, it } from 'vitest';

import { buildIcs } from './ics';

const apt = {
  id: '0b9f2c3e-0000-4000-8000-000000000001',
  startsAt: '2026-10-01T12:30:00+00:00',
  endsAt: '2026-10-01T13:00:00+00:00',
  doctorName: 'Dr. Marcelo Arantes',
  procedure: 'Reavaliação',
  location: 'OdontoAura Unidade Jardins, Av. Paulista, 1578',
  notes: 'Levar exames; trazer carteirinha',
};

describe('ics', () => {
  const ics = buildIcs(apt, new Date('2026-09-29T15:00:00Z'));

  it('gera um calendário válido com datas em UTC', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:0b9f2c3e-0000-4000-8000-000000000001@kaukamed\r\n');
    expect(ics).toContain('DTSTAMP:20260929T150000Z\r\n');
    expect(ics).toContain('DTSTART:20261001T123000Z\r\n');
    expect(ics).toContain('DTEND:20261001T130000Z\r\n');
    expect(ics).toContain('BEGIN:VALARM');
  });

  it('escapa vírgulas e ponto e vírgula do texto', () => {
    expect(ics).toContain('LOCATION:OdontoAura Unidade Jardins\\, Av. Paulista\\, 1578\r\n');
    expect(ics).toContain('Levar exames\\; trazer carteirinha');
  });

  it('usa somente CRLF e nenhuma linha passa de 75 caracteres', () => {
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
    for (const line of ics.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it('dobra linhas longas com continuação iniciada por espaço', () => {
    const long = buildIcs({ ...apt, notes: 'x'.repeat(200) });
    const folded = long.split('\r\n').filter((l) => l.startsWith(' '));
    expect(folded.length).toBeGreaterThan(0);
    // Desdobrando, o texto original volta inteiro.
    expect(long.replace(/\r\n /g, '')).toContain('x'.repeat(200));
  });

  it('omite LOCATION quando não há local', () => {
    expect(buildIcs({ ...apt, location: undefined })).not.toContain('LOCATION:');
  });
});
