# Banco de dados — KaukaMed

PostgreSQL (Supabase em produção, Docker Compose em desenvolvimento). Tudo o que é regra de
negócio da agenda vive aqui, em funções SQL, e o front-end só as chama — assim as regras e as
permissões valem para qualquer cliente, e não apenas para a tela.

## Arquivos

| Arquivo                                          | O que é                                                                                                                                                                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kaukamed_schema.sql`                            | Schema base: 14 tabelas, enums, índices, RLS e dados de referência (especialidades, convênios e a unidade).                                                                                                                                                                     |
| `migrations/001_frontend_support.sql`            | Migration do front-end: gatilho `handle_new_user` (perfil no cadastro), trava de `role` e RLS de especialidades, unidades e convênios. A 002 refina parte dela.                                                                                                                 |
| `migrations/002_agendamento_v1.sql`              | Agenda da versão 1: grade de horários, RPCs de agendar/remarcar/mudar status/listar, travas de papel e de escrita direta. Idempotente.                                                                                                                                          |
| `seed.sql`                                       | Dados de **demonstração**: um usuário por papel, três dentistas com agenda e 12 consultas (datas relativas a hoje). Idempotente.                                                                                                                                                |
| `tests/002_agendamento.test.sql`                 | 111 asserções das regras do banco. Roda dentro de uma transação e termina em `rollback`: não deixa dados.                                                                                                                                                                       |
| `../docker/postgres/init/00-supabase-compat.sql` | Só para o Postgres local: cria `auth.users`, `auth.uid()` e os papéis `anon`/`authenticated`/`service_role` que no Supabase já existem. **Não** dá privilégio automático às tabelas (como nos projetos criados depois de 30/05/2026): quem precisa de acesso declara o `GRANT`. |

## Ordem de aplicação

A ordem importa — cada arquivo depende do anterior:

1. `kaukamed_schema.sql`
2. `migrations/001_frontend_support.sql`
3. `migrations/002_agendamento_v1.sql`
4. `seed.sql` _(opcional, só para demonstração)_

### No Supabase (produção / demonstração)

1. Crie o projeto e abra **SQL Editor → New query**.
2. Cole e execute (**Run**) os arquivos acima, um por vez, na ordem.
3. Em **Authentication → Providers → Email**, desative **Confirm email** (para o cadastro entrar direto) ou
   mantenha ativado e confirme o e-mail recebido.
4. Em **Authentication → URL Configuration**, ponha o endereço publicado (ex.:
   `https://havaianasdestruido.github.io/KaukaMed/`) em **Site URL** e em **Redirect URLs**. É para
   lá que voltam os links de confirmação de e-mail e de "esqueci minha senha".
5. Em **Project Settings → API Keys** (ou no botão **Connect**), copie a **Project URL** e a **Publishable key** (`sb_publishable_…`; ou a **anon public**, nos projetos antigos) para os
   _secrets_ do GitHub (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). **Nunca** use a chave
   `service_role` no front-end.

> Se o app mostrar _"O banco de dados ainda não tem a função …"_, a migration 002 não foi aplicada
> neste projeto. Se mostrar _"schema desatualizado"_, reaplique o schema e as migrations.

### Com Docker (desenvolvimento)

```bash
cp .env.example .env
npm run infra:up          # na primeira subida o Postgres aplica 00 → 04 sozinho
npm run db:test           # roda as 111 asserções SQL (termina em "TODOS OS TESTES PASSARAM")
npm run db:psql           # console psql
npm run infra:reset       # apaga o volume e recria tudo do zero
```

Para reaplicar apenas o seed (recria as consultas de demonstração, sem apagar as feitas pelo app):

```bash
npm run db:seed
```

## Contas de demonstração (`seed.sql`)

Senha de todas: **`Kauka@2026`**. Os e-mails usam o domínio reservado `example.com`: nenhuma mensagem
chega a terceiros, então "esqueci minha senha" não funciona para elas. Para testar o **Cadastro**, use um
e-mail real (alguns projetos Supabase rejeitam `example.com`).

| Papel      | E-mail                        | Quem é                                | O que vê                                             |
| ---------- | ----------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `ADMIN`    | `admin@example.com`           | Rodrigo Albuquerque                   | Agenda de todos, pacientes, equipe e relatórios      |
| `EMPLOYEE` | `recepcao@example.com`        | Renata Lins (recepção)                | Agenda de todos; agenda, confirma e cancela por eles |
| `DOCTOR`   | `dentista@example.com`        | Dr. Marcelo Arantes (Ortodontia)      | Só as consultas dele; inicia e conclui atendimentos  |
| `DOCTOR`   | `renata.silveira@example.com` | Dra. Renata Silveira (Implantodontia) | Idem (terças e quintas)                              |
| `DOCTOR`   | `helena.gusmao@example.com`   | Dra. Helena Gusmão (Odontopediatria)  | Idem (segundas, quartas e sextas, à tarde)           |
| `PATIENT`  | `paciente@example.com`        | Camila Santos (convênio Unimed)       | Só as consultas dela; agenda, reagenda, cancela      |
| `PATIENT`  | `jorge.mendes@example.com`    | Jorge Mendes (sem convênio)           | Idem                                                 |
| `PATIENT`  | `lucas.ferraz@example.com`    | Lucas Ferraz (Amil Dental)            | Idem                                                 |

