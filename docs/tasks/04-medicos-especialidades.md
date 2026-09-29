# 04 — Médicos, Especialidades e Agendas

> **Responsável:** BE-A · **Depende de:** 03 · **Bloqueia:** 05

Cadastros que alimentam o agendamento: `specialties`, `locations`, `doctors`,
`doctor_specialties` e `doctor_schedules` (agenda semanal de cada médico).

---

## 📌 Tarefas

### Especialidades e locais (ADMIN)
- [ ] Serviço + telas CRUD de `specialties` (nome, descrição)
- [ ] Serviço + telas CRUD de `locations` (nome, endereço, cidade/UF, telefone, ativo)

### Médicos (ADMIN)
- [ ] Serviço `doctors.ts`: criar/editar médico vinculado a um `profile` com role `DOCTOR`
      (CRM, bio, valor de consulta e demais campos do schema)
- [ ] Vincular/desvincular especialidades (`doctor_specialties`, N:N)
- [ ] Listagem de médicos com filtro por especialidade, local e status

### Agenda semanal (`doctor_schedules`)
- [ ] Tela de configuração da agenda do médico: dia da semana (0=domingo),
      horário de início/fim, duração do slot, local
- [ ] Validações: fim > início, sem sobreposição de janelas no mesmo dia/local
- [ ] Médico (`DOCTOR`) pode visualizar a própria agenda; ADMIN/EMPLOYEE editam

### Disponibilidade (base do módulo 05)
- [ ] Função `getAvailableSlots(doctorId, date)`:
  1. Lê `doctor_schedules` do dia da semana correspondente
  2. Gera os slots pelo intervalo configurado
  3. Remove slots já ocupados em `appointments` (status ≠ CANCELLED/NO_SHOW)
  4. Remove horários no passado
- [ ] (Opcional/DBA) Implementar como função SQL/RPC no Supabase para reduzir round-trips
- [ ] Testes unitários da geração de slots (fuso horário, virada de dia, slot parcial)

---

## ✅ Critérios de aceite
- [ ] ADMIN cadastra especialidade, local e médico completos pela interface
- [ ] Agenda semanal configurada reflete corretamente nos slots disponíveis
- [ ] `getAvailableSlots` nunca retorna horário ocupado, passado ou fora da agenda
