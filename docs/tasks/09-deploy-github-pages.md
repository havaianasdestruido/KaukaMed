# 09 — Deploy no GitHub Pages + Conexão Supabase

> **Responsável:** FE + DBA · **Depende de:** 08 · **Bloqueia:** Entrega 5

Publicação do front estático no **GitHub Pages**, conectado ao Supabase de
produção, com os artefatos exigidos pela Entrega 5 do professor.

---

## 📌 Tarefas

### Build estático
- [ ] `next.config`: `output: 'export'`, `basePath: '/KaukaMed'`, `assetPrefix`, `images.unoptimized: true`
- [ ] Garantir que nenhuma página usa recursos server-only (SSR/route handlers) — apenas SSG + client
- [ ] Adicionar `.nojekyll` e fallback `404.html` para rotas client-side

### Workflow de deploy
- [ ] Criar `.github/workflows/deploy.yml`: build do `apps/web` + publish no GitHub Pages (actions oficiais `upload-pages-artifact`/`deploy-pages`)
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` como
      **GitHub Actions secrets/variables** injetadas no build
- [ ] Habilitar Pages no repositório (Settings → Pages → GitHub Actions)
- [ ] Deploy automático a cada push na `main`

### Configuração do Supabase para produção
- [ ] Adicionar a URL do GitHub Pages nas **Redirect URLs / Site URL** do Supabase Auth
- [ ] Validar CORS/uso da anon key a partir do domínio `*.github.io`
- [ ] Confirmar que apenas a **anon key** vai para o bundle (nunca a service_role)

### Validação da entrega (Entrega 5)
- [ ] Testar no ambiente publicado: login, cadastro, agendamento e listagem de consultas
- [ ] Validar login dos usuários de teste (um por role) no ambiente hospedado
- [ ] Escrever `docs/ENTREGA-V1.md` com:
  - [ ] 🔗 Link da aplicação no GitHub Pages
  - [ ] 👤 Logins/senhas de teste para o professor
  - [ ] 📋 Lista do que falta finalizar (backlog restante)

---

## ✅ Critérios de aceite
- [ ] Aplicação acessível publicamente no GitHub Pages e conectada ao Supabase
- [ ] Push na `main` publica automaticamente sem passos manuais
- [ ] Professor consegue logar com as credenciais do `docs/ENTREGA-V1.md`
