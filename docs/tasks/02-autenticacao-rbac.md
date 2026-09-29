# 02 — Autenticação & RBAC

> **Responsável:** BE-B · **Depende de:** 01 · **Bloqueia:** 03–08

Autenticação unificada via **Supabase Auth** (e-mail/senha) com controle de
acesso por papéis (`PATIENT`, `EMPLOYEE`, `DOCTOR`, `ADMIN`) garantido pelas
policies RLS do banco + guards no front.

---

## 📌 Tarefas

### Cadastro e login
- [ ] Implementar serviço de autenticação em `apps/web/src/services/auth.ts` usando `supabase.auth`:
  - [ ] `signUp(email, senha, dadosPerfil)` — cria usuário no Auth e registro em `profiles` (role padrão `PATIENT`)
  - [ ] `signIn(email, senha)` / `signOut()`
  - [ ] `resetPassword(email)` (fluxo de recuperação de senha)
- [ ] Criar trigger/função no banco (ou chamada no signup) que insere automaticamente a linha
      em `profiles` quando um usuário é criado em `auth.users` (coordenar com DBA)
- [ ] Validar inputs com **Zod** (e-mail válido, senha mínima de 8 caracteres, CPF com máscara)

### Sessão e estado global
- [ ] Store **Zustand** de sessão: usuário logado, `profile` (com `role`), status de carregamento
- [ ] Listener `supabase.auth.onAuthStateChange` para sincronizar sessão (login/logout/refresh)
- [ ] Persistência de sessão entre reloads (comportamento padrão do supabase-js, validar no export estático)

### RBAC no front
- [ ] Hook `useRole()` / helper `hasRole(...roles)` lendo o `role` do `profiles`
- [ ] Componente `<RequireAuth roles={[...]}>` que protege páginas/rotas e redireciona para `/login`
- [ ] Menu/navegação renderizada condicionalmente por role:
  - **PATIENT:** minhas consultas, agendar, meu perfil, meu convênio
  - **DOCTOR:** minha agenda, atendimentos, prontuários
  - **EMPLOYEE:** agenda geral, pacientes, agendamentos
  - **ADMIN:** tudo + cadastros (médicos, especialidades, convênios) + auditoria

### RBAC no banco (com DBA)
- [ ] Confirmar que as policies RLS refletem exatamente a matriz de permissões acima
- [ ] Testar acesso indevido (ex.: paciente tentando ler prontuário de outro paciente via API REST do Supabase) — deve retornar vazio/erro

---

## ✅ Critérios de aceite
- [ ] Cadastro cria usuário + perfil e já loga o usuário
- [ ] Login/logout funcionam e a sessão sobrevive ao refresh da página
- [ ] Cada role vê apenas os menus e dados permitidos (validado com os 4 usuários seed)
- [ ] Nenhuma chave privada (`service_role`) exposta no bundle do front
