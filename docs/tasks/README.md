# 📋 KaukaMed (OdontoAura) — Quebra da SPEC em Tarefas

> **Entrega 4** — SPEC quebrada em tarefas de programação detalhadas, organizadas
> por módulo e em **ordem de dependência**, para que uma IA (ou a equipe) programe.
>
> Fontes: [`SPEC.md`](../../SPEC.md) · [`db/kaukamed_schema.sql`](../../db/kaukamed_schema.sql) · [`TODO.md`](../../TODO.md)
>
> ⚠️ **Adaptações da SPEC ao ambiente de hospedagem:** banco no **Supabase**
> (PostgreSQL gerenciado + Supabase Auth + RLS) e front-end estático no
> **GitHub Pages** (Next.js com `output: 'export'`), com o cliente Supabase
> consumido diretamente pelo front. O backend NestJS (`apps/api`) fica como
> camada opcional/futura (Edge Functions ou deploy gratuito).

---

## 👥 Equipe e responsabilidades

| Sigla    | Papel                     | Módulos sob responsabilidade                     |
| :------- | :------------------------ | :----------------------------------------------- |
| **FE**   | Front-end (1 pessoa)      | 08 (UI/Telas), 09 (Deploy GitHub Pages)          |
| **BE-A** | Back-end A (1 pessoa)     | 05 (Agendamentos), 06 (Prontuários), apoio no 04 |
| **BE-B** | Back-end B (1 pessoa)     | 02 (Auth/RBAC), 03 (Perfis), 07 (Convênios)      |
| **DBA**  | Banco de Dados (1 pessoa) | 01 (Banco/Supabase), seeds, RLS, apoio ao 10     |
| Todos    | —                         | 10 (Testes & Qualidade)                          |

---

## 🔗 Ordem de dependência

```
00-setup ──► 01-banco ──► 02-auth ──► 03-perfis ──┬─► 04-medicos ──► 05-agendamentos ──► 06-prontuarios
                                                  └─► 07-convenios
02..07 ──► 08-frontend-telas ──► 09-deploy-github-pages ──► 10-testes-qualidade
```

| #   | Arquivo                                                          | Módulo                            | Responsável  | Depende de |
| :-- | :--------------------------------------------------------------- | :-------------------------------- | :----------- | :--------- |
| 00  | [`00-setup-projeto.md`](./00-setup-projeto.md)                   | Setup do projeto e ambientes      | DBA + FE     | —          |
| 01  | [`01-banco-de-dados.md`](./01-banco-de-dados.md)                 | Banco de dados (Supabase)         | **DBA**      | 00         |
| 02  | [`02-autenticacao-rbac.md`](./02-autenticacao-rbac.md)           | Autenticação & RBAC               | **BE-B**     | 01         |
| 03  | [`03-perfis-usuarios.md`](./03-perfis-usuarios.md)               | Perfis de usuários                | **BE-B**     | 02         |
| 04  | [`04-medicos-especialidades.md`](./04-medicos-especialidades.md) | Médicos, especialidades e agendas | **BE-A**     | 03         |
| 05  | [`05-agendamentos.md`](./05-agendamentos.md)                     | Consultas & agendamentos          | **BE-A**     | 04         |
| 06  | [`06-prontuarios.md`](./06-prontuarios.md)                       | Prontuários eletrônicos (EHR)     | **BE-A**     | 05         |
| 07  | [`07-convenios.md`](./07-convenios.md)                           | Planos de saúde & convênios       | **BE-B**     | 03         |
| 08  | [`08-frontend-telas.md`](./08-frontend-telas.md)                 | Front-end — telas e componentes   | **FE**       | 02–07      |
| 09  | [`09-deploy-github-pages.md`](./09-deploy-github-pages.md)       | Deploy no GitHub Pages            | **FE** + DBA | 08         |
| 10  | [`10-testes-qualidade.md`](./10-testes-qualidade.md)             | Testes & qualidade                | Todos        | 08         |

---

## ✅ Convenções

- Cada arquivo contém tarefas em formato de **checkbox** (`- [ ]`), com critérios
  de aceite ao final.
- Uma tarefa só deve ser iniciada quando os módulos dos quais ela depende
  estiverem concluídos (ou ao menos com contrato/interfaces estáveis).
- Fluxo de trabalho: **1 branch por tarefa → Pull Request → revisão de 1 colega → merge na `main`**.
- Ao concluir uma tarefa, marcar o checkbox no `.md` correspondente no mesmo PR.
- Prioridade para a **Entrega 5 (≥50% funcional)**: módulos 00–02, 04, 05 e as
  telas de Login/Cadastro/Dashboard/Agendamento do módulo 08 + deploy (09).

## 📊 Progresso (Entrega 5)

> Contagem dos checkboxes de cada módulo em 29/09/2026 (inclui sub-itens). O que falta e quem
> faz está no backlog de [`docs/ENTREGA-V1.md`](../ENTREGA-V1.md).

| #   | Módulo                                                                   |  Concluídas |       % |
| :-- | :----------------------------------------------------------------------- | ----------: | ------: |
| 00  | [Setup do Projeto e Ambientes](./00-setup-projeto.md)                    |       16/24 |     67% |
| 01  | [Banco de Dados (Supabase / PostgreSQL)](./01-banco-de-dados.md)         |       18/23 |     78% |
| 02  | [Autenticação & RBAC](./02-autenticacao-rbac.md)                         |       13/18 |     72% |
| 03  | [Perfis de Usuários](./03-perfis-usuarios.md)                            |        5/15 |     33% |
| 04  | [Médicos, Especialidades e Agendas](./04-medicos-especialidades.md)      |        6/14 |     43% |
| 05  | [Consultas & Agendamentos](./05-agendamentos.md)                         |       20/23 |     87% |
| 06  | [Prontuários Eletrônicos (EHR)](./06-prontuarios.md)                     |        0/16 |      0% |
| 07  | [Planos de Saúde & Convênios](./07-convenios.md)                         |        6/16 |     38% |
| 08  | [Front-end: Telas e Componentes](./08-frontend-telas.md)                 |       14/26 |     54% |
| 09  | [Deploy no GitHub Pages + Conexão Supabase](./09-deploy-github-pages.md) |       10/19 |     53% |
| 10  | [Testes & Qualidade](./10-testes-qualidade.md)                           |        9/18 |     50% |
|     | **Total**                                                                | **117/212** | **55%** |
