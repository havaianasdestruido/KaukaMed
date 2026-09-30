import React, { useMemo, useState } from 'react';
import { APPOINTMENT_STATUS_LABELS } from '@kaukamed/shared';

import { useApp } from '../../context/AppContext';
import { bucketOf, nextAppointment, statusBadge } from '../../lib/appointmentRules';
import { describeDistance } from '../../lib/clinicTime';
import { formatBRL } from '../../lib/format';
import { normalizeText } from '../../lib/text';
import { type Appointment } from '../../types';
import { AppointmentActions } from '../common/AppointmentActions';

type Tab = 'proximas' | 'historico' | 'canceladas';

const shortProtocol = (id: string) => `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

/** Minhas Consultas (paciente): próximas, histórico e canceladas, com ações por status. */
export const MyAppointments: React.FC = () => {
  const { appointments, setScreen, setBookingSpecialty, refreshData, dataSource } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('proximas');
  const [filterQuery, setFilterQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const buckets = useMemo(() => {
    const groups: Record<'upcoming' | 'history' | 'cancelled', Appointment[]> = {
      upcoming: [],
      history: [],
      cancelled: [],
    };
    for (const apt of appointments) {
      if (apt.dbStatus) groups[bucketOf(apt.dbStatus)].push(apt);
    }
    // Próximas em ordem cronológica; histórico e canceladas, das mais recentes para as mais antigas.
    const byStart = (a: Appointment, b: Appointment) =>
      new Date(a.startsAt ?? 0).getTime() - new Date(b.startsAt ?? 0).getTime();
    groups.upcoming.sort(byStart);
    groups.history.sort((a, b) => byStart(b, a));
    groups.cancelled.sort((a, b) => byStart(b, a));
    return groups;
  }, [appointments]);

  const next = nextAppointment(
    appointments.filter((a) => a.dbStatus).map((a) => ({ ...a, status: a.dbStatus! })),
  );

  const term = normalizeText(filterQuery);
  const visible = (list: Appointment[]) =>
    list.filter(
      (a) =>
        term === '' ||
        normalizeText(a.doctorName).includes(term) ||
        normalizeText(a.doctorSpecialty).includes(term),
    );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const scheduleReturn = (apt: Appointment) => {
    setBookingSpecialty(apt.doctorSpecialty || null);
    setScreen('agendar');
  };

  const tabs: { id: Tab; label: string; icon: string; count: number; tone?: 'danger' }[] = [
    {
      id: 'proximas',
      label: 'Próximas Consultas',
      icon: 'event_upcoming',
      count: buckets.upcoming.length,
    },
    {
      id: 'historico',
      label: 'Histórico Realizado',
      icon: 'history',
      count: buckets.history.length,
    },
    {
      id: 'canceladas',
      label: 'Canceladas',
      icon: 'event_busy',
      count: buckets.cancelled.length,
      tone: 'danger',
    },
  ];

  const list = visible(
    activeTab === 'proximas'
      ? buckets.upcoming
      : activeTab === 'historico'
        ? buckets.history
        : buckets.cancelled,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-16">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-1.5 text-xs text-[#6e7979]">
            <button
              onClick={() => setScreen('inicio-dashboard')}
              className="flex items-center gap-1 transition-colors hover:text-[#005051] dark:hover:text-[#84d4d4]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                home
              </span>
              <span>Início</span>
            </button>
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="font-bold text-[#005051] dark:text-[#84d4d4]">Minhas Consultas</span>
          </nav>
          <div className="mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#161d1d] sm:text-3xl dark:text-white">
              Minhas Consultas
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
              Acompanhe seus horários, confirme presença, reagende ou cancele — tudo em um só lugar.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setBookingSpecialty(null);
            setScreen('agendar');
          }}
          className="group flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#005051] px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#006a6b] hover:shadow-md"
          type="button"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90"
          >
            add
          </span>
          <span>Nova Consulta</span>
        </button>
      </div>

      {/* Abas e filtro */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#dde4e3]/60 bg-[#eef5f4] p-2 shadow-sm lg:flex-row lg:items-center dark:border-[#263131] dark:bg-[#1a2222]">
        <div className="flex items-center gap-1 overflow-x-auto p-1" role="tablist">
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={selected}
                type="button"
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-xs transition-all ${
                  selected
                    ? 'bg-[#005051] font-bold text-white shadow-sm'
                    : 'font-medium text-[#3e4949] hover:bg-[#e2eae9] dark:text-[#bec9c8] dark:hover:bg-[#202929]'
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    selected
                      ? 'bg-[#a0f0f1] text-[#002020]'
                      : tab.tone === 'danger'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-[#dde4e3] text-[#3e4949] dark:bg-[#263131] dark:text-[#bec9c8]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="flex w-full items-center gap-2 rounded-full border border-[#dde4e3] bg-white px-3 py-1.5 shadow-sm sm:w-64 dark:border-[#2d3838] dark:bg-[#202929]">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] text-[#6e7979]"
            >
              search
            </span>
            <input
              className="w-full border-0 bg-transparent text-xs text-[#161d1d] outline-none placeholder:text-[#6e7979] dark:text-white"
              placeholder="Filtrar por profissional…"
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              aria-label="Filtrar por profissional"
            />
          </div>
          <button
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            type="button"
            title="Atualizar lista"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dde4e3] bg-white text-[#3e4949] shadow-sm transition-colors hover:text-[#005051] disabled:opacity-60 dark:border-[#2d3838] dark:bg-[#202929] dark:text-[#bec9c8]"
          >
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Lista */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          {list.length === 0 ? (
            <EmptyState
              tab={activeTab}
              filtered={term !== ''}
              onSchedule={() => {
                setBookingSpecialty(null);
                setScreen('agendar');
              }}
            />
          ) : (
            list.map((apt) =>
              activeTab === 'proximas' ? (
                <UpcomingCard key={apt.id} apt={apt} />
              ) : (
                <PastCard
                  key={apt.id}
                  apt={apt}
                  onReturn={activeTab === 'historico' ? () => scheduleReturn(apt) : undefined}
                />
              ),
            )
          )}
        </div>

        {/* Lateral */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="rounded-3xl border border-[#dde4e3]/60 bg-[#eef5f4] p-6 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
            <div className="mb-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[22px] text-[#005051] dark:text-[#84d4d4]"
              >
                insights
              </span>
              <span className="text-sm font-bold text-[#161d1d] dark:text-white">Seu resumo</span>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Próximas" value={buckets.upcoming.length} />
              <Stat label="Realizadas" value={buckets.history.length} />
              <Stat label="Canceladas" value={buckets.cancelled.length} />
            </dl>
            <p className="mt-4 rounded-2xl bg-white p-3 text-xs text-[#3e4949] shadow-sm dark:bg-[#202929] dark:text-[#bec9c8]">
              {next?.startsAt ? (
                <>
                  Sua próxima consulta é <strong>{describeDistance(next.startsAt)}</strong> (
                  {next.date} às {next.time}).
                </>
              ) : (
                'Você não tem consultas futuras. Que tal agendar uma avaliação?'
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-[#dde4e3]/60 bg-white p-6 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#161d1d] dark:text-white">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px] text-[#4a6363] dark:text-[#84d4d4]"
              >
                rule
              </span>
              <span>Como funciona</span>
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[#3e4949] dark:text-[#bec9c8]">
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined mt-0.5 text-[16px] text-[#005051] dark:text-[#84d4d4]"
                >
                  event_available
                </span>
                <span>
                  Toda consulta nasce como <strong>{APPOINTMENT_STATUS_LABELS.SCHEDULED}</strong>.
                  Use “Confirmar presença” para avisar a clínica.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined mt-0.5 text-[16px] text-[#005051] dark:text-[#84d4d4]"
                >
                  schedule
                </span>
                <span>
                  Você pode <strong>reagendar ou cancelar</strong> pelo portal até{' '}
                  <strong>2 horas antes</strong> do horário.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined mt-0.5 text-[16px] text-[#005051] dark:text-[#84d4d4]"
                >
                  call
                </span>
                <span>Em cima da hora ou em urgência, fale diretamente com a clínica.</span>
              </li>
            </ul>
            {dataSource === 'local' && (
              <p className="mt-3 rounded-xl bg-[#fff0c2] p-2.5 text-[11px] text-[#6b5200]">
                Modo demonstração: as consultas ficam só nesta aba do navegador.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-[#202929]">
    <dd className="text-2xl font-bold text-[#005051] dark:text-[#84d4d4]">{value}</dd>
    <dt className="text-[11px] text-[#6e7979]">{label}</dt>
  </div>
);

const EmptyState: React.FC<{ tab: Tab; filtered: boolean; onSchedule: () => void }> = ({
  tab,
  filtered,
  onSchedule,
}) => {
  const text = filtered
    ? 'Nenhuma consulta encontrada para esse filtro.'
    : tab === 'proximas'
      ? 'Você não tem consultas futuras.'
      : tab === 'historico'
        ? 'Suas consultas realizadas aparecerão aqui.'
        : 'Você não cancelou nenhuma consulta.';
  return (
    <div className="rounded-2xl border border-[#dde4e3]/60 bg-white p-8 text-center dark:border-[#263131] dark:bg-[#1a2222]">
      <span aria-hidden="true" className="material-symbols-outlined mb-2 text-4xl text-[#6e7979]">
        {tab === 'canceladas' ? 'event_busy' : 'event_note'}
      </span>
      <p className="text-sm font-bold text-[#161d1d] dark:text-white">{text}</p>
      {tab === 'proximas' && !filtered && (
        <button
          onClick={onSchedule}
          type="button"
          className="mt-4 h-10 rounded-full bg-[#005051] px-6 text-xs font-bold text-white hover:bg-[#006a6b]"
        >
          Agendar consulta
        </button>
      )}
    </div>
  );
};

const CoverageLine: React.FC<{ apt: Appointment }> = ({ apt }) => (
  <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
    {apt.insuranceName === 'Particular'
      ? `Particular${apt.price ? ` • ${formatBRL(apt.price)}` : ''}`
      : `${apt.insuranceName} • ${apt.insuranceCoverage}`}
  </p>
);

const UpcomingCard: React.FC<{ apt: Appointment }> = ({ apt }) => {
  const badge = statusBadge(apt.dbStatus ?? 'SCHEDULED');
  return (
    <article className="rounded-3xl border border-[#dde4e3]/60 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-[#263131] dark:bg-[#1a2222]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${badge.className}`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
            event_available
          </span>
          {badge.label}
        </span>
        <span className="text-xs text-[#6e7979]">Protocolo {shortProtocol(apt.id)}</span>
      </div>

      <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
            {apt.date} às {apt.time}
          </h2>
          <p className="mt-1 text-xs text-[#6e7979]">
            {apt.procedure}
            {apt.notes ? ` — ${apt.notes}` : ''}
          </p>
          <p className="mt-1 text-xs text-[#3e4949] dark:text-[#bec9c8]">
            {apt.durationMinutes} min •{' '}
            {apt.modality === 'teleorientacao' ? 'Atendimento remoto' : apt.room}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={apt.doctorAvatar}
            alt=""
            className="h-11 w-11 rounded-full object-cover shadow-sm"
          />
          <div>
            <p className="text-xs font-bold text-[#161d1d] dark:text-white">{apt.doctorName}</p>
            <p className="text-[11px] text-[#6e7979]">
              {apt.doctorSpecialty} • {apt.doctorCro}
            </p>
          </div>
        </div>
      </div>

      <CoverageLine apt={apt} />

      <div className="mt-4 border-t border-[#dde4e3] pt-4 dark:border-[#263131]">
        <AppointmentActions apt={apt} />
      </div>
    </article>
  );
};

