import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { TopHeader } from './components/layout/TopHeader';
import { NavigationRail } from './components/layout/NavigationRail';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { AppointmentBooking } from './components/patient/AppointmentBooking';
import { MyAppointments } from './components/patient/MyAppointments';
import { MedicalRecordOdontogram } from './components/patient/MedicalRecordOdontogram';
import { InsuranceScreen } from './components/patient/InsuranceScreen';
import { SettingsScreen } from './components/patient/SettingsScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AgendaScreen } from './components/admin/AgendaScreen';
import { DoctorTeamManagement } from './components/admin/DoctorTeamManagement';
import { TissBillingScreen } from './components/admin/TissBillingScreen';
import { PatientManagementScreen } from './components/admin/PatientManagementScreen';
import { RoomsManagementScreen } from './components/admin/RoomsManagementScreen';
import { RayXModal } from './components/modals/RayXModal';
import { PreConsultationModal } from './components/modals/PreConsultationModal';
import { AiAuditModal } from './components/modals/AiAuditModal';
import { NewDoctorModal } from './components/modals/NewDoctorModal';

const AppContent: React.FC = () => {
  const {
    currentScreen,
    currentUser,
    isDark,
    isAuthLoading,
    isAuthenticated,
    isRecoveringPassword,
  } = useApp();

  // Sem roteador, o navegador não volta ao topo quando a tela muda (nem depois do login):
  // no celular o painel abriria rolado até onde estava o botão "Entrar".
  useEffect(() => {
    const scroller = document.scrollingElement ?? document.documentElement;
    scroller.scrollTop = 0;
  }, [currentScreen, isAuthenticated]);

  // Enquanto a sessão persistida do Supabase é restaurada, mostra um splash.
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f4fbfa] text-[#005051]">
        <span className="material-symbols-outlined animate-spin text-[36px]">
          progress_activity
        </span>
        <span className="text-sm font-semibold">Carregando OdontoAura…</span>
      </div>
    );
  }

  // Chegou pelo link de recuperação de senha: só pode definir a nova senha.
  if (isRecoveringPassword) {
    return (
      <div
        className={`min-h-screen ${isDark ? 'dark bg-neutral-900 text-neutral-100' : 'bg-surface text-on-surface'}`}
      >
        <ResetPasswordScreen />
        <ToastContainer />
      </div>
    );
  }

  // Sem sessão, apenas as telas de login e cadastro ficam acessíveis.
  const isAuthScreen =
    currentScreen === 'login' || currentScreen === 'cadastro' || !isAuthenticated;

  const renderScreen = () => {
    if (!isAuthenticated && currentScreen !== 'cadastro') return <LoginScreen />;
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'cadastro':
        return <RegisterScreen />;
      case 'inicio-dashboard':
        return <PatientDashboard />;
      case 'agendar':
        return <AppointmentBooking />;
      case 'consultas':
        return <MyAppointments />;
      case 'prontuario':
        return <MedicalRecordOdontogram />;
      case 'convenio':
        return <InsuranceScreen />;
      case 'configuracoes':
        return <SettingsScreen />;
      case 'admin-visao-geral':
        return <AdminDashboard />;
      case 'admin-agenda':
        return <AgendaScreen />;
      case 'admin-dentistas':
        return <DoctorTeamManagement />;
      case 'admin-pacientes':
        return <PatientManagementScreen />;
      case 'admin-faturamento':
        return <TissBillingScreen />;
      case 'admin-salas':
        return <RoomsManagementScreen />;
      case 'admin-relatorios':
        return <AdminDashboard />;
      case 'admin-configuracoes':
        return <SettingsScreen />;
      default:
        return <PatientDashboard />;
    }
  };

  if (isAuthScreen) {
    return (
      <div
        className={`min-h-screen ${isDark ? 'dark bg-neutral-900 text-neutral-100' : 'bg-surface text-on-surface'}`}
      >
        {renderScreen()}
        <ToastContainer />
      </div>
    );
  }

  // Toda a equipe (recepção, dentista e administrador) usa o menu lateral de gestão.
  const isAdminSection = currentUser.role !== 'paciente';

  return (
    <div
      className={`min-h-screen flex ${isDark ? 'dark bg-neutral-900 text-neutral-100' : 'bg-[#f4f7f8] text-[#191c1d]'}`}
    >
      {/* Navigation Rail / Drawer */}
      <NavigationRail />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-20 ${isAdminSection ? 'lg:ml-72' : ''}`}
      >
        <TopHeader />

        {/* O cabeçalho é fixo (h-16): o topo do conteúdo precisa começar abaixo dele. */}
        <main className="flex-1 p-4 pt-20 md:p-8 md:pt-24 overflow-y-auto">{renderScreen()}</main>
      </div>

      {/* Modals & Portals */}
      <RayXModal />
      <PreConsultationModal />
      <AiAuditModal />
      <NewDoctorModal />

      {/* Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
