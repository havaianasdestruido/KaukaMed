/**
 * Quem pode abrir qual tela.
 *
 * Isto é só experiência de uso: esconde do menu (e redireciona) o que o papel não
 * usa. A segurança de verdade está no banco — RLS e funções SQL recusam qualquer
 * chamada que o papel não possa fazer, mesmo que alguém force a tela.
 */
import { type ScreenId, type UserRole } from '../types';

const PATIENT_SCREENS: readonly ScreenId[] = [
  'inicio-dashboard',
  'agendar',
  'consultas',
  'prontuario',
  'convenio',
  'configuracoes',
];

const FRONT_DESK_SCREENS: readonly ScreenId[] = [
  'admin-visao-geral',
  'admin-agenda',
  'agendar',
  'admin-pacientes',
  'admin-dentistas',
  'admin-faturamento',
  'admin-salas',
  'admin-configuracoes',
];

const SCREENS_BY_ROLE: Record<UserRole, readonly ScreenId[]> = {
  paciente: PATIENT_SCREENS,
  funcionario: FRONT_DESK_SCREENS,
  dentista: ['admin-agenda', 'admin-pacientes', 'admin-configuracoes'],
  administrador: [...FRONT_DESK_SCREENS, 'admin-relatorios'],
};

/** Telas que existem antes do login. */
const PUBLIC_SCREENS: readonly ScreenId[] = ['login', 'cadastro'];

/** Tela inicial de cada papel. */
export function homeFor(role: UserRole): ScreenId {
  return role === 'paciente' ? 'inicio-dashboard' : 'admin-agenda';
}

/** O papel pode abrir a tela? (`login` e `cadastro` são sempre públicas.) */
export function canAccess(role: UserRole, screen: ScreenId): boolean {
  return PUBLIC_SCREENS.includes(screen) || SCREENS_BY_ROLE[role].includes(screen);
}

/** Telas (em ordem) que o papel pode ver. */
export function screensFor(role: UserRole): readonly ScreenId[] {
  return SCREENS_BY_ROLE[role];
}
