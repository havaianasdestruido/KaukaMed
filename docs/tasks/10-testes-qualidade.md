# 10 — Testes & Qualidade

> **Responsável:** Toda a equipe (cada um testa seu módulo) · **Depende de:** 08
> **Status (Entrega 5):** 9/18 tarefas concluídas (50%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Garantia de qualidade conforme a SPEC: testes unitários (Vitest/Jest),
testes de componentes (React Testing Library), E2E (Playwright) e padronização
com ESLint/Prettier já configurados.

---

## 📌 Tarefas

### Unitários (Vitest)

- [x] Utilitários: validação de CPF, máscaras, formatação de datas pt-BR
- [x] Regras de negócio: geração de slots disponíveis (módulo 04), transições de status (módulo 05), status de cobertura do convênio (módulo 07)
- [ ] Schemas Zod dos formulários (casos válidos e inválidos)

### Componentes (React Testing Library)

- [x] Formulários de login/cadastro (validação e submissão)
- [x] Wizard de agendamento (fluxo entre etapas)
- [x] Proteção de telas por papel (menu por papel e redirecionamento): `lib/access.test.ts` e `App.demo.test.tsx`

### E2E (Playwright) — jornadas por role

- [ ] **Paciente:** cadastro → login → agendar consulta → ver em "minhas consultas" → cancelar — _no lugar do Playwright há cobertura equivalente em `App.demo.test.tsx` e `integration/remote.db.test.tsx`_
- [ ] **Médico:** login → agenda do dia → iniciar atendimento → prontuário + prescrição → finalizar
- [ ] **Funcionário:** login → agendar para um paciente → confirmar presença — _idem: coberto em `integration/remote.db.test.tsx`_
- [ ] **Admin:** login → cadastrar médico com agenda → verificar disponibilidade no fluxo do paciente

### Segurança (com DBA)

- [x] Testes de RLS: cada role tentando acessar dados proibidos, com papel e claims do JWT simulados no PostgreSQL (`db/tests/002_agendamento.test.sql`; o PostgREST em si só existe no Supabase)
- [x] Verificar ausência de segredos no bundle (`grep` por `service_role`/`sb_secret_` no workflow de deploy)

### Qualidade contínua

- [ ] Cobertura mínima acordada para regras de negócio (sugestão: 70%)
- [ ] E2E rodando no CI antes do deploy (ou ao menos localmente antes de cada entrega)
- [ ] Revisão final de acessibilidade básica (labels, foco, contraste) nas telas principais

---

## ✅ Critérios de aceite

- [x] `npm test` verde na raiz (unitários + componentes)
- [ ] 4 jornadas E2E passando contra ambiente local apontando para Supabase de teste
- [x] Nenhum acesso indevido possível nos testes de RLS
