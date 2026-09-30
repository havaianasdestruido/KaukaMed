import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type ScreenId,
  type UserRole,
  type UserProfile,
  type Appointment,
  type Doctor,
  type PatientInsurance,
  type PatientSummary,
  type TissGuide,
  type ClinicRoom,
  type ToothRecord,
} from '../types';
import {
  MOCK_PROFILES,
  INITIAL_DOCTORS,
  INITIAL_TISS_GUIDES,
  CLINIC_ROOMS,
  INITIAL_ODONTOGRAM,
} from '../data/mockData';
import { activeDataSource, reportDataSource, type DataSource } from '../lib/env';
import { canAccess, homeFor, roleLabel } from '../lib/access';
import { ACTION_TARGET_STATUS, type AppointmentAction } from '../lib/appointmentRules';
import { openedFromRecoveryLink, supabase, toErrorMessage } from '../lib/supabase';
import * as authService from '../services/auth';
import { type BookInput, type Gateway } from '../services/gateway';
import { createLocalGateway } from '../services/localGateway';
import { remoteGateway } from '../services/remoteGateway';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

type StatusAction = Exclude<AppointmentAction, 'reschedule'>;

const ACTION_SUCCESS_MESSAGE: Record<StatusAction, string> = {
  confirm: 'Consulta confirmada.',
  start: 'Atendimento iniciado.',
  complete: 'Atendimento concluído.',
  cancel: 'Consulta cancelada.',
  no_show: 'Falta registrada.',
};

interface AppContextType {
  currentScreen: ScreenId;
  setScreen: (screen: ScreenId) => void;
  currentUser: UserProfile;
  setUserRole: (role: UserRole) => void;
  isDark: boolean;
  toggleTheme: () => void;
  /** Consultas do paciente logado (para dentista e recepção, a tela de Agenda consulta direto). */
  appointments: Appointment[];
  /** Corpo clínico (tela de equipe). Para agendar, use `gateway.listDoctors()`. */
  doctors: Doctor[];
  /** Convênios do paciente logado. */
  myInsurances: PatientInsurance[];
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

  // Agenda
  /** Acesso a dados da agenda (Supabase ou demonstração). */
  gateway: Gateway;
  /** Sobe a cada alteração de dados — telas com consulta própria recarregam quando muda. */
  dataVersion: number;
  /** Especialidade pré-selecionada ao abrir o agendamento (vem do painel do paciente). */
  bookingSpecialty: string | null;
  setBookingSpecialty: (specialty: string | null) => void;
  /** Paciente pré-selecionado ao abrir o agendamento pela recepção (vem da lista de pacientes). */
  bookingPatient: PatientSummary | null;
  setBookingPatient: (patient: PatientSummary | null) => void;
  /** Cada ação devolve `true` se deu certo (o erro, se houver, já é mostrado em um aviso). */
  bookAppointment: (input: BookInput) => Promise<boolean>;
  rescheduleAppointment: (id: string, newStartIso: string) => Promise<boolean>;
  changeAppointmentStatus: (id: string, action: StatusAction, reason?: string) => Promise<boolean>;

  // Faturamento / equipe (ainda dados de exemplo)
  transmitTissBatch: (batchId: string) => void;
  resolveGlosa: (guideId: string, showToast?: boolean) => void;
  convertToPrivate: (guideId: string, showToast?: boolean) => void;
  addNewDoctor: (doc: Doctor) => void;

