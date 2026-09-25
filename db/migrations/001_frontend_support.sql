-- ============================================================================
-- KAUKAMED — Migration 001: suporte ao front-end (apps/web)
-- Aplicar DEPOIS de db/kaukamed_schema.sql (Supabase > SQL Editor > Run).
-- É idempotente: pode ser executada mais de uma vez.
--
-- O schema base não permite que o front-end, usando só a anon key + RLS:
--   1. crie o perfil do usuário no cadastro (não há policy de INSERT em profiles);
--   2. mostre o nome dos médicos ao paciente (profiles só é visível ao dono/staff);
--   3. deixe o paciente cancelar/reagendar a própria consulta.
-- Esta migration resolve esses três pontos.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Perfil criado automaticamente a partir do Supabase Auth
--    O front chama supabase.auth.signUp({ options: { data: { full_name, cpf, phone } } })
--    e este trigger cria profiles (role PATIENT) + patients.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, email, cpf, phone)
  values (
    new.id,
    'PATIENT',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'cpf', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;

  insert into public.patients (id) values (new.id)
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. Perfis de médicos visíveis para qualquer usuário autenticado
--    (necessário para listar o corpo clínico e exibir o médico da consulta)
-- ----------------------------------------------------------------------------
drop policy if exists profiles_select_doctors on profiles;
create policy profiles_select_doctors on profiles for select
  to authenticated
  using (role = 'DOCTOR');

-- ----------------------------------------------------------------------------
-- 3. Paciente pode atualizar (cancelar/reagendar) as próprias consultas
--    ainda não finalizadas
-- ----------------------------------------------------------------------------
drop policy if exists appointments_update_patient on appointments;
create policy appointments_update_patient on appointments for update
  to authenticated
  using (patient_id = auth.uid() and status in ('SCHEDULED', 'CONFIRMED'))
  with check (patient_id = auth.uid() and status in ('SCHEDULED', 'CONFIRMED', 'CANCELLED'));

-- ----------------------------------------------------------------------------
-- 4. Catálogos com leitura pública e escrita só para staff
--    (specialties / locations / health_insurances não tinham RLS)
-- ----------------------------------------------------------------------------
alter table specialties       enable row level security;
alter table locations         enable row level security;
alter table health_insurances enable row level security;

drop policy if exists specialties_select on specialties;
create policy specialties_select on specialties for select using (true);
drop policy if exists specialties_modify on specialties;
create policy specialties_modify on specialties for all using (is_staff()) with check (is_staff());

drop policy if exists locations_select on locations;
create policy locations_select on locations for select using (true);
drop policy if exists locations_modify on locations;
create policy locations_modify on locations for all using (is_staff()) with check (is_staff());

drop policy if exists health_insurances_select on health_insurances;
create policy health_insurances_select on health_insurances for select using (true);
drop policy if exists health_insurances_modify on health_insurances;
create policy health_insurances_modify on health_insurances for all
  using (is_staff()) with check (is_staff());

-- ----------------------------------------------------------------------------
-- 5. Seeds mínimos para a demonstração (unidade + convênios odontológicos)
-- ----------------------------------------------------------------------------
insert into specialties (name, description) values
  ('Ortodontia',   'Correção da posição dos dentes e arcadas'),
  ('Endodontia',   'Tratamento de canal'),
  ('Implantodontia','Implantes dentários'),
  ('Periodontia',  'Tratamento da gengiva e tecidos de suporte'),
  ('Odontopediatria','Odontologia infantil')
on conflict (name) do nothing;

insert into health_insurances (name) values
  ('Unimed Odonto'), ('Amil Dental'), ('Bradesco Dental'), ('SulAmérica Odonto')
on conflict (name) do nothing;

insert into locations (name, address, city, state)
select 'OdontoAura Unidade Jardins', 'Av. Paulista, 1578', 'São Paulo', 'SP'
where not exists (select 1 from locations where name = 'OdontoAura Unidade Jardins');

-- ----------------------------------------------------------------------------
-- COMO PROMOVER UM USUÁRIO A DENTISTA / ADMIN (rodar no SQL Editor):
--
--   -- 1) crie o usuário pelo cadastro do app ou em Authentication > Users
--   -- 2) promova a dentista:
--   update profiles set role = 'DOCTOR' where email = 'dentista@odontoaura.com.br';
--   insert into doctors (id, crm, specialty_id, location_id, consultation_price)
--   select p.id, 'CRO-SP 00000',
--          (select id from specialties where name = 'Ortodontia'),
--          (select id from locations  where name = 'OdontoAura Unidade Jardins'),
--          250
--   from profiles p where p.email = 'dentista@odontoaura.com.br';
--
--   -- 3) promova a administrador:
--   update profiles set role = 'ADMIN' where email = 'admin@odontoaura.com.br';
-- ----------------------------------------------------------------------------
