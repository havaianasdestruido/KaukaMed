-- ============================================================================
-- KAUKAMED — Testes da migration 002 (RLS + RPCs de agendamento)
-- ----------------------------------------------------------------------------
-- Rodar contra um banco DESCARTÁVEL já com schema + 001 + 002 aplicados
-- (o PostgreSQL do Docker Compose serve; ver db/README.md):
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/tests/002_agendamento.test.sql
--
-- Tudo acontece dentro de uma transação que termina em ROLLBACK — nada é gravado.
-- Cada asserção imprime "NOTICE: ok - ..."; a primeira que falhar aborta o script.
-- Os usuários de teste são criados em auth.users (usa a camada de compatibilidade
-- de docker/postgres/init/00-supabase-compat.sql) e "logados" com
-- SET ROLE authenticated + request.jwt.claims, exatamente como o PostgREST faz.
-- Os testes só olham para os dados que eles mesmos criam (nomes "T ...").
-- ============================================================================
begin;

-- ---------------------------------------------------------------------------
-- Ferramentas de teste
-- ---------------------------------------------------------------------------
create schema t;
grant usage on schema t to public;

-- "loga" como o usuário: papel authenticated + claims do JWT
create procedure t.login(p_email text)
language plpgsql as $$
declare v_id uuid;
begin
  reset role;
  select id into v_id from auth.users where email = p_email;
  if v_id is null then raise exception 'usuário de teste % não existe', p_email; end if;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated')::text, false);
  set role authenticated;
end $$;

create procedure t.anon()
language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, false);
  set role anon;
end $$;

-- volta a ser superusuário (sem claims)
create procedure t.su()
language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '', false);
end $$;

-- id de um usuário de teste (SECURITY DEFINER: os papéis da API não leem auth.users)
create function t.uid(p_email text) returns uuid
language sql stable security definer set search_path = public, auth
as $$ select id from auth.users where email = p_email $$;

create function t.ok(p_cond boolean, p_label text) returns void
language plpgsql as $$
begin
  if p_cond is not true then
    raise exception 'FALHOU - %', p_label;
  end if;
  raise notice 'ok - %', p_label;
end $$;

-- executa p_sql e exige que falhe com mensagem LIKE p_msg_like
create function t.fails(p_sql text, p_msg_like text, p_label text) returns void
language plpgsql as $$
declare v_msg text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_msg = message_text;
    if v_msg not like p_msg_like then
      raise exception 'FALHOU - %: erro inesperado "%" (esperado algo como "%")', p_label, v_msg, p_msg_like;
    end if;
    raise notice 'ok - % (erro: %)', p_label, v_msg;
    return;
  end;
  raise exception 'FALHOU - %: deveria ter falhado (esperado "%")', p_label, p_msg_like;
end $$;

-- a escrita é barrada: sem privilégio na tabela (Supabase novo) ou pela RLS (Supabase com
-- privilégios padrão). Os dois erros têm o mesmo SQLSTATE 42501 (insufficient_privilege).
create function t.blocked(p_sql text, p_label text) returns void
language plpgsql as $$
declare v_state text; v_msg text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate, v_msg = message_text;
    if v_state <> '42501' then
      raise exception 'FALHOU - %: erro inesperado % "%" (esperado 42501)', p_label, v_state, v_msg;
    end if;
    raise notice 'ok - % (erro: %)', p_label, v_msg;
    return;
  end;
  raise exception 'FALHOU - %: deveria ter sido barrado', p_label;
end $$;

-- a leitura da tabela não devolve linha nenhuma: ou a RLS filtra tudo (Supabase com
-- privilégios padrão) ou a tabela nem foi concedida ao papel (Supabase novo). Os dois protegem.
create function t.sees_nothing(p_table text, p_label text) returns void
language plpgsql as $$
declare v_n bigint;
begin
  begin
    execute format('select count(*) from %s', p_table) into v_n;
  exception when insufficient_privilege then
    raise notice 'ok - % (sem privilégio na tabela)', p_label;
    return;
  end;
  if v_n <> 0 then
    raise exception 'FALHOU - %: devolveu % linha(s)', p_label, v_n;
  end if;
  raise notice 'ok - % (RLS: 0 linhas)', p_label;
end $$;

-- amanhã às HH:MM no fuso da clínica
create function t.tomorrow_at(p_time time) returns timestamptz
language sql stable as $$
  select (((now() at time zone 'America/Sao_Paulo')::date + 1) + p_time) at time zone 'America/Sao_Paulo'
