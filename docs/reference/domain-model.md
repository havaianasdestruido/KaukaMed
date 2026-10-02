# Modelo de domínio

## Papéis

| Papel      | Escopo esperado                           |
| ---------- | ----------------------------------------- |
| `PATIENT`  | Próprias consultas, histórico e convênios |
| `EMPLOYEE` | Agenda clínica e confirmação              |
| `DOCTOR`   | Própria agenda, prontuários e prescrições |
| `ADMIN`    | Cadastros e auditoria                     |

## Agendamento

Fluxo principal: `SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED`. De agendado/confirmado também é possível cancelar ou marcar ausência; durante atendimento é possível concluir ou cancelar. `COMPLETED`, `CANCELLED` e `NO_SHOW` são finais.

Tipos suportados nos contratos: primeira consulta, retorno, reavaliação, urgência/emergência e teleconsulta. O banco impede sobreposição de horários para o mesmo médico ou paciente.

O prontuário pertence a uma consulta e agrega diagnósticos e prescrições. Convênios ligam pacientes a operadoras. Auditoria registra ator, ação e recurso para rastreabilidade clínica/LGPD.
