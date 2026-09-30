# 06 — Prontuários Eletrônicos (EHR)

> **Responsável:** BE-A · **Depende de:** 05 · **Bloqueia:** 08 (telas clínicas)
> **Status (Entrega 5):** 0/16 tarefas concluídas (0%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Histórico clínico por consulta sobre `medical_records`, `record_diagnoses` e
`prescriptions`. Dados sensíveis: acesso restrito por RLS (médico autor,
paciente dono e ADMIN) e ações relevantes registradas em `audit_logs`.

---

## 📌 Tarefas

### Registro clínico (DOCTOR)

- [ ] Serviço `medicalRecords.ts`: criar prontuário vinculado a uma consulta `IN_PROGRESS`/`COMPLETED`
- [ ] Formulário de atendimento: anamnese, exame físico/observações, plano de tratamento (campos do schema)
- [ ] Adicionar diagnósticos (`record_diagnoses`): código (CID, texto livre) + descrição, múltiplos por prontuário
- [ ] Editar prontuário apenas pelo médico autor (janela de edição; depois somente leitura)

### Prescrições

- [ ] CRUD de prescrições (`prescriptions`) vinculadas ao prontuário: medicamento,
      dosagem, frequência, duração, instruções
- [ ] Visualização/print-friendly da prescrição para o paciente (página limpa para impressão)

### Histórico

- [ ] **Paciente:** linha do tempo dos próprios atendimentos (consulta → prontuário → prescrições)
- [ ] **Médico:** histórico completo do paciente antes/durante o atendimento
- [ ] Busca no histórico por período e diagnóstico

### Segurança e auditoria

- [ ] Confirmar policies RLS: paciente lê apenas os próprios prontuários; médico apenas os que criou/atende; ADMIN tudo
- [ ] Registrar em `audit_logs` criação/edição/visualização de prontuário (quem, quando, o quê)
- [ ] Tela de auditoria para ADMIN (listagem filtrável de `audit_logs`)

---

## ✅ Critérios de aceite

- [ ] Médico finaliza uma consulta preenchendo prontuário + diagnóstico + prescrição
- [ ] Paciente vê seu histórico completo, mas não o de outros pacientes
- [ ] Tentativas de acesso indevido retornam vazio (RLS) e ficam auditáveis
- [ ] Prescrição pode ser visualizada/impressa pelo paciente
