import React from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';
import { canAccess, homeFor } from '../../lib/access';
import { type ScreenId, type UserRole } from '../../types';

/** Itens do menu do portal do paciente (barra lateral estreita). */
const PATIENT_NAV: {
  screen: ScreenId;
  label: string;
  title: string;
  icon: string;
  also?: ScreenId;
}[] = [
  { screen: 'inicio-dashboard', label: 'Início', title: 'Início', icon: 'space_dashboard' },
  {
    screen: 'consultas',
    label: 'Consultas',
    title: 'Consultas',
    icon: 'calendar_month',
    also: 'agendar',
  },
  {
    screen: 'prontuario',
    label: 'Prontuário',
    title: 'Prontuário Digital & Odontograma',
    icon: 'clinical_notes',
  },
  { screen: 'convenio', label: 'Convênio', title: 'Convênio & Cobertura', icon: 'verified_user' },
  { screen: 'configuracoes', label: 'Configurações', title: 'Configurações', icon: 'settings' },
];

/** Itens do menu de gestão; cada papel vê só o que `canAccess` permite. */
const MANAGEMENT_NAV: { screen: ScreenId; label: string; icon: string }[] = [
  { screen: 'admin-agenda', label: 'Agenda', icon: 'calendar_month' },
  { screen: 'agendar', label: 'Novo Agendamento', icon: 'add_task' },
  { screen: 'admin-pacientes', label: 'Pacientes', icon: 'medical_services' },
  { screen: 'admin-dentistas', label: 'Dentistas & Equipe', icon: 'badge' },
  { screen: 'admin-visao-geral', label: 'Visão Geral', icon: 'grid_view' },
  { screen: 'admin-faturamento', label: 'Faturamento & Convênios', icon: 'payments' },
  { screen: 'admin-salas', label: 'Salas & Equipamentos', icon: 'meeting_room' },
  { screen: 'admin-relatorios', label: 'Relatórios & Auditoria', icon: 'query_stats' },
  { screen: 'admin-configuracoes', label: 'Configurações do Sistema', icon: 'settings' },
];

const ROLE_BADGE: Record<UserRole, string> = {
  paciente: 'Paciente',
  funcionario: 'Perfil Recepção',
  dentista: 'Perfil Dentista',
  administrador: 'Perfil Administrativo',
};

