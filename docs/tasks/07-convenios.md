# 07 — Planos de Saúde & Convênios

> **Responsável:** BE-B · **Depende de:** 03 · **Bloqueia:** 08 (tela de convênio)

Cadastro de operadoras (`health_insurances`) e vínculo paciente-convênio
(`patient_insurances`), com validação de carteirinha e status de cobertura
(`ACTIVE`, `SUSPENDED`, `EXPIRED`).

---

## 📌 Tarefas

### Operadoras (ADMIN)
- [ ] Serviço + telas CRUD de `health_insurances` (nome, código ANS, contato, ativo)
- [ ] Listagem com busca e ordenação

### Convênio do paciente (`patient_insurances`)
- [ ] Paciente cadastra seu convênio: operadora, número da carteirinha, validade, titular
- [ ] Validações: carteirinha única por operadora, validade futura, formato do número
- [ ] Cálculo automático do status de cobertura:
  - [ ] `ACTIVE` — dentro da validade
  - [ ] `EXPIRED` — validade vencida (job/verificação na leitura)
  - [ ] `SUSPENDED` — marcado manualmente por EMPLOYEE/ADMIN
- [ ] EMPLOYEE/ADMIN consultam e editam convênios de qualquer paciente

### Integração com agendamento (módulo 05)
- [ ] No fluxo de agendamento, permitir selecionar um convênio **ativo** do paciente (ou "particular")
- [ ] Exibir aviso quando o convênio estiver `SUSPENDED`/`EXPIRED` (bloquear seleção)
- [ ] Mostrar convênio utilizado nos detalhes da consulta e nas listagens administrativas

---

## ✅ Critérios de aceite
- [ ] ADMIN cadastra operadoras; paciente vincula a própria carteirinha
- [ ] Convênio vencido muda para `EXPIRED` e não pode ser usado em novo agendamento
- [ ] Funcionário valida a carteirinha de qualquer paciente na recepção
- [ ] Paciente não enxerga convênios de terceiros (RLS)