$$;

-- amanhã (data no fuso da clínica)
create function t.tomorrow() returns date
language sql stable as $$ select (now() at time zone 'America/Sao_Paulo')::date + 1 $$;

grant execute on all functions in schema t to public;
grant execute on all procedures in schema t to public;

-- ---------------------------------------------------------------------------
-- Fixtures (como superusuário)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  (gen_random_uuid(), 'adm@t.local',  '{"full_name":"T Admin"}'),
  (gen_random_uuid(), 'rec@t.local',  '{"full_name":"T Recepção"}'),
  (gen_random_uuid(), 'doc1@t.local', '{"full_name":"T Dentista Um"}'),
  (gen_random_uuid(), 'doc2@t.local', '{"full_name":"T Dentista Dois"}'),
  (gen_random_uuid(), 'doc3@t.local', '{"full_name":"T Dentista Inativo"}'),
  (gen_random_uuid(), 'pat1@t.local', '{"full_name":"T Paciente Um","cpf":"39053344705","phone":"(11) 90000-0001"}'),
  (gen_random_uuid(), 'pat2@t.local', '{"full_name":"T Paciente Dois","role":"ADMIN"}'),
  (gen_random_uuid(), 'pat3@t.local', '{"full_name":"T Paciente Três","cpf":"123"}');

update public.profiles set role = 'ADMIN'    where email = 'adm@t.local';
update public.profiles set role = 'EMPLOYEE' where email = 'rec@t.local';
update public.profiles set role = 'DOCTOR'   where email in ('doc1@t.local', 'doc2@t.local', 'doc3@t.local');
update public.profiles set is_active = false where email = 'doc3@t.local';
delete from public.patients where id in (select id from public.profiles where role <> 'PATIENT');

insert into public.specialties (name) values ('T-Especialidade');
insert into public.locations (name, address, city, state) values ('T-Unidade', 'Rua Teste, 1', 'São Paulo', 'SP');

insert into public.doctors (id, crm, specialty_id, location_id, consultation_price)
select p.id, x.crm, (select id from public.specialties where name = 'T-Especialidade'),
       (select id from public.locations where name = 'T-Unidade'), x.price
from (values ('doc1@t.local', 'T-CRO-1', 200.00), ('doc2@t.local', 'T-CRO-2', 300.00), ('doc3@t.local', 'T-CRO-3', 100.00))
  as x(email, crm, price)
join public.profiles p on p.email = x.email;

-- todos os dias, 08:00–10:00: doc1 e doc3 com consultas de 30 min (4 horários); doc2 de 60 min (2 horários)
insert into public.doctor_schedules (doctor_id, weekday, start_time, end_time, slot_minutes)
select p.id, w, time '08:00', time '10:00', x.mins
from (values ('doc1@t.local', 30), ('doc2@t.local', 60), ('doc3@t.local', 30)) as x(email, mins)
join public.profiles p on p.email = x.email
cross join generate_series(0, 6) as w;

insert into public.health_insurances (name) values ('T-Plano');
insert into public.patient_insurances (patient_id, insurance_id, card_number, status, valid_until)
select t.uid('pat1@t.local'), (select id from public.health_insurances where name = 'T-Plano'), 'T-CARD-ATIVO',   'ACTIVE'::public.plan_coverage_status,  current_date + 30
union all
select t.uid('pat1@t.local'), (select id from public.health_insurances where name = 'T-Plano'), 'T-CARD-VENCIDO', 'EXPIRED'::public.plan_coverage_status, current_date - 30;

insert into public.audit_logs (table_name, action) values ('t', 'TESTE');

-- ---------------------------------------------------------------------------
-- 1. Cadastro (trigger em auth.users)
-- ---------------------------------------------------------------------------
do $$
begin
  perform t.ok((select role from public.profiles where email = 'pat2@t.local') = 'PATIENT',
    'cadastro ignora a role enviada nos metadados (sempre PATIENT)');
  perform t.ok((select cpf from public.profiles where email = 'pat1@t.local') = '390.533.447-05',
    'CPF é gravado normalizado (000.000.000-00)');
  perform t.ok((select cpf from public.profiles where email = 'pat3@t.local') is null,
    'CPF inválido vira NULL em vez de quebrar o cadastro');
  perform t.ok(exists (select 1 from public.patients where id = t.uid('pat1@t.local')),
    'cadastro cria a linha em patients');
end $$;

