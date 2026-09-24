# KaukaMed

Plataforma de gestão clínica (agendamento de consultas, prontuário eletrônico,
planos de saúde/convênios e controle de acesso por papéis), construída a partir da
stack definida em [`SPEC.md`](./SPEC.md) e organizada em fases no [`TODO.md`](./TODO.md).

## 🧱 Stack

| Camada             | Tecnologias                             |
| :----------------- | :-------------------------------------- |
| **Frontend**       | Next.js (App Router), React, TypeScript |
| **Backend**        | Node.js, NestJS, TypeScript             |
| **Banco de dados** | PostgreSQL (Prisma ORM) e Redis         |
| **Qualidade**      | ESLint, Prettier, Husky + lint-staged   |

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

### 🔗 Tipos compartilhados (`@kaukamed/shared`)

`packages/shared` concentra tudo o que é contrato entre o front-end e o back-end:
papéis de usuário (`UserRole`), status e tipos de consulta (`AppointmentStatus`,
`AppointmentType`), formatos de autenticação (`LoginRequest`, `LoginResponse`,
`JwtPayload`) e envelopes de resposta da API (`ApiInfo`, `ApiErrorBody`,
`Paginated<T>`). Os rótulos exibidos na interface já ficam em pt-BR
(ex.: `APPOINTMENT_STATUS_LABELS.SCHEDULED === 'Agendado'`).

O pacote é compilado para `packages/shared/dist` e consumido pelos outros dois
apps através do symlink do workspace — o `postinstall` da raiz já roda
`npm run build:shared`, então basta um `npm install` para deixá-lo pronto.
Ao alterar algo em `packages/shared`, rode `npm run build:shared` novamente
(ou `npm run dev:shared` para ficar em modo watch).

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

| Comando                                   | Descrição                                          |
| :---------------------------------------- | :------------------------------------------------- |
| `npm run dev`                             | Sobe API e front-end em modo watch (paralelo)      |
| `npm run dev:api`                         | Sobe apenas a API NestJS                           |
| `npm run dev:web`                         | Sobe apenas o front-end Next.js                    |
| `npm run build`                           | Compila todos os pacotes em ordem de dependência   |
| `npm run typecheck`                       | Valida os tipos TypeScript de todos os pacotes     |
| `npm run lint`                            | Executa o ESLint em todos os pacotes               |
| `npm run lint:fix`                        | Executa o ESLint com correção automática           |
| `npm run format` / `npm run format:check` | Formata/valida a formatação com Prettier           |
| `npm run test`                            | Executa os testes de todos os pacotes              |
| `npm run infra:up` / `npm run infra:down` | Sobe/derruba o Docker Compose (PostgreSQL + Redis) |

## 🧹 Qualidade de código

- **ESLint (flat config)**: `eslint.config.mjs` na raiz define as regras comuns do
  monorepo e cada app estende essa base — `apps/api/eslint.config.mjs` (ambiente Node)
  e `apps/web/eslint.config.mjs` (regras do Next.js/Core Web Vitals).
- **Prettier**: configuração única em `.prettierrc.json` (100 colunas, aspas simples,
  vírgula final). Rode `npm run format` antes de enviar alterações.
- **Husky + lint-staged**: o hook `pre-commit` roda `eslint --fix` e `prettier --write`
  apenas nos arquivos modificados. Os hooks são instalados automaticamente no
  `npm install` (script `prepare` → `husky`).

## 🤝 Convenções

- Todo o conteúdo destinado a pessoas (documentação, comentários, mensagens de UI,
  mensagens de erro e logs) é escrito em **português do Brasil (pt-BR)**.
- Identificadores de código (variáveis, funções, tabelas e colunas) seguem o padrão
  em **inglês**, mantendo compatibilidade com o schema existente em `db/`.
- Mensagens de commit seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## 📄 Licença

Este projeto está licenciado sob a [licença MIT](./LICENSE).
