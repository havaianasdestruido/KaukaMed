# 02 — Autenticação & RBAC

> **Responsável:** BE-B · **Depende de:** 01 · **Bloqueia:** 03–08
> **Status (Entrega 5):** 13/18 tarefas concluídas (72%) — detalhes em [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

Autenticação unificada via **Supabase Auth** (e-mail/senha) com controle de
acesso por papéis (`PATIENT`, `EMPLOYEE`, `DOCTOR`, `ADMIN`) garantido pelas
policies RLS do banco + guards no front.

---

## 📌 Tarefas

### Cadastro e login

- [x] Implementar serviço de autenticação em `apps/web/src/services/auth.ts` usando `supabase.auth`:
  - [x] `signUp(email, senha, dadosPerfil)` — cria usuário no Auth e registro em `profiles` (role padrão `PATIENT`)
  - [x] `signIn(email, senha)` / `signOut()`
  - [x] Recuperação de senha: `sendPasswordReset(email)` + tela de nova senha ao abrir o link do e-mail (falta validar com e-mail real)
- [x] Criar trigger/função no banco (ou chamada no signup) que insere automaticamente a linha
      em `profiles` quando um usuário é criado em `auth.users` (coordenar com DBA)
- [x] Validar inputs no formulário (e-mail, senha de no mínimo 8 caracteres, CPF com máscara e dígitos verificadores em `lib/cpf.ts`); Zod não foi adotado

### Sessão e estado global

- [x] Estado global da sessão (usuário logado, `profile` com `role`, carregamento) em React Context (`AppContext`); Zustand não foi adotado
- [x] Listener `supabase.auth.onAuthStateChange` para sincronizar sessão (login/logout/refresh)
- [ ] Persistência de sessão entre reloads (comportamento padrão do supabase-js, validar no export estático) — _implementada pelo supabase-js; falta validar no site publicado_

### RBAC no front

- [x] Helper de papel: `canAccess(role, tela)` / `homeFor(role)` em `lib/access.ts` (com testes)
- [x] Proteção de telas por papel e por sessão (guarda em `AppContext`/`App.tsx`: sem sessão → login; papel errado → tela inicial do papel)
- [x] Menu/navegação renderizada condicionalmente por role:
  - **PATIENT:** minhas consultas, agendar, meu perfil, meu convênio
  - **DOCTOR:** minha agenda, atendimentos, prontuários
  - **EMPLOYEE:** agenda geral, pacientes, agendamentos
  - **ADMIN:** tudo + cadastros (médicos, especialidades, convênios) + auditoria

### RBAC no banco (com DBA)

- [ ] Confirmar que as policies RLS refletem exatamente a matriz de permissões acima
- [ ] Testar acesso indevido (ex.: paciente tentando ler prontuário de outro paciente via API REST do Supabase) — deve retornar vazio/erro

---

## ✅ Critérios de aceite

- [ ] Cadastro cria usuário + perfil e já loga o usuário — _testado contra o PostgreSQL local; no Supabase depende de "Confirm email" estar desativado_
- [ ] Login/logout funcionam e a sessão sobrevive ao refresh da página — _logout e login testados; falta validar o refresh no site publicado_
- [x] Cada role vê apenas os menus e dados permitidos (testado com usuários seed de paciente, recepção e dentista na integração; administrador nos testes de acesso)
- [x] Nenhuma chave privada (`service_role`) exposta no bundle do front
