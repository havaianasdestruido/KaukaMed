# Contribuição

- conteúdo para pessoas em pt-BR e identificadores de código em inglês;
- commits no formato Conventional Commits (`feat:`, `fix:`, `docs:` etc.);
- uma mudança coesa por pull request, com contexto, testes e impacto;
- contratos públicos e comportamento novo exigem atualização desta documentação;
- não versione `.env`, dados clínicos, credenciais ou artefatos de build.

## Documentando

Conteúdo Markdown fica em `docs`; configuração e tema em `apps/docs`. Adicione a página a `sidebars.ts`, use links relativos e confira `npm run docs:build`, que falha em links quebrados. Diferencie claramente comportamento atual e planejado.
