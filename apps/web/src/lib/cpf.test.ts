import { describe, expect, it } from 'vitest';

import { formatCpf, formatPhone, isValidCpf, maskCpf, onlyDigits } from './cpf';

describe('cpf', () => {
  it('valida CPFs reais (com e sem máscara)', () => {
    // Os mesmos CPFs usados em db/seed.sql e nos testes SQL.
    for (const cpf of ['529.982.247-25', '111.444.777-35', '123.456.789-09', '39053344705']) {
      expect(isValidCpf(cpf)).toBe(true);
    }
  });

  it('rejeita dígito verificador errado, tamanho errado e repetidos', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('123.456.789-00')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('000.000.000-00')).toBe(false);
    expect(isValidCpf('1234567890')).toBe(false);
    expect(isValidCpf('')).toBe(false);
    expect(isValidCpf('abc')).toBe(false);
  });

  it('aplica a máscara enquanto digita', () => {
    expect(formatCpf('5')).toBe('5');
    expect(formatCpf('5299')).toBe('529.9');
    expect(formatCpf('529982')).toBe('529.982');
    expect(formatCpf('5299822')).toBe('529.982.2');
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    expect(formatCpf('529.982.247-25999')).toBe('529.982.247-25');
    expect(formatCpf('ab12')).toBe('12');
  });

  it('aplica a máscara de telefone fixo e celular', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('1')).toBe('(1');
    expect(formatPhone('119')).toBe('(11) 9');
    expect(formatPhone('1191234')).toBe('(11) 9123-4');
    expect(formatPhone('1112345678')).toBe('(11) 1234-5678');
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678');
    expect(formatPhone('(11) 91234-5678 ramal 9')).toBe('(11) 91234-5678');
  });

  it('esconde o miolo do CPF e extrai dígitos', () => {
    expect(maskCpf('529.982.247-25')).toBe('***.982.247-**');
    expect(maskCpf(null)).toBe('—');
    expect(maskCpf('123')).toBe('—');
    expect(onlyDigits('(11) 9-1234')).toBe('1191234');
  });
});
