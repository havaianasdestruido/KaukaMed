import { type UserProfile } from '../types';
import { requireSupabase } from '../lib/supabase';
import {
  profileFromRow,
  type DoctorRpcRow,
  type PatientInsuranceRpcRow,
  type ProfileRow,
} from './mappers';
import { callRpc } from './rpc';

/**
 * Autenticação via Supabase Auth + leitura do perfil em `public.profiles`.
 *
 * O perfil é criado automaticamente pelo trigger `handle_new_user`
 * (db/migrations/001 e 002) a partir dos metadados enviados no cadastro — o
 * front-end nunca insere diretamente em `profiles`, e o papel (`role`) de quem se
 * cadastra é sempre PATIENT (o banco ignora qualquer `role` enviada).
 */

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
}

/** Endereço do app (com a base do Vite), para onde os e-mails do Supabase devem voltar. */
function appUrl(): string {
  return window.location.origin + import.meta.env.BASE_URL;
}

/**
 * Carrega o perfil do usuário. Dados complementares (plano do paciente, CRM do
 * dentista) são "melhor esforço": se falharem, o login continua.
 */
export async function loadProfile(userId: string): Promise<UserProfile> {
  const sb = requireSupabase();

  const { data: profile, error } = await sb
    .from('profiles')
    .select('id, role, full_name, email, phone, cpf')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error) throw error;
  if (!profile) {
    throw new Error(
      'Seu perfil não foi encontrado no banco de dados. Fale com a clínica para regularizar o cadastro.',
    );
  }

  let insurance: PatientInsuranceRpcRow | null = null;
  let doctor: DoctorRpcRow | null = null;
  try {
    if (profile.role === 'PATIENT') {
      const list = await callRpc<PatientInsuranceRpcRow[] | null>('list_patient_insurances');
      insurance = (list ?? []).find((i) => i.status === 'ACTIVE') ?? null;
    } else if (profile.role === 'DOCTOR') {
      const list = await callRpc<DoctorRpcRow[] | null>('list_doctors');
      doctor = (list ?? []).find((d) => d.id === userId) ?? null;
    }
  } catch (extrasError) {
    console.warn('[kaukamed] dados complementares do perfil indisponíveis:', extrasError);
  }

  return profileFromRow(profile, { insurance, doctor });
}

/** Login com e-mail e senha. Devolve o perfil do usuário autenticado. */
export async function signIn(email: string, password: string): Promise<UserProfile> {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return loadProfile(data.user.id);
}

/**
 * Cadastro de paciente. Se o projeto Supabase exigir confirmação de e-mail,
 * `needsConfirmation` vem `true` e o usuário só consegue entrar após confirmar.
 */
export async function signUp(
  input: SignUpInput,
): Promise<{ profile: UserProfile | null; needsConfirmation: boolean }> {
  const sb = requireSupabase();
  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: appUrl(),
      data: {
        full_name: input.fullName.trim(),
        cpf: input.cpf?.trim() || null,
        phone: input.phone?.trim() || null,
      },
    },
  });
  if (error) throw error;

  if (!data.session || !data.user) {
    return { profile: null, needsConfirmation: true };
  }
  return { profile: await loadProfile(data.user.id), needsConfirmation: false };
}

export async function signOut(): Promise<void> {
  await requireSupabase().auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: appUrl(),
  });
  if (error) throw error;
}

/** Define a nova senha do usuário em sessão de recuperação (link do e-mail). */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await requireSupabase().auth.updateUser({ password });
  if (error) throw error;
}

/** Id do usuário da sessão persistida (ou `null`). */
export async function currentUserId(): Promise<string | null> {
  const { data } = await requireSupabase().auth.getSession();
  return data.session?.user.id ?? null;
}
