-- ============================================================================
-- KAUKAMED — Migration 002: agendamento real (Entrega 5 / versão 1)
-- ----------------------------------------------------------------------------
-- O que esta migration faz
--   1. Completa o RLS que faltava: doctor_specialties, doctor_schedules e audit_logs.
--   2. Endurece os perfis: só o ADMIN altera `role` e `is_active`; o CPF é
--      normalizado no cadastro; o dentista enxerga o perfil dos seus pacientes.
--   3. Fecha a escrita direta em `appointments`: criar, remarcar e mudar o status
--      passam pelas funções (RPC) abaixo, que validam papel, horário, convênio,
--      preço e transição de status. O cliente nunca define preço/status/médico.
--   4. Cria as RPCs consumidas pelo front-end:
--        list_doctors · get_available_days · get_available_slots
--        book_appointment · reschedule_appointment · set_appointment_status
--        list_appointments · list_patients · list_patient_insurances
--
-- Pré-requisitos (nesta ordem): db/kaukamed_schema.sql e
--   db/migrations/001_frontend_support.sql.
-- Idempotente: pode ser executada mais de uma vez.
-- Fuso da clínica: America/Sao_Paulo — as colunas seguem em timestamptz (UTC) e
--   a grade de horários (doctor_schedules) é interpretada no fuso da clínica.
-- Mensagens de erro em pt-BR: o front-end as exibe diretamente ao usuário.
--
-- Como aplicar no Supabase: SQL Editor > New query > colar > Run.
-- Testes: db/tests/002_agendamento.test.sql (ver db/README.md).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Regras da clínica (constantes em funções, fáceis de ajustar)
-- ----------------------------------------------------------------------------
create or replace function public.clinic_timezone()
returns text
language sql
immutable
set search_path = public
as $$ select 'America/Sao_Paulo'::text $$;

-- Antecedência mínima para o PACIENTE cancelar/remarcar pelo portal.
-- A recepção (EMPLOYEE/ADMIN) não tem essa restrição.
create or replace function public.patient_change_min_notice()
returns interval
language sql
immutable
set search_path = public
as $$ select interval '2 hours' $$;

