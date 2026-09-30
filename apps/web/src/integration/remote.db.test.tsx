// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeSupabase, type FakeSupabase } from '../testing/fakeSupabase';

/**
 * App em modo Supabase, ponta a ponta, contra as funções SQL REAIS.
 *
 * O `createClient` do supabase-js é trocado por um cliente de teste (src/testing/fakeSupabase.ts)
 * que conversa direto com um PostgreSQL — com papel `authenticated`, claims do JWT e RLS,
 * como o PostgREST faz. Assim o que está sendo exercitado é o código de produção do app
 * (login, perfil, RPCs, mapeamento das linhas, telas) sobre o SQL de db/migrations.
 *
 * Desativado por padrão. Para rodar, prepare um banco com compat + schema + migrations +
 * seed (veja db/README.md) e aponte a URL:
 *
 *   KAUKAMED_TEST_DATABASE_URL=postgres://kaukamed:kaukamed@localhost:5432/kaukamed \
 *     npm test -w @kaukamed/web
 */
const DATABASE_URL = process.env.KAUKAMED_TEST_DATABASE_URL;

const holder = vi.hoisted(() => ({ client: null as unknown }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => holder.client }));

const PASSWORD = 'Kauka@2026';
const MARKER = 'teste-integracao';
const SIGNUP_EMAIL = 'novo.paciente@integracao.test';

