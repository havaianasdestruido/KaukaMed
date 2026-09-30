/**
 * Avatar de iniciais (SVG embutido em `data:`).
 *
 * Contas reais não têm foto: em vez de mostrar uma foto de banco de imagens de
 * outra pessoa, o app desenha um círculo com as iniciais do nome. Não depende de
 * rede nem de serviço externo.
 */

const TITLES = new Set(['dr', 'dr.', 'dra', 'dra.', 'sr', 'sr.', 'sra', 'sra.', 'prof', 'prof.']);
const CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

/** Pares [fundo, letra] na paleta teal/azul do app. */
const PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['#cce8e7', '#005051'],
  ['#d2e4ff', '#1e3a5f'],
  ['#e8def8', '#4a3a6b'],
  ['#ffdfd0', '#7a3b1d'],
  ['#dff0d0', '#2f5b1f'],
  ['#fff0c2', '#6b5200'],
];

const firstLetter = (word: string): string => /\p{L}/u.exec(word)?.[0] ?? '';

/** "Dr. Marcelo Arantes" → "MA"; "Camila" → "C"; "" → "?". */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word !== '' && !TITLES.has(word.toLowerCase()));
  const significant = words.filter((word) => !CONNECTORS.has(word.toLowerCase()));
  const base = significant.length > 0 ? significant : words;

  const first = firstLetter(base[0] ?? '');
  const last = base.length > 1 ? firstLetter(base[base.length - 1] ?? '') : '';
  const initials = (first + last).toUpperCase();
  return initials === '' ? '?' : initials;
}

function hashOf(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** URL `data:` de um avatar de iniciais; a cor é estável para o mesmo nome. */
export function initialsAvatar(name: string): string {
  const [background, foreground] = PALETTE[hashOf(name) % PALETTE.length] ?? PALETTE[0]!;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" fill="${background}"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" ` +
    `font-family="Roboto, Arial, sans-serif" font-size="26" font-weight="700" ` +
    `fill="${foreground}">${initialsOf(name)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
