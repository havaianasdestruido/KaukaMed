# Scripts

| Comando                           | Efeito                            |
| --------------------------------- | --------------------------------- |
| `npm run dev`                     | API e web em watch                |
| `npm run dev:api` / `dev:web`     | Um aplicativo isolado             |
| `npm run build`                   | Shared → API → web                |
| `npm run typecheck`               | Tipos de todos os workspaces      |
| `npm run lint` / `lint:fix`       | Verifica/corrige ESLint           |
| `npm run format:check` / `format` | Verifica/formata Prettier         |
| `npm test`                        | Testes disponíveis nos workspaces |
| `npm run infra:up` / `infra:down` | Controla PostgreSQL e Redis       |
| `npm run infra:logs`              | Segue logs dos contêineres        |
| `npm run db:psql` / `db:redis`    | Abre os clientes de banco/cache   |
| `npm run docs:dev`                | Portal Docusaurus local           |
| `npm run docs:build`              | Build estático da documentação    |

O `postinstall` compila `@kaukamed/shared`; ao editar o pacote, use `npm run build:shared` ou `npm run dev:shared`.
