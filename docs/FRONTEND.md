# Front-end — OdontoAura (`apps/web`)

O front-end veio do protótipo **"OdontoAura – Clínica & Tecnologia Odontológica"**
(export do Google AI Studio) e substituiu o esqueleto Next.js que existia antes em `apps/web`.
Na **Entrega 5 (V1)** as telas de login, cadastro, agendamento e consultas deixaram de ser
protótipo e passaram a usar dados reais do Supabase.

| Item       | Tecnologia                                                                           |
| :--------- | :----------------------------------------------------------------------------------- |
| Build/dev  | Vite 8                                                                               |
| UI         | React 19 + Tailwind CSS 4 + Material Symbols                                         |
| Dados      | `@supabase/supabase-js` (Auth + funções SQL via PostgREST, com RLS)                  |
| Contratos  | `@kaukamed/shared` (enums de papéis, status e tipos de consulta)                     |
| Testes     | Vitest + Testing Library (jsdom)                                                     |
| Hospedagem | Estático no GitHub Pages (`VITE_BASE_PATH`, workflow `.github/workflows/deploy.yml`) |

## Como rodar

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # preencha as variáveis do Supabase (opcional)
npm run dev:web                                # http://localhost:3000
npm test -w @kaukamed/web                      # testes
```

Build estático (saída em `apps/web/dist`):

```bash
VITE_BASE_PATH=/KaukaMed/ npm run build -w @kaukamed/web
```

## Duas fontes de dados

| Modo             | Quando                                                   | Comportamento                                                                                  |
| :--------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Supabase**     | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` definidas | Login/cadastro reais; agenda, consultas, pacientes e convênios lidos/gravados no banco         |
| **Demonstração** | Variáveis ausentes                                       | Dados em memória (`localGateway`), troca de perfil pelo menu do usuário — útil para apresentar |

A escolha é automática (`src/lib/env.ts`). No modo demonstração as consultas ficam só na aba do
navegador, com datas relativas a hoje. O site publicado **sempre** usa o modo Supabase: o deploy
falha se as credenciais não existirem.

## Arquitetura

```
src/
├── lib/           # Funções puras e testadas: fuso da clínica, CPF/telefone, grade de horários,
│                  # regras de ação por status, acesso por papel, .ics, erros em pt-BR
├── services/
│   ├── gateway.ts        # Contrato de acesso a dados da agenda
│   ├── remoteGateway.ts  # Supabase: chama as funções SQL (list_doctors, book_appointment, …)
│   ├── localGateway.ts   # Demonstração: mesmas regras, em memória
│   ├── rpc.ts            # Chamada de funções do banco + tradução de erros
│   ├── auth.ts           # Login, cadastro, recuperação de senha, perfil
│   └── mappers.ts        # Linhas do banco (snake_case, enums em inglês) → modelo das telas
├── context/AppContext.tsx   # Sessão, usuário, dados do paciente e ações de agenda
├── components/
│   ├── common/    # Modal, SlotPicker (dia + horário), AppointmentActions (botões por papel), DemoNotice
│   ├── patient/   # Painel, agendamento, minhas consultas, convênio
│   ├── admin/     # Agenda da clínica, pacientes (e telas ilustrativas de gestão)
│   └── auth/      # Login, cadastro, redefinição de senha
└── testing/fakeSupabase.ts  # Cliente de teste sobre PostgreSQL real (só nos testes)
```

Decisões que valem saber:

- **Regra de negócio fica no banco.** O front só chama funções SQL (`db/migrations/002_agendamento_v1.sql`)
  e mostra os botões que vão funcionar (`lib/appointmentRules.ts` espelha as regras do SQL). Preço,
  status, local, autor e disponibilidade do horário nunca são decididos pelo navegador.
- **Sem "embeds" do PostgREST.** As funções devolvem linhas planas, então não dependem de relacionamentos
  entre tabelas no cache de schema.
- **Fuso da clínica.** Todo horário é gravado em UTC e exibido em `America/Sao_Paulo` (`lib/clinicTime.ts`),
  independentemente do fuso do navegador.
- **Só a chave `anon` vai para o navegador.** A segurança é RLS + funções com checagem de papel;
  o workflow de deploy recusa a `service_role` e procura segredos no bundle.
- **Contas reais não têm foto de banco de imagens:** o avatar é desenhado com as iniciais (`lib/avatar.ts`).

## Configurando o Supabase

Tudo está em [`db/README.md`](../db/README.md): ordem dos SQLs (schema → 001 → 002 → seed), contas de
demonstração, **Confirm email**, **Site URL / Redirect URLs** e onde copiar a URL e a chave anon.

