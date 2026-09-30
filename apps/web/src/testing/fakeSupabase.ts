/**
 * Cliente "Supabase" de teste, apoiado em um PostgreSQL de verdade.
 *
 * Serve para testar o front-end ponta a ponta contra as funções SQL reais
 * (db/migrations/002) sem depender do Supabase na nuvem: implementa só o trecho
 * do `SupabaseClient` que o app usa (`auth.*`, `from('profiles')` e `rpc`) e executa
 * tudo como o PostgREST faz — papel `authenticated`, claims do JWT em
 * `request.jwt.claims`, parâmetros por nome via `json_to_record` e resposta em JSON
 * (`json_agg`). Por isso formatos de data, número e array chegam ao app iguais aos de produção.
 *
 * Só é usado em testes (src/integration/*.db.test.tsx), que ficam desativados
 * enquanto `KAUKAMED_TEST_DATABASE_URL` não estiver definida.
 */
import { Client, Pool, type PoolClient } from 'pg';

interface PostgrestError {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

type AuthListener = (event: string, session: unknown) => void;

export interface FakeSupabase {
  /** Objeto que substitui o retorno de `createClient(...)`. */
  client: Record<string, unknown>;
  /** Conexão de administrador (postgres) para preparar e limpar dados nos testes. */
  admin: Client;
  close: () => Promise<void>;
}

interface FnSignature {
  names: string[];
  types: string[];
  returnsSet: boolean;
  returnType: string;
}

const toPostgrestError = (error: unknown): PostgrestError => {
  const e = error as { message?: string; code?: string; detail?: string; hint?: string };
  return {
    message: e.message ?? 'Erro desconhecido',
    code: e.code,
    details: e.detail ?? null,
    hint: e.hint ?? null,
  };
};

export async function createFakeSupabase(connectionString: string): Promise<FakeSupabase> {
  // Cada chamada do app usa a própria conexão (o app dispara várias em paralelo); a conexão de
  // administrador, separada, é só dos testes (preparar e limpar dados).
  const pool = new Pool({ connectionString, max: 6 });
  const admin = new Client({ connectionString });
  await admin.connect();

  const inflight = new Set<Promise<unknown>>();
  /** Registra uma operação em andamento; `close()` espera todas terminarem. */
  const track = <T>(promise: Promise<T>): Promise<T> => {
    inflight.add(promise);
    const done = () => inflight.delete(promise);
    promise.then(done, done);
    return promise;
  };

  let currentUserId: string | null = null;
  const listeners = new Set<AuthListener>();
  const signatures = new Map<string, FnSignature>();

  /** Roda `work` como o usuário logado (papel `authenticated`) dentro de uma transação. */
  function asUser<T>(work: (db: PoolClient) => Promise<T>): Promise<T> {
    return track(runAsUser(work));
  }

  async function runAsUser<T>(work: (db: PoolClient) => Promise<T>): Promise<T> {
    const db = await pool.connect();
    try {
      await db.query('begin');
      await db.query("set local timezone = 'UTC'");
      if (currentUserId) {
        await db.query("select set_config('request.jwt.claims', $1, true)", [
          JSON.stringify({ sub: currentUserId, role: 'authenticated' }),
        ]);
        await db.query('set local role authenticated');
      } else {
        await db.query('set local role anon');
      }
      const result = await work(db);
      await db.query('commit');
      return result;
    } catch (error) {
      await db.query('rollback').catch(() => undefined);
      throw error;
    } finally {
      db.release();
    }
  }

  async function signatureOf(fn: string): Promise<FnSignature> {
    const cached = signatures.get(fn);
    if (cached) return cached;
    const { rows } = await pool.query<{
      names: string[] | null;
      types: string[] | null;
      returns_set: boolean;
      return_type: string;
    }>(
      `select p.proargnames as names,
              (select array_agg(format_type(t, null) order by ord)
                 from unnest(p.proargtypes::oid[]) with ordinality as u(t, ord)) as types,
              p.proretset as returns_set,
              format_type(p.prorettype, null) as return_type
         from pg_proc p
        where p.pronamespace = 'public'::regnamespace and p.proname = $1`,
      [fn],
    );
    const row = rows[0];
    if (!row) {
      throw Object.assign(
        new Error(`Could not find the function public.${fn} in the schema cache`),
        {
          code: 'PGRST202',
        },
      );
    }
    const signature: FnSignature = {
      names: row.names ?? [],
      types: row.types ?? [],
      returnsSet: row.returns_set,
      returnType: row.return_type,
    };
    signatures.set(fn, signature);
    return signature;
  }

  /** Mesmo caminho do PostgREST: `json_to_record` com os parâmetros enviados, chamados por nome. */
  async function rpc(fn: string, args: Record<string, unknown> = {}) {
    try {
      const signature = await signatureOf(fn);
      const sent = Object.keys(args);
      for (const key of sent) {
        if (!signature.names.includes(key)) {
          throw Object.assign(
            new Error(
              `Could not find the function public.${fn}(${sent.join(', ')}) in the schema cache`,
            ),
            { code: 'PGRST202' },
          );
        }
      }

      const columns = sent.map(
        (name) => `"${name}" ${signature.types[signature.names.indexOf(name)]}`,
      );
      const named = sent.map((name) => `"${name}" := _."${name}"`).join(', ');
      const source = sent.length
        ? `from json_to_record($1::json) as _(${columns.join(', ')}) cross join lateral public.${fn}(${named}) as f`
        : `from public.${fn}() as f`;
      const params = sent.length ? [JSON.stringify(args)] : [];

      const data = await asUser(async (db) => {
        if (signature.returnsSet) {
          const { rows } = await db.query<{ result: unknown }>(
            `select coalesce(json_agg(row_to_json(f)), '[]'::json) as result ${source}`,
            params,
          );
          return rows[0]?.result ?? [];
        }
        if (signature.returnType === 'void') {
          await db.query(`select f ${source}`, params);
          return null;
        }
        const { rows } = await db.query<{ result: unknown }>(
          `select to_json(f) as result ${source}`,
          params,
        );
        return rows[0]?.result ?? null;
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error: toPostgrestError(error) };
    }
  }

  /** `from('profiles').select(cols).eq(col, val).maybeSingle()` — o único uso do app. */
  function from(table: string) {
    const filters: { column: string; value: unknown }[] = [];
    let columns = '*';
    const builder = {
      select(cols: string) {
        columns = cols;
        return builder;
      },
      eq(column: string, value: unknown) {
        filters.push({ column, value });
        return builder;
      },
      async maybeSingle() {
        try {
          const where = filters.map((f, i) => `"${f.column}" = $${i + 1}`).join(' and ');
          const sql = `select row_to_json(t) as row from (select ${columns} from public."${table}" ${
            where ? `where ${where}` : ''
          }) t`;
          const rows = await asUser(async (db) => {
            const { rows } = await db.query<{ row: unknown }>(
              sql,
              filters.map((f) => f.value),
            );
            return rows;
          });
          if (rows.length > 1) {
            return {
              data: null,
              error: {
                message: 'JSON object requested, multiple (or no) rows returned',
                code: 'PGRST116',
              },
            };
          }
          return { data: rows[0]?.row ?? null, error: null };
        } catch (error) {
          return { data: null, error: toPostgrestError(error) };
        }
      },
    };
    return builder;
  }

  const notify = (event: string, session: unknown) => listeners.forEach((l) => l(event, session));
  const sessionFor = (id: string) => ({ access_token: 'fake', user: { id } });

  const auth = {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const { rows } = await track(
        pool.query<{ id: string }>(
          'select id from auth.users where lower(email) = lower($1) and encrypted_password = crypt($2, encrypted_password)',
          [email, password],
        ),
      );
      const id = rows[0]?.id;
      if (!id) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', status: 400 },
        };
      }
      currentUserId = id;
      return { data: { user: { id }, session: sessionFor(id) }, error: null };
    },

    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) {
      try {
        const { rows: dup } = await pool.query(
          'select 1 from auth.users where lower(email) = lower($1)',
          [email],
        );
        if (dup.length > 0) {
          return {
            data: { user: null, session: null },
            error: { message: 'User already registered' },
          };
        }
        // Mesmo caminho do GoTrue: insere em auth.users e o trigger handle_new_user cria o perfil.
        const { rows } = await pool.query<{ id: string }>(
          `insert into auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
           values ($1, crypt($2, gen_salt('bf')), now(), $3::jsonb) returning id`,
          [email, password, JSON.stringify(options?.data ?? {})],
        );
        const id = rows[0]!.id;
        currentUserId = id;
        return { data: { user: { id }, session: sessionFor(id) }, error: null };
      } catch (error) {
        // O GoTrue esconde o motivo quando o trigger falha.
        console.warn('[fakeSupabase] falha ao criar usuário:', (error as Error).message);
        return {
          data: { user: null, session: null },
          error: { message: 'Database error saving new user' },
        };
      }
    },

    async getSession() {
      return {
        data: { session: currentUserId ? sessionFor(currentUserId) : null },
        error: null,
      };
    },

    onAuthStateChange(listener: AuthListener) {
      listeners.add(listener);
      return { data: { subscription: { unsubscribe: () => listeners.delete(listener) } } };
    },

    async signOut() {
      currentUserId = null;
      notify('SIGNED_OUT', null);
      return { error: null };
    },

    async resetPasswordForEmail() {
      return { data: {}, error: null };
    },

    async updateUser() {
      return { data: { user: { id: currentUserId } }, error: null };
    },
  };

  return {
    client: { auth, from, rpc },
    admin,
    close: async () => {
      while (inflight.size > 0) await Promise.allSettled([...inflight]);
      await pool.end();
      await admin.end();
    },
  };
}
