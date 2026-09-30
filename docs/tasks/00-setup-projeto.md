# 00 — Setup do Projeto e Ambientes

> **Responsável:** DBA + FE · **Depende de:** — · **Bloqueia:** todos os módulos
> **Status (Entrega 5):** 16/24 tarefas concluídas (67%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Preparação do monorepo, do projeto Supabase e das variáveis de ambiente para
que todos consigam desenvolver localmente e fazer deploy.

---

## 📌 Tarefas

### Monorepo e ferramentas

- [x] Estruturar monorepo com npm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- [x] Configurar TypeScript base (`tsconfig.base.json`), ESLint e Prettier
- [x] Configurar Husky + lint-staged (pre-commit)
- [x] Docker Compose com PostgreSQL + Redis para desenvolvimento local
- [x] Adicionar script `npm run dev` unificado (web + api em paralelo, ex.: `concurrently`)
- [x] Documentar no `README.md` o passo a passo de setup do zero (clone → install → env → dev)

### Projeto Supabase

- [x] Criar projeto no Supabase e executar `db/kaukamed_schema.sql` no SQL Editor
- [x] Criar os `.env.example` com todas as variáveis necessárias (raiz: Docker; `apps/web/.env.example`: front-end; `apps/api/.env.example`: API)
  - [x] `VITE_SUPABASE_URL` (Vite no lugar do Next.js; em `apps/web/.env.example`)
  - [x] `VITE_SUPABASE_ANON_KEY` (em `apps/web/.env.example`)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (somente uso server-side/seeds — **nunca** no front)
  - [ ] `DATABASE_URL` (conexão Postgres do Supabase, para Prisma/migrations)
- [ ] Configurar os **Auth settings** do Supabase (Site URL apontando para o GitHub Pages,
      redirect URLs, e-mail de confirmação desabilitado para facilitar testes acadêmicos)
- [ ] Registrar as credenciais compartilhadas em local seguro da equipe (não commitar)

### Dependências do front (adaptação GitHub Pages)

- [x] Instalar e configurar `@supabase/supabase-js` em `apps/web`
- [x] Criar módulo `apps/web/src/lib/supabase.ts` (client singleton lendo as envs públicas)
- [x] Instalar e configurar Tailwind CSS 4 (Shadcn/UI e Lucide ficaram de fora: o protótipo usa componentes próprios e Material Symbols)
- [ ] Instalar TanStack Query, Zustand, React Hook Form e Zod em `apps/web`
- [x] Configurar o `base` do Vite (`VITE_BASE_PATH`, ex.: `/KaukaMed/`) para o GitHub Pages — o front é Vite, não Next.js

### CI básico

- [x] Criar workflow GitHub Actions de CI (`.github/workflows/ci.yml`): `lint` + `typecheck` + testes + `build` em cada PR, mais o job do banco de dados
- [ ] Proteger a branch `main` (PR obrigatório + CI verde)

---

## ✅ Critérios de aceite

- [ ] `npm install && npm run dev` sobe o front local conectado ao Supabase
- [x] `.env.example` completo e sem segredos reais commitados
- [ ] CI executa em todo PR e bloqueia merge com erro de lint/build