## O que está ligado ao backend

| Tela / ação                                    | Origem dos dados                                                        |
| :--------------------------------------------- | :---------------------------------------------------------------------- |
| Login, logout, "esqueci a senha" + nova senha  | Supabase Auth (`services/auth.ts`)                                      |
| Cadastro de paciente                           | Supabase Auth + gatilho `handle_new_user` (papel sempre `PATIENT`)      |
| Perfil (nome, papel, convênio ativo / CRM)     | `profiles`, `list_patient_insurances()`, `list_doctors()`               |
| Menu e telas por papel                         | `profiles.role` (`lib/access.ts`)                                       |
| Agendar (paciente e recepção)                  | `list_doctors`, `get_available_days/slots`, `book_appointment`          |
| Minhas consultas, confirmar/reagendar/cancelar | `list_appointments`, `set_appointment_status`, `reschedule_appointment` |
| Agenda da clínica / do dentista                | `list_appointments` (filtros, visibilidade por papel no banco)          |
| Pacientes                                      | `list_patients`                                                         |
| Meu convênio                                   | `list_patient_insurances`                                               |
| Corpo clínico (lista)                          | `list_doctors`                                                          |

### Telas por papel

| Papel         | Vê                                                                                   |
| :------------ | :----------------------------------------------------------------------------------- |
| Paciente      | Início, Agendar, Consultas, Convênio, Prontuário\*, Configurações\*                  |
| Dentista      | Minha Agenda (inicia/conclui atendimento), Meus Pacientes, Configurações\*           |
| Recepção      | Agenda, Novo Agendamento, Pacientes, Equipe\*, Faturamento\*, Salas\*, Visão Geral\* |
| Administrador | Tudo da recepção + Relatórios\*                                                      |

\* Tela ilustrativa (dados de exemplo) — veja abaixo.

## Pendências (ainda com dados de exemplo)

As telas abaixo aparecem com o aviso **"Tela ilustrativa"** quando o app está no modo Supabase e
constam do backlog em [`ENTREGA-V1.md`](./ENTREGA-V1.md):

- **Faturamento TISS / glosas / auditoria IA** — não há tabelas de guias TISS.
- **Salas / consultórios** — não há tabela de salas.
- **Odontograma / prontuário** — a tabela `medical_records` existe, mas não há telas ligadas a ela.
- **Dashboards administrativos** (KPIs, gráficos) — números fixos do protótipo.
- **Equipe**: a lista de profissionais é real; os indicadores (receita, NPS, comissão) são de exemplo.
- **Cadastro de novo profissional** — criar usuário exige a _service-role key_; precisa de um endpoint
  no backend (NestJS ou Edge Function). Hoje só adiciona na sessão.
- **Convênio e endereço no cadastro** — `patient_insurances` só aceita escrita da equipe (RLS) e
  `profiles` não tem colunas de endereço; a recepção cadastra a carteirinha no atendimento.
- **Login social (Google/Gov.br)** — não configurado.

## Testes

| Nível              | Arquivos                                    | Como rodar                                                                  |
| :----------------- | :------------------------------------------ | :-------------------------------------------------------------------------- |
| Regras puras       | `src/lib/*.test.ts`                         | `npm test -w @kaukamed/web`                                                 |
| Gateways e mappers | `src/services/*.test.ts`                    | idem (inclui um teste que confere os parâmetros das RPCs contra o SQL real) |
| Fluxos de tela     | `src/App.demo.test.tsx` (modo demonstração) | idem                                                                        |
| App × SQL real     | `src/integration/remote.db.test.tsx`        | `KAUKAMED_TEST_DATABASE_URL=postgres://… npm test -w @kaukamed/web`         |

Os testes de integração precisam de um banco com compat + schema + migrations + seed (veja
[`db/README.md`](../db/README.md)); sem a variável eles são ignorados. O CI roda tudo num
PostgreSQL limpo a cada Pull Request.

**O que não é coberto:** o PostgREST e o GoTrue em si (só existem no Supabase), o navegador real
(não há testes E2E com Playwright) e o layout visual em telas pequenas.

## Ajustes de qualidade

- `tsconfig.json` estende `tsconfig.base.json` (modo `strict`), mas desliga
  `noUnusedLocals`, `noUnusedParameters` e `noUncheckedIndexedAccess`, que o código
  gerado pelo protótipo ainda não atende.
- Dependências sem uso no código do protótipo foram removidas: `@google/genai`,
  `express`, `dotenv`, `motion`, `lucide-react`.
- Ícones decorativos (`material-symbols-outlined`) nos componentes novos têm `aria-hidden`
  para que leitores de tela não leiam o nome do ícone.