-- ---------------------------------------------------------------------------
-- 2. Anônimo não acessa nada sensível
-- ---------------------------------------------------------------------------
call t.anon();
do $$
begin
  perform t.sees_nothing('public.appointments', 'anon não lê appointments');
  perform t.sees_nothing('public.profiles', 'anon não lê profiles');
  perform t.sees_nothing('public.audit_logs', 'anon não lê audit_logs');
  perform t.sees_nothing('public.doctor_schedules', 'anon não lê doctor_schedules');
  perform t.fails('select * from public.list_doctors()', 'permission denied%', 'anon não executa list_doctors');
  perform t.fails('select * from public.list_appointments()', 'permission denied%', 'anon não executa list_appointments');
  perform t.fails($q$select public.book_appointment(null, now())$q$, 'permission denied%', 'anon não executa book_appointment');
  perform t.fails('select * from public._doctor_slots(null, current_date)', 'permission denied%',
    'a função interna _doctor_slots não é exposta');
end $$;

-- ---------------------------------------------------------------------------
-- 3. Perfis, papéis e tabelas auxiliares
-- ---------------------------------------------------------------------------
call t.login('pat1@t.local');
do $$
begin
  perform t.ok((select count(*) from public.profiles) = 1, 'paciente vê apenas o próprio perfil');
  perform t.fails($q$update public.profiles set role = 'ADMIN' where email = 'pat1@t.local'$q$,
    'Somente o administrador pode alterar o papel%', 'paciente não se promove a ADMIN');
  perform t.fails($q$update public.profiles set is_active = false where email = 'pat1@t.local'$q$,
    'Somente o administrador pode ativar%', 'paciente não se desativa');
  update public.profiles set phone = '(11) 97777-7777', full_name = 'T Paciente Um (editado)' where email = 'pat1@t.local';
  perform t.ok((select phone from public.profiles where email = 'pat1@t.local') = '(11) 97777-7777',
    'paciente edita o próprio telefone/nome');
  update public.profiles set full_name = 'T Paciente Um' where email = 'pat1@t.local';
  perform t.ok((select count(*) from public.audit_logs) = 0, 'paciente não lê audit_logs');
  perform t.blocked($q$insert into public.doctor_schedules (doctor_id, weekday, start_time, end_time)
                     select id, 1, time '08:00', time '09:00' from public.doctors limit 1$q$,
    'paciente não grava doctor_schedules');
  perform t.blocked($q$insert into public.doctor_specialties (doctor_id, specialty_id)
                     select d.id, d.specialty_id from public.doctors d limit 1$q$,
    'paciente não grava doctor_specialties');
  perform t.ok((select count(*) from public.doctor_schedules) > 0, 'paciente lê a grade de horários');
end $$;

call t.login('rec@t.local');
do $$
begin
  perform t.fails($q$update public.profiles set role = 'ADMIN' where email = 'rec@t.local'$q$,
    'Somente o administrador pode alterar o papel%', 'recepção não se promove a ADMIN');
  perform t.fails($q$update public.profiles set role = 'DOCTOR' where email = 'pat3@t.local'$q$,
    'Somente o administrador pode alterar o papel%', 'recepção não altera o papel de terceiros');
  perform t.ok((select count(*) from public.profiles) >= 8, 'recepção enxerga todos os perfis');
  perform t.ok((select count(*) from public.audit_logs) = 0, 'recepção não lê audit_logs');
end $$;

call t.login('adm@t.local');
do $$
begin
  update public.profiles set is_active = false where email = 'pat3@t.local';
  update public.profiles set is_active = true  where email = 'pat3@t.local';
  perform t.ok(true, 'ADMIN altera is_active');
  perform t.ok((select count(*) from public.audit_logs) >= 1, 'ADMIN lê audit_logs');
end $$;

