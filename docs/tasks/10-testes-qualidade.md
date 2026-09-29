# 10 — Testes & Qualidade

> **Responsável:** Toda a equipe (cada um testa seu módulo) · **Depende de:** 08

Garantia de qualidade conforme a SPEC: testes unitários (Vitest/Jest),
testes de componentes (React Testing Library), E2E (Playwright) e padronização
com ESLint/Prettier já configurados.

---

## 📌 Tarefas

### Unitários (Vitest)
- [ ] Utilitários: validação de CPF, máscaras, formatação de datas pt-BR
- [ ] Regras de negócio: geração de slots disponíveis (módulo 04), transições de status (módulo 05), status de cobertura do convênio (módulo 07)
- [ ] Schemas Zod dos formulários (casos válidos e inválidos)

### Componentes (React Testing Library)
- [ ] Formulários de login/cadastro (validação e submissão)
- [ ] Wizard de agendamento (fluxo entre etapas)
- [ ] `<RequireAuth>` (redireciona sem sessão; bloqueia role errada)

### E2E (Playwright) — jornadas por role
- [ ] **Paciente:** cadastro → login → agendar consulta → ver em "minhas consultas" → cancelar
- [ ] **Médico:** login → agenda do dia → iniciar atendimento → prontuário + prescrição → finalizar
- [ ] **Funcionário:** login → agendar para um paciente → confirmar presença
- [ ] **Admin:** login → cadastrar médico com agenda → verificar disponibilidade no fluxo do paciente

### Segurança (com DBA)
- [ ] Testes de RLS: cada role tentando acessar dados proibidos via API REST do Supabase
- [ ] Verificar ausência de segredos no bundle publicado (`grep` por service_role no build)

### Qualidade contínua
- [ ] Cobertura mínima acordada para regras de negócio (sugestão: 70%)
- [ ] E2E rodando no CI antes do deploy (ou ao menos localmente antes de cada entrega)
- [ ] Revisão final de acessibilidade básica (labels, foco, contraste) nas telas principais

---

## ✅ Critérios de aceite
- [ ] `npm test` verde na raiz (unitários + componentes)
- [ ] 4 jornadas E2E passando contra ambiente local apontando para Supabase de teste
- [ ] Nenhum acesso indevido possível nos testes de RLS
