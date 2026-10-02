# Testes e qualidade

A base já possui TypeScript estrito, ESLint flat config, Prettier e pre-commit. Suites automatizadas ainda fazem parte do roadmap.

## Gate recomendado

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run docs:build
```

Teste regras puras de `shared` unitariamente; services/controllers da API com testes unitários e integração; componentes por comportamento; jornadas críticas com E2E. Inclua casos de autorização negativa e políticas RLS. Não use dados pessoais reais em fixtures ou logs.
