import { type Doctor } from '../types';
import { requireSupabase } from '../lib/supabase';
import { doctorFromRow, type DoctorRow } from './mappers';
import { getDoctorPublicProfiles } from './doctorPublicProfiles';

/**
 * Corpo clínico (tabela `doctors` + `profiles` + `specialties`).
 * A leitura é pública para usuários autenticados através de `doctors_select`
 * e da view restrita `doctor_public_profiles`.
 *
 * Cadastrar um novo profissional exige criar um usuário no Supabase Auth,
 * o que só pode ser feito com a service-role key (backend). Por isso não há
 * `createDoctor` aqui — ver docs/FRONTEND.md.
 */
export async function listDoctors(): Promise<Doctor[]> {
  const { data, error } = await requireSupabase()
    .from('doctors')
    .select(
      'id, crm, bio, consultation_price, specialty:specialties(name), location:locations(name)',
    )
    .returns<DoctorRow[]>();

  if (error) throw error;
  const profiles = await getDoctorPublicProfiles();
  return (data ?? []).map((row) =>
    doctorFromRow({ ...row, profile: profiles.get(row.id) ?? null }),
  );
}
