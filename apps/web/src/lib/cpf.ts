/**
 * CPF e telefone: máscara de digitação e validação.
 *
 * A validação de verdade é feita pelo banco (`public.normalize_cpf`, migration
 * 002): um CPF inválido vira NULL em vez de travar o cadastro. Aqui ela serve
 * apenas para avisar o usuário antes de enviar o formulário.
 */

/** Só os dígitos de um texto. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Valida o CPF pelos dois dígitos verificadores. Aceita com ou sem máscara. */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // 111.111.111-11 etc.

  const check = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits.charAt(i)) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return check(9) === Number(digits.charAt(9)) && check(10) === Number(digits.charAt(10));
}

/** Máscara progressiva `000.000.000-00` (ideal para `onChange`). */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Máscara progressiva de telefone brasileiro: `(11) 91234-5678` ou `(11) 1234-5678`. */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Esconde o miolo do CPF (`***.456.789-**`) para telas onde ele não precisa aparecer inteiro. */
export function maskCpf(value: string | null | undefined): string {
  const d = onlyDigits(value ?? '');
  if (d.length !== 11) return '—';
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}