⚠️ São contas públicas de demonstração. Troque as senhas (ou apague os usuários) depois da apresentação.

## O que o banco garante

Funções chamadas pelo front-end (`select … from rpc/…` do PostgREST). Todas exigem usuário logado
(`authenticated`); quem não está logado não executa nenhuma.

| Função                                       | Para quê                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `list_doctors()`                             | Dentistas ativos com especialidades, unidade, preço e dias de atendimento.           |
| `get_available_days(doctor, from, days)`     | Dias com horário e quantos estão livres (para o seletor de datas).                   |
| `get_available_slots(doctor, date)`          | Horários futuros do dia, com `available` (livre/ocupado).                            |
| `book_appointment(...)`                      | Agenda. Paciente agenda para si; recepção informa o paciente; dentista não agenda.   |
| `reschedule_appointment(id, new_start)`      | Remarca para outro horário livre; volta para `SCHEDULED`.                            |
| `set_appointment_status(id, status, reason)` | Confirma, inicia, conclui, cancela ou marca falta — conforme papel e estado.         |
| `list_appointments(...)`                     | Consultas visíveis ao usuário (paciente: as suas; dentista: as dele; equipe: todas). |
| `list_patients(...)`                         | Pacientes visíveis (equipe: todos; dentista: só quem atende).                        |
| `list_patient_insurances(patient)`           | Convênios do paciente.                                                               |

Regras principais (todas cobertas por `tests/002_agendamento.test.sql`):

- **Papel**: o cadastro sempre cria `PATIENT` (qualquer `role` enviada é ignorada) e só `ADMIN` muda `role`/`is_active`.
- **CPF**: gravado normalizado (`000.000.000-00`); inválido vira `NULL` em vez de travar o cadastro; duplicado é recusado.
- **Privilégios de tabela (seção 13 da 002)**: `authenticated` lê (a RLS filtra as linhas) e atualiza o próprio perfil; `anon` não toca em tabela nenhuma; o resto passa pelas funções acima. O Supabase **não concede mais isso sozinho** em projetos criados a partir de 30/05/2026 (e, desde 30/10/2026, nas tabelas novas de qualquer projeto): sem esses `GRANT`s o login falha com `permission denied for table profiles`. Tabela nova que o app leia ou escreva direto = `GRANT` novo na migration. O CI emula esse regime (compat sem privilégios automáticos) e os testes valem nos dois.
- **Escrita em `appointments`**: nenhum papel da API faz `insert`/`update`/`delete` direto — só pelas funções acima.
- **Agenda**: o horário precisa estar na grade do dentista (`doctor_schedules`), no futuro e em até 180 dias; o fuso é `America/Sao_Paulo`. Sem duplo agendamento do dentista nem do paciente.
- **Preço, status, local e autor** vêm do banco, nunca do cliente. O convênio precisa ser do paciente, estar `ACTIVE` e não vencido.
- **Status**: `SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED`, com `CANCELLED`/`NO_SHOW` (mesmo grafo de `packages/shared`). Confirmar: paciente (própria) ou equipe. Iniciar/concluir: dentista responsável ou admin. Faltou: equipe. Cancelar: paciente (própria, **com 2 h de antecedência**) ou equipe **com motivo**.
- **Auditoria**: `audit_logs` só é lida por `ADMIN`.

## Testes

### Regras do banco (SQL)

```bash
npm run db:test      # Docker Compose
```

Ou contra qualquer Postgres que já tenha o schema, as migrations **e o compat local**:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/tests/002_agendamento.test.sql
```

Cada `ok - …` é uma asserção; a primeira que falhar aborta com `FALHOU - …`. Rode **somente em banco
local/de teste**: os testes criam usuários `@t.local` dentro de uma transação que é desfeita no fim.

### Front-end contra o SQL real

Com o banco local no ar (compat + schema + migrations + seed):

```bash
KAUKAMED_TEST_DATABASE_URL=postgres://kaukamed:kaukamed@localhost:5432/kaukamed \
  npm test -w @kaukamed/web
```

Sem essa variável os 7 testes de integração são ignorados. Com ela, o app real (login, perfil, agenda,
cadastro) roda em jsdom contra as funções SQL, com papel `authenticated` e claims do JWT — o que não
cobre é o PostgREST/GoTrue em si, que só existem no Supabase.

## Convenções

- Nova mudança de schema = nova migration numerada (`003_…sql`), **idempotente** (`create … if not exists`, `create or replace`, `drop … if exists`). Não edite migrations já aplicadas em produção.
- Não edite `kaukamed_schema.sql` para mudanças novas: ele é a base (o Prettier o ignora de propósito).
- Funções de API são `security definer` com `set search_path = public` e fazem a própria checagem de papel; `grant execute` só para `authenticated`.
