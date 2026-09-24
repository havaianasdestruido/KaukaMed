-- ============================================================================
-- KAUKAMED — Schema do Banco de Dados (PostgreSQL / Supabase)
-- Gerado em: 2026-09-24
-- Baseado na stack OdontoAura: PostgreSQL + Prisma ORM + Redis (cache externo)
-- ============================================================================
-- Como aplicar no Supabase:
--   1. SQL Editor > New query > colar este arquivo > Run
--   2. Ou: supabase db push (salvar como migration do Prisma/Supabase CLI)
-- ============================================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "citext";    -- e-mails case-insensitive

-- ============================================================================
-- 1. TIPOS ENUM
-- ============================================================================

create type user_role        as enum ('PATIENT', 'EMPLOYEE', 'DOCTOR', 'ADMIN');
create type appointment_status as enum ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
create type appointment_type   as enum ('FIRST_VISIT', 'FOLLOW_UP', 'RETURN', 'EMERGENCY', 'TELEMEDICINE');
create type plan_coverage_status as enum ('ACTIVE', 'SUSPENDED', 'EXPIRED');

-- ============================================================================
-- 2. FUNÇÕES AUXILIARES
-- ============================================================================

-- Atualiza updated_at automaticamente
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- 3. USUÁRIOS & PERFIS
--    Autenticação unificada: o login vive em auth.users (Supabase Auth).
--    Esta tabela é o "perfil" público estendido de cada usuário.
-- ============================================================================

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        user_role not null default 'PATIENT',
  full_name   text not null,
  cpf         varchar(14) unique,                    -- formato: 000.000.000-00
  phone       varchar(20),
  email       citext unique,
  birth_date  date,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Índice único parcial: um CPF só pode estar ativo uma vez
create unique index uq_profiles_cpf_active on profiles (cpf) where is_active;

-- ============================================================================
-- 4. ESPECIALIDADES & LOCAIS DE ATENDIMENTO
-- ============================================================================

create table specialties (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,                  -- ex: Cardiologia, Pediatria
  description text,
  created_at  timestamptz not null default now()
);

