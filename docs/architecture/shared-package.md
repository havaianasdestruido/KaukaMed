# Pacote `@kaukamed/shared`

O pacote ESM compila `src` para `dist` e exporta contratos pela raiz. Ele contém:

- `user-role.ts`: `PATIENT`, `EMPLOYEE`, `DOCTOR`, `ADMIN`, labels e type guard;
- `appointment.ts`: tipos/status, labels, resumo e transições permitidas;
- `auth.ts`: usuário, perfil, login, tokens, JWT e recuperação;
- `api.ts`: informações da API, erros e paginação.

```ts
import { canTransitionAppointmentStatus, type LoginRequest } from '@kaukamed/shared';
canTransitionAppointmentStatus('CONFIRMED', 'IN_PROGRESS'); // true
```

Mantenha enums sincronizados com o SQL. Adicione somente contratos independentes de framework; não coloque componentes React, decorators Nest ou acesso ao banco neste pacote.