const PastCard: React.FC<{ apt: Appointment; onReturn?: () => void }> = ({ apt, onReturn }) => {
  const badge = statusBadge(apt.dbStatus ?? 'COMPLETED');
  const cancelled = apt.dbStatus === 'CANCELLED';
  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-[#dde4e3]/60 bg-white p-4 shadow-sm md:flex-row md:items-center dark:border-[#263131] dark:bg-[#1a2222]">
      <div className="flex items-start gap-4 md:items-center">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            cancelled
              ? 'bg-[#ffdad6] text-[#93000a]'
              : 'bg-[#eef5f4] text-[#005051] dark:bg-[#202929] dark:text-[#84d4d4]'
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[24px]">
            {cancelled ? 'event_busy' : apt.dbStatus === 'NO_SHOW' ? 'person_off' : 'check_circle'}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-[#161d1d] dark:text-white">{apt.procedure}</h4>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#6e7979]">
            {apt.doctorName} • {apt.date} às {apt.time} • {apt.unit}
          </p>
          {cancelled && apt.cancelReason && (
            <p className="mt-0.5 text-xs text-[#3e4949] dark:text-[#bec9c8]">
              Motivo: {apt.cancelReason}
            </p>
          )}
        </div>
      </div>
      {onReturn && (
        <button
          onClick={onReturn}
          type="button"
          className="flex h-9 shrink-0 items-center gap-1 self-start rounded-full bg-[#005051] px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#006a6b] md:self-auto"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
            replay
          </span>
          <span>Agendar Retorno</span>
        </button>
      )}
    </article>
  );
};
