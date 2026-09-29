# 08 — Front-end: Telas e Componentes

> **Responsável:** FE · **Depende de:** 02–07 (contratos/serviços) · **Bloqueia:** 09, 10

Interface em **Next.js (App Router, export estático) + Tailwind CSS + Shadcn/UI**,
consumindo o Supabase via TanStack Query. Estado global com Zustand; formulários
com React Hook Form + Zod; ícones Lucide; datas com date-fns (pt-BR).

---

## 📌 Tarefas

### Fundação de UI
- [ ] Layout base: header com logo, navegação por role, menu do usuário (perfil/sair)
- [ ] Tema com a identidade visual (cores, tipografia) via tokens do Tailwind
- [ ] Componentes base do Shadcn/UI: Button, Input, Select, Dialog, Table, Toast, Badge, Calendar
- [ ] Componentes de domínio reutilizáveis: `<StatusBadge>` (status da consulta),
      `<RoleBadge>`, `<DatePicker>` pt-BR, `<EmptyState>`, `<ConfirmDialog>`
- [ ] Estados de loading (skeletons) e de erro padronizados nas queries
- [ ] Responsividade mobile-first em todas as telas

### Telas públicas / auth (módulo 02)
- [ ] `/login` — formulário de login + link de recuperação de senha
- [ ] `/cadastro` — registro de paciente (dados pessoais + credenciais)
- [ ] `/recuperar-senha` — fluxo de reset

### Telas do paciente
- [ ] Dashboard: próximas consultas + ações rápidas (agendar, meu convênio)
- [ ] `/agendar` — wizard: especialidade → médico → data/slot → convênio → confirmação
- [ ] `/minhas-consultas` — próximas × histórico, com cancelamento
- [ ] `/meu-historico` — prontuários e prescrições (módulo 06)
- [ ] `/meu-perfil` e `/meu-convenio`

### Telas do médico
- [ ] Dashboard: agenda do dia com status
- [ ] `/atendimento/[id]` — iniciar/finalizar consulta + formulário de prontuário/prescrição
- [ ] `/minha-agenda` — visão semanal

### Telas do funcionário
- [ ] Agenda geral com filtros (médico, data, status)
- [ ] Busca de pacientes + agendamento em nome do paciente
- [ ] Confirmação de presença / marcação de falta (NO_SHOW)

### Telas do admin
- [ ] CRUDs: usuários, médicos, especialidades, locais, operadoras
- [ ] Tela de auditoria (`audit_logs`)

---

## ✅ Critérios de aceite
- [ ] Todas as jornadas navegáveis por role, sem rotas quebradas
- [ ] Formulários validam com Zod e exibem mensagens em pt-BR
- [ ] Build estático (`next build` com `output: 'export'`) sem erros
- [ ] Interface responsiva (mobile e desktop) e com feedback de loading/erro
