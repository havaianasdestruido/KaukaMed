# 00 — Setup do Projeto e Ambientes

> **Responsável:** DBA + FE · **Depende de:** — · **Bloqueia:** todos os módulos

Preparação do monorepo, do projeto Supabase e das variáveis de ambiente para
que todos consigam desenvolver localmente e fazer deploy.

---

## 📌 Tarefas

### Monorepo e ferramentas
- [x] Estruturar monorepo com npm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- [x] Configurar TypeScript base (`tsconfig.base.json`), ESLint e Prettier
- [x] Configurar Husky + lint-staged (pre-commit)
- [x] Docker Compose com PostgreSQL + Redis para desenvolvimento local
- [ ] Adicionar script `npm run dev` unificado (web + api em paralelo, ex.: `concurrently`)
- [ ] Documentar no `README.md` o passo a passo de setup do zero (clone → install → env → dev)

### Projeto Supabase
- [x] Criar projeto no Supabase e executar `db/kaukamed_schema.sql` no SQL Editor
- [ ] Criar arquivo `.env.example` na raiz com todas as variáveis necessárias:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (somente uso server-side/seeds — **nunca** no front)
  - [ ] `DATABASE_URL` (conexão Postgres do Supabase, para Prisma/migrations)
- [ ] Configurar os **Auth settings** do Supabase (Site URL apontando para o GitHub Pages,
      redirect URLs, e-mail de confirmação desabilitado para facilitar testes acadêmicos)
- [ ] Registrar as credenciais compartilhadas em local seguro da equipe (não commitar)

### Dependências do front (adaptação GitHub Pages)
- [ ] Instalar e configurar `@supabase/supabase-js` em `apps/web`
- [ ] Criar módulo `apps/web/src/lib/supabase.ts` (client singleton lendo as envs públicas)
- [ ] Instalar Tailwind CSS + Shadcn/UI + Lucide React em `apps/web`
- [ ] Instalar TanStack Query, Zustand, React Hook Form e Zod em `apps/web`
- [ ] Configurar `next.config` com `output: 'export'` e `basePath`/`assetPrefix` do GitHub Pages

### CI básico
- [ ] Criar workflow GitHub Actions de CI: `lint` + `typecheck` + `build` em cada PR
- [ ] Proteger a branch `main` (PR obrigatório + CI verde)

---

## ✅ Critérios de aceite
- [ ] `npm install && npm run dev` sobe o front local conectado ao Supabase
- [ ] `.env.example` completo e sem segredos reais commitados
- [ ] CI executa em todo PR e bloqueia merge com erro de lint/build
