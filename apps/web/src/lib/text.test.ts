import { describe, expect, it } from 'vitest';

import { matchesSpecialty, normalizeText } from './text';

describe('text', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalizeText('  Odontopediatria ')).toBe('odontopediatria');
    expect(normalizeText('Harmonização Orofacial')).toBe('harmonizacao orofacial');
    expect(normalizeText('ÁÉÍÓÚ çã')).toBe('aeiou ca');
  });

  it('casa especialidades ignorando acento, caixa e texto extra', () => {
    const doctor = ['Ortodontia & Ortopedia Facial', 'Invisalign'];
    expect(matchesSpecialty(doctor, 'ortodontia')).toBe(true);
    expect(matchesSpecialty(doctor, 'INVISALIGN')).toBe(true);
    expect(matchesSpecialty(doctor, 'Endodontia')).toBe(false);
    expect(matchesSpecialty(['Harmonização Orofacial'], 'harmonizacao')).toBe(true);
    expect(matchesSpecialty([], 'x')).toBe(false);
    expect(matchesSpecialty(doctor, '  ')).toBe(true);
  });
});
