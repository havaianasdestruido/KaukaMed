/** Utilidades de texto para busca e filtros (pt-BR). */

/** Minúsculas e sem acentos: "Odontopediatria" → "odontopediatria", "Endodôntia" → "endodontia". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Alguma das especialidades contém o termo procurado (ignora acento e caixa)? */
export function matchesSpecialty(specialties: readonly string[], wanted: string): boolean {
  const term = normalizeText(wanted);
  if (term === '') return true;
  return specialties.some((s) => normalizeText(s).includes(term));
}