describe.skipIf(!DATABASE_URL)('App + Supabase simulado sobre PostgreSQL real', () => {
  let fake: FakeSupabase;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'http://supabase.test');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-de-teste');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fake = await createFakeSupabase(DATABASE_URL!);
    holder.client = fake.client;
  });

  afterEach(async () => {
    cleanup();
    // Remove o que os testes criaram (as consultas de teste e a conta de cadastro).
    await fake.admin.query('delete from public.appointments where notes like $1', [`%${MARKER}%`]);
    await fake.admin.query('delete from auth.users where email = $1', [SIGNUP_EMAIL]);
    await fake.close();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function openApp() {
    const { default: App } = await import('../App');
    render(<App />);
  }

  async function loginAs(email: string, password = PASSWORD) {
    const u = userEvent.setup({ delay: null });
    await u.type(await screen.findByPlaceholderText('Seu e-mail'), email);
    await u.type(screen.getByPlaceholderText('Sua senha'), password);
    await u.click(screen.getByRole('button', { name: /Entrar no OdontoAura/ }));
    return u;
  }

  /** Quantas consultas existem de hoje (fuso da clínica) em diante, segundo o banco. */
  async function upcomingCount(whereSql = 'true', params: unknown[] = []) {
    const { rows } = await fake.admin.query<{ n: string }>(
      `select count(*) as n from public.appointments a
        where a.scheduled_start >= (date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')
          and ${whereSql}`,
      params,
    );
    return Number(rows[0]!.n);
  }

  it('recusa senha errada com mensagem em português', async () => {
    await openApp();
    await loginAs('paciente@example.com', 'senha-errada');
    await screen.findByText('E-mail ou senha inválidos.');
    // Continua na tela de login.
    expect(screen.getByPlaceholderText('Seu e-mail')).toBeTruthy();
  });

  it('paciente: entra, vê as consultas do banco, agenda e cancela', async () => {
    await openApp();
    const u = await loginAs('paciente@example.com');

    // Painel com o nome real e a próxima consulta semeada (Dr. Marcelo).
    await screen.findByText(/Olá, Camila Santos/);
    await screen.findByText('Próximo Agendamento');
    expect((await screen.findAllByText(/Dr\. Marcelo Arantes/)).length).toBeGreaterThan(0);

    // Minhas Consultas: 2 próximas, 2 realizadas, 1 cancelada (veja db/seed.sql).
    await u.click(screen.getByTitle('Consultas'));
    await screen.findByRole('heading', { name: 'Minhas Consultas' });
    const tab = (name: RegExp) => screen.getByRole('tab', { name });
    await waitFor(() => expect(tab(/Próximas Consultas/).textContent).toContain('2'));
    expect(tab(/Histórico Realizado/).textContent).toContain('2');
    expect(tab(/Canceladas/).textContent).toContain('1');

    // Agendar com a Dra. Helena (tardes de segunda, quarta e sexta).
    await u.click(screen.getByRole('button', { name: /Nova Consulta/ }));
    await screen.findByRole('heading', { name: /Agendamento de Consulta Odontológica/ });
    await u.click(await screen.findByRole('button', { name: /Dra\. Helena Gusmão/ }));
    const slots = await screen.findAllByRole('button', { name: /^\d\d:\d\d$/ });
    await u.click(slots[0]!);
    await u.type(screen.getByLabelText(/Observações ou sintomas/), MARKER);
    await u.click(screen.getByRole('button', { name: /Confirmar agendamento/ }));

    await screen.findByText('Consulta agendada com sucesso!');
    await screen.findByRole('heading', { name: 'Minhas Consultas' });
    await waitFor(() => expect(tab(/Próximas Consultas/).textContent).toContain('3'));

    // A consulta nova nasce "Agendado", com preço e local definidos pelo banco.
    const card = (await screen.findByText(new RegExp(MARKER))).closest('article')!;
    expect(within(card).getByText('Agendado')).toBeTruthy();
    expect(within(card).getByText(/Dra\. Helena Gusmão/)).toBeTruthy();
    expect(within(card).getByText(/OdontoAura Unidade Jardins/)).toBeTruthy();

    // Cancela pelo portal (mais de 2 h de antecedência).
    await u.click(within(card).getByRole('button', { name: 'Cancelar' }));
    const dialog = await screen.findByRole('dialog', { name: /Cancelar consulta/ });
    await u.type(within(dialog).getByRole('textbox'), 'Mudança de planos');
    await u.click(within(dialog).getByRole('button', { name: 'Confirmar cancelamento' }));
    await screen.findByText('Consulta cancelada.');
    await waitFor(() => expect(tab(/Canceladas/).textContent).toContain('2'));

    const { rows } = await fake.admin.query<{ status: string; cancel_reason: string }>(
      'select status, cancel_reason from public.appointments where notes like $1',
      [`%${MARKER}%`],
    );
    expect(rows).toEqual([{ status: 'CANCELLED', cancel_reason: 'Mudança de planos' }]);
  });

  it('recepção: vê todas as consultas, agenda para um paciente e confirma/cancela com motivo', async () => {
    await openApp();
    const u = await loginAs('recepcao@example.com');

    await screen.findByRole('heading', { name: 'Agenda da Clínica' });
    const expected = await upcomingCount();
    expect(expected).toBeGreaterThan(3);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(expected));

    // Novo agendamento para o Jorge com a Dra. Renata (terças e quintas).
    await u.click(screen.getByRole('button', { name: /Novo agendamento/ }));
    await screen.findByRole('heading', { name: 'Novo agendamento' });
    await u.click(await screen.findByRole('button', { name: /Jorge Mendes/ }));
    await u.click(await screen.findByRole('button', { name: /Dra\. Renata Silveira/ }));
    const slots = await screen.findAllByRole('button', { name: /^\d\d:\d\d$/ });
    await u.click(slots[0]!);
    await u.type(screen.getByLabelText(/Observações ou sintomas/), MARKER);
    await u.click(screen.getByRole('button', { name: /Confirmar agendamento/ }));

    await screen.findByText('Consulta agendada com sucesso!');
    await screen.findByRole('heading', { name: 'Agenda da Clínica' });
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(expected + 1));

    const row = screen.getByText(new RegExp(MARKER)).closest('article')!;
    expect(within(row).getByText('Jorge Mendes')).toBeTruthy();
    expect(within(row).getByText('Agendado')).toBeTruthy();

    await u.click(within(row).getByRole('button', { name: 'Confirmar' }));
    await screen.findByText('Consulta confirmada.');
    await waitFor(() => expect(within(row).getByText('Confirmado')).toBeTruthy());

    // A recepção precisa informar o motivo ao cancelar.
    await u.click(within(row).getByRole('button', { name: 'Cancelar' }));
    const dialog = await screen.findByRole('dialog', { name: /Cancelar consulta/ });
    const submit = within(dialog).getByRole('button', { name: 'Confirmar cancelamento' });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    await u.type(within(dialog).getByRole('textbox'), 'Paciente avisou que não vai');
    await u.click(submit);
    await screen.findByText('Consulta cancelada.');
    await waitFor(() =>
      expect(
        within(row).getByText(/Motivo do cancelamento: Paciente avisou que não vai/),
      ).toBeTruthy(),
    );

    const { rows } = await fake.admin.query<{ status: string; created_by: string }>(
      'select a.status, p.email as created_by from public.appointments a join public.profiles p on p.id = a.created_by where a.notes like $1',
      [`%${MARKER}%`],
    );
    expect(rows).toEqual([{ status: 'CANCELLED', created_by: 'recepcao@example.com' }]);
  });

  it('dentista: só enxerga as próprias consultas e não tem menu de gestão', async () => {
    await openApp();
    await loginAs('dentista@example.com');

    await screen.findByRole('heading', { name: 'Minha Agenda' });
    const { rows } = await fake.admin.query<{ id: string }>(
      "select id from public.profiles where email = 'dentista@example.com'",
    );
    const expected = await upcomingCount('a.doctor_id = $1', [rows[0]!.id]);
    expect(expected).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(expected));

    // Não vê o faturamento nem o botão de agendar; vê pacientes e agenda.
    expect(screen.queryByRole('button', { name: /Novo agendamento/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Faturamento/ })).toBeNull();
    expect(screen.getByRole('button', { name: /Pacientes/ })).toBeTruthy();
  });

  it('dentista: lista só os pacientes que atende', async () => {
    await openApp();
    const u = await loginAs('renata.silveira@example.com');
    await screen.findByRole('heading', { name: 'Minha Agenda' });
    await u.click(screen.getByRole('button', { name: /Pacientes/ }));
    await screen.findByRole('heading', { name: 'Meus Pacientes' });

    const { rows } = await fake.admin.query<{ n: string }>(
      `select count(distinct a.patient_id) as n from public.appointments a
         join public.profiles d on d.id = a.doctor_id where d.email = 'renata.silveira@example.com'`,
    );
    const expected = Number(rows[0]!.n);
    expect(expected).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(expected + 1)); // + cabeçalho
  });

  it('cadastro: cria uma conta de paciente (papel sempre PATIENT) e já entra no portal', async () => {
    await openApp();
    const u = userEvent.setup({ delay: null });
    await u.click(await screen.findByRole('button', { name: /Cadastre-se na clínica/ }));

    await u.type(await screen.findByPlaceholderText('Seu nome completo'), 'Novo Paciente de Teste');
    await u.type(screen.getByPlaceholderText('voce@email.com'), SIGNUP_EMAIL);
    await u.type(screen.getByPlaceholderText('••••••••'), 'Senha@123');
    await u.type(screen.getByPlaceholderText('000.000.000-00'), '39053344705');
    await u.type(screen.getByPlaceholderText('(11) 90000-0000'), '11912345678');
    await u.click(screen.getByRole('checkbox'));
    await u.click(screen.getByRole('button', { name: /Concluir Cadastro/ }));

    await screen.findByText(/Olá, Novo Paciente/);
    await screen.findByText('Nenhuma consulta marcada');

    const { rows } = await fake.admin.query<{ role: string; cpf: string; phone: string }>(
      'select role, cpf, phone from public.profiles where email = $1',
      [SIGNUP_EMAIL],
    );
    expect(rows).toEqual([{ role: 'PATIENT', cpf: '390.533.447-05', phone: '(11) 91234-5678' }]);
  });

  it('cadastro: CPF de outra conta vira mensagem amigável e não cria a conta', async () => {
    await openApp();
    const u = userEvent.setup({ delay: null });
    await u.click(await screen.findByRole('button', { name: /Cadastre-se na clínica/ }));

    await u.type(await screen.findByPlaceholderText('Seu nome completo'), 'Outra Pessoa');
    await u.type(screen.getByPlaceholderText('voce@email.com'), SIGNUP_EMAIL);
    await u.type(screen.getByPlaceholderText('••••••••'), 'Senha@123');
    // CPF da Camila (db/seed.sql): o trigger do banco falha e o GoTrue devolve um erro genérico.
    await u.type(screen.getByPlaceholderText('000.000.000-00'), '52998224725');
    await u.click(screen.getByRole('checkbox'));
    await u.click(screen.getByRole('button', { name: /Concluir Cadastro/ }));

    await screen.findByText(/o CPF informado pode já estar cadastrado/);
    const { rows } = await fake.admin.query('select 1 from auth.users where email = $1', [
      SIGNUP_EMAIL,
    ]);
    expect(rows).toHaveLength(0);
  });
});
