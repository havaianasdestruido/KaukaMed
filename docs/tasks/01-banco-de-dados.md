# 01 — Banco de Dados (Supabase / PostgreSQL)

> **Responsável:** DBA · **Depende de:** 00 · **Bloqueia:** 02–10

O schema já foi gerado e aplicado no Supabase
([`db/kaukamed_schema.sql`](../../db/kaukamed_schema.sql)). Este módulo cobre a
manutenção do schema, políticas RLS, seeds e suporte ao restante da equipe.

---

## 📌 Tarefas

### Schema
- [x] Gerar o esquema SQL a partir da SPEC (tabelas, ENUMs, FKs, constraints, índices, triggers `updated_at`)
- [x] Executar o schema no SQL Editor do Supabase
- [x] Versionar o schema no repositório (`db/kaukamed_schema.sql`)
- [ ] Validar no Supabase que todas as tabelas foram criadas: `profiles`, `specialties`,
      `locations`, `doctors`, `doctor_specialties`, `doctor_schedules`, `patients`,
      `health_insurances`, `patient_insurances`, `appointments`, `medical_records`,
      `record_diagnoses`, `prescriptions`, `audit_logs`
- [ ] Criar processo de migração incremental (`db/migrations/NNN-descricao.sql`) para
      qualquer alteração futura de schema — nunca editar o schema base direto em produção

### Row Level Security (RLS)
- [x] Habilitar RLS com policies por role (`PATIENT`, `EMPLOYEE`, `DOCTOR`, `ADMIN`)
- [ ] Testar cada policy com usuários reais de cada role (paciente só vê os próprios
      dados; médico vê seus atendimentos; funcionário/admin gerenciam a agenda)
- [ ] Revisar policies de `INSERT`/`UPDATE` em `appointments` conforme regras do módulo 05
- [ ] Garantir que `audit_logs` só é legível por `ADMIN`

### Seeds (dados de teste)
- [ ] Criar `db/seed.sql` com:
  - [ ] 1 usuário de teste por role (ADMIN, DOCTOR, EMPLOYEE, PATIENT) — via Supabase Auth + `profiles`
  - [ ] 5+ especialidades (ex.: Clínica Geral, Ortodontia, Endodontia, Periodontia, Cirurgia)
  - [ ] 1–2 locais de atendimento (`locations`)
  - [ ] 2+ médicos com especialidades e agendas semanais (`doctor_schedules`)
  - [ ] 2+ operadoras de convênio (`health_insurances`)
  - [ ] Alguns agendamentos de exemplo em vários status
- [ ] Documentar em `db/README.md` como rodar o seed e as credenciais dos usuários de teste

### Suporte contínuo (durante módulos 02–09)
- [ ] Criar views/funções SQL auxiliares quando solicitado (ex.: horários disponíveis de um médico)
- [ ] Revisar índices conforme as queries reais do front (ex.: `appointments (doctor_id, starts_at)`)
- [ ] Acompanhar erros de RLS reportados pela equipe e ajustar policies

---

## ✅ Critérios de aceite
- [ ] Login com cada um dos 4 usuários seed funciona e cada role enxerga apenas o permitido
- [ ] `db/seed.sql` roda sem erros em um projeto Supabase limpo (após o schema)
- [ ] Toda alteração de schema pós-entrega existe como migration versionada no repositório
