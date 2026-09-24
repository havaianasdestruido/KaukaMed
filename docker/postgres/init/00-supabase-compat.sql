-- ============================================================================
-- KAUKAMED — Camada de compatibilidade com o Supabase (ambiente local)
-- ----------------------------------------------------------------------------
-- O schema do KaukaMed (db/kaukamed_schema.sql) foi escrito para o Supabase e
-- depende de objetos que só existem lá: a tabela `auth.users`, as funções
-- `auth.uid()`/`auth.jwt()` e os papéis `anon`, `authenticated` e `service_role`.
--
-- Este arquivo reproduz o mínimo necessário desses objetos para que o schema
-- rode em um PostgreSQL "puro" (Docker Compose de desenvolvimento) e para que as
-- políticas de RLS possam ser testadas localmente.
--
-- ⚠️ Não é usado em produção: no Supabase esses objetos já existem nativamente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PAPÉIS (equivalem aos papéis padrão do Supabase)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- 2. SCHEMA `auth` COM A TABELA DE USUÁRIOS
--    No Supabase, `auth.users` guarda apenas as credenciais; os dados de perfil
--    ficam em `public.profiles` (ver db/kaukamed_schema.sql).
-- ----------------------------------------------------------------------------
create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table auth.users is
  'Compatibilidade local com o Supabase Auth — usado apenas em desenvolvimento.';

-- ----------------------------------------------------------------------------
-- 3. FUNÇÕES DE AUTENTICAÇÃO USADAS PELAS POLÍTICAS DE RLS
--    As claims do JWT são lidas das variáveis de sessão
--    `request.jwt.claims` / `request.jwt.claim.sub` (mesmo comportamento do Supabase).
-- ----------------------------------------------------------------------------
create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(auth.jwt() ->> 'sub', '')
  )::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(auth.jwt() ->> 'role', '')
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. PERMISSÕES BÁSICAS
--    Espelham o comportamento do Supabase: os papéis recebem privilégios de
--    tabela no schema `public` e é o RLS (as policies do schema) que controla
--    quais linhas cada usuário enxerga. `service_role` ignora o RLS.
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to authenticated, service_role;

grant execute on function auth.jwt() to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant execute on function auth.role() to anon, authenticated, service_role;

-- Vale para as tabelas futuras (as do schema do KaukaMed, criadas na sequência)...
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;

-- ...e também garante os privilégios caso este script rode novamente depois.
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Fim da camada de compatibilidade — KAUKAMED
