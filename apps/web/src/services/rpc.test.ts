import { describe, expect, it } from 'vitest';

import { RpcError, toRpcError } from './rpc';

describe('rpc — erros do banco', () => {
  it('orienta a aplicar a migration quando a função não existe', () => {
    const error = toRpcError(
      {
        code: 'PGRST202',
        message: 'Could not find the function public.list_doctors without parameters',
      },
      'list_doctors',
    );
    expect(error).toBeInstanceOf(RpcError);
    expect(error.message).toContain('list_doctors');
    expect(error.message).toContain('002_agendamento_v1.sql');
    expect(error.code).toBe('PGRST202');
  });

  it('orienta a reaplicar o schema quando falta tabela/coluna', () => {
    expect(
      toRpcError({ code: '42P01', message: 'relation does not exist' }, 'x').message,
    ).toContain('kaukamed_schema.sql');
  });

  it('mantém a mensagem em pt-BR levantada pelas funções do banco', () => {
    const error = toRpcError(
      { code: '23505', message: 'Este horário acabou de ser reservado. Escolha outro horário.' },
      'book_appointment',
    );
    expect(error.message).toBe('Este horário acabou de ser reservado. Escolha outro horário.');
    expect(error.code).toBe('23505');
  });

  it('tem mensagem reserva', () => {
    expect(toRpcError({}, 'x').message).toBe('Erro ao falar com o banco de dados.');
  });
});
