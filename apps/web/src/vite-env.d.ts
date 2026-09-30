/// <reference types="vite/client" />

/**
 * Variáveis de ambiente do front-end expostas ao navegador.
 *
 * Todas precisam do prefixo `VITE_` para serem embutidas no bundle.
 * Veja apps/web/.env.example para a descrição de cada uma.
 */
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_PREVIEW_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
