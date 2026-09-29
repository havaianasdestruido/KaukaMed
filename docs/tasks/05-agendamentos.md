# 05 — Consultas & Agendamentos

> **Responsável:** BE-A · **Depende de:** 04 · **Bloqueia:** 06

Ciclo de vida completo da consulta sobre a tabela `appointments`:
`SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED`, com desvios para
`CANCELLED` e `NO_SHOW`. Tipos: `FIRST_VISIT`, `FOLLOW_UP`, `RETURN`,
`EMERGENCY`, `TELEMEDICINE`.

---

## 📌 Tarefas

### Criação de agendamento
- [ ] Fluxo do paciente: escolher especialidade → médico → data → slot disponível → tipo de consulta → confirmar
- [ ] Fluxo do funcionário/admin: agendar em nome de qualquer paciente (busca por nome/CPF)
- [ ] Serviço `appointments.ts`: `createAppointment(...)` gravando paciente, médico, local,
      início/fim, tipo, convênio utilizado (opcional) e observações
- [ ] Impedir duplo agendamento no mesmo slot (constraint/validação + tratamento do erro no front)
- [ ] Impedir que o paciente tenha 2 consultas no mesmo horário

### Ciclo de status
- [ ] Transições e quem pode executá-las:
  - [ ] `SCHEDULED → CONFIRMED` — EMPLOYEE/ADMIN (ou paciente confirma presença)
  - [ ] `CONFIRMED → IN_PROGRESS` — DOCTOR (inicia atendimento)
  - [ ] `IN_PROGRESS → COMPLETED` — DOCTOR (finaliza; habilita prontuário, módulo 06)
  - [ ] `SCHEDULED/CONFIRMED → CANCELLED` — paciente (só a própria, com antecedência mínima) ou EMPLOYEE/ADMIN (qualquer, com motivo)
  - [ ] `CONFIRMED → NO_SHOW` — EMPLOYEE/ADMIN quando o paciente falta
- [ ] Bloquear transições inválidas (ex.: cancelar consulta COMPLETED) no serviço e via policy/trigger

### Listagens
- [ ] **Paciente:** "Minhas consultas" (próximas × histórico), com cancelamento
- [ ] **Médico:** "Minha agenda" do dia/semana com status de cada consulta
- [ ] **Funcionário/Admin:** agenda geral com filtros (médico, data, status, paciente) e paginação
- [ ] Labels pt-BR dos status/tipos vindas de `packages/shared` (`APPOINTMENT_STATUS_LABELS`)

### Regras auxiliares
- [ ] Registrar `cancelled_reason`/autor do cancelamento
- [ ] Reabrir o slot automaticamente quando uma consulta é cancelada
- [ ] Testes das regras de transição e conflito de horários

---

## ✅ Critérios de aceite
- [ ] Paciente agenda, visualiza e cancela a própria consulta de ponta a ponta
- [ ] Dois usuários não conseguem reservar o mesmo slot (teste concorrente)
- [ ] Todas as transições de status respeitam a matriz de permissões por role
- [ ] Agenda do médico e agenda geral refletem os dados reais do Supabase
