# 05 — Consultas & Agendamentos

> **Responsável:** BE-A · **Depende de:** 04 · **Bloqueia:** 06
> **Status (Entrega 5):** 20/23 tarefas concluídas (87%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Ciclo de vida completo da consulta sobre a tabela `appointments`:
`SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED`, com desvios para
`CANCELLED` e `NO_SHOW`. Tipos: `FIRST_VISIT`, `FOLLOW_UP`, `RETURN`,
`EMERGENCY`, `TELEMEDICINE`.

---

## 📌 Tarefas

### Criação de agendamento

- [x] Fluxo do paciente: escolher especialidade → médico → data → slot disponível → tipo de consulta → confirmar
- [x] Fluxo do funcionário/admin: agendar em nome de qualquer paciente (busca por nome/CPF)
- [x] Serviço de agendamento (`Gateway.bookAppointment` → função SQL `book_appointment`) gravando paciente, médico, local, início/fim, tipo, convênio (opcional) e observações
      início/fim, tipo, convênio utilizado (opcional) e observações
- [x] Impedir duplo agendamento no mesmo slot (constraint/validação + tratamento do erro no front)
- [x] Impedir que o paciente tenha 2 consultas no mesmo horário

### Ciclo de status

- [x] Transições e quem pode executá-las:
  - [x] `SCHEDULED → CONFIRMED` — EMPLOYEE/ADMIN (ou paciente confirma presença)
  - [x] `CONFIRMED → IN_PROGRESS` — DOCTOR (inicia atendimento)
  - [x] `IN_PROGRESS → COMPLETED` — DOCTOR (finaliza; habilita prontuário, módulo 06)
  - [x] `SCHEDULED/CONFIRMED → CANCELLED` — paciente (só a própria, com antecedência mínima) ou EMPLOYEE/ADMIN (qualquer, com motivo)
  - [x] `CONFIRMED → NO_SHOW` — EMPLOYEE/ADMIN quando o paciente falta
- [x] Bloquear transições inválidas (ex.: cancelar consulta COMPLETED) no serviço e via policy/trigger

### Listagens

- [x] **Paciente:** "Minhas consultas" (próximas × histórico), com cancelamento
- [x] **Médico:** "Minha agenda" do dia/semana com status de cada consulta
- [ ] **Funcionário/Admin:** agenda geral com filtros (médico, data, status, paciente) e paginação — _parcial: filtros prontos; sem paginação (limite de 500 por consulta)_
- [x] Labels pt-BR dos status/tipos vindas de `packages/shared` (`APPOINTMENT_STATUS_LABELS`)

### Regras auxiliares

- [x] Registrar `cancelled_reason`/autor do cancelamento
- [x] Reabrir o slot automaticamente quando uma consulta é cancelada
- [x] Testes das regras de transição e conflito de horários

---

## ✅ Critérios de aceite

- [x] Paciente agenda, visualiza e cancela a própria consulta de ponta a ponta
- [ ] Dois usuários não conseguem reservar o mesmo slot (teste concorrente) — _o banco impede (restrição de sobreposição + teste sequencial); falta o teste concorrente_
- [x] Todas as transições de status respeitam a matriz de permissões por role
- [ ] Agenda do médico e agenda geral refletem os dados reais do Supabase — _validado no PostgreSQL local; falta conferir no site publicado_
