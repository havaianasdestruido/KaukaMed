-- ============================================================================
-- KAUKAMED — Dados de demonstração (Entrega 5 / versão 1)
-- ----------------------------------------------------------------------------
-- Cria um usuário de cada perfil, dentistas com agenda semanal e consultas em
-- vários status (datas RELATIVAS a hoje, para a demonstração nunca "vencer").
--
--   Perfil     E-mail                    Senha        Observação
--   ADMIN      admin@example.com         Kauka@2026   Rodrigo Albuquerque
--   EMPLOYEE   recepcao@example.com      Kauka@2026   Renata Lins (recepção)
--   DOCTOR     dentista@example.com      Kauka@2026   Dr. Marcelo Arantes (Ortodontia)
--   PATIENT    paciente@example.com      Kauka@2026   Camila Santos (convênio Unimed)
--   + DOCTOR   renata.silveira@…  / helena.gusmao@…   (mesma senha)
--   + PATIENT  jorge.mendes@…     / lucas.ferraz@…    (mesma senha)
--
-- Pré-requisitos (nesta ordem): db/kaukamed_schema.sql, 001 e 002 em db/migrations/.
-- Como rodar no Supabase: SQL Editor > New query > colar este arquivo > Run.
-- Idempotente: pode ser executado várias vezes. Ele
--   • recria os usuários acima (ou apenas redefine a senha/papel se já existirem);
--   • apaga e recria as consultas de demonstração — as que têm created_by NULO.
--     Consultas feitas pelo app (created_by preenchido) nunca são apagadas.
--
-- ⚠️  Contas de DEMONSTRAÇÃO com senha pública. Não use em produção; troque as
--     senhas (ou apague os usuários) depois da apresentação.
-- ⚠️  Os e-mails usam o domínio reservado example.com: nenhuma mensagem chega a
--     terceiros (o "esqueci a senha" dessas contas não entrega e-mail).
-- ============================================================================

do $seed$
declare
  v_password  constant text := 'Kauka@2026';
  v_today     date := (now() at time zone 'America/Sao_Paulo')::date;
  v_u         record;
  v_a         record;
  v_id        uuid;
  v_col       text;
  v_patient   uuid;
  v_doctor    uuid;
  v_ins       uuid;
  v_loc       uuid;
  v_date      date;
  v_start     time;
  v_mins      int;
  v_step      int;
  v_slot_from timestamptz;
