export type UserRole = 'paciente' | 'funcionario' | 'dentista' | 'administrador';

export type ScreenId =
  | 'login'
  | 'cadastro'
  | 'inicio-dashboard'
  | 'agendar'
  | 'consultas'
  | 'prontuario'
  | 'convenio'
  | 'configuracoes'
  | 'admin-visao-geral'
  | 'admin-dentistas'
  | 'admin-pacientes'
  | 'admin-faturamento'
  | 'admin-salas'
  | 'admin-relatorios'
  | 'admin-configuracoes';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  specialty?: string;
  cro?: string;
  planName?: string;
  planNumber?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorCro: string;
  doctorAvatar: string;
  room: string;
  unit: string;
  procedure: string;
  status: 'confirmado' | 'agendado' | 'finalizado' | 'cancelado';
  insuranceName: string;
  insuranceCoverage: string;
  copayAmount: number;
  notes?: string;
  durationMinutes: number;
  modality?: 'presencial' | 'teleorientacao';
  rating?: number;
}

export interface Doctor {
  id: string;
  name: string;
  cro: string;
  specialties: string[];
  contractType: string;
  schedule: string;
  room: string;
  appointmentsCount: number;
  commissionPercentage: number;
  monthlyRevenue: number;
  npsScore: number;
  npsPercentage: number;
  status:
    'Em Atendimento' | 'Em Cirurgia' | 'Escala Regular' | 'Ativo' | 'Plantão Ativo' | 'Em Férias';
  avatar: string;
  isCertified: boolean;
}

export interface TissGuide {
  id: string;
  number: string;
  guideType: string;
  insurer: string;
  plan: string;
  patientName: string;
  patientCard: string;
  procedureName: string;
  tussCode: string;
  toothOrRegion?: string;
  session?: string;
  totalValue: number;
  executionDate: string;
  status:
    | 'pronto_transmissao'
    | 'glosa_preventiva'
    | 'autorizado_instantaneo'
    | 'faturada_conciliada'
    | 'glosa_ans_definitiva';
  statusLabel: string;
  alertMessage?: string;
  requiresAction?: boolean;
}

export interface ClinicRoom {
  id: string;
  number: string;
  name: string;
  specialty: string;
  status:
    | 'em_atendimento'
    | 'em_procedimento'
    | 'higienizado_livre'
    | 'manutencao_preventiva'
    | 'pronto_encaixe';
  statusLabel: string;
  doctorName?: string;
  patientName?: string;
  currentProcedure?: string;
  remainingMinutes?: number;
  nextScheduled?: string;
  nextTime?: string;
  technicianInfo?: string;
}

export interface ToothRecord {
  number: number;
  condition: 'healthy' | 'restoration' | 'endodontics' | 'implant' | 'orthodontics' | 'cavity';
  conditionLabel: string;
  notes?: string;
  lastUpdated: string;
}
