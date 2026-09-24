# TODO.md — OdontoAura

> Plano de entregas baseado na SPEC.md adaptado ao fluxo acadêmico (GitHub + Supabase + GitHub Pages).
> **Equipe (4 pessoas):**
> - 🖥️ **Front-end (FE)** — 1 pessoa
> - ⚙️ **Back-end A (BE-A)** — APIs de domínio (agendamentos, prontuários)
> - ⚙️ **Back-end B (BE-B)** — Auth, RBAC, convênios, integrações
> - 🗄️ **Banco de Dados (DBA)** — Supabase, schema, seeds, documentação
>
> ⚠️ **Adaptações da SPEC (obrigatórias pelo ambiente de hospedagem):**
> - Banco hospedado no **Supabase** (PostgreSQL gerenciado) — substitui o PostgreSQL/Redis self-hosted
> - Front-end em **GitHub Pages** (estático) — Next.js com export estático (SSG) + Supabase client direto; o backend NestJS pode ser adaptado para **Supabase Edge Functions** ou deploy em serviço gratuito (Vercel/Railway)

---

## 📦 Entrega 1 — SPEC Consolidada
**Responsável:** DBA (consolida) · Apoio: toda a equipe revisa
- [ ] Consolidar a documentação da stack em um único `SPEC.md` (frontend, backend, banco de dados)
- [ ] Revisar e aprovar o SPEC.md com a equipe inteira
- [ ] Compactar os arquivos de referência (`.zip`)
- [ ] Anexar o `SPEC.md` + `.zip` no local de entrega solicitado pelo professor

---

## 📦 Entrega 2 — Repositório GitHub
**Responsável:** BE-A (cria) · Toda a equipe colabora
- [ ] Criar organização/repositório `odontoaura` no GitHub
- [ ] Definir estrutura: `docs/`, `database/`, `frontend/`, `backend/` (se houver)
- [ ] Configurar `README.md` com descrição, equipe e como rodar
- [ ] Adicionar os professores como colaboradores (Settings → Collaborators)
- [ ] Proteger a branch `main` e definir fluxo de trabalho (branch por tarefa + Pull Request)

---

## 📦 Entrega 3 — Banco de Dados no Supabase
**Responsável:** DBA
- [ ] Enviar o `SPEC.md` ao **Kimi** com o prompt: *"Com base na SPEC anexada, gere o esquema SQL completo (PostgreSQL) do sistema OdontoAura, com todas as tabelas, tipos ENUM de roles e status, chaves primárias/estrangeiras, constraints, índices e triggers de updated_at"*
- [ ] Revisar o SQL gerado (tabelas: usuários/perfil, médicos, especialidades, agendamentos, prontuários, prescrições, operadoras/convênios)
- [ ] Criar o projeto/database no **Supabase**
- [ ] Executar o schema no SQL Editor do Supabase
- [ ] Habilitar **Row Level Security (RLS)** com policies por role (PATIENT, EMPLOYEE, DOCTOR, ADMIN)
- [ ] Inserir seeds (usuários de teste para cada papel, especialidades, operadoras)
- [ ] Gerar `database/schema.sql` e salvar no repositório
- [ ] Documentar as credenciais de conexão (URL + anon key) no `.env.example`

---

## 📦 Entrega 4 — Quebra da SPEC em Tarefas (para IA programar)
**Responsável:** DBA (coordena) · Apoio: BE-A, BE-B, FE
- [ ] Enviar o `SPEC.md` + `schema.sql` ao **Kimi** com o prompt: *"Com base na SPEC e no schema do Supabase, quebre o sistema em tarefas de programação detalhadas, no formato markdown com checkboxes, organizadas por módulo e ordem de dependência"*
- [ ] Revisar e ajustar as tarefas geradas (remover duplicatas, validar dependências)
- [ ] Converter cada bloco de tarefas em arquivos **.md** separados (ex.: `docs/tasks/01-auth.md`, `02-agendamentos.md`, ...)
- [ ] Commitar e enviar todos os .md de tarefas para o GitHub
- [ ] Criar GitHub Issues (ou Projects) a partir dos .md para rastreamento

---

## 📦 Entrega 5 — Primeira Versão (≥50% funcional)
**Responsável:** Toda a equipe — divisão abaixo
**Deadline:** sistema hospedado, conectado ao Supabase, com login de teste para o professor

### Divisão de trabalho
- [ ] **FE:** setup do front com export estático (Next.js SSG ou React+Vite), Tailwind + Shadcn/UI, cliente Supabase, telas de Login/Cadastro e Dashboard base
- [ ] **BE-A:** módulo de Agendamentos (listar horários, criar/cancelar consulta, ciclo de status) via Supabase client/Edge Functions
- [ ] **BE-B:** módulo de Autenticação (registro, login com Supabase Auth, RBAC por role via RLS) + Perfil do usuário
- [ ] **DBA:** suporte ao schema, seeds, policies RLS e correções de SQL durante o desenvolvimento

