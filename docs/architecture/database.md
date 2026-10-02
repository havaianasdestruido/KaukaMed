# Banco de dados e cache

O schema `db/kaukamed_schema.sql` contém enums, tabelas, chaves, índices, triggers, políticas RLS e especialidades iniciais. As áreas são perfis, médicos, pacientes, convênios, agendamentos, prontuários, prescrições e auditoria.

PostgreSQL roda em UTC e persiste no volume `kaukamed-postgres-data`. Redis usa AOF no volume `kaukamed-redis-data` e foi reservado para sessões, cache e rate limiting.

:::warning Fonte de verdade e migrações
O arquivo atual inicializa ambientes vazios. Quando o projeto adotar migrações incrementais, alterações de produção não devem ser feitas editando apenas o schema base.
:::

A API local conecta como proprietário e pode ignorar RLS. Assim, guards e autorização de serviço continuam obrigatórios. Clientes Supabase nos papéis `anon` e `authenticated` ficam sujeitos às políticas.
