// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Recuperação de senha e restauração de sessão no modo Supabase, sem banco de dados.
 *
 * O `createClient` do supabase-js é trocado por um cliente mínimo que registra as chamadas.
 * O que o supabase-js de verdade faz com o link (ler o `#access_token=…&type=recovery`,
 * validar o token, limpar a URL e avisar PASSWORD_RECOVERY) não roda aqui: foi conferido à
 * parte, num navegador. Estes testes garantem o que o APP faz nesses cenários.
 */
const USER_ID = '11111111-2222-4333-8444-555555555555';
const PROFILE_ROW = {
  id: USER_ID,
  role: 'PATIENT',
  full_name: 'Camila Santos',
  email: 'paciente@example.com',
  phone: '(11) 98888-0001',
  cpf: '529.982.247-25',
};
const RECOVERY_URL =
  '/#access_token=tok&refresh_token=r&expires_in=3600&token_type=bearer&type=recovery';

const holder = vi.hoisted(() => ({ client: null as unknown }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => holder.client }));

type AuthListener = (event: string, session: unknown) => void;

interface FakeOptions {
  /** Já existe uma sessão salva (login anterior ou sessão aberta pelo link de recuperação)? */
  session: boolean;
  /** Erro devolvido por `auth.updateUser` (troca de senha). */
  updateError?: { message: string };
}

