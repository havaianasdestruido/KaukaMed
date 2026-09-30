// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

/**
 * Fluxos de tela no modo demonstração (sem Supabase): o mesmo código de tela que roda
 * em produção, com o gateway em memória no lugar do banco.
 *
 * Relógio fixo em segunda-feira, 05/10/2026, 10:00 em São Paulo — assim as consultas de
 * exemplo (datas relativas a "hoje") caem sempre nos mesmos dias. Só o `Date` é
 * congelado; temporizadores e promessas seguem reais.
 */
const NOW = new Date('2026-10-05T13:00:00Z');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const user = () => userEvent.setup({ delay: null });

async function switchRole(label: RegExp) {
  const u = user();
  await u.click(screen.getByRole('button', { name: /menu do usuário/i }));
  await u.click(await screen.findByRole('button', { name: label }));
}

describe('App (modo demonstração) — paciente', () => {
  it('abre o painel do paciente com a próxima consulta real', async () => {
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);
    await screen.findByText('Próximo Agendamento');
    // Consulta confirmada de exemplo: quinta-feira, 8 de outubro.
    expect(
      (await screen.findAllByText(/Quinta-feira, 8 de Outubro de 2026/)).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Sua próxima consulta é em 3 dias/)).toBeTruthy();
  });

  it('volta ao topo da página ao trocar de tela', async () => {
    const u = user();
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);

    // O usuário rolou o painel até o fim e abre outra tela pelo menu lateral.
    document.documentElement.scrollTop = 480;
    await u.click(screen.getByTitle('Consultas'));
    await screen.findByRole('heading', { name: 'Minhas Consultas' });

    expect(document.documentElement.scrollTop).toBe(0);
  });

  it('lista as consultas em abas e cancela uma consulta futura', async () => {
    const u = user();
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);

    await u.click(screen.getByTitle('Consultas'));
    await screen.findByRole('heading', { name: 'Minhas Consultas' });

    const tab = (name: RegExp) => screen.getByRole('tab', { name });
    expect(tab(/Próximas Consultas/).textContent).toContain('2');
    expect(tab(/Histórico Realizado/).textContent).toContain('2');
    expect(tab(/Canceladas/).textContent).toContain('1');

    // Cancelar a primeira consulta futura (mais de 2 h de antecedência).
    const cards = screen.getAllByRole('article');
    await u.click(within(cards[0]!).getByRole('button', { name: 'Cancelar' }));
    const dialog = await screen.findByRole('dialog', { name: /Cancelar consulta/ });
    await u.click(within(dialog).getByRole('button', { name: 'Confirmar cancelamento' }));

    await screen.findByText('Consulta cancelada.');
    await waitFor(() => expect(tab(/Próximas Consultas/).textContent).toContain('1'));
    expect(tab(/Canceladas/).textContent).toContain('2');
  });

  it('agenda uma nova consulta escolhendo profissional e horário', async () => {
    const u = user();
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);

    await u.click(screen.getAllByRole('button', { name: /Agendar Consulta/ })[0]!);
    await screen.findByRole('heading', { name: /Agendamento de Consulta Odontológica/ });

    // Sem horário escolhido, o botão de confirmar está travado.
    const confirm = await screen.findByRole('button', { name: /Confirmar agendamento/ });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);

    await u.click(await screen.findByRole('button', { name: /Dr\. Felipe Diniz/ }));
    const slotButtons = await screen.findAllByRole('button', { name: /^\d\d:\d\d$/ });
    await u.click(slotButtons[0]!);
    await waitFor(() => expect((confirm as HTMLButtonElement).disabled).toBe(false));

    await u.click(confirm);
    await screen.findByText('Consulta agendada com sucesso!');
    await screen.findByRole('heading', { name: 'Minhas Consultas' });
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Próximas Consultas/ }).textContent).toContain('3'),
    );
  });
});

