# Referência da API

Base local: `http://localhost:3333/api/v1`. Apenas a rota de informação está implementada atualmente.

## `GET /`

Não exige corpo nem autenticação. Retorna `200 OK`:

```json
{
  "name": "KaukaMed API",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-10-02T12:00:00.000Z"
}
```

| Campo         | Tipo   | Descrição                             |
| ------------- | ------ | ------------------------------------- |
| `name`        | string | Nome do serviço                       |
| `version`     | string | Versão do pacote ou fallback `0.1.0`  |
| `environment` | string | `development`, `test` ou `production` |
| `timestamp`   | string | Data UTC ISO 8601                     |

Os contratos planejados adotam `ApiErrorBody` para erros e `Paginated<T>` para listagens, com página padrão 20 e máximo 100. Endpoints de autenticação e domínio presentes nos documentos de tarefas **ainda não existem**.