create table locations (                             -- unidades/consultórios da clínica
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text not null,
  city        text not null,
  state       char(2) not null,
  zip_code    varchar(9),
  phone       varchar(20),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 5. MÉDICOS
--    Estende profiles: apenas perfis com role = 'DOCTOR'
-- ============================================================================

create table doctors (
  id             uuid primary key references profiles (id) on delete cascade,
  crm            varchar(20) not null unique,        -- ex: 123456-SP
  specialty_id   uuid not null references specialties (id),
  location_id    uuid references locations (id),     -- unidade principal
  bio            text,
  consultation_price numeric(10,2) check (consultation_price >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Garantia de integridade: apenas perfis com role = 'DOCTOR' podem ser médicos
create or replace function check_doctor_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select role from profiles where id = new.id) is distinct from 'DOCTOR' then
    raise exception ' doctors: o perfil % não possui role DOCTOR', new.id;
  end if;
  return new;
end $$;

create trigger trg_doctor_role before insert or update on doctors
  for each row execute function check_doctor_role();

create trigger trg_doctors_updated before update on doctors
  for each row execute function set_updated_at();

-- Especialidades secundárias do médico (médico pode ter mais de uma)
create table doctor_specialties (
  doctor_id    uuid not null references doctors (id) on delete cascade,
  specialty_id uuid not null references specialties (id) on delete cascade,
  primary key (doctor_id, specialty_id)
);

-- Agenda do médico: dias/horários de atendimento (base para horários disponíveis)
create table doctor_schedules (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references doctors (id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6),  -- 0=domingo
  start_time  time not null,
  end_time    time not null check (end_time > start_time),
  slot_minutes smallint not null default 30 check (slot_minutes > 0),
  is_active   boolean not null default true,
  unique (doctor_id, weekday)
);

-- ============================================================================
-- 6. PACIENTES — dados específicos (estende profiles com role = 'PATIENT')
-- ============================================================================

create table patients (
  id           uuid primary key references profiles (id) on delete cascade,
  blood_type   varchar(3),                           -- ex: O+, A-
  allergies    text,                                 -- anamnese resumida / alergias
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_patients_updated before update on patients
  for each row execute function set_updated_at();

-- ============================================================================
-- 7. PLANOS DE SAÚDE & CONVÊNIOS
-- ============================================================================

create table health_insurances (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,                  -- ex: Unimed, Bradesco Saúde
  cnpj        varchar(18) unique,
  phone       varchar(20),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Carteirinha / vínculo do paciente com um convênio
create table patient_insurances (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients (id) on delete cascade,
  insurance_id uuid not null references health_insurances (id),
  card_number  varchar(50) not null,
  status       plan_coverage_status not null default 'ACTIVE',
  valid_until  date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (insurance_id, card_number)
);

create trigger trg_patient_insurances_updated before update on patient_insurances
  for each row execute function set_updated_at();

-- ============================================================================
-- 8. CONSULTAS & AGENDAMENTOS
--    Ciclo de vida: SCHEDULED -> CONFIRMED -> IN_PROGRESS -> COMPLETED
--                              \-> CANCELLED / NO_SHOW
-- ============================================================================

create table appointments (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references patients (id),
  doctor_id        uuid not null references doctors (id),
  location_id      uuid references locations (id),
  insurance_id     uuid references patient_insurances (id),  -- null = particular
  type             appointment_type not null default 'FOLLOW_UP',
  status           appointment_status not null default 'SCHEDULED',
  scheduled_start  timestamptz not null,
  scheduled_end    timestamptz not null check (scheduled_end > scheduled_start),
  confirmed_at     timestamptz,
  completed_at     timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  price            numeric(10,2) check (price >= 0),
  notes            text,                             -- observações de agendamento
  created_by       uuid references profiles (id),    -- quem criou (paciente, funcionário...)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger trg_appointments_updated before update on appointments
  for each row execute function set_updated_at();

-- Impede sobreposição de horários do MESMO médico
create unique index uq_doctor_schedule_overlap
  on appointments (doctor_id, scheduled_start)
  where status in ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS');

-- Impede sobreposição de horários do MESMO paciente
create unique index uq_patient_schedule_overlap
  on appointments (patient_id, scheduled_start)
  where status in ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS');

-- Buscas por data (agenda do dia do médico)
create index idx_appointments_doctor_date on appointments (doctor_id, scheduled_start);
create index idx_appointments_patient_date on appointments (patient_id, scheduled_start);
create index idx_appointments_status on appointments (status);

-- ============================================================================
-- 9. PRONTUÁRIOS ELETRÔNICOS (EHR)
--    1 consulta completada -> 1 prontuário (histórico clínico)
-- ============================================================================

create table medical_records (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references appointments (id),
  patient_id     uuid not null references patients (id),
  doctor_id      uuid not null references doctors (id),
  anamnesis      text,                               -- anamnese / queixa principal
  diagnosis      text,                               -- diagnóstico principal
  vital_signs    jsonb,                              -- pressão, temperatura, etc.
  attachments    jsonb,                              -- URLs de exames/anexos (Supabase Storage)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger trg_medical_records_updated before update on medical_records
  for each row execute function set_updated_at();

create index idx_medical_records_patient on medical_records (patient_id, created_at desc);

-- Diagnósticos secundários / CID-10
create table record_diagnoses (
  id         uuid primary key default gen_random_uuid(),
  record_id  uuid not null references medical_records (id) on delete cascade,
  cid_code   varchar(10),                            -- ex: I10 (Hipertensão)
  description text not null,
  is_primary boolean not null default false
);

-- Prescrições vinculadas ao prontuário
create table prescriptions (
  id           uuid primary key default gen_random_uuid(),
  record_id    uuid not null references medical_records (id) on delete cascade,
  medication   text not null,                        -- nome do medicamento
  dosage       text not null,                        -- ex: 500mg
  frequency    text not null,                        -- ex: 8/8h por 7 dias
  instructions text,
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- 10. AUDITORIA (quem acessou/alterou o quê — boa prática clínica/LGPD)
-- ============================================================================

create table audit_logs (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  record_id   uuid,
  action      text not null,                         -- INSERT / UPDATE / DELETE
  changed_by  uuid references profiles (id),
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_table on audit_logs (table_name, created_at desc);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) — integração com Supabase Auth
-- ============================================================================

alter table profiles            enable row level security;
alter table doctors             enable row level security;
alter table patients            enable row level security;
alter table appointments        enable row level security;
alter table medical_records     enable row level security;
alter table prescriptions       enable row level security;
alter table record_diagnoses    enable row level security;
alter table patient_insurances  enable row level security;

-- Função helper: papel do usuário autenticado
create or replace function current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- Helper: é admin ou funcionário?
create or replace function is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_user_role() in ('ADMIN', 'EMPLOYEE'), false);
$$;

-- profiles: usuário vê o próprio perfil; staff vê todos
create policy profiles_select on profiles for select
  using (id = auth.uid() or is_staff());
create policy profiles_update on profiles for update
  using (id = auth.uid() or is_staff());

-- appointments: paciente vê as próprias; médico vê as suas; staff vê tudo
create policy appointments_select on appointments for select
  using (
    patient_id = auth.uid()
    or doctor_id = auth.uid()
    or is_staff()
  );
create policy appointments_insert on appointments for insert
  with check (
    (patient_id = auth.uid() and current_user_role() = 'PATIENT')
    or is_staff()
  );
create policy appointments_update on appointments for update
  using (
    doctor_id = auth.uid()
    or is_staff()
  );

-- medical_records: só o médico dono, o próprio paciente e staff
create policy medical_records_select on medical_records for select
  using (patient_id = auth.uid() or doctor_id = auth.uid() or is_staff());
create policy medical_records_insert on medical_records for insert
  with check (doctor_id = auth.uid() or is_staff());
create policy medical_records_update on medical_records for update
  using (doctor_id = auth.uid() or is_staff());

-- prescriptions / record_diagnoses: herdam via medical_records
create policy prescriptions_select on prescriptions for select
  using (exists (
    select 1 from medical_records mr
    where mr.id = record_id
      and (mr.patient_id = auth.uid() or mr.doctor_id = auth.uid() or is_staff())
  ));

-- patient_insurances: paciente vê o próprio; staff gerencia
create policy patient_insurances_select on patient_insurances for select
  using (patient_id = auth.uid() or is_staff());
create policy patient_insurances_modify on patient_insurances for all
  using (is_staff());

-- doctors / patients: leitura pública básica para agendamento; staff gerencia
create policy doctors_select on doctors for select using (true);
create policy patients_select on patients for select
  using (id = auth.uid() or is_staff());

-- ============================================================================
-- 12. DADOS INICIAIS (SEED)
-- ============================================================================

insert into specialties (name, description) values
  ('Clínica Geral',      'Avaliação e acompanhamento geral'),
  ('Pediatria',          'Saúde de crianças e adolescentes'),
  ('Cardiologia',        'Doenças do coração e sistema circulatório'),
  ('Dermatologia',       'Doenças de pele, cabelo e unhas'),
  ('Ortopedia',          'Doenças do aparelho locomotor'),
  ('Ginecologia',        'Saúde da mulher'),
  ('Oftalmologia',       'Saúde dos olhos')
on conflict (name) do nothing;

-- Fim do schema — KAUKAMED
