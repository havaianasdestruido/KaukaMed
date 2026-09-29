import { type UserProfile } from '../types';
import { requireSupabase } from '../lib/supabase';
import {
  profileFromRow,
  type DoctorRow,
  type PatientInsuranceRow,
  type ProfileRow,
} from './mappers';

/**
 * Autenticação via Supabase Auth + leitura do perfil em `public.profiles`.
 *
 * O perfil é criado automaticamente pelo trigger `handle_new_user`
 * (db/migrations/001_frontend_support.sql) a partir dos metadados enviados no
 * cadastro — o front-end nunca insere diretamente em `profiles`.
 */

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
}

/** Carrega o perfil completo (com convênio ou dados de médico, se houver). */
export async function loadProfile(userId: string): Promise<UserProfile> {
  const sb = requireSupabase();

  const { data: profile, error } = await sb
    .from('profiles')
    .select('id, role, full_name, email, phone, cpf')
    .eq('id', userId)
    .single<ProfileRow>();

  if (error) throw error;

  let insurance: PatientInsuranceRow | null = null;
  let doctor: DoctorRow | null = null;

  if (profile.role === 'PATIENT') {
    const { data } = await sb
      .from('patient_insurances')
      .select('card_number, status, insurance:health_insurances(name)')
      .eq('patient_id', userId)
      .eq('status', 'ACTIVE')
      .limit(1)
      .maybeSingle<PatientInsuranceRow>();
    insurance = data;
  } else if (profile.role === 'DOCTOR') {
    const { data } = await sb
      .from('doctors')
      .select(
        'id, crm, bio, consultation_price, profile:profiles(full_name, is_active), specialty:specialties(name), location:locations(name)',
      )
      .eq('id', userId)
      .maybeSingle<DoctorRow>();
    doctor = data;
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
    redirectTo: window.location.origin + import.meta.env.BASE_URL,
  });
  if (error) throw error;
}

/** Id do usuário da sessão persistida (ou `null`). */
export async function currentUserId(): Promise<string | null> {
  const { data } = await requireSupabase().auth.getSession();
  return data.session?.user.id ?? null;
}