-- ---------------------------------------------------------------------------
-- 4. Profissionais e grade de horários
-- ---------------------------------------------------------------------------
call t.login('pat1@t.local');
do $$
declare v_doc1 uuid := t.uid('doc1@t.local'); v_doc2 uuid := t.uid('doc2@t.local');
begin
  perform t.ok((select count(*) from public.list_doctors() where full_name like 'T Dentista%') = 2,
    'paciente vê só dentistas ativos em list_doctors');
  perform t.ok((select specialty_name from public.list_doctors() where id = v_doc1) = 'T-Especialidade'
    and (select location_name from public.list_doctors() where id = v_doc1) = 'T-Unidade'
    and (select array_length(weekdays, 1) from public.list_doctors() where id = v_doc1) = 7,
    'list_doctors traz especialidade, unidade e dias de atendimento');

  perform t.ok((select count(*) from public.get_available_slots(v_doc1, t.tomorrow())) = 4,
    'get_available_slots: doc1 tem 4 horários de 30 min amanhã');
  perform t.ok((select count(*) from public.get_available_slots(v_doc2, t.tomorrow())) = 2,
    'get_available_slots: doc2 tem 2 horários de 60 min amanhã');
  perform t.ok((select min(slot_start) from public.get_available_slots(v_doc1, t.tomorrow())) = t.tomorrow_at('08:00'),
    'get_available_slots: a grade é interpretada no fuso America/Sao_Paulo (08:00 local)');
  perform t.ok((select count(*) from public.get_available_slots(v_doc1, t.tomorrow() - 2)) = 0,
    'get_available_slots: não devolve horários no passado');
  perform t.ok((select count(*) from public.get_available_slots(t.uid('doc3@t.local'), t.tomorrow())) = 0,
    'get_available_slots: dentista inativo não tem horários');
  perform t.ok((select count(*) from public.get_available_days(v_doc1, null, 14)) between 13 and 14,
    'get_available_days: lista os dias com horários (hoje só entra se ainda houver horário futuro)');
  perform t.ok((select free_slots from public.get_available_days(v_doc1, t.tomorrow(), 1)) = 4,
    'get_available_days: 4 horários livres amanhã');
end $$;

call t.login('adm@t.local');
do $$
begin
  perform t.ok((select count(*) from public.list_doctors() where full_name like 'T Dentista%') = 3,
    'staff vê também dentistas inativos em list_doctors');
end $$;

-- ---------------------------------------------------------------------------
-- 5. Agendar (book_appointment)
-- ---------------------------------------------------------------------------
call t.login('pat1@t.local');
do $$
declare
  v_doc1 uuid := t.uid('doc1@t.local');
  v_doc2 uuid := t.uid('doc2@t.local');
  v_id   uuid;
  a      public.appointments%rowtype;
begin
  v_id := public.book_appointment(v_doc1, t.tomorrow_at('08:00'), 'FIRST_VISIT', null, '  Dor no dente 26  ');
  perform set_config('t.apt1', v_id::text, false);
  select * into a from public.appointments where id = v_id;

  perform t.ok(a.status = 'SCHEDULED', 'agendamento nasce SCHEDULED');
  perform t.ok(a.price = 200.00, 'preço vem do dentista (o cliente não define)');
  perform t.ok(a.patient_id = t.uid('pat1@t.local') and a.created_by = t.uid('pat1@t.local'),
    'paciente e autor vêm da sessão');
  perform t.ok(a.location_id = (select location_id from public.doctors where id = v_doc1), 'local vem do dentista');
  perform t.ok(a.notes = 'Dor no dente 26', 'observação é aparada');
  perform t.ok(a.scheduled_end = a.scheduled_start + interval '30 minutes', 'duração = slot_minutes da grade');
  perform t.ok((a.scheduled_start at time zone 'America/Sao_Paulo')::time = time '08:00'
    and (a.scheduled_start at time zone 'UTC')::time = time '11:00', '08:00 de São Paulo = 11:00 UTC');

  perform t.ok((select available from public.get_available_slots(v_doc1, t.tomorrow())
                 where slot_start = t.tomorrow_at('08:00')) = false,
    'horário agendado aparece como indisponível');

  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc1, t.tomorrow_at('08:00')),
    'Este horário acabou de ser reservado%', 'não permite duplo agendamento do mesmo dentista/horário');
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc2, t.tomorrow_at('08:00')),
    'O paciente já tem outra consulta%', 'paciente não agenda dois dentistas no mesmo horário');
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc1, t.tomorrow_at('08:15')),
    'Este horário não faz parte da agenda%', 'rejeita horário fora da grade');
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc1, now() - interval '1 day'),
    'Escolha um horário futuro%', 'rejeita horário no passado');
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc1, now() + interval '200 days'),
    'Só é possível agendar com até 180 dias%', 'rejeita agendamento além de 180 dias');
  perform t.fails(format($q$select public.book_appointment(%L, %L, 'FIRST_VISIT', null, null, %L)$q$,
      v_doc1, t.tomorrow_at('09:00'), t.uid('pat2@t.local')),
    'Você só pode agendar consultas para você mesmo%', 'paciente não agenda para outro paciente');
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, t.uid('doc3@t.local'), t.tomorrow_at('09:00')),
    'Profissional não encontrado ou inativo%', 'rejeita dentista inativo');
  perform t.fails(format($q$select public.book_appointment(%L, %L, 'FIRST_VISIT', %L)$q$,
      v_doc1, t.tomorrow_at('09:00'),
      (select id from public.patient_insurances where card_number = 'T-CARD-VENCIDO')),
    'Convênio inválido%', 'rejeita convênio vencido');

  -- convênio ativo do próprio paciente é aceito
  v_id := public.book_appointment(v_doc1, t.tomorrow_at('09:30'), 'FOLLOW_UP',
    (select id from public.patient_insurances where card_number = 'T-CARD-ATIVO'));
  perform t.ok((select insurance_id from public.appointments where id = v_id)
    = (select id from public.patient_insurances where card_number = 'T-CARD-ATIVO'),
    'aceita convênio ativo do próprio paciente');
  perform set_config('t.apt1b', v_id::text, false);

  -- escrita direta continua bloqueada
  perform t.fails($q$insert into public.appointments (patient_id, doctor_id, scheduled_start, scheduled_end, status)
                     select t.uid('pat1@t.local'), t.uid('doc1@t.local'), now() + interval '3 days',
                            now() + interval '3 days 30 min', 'CONFIRMED'$q$,
    'permission denied%', 'paciente não insere appointments direto (nem com status forjado)');
  perform t.fails(format($q$update public.appointments set price = 0, status = 'CONFIRMED' where id = %L$q$, current_setting('t.apt1')),
    'permission denied%', 'paciente não altera appointments direto (preço/status)');
  perform t.fails(format($q$delete from public.appointments where id = %L$q$, current_setting('t.apt1')),
    'permission denied%', 'paciente não apaga appointments');
