---
sidebar_position: 1
slug: /intro
title: Visão geral
---

# Documentação do KaukaMed

O **KaukaMed** é uma plataforma de gestão clínica para agendamentos, prontuários eletrônicos, convênios e controle de acesso. Este portal descreve o código que existe hoje e sinaliza separadamente o que pertence ao roadmap.

:::info Estado atual
A fundação do monorepo está concluída. A API expõe um endpoint de saúde, o front apresenta o roadmap e o banco possui um schema SQL completo. Prisma, autenticação e módulos de domínio ainda estão planejados.
:::

## Mapa do sistema

| Componente     | Diretório            | Responsabilidade                 | Tecnologia           |
| -------------- | -------------------- | -------------------------------- | -------------------- |
| Web            | `apps/web`           | Interface e configuração pública | Next.js 16, React 19 |
| API            | `apps/api`           | API REST sob `/api/v1`           | NestJS 12, Zod       |
| Contratos      | `packages/shared`    | Tipos e regras compartilhadas    | TypeScript           |
| Dados          | `db`                 | Schema, RLS e seed inicial       | PostgreSQL 17        |
| Infraestrutura | `docker-compose.yml` | Banco e cache locais             | Docker, Redis 8      |
| Documentação   | `apps/docs` + `docs` | Este portal e conteúdo           | Docusaurus 3         |

## Caminhos recomendados

- **Primeira contribuição:** [instalação](./getting-started/installation.md) → [desenvolvimento](./operations/development.md) → [contribuição](./operations/contributing.md).
- **Integração de cliente:** [API](./reference/api.md) → [contratos](./architecture/shared-package.md) → [variáveis](./reference/environment.md).
- **Evolução de domínio:** [modelo de domínio](./reference/domain-model.md) → [banco](./architecture/database.md) → [roadmap](./tasks/README.md).
