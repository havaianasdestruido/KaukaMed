import type { UserRole } from './user-role.js';

/** Usuário autenticado, no formato devolvido pela API. */
export interface AuthUser {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
}

/** Perfil do usuário (tabela `profiles`). Datas sempre em ISO 8601 (UTC). */
export interface UserProfile extends AuthUser {
  cpf: string | null;
  phone: string | null;
  birthDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Credenciais enviadas no formulário de login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Par de tokens devolvido após autenticação bem-sucedida. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Tempo de vida do access token, em segundos. */
  expiresIn: number;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

/** Conteúdo (claims) do JWT emitido pela API. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface PasswordResetRequest {
  email: string;
}
