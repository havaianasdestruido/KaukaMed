# Variáveis de ambiente

| Escopo  | Variável                         | Padrão/finalidade                     |
| ------- | -------------------------------- | ------------------------------------- |
| API     | `NODE_ENV`                       | `development`; aceita test/production |
| API     | `HOST`                           | `0.0.0.0`                             |
| API     | `PORT`                           | `3333`                                |
| API     | `DATABASE_URL`                   | URL PostgreSQL                        |
| API     | `REDIS_URL`                      | URL Redis                             |
| Web     | `NEXT_PUBLIC_APP_NAME`           | `KaukaMed`                            |
| Web     | `NEXT_PUBLIC_API_URL`            | `http://localhost:3333/api/v1`        |
| Compose | `POSTGRES_USER/PASSWORD/DB/PORT` | Credenciais e porta locais            |
| Compose | `REDIS_PORT`                     | Porta local do Redis                  |
| Docs    | `DOCS_URL`                       | Origem canônica de produção           |
| Docs    | `DOCS_BASE_URL`                  | Base, padrão `/KaukaMed/`             |

Segredos pertencem exclusivamente ao ambiente server-side. Mantenha exemplos fictícios e rotacione qualquer credencial exposta acidentalmente.
