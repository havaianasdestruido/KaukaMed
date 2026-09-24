import { z } from 'zod';

/**
 * Esquema das variáveis de ambiente da API.
 *
 * O `validate` do ConfigModule roda este esquema no bootstrap: se alguma
 * variável estiver inválida, a aplicação não sobe e o erro aponta exatamente
 * qual valor está incorreto (evitando falhas silenciosas em produção).
 * As mensagens são em pt-BR para facilitar o diagnóstico no dia a dia.
 */
export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'], {
      error: 'NODE_ENV deve ser development, test ou production',
    })
    .default('development'),

  /** Interface de rede em que a API escuta (0.0.0.0 aceita conexões externas). */
  HOST: z.string({ error: 'HOST deve ser um endereço válido' }).min(1).default('0.0.0.0'),

  /** Porta em que a API escuta. */
  PORT: z.coerce
    .number({ error: 'PORT deve ser um número' })
    .int({ error: 'PORT deve ser um número inteiro' })
    .min(1, { error: 'PORT deve estar entre 1 e 65535' })
    .max(65535, { error: 'PORT deve estar entre 1 e 65535' })
    .default(3333),

  /** Conexão com o PostgreSQL (usada a partir da Phase 1). */
  DATABASE_URL: z
    .url({ error: 'DATABASE_URL deve ser uma URL de conexão válida' })
    .default('postgresql://kaukamed:kaukamed@localhost:5432/kaukamed?schema=public'),

  /** Conexão com o Redis (usada a partir da Phase 1). */
  REDIS_URL: z
    .url({ error: 'REDIS_URL deve ser uma URL de conexão válida' })
    .default('redis://localhost:6379'),
});

/** Tipo das variáveis de ambiente já validadas e convertidas. */
export type Environment = z.infer<typeof environmentSchema>;

/** Nomes das variáveis de ambiente conhecidas pela API. */
export const ENVIRONMENT_KEYS = Object.keys(environmentSchema.shape);

/**
 * Valida as variáveis de ambiente carregadas pelos arquivos `.env` e pelo
 * `process.env`. É executada automaticamente pelo `ConfigModule.forRoot`.
 */
export function validateEnvironment(config: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const detalhes = z.prettifyError(result.error);
    throw new Error(`Variáveis de ambiente inválidas:\n${detalhes}`);
  }

  return result.data;
}
