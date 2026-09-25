import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const SettingsScreen: React.FC = () => {
  const { currentUser, isDark, toggleTheme, addToast } = useApp();

  const [notificationsWhatsApp, setNotificationsWhatsApp] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsSMS, setNotificationsSMS] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleSaveSettings = () => {
    addToast('Preferências de conta e segurança salvas com sucesso.', 'success');
  };

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white tracking-tight font-bold">
          Configurações & Privacidade
        </h1>
        <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
          Gerenciamento de conta, notificações de agendamentos e conformidade com a LGPD Saúde.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#005051]"
            />
            <div>
              <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                {currentUser.name}
              </h2>
              <p className="text-xs text-[#6e7979]">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-[10px] font-bold uppercase">
                Perfil: {currentUser.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => addToast('Foto de perfil e dados atualizados.', 'info')}
            className="h-9 px-4 rounded-full bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#dde4e3] text-xs font-semibold text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838]"
          >
            Editar Perfil
          </button>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#161d1d] dark:text-white">
            Aparência do Aplicativo
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#005051] dark:text-[#84d4d4]">
                {isDark ? 'dark_mode' : 'light_mode'}
              </span>
              <div>
                <span className="text-xs font-bold text-[#161d1d] dark:text-white block">
                  Tema Escuro
                </span>
                <span className="text-[11px] text-[#6e7979]">
                  Reduz o brilho para ambientes clínicos ou de baixa luminosidade
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                isDark ? 'bg-[#005051] justify-end' : 'bg-[#dde4e3] justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#161d1d] dark:text-white">
            Lembretes & Comunicação
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-[#dde4e3]/50 dark:border-[#263131]">
            <div>
              <span className="text-xs font-bold text-[#161d1d] dark:text-white block">
                Lembretes via WhatsApp
              </span>
              <span className="text-[11px] text-[#6e7979]">
                Confirmação instantânea de consultas 24h e 2h antes
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsWhatsApp}
              onChange={(e) => setNotificationsWhatsApp(e.target.checked)}
              className="w-5 h-5 rounded text-[#005051] accent-[#005051]"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#dde4e3]/50 dark:border-[#263131]">
            <div>
              <span className="text-xs font-bold text-[#161d1d] dark:text-white block">
                E-mails Informativos
              </span>
              <span className="text-[11px] text-[#6e7979]">
                Envio de laudos, recibos e guias de convênio
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEmail}
              onChange={(e) => setNotificationsEmail(e.target.checked)}
              className="w-5 h-5 rounded text-[#005051] accent-[#005051]"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-bold text-[#161d1d] dark:text-white block">
                SMS de Urgência
              </span>
              <span className="text-[11px] text-[#6e7979]">
                Apenas em caso de reagendamento emergencial
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsSMS}
              onChange={(e) => setNotificationsSMS(e.target.checked)}
              className="w-5 h-5 rounded text-[#005051] accent-[#005051]"
            />
          </div>
        </div>

        {/* Security & LGPD */}
        <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#161d1d] dark:text-white">
            Segurança & LGPD Saúde
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-[#dde4e3]/50 dark:border-[#263131]">
            <div>
              <span className="text-xs font-bold text-[#161d1d] dark:text-white block">
                Biometria Facial / Digital
              </span>
              <span className="text-[11px] text-[#6e7979]">
                Requerer biometria para abrir prontuário e radiografias
              </span>
            </div>
            <input
              type="checkbox"
              checked={biometricsEnabled}
              onChange={(e) => setBiometricsEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-[#005051] accent-[#005051]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <span className="text-xs font-bold text-[#161d1d] dark:text-white block">
                Portabilidade de Dados Médicos
              </span>
              <span className="text-[11px] text-[#6e7979]">
                Baixar cópia integral criptografada de todos os registros clínicos
              </span>
            </div>
            <button
              onClick={() =>
                addToast(
                  'Arquivo de dados clínicos exportado conforme as diretrizes da ANPD.',
                  'success',
                )
              }
              className="h-9 px-4 rounded-full bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#dde4e3] text-[#005051] dark:text-[#84d4d4] text-xs font-bold transition-colors border border-[#dde4e3] dark:border-[#263131]"
            >
              Exportar Arquivo LGPD
            </button>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full h-11 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold transition-all shadow-md"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};