### Checklist da entrega
- [ ] Funcionalidades ≥50% de acordo com a SPEC (login, cadastro, agendamento básico, listagem de consultas)
- [ ] Deploy do front-end no **GitHub Pages** (workflow de CI com `gh-pages` ou Actions)
- [ ] Conexão front ↔ Supabase funcionando em produção (variáveis de ambiente no build)
- [ ] Criar usuário de teste e validar login no ambiente hospedado
- [ ] Escrever `docs/ENTREGA-V1.md` contendo:
  - [ ] 🔗 Link da aplicação hospedada no GitHub Pages
  - [ ] 👤 Dados de login/senha para o professor
  - [ ] 📋 Lista do que falta finalizar (backlog restante)
- [ ] Anexar o `ENTREGA-V1.md` na entrega

---

## 📦 Entrega 6 — Documentação do Sistema
**Responsável:** DBA (diagramas/Miro) · FE (manual de uso) · BE-B (identidade visual)

### 6.1 Diagramas no Miro
- [ ] Enviar ao **miro.com** (via AI/Mermaid import) o `SPEC.md` + esquema do banco
- [ ] Gerar **Diagrama de Classes** a partir da SPEC
- [ ] Gerar **Diagrama de Entidade-Relacionamento (ER)** a partir do schema
- [ ] Exportar as imagens dos dois diagramas (PNG/SVG)

### 6.2 Manual de Uso (Gemini → Google Docs → PDF)
- [ ] Anexar no **Gemini**: `SPEC.md` + diagrama de classes + capturas de tela do sistema
- [ ] Prompt: *"A partir das informações anexadas, gere um manual completo de uso do sistema"*
- [ ] Exportar a resposta para o **Google Docs**
- [ ] Aplicar a identidade visual do sistema na formatação
- [ ] Salvar como **PDF**

### 6.3 Manual de Identidade Visual
- [ ] Criar/atualizar o arquivo `DESIGN.md` (cores, tipografia, logo, componentes — baseado nas telas do Stitch/Material You)
- [ ] Anexar no **Gemini**: logotipo + `DESIGN.md`
- [ ] Prompt: *"A partir dos arquivos anexados, crie um manual de identidade visual do sistema"*
- [ ] Exportar o conteúdo para **Google Slides/Canva**, ajustar a formatação
- [ ] Salvar como **PDF**

### 6.4 Consolidação e Envio
- [ ] Reunir em uma única pasta: diagramas do Miro (imagens) + manuais em PDF
- [ ] Compactar a pasta em `.zip`
- [ ] Realizar o envio final da documentação

---

## 📦 Entrega 7 — Versão Final
**Responsável:** Toda a equipe
- [ ] FE: finalizar todas as telas e fluxos pendentes do backlog da V1
- [ ] BE-A: concluir módulos de agendamentos e prontuários (100%)
- [ ] BE-B: concluir auth, RBAC, convênios e perfis (100%)
- [ ] DBA: revisar RLS, índices e seeds finais
- [ ] Garantir testes de todas as jornadas (Paciente, Funcionário, Médico, Admin)
- [ ] Atualizar `README.md` e `SPEC.md` com o que foi efetivamente implementado
- [ ] Deploy final no GitHub Pages + validação completa no ambiente de produção
- [ ] Atualizar `docs/ENTREGA-V1.md` → criar `docs/ENTREGA-FINAL.md` (link, login, changelog)

---

## 📦 Entrega 8 — Apresentação (15 min)
**Responsável:** Toda a equipe (dividir falas)
- [ ] Preparar apresentação de 15 minutos para os professores (com participação da turma do 3º ano)
- [ ] Estrutura sugerida: problema → solução → demo ao vivo → arquitetura (schema/ER) → desafios → conclusão
- [ ] Preparar respostas para perguntas prováveis dos professores (escolhas da stack, RLS, deploy, limitações)
- [ ] Gerar **QR Code** para:
  - [ ] Link do sistema hospedado (GitHub Pages)
  - [ ] Link da documentação (PDFs/drive)
- [ ] Testar o QR Code antes do dia da apresentação
- [ ] Nada impresso — somente QR Codes e demo ao vivo

---

## 📊 Visão Geral por Pessoa
| Pessoa | Entregas principais |
| :--- | :--- |
| **FE** | 5 (telas/deploy), 6.2 (capturas), 7, 8 |
| **BE-A** | 2, 4, 5 (agendamentos/prontuários), 7, 8 |
| **BE-B** | 5 (auth/RBAC/convênios), 6.3 (identidade visual), 7, 8 |
| **DBA** | 1, 3, 4, 5 (suporte), 6.1 (diagramas), 6.4, 7, 8 |
