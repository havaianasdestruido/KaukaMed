import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  type ScreenId,
  type UserRole,
  type UserProfile,
  type Appointment,
  type Doctor,
  type TissGuide,
  type ClinicRoom,
  type ToothRecord,
} from '../types';
import {
  MOCK_PROFILES,
  INITIAL_APPOINTMENTS,
  INITIAL_DOCTORS,
  INITIAL_TISS_GUIDES,
  CLINIC_ROOMS,
  INITIAL_ODONTOGRAM,
} from '../data/mockData';
import { activeDataSource, reportDataSource, type DataSource } from '../lib/env';
import { supabase, toErrorMessage } from '../lib/supabase';
import * as authService from '../services/auth';
import * as appointmentService from '../services/appointments';
import * as doctorService from '../services/doctors';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  currentUser: UserProfile;
  setUserRole: (role: UserRole) => void;
  isDark: boolean;
  toggleTheme: () => void;
  appointments: Appointment[];
  doctors: Doctor[];
  tissGuides: TissGuide[];
  rooms: ClinicRoom[];
  odontogram: ToothRecord[];
  selectedTooth: ToothRecord | null;
  setSelectedTooth: (t: ToothRecord | null) => void;

  // Modals
  showRayXModal: boolean;
  setShowRayXModal: (b: boolean) => void;
  showPreConsultationModal: boolean;
  setShowPreConsultationModal: (b: boolean) => void;
  showAiAuditModal: boolean;
  setShowAiAuditModal: (b: boolean) => void;
  showNewDoctorModal: boolean;
  setShowNewDoctorModal: (b: boolean) => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Actions
  addAppointment: (apt: Partial<Appointment>) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
  cancelAppointment: (id: string) => void;
  transmitTissBatch: (batchId: string) => void;
  resolveGlosa: (guideId: string) => void;
  convertToPrivate: (guideId: string) => void;
  addNewDoctor: (doc: Doctor) => void;

  // Backend / autenticação
  /** `supabase` = dados reais; `local` = dataset de demonstração. */
  dataSource: DataSource;
  /** `true` enquanto a sessão persistida do Supabase está sendo restaurada. */
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: authService.SignUpInput) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isRemote = activeDataSource === 'supabase';

  // Com Supabase, o app começa na tela de login até a sessão ser restaurada.
  const [currentScreen, setScreen] = useState<ScreenId>(isRemote ? 'login' : 'inicio-dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_PROFILES.paciente);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(isRemote);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!isRemote);
  const [isDark, setIsDark] = useState<boolean>(false);

  const [appointments, setAppointments] = useState<Appointment[]>(
    isRemote ? [] : INITIAL_APPOINTMENTS,
  );
  const [doctors, setDoctors] = useState<Doctor[]>(isRemote ? [] : INITIAL_DOCTORS);
  const [tissGuides, setTissGuides] = useState<TissGuide[]>(INITIAL_TISS_GUIDES);
  const [rooms] = useState<ClinicRoom[]>(CLINIC_ROOMS);
  const [odontogram] = useState<ToothRecord[]>(INITIAL_ODONTOGRAM);
  const [selectedTooth, setSelectedTooth] = useState<ToothRecord | null>(INITIAL_ODONTOGRAM[13]); // tooth 24

  const [showRayXModal, setShowRayXModal] = useState<boolean>(false);
  const [showPreConsultationModal, setShowPreConsultationModal] = useState<boolean>(false);
  const [showAiAuditModal, setShowAiAuditModal] = useState<boolean>(false);
  const [showNewDoctorModal, setShowNewDoctorModal] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast],
  );

  const reportError = useCallback(
    (error: unknown, fallback: string) => {
      console.error(error);
      addToast(toErrorMessage(error, fallback), 'error');
    },
    [addToast],
  );

  // -------------------------------------------------------------------------
  // Backend (Supabase): sessão, perfil e carga de dados
  // -------------------------------------------------------------------------

  const routeForRole = (role: UserRole): ScreenId => {
    if (role === 'administrador' || role === 'funcionario') return 'admin-visao-geral';
    if (role === 'dentista') return 'admin-dentistas';
    return 'inicio-dashboard';
  };

  const refreshData = useCallback(async () => {
    if (!isRemote) return;
    const [apts, docs] = await Promise.allSettled([
      appointmentService.listAppointments(),
      doctorService.listDoctors(),
    ]);
    if (apts.status === 'fulfilled') setAppointments(apts.value);
    else reportError(apts.reason, 'Não foi possível carregar as consultas.');
    if (docs.status === 'fulfilled') setDoctors(docs.value);
    else reportError(docs.reason, 'Não foi possível carregar o corpo clínico.');
  }, [isRemote, reportError]);

  /** Aplica um perfil autenticado ao estado do app e carrega os dados dele. */
  const enterSession = useCallback(
    async (profile: UserProfile) => {
      setCurrentUser(profile);
      setIsAuthenticated(true);
      setScreen(routeForRole(profile.role));
      await refreshData();
    },
    [refreshData],
  );

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setAppointments([]);
    setDoctors([]);
    setCurrentUser(MOCK_PROFILES.paciente);
    setScreen('login');
  }, []);

  // Restaura a sessão persistida e acompanha login/logout em outras abas.
  const sessionRestored = useRef(false);
  useEffect(() => {
    reportDataSource();
    if (!supabase || sessionRestored.current) return;
    sessionRestored.current = true;

    (async () => {
      try {
        const userId = await authService.currentUserId();
        if (userId) await enterSession(await authService.loadProfile(userId));
      } catch (error) {
        reportError(error, 'Não foi possível restaurar a sessão.');
      } finally {
        setIsAuthLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') clearSession();
    });
    return () => data.subscription.unsubscribe();
  }, [enterSession, clearSession, reportError]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isRemote) return true;
    try {
      const profile = await authService.signIn(email, password);
      await enterSession(profile);
      addToast(`Bem-vindo(a), ${profile.name}!`, 'success');
      return true;
    } catch (error) {
      reportError(error, 'Não foi possível entrar.');
      return false;
    }
  };

  const register = async (input: authService.SignUpInput): Promise<boolean> => {
    if (!isRemote) return true;
    try {
      const { profile, needsConfirmation } = await authService.signUp(input);
      if (needsConfirmation || !profile) {
        addToast('Cadastro criado! Confirme o e-mail enviado para poder entrar.', 'info');
        setScreen('login');
        return true;
      }
      await enterSession(profile);
      addToast('Cadastro finalizado com sucesso! Bem-vindo(a) à OdontoAura.', 'success');
      return true;
    } catch (error) {
      reportError(error, 'Não foi possível concluir o cadastro.');
      return false;
    }
  };

  const logout = async () => {
    if (isRemote) {
      try {
        await authService.signOut();
      } catch (error) {
        reportError(error, 'Erro ao encerrar a sessão.');
      }
      clearSession();
    } else {
      setScreen('login');
    }
    addToast('Sessão encerrada com sucesso.', 'info');
  };

  const requestPasswordReset = async (email: string) => {
    if (!isRemote) {
      addToast('Link de recuperação enviado para o e-mail cadastrado.', 'info');
      return;
    }
    if (!email.trim()) {
      addToast('Informe o e-mail para recuperar a senha.', 'error');
      return;
    }
    try {
      await authService.sendPasswordReset(email);
      addToast('Link de recuperação enviado para o e-mail informado.', 'info');
    } catch (error) {
      reportError(error, 'Não foi possível enviar o link de recuperação.');
    }
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const setUserRole = (role: UserRole) => {
    if (isRemote) {
      // Com backend real o papel vem do banco (profiles.role) e não pode ser
      // trocado pela interface.
      addToast('O perfil de acesso é definido pela sua conta.', 'info');
      return;
    }
    const profile = MOCK_PROFILES[role] || MOCK_PROFILES.paciente;
    setCurrentUser(profile);
    addToast(`Perfil alterado para ${role.toUpperCase()}: ${profile.name}`, 'info');

    // Route to appropriate view
    if (role === 'administrador' || role === 'funcionario') {
      setScreen('admin-visao-geral');
    } else if (role === 'dentista') {
      setScreen('admin-dentistas');
    } else {
      setScreen('inicio-dashboard');
    }
  };

  const addAppointment = (aptData: Partial<Appointment>) => {
    if (isRemote) {
      appointmentService
        .createAppointment({
          patient: currentUser,
          doctorName: aptData.doctorName,
          date: aptData.date ?? '',
          time: aptData.time ?? '',
          procedure: aptData.procedure,
          notes: aptData.notes,
          durationMinutes: aptData.durationMinutes,
        })
        .then((apt) => {
          setAppointments((prev) => [apt, ...prev]);
          addToast('Consulta agendada com sucesso! Protocolo gerado.', 'success');
        })
        .catch((error) => reportError(error, 'Não foi possível agendar a consulta.'));
      return;
    }
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      date: aptData.date || 'Quinta-feira, 24 de Outubro de 2024',
      time: aptData.time || '14:30',
      doctorName: aptData.doctorName || 'Dr. Marcelo Arantes',
      doctorSpecialty: aptData.doctorSpecialty || 'Ortodontia & Alinhadores',
      doctorCro: aptData.doctorCro || 'CRO/SP 89.412',
      doctorAvatar: aptData.doctorAvatar || doctors[0].avatar,
      room: aptData.room || 'Consultório 03 - Unidade Jardins',
      unit: aptData.unit || 'OdontoAura Unidade Jardins',
      procedure: aptData.procedure || 'Avaliação & Manutenção Ortodôntica',
      status: 'confirmado',
      insuranceName: aptData.insuranceName || 'Unimed Odonto Master Gold',
      insuranceCoverage: '100% Coberto',
      copayAmount: 0,
      durationMinutes: 45,
      notes: aptData.notes,
    };
    setAppointments((prev) => [newApt, ...prev]);
    addToast('Consulta agendada com sucesso! Protocolo gerado.', 'success');
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    if (isRemote) {
      const current = appointments.find((a) => a.id === id);
      appointmentService
        .rescheduleAppointment(id, newDate, newTime, current?.durationMinutes)
        .then((apt) => {
          setAppointments((prev) => prev.map((a) => (a.id === id ? apt : a)));
          addToast(`Consulta reagendada com sucesso para ${newDate} às ${newTime}!`, 'success');
        })
        .catch((error) => reportError(error, 'Não foi possível reagendar a consulta.'));
      return;
    }
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, date: newDate, time: newTime } : apt)),
    );
    addToast(`Consulta reagendada com sucesso para ${newDate} às ${newTime}!`, 'success');
  };

  const cancelAppointment = (id: string) => {
    if (isRemote) {
      appointmentService
        .cancelAppointment(id)
        .then(() => {
          setAppointments((prev) =>
            prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelado' } : apt)),
          );
          addToast('Consulta cancelada com sucesso sem cobrança de taxa.', 'info');
        })
        .catch((error) => reportError(error, 'Não foi possível cancelar a consulta.'));
      return;
    }
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelado' } : apt)),
    );
    addToast('Consulta cancelada com sucesso sem cobrança de taxa.', 'info');
  };

  const transmitTissBatch = (batchId: string) => {
    setTissGuides((prev) =>
      prev.map((g) =>
        g.id === batchId
          ? {
              ...g,
              status: 'faturada_conciliada',
              statusLabel: 'Transmitido com Sucesso via WebService ANS',
            }
          : g,
      ),
    );
    addToast('Lote TISS enviado com sucesso para a operadora via WebService Seguro!', 'success');
  };

  const resolveGlosa = (guideId: string) => {
    setTissGuides((prev) =>
      prev.map((g) =>
        g.id === guideId
          ? {
              ...g,
              status: 'pronto_transmissao',
              statusLabel: 'Pronto para Transmissão Web',
              alertMessage: undefined,
            }
          : g,
      ),
    );
    addToast('Laudo Radiológico periapical anexado. Guia validada e liberada!', 'success');
  };

  const convertToPrivate = (guideId: string) => {
    setTissGuides((prev) =>
      prev.map((g) =>
        g.id === guideId
          ? {
              ...g,
              insurer: 'Particular / PIX',
              status: 'faturada_conciliada',
              statusLabel: 'Convertido para Faturamento Particular',
              alertMessage: undefined,
            }
          : g,
      ),
    );
    addToast('Procedimento convertido para cobrança particular com sucesso!', 'info');
  };

  const addNewDoctor = (doc: Doctor) => {
    setDoctors((prev) => [doc, ...prev]);
    if (isRemote) {
      // Criar o usuário do profissional exige a service-role key (backend).
      addToast(
        `${doc.name} adicionado apenas nesta sessão — o cadastro definitivo de profissionais depende do backend.`,
        'info',
      );
      return;
    }
    addToast(`Profissional ${doc.name} (${doc.cro}) cadastrado com sucesso!`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setScreen,
        currentUser,
        setUserRole,
        isDark,
        toggleTheme,
        appointments,
        doctors,
        tissGuides,
        rooms,
        odontogram,
        selectedTooth,
        setSelectedTooth,
        showRayXModal,
        setShowRayXModal,
        showPreConsultationModal,
        setShowPreConsultationModal,
        showAiAuditModal,
        setShowAiAuditModal,
        showNewDoctorModal,
        setShowNewDoctorModal,
        toasts,
        addToast,
        removeToast,
        addAppointment,
        rescheduleAppointment,
        cancelAppointment,
        transmitTissBatch,
        resolveGlosa,
        convertToPrivate,
        addNewDoctor,
        dataSource: activeDataSource,
        isAuthLoading,
        isAuthenticated,
        login,
        register,
        logout,
        requestPasswordReset,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
