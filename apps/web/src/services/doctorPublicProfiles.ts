import { requireSupabase } from '../lib/supabase';

interface DoctorPublicProfile {
  id: string;
  full_name: string;
  is_active: boolean;
}

/** Only the columns exposed by migration 001 are available to patients. */
export async function getDoctorPublicProfiles(): Promise<Map<string, DoctorPublicProfile>> {
  const { data, error } = await requireSupabase()
    .from('doctor_public_profiles')
    .select('id, full_name, is_active')
    .returns<DoctorPublicProfile[]>();
  if (error) throw error;
  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}
