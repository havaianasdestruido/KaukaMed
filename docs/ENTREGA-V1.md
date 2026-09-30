# Entrega 1 — Primeira Versão (V1) · KaukaMed / OdontoAura

> Plataforma de gestão de clínica odontológica: **agendamento de consultas por papel** (paciente,
> recepção, dentista, administrador), sobre **Supabase** (Auth + PostgreSQL com RLS) e front-end
> estático no **GitHub Pages**.
>
> Esta V1 cobre o que a entrega pede — **login, cadastro, agendamento básico e listagem de consultas** —
> e o restante da SPEC está no [backlog](#-o-que-falta-finalizar-backlog). Tarefa 5 do [`TASKS.md`](../TASKS.md).

| Item               | Onde                                                                                     |
| :----------------- | :--------------------------------------------------------------------------------------- |
| 🔗 Aplicação       | [havaianasdestruido.github.io/KaukaMed](https://havaianasdestruido.github.io/KaukaMed/)  |
| 👤 Logins de teste | [Seção abaixo](#-logins-de-teste-um-por-papel) — senha única `Kauka@2026`                |
| 📋 O que falta     | [Backlog](#-o-que-falta-finalizar-backlog), dividido entre FE, BE-A, BE-B e DBA          |
| 📦 Código          | [github.com/havaianasdestruido/KaukaMed](https://github.com/havaianasdestruido/KaukaMed) |

---

## 🔗 Aplicação hospedada

**<https://havaianasdestruido.github.io/KaukaMed/>**

> ⚠️ **Situação do link — leia antes de abrir.** O código, o workflow de publicação
> (`.github/workflows/deploy.yml`) e o banco estão prontos, mas **publicar e conectar** exige acesso de
> administrador ao GitHub e ao projeto Supabase, então esses passos **ainda precisam ser feitos** por quem
> administra o repositório — veja [🚀 Publicação: passo a passo](#-publicação-passo-a-passo-do-administrador)
> (leva uns 10 minutos). Até lá o endereço acima responde 404. Quando o workflow **Deploy** ficar verde
> na aba _Actions_, o site está no ar e os logins abaixo funcionam.

---

## 👤 Logins de teste (um por papel)

**Senha de todas as contas: `Kauka@2026`** (criadas por [`db/seed.sql`](../db/seed.sql)).

| Papel         | E-mail                        | Quem é                                  | O que dá para testar                                              |
| :------------ | :---------------------------- | :-------------------------------------- | :---------------------------------------------------------------- |
| Paciente      | `paciente@example.com`        | Camila Santos (convênio Unimed Odonto)  | Agendar, confirmar, reagendar, cancelar; ver convênio e histórico |
| Recepção      | `recepcao@example.com`        | Renata Lins                             | Agenda de todos, agendar em nome do paciente, confirmar, cancelar |
| Dentista      | `dentista@example.com`        | Dr. Marcelo Arantes (Ortodontia)        | Só as consultas dele; iniciar e concluir atendimento              |
| Administrador | `admin@example.com`           | Rodrigo Albuquerque                     | Tudo da recepção + iniciar/concluir qualquer consulta             |
| Paciente      | `jorge.mendes@example.com`    | Jorge Mendes (sem convênio)             | Mesmo que a Camila; atendimento particular                        |
| Paciente      | `lucas.ferraz@example.com`    | Lucas Ferraz (Amil Dental)              | Idem                                                              |
| Dentista      | `renata.silveira@example.com` | Dra. Renata Silveira (terças e quintas) | Idem ao Dr. Marcelo                                               |
| Dentista      | `helena.gusmao@example.com`   | Dra. Helena Gusmão (seg/qua/sex tarde)  | Idem                                                              |

- Também dá para **criar uma conta nova** em _Cadastre-se na clínica_ (vira sempre **paciente**). Use um
  e-mail real e um CPF válido (o app confere os dígitos). Os e-mails `@example.com` do seed não recebem mensagens.
- As consultas de exemplo têm datas **relativas ao dia em que o seed rodou**. Se ficarem velhas, é só rodar
  `db/seed.sql` de novo (é idempotente e não apaga o que foi criado pelo app).
- ⚠️ São contas públicas de demonstração — troque as senhas ou apague-as depois da apresentação.

### Roteiro de 5 minutos para conferir a V1

1. **Paciente** (`paciente@example.com`): no _Início_ aparece a próxima consulta real. Clique em **Agendar
   Consulta** → escolha a **Dra. Helena Gusmão** → um dia e um horário → **Confirmar agendamento**. Em
   **Consultas**, a nova consulta aparece como _Agendado_: use **Confirmar presença**, **Reagendar** e **Cancelar**.
2. **Recepção** (`recepcao@example.com`): a **Agenda** lista as consultas de todos (filtros por período, status,
   dentista e busca). Em **Novo agendamento**, escolha o paciente _Jorge Mendes_, um dentista e um horário. Na lista,
   **Confirme** uma consulta e **Cancele** outra (o motivo é obrigatório).
3. **Dentista** (`dentista@example.com`): **Minha Agenda** mostra só as consultas do Dr. Marcelo; numa consulta
   _Confirmado_ use **Iniciar atendimento** e depois **Concluir atendimento**.
4. **Administrador** (`admin@example.com`): mesma agenda da recepção, e o menu tem também _Relatórios_ (tela ilustrativa).
5. **Cadastro**: saia, clique em _Cadastre-se na clínica_, crie uma conta e confira que já entra como paciente.

> O que é **dado de exemplo** (faturamento TISS, salas, odontograma, KPIs) aparece com o aviso amarelo
> **"Tela ilustrativa"** — não conta como funcionalidade entregue.

---

## ✅ O que funciona nesta versão

| Jornada                                         | Funcionalidade                                                                                                |                  Dados reais                  |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------: |
| **Acesso**                                      | Login e logout por e-mail/senha; sessão persistente; "esqueci a senha" + tela de nova senha                   |                      ✅                       |
| **Cadastro**                                    | Conta de paciente (nome, e-mail, CPF validado, telefone); o papel é sempre `PATIENT`                          |                      ✅                       |
| **Controle de acesso**                          | Menu e telas por papel; o banco (RLS + funções) recusa o que o papel não pode, mesmo forçando a tela          |                      ✅                       |
| **Paciente**                                    | Painel com a próxima consulta e arquivo `.ics`; agendar (especialidade → dentista → dia → horário → convênio) |                      ✅                       |
| **Paciente**                                    | Minhas Consultas (próximas / histórico / canceladas); confirmar, reagendar e cancelar com regra de 2 h        |                      ✅                       |
| **Paciente**                                    | Meu Convênio (carteirinhas cadastradas pela clínica)                                                          |                      ✅                       |
| **Recepção / Admin**                            | Agenda (próximas, dia, semana) com filtros; confirmar, reagendar, cancelar com motivo, registrar falta        |                      ✅                       |
| **Recepção / Admin**                            | Pacientes com busca e agendamento em nome do paciente                                                         |                      ✅                       |
| **Dentista**                                    | Minha Agenda; iniciar e concluir atendimento; Meus Pacientes (só quem atende)                                 |                      ✅                       |
| **Agenda**                                      | Grade de horários por dentista e dia da semana, no fuso de São Paulo; sem duplo agendamento                   |                      ✅                       |
| **Banco**                                       | 9 funções SQL de agenda, RLS, seed e 111 testes SQL; CI e deploy automáticos                                  |                      ✅                       |
| Prontuário, faturamento TISS, salas, relatórios | Telas do protótipo com dados de exemplo                                                                       | ❌ [backlog](#-o-que-falta-finalizar-backlog) |

### Quanto está pronto

O progresso é medido pelos checkboxes dos 11 módulos de [`docs/tasks/`](./tasks/README.md)
(conferidos um a um em 29/09/2026; inclui sub-itens):

| Módulo                               |  Concluídas |       % |
| :----------------------------------- | ----------: | ------: |
| 00 Setup do projeto                  |       16/24 |     67% |
| 01 Banco de dados                    |       18/23 |     78% |
| 02 Autenticação & RBAC               |       13/18 |     72% |
| 03 Perfis de usuários                |        5/15 |     33% |
| 04 Médicos, especialidades e agendas |        6/14 |     43% |
| 05 Consultas & agendamentos          |       20/23 |     87% |
| 06 Prontuários eletrônicos           |        0/16 |      0% |
| 07 Convênios                         |        6/16 |     38% |
| 08 Front-end (telas)                 |       14/26 |     54% |
| 09 Deploy no GitHub Pages + Supabase |       10/19 |     53% |
| 10 Testes & qualidade                |        9/18 |     50% |
| **Total**                            | **117/212** | **55%** |

Os módulos que a própria entrega priorizou (00–02, 04, 05, 08 e 09) somam **97/147 (66%)**. Itens que só
podem ser confirmados no ambiente publicado (acesso de administrador) ficaram **sem marcar** de propósito.

---

## 📋 O que falta finalizar (backlog)

Dividido pelos quatro papéis da equipe ([`TASKS.md`](../TASKS.md): 2 back-end, 1 banco, 1 front-end). Prioridade:
🔴 alta (Entrega 7) · 🟡 média · 🟢 desejável.

### 🧩 Pendências de implantação (fazer antes de apresentar)

| Pri. | Pendência                                                                                                                        | Quem     |
| :--: | :------------------------------------------------------------------------------------------------------------------------------- | :------- |
|  🔴  | Habilitar o Pages, cadastrar os secrets e rodar o SQL no Supabase ([passo a passo](#-publicação-passo-a-passo-do-administrador)) | DBA + FE |
|  🔴  | Validar no site publicado: login dos 4 papéis, cadastro, agendamento e listagem (módulo 09)                                      | FE + DBA |
|  🔴  | Validar cadastro com e-mail real e recuperação de senha (links de e-mail voltando para o Pages)                                  | BE-B     |
|  🟡  | Proteger a branch `main` (PR obrigatório + CI verde)                                                                             | DBA      |
|  🟡  | Trocar/apagar as contas de demonstração depois da apresentação                                                                   | DBA      |

### 🎨 FE — Front-end

| Pri. | Item                                                                                                                                                         |
| :--: | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  🔴  | Tela **Meu perfil** (editar nome, telefone, CPF, nascimento; trocar senha logado)                                                                            |
|  🔴  | Telas de **administração**: usuários (listar/filtrar/ativar/mudar papel), dentistas, especialidades, unidades, operadoras e agenda semanal — hoje só por SQL |
|  🔴  | Ligar prontuário/odontograma ao banco, junto com BE-A (hoje é tela ilustrativa)                                                                              |
|  🟡  | Remover do menu (ou ligar ao banco) as telas ilustrativas: faturamento TISS, salas, dashboard e relatórios                                                   |
|  🟡  | Paginação na agenda e em pacientes (hoje: até 500 consultas por busca)                                                                                       |
|  🟡  | Logo e imagens dentro do repositório (hoje vêm de URLs do Google AI Studio e as fontes, do Google Fonts)                                                     |
|  🟡  | Celular: menu lateral fixo de 80 px (recolher/abrir) e tabelas largas; acessibilidade: _focus trap_ nos modais, foco e contraste; _skeletons_ padronizados   |
|  🟡  | Avisar quando o link do e-mail (recuperação/confirmação) expirou: o Supabase volta com `#error_code=otp_expired` e hoje o app só mostra o login              |
|  🟢  | Divisão do bundle (765 kB, 191 kB gzip), testes E2E com Playwright nas 4 jornadas                                                                            |

### 🗓️ BE-A — Agenda e prontuário

| Pri. | Item                                                                                                                          |
| :--: | :---------------------------------------------------------------------------------------------------------------------------- |
|  🔴  | **Prontuário**: anamnese, diagnósticos, prescrições, linha do tempo do paciente, impressão da prescrição (módulo 06, 0% hoje) |
|  🔴  | Auditoria: gravar `audit_logs` nas ações sensíveis + tela de auditoria para o administrador                                   |
|  🟡  | Várias janelas por dia (almoço) — hoje há **uma janela por dentista e dia da semana**; bloqueios, feriados e férias           |
|  🟡  | Lembretes de consulta (e-mail/WhatsApp) por Edge Function agendada; duração diferente por tipo de consulta                    |
|  🟡  | Relatórios reais (ocupação, faltas, receita) a partir de `appointments`; teste concorrente de reserva                         |
|  🟢  | Lista de espera e encaixe; consultas recorrentes                                                                              |

### 🔐 BE-B — Autenticação, perfis e convênios

| Pri. | Item                                                                                                                                                                 |
| :--: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  🔴  | Cadastro de funcionários e dentistas pelo administrador (Edge Function com `service_role` — a chave **nunca** vai ao navegador)                                      |
|  🔴  | Convênios: o **paciente** cadastra a própria carteirinha (hoje só a recepção, via SQL); validade/unicidade/formato; `SUSPENDED` pela recepção e `EXPIRED` automático |
|  🟡  | Dados do paciente: endereço, contato de emergência e alergias (colunas novas + tela)                                                                                 |
|  🟡  | CRUD de operadoras; faturamento TISS (tabelas de guias) — módulo 07                                                                                                  |
|  🟢  | Login social (Google), política de senha e limite de tentativas                                                                                                      |

### 🗄️ DBA — Banco de dados

| Pri. | Item                                                                                                      |
| :--: | :-------------------------------------------------------------------------------------------------------- |
|  🔴  | Confirmar no **Supabase real** o seed e o login dos 4 papéis (o GoTrue não foi exercitado aqui)           |
|  🔴  | Testes SQL para as policies de prontuário e prescrição (hoje os testes cobrem agenda, perfis e convênios) |
|  🟡  | Migrations: múltiplas janelas por dia, salas, guias TISS; revisar índices com as consultas reais          |
|  🟡  | Ambiente de _staging_ separado do de produção; backups                                                    |

---

## 🧪 Como foi validado — e o que não foi

| O quê                                                                                                                                                    | Resultado                                    |
| :------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| Regras do banco: 111 asserções SQL (papéis, RLS, agenda, status, 2 h, convênio) em PostgreSQL 17                                                         | ✅ passam; migration e seed idempotentes     |
| Front-end: 107 testes (regras puras, gateways, mappers, 8 fluxos de tela no modo demonstração e 8 de recuperação de senha/sessão)                        | ✅ passam                                    |
| App real × funções SQL reais: 7 fluxos (login, agendar/cancelar, recepção, dentista, cadastro)                                                           | ✅ passam (exigem um Postgres; o CI sobe um) |
| Navegador real (Chromium headless): todas as telas dos 4 papéis em desktop e em 390 px, e o fluxo de recuperação de senha com o `supabase-js` de verdade | ✅ sem erros no console (backend simulado)   |
| Contrato: parâmetros das chamadas ao banco conferidos contra o próprio SQL                                                                               | ✅ (quebra se o nome de um parâmetro mudar)  |
| `lint`, `typecheck`, `build`; bundle sem `service_role`; workflows validados contra o schema do GitHub Actions                                           | ✅                                           |

**O que NÃO foi validado** (não havia acesso de administrador nem rede para o Supabase/GitHub neste ambiente):

- o **projeto Supabase real**: PostgREST, GoTrue (login do seed, e-mails de confirmação/recuperação) e a
  execução do SQL no _SQL Editor_ — no navegador, o GoTrue e o PostgREST foram **simulados**;
- o **GitHub Pages**: a primeira execução do workflow `Deploy` (o `CI` roda no Pull Request);
- as **fontes e imagens externas** (Google Fonts e logotipos hospedados fora do repositório): no teste de
  navegador foram trocadas por substitutos locais, então o carregamento real delas não foi visto;
- a **recuperação de senha com e-mail real**: o caminho "link → tela de nova senha → senha trocada" foi
  exercitado, mas o envio do e-mail e as _Redirect URLs_ do Supabase dependem do projeto real.

O `Deploy` foi escrito para falhar cedo e dizer o motivo: secrets ausentes, chave `service_role`, projeto
sem a migration 002 ou chave inválida.

---

## 🚀 Publicação: passo a passo do administrador

Feito **uma vez**; depois disso, todo push na `main` publica sozinho.

1. **Supabase — SQL.** _SQL Editor → New query_; cole e execute, **nesta ordem**: `db/kaukamed_schema.sql`,
   `db/migrations/001_frontend_support.sql`, `db/migrations/002_agendamento_v1.sql` e `db/seed.sql`.
   (Mais detalhes em [`db/README.md`](../db/README.md).)
2. **Supabase — Auth.** _Authentication → Providers → Email_: desative **Confirm email**. _Authentication →
   URL Configuration_: **Site URL** e **Redirect URLs** = `https://havaianasdestruido.github.io/KaukaMed/`.
3. **Supabase — chaves.** _Project Settings → API_: copie a **Project URL** e a chave **anon public**.
   Nunca use a `service_role` no front-end.
4. **GitHub — secrets.** _Settings → Secrets and variables → Actions → New repository secret_:
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. **GitHub — Pages.** _Settings → Pages → Build and deployment → Source: **GitHub Actions**_.
6. **Publicar.** Faça o _merge_ do Pull Request na `main` (ou _Actions → Deploy → Run workflow_). Acompanhe em
   _Actions_; ao terminar, o endereço do site aparece no resumo do job **Publicar no GitHub Pages**.
7. **Conferir.** Faça o [roteiro de 5 minutos](#roteiro-de-5-minutos-para-conferir-a-v1) com as contas acima.

## 🩺 Se algo não funcionar

| Sintoma                                                     | Causa provável                                   | O que fazer                                        |
| :---------------------------------------------------------- | :----------------------------------------------- | :------------------------------------------------- |
| Workflow **Deploy** falha em _Conferir as credenciais_      | Secrets não cadastrados, ou chave `service_role` | Passos 3 e 4 (use a chave **anon**)                |
| Workflow falha em _Conferir se o banco tem a migration 002_ | O SQL não foi executado nesse projeto            | Passo 1                                            |
| Deploy falha em _configure-pages_ ("Get Pages site failed") | Pages não habilitado                             | Passo 5                                            |
| Site abre em 404                                            | Deploy ainda não rodou ou falhou                 | Veja a aba _Actions_                               |
| "E-mail ou senha inválidos" com as contas do seed           | Seed não rodou neste projeto                     | Rode `db/seed.sql` (passo 1)                       |
| "O banco de dados ainda não tem a função …"                 | Migration 002 ausente                            | Rode `db/migrations/002_agendamento_v1.sql`        |
| Cadastro diz "Confirme seu e-mail"                          | _Confirm email_ ligado                           | Desative (passo 2) ou confirme pelo link do e-mail |
| "Não foi possível criar a conta… CPF já cadastrado"         | Já existe perfil com esse CPF                    | Use outro CPF ou deixe o campo em branco           |
| Consultas de exemplo com datas velhas                       | O seed foi rodado há dias                        | Rode `db/seed.sql` de novo                         |

---

## 🗂️ Onde está cada coisa

| Caminho                                      | Conteúdo                                                       |
| :------------------------------------------- | :------------------------------------------------------------- |
| `apps/web/`                                  | Front-end (Vite + React) — [`docs/FRONTEND.md`](./FRONTEND.md) |
| `db/migrations/002_agendamento_v1.sql`       | Regras da agenda: funções SQL, RLS, travas de papel            |
| `db/seed.sql` · `db/tests/` · `db/README.md` | Contas de teste, testes SQL e guia do banco                    |
| `.github/workflows/ci.yml` · `deploy.yml`    | Integração contínua e publicação no GitHub Pages               |
| `docs/tasks/`                                | Quebra da SPEC em tarefas, com o progresso de cada módulo      |
