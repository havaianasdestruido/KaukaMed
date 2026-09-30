# 09 — Deploy no GitHub Pages + Conexão Supabase

> **Responsável:** FE + DBA · **Depende de:** 08 · **Bloqueia:** Entrega 5
> **Status (Entrega 5):** 10/19 tarefas concluídas (53%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Publicação do front estático no **GitHub Pages**, conectado ao Supabase de
produção, com os artefatos exigidos pela Entrega 5 do professor.

---

## 📌 Tarefas

### Build estático

- [x] Build estático do Vite com `base` = `/<repositório>/` (`VITE_BASE_PATH` definido no workflow) — o front não é Next.js
- [x] Garantir que o app é 100% estático (SPA client-side, sem SSR/route handlers)
- [x] Fallback `404.html` (cópia do `index.html` no workflow); `.nojekyll` é desnecessário no deploy por GitHub Actions

### Workflow de deploy

- [x] Criar `.github/workflows/deploy.yml`: build do `apps/web` + publish no GitHub Pages (actions oficiais `upload-pages-artifact`/`deploy-pages`)
- [ ] Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` como
      **GitHub Actions secrets/variables** injetadas no build
- [ ] Habilitar Pages no repositório (Settings → Pages → GitHub Actions)
- [x] Deploy automático a cada push na `main` (gatilho configurado em `deploy.yml`; depende de Pages e secrets — ver pendências)

### Configuração do Supabase para produção

- [ ] Adicionar a URL do GitHub Pages nas **Redirect URLs / Site URL** do Supabase Auth
- [ ] Validar CORS/uso da anon key a partir do domínio `*.github.io`
- [x] Confirmar que apenas a **anon key** vai para o bundle (o workflow recusa `service_role`/secret keys e faz `grep` no build)

### Validação da entrega (Entrega 5)

- [ ] Testar no ambiente publicado: login, cadastro, agendamento e listagem de consultas
- [ ] Validar login dos usuários de teste (um por role) no ambiente hospedado
- [x] Escrever `docs/ENTREGA-V1.md` com:
  - [x] 🔗 Link da aplicação no GitHub Pages
  - [x] 👤 Logins/senhas de teste para o professor
  - [x] 📋 Lista do que falta finalizar (backlog restante)

---

## ✅ Critérios de aceite

- [ ] Aplicação acessível publicamente no GitHub Pages e conectada ao Supabase
- [ ] Push na `main` publica automaticamente sem passos manuais
- [ ] Professor consegue logar com as credenciais do `docs/ENTREGA-V1.md`