function installFakeClient({ session: hasSession, updateError }: FakeOptions) {
  let session = hasSession ? { access_token: 'tok', user: { id: USER_ID } } : null;
  const listeners = new Set<AuthListener>();
  const calls = {
    getSession: 0,
    updateUser: [] as unknown[],
    signOut: 0,
    dataReads: [] as string[],
  };

  holder.client = {
    auth: {
      getSession: async () => {
        calls.getSession += 1;
        return { data: { session }, error: null };
      },
      onAuthStateChange: (listener: AuthListener) => {
        listeners.add(listener);
        return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
      },
      updateUser: async (attributes: unknown) => {
        calls.updateUser.push(attributes);
        return updateError
          ? { data: { user: null }, error: updateError }
          : { data: { user: { id: USER_ID } }, error: null };
      },
      signOut: async () => {
        calls.signOut += 1;
        session = null;
        listeners.forEach((listener) => listener('SIGNED_OUT', null));
        return { error: null };
      },
    },
    from: (table: string) => {
      calls.dataReads.push(`from:${table}`);
      const builder = {
        select: () => builder,
        eq: () => builder,
        maybeSingle: async () => ({ data: PROFILE_ROW, error: null }),
      };
      return builder;
    },
    rpc: async (fn: string) => {
      calls.dataReads.push(`rpc:${fn}`);
      return { data: [], error: null };
    },
  };

  return {
    calls,
    /** Simula um evento do supabase-js (ex.: PASSWORD_RECOVERY). */
    emit: (event: string) => listeners.forEach((listener) => listener(event, session)),
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'http://supabase.test');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key-de-teste');
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

/** O app lê a URL ao carregar o módulo, então o endereço precisa estar pronto antes do import. */
async function openApp(url: string) {
  window.history.replaceState(null, '', url);
  const { default: App } = await import('./App');
  render(<App />);
}

const user = () => userEvent.setup({ delay: null });
const newPassword = () => screen.getByLabelText(/^Nova senha/);
const repeatPassword = () => screen.getByLabelText(/^Repita a nova senha/);
const saveButton = () => screen.getByRole('button', { name: 'Salvar nova senha' });

describe('App (Supabase) — link de recuperação de senha', () => {
  it('abre a tela de nova senha e não carrega dados antes da troca', async () => {
    const { calls } = installFakeClient({ session: true });
    await openApp(RECOVERY_URL);

    await screen.findByRole('heading', { name: 'Definir nova senha' });
    await waitFor(() => expect(calls.getSession).toBeGreaterThan(0));

    // Há sessão (aberta pelo link), mas o app só segue depois da nova senha.
    expect(screen.queryByText(/Olá, Camila/)).toBeNull();
    expect(screen.queryByPlaceholderText('Seu e-mail')).toBeNull();
    expect(calls.dataReads).toEqual([]);
  });

  it('recusa senha curta e senhas diferentes sem falar com o servidor', async () => {
    const u = user();
    const { calls } = installFakeClient({ session: true });
    await openApp(RECOVERY_URL);
    await screen.findByRole('heading', { name: 'Definir nova senha' });

    await u.type(newPassword(), 'curta');
    await u.type(repeatPassword(), 'curta');
    await u.click(saveButton());
    await screen.findByText('A nova senha deve ter pelo menos 8 caracteres.');

    await u.clear(newPassword());
    await u.clear(repeatPassword());
    await u.type(newPassword(), 'NovaSenha#2026');
    await u.type(repeatPassword(), 'OutraSenha#2026');
    await u.click(saveButton());
    await screen.findByText('As senhas não conferem.');

    expect(calls.updateUser).toEqual([]);
    expect(screen.getByRole('heading', { name: 'Definir nova senha' })).toBeTruthy();
  });

  it('troca a senha e entra no portal do paciente', async () => {
    const u = user();
    const { calls } = installFakeClient({ session: true });
    await openApp(RECOVERY_URL);
    await screen.findByRole('heading', { name: 'Definir nova senha' });

    await u.type(newPassword(), 'NovaSenha#2026');
    await u.type(repeatPassword(), 'NovaSenha#2026');
    await u.click(saveButton());

    await screen.findByText('Senha redefinida com sucesso!');
    await screen.findByText(/Olá, Camila Santos/);
    expect(calls.updateUser).toEqual([{ password: 'NovaSenha#2026' }]);
    expect(screen.queryByRole('heading', { name: 'Definir nova senha' })).toBeNull();
  });

  it('explica em português quando o link já expirou e continua na tela', async () => {
    const u = user();
    // O app registra o erro original no console; aqui é esperado.
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    installFakeClient({ session: true, updateError: { message: 'Auth session missing!' } });
    await openApp(RECOVERY_URL);
    await screen.findByRole('heading', { name: 'Definir nova senha' });

    await u.type(newPassword(), 'NovaSenha#2026');
    await u.type(repeatPassword(), 'NovaSenha#2026');
    await u.click(saveButton());

    await screen.findByText(/O link de recuperação expirou ou já foi usado/);
    expect(screen.getByRole('heading', { name: 'Definir nova senha' })).toBeTruthy();
    expect(screen.queryByText(/Olá, Camila/)).toBeNull();
    expect(logged).toHaveBeenCalled();
  });

  it('"Cancelar e voltar ao login" encerra a sessão de recuperação', async () => {
    const u = user();
    const { calls } = installFakeClient({ session: true });
    await openApp(RECOVERY_URL);
    await screen.findByRole('heading', { name: 'Definir nova senha' });

    await u.click(screen.getByRole('button', { name: 'Cancelar e voltar ao login' }));

    await screen.findByPlaceholderText('Seu e-mail');
    expect(calls.signOut).toBe(1);
    expect(screen.queryByRole('heading', { name: 'Definir nova senha' })).toBeNull();
  });

  it('o evento PASSWORD_RECOVERY também abre a tela de nova senha', async () => {
    const { emit } = installFakeClient({ session: true });
    await openApp('/');
    await screen.findByText(/Olá, Camila Santos/);

    emit('PASSWORD_RECOVERY');

    await screen.findByRole('heading', { name: 'Definir nova senha' });
  });
});

describe('App (Supabase) — restauração da sessão', () => {
  it('sessão salva e sem link de recuperação: entra direto no portal', async () => {
    const { calls } = installFakeClient({ session: true });
    await openApp('/');

    await screen.findByText(/Olá, Camila Santos/);
    expect(screen.queryByRole('heading', { name: 'Definir nova senha' })).toBeNull();
    expect(calls.dataReads).toContain('from:profiles');
  });

  it('sem sessão e sem link: mostra a tela de login', async () => {
    const { calls } = installFakeClient({ session: false });
    await openApp('/');

    await screen.findByPlaceholderText('Seu e-mail');
    expect(calls.dataReads).toEqual([]);
  });
});
