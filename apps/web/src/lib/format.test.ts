import { describe, expect, it } from 'vitest';

import { describeWeekdays, formatBRL } from './format';

// O Intl usa espaço não separável entre "R$" e o valor.
const plain = (text: string) => text.replace(/\u00a0/g, ' ');

describe('format', () => {
  it('formata reais', () => {
    expect(plain(formatBRL(200))).toBe('R$ 200,00');
    expect(plain(formatBRL(1234.5))).toBe('R$ 1.234,50');
    expect(plain(formatBRL(0))).toBe('R$ 0,00');
    expect(plain(formatBRL(null))).toBe('R$ 0,00');
    expect(plain(formatBRL(Number.NaN))).toBe('R$ 0,00');
  });

  it('descreve os dias de atendimento', () => {
    expect(describeWeekdays([1, 2, 3, 4, 5])).toBe('Seg a Sex');
    expect(describeWeekdays([2, 4])).toBe('Ter e Qui');
    expect(describeWeekdays([1, 3, 5])).toBe('Seg, Qua e Sex');
    expect(describeWeekdays([1, 2])).toBe('Seg e Ter');
    expect(describeWeekdays([3])).toBe('Qua');
    expect(describeWeekdays([1, 2, 3, 5])).toBe('Seg a Qua e Sex');
    expect(describeWeekdays([5, 3, 1, 3])).toBe('Seg, Qua e Sex');
    expect(describeWeekdays([0, 1, 2, 3, 4, 5, 6])).toBe('Todos os dias');
    expect(describeWeekdays([])).toBe('Sem agenda');
    expect(describeWeekdays(null)).toBe('Sem agenda');
  });
});
