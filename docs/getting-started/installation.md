# Instalação

## Pré-requisitos

- Node.js **22+** e npm **10+** (`nvm use` lê `.nvmrc`);
- Docker com Compose para PostgreSQL e Redis;
- Git.

```bash
git clone https://github.com/havaianasdestruido/KaukaMed.git
cd KaukaMed
nvm use
npm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run infra:up
npm run dev
```

Acesse o front em `http://localhost:3000`, a API em `http://localhost:3333/api/v1` e esta documentação, em outro terminal, com `npm run docs:dev` (`http://localhost:3001`).

## Verificação

```bash
curl http://localhost:3333/api/v1
npm run typecheck
npm run lint
npm run build
```

Se as portas estiverem ocupadas, altere `POSTGRES_PORT`/`REDIS_PORT` na raiz, `PORT` na API e mantenha `DATABASE_URL`/`REDIS_URL` coerentes.
