import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { type UserRole } from '../../types';

export const TopHeader: React.FC = () => {
  const { currentUser, setUserRole, isDark, toggleTheme, logout, dataSource } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setShowProfileMenu(false);
  };

  const isAdminOrStaff = currentUser.role === 'administrador' || currentUser.role === 'funcionario';

  return (
    <header className="fixed top-0 right-0 h-16 bg-[#f4fbfa]/90 dark:bg-[#141b1b]/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#dde4e3]/40 dark:border-[#263131]/60 transition-all left-20 lg:left-72">
      <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1a2222] px-4 py-1.5 rounded-full shadow-[0_1px_3px_1px_rgba(0,40,40,0.08)] w-full max-w-md focus-within:shadow-[0_2px_6px_2px_rgba(0,40,40,0.12)] border border-[#bec9c8]/30 dark:border-[#263131] transition-shadow">
            <span className="material-symbols-outlined text-[#6e7979] text-[20px]">search</span>
            <input
              className="bg-transparent border-0 outline-none w-full text-sm text-[#161d1d] dark:text-[#e1e8e7] placeholder:text-[#6e7979]"
              placeholder={
                isAdminOrStaff
                  ? 'Buscar prontuário, dentista, procedimento ou CPF...'
                  : 'Buscar pacientes, consultas ou prontuários...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
            />
          </div>

          <div className="hidden xl:flex items-center gap-2 bg-[#eef5f4] dark:bg-[#1a2222] px-3 py-1 rounded-full text-xs text-[#3e4949] dark:text-[#bec9c8]">
            <span className="w-2 h-2 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-pulse"></span>
            <span className="font-medium">Operação Estável (100%)</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unit selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#eef5f4] dark:bg-[#1a2222] px-3 py-1.5 rounded-xl border border-transparent dark:border-[#263131]">
            <span className="material-symbols-outlined text-[#4a6363] dark:text-[#84d4d4] text-[18px]">
              domain
            </span>
            <select
              className="bg-transparent text-xs font-semibold text-[#161d1d] dark:text-[#e1e8e7] focus:outline-none cursor-pointer pr-1"
              aria-label="Selecionar unidade de atendimento"
            >
              <option className="dark:bg-[#1a2222]" value="jardins">
                Unidade Jardins - Matriz
              </option>
              <option className="dark:bg-[#1a2222]" value="farialima">
                Unidade Faria Lima
              </option>
              <option className="dark:bg-[#1a2222]" value="alphaville">
                Unidade Alphaville
              </option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar Tema Claro/Escuro"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#263131] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificações"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#263131] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center">
                {isAdminOrStaff ? '4' : '2'}
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a2222] rounded-2xl shadow-xl border border-[#dde4e3] dark:border-[#263131] p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#dde4e3] dark:border-[#263131] mb-2">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                    Notificações Clínicas
                  </span>
                  <span className="text-xs text-[#005051] dark:text-[#84d4d4] font-semibold cursor-pointer">
                    Marcar como lidas
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded-xl bg-[#eef5f4] dark:bg-[#202929] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5">
                      calendar_month
                    </span>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-[#161d1d] dark:text-white">
                        Consulta Confirmada
                      </span>
                      <span className="text-[#3e4949] dark:text-[#bec9c8]">
                        Quinta-feira, 24/Out às 14:30 com Dr. Marcelo Arantes
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#eef5f4] dark:bg-[#202929] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5">
                      warning
                    </span>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-[#161d1d] dark:text-white">
                        Alerta TISS Convênio
                      </span>
                      <span className="text-[#3e4949] dark:text-[#bec9c8]">
                        3 guias preventivas retidas para validação de laudo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#dde4e3] dark:bg-[#263131] mx-1"></div>

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#e2eae9] dark:hover:bg-[#263131] transition-colors"
              type="button"
              aria-label="Menu do Usuário"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#cce8e7] dark:ring-[#324b4b] shadow-sm"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#161d1d] dark:text-[#e1e8e7] leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-[#4a6363] dark:text-[#bec9c8] capitalize">
                  {currentUser.specialty || currentUser.role}
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#6e7979]">
                expand_more
              </span>
            </button>

            {/* Profile & Role Switcher Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1a2222] rounded-2xl shadow-2xl border border-[#dde4e3] dark:border-[#263131] p-3 z-50">
                <div className="flex items-center gap-3 pb-3 border-b border-[#dde4e3] dark:border-[#263131] mb-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#005051]"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#161d1d] dark:text-white truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-[#6e7979] truncate">{currentUser.email}</span>
                    <span className="text-[10px] font-semibold text-[#005051] dark:text-[#84d4d4] uppercase mt-0.5">
                      Perfil: {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher — só no modo demonstração (com Supabase o papel vem da conta) */}
                {dataSource === 'local' && (
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-[11px] font-bold text-[#6e7979] px-2 uppercase tracking-wider">
                      Alternar Perfil Ativo
                    </span>
                    <button
                      onClick={() => handleRoleChange('paciente')}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        currentUser.role === 'paciente'
                          ? 'bg-[#cce8e7] text-[#051f20] font-bold dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                          : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4] dark:hover:bg-[#202929]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>Paciente (Camila Santos)</span>
                      </span>
                      {currentUser.role === 'paciente' && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleChange('dentista')}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        currentUser.role === 'dentista'
                          ? 'bg-[#cce8e7] text-[#051f20] font-bold dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                          : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4] dark:hover:bg-[#202929]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">dentistry</span>
                        <span>Dentista (Dr. Marcelo)</span>
                      </span>
                      {currentUser.role === 'dentista' && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleChange('administrador')}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        currentUser.role === 'administrador'
                          ? 'bg-[#cce8e7] text-[#051f20] font-bold dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                          : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4] dark:hover:bg-[#202929]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          admin_panel_settings
                        </span>
                        <span>Administrador (Dr. Rodrigo)</span>
                      </span>
                      {currentUser.role === 'administrador' && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleRoleChange('funcionario')}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        currentUser.role === 'funcionario'
                          ? 'bg-[#cce8e7] text-[#051f20] font-bold dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                          : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4] dark:hover:bg-[#202929]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                        <span>Funcionário (Recepção)</span>
                      </span>
                      {currentUser.role === 'funcionario' && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-[#dde4e3] dark:border-[#263131]">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      void logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sair para Tela de Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
