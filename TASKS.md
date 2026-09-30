~~1 Criar SPEC, anexar os arquivos .zip e anexar~~~ CONCLUIDO

~~2 Criar o repositório, e adicionar os professores como colaboradores~~ CONCLUIDO

~~3
Criar o BD NO SUPABASE
-utilizar IA ia e gerar o esquema sql baseado na SPEC
-crie um database no supabase e cole ao esquema gerado~~ CONCLUIDO

~~4
Quebrar a SPEC em tarefas para que uma IA programe
-com BD ja criado supabase, peca pra IA quebrar a SPEC principal em tarefas
-envie ao github as tarefas
obs:todas tarefas precisam ser salvas em .MD~~ CONCLUIDO — tarefas em [docs/tasks/](docs/tasks/README.md) (11 arquivos .md, por módulo e ordem de dependência, com divisão FE / BE-A / BE-B / DBA)

5
Entrega 1° Versão
-não é necessario ser totalmente funcional, mas deve estar 50% funcional e de acordo com a SPEC.
-deve ser hospedada no github pages e devidamente conectada a base de dados do SUPABASE
-se precisar de login e senha disponibilizar para professor
-anexar essa tarefa, um MD com: link aplicação hospedada no github pages, os dados de login da app, e uma lista do que falta finalizar.

**STATUS: EM ANDAMENTO — código, testes, workflow de deploy e MD prontos.** O MD pedido é o
[docs/ENTREGA-V1.md](docs/ENTREGA-V1.md) (link, logins e backlog). Para concluir falta só a parte que
exige acesso de administrador ao GitHub/Supabase (habilitar o Pages, cadastrar os 2 secrets, rodar o SQL
de `db/` e conferir o link publicado) — passo a passo no início do MD.

6
Fazer documentação do sistema
-enviar os arquivos SPEC.MD e o esquema do banco de dados para o IA

- solicite a geração individual do seguinte esquema: diagrama de classes, diagrama de entidade e relacionamento, e dps exportar as imagens dos diagramas gerados
  -anexe no IA: SPEC.MD, o diagrama de classes e as capturas de telas do sistema, dps fazer um prompt: a partir da informacoes anexadas, gere um manual completo de uso do sistema e dps exporte a resposta para o google docs, adicione a identidade visual do sistema e salve como PDF
  -anexe no IA: o logotipo e o arquivo DESIGN.MD, e envie:"a partir dos arquivos anexados crie um manual de identidade visual do sistema, e dps exporte o conteudo pro google docs/slide/canva e ajuste a formatação e salve como PDF
  -Reuna todos os arquivos feitos(diagramas IA e manuais em PDF) em 1 pasta. e dps compacte a pasta no formato .zip e faca o envio final

7
Entrega da versão final

8
Apresentação
-professores
-participacao 3°ano
-15 minutos de apresentacao
-os professores perguntaram
-nao precisa nada impresso, mas gere um qr code para acesso(o sistema hospidado do github e documentação do sistema)

divide essas tarefas para 4 pessoas, sendo 2 back end, 1 banco de dados e a outra front end