end $$;

call t.login('pat2@t.local');
do $$
declare v_doc1 uuid := t.uid('doc1@t.local');
begin
  perform t.ok((select available from public.get_available_slots(v_doc1, t.tomorrow())
                 where slot_start = t.tomorrow_at('08:00')) = false,
    'outro paciente também vê o horário como ocupado');
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc1, t.tomorrow_at('08:00')),
    'Este horário acabou de ser reservado%', 'outro paciente não pega o horário ocupado');
  perform t.ok((select count(*) from public.appointments) = 0, 'paciente 2 não enxerga consultas do paciente 1');
  perform t.ok((select count(*) from public.list_appointments()) = 0, 'list_appointments: paciente 2 não vê as do paciente 1');
  perform t.fails(format($q$select public.set_appointment_status(%L, 'CANCELLED')$q$, current_setting('t.apt1')),
    'Consulta não encontrada%', 'paciente 2 não cancela consulta do paciente 1 (nem descobre que existe)');
  perform t.fails(format($q$select public.reschedule_appointment(%L, %L)$q$, current_setting('t.apt1'), t.tomorrow_at('09:00')),
    'Consulta não encontrada%', 'paciente 2 não remarca consulta do paciente 1');
  perform t.ok((select count(*) from public.list_patient_insurances(t.uid('pat1@t.local'))) = 0,
    'paciente 2 não lista convênios do paciente 1');
  perform t.ok((select count(*) from public.list_patients()) = 0, 'paciente não usa list_patients');
end $$;

call t.login('doc1@t.local');
do $$
begin
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, t.uid('doc1@t.local'), t.tomorrow_at('09:00')),
    'Seu perfil não pode criar agendamentos%', 'dentista não cria agendamentos');
end $$;

call t.login('rec@t.local');
do $$
declare v_id uuid; v_doc2 uuid := t.uid('doc2@t.local');
begin
  perform t.fails(format($q$select public.book_appointment(%L, %L)$q$, v_doc2, t.tomorrow_at('08:00')),
    'Informe o paciente%', 'recepção precisa informar o paciente');
  v_id := public.book_appointment(v_doc2, t.tomorrow_at('09:00'), 'FOLLOW_UP', null, 'Agendado pela recepção', t.uid('pat2@t.local'));
  perform set_config('t.apt2', v_id::text, false);
  perform t.ok((select patient_id = t.uid('pat2@t.local') and created_by = t.uid('rec@t.local') and price = 300.00
                  from public.appointments where id = v_id),
    'recepção agenda para o paciente informado (autor = recepção, preço do dentista)');
  perform t.fails(format($q$select public.book_appointment(%L, %L, 'FIRST_VISIT', %L, null, %L)$q$,
      v_doc2, t.tomorrow_at('08:00'),
      (select id from public.patient_insurances where card_number = 'T-CARD-ATIVO'), t.uid('pat2@t.local')),
    'Convênio inválido%', 'convênio de outro paciente é rejeitado mesmo para a recepção');
