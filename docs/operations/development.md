# Fluxo de desenvolvimento

1. Atualize a branch e rode `npm install` após mudanças no lockfile.
2. Suba infraestrutura com `npm run infra:up`.
3. Execute `npm run dev`; para contratos, mantenha também `npm run dev:shared`.
4. Faça mudanças pequenas e atualize documentação e tarefas relacionadas.
5. Antes do commit, rode `npm run lint`, `npm run typecheck`, `npm test` e os builds afetados.

O hook Husky executa lint-staged, corrigindo ESLint e Prettier somente nos arquivos staged. Isso é uma proteção rápida, não substitui a validação completa.

## Diagnóstico

- API falha no bootstrap: leia o erro Zod e confira o `.env` de maior prioridade.
- Banco não fica healthy: `npm run infra:logs` e confira portas/volume.
- mudança em `shared` não aparece: `npm run build:shared` e reinicie o consumidor.
- schema alterado localmente: recriar volume é destrutivo; salve dados necessários antes.
