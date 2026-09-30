import { describe, expect, it } from 'vitest';

import { type ScreenId, type UserRole } from '../types';
import { canAccess, homeFor, roleLabel, screensFor } from './access';

const ROLES: UserRole[] = ['paciente', 'funcionario', 'dentista', 'administrador'];

describe('access — telas por papel', () => {
  it('cada papel abre a própria tela inicial', () => {
    for (const role of ROLES) {
      expect(canAccess(role, homeFor(role))).toBe(true);
    }
    expect(homeFor('paciente')).toBe('inicio-dashboard');
    expect(homeFor('dentista')).toBe('admin-agenda');
    expect(homeFor('funcionario')).toBe('admin-agenda');
    expect(homeFor('administrador')).toBe('admin-agenda');
  });

  it('paciente não entra nas telas de gestão', () => {
    for (const screen of [
      'admin-agenda',
      'admin-pacientes',
      'admin-dentistas',
      'admin-faturamento',
      'admin-relatorios',
    ] as ScreenId[]) {
      expect(canAccess('paciente', screen)).toBe(false);
    }
  });

  it('dentista só vê agenda, pacientes e configurações', () => {
    expect([...screensFor('dentista')]).toEqual([
      'admin-agenda',
      'admin-pacientes',
      'admin-configuracoes',
    ]);
    expect(canAccess('dentista', 'agendar')).toBe(false);
    expect(canAccess('dentista', 'admin-faturamento')).toBe(false);
    expect(canAccess('dentista', 'inicio-dashboard')).toBe(false);
  });

  it('recepção agenda, mas relatórios e auditoria são do administrador', () => {
    expect(canAccess('funcionario', 'agendar')).toBe(true);
    expect(canAccess('funcionario', 'admin-relatorios')).toBe(false);
    expect(canAccess('administrador', 'admin-relatorios')).toBe(true);
  });

  it('login e cadastro são públicos', () => {
    for (const role of ROLES) {
      expect(canAccess(role, 'login')).toBe(true);
      expect(canAccess(role, 'cadastro')).toBe(true);
    }
  });

  it('as telas de gestão ficam fora do portal do paciente', () => {
    const patientScreens = screensFor('paciente');
    expect(patientScreens.some((s) => s.startsWith('admin-'))).toBe(false);
  });
});

describe('access — nome do papel na tela', () => {
  it('usa o nome em português, com acento', () => {
    expect(roleLabel('paciente')).toBe('Paciente');
    expect(roleLabel('funcionario')).toBe('Funcionário');
    expect(roleLabel('dentista')).toBe('Dentista');
    expect(roleLabel('administrador')).toBe('Administrador');
  });

  it('todo papel tem um nome, sem mostrar o id interno', () => {
    for (const role of ROLES) {
      expect(roleLabel(role).toLowerCase()).not.toBe('funcionario');
      expect(roleLabel(role).length).toBeGreaterThan(0);
    }
  });
});
