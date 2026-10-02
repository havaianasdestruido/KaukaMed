# Configuração

Os valores reais ficam em arquivos ignorados pelo Git. Copie sempre os exemplos e nunca versione tokens ou senhas.

A API carrega, do mais prioritário para o menos prioritário: `.env.<ambiente>.local`, `.env.local`, `.env.<ambiente>`, `.env`. A validação ocorre no bootstrap por Zod; URL ou porta inválida impede a inicialização.

O Next.js só expõe ao navegador chaves `NEXT_PUBLIC_*`. Portanto, elas **não podem conter segredos**. Consulte a [referência de variáveis](../reference/environment.md).

## Infraestrutura

Na primeira criação do volume, o Compose executa a compatibilidade Supabase e depois `db/kaukamed_schema.sql`. Para reaplicar todo o schema:

```bash
npm run infra:reset # destrutivo: apaga volumes locais
npm run infra:up
```
