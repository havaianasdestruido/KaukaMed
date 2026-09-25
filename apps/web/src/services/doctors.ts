import { type Doctor } from '../types';
import { requireSupabase } from '../lib/supabase';
import { doctorFromRow, type DoctorRow } from './mappers';

/**
 * Corpo clínico (tabela `doctors` + `profiles` + `specialties`).
 * A leitura é pública para usuários autenticados (policy `doctors_select`
 * + `profiles_select_doctors`, ver db/migrations/001_frontend_support.sql).
 *
 * Cadastrar um novo profissional exige criar um usuário no Supabase Auth,
 * o que só pode ser feito com a service-role key (backend). Por isso não há
 * `createDoctor` aqui — ver docs/FRONTEND.md.
 */
export async function listDoctors(): Promise<Doctor[]> {
  const { data, error } = await requireSupabase()
    .from('doctors')
    .select(
      'id, crm, bio, consultation_price, profile:profiles(full_name, is_active), specialty:specialties(name), location:locations(name)',
    )
    .returns<DoctorRow[]>();

  if (error) throw error;
  return (data ?? []).map(doctorFromRow);
}