  // Backend / autenticação
  /** `supabase` = dados reais; `local` = dataset de demonstração. */
  dataSource: DataSource;
  /** `true` enquanto a sessão persistida do Supabase está sendo restaurada. */
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  /** `true` quando o usuário chegou pelo link de recuperação e precisa definir a nova senha. */
  isRecoveringPassword: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: authService.SignUpInput) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (password: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isRemote = activeDataSource === 'supabase';

  // Com Supabase, o app começa na tela de login até a sessão ser restaurada.
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(
    isRemote ? 'login' : homeFor('paciente'),
  );
  const [currentUser, setCurrentUserState] = useState<UserProfile>(MOCK_PROFILES.paciente!);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(isRemote);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!isRemote);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState<boolean>(
    isRemote && openedFromRecoveryLink,
  );
  const [isDark, setIsDark] = useState<boolean>(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(isRemote ? [] : INITIAL_DOCTORS);
  const [myInsurances, setMyInsurances] = useState<PatientInsurance[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [bookingSpecialty, setBookingSpecialty] = useState<string | null>(null);
  const [bookingPatient, setBookingPatient] = useState<PatientSummary | null>(null);
  const [tissGuides, setTissGuides] = useState<TissGuide[]>(INITIAL_TISS_GUIDES);
  const [rooms] = useState<ClinicRoom[]>(CLINIC_ROOMS);
  const [odontogram] = useState<ToothRecord[]>(INITIAL_ODONTOGRAM);
  const [selectedTooth, setSelectedTooth] = useState<ToothRecord | null>(INITIAL_ODONTOGRAM[13]!); // tooth 24

  const [showRayXModal, setShowRayXModal] = useState<boolean>(false);
  const [showPreConsultationModal, setShowPreConsultationModal] = useState<boolean>(false);
  const [showAiAuditModal, setShowAiAuditModal] = useState<boolean>(false);
  const [showNewDoctorModal, setShowNewDoctorModal] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // O usuário atual também fica numa ref: o gateway local precisa enxergá-lo na hora,
  // sem esperar a próxima renderização.
  const userRef = useRef<UserProfile>(currentUser);
  const setCurrentUser = useCallback((profile: UserProfile) => {
    userRef.current = profile;
    setCurrentUserState(profile);
  }, []);

  const gateway = useMemo<Gateway>(
    () => (isRemote ? remoteGateway : createLocalGateway(() => userRef.current)),
    [isRemote],
  );

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

  // Telas de gestão não existem para paciente, e vice-versa (a segurança real é o RLS do banco).
  const setScreen = useCallback((screen: ScreenId) => {
    setCurrentScreen(
      canAccess(userRef.current.role, screen) ? screen : homeFor(userRef.current.role),
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated && !canAccess(currentUser.role, currentScreen)) {
      setCurrentScreen(homeFor(currentUser.role));
    }
  }, [isAuthenticated, currentUser.role, currentScreen]);

  // -------------------------------------------------------------------------
  // Dados: carga inicial e atualização
  // -------------------------------------------------------------------------

  const refreshData = useCallback(
    async (profile?: UserProfile) => {
      const user = profile ?? userRef.current;
      const isPatient = user.role === 'paciente';

      const [apts, docs, plans] = await Promise.allSettled([
        isPatient ? gateway.listAppointments() : Promise.resolve<Appointment[]>([]),
        isRemote ? gateway.listDoctors() : Promise.resolve<Doctor[]>([]),
        isPatient ? gateway.listPatientInsurances() : Promise.resolve<PatientInsurance[]>([]),
      ]);

      if (apts.status === 'fulfilled') setAppointments(apts.value);
      else reportError(apts.reason, 'Não foi possível carregar as consultas.');
      if (isRemote) {
        if (docs.status === 'fulfilled') setDoctors(docs.value);
        else reportError(docs.reason, 'Não foi possível carregar o corpo clínico.');
      }
      if (plans.status === 'fulfilled') setMyInsurances(plans.value);
      else console.warn('[kaukamed] convênios indisponíveis:', plans.reason);

      setDataVersion((v) => v + 1);
    },
    [gateway, isRemote, reportError],
  );

  // Modo demonstração: não há login, então a carga inicial dos dados acontece na abertura.
  useEffect(() => {
    if (!isRemote) void refreshData(userRef.current);
  }, [isRemote, refreshData]);

  /** Aplica um perfil autenticado ao estado do app e carrega os dados dele. */
  const enterSession = useCallback(
    async (profile: UserProfile) => {
      setCurrentUser(profile);
      setIsAuthenticated(true);
      setCurrentScreen(homeFor(profile.role));
      await refreshData(profile);
    },
    [refreshData, setCurrentUser],
  );

  const clearSession = useCallback(() => {
    setIsAuthenticated(false);
    setIsRecoveringPassword(false);
    setAppointments([]);
    setDoctors([]);
    setMyInsurances([]);
    setCurrentUser(MOCK_PROFILES.paciente!);
    setCurrentScreen('login');
  }, [setCurrentUser]);

  // Restaura a sessão persistida e acompanha login/logout em outras abas.
  const sessionRestored = useRef(false);
  useEffect(() => {
    reportDataSource();
    if (!supabase || sessionRestored.current) return;
    sessionRestored.current = true;

    (async () => {
      try {
        const userId = await authService.currentUserId();
        // No fluxo "esqueci a senha" a sessão existe, mas o app só segue depois da nova senha.
        if (userId && !openedFromRecoveryLink) {
          await enterSession(await authService.loadProfile(userId));
        }
      } catch (error) {
        reportError(error, 'Não foi possível restaurar a sessão.');
      } finally {
        setIsAuthLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') clearSession();
      if (event === 'PASSWORD_RECOVERY') setIsRecoveringPassword(true);
    });
    return () => data.subscription.unsubscribe();
  }, [enterSession, clearSession, reportError]);

  // -------------------------------------------------------------------------
  // Autenticação
  // -------------------------------------------------------------------------

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
        setCurrentScreen('login');
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
        return;
      }
      clearSession();
    } else {
      setCurrentScreen('login');
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

  const completePasswordReset = async (password: string): Promise<boolean> => {
    try {
      await authService.updatePassword(password);
      setIsRecoveringPassword(false);
      const userId = await authService.currentUserId();
      if (userId) await enterSession(await authService.loadProfile(userId));
      addToast('Senha redefinida com sucesso!', 'success');
      return true;
    } catch (error) {
      reportError(error, 'Não foi possível redefinir a senha.');
      return false;
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

  /** Só existe no modo demonstração: com o backend real o papel vem de `profiles.role`. */
  const setUserRole = (role: UserRole) => {
    if (isRemote) {
      addToast('O perfil de acesso é definido pela sua conta.', 'info');
      return;
    }
    const profile = MOCK_PROFILES[role] || MOCK_PROFILES.paciente!;
    setCurrentUser(profile);
    setIsAuthenticated(true);
    setCurrentScreen(homeFor(profile.role));
    addToast(`Perfil alterado para ${roleLabel(role)}: ${profile.name}`, 'info');
    void refreshData(profile);
  };

  // -------------------------------------------------------------------------
  // Agenda (mesmas chamadas no modo demonstração e no Supabase)
  // -------------------------------------------------------------------------

  const runMutation = useCallback(
    async (task: () => Promise<unknown>, successMessage: string, failureFallback: string) => {
      try {
        await task();
      } catch (error) {
        reportError(error, failureFallback);
        return false;
      }
      addToast(successMessage, 'success');
      await refreshData();
      return true;
    },
    [addToast, refreshData, reportError],
  );

  const bookAppointment = (input: BookInput) =>
    runMutation(
      () => gateway.bookAppointment(input),
      'Consulta agendada com sucesso!',
      'Não foi possível agendar a consulta.',
    );

  const rescheduleAppointment = (id: string, newStartIso: string) =>
    runMutation(
      () => gateway.rescheduleAppointment(id, newStartIso),
      'Consulta remarcada com sucesso!',
      'Não foi possível remarcar a consulta.',
    );

  const changeAppointmentStatus = (id: string, action: StatusAction, reason?: string) =>
    runMutation(
      () => gateway.setAppointmentStatus(id, ACTION_TARGET_STATUS[action], reason),
      ACTION_SUCCESS_MESSAGE[action],
      'Não foi possível alterar a consulta.',
    );

  // -------------------------------------------------------------------------
  // Faturamento e equipe (dados de exemplo; ainda sem tabelas no banco)
  // -------------------------------------------------------------------------

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

  const resolveGlosa = (guideId: string, showToast = true) => {
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
    if (showToast)
      addToast('Laudo Radiológico periapical anexado. Guia validada e liberada!', 'success');
  };

  const convertToPrivate = (guideId: string, showToast = true) => {
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
    if (showToast)
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
        myInsurances,
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
        gateway,
        dataVersion,
        bookingSpecialty,
        setBookingSpecialty,
        bookingPatient,
        setBookingPatient,
        bookAppointment,
        rescheduleAppointment,
        changeAppointmentStatus,
        transmitTissBatch,
        resolveGlosa,
        convertToPrivate,
        addNewDoctor,
        dataSource: activeDataSource,
        isAuthLoading,
        isAuthenticated,
        isRecoveringPassword,
        login,
        register,
        logout,
        requestPasswordReset,
        completePasswordReset,
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
