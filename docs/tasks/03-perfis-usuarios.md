# 03 — Perfis de Usuários

> **Responsável:** BE-B (apoio BE-A) · **Depende de:** 02 · **Bloqueia:** 04, 05, 07

CRUD de perfis sobre as tabelas `profiles` e `patients`, respeitando o RBAC.

---

## 📌 Tarefas

### Meu perfil (todas as roles)
- [ ] Serviço `profiles.ts`: `getMyProfile()`, `updateMyProfile(dados)`
- [ ] Tela "Meu Perfil": nome completo, CPF (máscara `000.000.000-00`), telefone,
      e-mail, data de nascimento — formulário com React Hook Form + Zod
- [ ] Impedir alteração do próprio `role` e de `is_active` pelo usuário comum (policy + UI)

### Dados de paciente (`patients`)
- [ ] Ao completar cadastro de um `PATIENT`, criar/atualizar registro em `patients`
      (endereço, contato de emergência, alergias/observações conforme schema)
- [ ] Tela de detalhes do paciente para EMPLOYEE/DOCTOR/ADMIN (leitura conforme RLS)

### Gestão de usuários (ADMIN)
- [ ] Listagem paginada de usuários com filtro por role, nome e status (`is_active`)
- [ ] Ação de ativar/desativar usuário (soft delete via `is_active`)
- [ ] Alterar role de um usuário (ex.: promover PATIENT → EMPLOYEE) — apenas ADMIN
- [ ] Cadastro de novos funcionários/médicos pelo ADMIN (cria Auth user + profile com role correta)

### Compartilhados
- [ ] Tipos/contratos em `packages/shared` (`Profile`, `Patient`, labels pt-BR de roles)
- [ ] Utilitários de máscara/validação de CPF e telefone reutilizáveis

---

## ✅ Critérios de aceite
- [ ] Usuário edita o próprio perfil e vê os dados persistidos no Supabase
- [ ] ADMIN gerencia usuários (listar, filtrar, ativar/desativar, mudar role)
- [ ] PATIENT não consegue ver nem editar perfis de terceiros (testado via RLS)
- [ ] CPF inválido ou duplicado é rejeitado com mensagem amigável
