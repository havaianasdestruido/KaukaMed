import { describe, expect, it } from 'vitest';

import { initialsAvatar, initialsOf } from './avatar';

describe('avatar', () => {
  it('usa primeiro e último nome, ignorando títulos e conectores', () => {
    expect(initialsOf('Camila Santos')).toBe('CS');
    expect(initialsOf('Dr. Marcelo Arantes')).toBe('MA');
    expect(initialsOf('Dra. Renata Silveira')).toBe('RS');
    expect(initialsOf('Ana Paula de Souza Lima')).toBe('AL');
    expect(initialsOf('  maria   da  silva ')).toBe('MS');
  });

  it('lida com nome de uma palavra, acentos e vazio', () => {
    expect(initialsOf('Camila')).toBe('C');
    expect(initialsOf('Érica Ávila')).toBe('ÉÁ');
    expect(initialsOf('')).toBe('?');
    expect(initialsOf('   ')).toBe('?');
    expect(initialsOf('Dr.')).toBe('?'); // só o título, sem nome
  });

  it('gera um data URI de SVG estável e seguro', () => {
    const uri = initialsAvatar('Camila Santos');
    expect(uri.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(decodeURIComponent(uri)).toContain('>CS</text>');
    expect(initialsAvatar('Camila Santos')).toBe(uri);
    // Nada de markup vindo do nome.
    expect(decodeURIComponent(initialsAvatar('<script>alert(1)</script>'))).not.toContain(
      '<script>',
    );
  });
});
