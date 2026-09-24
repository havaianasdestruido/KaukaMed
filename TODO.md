# TODO.md — OdontoAura

> Plano de tarefas derivado do SPEC.md (Stack Tecnológica OdontoAura).
> Ordem sugerida: Setup → Infra → Backend → Frontend → Testes → Qualidade/Deploy.

---

## 📋 Phase 0 — Setup do Projeto

- [x] Inicializar monorepo (ou repos separados) para `apps/web` (Next.js) e `apps/api` (NestJS)
- [x] Configurar TypeScript compartilhado com tipos comuns entre frontend e backend
- [x] Configurar ESLint + Prettier e hooks de pré-commit (Husky + lint-staged)
- [x] Configurar variáveis de ambiente (`.env`, `.env.example`) por ambiente
- [x] Configurar Docker/Docker Compose com PostgreSQL e Redis para dev local

> ✅ **Phase 0 concluída.** Entregáveis: monorepo com npm workspaces (`apps/api`,
> `apps/web` e `packages/shared`), `tsconfig.base.json` compartilhado com tipos de
> domínio em `@kaukamed/shared`, ESLint + Prettier + Husky/lint-staged, arquivos
> `.env.example` por pacote com validação das variáveis da API via Zod e
> `docker-compose.yml` com PostgreSQL 17 + Redis 8 (aplicando o schema do banco
> automaticamente). Detalhes de setup no [`README.md`](./README.md).

## 🗄️ Phase 1 — Banco de Dados & ORM

- [ ] Configurar PostgreSQL e conexão via Prisma ORM
- [ ] Configurar Redis (sessões, cache, rate limiting)
- [ ] Modelar entidades Prisma: Usuários & Perfis (roles: PATIENT, EMPLOYEE, DOCTOR, ADMIN)
- [ ] Modelar Médicos & Especialidades e locais de atendimento
- [ ] Modelar Consultas & Agendamentos (status: agendado, confirmado, finalizado, cancelado)
- [ ] Modelar Prontuários Eletrônicos (anamneses, diagnósticos, prescrições)
- [ ] Modelar Planos de Saúde & Convênios (operadoras, carteirinhas, cobertura)
- [ ] Criar e versionar migrações com Prisma Migrations
- [ ] Criar seeds (usuários de teste por papel, especialidades, operadoras)

## ⚙️ Phase 2 — Backend: Fundação

- [ ] Estruturar aplicação NestJS em módulos (Auth, Users, Doctors, Appointments, Records, HealthPlans)
- [ ] Configurar Injeção de Dependência e camadas (Controller → Service → Repository)
- [ ] Configurar Helmet e CORS
- [ ] Configurar rate limiting com Redis
- [ ] Configurar documentação OpenAPI/Swagger automática

## 🔐 Phase 3 — Backend: Autenticação & Autorização

- [ ] Implementar registro e login com JWT (stateless)
- [ ] Hashing de senhas com Bcrypt/Argon2
- [ ] Implementar RBAC com Guards por role (Paciente, Funcionário, Médico, Admin)
- [ ] Implementar refresh tokens e logout
- [ ] Implementar recuperação/redefinição de senha
- [ ] Proteger rotas sensíveis por papel

## 📄 Phase 4 — Backend: Domínio & API REST

- [ ] CRUD de Usuários e Perfis
- [ ] CRUD de Médicos, Especialidades e locais de atendimento
- [ ] CRUD de Agendamentos com regras de negócio (conflito de horários, ciclo de vida do status)
- [ ] CRUD de Prontuários Eletrônicos vinculados às consultas
- [ ] CRUD de Planos de Saúde & Convênios (validação de carteirinha, verificação de cobertura)
- [ ] Implementar cache em Redis (ex.: horários disponíveis de médicos)
- [ ] Validar DTOs com class-validator/Zod
- [ ] Tratamento global de erros e padronização de respostas

## 🎨 Phase 5 — Frontend: Fundação

- [ ] Inicializar Next.js com App Router + TypeScript
- [ ] Configurar Tailwind CSS e componentes Shadcn/UI + Radix UI
- [ ] Configurar cliente HTTP (Axios) com interceptors (token, refresh, erros)
- [ ] Configurar TanStack Query para estado assíncrono e cache da API
- [ ] Configurar Zustand para sessão do usuário e preferências da UI
- [ ] Configurar layout base, navegação por papel e tema

## 🌐 Phase 6 — Frontend: Telas & Fluxos

- [ ] Login, registro e recuperação de senha
- [ ] Dashboard do Paciente (agendar, visualizar, cancelar consultas)
- [ ] Dashboard do Funcionário (gestão de agenda, confirmação de consultas)
- [ ] Dashboard do Médico (agenda do dia, prontuário, prescrições)
- [ ] Dashboard do Admin (gestão de usuários, médicos, especialidades, convênios)
- [ ] Formulários com React Hook Form + Zod (cadastros, agendamento, prontuário)
- [ ] Listagens com filtros, paginação e busca (médicos, consultas, pacientes)
- [ ] Formatação de datas/horários com date-fns/Day.js
- [ ] Ícones com Lucide React

## 🧪 Phase 7 — Testes

- [ ] Testes unitários no backend (Jest/Vitest) — services e validadores
- [ ] Testes de integração de rotas com Supertest
- [ ] Testes unitários de componentes (Vitest + React Testing Library)
- [ ] Testes E2E (Playwright/Cypress) — jornada do Paciente
- [ ] Testes E2E — jornada do Funcionário
- [ ] Testes E2E — jornada do Médico
- [ ] Testes E2E — jornada do Administrador

## 🚀 Phase 8 — Qualidade, Deploy & Entrega

- [ ] Pipeline CI (lint, testes, build)
- [ ] Configurar ambientes (dev, staging, produção)
- [ ] Deploy do backend e PostgreSQL/Redis
- [ ] Deploy do frontend (SSR) com variáveis de ambiente
- [ ] Revisão de segurança (headers, CORS, rate limit, exposição do Swagger)
- [ ] Atualizar documentação (README, guia de setup, link do Swagger)
