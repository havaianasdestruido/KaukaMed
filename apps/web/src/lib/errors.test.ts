import { describe, expect, it } from 'vitest';

import { toErrorMessage, translateMessage } from './errors';

describe('errors', () => {
  it('traduz as mensagens de autenticação do Supabase', () => {
    expect(translateMessage('Invalid login credentials')).toBe('E-mail ou senha inválidos.');
    expect(translateMessage('Email not confirmed')).toBe('Confirme seu e-mail antes de entrar.');
    expect(translateMessage('User already registered')).toBe('Este e-mail já está cadastrado.');
    expect(translateMessage('Password should be at least 6 characters.')).toBe(
      'A senha deve ter pelo menos 6 caracteres.',
    );
    expect(translateMessage('Password should be at least 10 characters.')).toBe(
      'A senha deve ter pelo menos 10 caracteres.',
    );
    expect(translateMessage('Email address "x@y" is invalid')).toBe(
      'E-mail inválido. Informe um endereço de e-mail real.',
    );
    expect(translateMessage('email rate limit exceeded')).toContain('Muitas tentativas');
    expect(translateMessage('Signups not allowed for this instance')).toContain('desativado');
  });

  it('traduz os erros da troca de senha pelo link de recuperação', () => {
    expect(translateMessage('New password should be different from the old password.')).toBe(
      'A nova senha deve ser diferente da anterior.',
    );
    const expired = translateMessage('Auth session missing!');
    expect(expired).toContain('link de recuperação expirou');
    expect(expired).toContain('Esqueci minha senha');
  });

  it('explica o "Database error saving new user" (CPF duplicado no trigger)', () => {
    expect(translateMessage('Database error saving new user')).toContain('CPF');
  });

  it('traduz erro de rede e de sessão', () => {
    expect(translateMessage('TypeError: Failed to fetch')).toContain('Sem conexão');
    expect(translateMessage('JWT expired')).toContain('sessão expirou');
    expect(translateMessage('new row violates row-level security policy')).toContain('permissão');
  });

  it('trata a falta de GRANT na tabela como problema de instalação, não de permissão', () => {
    const msg = translateMessage('permission denied for table profiles');
    expect(msg).toContain('"profiles"');
    expect(msg).toContain('migration 002');
    // RLS e função continuam com a mensagem de permissão do usuário.
    expect(translateMessage('new row violates row-level security policy for table "x"')).toContain(
      'permissão',
    );
    expect(translateMessage('permission denied for function list_doctors')).toContain('permissão');
  });

  it('repassa as mensagens em pt-BR do banco sem alterar', () => {
    const msg = 'Este horário acabou de ser reservado. Escolha outro horário.';
    expect(translateMessage(msg)).toBe(msg);
    expect(toErrorMessage(new Error(msg))).toBe(msg);
    expect(toErrorMessage({ message: msg })).toBe(msg);
  });

  it('usa o texto reserva quando não há mensagem', () => {
    expect(toErrorMessage(null, 'Falhou.')).toBe('Falhou.');
    expect(toErrorMessage(42, 'Falhou.')).toBe('Falhou.');
    expect(toErrorMessage({ message: '' }, 'Falhou.')).toBe('Falhou.');
    expect(toErrorMessage('texto solto')).toBe('texto solto');
  });
});
