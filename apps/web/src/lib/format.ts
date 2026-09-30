/** Formatações de exibição (pt-BR). Funções puras, cobertas por `format.test.ts`. */

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** `200` → `R$ 200,00` */
export function formatBRL(value: number | null | undefined): string {
  return brl.format(Number.isFinite(value) ? Number(value) : 0);
}

const WEEKDAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Dias de atendimento em texto curto. Sequências de 3+ dias viram intervalo:
 * `[1,2,3,4,5]` → "Seg a Sex"; `[2,4]` → "Ter e Qui"; `[1,3,5]` → "Seg, Qua e Sex".
 */
export function describeWeekdays(weekdays: readonly number[] | null | undefined): string {
  const days = [...new Set((weekdays ?? []).filter((d) => d >= 0 && d <= 6))].sort((a, b) => a - b);
  if (days.length === 0) return 'Sem agenda';
  if (days.length === 7) return 'Todos os dias';

  const parts: string[] = [];
  let i = 0;
  while (i < days.length) {
    let j = i;
    while (j + 1 < days.length && days[j + 1] === (days[j] ?? 0) + 1) j += 1;
    const first = WEEKDAY_ABBR[days[i] ?? 0] ?? '';
    const last = WEEKDAY_ABBR[days[j] ?? 0] ?? '';
    if (j - i >= 2) {
      parts.push(`${first} a ${last}`);
    } else {
      for (let k = i; k <= j; k += 1) parts.push(WEEKDAY_ABBR[days[k] ?? 0] ?? '');
    }
    i = j + 1;
  }

  if (parts.length === 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
}
