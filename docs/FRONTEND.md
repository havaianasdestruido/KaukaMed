# Front-end — OdontoAura (`apps/web`)

O front-end veio do protótipo **"OdontoAura – Clínica & Tecnologia Odontológica"**
(export do Google AI Studio, `.zip` do Google Drive) e substituiu o esqueleto Next.js
que existia antes em `apps/web`.

| Item       | Tecnologia                                             |
| :--------- | :----------------------------------------------------- |
| Build/dev  | Vite 8                                                 |
| UI         | React 19 + Tailwind CSS 4 + Material Symbols           |
| Dados      | `@supabase/supabase-js` (Auth + PostgREST, com RLS)    |
| Contratos  | `@kaukamed/shared` (enums de papéis e status)          |
| Hospedagem | Estático — pronto para GitHub Pages (`VITE_BASE_PATH`) |

## Como rodar

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # preencha as variáveis do Supabase
npm run dev:web                                # http://localhost:3000
```

Build estático (saída em `apps/web/dist`):

```bash
VITE_BASE_PATH=/KaukaMed/ npm run build -w @kaukamed/web
```

## Duas fontes de dados

| Modo             | Quando                                                   | Comportamento                                                                   |
| :--------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Supabase**     | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` definidas | Login/cadastro reais, consultas e corpo clínico lidos/gravados no banco         |
| **Demonstração** | Variáveis ausentes                                       | Dataset de `src/data/mockData.ts`, troca de perfil livre (útil para apresentar) |

A escolha é automática (`src/lib/env.ts`); as telas não precisam saber de onde vêm os dados.

## Configurando o Supabase

1. Rode `db/kaukamed_schema.sql` no SQL Editor.
2. Rode `db/migrations/001_frontend_support.sql`. Ela:
   - cria o trigger `handle_new_user` (o cadastro gera `profiles` + `patients` automaticamente);
   - libera a leitura dos perfis de médicos para usuários autenticados;
   - permite que o paciente cancele/reagende as próprias consultas;
   - ativa RLS nos catálogos (especialidades, unidades, convênios) e cria seeds odontológicos.
3. Crie pelo menos **um dentista** (instruções no fim da migration) — sem médico
   cadastrado não é possível agendar.
4. Para desenvolvimento, desative a confirmação de e-mail
   (Authentication → Providers → Email → _Confirm email_) ou confirme pelo painel.

## O que está ligado ao backend

| Tela / ação                                   | Origem dos dados                                |
| :-------------------------------------------- | :---------------------------------------------- |
| Login, logout, "esqueci a senha"              | Supabase Auth (`src/services/auth.ts`)          |
| Cadastro de paciente                          | Supabase Auth + trigger `handle_new_user`       |
| Perfil do usuário (nome, papel, convênio/CRO) | `profiles`, `patient_insurances`, `doctors`     |
| Roteamento por papel                          | `profiles.role` (PATIENT/EMPLOYEE/DOCTOR/ADMIN) |
| Minhas consultas (listar)                     | `appointments` (filtrado por RLS)               |
| Agendar / reagendar / cancelar                | `appointments` (`src/services/appointments.ts`) |
| Corpo clínico (lista)                         | `doctors` + `profiles` + `specialties`          |

## Pendências (ainda com dados de exemplo)

O schema atual não tem tabelas para estes recursos, então eles continuam usando o
dataset local mesmo no modo Supabase:

- **Faturamento TISS / glosas / auditoria IA** — não há tabelas de guias TISS.
- **Salas / consultórios em tempo real** — não há tabela de salas.
- **Odontograma** — não há tabela de dentes/procedimentos por dente.
- **Dashboards administrativos** (KPIs, gráficos) — números fixos do protótipo.
- **Cadastro de novo profissional** — criar usuário exige a _service-role key_;
  precisa de um endpoint no backend (NestJS ou Edge Function). Hoje só adiciona na sessão.
- **Convênio no cadastro** — `patient_insurances` só aceita escrita de staff (RLS);
  os campos de operadora/carteirinha do cadastro ainda não são gravados.
- **Endereço no cadastro** — `profiles` não tem colunas de endereço.
- **Calendário de agendamento** — dias/horários são os fixos do protótipo (outubro/2024);
  deveria vir de `doctor_schedules`. O médico escolhido é resolvido pelo nome.
- **Filtro de "próximas consultas"** e cards do dashboard do paciente — JSX fixo do protótipo.
- **Login social (Google/Gov.br)** — desabilitado no modo Supabase.

## Ajustes de qualidade

- `tsconfig.json` estende `tsconfig.base.json` (modo `strict`), mas desliga
  `noUnusedLocals`, `noUnusedParameters` e `noUncheckedIndexedAccess`, que o código
  gerado pelo protótipo ainda não atende.
- Dependências sem uso no código do protótipo foram removidas: `@google/genai`,
  `express`, `dotenv`, `motion`, `lucide-react`.