export const NavigationRail: React.FC = () => {
  const { currentScreen, setScreen, currentUser, setUserRole, dataSource } = useApp();

  // Paciente usa a barra estreita; todo o restante da equipe usa o menu de gestão.
  if (currentUser.role === 'paciente') {
    return (
      <aside className="fixed left-0 top-0 z-50 flex h-full w-20 flex-col items-center border-r border-[#dde4e3]/50 bg-[#f4fbfa] py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:border-[#263131] dark:bg-[#141b1b]">
        {/* Brand Monogram */}
        <div
          onClick={() => setScreen('inicio-dashboard')}
          className="group mb-6 flex cursor-pointer flex-col items-center justify-center"
        >
          <img
            src={ASSETS.logo}
            alt="OdontoAura Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="mt-1 text-[11px] font-bold tracking-wider text-[#005051] dark:text-[#84d4d4]">
            AURA
          </span>
        </div>

        <nav className="flex w-full flex-1 flex-col items-center gap-3 px-1">
          {PATIENT_NAV.map((item) => {
            const active = currentScreen === item.screen || currentScreen === item.also;
            return (
              <button
                key={item.screen}
                onClick={() => setScreen(item.screen)}
                className={`group flex w-full flex-col items-center gap-1 transition-colors ${
                  active
                    ? 'font-semibold text-[#005051] dark:text-[#84d4d4]'
                    : 'text-[#3e4949] hover:text-[#161d1d] dark:text-[#bec9c8] dark:hover:text-white'
                }`}
                title={item.title}
              >
                <div
                  className={`indicator flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-[#cce8e7] text-[#005051] dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                      : 'group-hover:bg-[#e2eae9] dark:group-hover:bg-[#202929]'
                  }`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
                    {item.icon}
                  </span>
                </div>
                <span className="text-center text-[11px] leading-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Atalho de demonstração: trocar de perfil */}
          {dataSource === 'local' && (
            <div className="mt-2 flex w-12 justify-center border-t border-[#dde4e3] pt-2 dark:border-[#263131]">
              <button
                onClick={() => setUserRole('administrador')}
                className="flex h-10 w-10 flex-col items-center justify-center rounded-full text-[#4a6363] transition-colors hover:bg-[#eef5f4] hover:text-[#005051] dark:hover:bg-[#202929]"
                title="Acessar Gestão Clínica / Admin"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  admin_panel_settings
                </span>
              </button>
            </div>
          )}
        </nav>
      </aside>
    );
  }

  // Menu de gestão (recepção, dentista, administrador): 288 px no desktop.
  const items = MANAGEMENT_NAV.filter((item) => canAccess(currentUser.role, item.screen));

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col justify-between border-r border-[#dde4e3]/60 bg-[#eef5f4] py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all lg:w-72 dark:border-[#263131] dark:bg-[#141b1b]">
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* Brand Header */}
        <div
          onClick={() => setScreen(homeFor(currentUser.role))}
          className="group flex cursor-pointer items-center gap-3 px-4"
        >
          <img
            src={ASSETS.logo}
            alt="OdontoAura Logo"
            className="h-8 w-auto shrink-0 object-contain"
          />
          <div className="hidden flex-col lg:flex">
            <span className="text-base font-bold tracking-tight text-[#005051] dark:text-[#84d4d4]">
              OdontoAura
            </span>
            <span className="text-xs text-[#4a6363] dark:text-[#bec9c8]">
              Gestão Clínica Odontológica
            </span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-3 lg:px-4">
          <div className="flex items-center justify-between rounded-xl bg-[#dde4e3] px-3 py-1.5 dark:bg-[#202929]">
            <span className="hidden text-xs font-semibold text-[#3e4949] lg:inline dark:text-[#bec9c8]">
              {ROLE_BADGE[currentUser.role]}
            </span>
            <span className="mx-auto h-2 w-2 animate-pulse rounded-full bg-[#005051] lg:mx-0 dark:bg-[#84d4d4]"></span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {items.map((item) => {
            const active = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => setScreen(item.screen)}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#cce8e7] font-semibold text-[#051f20] shadow-sm dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                    : 'text-[#3e4949] hover:bg-[#e2eae9] hover:text-[#161d1d] dark:text-[#bec9c8] dark:hover:bg-[#202929] dark:hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-[20px]">
                  {item.icon}
                </span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Atalho de demonstração: voltar ao portal do paciente */}
          {dataSource === 'local' && (
            <div className="mt-2 border-t border-[#dde4e3] pt-2 dark:border-[#263131]">
              <button
                onClick={() => setUserRole('paciente')}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#005051] transition-colors hover:bg-[#e2eae9] dark:text-[#84d4d4] dark:hover:bg-[#202929]"
                title="Abrir Visão do Paciente"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  personal_injury
                </span>
                <span className="hidden lg:inline">Mudar p/ Portal do Paciente</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Situação da conexão */}
      <div className="px-3 pt-2 lg:px-4">
        <div className="flex items-center justify-between rounded-2xl border border-[#dde4e3]/60 bg-[#e8efee] p-3 dark:border-[#263131] dark:bg-[#1a2222]">
          <div className="hidden min-w-0 flex-col lg:flex">
            <span className="text-[11px] text-[#3e4949] dark:text-[#bec9c8]">
              {dataSource === 'supabase' ? 'Banco de dados' : 'Modo demonstração'}
            </span>
            <span className="truncate text-xs font-semibold text-[#005051] dark:text-[#84d4d4]">
              {dataSource === 'supabase' ? 'Conectado (Supabase)' : 'Dados de exemplo locais'}
            </span>
          </div>
          <span
            aria-hidden="true"
            className="material-symbols-outlined mx-auto text-[20px] text-[#005051] lg:mx-0 dark:text-[#84d4d4]"
          >
            {dataSource === 'supabase' ? 'cloud_done' : 'science'}
          </span>
        </div>
      </div>
    </aside>
  );
};