begin
  ---------------------------------------------------------------------------
  -- 0. Catálogos usados pela demonstração (idempotentes)
  ---------------------------------------------------------------------------
  insert into public.specialties (name, description) values
    ('Ortodontia',      'Correção da posição dos dentes e arcadas'),
    ('Implantodontia',  'Implantes dentários'),
    ('Periodontia',     'Tratamento da gengiva e tecidos de suporte'),
    ('Odontopediatria', 'Odontologia infantil')
  on conflict (name) do nothing;

  insert into public.health_insurances (name) values ('Unimed Odonto'), ('Amil Dental')
  on conflict (name) do nothing;

  insert into public.locations (name, address, city, state)
  select 'OdontoAura Unidade Jardins', 'Av. Paulista, 1578', 'São Paulo', 'SP'
  where not exists (select 1 from public.locations where name = 'OdontoAura Unidade Jardins');

  select id into v_loc from public.locations where name = 'OdontoAura Unidade Jardins';

  ---------------------------------------------------------------------------
  -- 1. Usuários (Supabase Auth + perfil)
  ---------------------------------------------------------------------------
  for v_u in
    select * from jsonb_to_recordset($json$[
      {"email":"admin@example.com",            "name":"Rodrigo Albuquerque", "role":"ADMIN",    "cpf":null,             "phone":"(11) 3000-0001"},
      {"email":"recepcao@example.com",         "name":"Renata Lins",         "role":"EMPLOYEE", "cpf":null,             "phone":"(11) 3000-0002"},
      {"email":"dentista@example.com",         "name":"Dr. Marcelo Arantes", "role":"DOCTOR",   "cpf":null,             "phone":"(11) 3000-0003"},
      {"email":"renata.silveira@example.com",  "name":"Dra. Renata Silveira","role":"DOCTOR",   "cpf":null,             "phone":"(11) 3000-0004"},
      {"email":"helena.gusmao@example.com",    "name":"Dra. Helena Gusmão",  "role":"DOCTOR",   "cpf":null,             "phone":"(11) 3000-0005"},
      {"email":"paciente@example.com",         "name":"Camila Santos",       "role":"PATIENT",  "cpf":"529.982.247-25", "phone":"(11) 98888-0001"},
      {"email":"jorge.mendes@example.com",     "name":"Jorge Mendes",        "role":"PATIENT",  "cpf":"111.444.777-35", "phone":"(11) 98888-0002"},
      {"email":"lucas.ferraz@example.com",     "name":"Lucas Ferraz",        "role":"PATIENT",  "cpf":"123.456.789-09", "phone":"(11) 98888-0003"}
    ]$json$::jsonb) as x(email text, name text, role text, cpf text, phone text)
  loop
    select id into v_id from auth.users where email = v_u.email;

    if v_id is null then
      v_id := gen_random_uuid();

      -- Campos que o GoTrue exige para o login por e-mail/senha funcionar.
      -- confirmation_token/recovery_token/email_change* precisam ser '' (nunca NULL).
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
        v_u.email, crypt(v_password, gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_u.name, 'cpf', v_u.cpf, 'phone', v_u.phone),
        now(), now(),
        '', '', '', ''
      );

      insert into auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_id, v_id::text,
        jsonb_build_object('sub', v_id::text, 'email', v_u.email,
                           'email_verified', true, 'phone_verified', false),
        'email', now(), now(), now()
      );
    else
      -- já existe: só garante senha conhecida e e-mail confirmado
      update auth.users
         set encrypted_password = crypt(v_password, gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             updated_at         = now()
       where id = v_id;
    end if;

    -- Colunas de token que possam existir nesta versão do GoTrue: '' em vez de NULL.
    for v_col in
      select column_name from information_schema.columns
      where table_schema = 'auth' and table_name = 'users'
        and column_name in ('confirmation_token', 'recovery_token', 'email_change_token_new',
                            'email_change', 'email_change_token_current', 'phone_change',
                            'phone_change_token', 'reauthentication_token')
    loop
      execute format('update auth.users set %I = coalesce(%I, '''') where id = $1', v_col, v_col)
        using v_id;
    end loop;

    -- Perfil (o trigger handle_new_user já cria como PATIENT; aqui ajustamos o papel)
    insert into public.profiles (id, role, full_name, email, cpf, phone, is_active)
    values (v_id, v_u.role::public.user_role, v_u.name, v_u.email, v_u.cpf, v_u.phone, true)
    on conflict (id) do update
      set role      = excluded.role,
          full_name = excluded.full_name,
          email     = excluded.email,
          cpf       = excluded.cpf,
          phone     = excluded.phone,
          is_active = true;

    if v_u.role = 'PATIENT' then
      insert into public.patients (id) values (v_id) on conflict (id) do nothing;
    else
      delete from public.patients where id = v_id;
    end if;
  end loop;

  ---------------------------------------------------------------------------
  -- 2. Dentistas, especialidades e agenda semanal (weekday: 0 = domingo)
  ---------------------------------------------------------------------------
  insert into public.doctors (id, crm, specialty_id, location_id, bio, consultation_price)
  select p.id, x.crm, sp.id, v_loc, x.bio, x.price
  from (values
    ('dentista@example.com',        'CRO-SP 89412',  'Ortodontia',      180.00,
     'Ortodontista com foco em alinhadores e ortopedia facial. Atende de segunda a sexta, pela manhã.'),
    ('renata.silveira@example.com', 'CRO-SP 94215',  'Implantodontia',  350.00,
     'Cirurgiã-dentista especialista em implantes e enxerto ósseo. Atende às terças e quintas.'),
    ('helena.gusmao@example.com',   'CRO-SP 102840', 'Odontopediatria', 220.00,
     'Odontopediatra: prevenção e atendimento humanizado para crianças. Atende às segundas, quartas e sextas, à tarde.')
  ) as x(email, crm, specialty, price, bio)
  join public.profiles    p  on p.email = x.email
  join public.specialties sp on sp.name = x.specialty
  on conflict (id) do update
    set crm = excluded.crm, specialty_id = excluded.specialty_id, location_id = excluded.location_id,
        bio = excluded.bio, consultation_price = excluded.consultation_price;

  -- especialidade extra (exercita doctor_specialties)
  insert into public.doctor_specialties (doctor_id, specialty_id)
  select p.id, sp.id
  from public.profiles p, public.specialties sp
  where p.email = 'renata.silveira@example.com' and sp.name = 'Periodontia'
  on conflict do nothing;

  insert into public.doctor_schedules (doctor_id, weekday, start_time, end_time, slot_minutes, is_active)
  select p.id, w.weekday, w.start_time, w.end_time, w.slot_minutes, true
  from (values
    -- Dr. Marcelo: seg–sex, 08:00–12:00, consultas de 30 min
    ('dentista@example.com', 1, time '08:00', time '12:00', 30),
    ('dentista@example.com', 2, time '08:00', time '12:00', 30),
    ('dentista@example.com', 3, time '08:00', time '12:00', 30),
    ('dentista@example.com', 4, time '08:00', time '12:00', 30),
    ('dentista@example.com', 5, time '08:00', time '12:00', 30),
    -- Dra. Renata: ter e qui, 09:00–17:00, consultas de 60 min
    ('renata.silveira@example.com', 2, time '09:00', time '17:00', 60),
    ('renata.silveira@example.com', 4, time '09:00', time '17:00', 60),
    -- Dra. Helena: seg, qua e sex, 13:00–18:00, consultas de 45 min
    ('helena.gusmao@example.com', 1, time '13:00', time '18:00', 45),
    ('helena.gusmao@example.com', 3, time '13:00', time '18:00', 45),
    ('helena.gusmao@example.com', 5, time '13:00', time '18:00', 45)
  ) as w(email, weekday, start_time, end_time, slot_minutes)
  join public.profiles p on p.email = w.email
  on conflict (doctor_id, weekday) do update
    set start_time = excluded.start_time, end_time = excluded.end_time,
        slot_minutes = excluded.slot_minutes, is_active = true;

  ---------------------------------------------------------------------------
  -- 3. Convênios dos pacientes
  ---------------------------------------------------------------------------
  insert into public.patient_insurances (patient_id, insurance_id, card_number, status, valid_until)
  select p.id, hi.id, x.card, 'ACTIVE', v_today + 365
  from (values
    ('paciente@example.com',     'Unimed Odonto', '0048.9123.8821-00'),
    ('lucas.ferraz@example.com', 'Amil Dental',   '0031.5520.7714-09')
  ) as x(email, plan, card)
  join public.profiles          p  on p.email = x.email
  join public.health_insurances hi on hi.name = x.plan
  on conflict (insurance_id, card_number) do update
    set patient_id = excluded.patient_id, status = 'ACTIVE', valid_until = excluded.valid_until;

  ---------------------------------------------------------------------------
  -- 4. Consultas de demonstração (created_by NULO = marca do seed)
  --    offset_dias: relativo a hoje (fuso da clínica). O dia é ajustado para o
  --    próximo/anterior dia em que o dentista atende; `slot` é o índice na grade.
  ---------------------------------------------------------------------------
  delete from public.appointments where created_by is null;

  for v_a in
    select * from (values
      -- paciente,                    dentista,                       offset, slot, status,      tipo,          convênio, motivo
      ('paciente@example.com',     'dentista@example.com',         -21, 2, 'COMPLETED', 'FIRST_VISIT', true,  'Avaliação ortodôntica inicial.'),
      ('paciente@example.com',     'dentista@example.com',          -7, 3, 'COMPLETED', 'FOLLOW_UP',   true,  'Manutenção do aparelho.'),
      ('paciente@example.com',     'dentista@example.com',          -3, 4, 'CANCELLED', 'FOLLOW_UP',   true,  'Ajuste de fio (cancelada a pedido da paciente).'),
      ('paciente@example.com',     'dentista@example.com',           2, 2, 'CONFIRMED', 'FOLLOW_UP',   true,  'Manutenção mensal do aparelho.'),
      ('paciente@example.com',     'renata.silveira@example.com',    6, 3, 'SCHEDULED', 'FIRST_VISIT', false, 'Avaliação para implante.'),
      ('jorge.mendes@example.com', 'renata.silveira@example.com',  -10, 1, 'COMPLETED', 'FIRST_VISIT', false, 'Avaliação para implante — dente 36.'),
      ('jorge.mendes@example.com', 'renata.silveira@example.com',    3, 2, 'CONFIRMED', 'FOLLOW_UP',   false, 'Pós-operatório do implante.'),
      ('jorge.mendes@example.com', 'dentista@example.com',           0, 4, 'CONFIRMED', 'FIRST_VISIT', false, 'Consulta ortodôntica de avaliação.'),
      ('jorge.mendes@example.com', 'dentista@example.com',           1, 1, 'SCHEDULED', 'RETURN',      false, 'Retorno para entrega de documentação.'),
      ('lucas.ferraz@example.com', 'helena.gusmao@example.com',    -14, 0, 'COMPLETED', 'FIRST_VISIT', true,  'Primeira consulta e profilaxia.'),
      ('lucas.ferraz@example.com', 'helena.gusmao@example.com',     -5, 3, 'NO_SHOW',   'FOLLOW_UP',   true,  'Aplicação de flúor.'),
      ('lucas.ferraz@example.com', 'helena.gusmao@example.com',      4, 2, 'SCHEDULED', 'FOLLOW_UP',   true,  'Aplicação de flúor (reagendada).')
    ) as t(patient_email, doctor_email, offset_dias, slot, status, type, use_insurance, notes)
  loop
    select id into v_patient from public.profiles where email = v_a.patient_email;
    select id into v_doctor  from public.profiles where email = v_a.doctor_email;

    -- ajusta a data para um dia de atendimento do dentista
    v_date := v_today + v_a.offset_dias;
    v_step := case when v_a.offset_dias < 0 then -1 else 1 end;
    for i in 1..14 loop
      exit when exists (
        select 1 from public.doctor_schedules s
        where s.doctor_id = v_doctor and s.is_active
          and s.weekday = extract(dow from v_date)::int
      );
      v_date := v_date + v_step;
    end loop;

    select s.start_time, s.slot_minutes into v_start, v_mins
    from public.doctor_schedules s
    where s.doctor_id = v_doctor and s.weekday = extract(dow from v_date)::int;

    v_slot_from := (v_date + v_start + make_interval(mins => v_a.slot * v_mins))
                   at time zone 'America/Sao_Paulo';

    v_ins := null;
    if v_a.use_insurance then
      select pi.id into v_ins
      from public.patient_insurances pi
      where pi.patient_id = v_patient and pi.status = 'ACTIVE'
      order by pi.created_at desc limit 1;
    end if;

    insert into public.appointments (
      patient_id, doctor_id, location_id, insurance_id, type, status,
      scheduled_start, scheduled_end, price, notes,
      confirmed_at, completed_at, cancelled_at, cancel_reason
    )
    select
      v_patient, v_doctor, d.location_id, v_ins,
      v_a.type::public.appointment_type, v_a.status::public.appointment_status,
      v_slot_from, v_slot_from + make_interval(mins => v_mins), d.consultation_price, v_a.notes,
      case when v_a.status in ('CONFIRMED', 'COMPLETED') then v_slot_from - interval '1 day' end,
      case when v_a.status = 'COMPLETED' then v_slot_from + make_interval(mins => v_mins) end,
      case when v_a.status = 'CANCELLED' then v_slot_from - interval '1 day' end,
      case when v_a.status = 'CANCELLED' then 'Paciente pediu para remarcar.' end
    from public.doctors d
    where d.id = v_doctor
    on conflict do nothing;  -- se um horário já foi ocupado por uma consulta real, pula
  end loop;

  raise notice 'Seed KaukaMed aplicado. Login de demonstração: admin@example.com, recepcao@example.com, dentista@example.com, paciente@example.com — senha %', v_password;
end
$seed$;

-- Conferência (aparece como resultado no SQL Editor)
select p.role, p.full_name, p.email,
       (select count(*) from public.appointments a
         where a.patient_id = p.id or a.doctor_id = p.id) as consultas
from public.profiles p
where p.email like '%@example.com'
order by array_position(array['ADMIN', 'EMPLOYEE', 'DOCTOR', 'PATIENT'], p.role::text), p.full_name;
