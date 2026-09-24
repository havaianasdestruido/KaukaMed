/** Informações básicas devolvidas pela rota raiz da API. */
export interface ApiInfo {
  name: string;
  version: string;
  environment: string;
  /** Data/hora em ISO 8601 (UTC). */
  timestamp: string;
}

/** Formato padrão de erro devolvido pela API. */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  /** Caminho da requisição que gerou o erro. */
  path: string;
  /** Data/hora em ISO 8601 (UTC). */
  timestamp: string;
}

/** Parâmetros de paginação aceitos pelos endpoints de listagem. */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

/** Envelope padrão das respostas paginadas da API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