describe('App (modo demonstração) — recepção e dentista', () => {
  it('a recepção vê a agenda e confirma uma consulta', async () => {
    const u = user();
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);

    await switchRole(/Funcionário \(Recepção\)/);
    await screen.findByRole('heading', { name: 'Agenda da Clínica' });

    // A partir de hoje (05/10): Jorge (terça), Lucas (quarta), Camila (quinta) e a da Dra. Renata (14/10).
    await screen.findByText('Jorge Mendes');
    expect(screen.getByText('Lucas Ferraz')).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(4);

    const jorge = screen.getByText('Jorge Mendes').closest('article')!;
    expect(within(jorge).getByText('Agendado')).toBeTruthy();
    await u.click(within(jorge).getByRole('button', { name: 'Confirmar' }));
    await screen.findByText('Consulta confirmada.');
    await waitFor(() => expect(within(jorge).queryByText('Agendado')).toBeNull());
    expect(within(jorge).getByText('Confirmado')).toBeTruthy();
  });

  it('a recepção cancela exigindo o motivo', async () => {
    const u = user();
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);
    await switchRole(/Funcionário \(Recepção\)/);
    const jorge = (await screen.findByText('Jorge Mendes')).closest('article')!;

    await u.click(within(jorge).getByRole('button', { name: 'Cancelar' }));
    const dialog = await screen.findByRole('dialog', { name: /Cancelar consulta/ });
    const submit = within(dialog).getByRole('button', { name: 'Confirmar cancelamento' });
    expect((submit as HTMLButtonElement).disabled).toBe(true); // motivo obrigatório

    await u.type(within(dialog).getByRole('textbox'), 'Paciente pediu para desmarcar');
    expect((submit as HTMLButtonElement).disabled).toBe(false);
    await u.click(submit);
    await screen.findByText('Consulta cancelada.');
    await waitFor(() =>
      expect(
        within(jorge).getByText(/Motivo do cancelamento: Paciente pediu para desmarcar/),
      ).toBeTruthy(),
    );
  });

  it('o dentista só vê as próprias consultas e não tem botão de agendar', async () => {
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);
    await switchRole(/Dentista \(Dr\. Marcelo\)/);

    await screen.findByRole('heading', { name: 'Minha Agenda' });
    // Dr. Marcelo, a partir de hoje: Jorge (terça) e Camila (quinta).
    await screen.findByText('Jorge Mendes');
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText('Lucas Ferraz')).toBeNull();
    expect(screen.queryByRole('button', { name: /Novo agendamento/ })).toBeNull();

    // A consulta confirmada pode ser iniciada pelo dentista; a agendada ainda não.
    const camila = screen.getByText(/Camila/, { selector: 'p' }).closest('article')!;
    expect(within(camila).getByRole('button', { name: 'Iniciar atendimento' })).toBeTruthy();
    const jorge = screen.getByText('Jorge Mendes').closest('article')!;
    expect(within(jorge).queryByRole('button')).toBeNull();
  });

  it('a recepção agenda em nome de um paciente', async () => {
    const u = user();
    render(<App />);
    await screen.findByText(/Olá, Dra\. Camila/);
    await switchRole(/Funcionário \(Recepção\)/);
    await screen.findByRole('heading', { name: 'Agenda da Clínica' });

    await u.click(screen.getByRole('button', { name: /Novo agendamento/ }));
    await screen.findByRole('heading', { name: 'Novo agendamento' });

    await u.click(await screen.findByRole('button', { name: /Jorge Mendes/ }));
    await u.click(await screen.findByRole('button', { name: /Dr\. Felipe Diniz/ }));
    const slotButtons = await screen.findAllByRole('button', { name: /^\d\d:\d\d$/ });
    await u.click(slotButtons[0]!);

    await u.click(screen.getByRole('button', { name: /Confirmar agendamento/ }));
    await screen.findByText('Consulta agendada com sucesso!');
    await screen.findByRole('heading', { name: 'Agenda da Clínica' });
  });
});