-- "123.456.789-09" / "12345678909" -> "123.456.789-09"; qualquer outra coisa -> null
create or replace function public.normalize_cpf(p_cpf text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when length(regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g')) = 11
      then regexp_replace(
             regexp_replace(p_cpf, '\D', '', 'g'),
             '^(\d{3})(\d{3})(\d{3})(\d{2})$', '\1.\2.\3-\4')
    else null
  end
$$;

-- ----------------------------------------------------------------------------
-- 2. Quem cancelou a consulta (auditoria simples)
-- ----------------------------------------------------------------------------
alter table public.appointments
  add column if not exists cancelled_by uuid references public.profiles (id) on delete set null;

-- ----------------------------------------------------------------------------
-- 3. RLS das tabelas que ainda estavam abertas
-- ----------------------------------------------------------------------------
alter table public.doctor_specialties enable row level security;
alter table public.doctor_schedules   enable row level security;
alter table public.audit_logs         enable row level security;

drop policy if exists doctor_specialties_select on public.doctor_specialties;
create policy doctor_specialties_select on public.doctor_specialties
  for select to authenticated using (true);
drop policy if exists doctor_specialties_modify on public.doctor_specialties;
create policy doctor_specialties_modify on public.doctor_specialties
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists doctor_schedules_select on public.doctor_schedules;
create policy doctor_schedules_select on public.doctor_schedules
  for select to authenticated using (true);
drop policy if exists doctor_schedules_modify on public.doctor_schedules;
create policy doctor_schedules_modify on public.doctor_schedules
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- A trilha de auditoria só pode ser lida pelo ADMIN. Não há policy de escrita:
-- apenas funções SECURITY DEFINER / service_role gravam nela.
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select to authenticated using (public.current_user_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- 4. Perfis
-- ----------------------------------------------------------------------------

-- 4.1 Só o ADMIN muda papel / ativação (antes, qualquer EMPLOYEE podia promover
--     alguém a ADMIN). service_role e o SQL Editor (auth.uid() nulo) continuam livres.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and public.current_user_role() is distinct from 'ADMIN' then
    if new.role is distinct from old.role then
      raise exception 'Somente o administrador pode alterar o papel de um usuário.'
        using errcode = '42501';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'Somente o administrador pode ativar ou desativar um usuário.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_role_guard on public.profiles;
drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_update();

drop function if exists public.guard_profile_role_update();

-- 4.2 O dentista lê o perfil (nome, CPF, telefone) dos pacientes que ele atende.
drop policy if exists profiles_select_my_patients on public.profiles;
create policy profiles_select_my_patients on public.profiles
  for select to authenticated
  using (
    role = 'PATIENT'
    and exists (
      select 1 from public.appointments a
      where a.patient_id = profiles.id and a.doctor_id = auth.uid()
    )
  );

-- 4.3 Cadastro (trigger em auth.users): o papel é SEMPRE 'PATIENT' — nunca vem
--     dos metadados enviados pelo cliente — e o CPF é gravado normalizado.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, cpf, phone)
  values (
    new.id,
    'PATIENT',
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    new.email,
    public.normalize_cpf(new.raw_user_meta_data ->> 'cpf'),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  insert into public.patients (id) values (new.id)
  on conflict (id) do nothing;

  return new;
end $$;

-- A view da migration 001 é substituída pela RPC list_doctors (abaixo).
drop view if exists public.doctor_public_profiles;

-- ----------------------------------------------------------------------------
-- 5. Consultas: escrita somente via RPC
-- ----------------------------------------------------------------------------
drop policy if exists appointments_insert on public.appointments;
drop policy if exists appointments_update on public.appointments;
drop policy if exists appointments_update_patient on public.appointments;
drop trigger if exists trg_appointments_patient_guard on public.appointments;
drop function if exists public.guard_patient_appointment_update();

-- Cinto e suspensório: mesmo que alguém crie uma policy permissiva por engano,
-- os papéis da API não têm privilégio de escrita direta.
revoke insert, update, delete on public.appointments from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. Grade de horários
-- ----------------------------------------------------------------------------

-- Interna (não exposta na API): gera os slots de um dia a partir de doctor_schedules.
-- weekday: 0 = domingo … 6 = sábado (mesma convenção de EXTRACT(dow)).
create or replace function public._doctor_slots(p_doctor_id uuid, p_date date)
returns table (slot_start timestamptz, slot_end timestamptz)
language sql
stable
set search_path = public
as $$
  select
    (p_date + s.start_time + make_interval(mins => g.n * s.slot_minutes))
      at time zone public.clinic_timezone(),
    (p_date + s.start_time + make_interval(mins => (g.n + 1) * s.slot_minutes))
      at time zone public.clinic_timezone()
  from public.doctor_schedules s
  cross join lateral generate_series(
    0,
    floor(extract(epoch from (s.end_time - s.start_time)) / 60 / s.slot_minutes)::int - 1
  ) as g(n)
  where s.doctor_id = p_doctor_id
    and s.is_active
    and s.weekday = extract(dow from p_date)::smallint
$$;

-- Horários futuros do dia (data no fuso da clínica), marcando os já ocupados.
create or replace function public.get_available_slots(p_doctor_id uuid, p_date date)
returns table (slot_start timestamptz, slot_end timestamptz, available boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    sl.slot_start,
    sl.slot_end,
    not exists (
      select 1 from public.appointments a
      where a.doctor_id = p_doctor_id
        and a.status in ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')
        and a.scheduled_start < sl.slot_end
        and a.scheduled_end   > sl.slot_start
    ) as available
  from public._doctor_slots(p_doctor_id, p_date) sl
  join public.doctors  d  on d.id  = p_doctor_id
  join public.profiles dp on dp.id = d.id and dp.is_active
  where auth.uid() is not null
    and sl.slot_start > now()
  order by sl.slot_start
$$;

-- Resumo por dia (para o seletor de datas): quantos horários existem e quantos estão livres.
create or replace function public.get_available_days(
  p_doctor_id uuid,
  p_from      date    default null,
  p_days      integer default 21
)
returns table (day date, total_slots integer, free_slots integer)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select
      coalesce(p_from, (now() at time zone public.clinic_timezone())::date) as d0,
      least(greatest(coalesce(p_days, 21), 1), 90) as n
  ),
  days as (
    select (b.d0 + g.i) as day
    from bounds b
    cross join lateral generate_series(0, b.n - 1) as g(i)
  )
  select
    d.day,
    count(*)::int,
    (count(*) filter (where s.available))::int
  from days d
  cross join lateral public.get_available_slots(p_doctor_id, d.day) s
  where auth.uid() is not null
  group by d.day
  order by d.day
$$;

-- ----------------------------------------------------------------------------
-- 7. Profissionais
-- ----------------------------------------------------------------------------
create or replace function public.list_doctors()
returns table (
  id                 uuid,
  full_name          text,
  crm                text,
  bio                text,
  consultation_price numeric,
  specialty_id       uuid,
  specialty_name     text,
  specialty_ids      uuid[],
  specialties        text[],
  location_id        uuid,
  location_name      text,
  location_address   text,
  is_active          boolean,
  weekdays           smallint[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    p.full_name,
    d.crm::text,
    d.bio,
    d.consultation_price,
    d.specialty_id,
    s.name,
    -- especialidade principal primeiro, depois as extras (doctor_specialties)
    array(
      select sp.id from public.specialties sp
      where sp.id = d.specialty_id
         or sp.id in (select ds.specialty_id from public.doctor_specialties ds where ds.doctor_id = d.id)
      order by (sp.id = d.specialty_id) desc, sp.name
    ),
    array(
      select sp.name from public.specialties sp
      where sp.id = d.specialty_id
         or sp.id in (select ds.specialty_id from public.doctor_specialties ds where ds.doctor_id = d.id)
      order by (sp.id = d.specialty_id) desc, sp.name
    ),
    d.location_id,
    l.name,
    case when l.id is null then null else l.address || ' — ' || l.city || '/' || l.state end,
    p.is_active,
    array(
      select sc.weekday from public.doctor_schedules sc
      where sc.doctor_id = d.id and sc.is_active
      order by sc.weekday
    )
  from public.doctors d
  join public.profiles    p on p.id = d.id
  join public.specialties s on s.id = d.specialty_id
  left join public.locations l on l.id = d.location_id
  where auth.uid() is not null
    and (p.is_active or public.is_staff())
  order by p.full_name
$$;

-- ----------------------------------------------------------------------------
-- 8. Agendar
-- ----------------------------------------------------------------------------
-- PATIENT agenda para si mesmo; EMPLOYEE/ADMIN agendam para qualquer paciente
-- (p_patient_id obrigatório); DOCTOR não agenda. Preço, status, local e autor
-- são definidos aqui, nunca pelo cliente. Retorna o id da consulta criada.
create or replace function public.book_appointment(
  p_doctor_id    uuid,
  p_start        timestamptz,
  p_type         public.appointment_type default 'FIRST_VISIT',
  p_insurance_id uuid                    default null,
  p_notes        text                    default null,
  p_patient_id   uuid                    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_role       public.user_role;
  v_patient    uuid;
  v_doctor     public.doctors%rowtype;
  v_slot       record;
  v_id         uuid;
  v_constraint text;
begin
  if v_uid is null then
    raise exception 'Faça login para agendar uma consulta.' using errcode = '28000';
  end if;

  v_role := public.current_user_role();

  if v_role = 'PATIENT' then
    if p_patient_id is not null and p_patient_id <> v_uid then
      raise exception 'Você só pode agendar consultas para você mesmo.' using errcode = '42501';
    end if;
    v_patient := v_uid;
  elsif v_role in ('EMPLOYEE', 'ADMIN') then
    if p_patient_id is null then
      raise exception 'Informe o paciente da consulta.' using errcode = '22023';
    end if;
    v_patient := p_patient_id;
  else
    raise exception 'Seu perfil não pode criar agendamentos.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.patients pt
    join public.profiles pr on pr.id = pt.id
    where pt.id = v_patient and pr.role = 'PATIENT' and pr.is_active
  ) then
    raise exception 'Paciente não encontrado ou inativo.' using errcode = '22023';
  end if;

  select d.* into v_doctor
  from public.doctors d
  join public.profiles dp on dp.id = d.id and dp.is_active
  where d.id = p_doctor_id;
  if not found then
    raise exception 'Profissional não encontrado ou inativo.' using errcode = '22023';
  end if;

  if p_start is null or p_start <= now() then
    raise exception 'Escolha um horário futuro.' using errcode = '22023';
  end if;
  if p_start > now() + interval '180 days' then
    raise exception 'Só é possível agendar com até 180 dias de antecedência.' using errcode = '22023';
  end if;

  -- O horário precisa existir na grade do profissional (no fuso da clínica).
  select * into v_slot
  from public._doctor_slots(p_doctor_id, (p_start at time zone public.clinic_timezone())::date) s
  where s.slot_start = p_start;
  if not found then
    raise exception 'Este horário não faz parte da agenda do profissional.' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.appointments a
    where a.doctor_id = p_doctor_id
      and a.status in ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')
      and a.scheduled_start < v_slot.slot_end
      and a.scheduled_end   > v_slot.slot_start
  ) then
    raise exception 'Este horário acabou de ser reservado. Escolha outro horário.'
      using errcode = '23505';
  end if;

  if p_insurance_id is not null and not exists (
    select 1 from public.patient_insurances pi
    where pi.id = p_insurance_id
      and pi.patient_id = v_patient
      and pi.status = 'ACTIVE'
      and (pi.valid_until is null
           or pi.valid_until >= (now() at time zone public.clinic_timezone())::date)
  ) then
    raise exception 'Convênio inválido, vencido ou não pertence ao paciente.' using errcode = '22023';
  end if;

  begin
    insert into public.appointments (
      patient_id, doctor_id, location_id, insurance_id, type, status,
      scheduled_start, scheduled_end, price, notes, created_by
    )
    values (
      v_patient, p_doctor_id, v_doctor.location_id, p_insurance_id,
      coalesce(p_type, 'FIRST_VISIT'), 'SCHEDULED',
      v_slot.slot_start, v_slot.slot_end, v_doctor.consultation_price,
      nullif(left(trim(coalesce(p_notes, '')), 500), ''), v_uid
    )
    returning id into v_id;
  exception when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'uq_patient_schedule_overlap' then
      raise exception 'O paciente já tem outra consulta marcada neste mesmo horário.'
        using errcode = '23505';
    end if;
    raise exception 'Este horário acabou de ser reservado. Escolha outro horário.'
      using errcode = '23505';
  end;

  return v_id;
end $$;

-- ----------------------------------------------------------------------------
-- 9. Remarcar
-- ----------------------------------------------------------------------------
-- O paciente remarca a própria consulta (com antecedência mínima); a recepção
-- (EMPLOYEE/ADMIN) remarca qualquer uma. A consulta volta para SCHEDULED.
create or replace function public.reschedule_appointment(
  p_id        uuid,
  p_new_start timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_role       public.user_role;
  a            public.appointments%rowtype;
  v_slot       record;
  v_constraint text;
begin
  if v_uid is null then
    raise exception 'Faça login para remarcar uma consulta.' using errcode = '28000';
  end if;
  v_role := public.current_user_role();

  select * into a from public.appointments where id = p_id for update;
  if not found
     or not (
       (a.patient_id = v_uid and v_role = 'PATIENT')
       or v_role in ('EMPLOYEE', 'ADMIN')
     )
  then
    raise exception 'Consulta não encontrada.' using errcode = 'P0002';
  end if;

  if a.status not in ('SCHEDULED', 'CONFIRMED') then
    raise exception 'Só é possível remarcar consultas agendadas ou confirmadas.'
      using errcode = '22023';
  end if;

  if v_role = 'PATIENT' and a.scheduled_start - now() < public.patient_change_min_notice() then
    raise exception 'A remarcação pelo portal exige pelo menos % hora(s) de antecedência. Fale com a clínica.',
      (extract(epoch from public.patient_change_min_notice()) / 3600)::int
      using errcode = '42501';
  end if;

  if p_new_start is null or p_new_start <= now() then
    raise exception 'Escolha um horário futuro.' using errcode = '22023';
  end if;
  if p_new_start = a.scheduled_start then
    raise exception 'Escolha um horário diferente do atual.' using errcode = '22023';
  end if;

  select * into v_slot
  from public._doctor_slots(a.doctor_id, (p_new_start at time zone public.clinic_timezone())::date) s
  where s.slot_start = p_new_start;
  if not found then
    raise exception 'Este horário não faz parte da agenda do profissional.' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.appointments o
    where o.doctor_id = a.doctor_id
      and o.id <> a.id
      and o.status in ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')
      and o.scheduled_start < v_slot.slot_end
      and o.scheduled_end   > v_slot.slot_start
  ) then
    raise exception 'Este horário acabou de ser reservado. Escolha outro horário.'
      using errcode = '23505';
  end if;

  begin
    update public.appointments
       set scheduled_start = v_slot.slot_start,
           scheduled_end   = v_slot.slot_end,
           status          = 'SCHEDULED',
           confirmed_at    = null
     where id = a.id;
  exception when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint = 'uq_patient_schedule_overlap' then
      raise exception 'O paciente já tem outra consulta marcada neste mesmo horário.'
        using errcode = '23505';
    end if;
    raise exception 'Este horário acabou de ser reservado. Escolha outro horário.'
      using errcode = '23505';
  end;
end $$;

-- ----------------------------------------------------------------------------
-- 10. Mudança de status (máquina de estados + permissões por papel)
-- ----------------------------------------------------------------------------
-- Grafo de transições — espelha APPOINTMENT_STATUS_TRANSITIONS (packages/shared):
--   SCHEDULED   → CONFIRMED | CANCELLED | NO_SHOW
--   CONFIRMED   → IN_PROGRESS | CANCELLED | NO_SHOW
--   IN_PROGRESS → COMPLETED | CANCELLED
-- Quem pode (além do ADMIN, que pode tudo o que o grafo permite):
--   CONFIRMED            paciente (própria) · EMPLOYEE
--   IN_PROGRESS/COMPLETED dentista responsável
--   CANCELLED            paciente (própria, SCHEDULED/CONFIRMED, com antecedência mínima)
--                        · EMPLOYEE (motivo obrigatório)
--   NO_SHOW              EMPLOYEE
create or replace function public.set_appointment_status(
  p_id     uuid,
  p_status public.appointment_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_role       public.user_role;
  a            public.appointments%rowtype;
  v_is_patient boolean;
  v_is_doctor  boolean;
  v_reason     text := nullif(trim(coalesce(p_reason, '')), '');
begin
  if v_uid is null then
    raise exception 'Faça login para alterar a consulta.' using errcode = '28000';
  end if;
  v_role := public.current_user_role();

  select * into a from public.appointments where id = p_id for update;
  v_is_patient := found and a.patient_id = v_uid and v_role = 'PATIENT';
  v_is_doctor  := found and a.doctor_id  = v_uid and v_role = 'DOCTOR';

  -- mesma visibilidade do SELECT: quem não enxerga a consulta não descobre que ela existe
  if not found or not (v_is_patient or v_is_doctor or v_role in ('EMPLOYEE', 'ADMIN')) then
    raise exception 'Consulta não encontrada.' using errcode = 'P0002';
  end if;

  if not (
       (a.status = 'SCHEDULED'   and p_status in ('CONFIRMED', 'CANCELLED', 'NO_SHOW'))
    or (a.status = 'CONFIRMED'   and p_status in ('IN_PROGRESS', 'CANCELLED', 'NO_SHOW'))
    or (a.status = 'IN_PROGRESS' and p_status in ('COMPLETED', 'CANCELLED'))
  ) then
    raise exception 'Transição inválida: % → %.', a.status, p_status using errcode = '22023';
  end if;

  if p_status = 'CONFIRMED' then
    if not (v_is_patient or v_role in ('EMPLOYEE', 'ADMIN')) then
      raise exception 'Seu perfil não pode confirmar esta consulta.' using errcode = '42501';
    end if;

  elsif p_status in ('IN_PROGRESS', 'COMPLETED') then
    if not (v_is_doctor or v_role = 'ADMIN') then
      raise exception 'Somente o dentista responsável pode iniciar ou concluir o atendimento.'
        using errcode = '42501';
    end if;

  elsif p_status = 'CANCELLED' then
    if v_is_patient then
      if a.status not in ('SCHEDULED', 'CONFIRMED') then
        raise exception 'Esta consulta não pode mais ser cancelada pelo portal.' using errcode = '42501';
      end if;
      if a.scheduled_start - now() < public.patient_change_min_notice() then
        raise exception 'O cancelamento pelo portal exige pelo menos % hora(s) de antecedência. Fale com a clínica.',
          (extract(epoch from public.patient_change_min_notice()) / 3600)::int
          using errcode = '42501';
      end if;
    elsif v_role in ('EMPLOYEE', 'ADMIN') then
      if v_reason is null then
        raise exception 'Informe o motivo do cancelamento.' using errcode = '22023';
      end if;
    else
      raise exception 'Seu perfil não pode cancelar esta consulta.' using errcode = '42501';
    end if;

  elsif p_status = 'NO_SHOW' then
    if v_role not in ('EMPLOYEE', 'ADMIN') then
      raise exception 'Somente a recepção pode registrar falta do paciente.' using errcode = '42501';
    end if;
  end if;

  update public.appointments
     set status        = p_status,
         confirmed_at  = case when p_status = 'CONFIRMED' then now() else confirmed_at end,
         completed_at  = case when p_status = 'COMPLETED' then now() else completed_at end,
         cancelled_at  = case when p_status = 'CANCELLED' then now() else cancelled_at end,
         cancel_reason = case when p_status = 'CANCELLED' then v_reason else cancel_reason end,
         cancelled_by  = case when p_status = 'CANCELLED' then v_uid else cancelled_by end
   where id = a.id;
end $$;

-- ----------------------------------------------------------------------------
-- 11. Listagens (linhas planas: nada de embed do PostgREST)
-- ----------------------------------------------------------------------------
-- Mesma visibilidade do RLS: paciente vê as suas, dentista as dele, staff todas.
create or replace function public.list_appointments(
  p_from      timestamptz               default null,
  p_to        timestamptz               default null,
  p_statuses  public.appointment_status[] default null,
  p_doctor_id uuid                      default null,
  p_patient_id uuid                     default null,
  p_search    text                      default null,
  p_limit     integer                   default 300
)
returns table (
  id               uuid,
  status           public.appointment_status,
  type             public.appointment_type,
  scheduled_start  timestamptz,
  scheduled_end    timestamptz,
  price            numeric,
  notes            text,
  cancel_reason    text,
  confirmed_at     timestamptz,
  completed_at     timestamptz,
  cancelled_at     timestamptz,
  created_at       timestamptz,
  patient_id       uuid,
  patient_name     text,
  patient_cpf      text,
  patient_phone    text,
  doctor_id        uuid,
  doctor_name      text,
  doctor_crm       text,
  specialty_name   text,
  location_id      uuid,
  location_name    text,
  location_address text,
  insurance_id     uuid,
  insurance_name   text,
  insurance_card   text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id, a.status, a.type, a.scheduled_start, a.scheduled_end, a.price, a.notes,
    a.cancel_reason, a.confirmed_at, a.completed_at, a.cancelled_at, a.created_at,
    a.patient_id, pp.full_name, pp.cpf::text, pp.phone::text,
    a.doctor_id, dp.full_name, d.crm::text, s.name,
    a.location_id, l.name,
    case when l.id is null then null else l.address || ' — ' || l.city || '/' || l.state end,
    a.insurance_id, hi.name, pi.card_number::text
  from public.appointments a
  join public.profiles    pp on pp.id = a.patient_id
  join public.doctors     d  on d.id  = a.doctor_id
  join public.profiles    dp on dp.id = d.id
  join public.specialties s  on s.id  = d.specialty_id
  left join public.locations          l  on l.id  = a.location_id
  left join public.patient_insurances pi on pi.id = a.insurance_id
  left join public.health_insurances  hi on hi.id = pi.insurance_id
  where auth.uid() is not null
    and (a.patient_id = auth.uid() or a.doctor_id = auth.uid() or public.is_staff())
    and (p_from       is null or a.scheduled_start >= p_from)
    and (p_to         is null or a.scheduled_start <  p_to)
    and (p_statuses   is null or a.status = any (p_statuses))
    and (p_doctor_id  is null or a.doctor_id  = p_doctor_id)
    and (p_patient_id is null or a.patient_id = p_patient_id)
    and (
      nullif(trim(coalesce(p_search, '')), '') is null
      or pp.full_name ilike '%' || trim(p_search) || '%'
      or dp.full_name ilike '%' || trim(p_search) || '%'
      or pp.cpf       ilike '%' || trim(p_search) || '%'
    )
  order by a.scheduled_start, a.id
  limit least(greatest(coalesce(p_limit, 300), 1), 1000)
$$;

-- Pacientes visíveis ao usuário: staff vê todos; dentista, só quem já agendou com ele.
create or replace function public.list_patients(
  p_search text    default null,
  p_limit  integer default 200
)
returns table (
  id                 uuid,
  full_name          text,
  cpf                text,
  phone              text,
  email              text,
  is_active          boolean,
  created_at         timestamptz,
  insurance_name     text,
  insurance_card     text,
  appointments_count integer,
  last_visit         timestamptz,
  next_visit         timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id, p.full_name, p.cpf::text, p.phone::text, p.email::text, p.is_active, p.created_at,
    ins.name, ins.card_number,
    coalesce(st.total, 0)::int, st.last_visit, st.next_visit
  from public.profiles p
  left join lateral (
    select hi.name, pi.card_number::text as card_number
    from public.patient_insurances pi
    join public.health_insurances hi on hi.id = pi.insurance_id
    where pi.patient_id = p.id and pi.status = 'ACTIVE'
    order by pi.created_at desc
    limit 1
  ) ins on true
  left join lateral (
    select
      count(*) as total,
      max(a.scheduled_start) filter (where a.status = 'COMPLETED') as last_visit,
      min(a.scheduled_start) filter (
        where a.status in ('SCHEDULED', 'CONFIRMED') and a.scheduled_start > now()
      ) as next_visit
    from public.appointments a
    where a.patient_id = p.id
      and (public.is_staff() or a.doctor_id = auth.uid())
  ) st on true
  where auth.uid() is not null
    and p.role = 'PATIENT'
    and (
      public.is_staff()
      or (
        public.current_user_role() = 'DOCTOR'
        and exists (
          select 1 from public.appointments a2
          where a2.patient_id = p.id and a2.doctor_id = auth.uid()
        )
      )
    )
    and (
      nullif(trim(coalesce(p_search, '')), '') is null
      or p.full_name ilike '%' || trim(p_search) || '%'
      or p.cpf       ilike '%' || trim(p_search) || '%'
      or p.email::text ilike '%' || trim(p_search) || '%'
    )
  order by p.full_name
  limit least(greatest(coalesce(p_limit, 200), 1), 1000)
$$;

-- Convênios do paciente logado (ou, para a recepção, do paciente informado).
create or replace function public.list_patient_insurances(p_patient_id uuid default null)
returns table (
  id             uuid,
  patient_id     uuid,
  insurance_id   uuid,
  insurance_name text,
  card_number    text,
  status         public.plan_coverage_status,
  valid_until    date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pi.id, pi.patient_id, pi.insurance_id, hi.name, pi.card_number::text, pi.status, pi.valid_until
  from public.patient_insurances pi
  join public.health_insurances hi on hi.id = pi.insurance_id
  where auth.uid() is not null
    and pi.patient_id = coalesce(p_patient_id, auth.uid())
    and (pi.patient_id = auth.uid() or public.is_staff())
  order by (pi.status = 'ACTIVE') desc, hi.name
$$;

-- ----------------------------------------------------------------------------
-- 12. Privilégios das funções
--     As RPCs só existem para usuários autenticados; as internas não são chamáveis
--     pela API. (No Supabase, funções novas nascem executáveis por anon/PUBLIC.)
-- ----------------------------------------------------------------------------
do $$
declare
  v_fn regprocedure;
begin
  for v_fn in
    select p.oid::regprocedure
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in (
        'list_doctors', 'get_available_days', 'get_available_slots',
        'book_appointment', 'reschedule_appointment', 'set_appointment_status',
        'list_appointments', 'list_patients', 'list_patient_insurances'
      )
  loop
    execute format('revoke all on function %s from public, anon', v_fn);
    execute format('grant execute on function %s to authenticated', v_fn);
  end loop;

  for v_fn in
    select p.oid::regprocedure
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname = '_doctor_slots'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', v_fn);
  end loop;
end $$;

-- Pede ao PostgREST (API do Supabase) que recarregue o cache de schema.
notify pgrst, 'reload schema';

-- Fim da migration 002 — KAUKAMED