end $$;

-- ---------------------------------------------------------------------------
-- 6. Visibilidade (list_appointments / list_patients / list_patient_insurances)
-- ---------------------------------------------------------------------------
call t.login('pat1@t.local');
do $$
begin
  perform t.ok((select count(*) from public.list_appointments()) = 2, 'paciente 1 lista suas 2 consultas');
  perform t.ok((select doctor_name from public.list_appointments() where id = current_setting('t.apt1')::uuid) = 'T Dentista Um'
    and (select specialty_name from public.list_appointments() where id = current_setting('t.apt1')::uuid) = 'T-Especialidade'
    and (select location_name from public.list_appointments() where id = current_setting('t.apt1')::uuid) = 'T-Unidade',
    'list_appointments traz nome do dentista, especialidade e unidade');
  perform t.ok((select insurance_name from public.list_appointments() where id = current_setting('t.apt1b')::uuid) = 'T-Plano',
    'list_appointments traz o nome do convênio');
  perform t.ok((select count(*) from public.list_appointments(p_statuses => array['CONFIRMED']::public.appointment_status[])) = 0,
    'list_appointments filtra por status');
  perform t.ok((select count(*) from public.list_patient_insurances()) = 2, 'paciente lista os próprios convênios');
  perform t.ok((select status from public.list_patient_insurances() limit 1) = 'ACTIVE', 'convênio ativo vem primeiro');
end $$;

call t.login('doc2@t.local');
do $$
begin
  perform t.ok((select count(*) from public.list_appointments()) = 1, 'dentista 2 lista só as suas consultas');
  perform t.ok((select count(*) from public.list_patients()) = 1
    and (select full_name from public.list_patients()) = 'T Paciente Dois',
    'dentista lista apenas os pacientes que atende');
  perform t.ok((select count(*) from public.profiles where role = 'PATIENT') = 1,
    'dentista lê o perfil só de quem atende');
  perform t.ok((select count(*) from public.profiles where email = 'pat1@t.local') = 0,
    'dentista não lê o perfil de paciente que não é dele');
end $$;

call t.login('rec@t.local');
do $$
begin
  perform t.ok((select count(*) from public.list_appointments() where doctor_name like 'T Dentista%') = 3,
    'recepção lista todas as consultas');
  perform t.ok((select count(*) from public.list_appointments(p_search => 'Paciente Um')) = 2, 'busca por nome do paciente');
  perform t.ok((select count(*) from public.list_appointments(p_doctor_id => t.uid('doc2@t.local'))) = 1, 'filtra por dentista');
  perform t.ok((select count(*) from public.list_patients() where full_name like 'T Paciente%') = 3,
    'recepção lista todos os pacientes');
  perform t.ok((select appointments_count from public.list_patients() where full_name = 'T Paciente Um') = 2
    and (select insurance_name from public.list_patients() where full_name = 'T Paciente Um') = 'T-Plano'
    and (select next_visit from public.list_patients() where full_name = 'T Paciente Um') = t.tomorrow_at('08:00'),
    'list_patients traz convênio, total e próxima consulta');
  perform t.ok((select count(*) from public.list_patient_insurances(t.uid('pat1@t.local'))) = 2,
    'recepção lista convênios de um paciente');
end $$;

-- ---------------------------------------------------------------------------
-- 7. Mudança de status (máquina de estados + papéis)
-- ---------------------------------------------------------------------------
call t.login('doc1@t.local');
do $$
begin
  perform t.fails(format($q$select public.set_appointment_status(%L, 'CONFIRMED')$q$, current_setting('t.apt1')),
    'Seu perfil não pode confirmar%', 'dentista não confirma consulta');
  perform t.fails(format($q$select public.set_appointment_status(%L, 'IN_PROGRESS')$q$, current_setting('t.apt1')),
    'Transição inválida: SCHEDULED → IN_PROGRESS%', 'não inicia atendimento sem confirmação');
  perform t.fails(format($q$select public.set_appointment_status(%L, 'COMPLETED')$q$, current_setting('t.apt1')),
    'Transição inválida%', 'não pula direto para COMPLETED');
end $$;

