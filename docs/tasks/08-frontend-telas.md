# 08 — Front-end: Telas e Componentes

> **Responsável:** FE · **Depende de:** 02–07 (contratos/serviços) · **Bloqueia:** 09, 10
> **Status (Entrega 5):** 14/26 tarefas concluídas (54%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Interface em **Next.js (App Router, export estático) + Tailwind CSS + Shadcn/UI**,
consumindo o Supabase via TanStack Query. Estado global com Zustand; formulários
com React Hook Form + Zod; ícones Lucide; datas com date-fns (pt-BR).

---

## 📌 Tarefas

### Fundação de UI

- [x] Layout base: header com logo, navegação por role, menu do usuário (perfil/sair)
- [x] Tema com a identidade visual (cores, tipografia) via tokens do Tailwind
- [ ] Componentes base do Shadcn/UI: Button, Input, Select, Dialog, Table, Toast, Badge, Calendar
- [ ] Componentes de domínio reutilizáveis: `<StatusBadge>` (status da consulta),
      `<RoleBadge>`, `<DatePicker>` pt-BR, `<EmptyState>`, `<ConfirmDialog>`
- [ ] Estados de loading (skeletons) e de erro padronizados nas queries
- [ ] Responsividade mobile-first em todas as telas

### Telas públicas / auth (módulo 02)

- [x] `/login` — formulário de login + link de recuperação de senha
- [x] `/cadastro` — registro de paciente (dados pessoais + credenciais)
- [x] Recuperação de senha: e-mail com link + tela "Definir nova senha" (falta validar com e-mail real)

### Telas do paciente

- [x] Dashboard: próximas consultas + ações rápidas (agendar, meu convênio)
- [x] `/agendar` — wizard: especialidade → médico → data/slot → convênio → confirmação
- [x] `/minhas-consultas` — próximas × histórico, com cancelamento
- [ ] `/meu-historico` — prontuários e prescrições (módulo 06)
- [ ] `/meu-perfil` e `/meu-convenio`

### Telas do médico

- [x] Dentista — "Minha Agenda" do dia, da semana e das próximas consultas, com status
- [ ] `/atendimento/[id]` — iniciar/finalizar consulta + formulário de prontuário/prescrição
- [x] `/minha-agenda` — visão semanal

### Telas do funcionário

- [x] Agenda geral com filtros (médico, data, status)
- [x] Busca de pacientes + agendamento em nome do paciente
- [x] Confirmação de presença / marcação de falta (NO_SHOW)

### Telas do admin

- [ ] CRUDs: usuários, médicos, especialidades, locais, operadoras
- [ ] Tela de auditoria (`audit_logs`)

---

## ✅ Critérios de aceite

- [ ] Todas as jornadas navegáveis por role, sem rotas quebradas
- [ ] Formulários validam com Zod e exibem mensagens em pt-BR
- [x] Build estático (`vite build`) sem erros
- [ ] Interface responsiva (mobile e desktop) e com feedback de loading/erro
