# Backend

A API NestJS inicia em `src/main.ts`, habilita shutdown hooks e aplica o prefixo global `/api/v1`. `AppModule` torna `ConfigModule` global e registra o controller e service raiz.

## Fluxo atual

`GET /api/v1` → `AppController.getApiInfo()` → `AppService.getApiInfo()`. O serviço usa `ConfigService<Environment, true>`, mantendo a configuração inferida e validada.

Ao criar módulos, organize cada domínio com controller, service, DTOs e testes. Importe classes injetadas como valores: `emitDecoratorMetadata` precisa delas em runtime. Transforme entidades internas em contratos explícitos e evite expor registros do banco diretamente.