call t.login('doc2@t.local');
do $$
begin
  perform t.fails(format($q$select public.set_appointment_status(%L, 'CONFIRMED')$q$, current_setting('t.apt1')),
    'Consulta não encontrada%', 'dentista 2 não mexe em consulta do dentista 1');
end $$;

call t.login('pat1@t.local');
do $$
begin
  perform public.set_appointment_status(current_setting('t.apt1')::uuid, 'CONFIRMED');
  perform t.ok((select status = 'CONFIRMED' and confirmed_at is not null
                  from public.appointments where id = current_setting('t.apt1')::uuid),
    'paciente confirma a própria consulta (grava confirmed_at)');
  perform t.fails(format($q$select public.set_appointment_status(%L, 'NO_SHOW')$q$, current_setting('t.apt1')),
    'Somente a recepção pode registrar falta%', 'paciente não marca falta');
  perform t.fails(format($q$select public.set_appointment_status(%L, 'IN_PROGRESS')$q$, current_setting('t.apt1')),
    'Somente o dentista responsável%', 'paciente não inicia atendimento');
end $$;

call t.login('doc1@t.local');
do $$
begin
  perform public.set_appointment_status(current_setting('t.apt1')::uuid, 'IN_PROGRESS');
  perform t.ok((select status from public.appointments where id = current_setting('t.apt1')::uuid) = 'IN_PROGRESS',
    'dentista inicia o atendimento (CONFIRMED → IN_PROGRESS)');
  perform public.set_appointment_status(current_setting('t.apt1')::uuid, 'COMPLETED');
  perform t.ok((select status = 'COMPLETED' and completed_at is not null
                  from public.appointments where id = current_setting('t.apt1')::uuid),
    'dentista conclui o atendimento (grava completed_at)');
  perform t.fails(format($q$select public.set_appointment_status(%L, 'CANCELLED', 'tentando reverter')$q$, current_setting('t.apt1')),
    'Transição inválida: COMPLETED → CANCELLED%', 'consulta concluída não pode ser cancelada');
end $$;

call t.login('rec@t.local');
do $$
begin
  perform t.fails(format($q$select public.set_appointment_status(%L, 'CANCELLED')$q$, current_setting('t.apt2')),
    'Informe o motivo do cancelamento%', 'recepção precisa informar o motivo ao cancelar');
  perform public.set_appointment_status(current_setting('t.apt2')::uuid, 'CONFIRMED');
  perform t.ok((select status from public.appointments where id = current_setting('t.apt2')::uuid) = 'CONFIRMED',
    'recepção confirma');
  perform public.set_appointment_status(current_setting('t.apt2')::uuid, 'NO_SHOW');
  perform t.ok((select status from public.appointments where id = current_setting('t.apt2')::uuid) = 'NO_SHOW',
    'recepção registra falta');
  perform t.ok((select available from public.get_available_slots(t.uid('doc2@t.local'), t.tomorrow())
                 where slot_start = t.tomorrow_at('09:00')) = true,
    'falta (NO_SHOW) libera o horário na agenda');
end $$;

-- consulta daqui a 1 hora (criada direto, como superusuário): o paciente não pode mais cancelar/remarcar
call t.su();
do $$
declare v_id uuid;
begin
  insert into public.appointments (patient_id, doctor_id, scheduled_start, scheduled_end, status)
  values (t.uid('pat1@t.local'), t.uid('doc1@t.local'), now() + interval '1 hour', now() + interval '90 minutes', 'CONFIRMED')
  returning id into v_id;
  perform set_config('t.apt_soon', v_id::text, false);
end $$;

call t.login('pat1@t.local');
do $$
begin
  perform t.fails(format($q$select public.set_appointment_status(%L, 'CANCELLED')$q$, current_setting('t.apt_soon')),
    'O cancelamento pelo portal exige pelo menos 2 hora(s)%', 'paciente não cancela com menos de 2 h de antecedência');
  perform t.fails(format($q$select public.reschedule_appointment(%L, %L)$q$, current_setting('t.apt_soon'), t.tomorrow_at('09:00')),
    'A remarcação pelo portal exige pelo menos 2 hora(s)%', 'paciente não remarca com menos de 2 h de antecedência');
  -- a consulta 1b (amanhã, SCHEDULED) ainda pode ser cancelada pelo paciente
  perform public.set_appointment_status(current_setting('t.apt1b')::uuid, 'CANCELLED', 'Imprevisto');
  perform t.ok((select status = 'CANCELLED' and cancel_reason = 'Imprevisto' and cancelled_at is not null
                       and cancelled_by = t.uid('pat1@t.local')
                  from public.appointments where id = current_setting('t.apt1b')::uuid),
    'paciente cancela com antecedência (grava motivo, data e autor)');
