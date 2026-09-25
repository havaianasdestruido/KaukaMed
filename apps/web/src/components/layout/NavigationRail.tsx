import React from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';

export const NavigationRail: React.FC = () => {
  const { currentScreen, setScreen, currentUser, setUserRole, dataSource } = useApp();

  const isAdminOrStaff =
    currentUser.role === 'administrador' ||
    currentUser.role === 'funcionario' ||
    currentScreen.startsWith('admin-');

  // Patient Navigation Rail (80px wide)
  if (!isAdminOrStaff) {
    return (
      <aside className="fixed left-0 top-0 h-full w-20 bg-[#f4fbfa] dark:bg-[#141b1b] z-50 flex flex-col items-center py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#dde4e3]/50 dark:border-[#263131]">
        {/* Brand Monogram */}
        <div
          onClick={() => setScreen('inicio-dashboard')}
          className="flex flex-col items-center justify-center mb-6 cursor-pointer group"
        >
          <img
            src={ASSETS.logo}
            alt="OdontoAura Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-[11px] text-[#005051] dark:text-[#84d4d4] font-bold mt-1 tracking-wider">
            AURA
          </span>
        </div>

        {/* Navigation Destination Links */}
        <nav className="flex-1 flex flex-col items-center gap-3 w-full px-1">
          <button
            onClick={() => setScreen('inicio-dashboard')}
            className={`group flex flex-col items-center gap-1 w-full transition-colors ${
              currentScreen === 'inicio-dashboard'
                ? 'text-[#005051] dark:text-[#84d4d4] font-semibold'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] dark:hover:text-white'
            }`}
            title="Início"
          >
            <div
              className={`indicator w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'inicio-dashboard'
                  ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1]'
                  : 'group-hover:bg-[#e2eae9] dark:group-hover:bg-[#202929]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">space_dashboard</span>
            </div>
            <span className="text-[11px] text-center leading-tight">Início</span>
          </button>

          <button
            onClick={() => setScreen('consultas')}
            className={`group flex flex-col items-center gap-1 w-full transition-colors ${
              currentScreen === 'consultas' || currentScreen === 'agendar'
                ? 'text-[#005051] dark:text-[#84d4d4] font-semibold'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] dark:hover:text-white'
            }`}
            title="Consultas"
          >
            <div
              className={`indicator w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'consultas' || currentScreen === 'agendar'
                  ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1]'
                  : 'group-hover:bg-[#e2eae9] dark:group-hover:bg-[#202929]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <span className="text-[11px] text-center leading-tight">Consultas</span>
          </button>

          <button
            onClick={() => setScreen('prontuario')}
            className={`group flex flex-col items-center gap-1 w-full transition-colors ${
              currentScreen === 'prontuario'
                ? 'text-[#005051] dark:text-[#84d4d4] font-semibold'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] dark:hover:text-white'
            }`}
            title="Prontuário Digital & Odontograma"
          >
            <div
              className={`indicator w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'prontuario'
                  ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1]'
                  : 'group-hover:bg-[#e2eae9] dark:group-hover:bg-[#202929]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">clinical_notes</span>
            </div>
            <span className="text-[11px] text-center leading-tight">Prontuário</span>
          </button>

          <button
            onClick={() => setScreen('convenio')}
            className={`group flex flex-col items-center gap-1 w-full transition-colors ${
              currentScreen === 'convenio'
                ? 'text-[#005051] dark:text-[#84d4d4] font-semibold'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] dark:hover:text-white'
            }`}
            title="Convênio & Cobertura"
          >
            <div
              className={`indicator w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'convenio'
                  ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1]'
                  : 'group-hover:bg-[#e2eae9] dark:group-hover:bg-[#202929]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <span className="text-[11px] text-center leading-tight">Convênio</span>
          </button>

          <button
            onClick={() => setScreen('configuracoes')}
            className={`group flex flex-col items-center gap-1 w-full transition-colors ${
              currentScreen === 'configuracoes'
                ? 'text-[#005051] dark:text-[#84d4d4] font-semibold'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] dark:hover:text-white'
            }`}
            title="Configurações"
          >
            <div
              className={`indicator w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                currentScreen === 'configuracoes'
                  ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1]'
                  : 'group-hover:bg-[#e2eae9] dark:group-hover:bg-[#202929]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </div>
            <span className="text-[11px] text-center leading-tight">Configurações</span>
          </button>

          {/* Quick link to switch to Admin console */}
          {dataSource === 'local' && (
            <div className="pt-2 mt-2 border-t border-[#dde4e3] dark:border-[#263131] w-12 flex justify-center">
              <button
                onClick={() => setUserRole('administrador')}
                className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-[#4a6363] hover:text-[#005051] hover:bg-[#eef5f4] dark:hover:bg-[#202929] transition-colors"
                title="Acessar Gestão Clínica / Admin"
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Help Button */}
        <div className="flex flex-col items-center mt-auto">
          <button
            onClick={() => setScreen('configuracoes')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] transition-colors"
            title="Suporte & Ajuda"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>
        </div>
      </aside>
    );
  }

  // Admin / Clinical Management Sidebar Drawer (288px wide / 72rem)
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-72 bg-[#eef5f4] dark:bg-[#141b1b] z-50 flex flex-col justify-between py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#dde4e3]/60 dark:border-[#263131] transition-all">
      <div className="flex flex-col gap-4">
        {/* Brand Header */}
        <div
          onClick={() => setScreen('admin-visao-geral')}
          className="flex items-center gap-3 px-4 cursor-pointer group"
        >
          <img
            src={ASSETS.logo}
            alt="OdontoAura Logo"
            className="h-8 w-auto object-contain flex-shrink-0"
          />
          <div className="hidden lg:flex flex-col">
            <span className="text-base text-[#005051] dark:text-[#84d4d4] font-bold tracking-tight">
              OdontoAura
            </span>
            <span className="text-xs text-[#4a6363] dark:text-[#bec9c8]">
              Gestão Clínica Odontológica
            </span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-3 lg:px-4">
          <div className="bg-[#dde4e3] dark:bg-[#202929] rounded-xl px-3 py-1.5 flex items-center justify-between">
            <span className="hidden lg:inline text-xs text-[#3e4949] dark:text-[#bec9c8] font-semibold">
              Perfil Administrativo
            </span>
            <span className="h-2 w-2 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-pulse mx-auto lg:mx-0"></span>
          </div>
        </div>

        {/* Admin Navigation Links */}
        <nav className="flex flex-col gap-1 px-2">
          <button
            onClick={() => setScreen('admin-visao-geral')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-visao-geral'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">grid_view</span>
            <span className="hidden lg:inline">Visão Geral</span>
          </button>

          <button
            onClick={() => setScreen('admin-dentistas')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-dentistas'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">badge</span>
            <span className="hidden lg:inline">Dentistas & Equipe</span>
          </button>

          <button
            onClick={() => setScreen('admin-pacientes')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-pacientes'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">
              medical_services
            </span>
            <span className="hidden lg:inline">Pacientes</span>
          </button>

          <button
            onClick={() => setScreen('admin-faturamento')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-faturamento'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">payments</span>
            <span className="hidden lg:inline">Faturamento & Convênios</span>
          </button>

          <button
            onClick={() => setScreen('admin-salas')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-salas'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">
              meeting_room
            </span>
            <span className="hidden lg:inline">Salas & Equipamentos</span>
          </button>

          <button
            onClick={() => setScreen('admin-relatorios')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-relatorios'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">query_stats</span>
            <span className="hidden lg:inline">Relatórios & Auditoria</span>
          </button>

          <button
            onClick={() => setScreen('admin-configuracoes')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentScreen === 'admin-configuracoes'
                ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929] hover:text-[#161d1d] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">settings</span>
            <span className="hidden lg:inline">Configurações do Sistema</span>
          </button>

          {/* Quick toggle to return to Patient Portal */}
          {dataSource === 'local' && (
            <div className="pt-2 mt-2 border-t border-[#dde4e3] dark:border-[#263131]">
              <button
                onClick={() => setUserRole('paciente')}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#005051] dark:text-[#84d4d4] hover:bg-[#e2eae9] dark:hover:bg-[#202929] rounded-xl transition-colors"
                title="Abrir Visão do Paciente"
              >
                <span className="material-symbols-outlined text-[18px]">personal_injury</span>
                <span className="hidden lg:inline">Mudar p/ Portal do Paciente</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Footer SaaS Server Status */}
      <div className="px-3 lg:px-4 pt-2">
        <div className="bg-[#e8efee] dark:bg-[#1a2222] p-3 rounded-2xl flex items-center justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="hidden lg:flex flex-col min-w-0">
            <span className="text-[11px] text-[#3e4949] dark:text-[#bec9c8]">SaaS Conectado</span>
            <span className="text-xs text-[#005051] dark:text-[#84d4d4] font-semibold truncate">
              Servidor Clínico Ativo
            </span>
          </div>
          <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mx-auto lg:mx-0">
            cloud_done
          </span>
        </div>
      </div>
    </aside>
  );
};
