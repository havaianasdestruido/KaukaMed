# Arquitetura do monorepo

O npm workspaces centraliza instalação e scripts. A dependência flui de `web` e `api` para `shared`; o pacote compartilhado não conhece os aplicativos.

```text
Navegador ──HTTP──> apps/web ──HTTP──> apps/api ──> PostgreSQL / Redis
                         │             │
                         └── @kaukamed/shared ─────┘
```

Hoje a persistência ainda não está conectada à API. O schema SQL e a infraestrutura antecipam essa camada. Não confunda itens descritos no roadmap com recursos implementados.

## Princípios

1. contratos entre pontas vivem em `packages/shared`;
2. datas de contratos trafegam em ISO 8601 UTC;
3. texto para pessoas usa pt-BR, identificadores usam inglês;
4. autorização deve existir no backend/RLS, nunca apenas na interface;
5. módulos de domínio futuros são registrados no `AppModule`.