end $$;

call t.login('rec@t.local');
do $$
begin
  perform public.set_appointment_status(current_setting('t.apt_soon')::uuid, 'CANCELLED', 'Paciente ligou avisando');
  perform t.ok((select status = 'CANCELLED' and cancelled_by = t.uid('rec@t.local')
                  from public.appointments where id = current_setting('t.apt_soon')::uuid),
    'recepção cancela a qualquer momento, com motivo');
end $$;

-- ---------------------------------------------------------------------------
-- 8. Remarcar
-- ---------------------------------------------------------------------------
call t.login('pat1@t.local');
do $$
declare v_id uuid; v_doc1 uuid := t.uid('doc1@t.local');
begin
  v_id := public.book_appointment(v_doc1, t.tomorrow_at('08:30'), 'FIRST_VISIT');
  perform set_config('t.apt3', v_id::text, false);
  perform public.set_appointment_status(v_id, 'CONFIRMED');

  perform public.reschedule_appointment(v_id, t.tomorrow_at('09:00'));
  perform t.ok((select scheduled_start = t.tomorrow_at('09:00') and scheduled_end = t.tomorrow_at('09:30')
                       and status = 'SCHEDULED' and confirmed_at is null
                  from public.appointments where id = v_id),
    'paciente remarca: novo horário, volta para SCHEDULED e limpa a confirmação');
  perform t.ok((select available from public.get_available_slots(v_doc1, t.tomorrow())
                 where slot_start = t.tomorrow_at('08:30')) = true,
    'remarcar libera o horário antigo');
  perform t.fails(format($q$select public.reschedule_appointment(%L, %L)$q$, v_id, t.tomorrow_at('09:00')),
    'Escolha um horário diferente%', 'não remarca para o mesmo horário');
  perform t.fails(format($q$select public.reschedule_appointment(%L, %L)$q$, v_id, t.tomorrow_at('09:10')),
    'Este horário não faz parte da agenda%', 'não remarca para horário fora da grade');
  perform t.fails(format($q$select public.reschedule_appointment(%L, %L)$q$, current_setting('t.apt1'), t.tomorrow_at('09:30')),
    'Só é possível remarcar consultas agendadas ou confirmadas%', 'não remarca consulta concluída');
end $$;

call t.login('rec@t.local');
do $$
declare v_id uuid;
begin
  -- a recepção ocupa 09:30 do doc1 para o paciente 2 ...
  v_id := public.book_appointment(t.uid('doc1@t.local'), t.tomorrow_at('09:30'), 'RETURN', null, null, t.uid('pat2@t.local'));
  perform set_config('t.apt4', v_id::text, false);
end $$;

call t.login('pat1@t.local');
do $$
begin
  -- ... então o paciente 1 não consegue remarcar para lá
  perform t.fails(format($q$select public.reschedule_appointment(%L, %L)$q$, current_setting('t.apt3'), t.tomorrow_at('09:30')),
    'Este horário acabou de ser reservado%', 'não remarca para horário ocupado por outro paciente');
end $$;

call t.login('rec@t.local');
do $$
begin
  perform public.reschedule_appointment(current_setting('t.apt3')::uuid, t.tomorrow_at('08:30'));
  perform t.ok((select scheduled_start from public.appointments where id = current_setting('t.apt3')::uuid) = t.tomorrow_at('08:30'),
    'recepção remarca qualquer consulta');
end $$;

-- ---------------------------------------------------------------------------
-- 9. ADMIN pode tudo o que o grafo de status permite
-- ---------------------------------------------------------------------------
call t.login('adm@t.local');
do $$
begin
  perform public.set_appointment_status(current_setting('t.apt4')::uuid, 'CONFIRMED');
  perform public.set_appointment_status(current_setting('t.apt4')::uuid, 'IN_PROGRESS');
  perform public.set_appointment_status(current_setting('t.apt4')::uuid, 'COMPLETED');
  perform t.ok((select status from public.appointments where id = current_setting('t.apt4')::uuid) = 'COMPLETED',
    'ADMIN confirma, inicia e conclui qualquer consulta');
  perform t.ok((select count(*) from public.list_appointments() where doctor_name like 'T Dentista%') = 6,
    'ADMIN lista todas as consultas');
end $$;

call t.su();
rollback;

select 'TODOS OS TESTES PASSARAM' as resultado;
