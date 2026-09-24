# KaukaMed

Plataforma de gestão clínica (agendamento de consultas, prontuário eletrônico,
planos de saúde/convênios e controle de acesso por papéis), construída a partir da
stack definida em [`SPEC.md`](./SPEC.md) e organizada em fases no [`TODO.md`](./TODO.md).

## 🧱 Stack

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript |
| **Backend** | Node.js, NestJS, TypeScript |
| **Banco de dados** | PostgreSQL (Prisma ORM) e Redis |
| **Qualidade** | ESLint, Prettier, Husky + lint-staged |

> Consulte o [`SPEC.md`](./SPEC.md) para o detalhamento de cada tecnologia e o
> schema do banco em [`db/kaukamed_schema.sql`](./db/kaukamed_schema.sql).

## 📁 Estrutura do repositório

```
kaukamed/
├── apps/
│   ├── api/            # Backend NestJS (API REST em /api/v1)
│   └── web/            # Frontend Next.js (App Router)
├── packages/
│   └── shared/         # Tipos e contratos TypeScript compartilhados
├── db/
│   └── kaukamed_schema.sql
├── SPEC.md             # Stack tecnológica detalhada
├── TODO.md             # Plano de tarefas por fase
└── tsconfig.base.json  # Configuração TypeScript base do monorepo
```

O repositório usa **npm workspaces**: as dependências de todos os pacotes são
instaladas a partir da raiz e os pacotes se referenciam pelos nomes
`@kaukamed/api`, `@kaukamed/web` e `@kaukamed/shared`.

## ✅ Pré-requisitos

- **Node.js 22+** (veja [`.nvmrc`](./.nvmrc))
- **npm 10+**
- **Docker** + Docker Compose (para PostgreSQL e Redis em desenvolvimento)

## 🚀 Como rodar

```bash
# 1. Instalar as dependências de todo o monorepo
npm install

# 2. Subir a infraestrutura local (PostgreSQL e Redis)
npm run infra:up

# 3. Rodar API e front-end em modo de desenvolvimento
npm run dev
```

- Front-end (Next.js): http://localhost:3000
- API (NestJS): http://localhost:3333/api/v1

## 📜 Scripts disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Sobe API e front-end em modo watch (paralelo) |
| `npm run dev:api` | Sobe apenas a API NestJS |
| `npm run dev:web` | Sobe apenas o front-end Next.js |
| `npm run build` | Compila todos os pacotes em ordem de dependência |
| `npm run typecheck` | Valida os tipos TypeScript de todos os pacotes |
| `npm run lint` | Executa o ESLint em todos os pacotes |
| `npm run format` | Formata o código com Prettier |
| `npm run test` | Executa os testes de todos os pacotes |
| `npm run infra:up` / `npm run infra:down` | Sobe/derruba o Docker Compose (PostgreSQL + Redis) |

## 🤝 Convenções

- Todo o conteúdo destinado a pessoas (documentação, comentários, mensagens de UI,
  mensagens de erro e logs) é escrito em **português do Brasil (pt-BR)**.
- Identificadores de código (variáveis, funções, tabelas e colunas) seguem o padrão
  em **inglês**, mantendo compatibilidade com o schema existente em `db/`.
- Mensagens de commit seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## 📄 Licença

Este projeto está licenciado sob a [licença MIT](./LICENSE).
