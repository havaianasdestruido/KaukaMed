import React, { useEffect, useMemo, useState } from 'react';
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from '@kaukamed/shared';

import { useApp } from '../../context/AppContext';
import { ACTIVE_STATUSES, statusBadge } from '../../lib/appointmentRules';
import {
  addDays,
  clinicWallTimeToDate,
  dateKeyOf,
  formatDayMonth,
  formatLongDateKey,
  formatTime,
  parseDateKey,
  todayKey,
  weekdayOf,
  type DateKey,
} from '../../lib/clinicTime';
import { maskCpf } from '../../lib/cpf';
import { formatBRL } from '../../lib/format';
import { toErrorMessage } from '../../lib/supabase';
import { type Appointment, type Doctor } from '../../types';
import { AppointmentActions } from '../common/AppointmentActions';

/** `proximas` = de hoje em diante, sem limite de data. */
type Period = 'proximas' | 'dia' | 'semana';
type StatusFilter = 'todos' | 'abertas' | AppointmentStatus;

const OPEN_STATUSES: AppointmentStatus[] = [...ACTIVE_STATUSES];

/** Segunda-feira da semana que contém `day`. */
function mondayOf(day: DateKey): DateKey {
  return addDays(day, -((weekdayOf(day) + 6) % 7));
}

/**
 * Agenda da clínica (recepção, administrador e dentista).
 *
 * Mostra as consultas do dia ou da semana com filtros, e as ações de cada consulta
 * conforme o perfil. O dentista só enxerga as próprias consultas e a recepção,
 * todas — quem garante isso é o banco (`list_appointments`), não esta tela.
 */
export const AgendaScreen: React.FC = () => {
  const { currentUser, gateway, dataVersion, setScreen, setBookingSpecialty } = useApp();
  const isDoctor = currentUser.role === 'dentista';
  const isStaff = currentUser.role === 'funcionario' || currentUser.role === 'administrador';

  const [period, setPeriod] = useState<Period>('proximas');
  const [day, setDay] = useState<DateKey>(() => todayKey());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Lista de dentistas para o filtro (somente recepção/administrador).
  useEffect(() => {
    if (!isStaff) return;
    let cancelled = false;
    gateway
      .listDoctors()
      .then((list) => {
        if (!cancelled) setDoctors(list);
      })
      .catch(() => {
        if (!cancelled) setDoctors([]);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, isStaff]);

  const range = useMemo(() => {
    const today = todayKey();
    if (period === 'proximas') {
      // De hoje em diante: sempre mostra algo útil, mesmo em semanas sem consultas.
      return {
        first: today,
        lastInclusive: today,
        from: clinicWallTimeToDate(today, '00:00').toISOString(),
        to: undefined as string | undefined,
      };
    }
    const first = period === 'dia' ? day : mondayOf(day);
    const last = addDays(first, period === 'dia' ? 1 : 7);
    return {
      first,
      lastInclusive: addDays(last, -1),
      from: clinicWallTimeToDate(first, '00:00').toISOString(),
      to: clinicWallTimeToDate(last, '00:00').toISOString() as string | undefined,
    };
  }, [period, day]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    gateway
      .listAppointments({
        from: range.from,
        to: range.to,
        statuses:
          statusFilter === 'todos'
            ? undefined
            : statusFilter === 'abertas'
              ? OPEN_STATUSES
              : [statusFilter],
        doctorId: doctorFilter || undefined,
        search: debouncedSearch || undefined,
        limit: 500,
      })
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e, 'Não foi possível carregar a agenda.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, range, statusFilter, doctorFilter, debouncedSearch, dataVersion, reloadToken]);

  const groups = useMemo(() => {
    const byDay = new Map<DateKey, Appointment[]>();
    for (const apt of items) {
      if (!apt.startsAt) continue;
      const key = dateKeyOf(apt.startsAt);
      byDay.set(key, [...(byDay.get(key) ?? []), apt]);
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const counts = useMemo(() => {
    const total = { all: items.length, open: 0, done: 0, cancelled: 0 };
    for (const apt of items) {
      if (!apt.dbStatus) continue;
      if (ACTIVE_STATUSES.includes(apt.dbStatus)) total.open += 1;
      else if (apt.dbStatus === 'COMPLETED') total.done += 1;
      else total.cancelled += 1; // CANCELLED e NO_SHOW
    }
    return total;
  }, [items]);

  const today = todayKey();
  const step = period === 'dia' ? 1 : 7;
  const periodLabel =
    period === 'proximas'
      ? 'A partir de hoje'
      : period === 'dia'
        ? formatLongDateKey(range.first)
        : `${formatDayMonth(range.first)} a ${formatDayMonth(range.lastInclusive)}`;

  const goNewBooking = () => {
    setBookingSpecialty(null);
    setScreen('agendar');
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-16">
      {/* Cabeçalho */}
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#161d1d] sm:text-3xl dark:text-white">
            {isDoctor ? 'Minha Agenda' : 'Agenda da Clínica'}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]"
            >
              calendar_month
            </span>
            {isDoctor
              ? 'Consultas dos seus pacientes: inicie e conclua os atendimentos.'
              : 'Confirme, remarque, cancele e acompanhe o atendimento de todos os pacientes.'}
          </p>
        </div>
        {isStaff && (
          <button
            onClick={goNewBooking}
            type="button"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-[#005051] px-5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#006a6b] lg:self-auto"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
              add
            </span>
            <span>Novo agendamento</span>
          </button>
        )}
      </section>

      {/* Controles */}
      <section className="flex flex-col gap-3 rounded-2xl border border-[#dde4e3]/60 bg-white p-4 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center rounded-full bg-[#eef5f4] p-1 dark:bg-[#202929]"
            role="tablist"
          >
            {(['proximas', 'dia', 'semana'] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                  period === p
                    ? 'bg-[#005051] font-bold text-white shadow-sm'
                    : 'font-medium text-[#3e4949] dark:text-[#bec9c8]'
                }`}
              >
                {p === 'proximas' ? 'Próximas' : p === 'dia' ? 'Dia' : 'Semana'}
              </button>
            ))}
          </div>

          {period === 'proximas' ? (
            <span className="px-2 text-xs font-bold text-[#161d1d] dark:text-white">
              {periodLabel}
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Período anterior"
                  onClick={() => setDay((d) => addDays(d, -step))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#3e4949] hover:bg-[#eef5f4] dark:text-[#bec9c8] dark:hover:bg-[#202929]"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    chevron_left
                  </span>
                </button>
                <span className="min-w-[150px] text-center text-xs font-bold text-[#161d1d] dark:text-white">
                  {periodLabel}
                </span>
                <button
                  type="button"
                  aria-label="Próximo período"
                  onClick={() => setDay((d) => addDays(d, step))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#3e4949] hover:bg-[#eef5f4] dark:text-[#bec9c8] dark:hover:bg-[#202929]"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    chevron_right
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDay(today)}
                className="h-9 rounded-full bg-[#cce8e7] px-4 text-xs font-bold text-[#051f20] hover:bg-[#b1cccb] dark:bg-[#324b4b] dark:text-[#a0f0f1]"
              >
                Hoje
              </button>
              <input
                type="date"
                aria-label="Ir para a data"
                value={day}
                onChange={(e) => {
                  if (parseDateKey(e.target.value)) setDay(e.target.value);
                }}
                className="h-9 rounded-full border border-[#dde4e3] bg-[#eef5f4] px-3 text-xs text-[#161d1d] outline-none focus:ring-2 focus:ring-[#005051] dark:border-[#2d3838] dark:bg-[#202929] dark:text-white"
              />
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-[#dde4e3] bg-[#eef5f4] px-4 py-2 dark:border-[#2d3838] dark:bg-[#202929]">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[20px] text-[#6e7979]"
            >
              search
            </span>
            <input
              className="w-full border-0 bg-transparent text-xs text-[#161d1d] outline-none placeholder:text-[#6e7979] dark:text-white"
              placeholder={
                isDoctor ? 'Buscar paciente por nome ou CPF…' : 'Buscar paciente, dentista ou CPF…'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar consultas"
            />
          </div>

          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 rounded-full border border-[#dde4e3] bg-[#eef5f4] px-4 text-xs font-semibold text-[#161d1d] outline-none focus:ring-2 focus:ring-[#005051] dark:border-[#2d3838] dark:bg-[#202929] dark:text-white"
          >
            <option value="todos">Todos os status</option>
            <option value="abertas">Em aberto</option>
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {APPOINTMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          {isStaff && (
            <select
              aria-label="Filtrar por dentista"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="h-10 max-w-[240px] rounded-full border border-[#dde4e3] bg-[#eef5f4] px-4 text-xs font-semibold text-[#161d1d] outline-none focus:ring-2 focus:ring-[#005051] dark:border-[#2d3838] dark:bg-[#202929] dark:text-white"
            >
              <option value="">Todos os dentistas</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            title="Atualizar"
            aria-label="Atualizar agenda"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dde4e3] bg-[#eef5f4] text-[#3e4949] hover:text-[#005051] dark:border-[#2d3838] dark:bg-[#202929] dark:text-[#bec9c8]"
          >
            <span
              aria-hidden="true"
              className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
          </button>
        </div>
      </section>

      {/* Indicadores do período */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Consultas no período" value={counts.all} icon="calendar_month" />
        <Kpi label="Em aberto" value={counts.open} icon="pending_actions" />
        <Kpi label="Finalizadas" value={counts.done} icon="task_alt" />
        <Kpi label="Canceladas / faltas" value={counts.cancelled} icon="event_busy" />
      </section>

      {/* Lista */}
      {error ? (
        <div className="flex flex-col items-start gap-2 rounded-2xl bg-[#ffdad6]/60 p-5 text-xs text-[#93000a]">
          <span className="font-bold">Não foi possível carregar a agenda.</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm"
          >
            Tentar novamente
          </button>
        </div>
      ) : loading && items.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-[#6e7979]">
          <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[18px]">
            progress_activity
          </span>
          Carregando agenda…
        </p>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-[#dde4e3]/60 bg-white p-10 text-center dark:border-[#263131] dark:bg-[#1a2222]">
          <span
            aria-hidden="true"
            className="material-symbols-outlined mb-2 text-4xl text-[#6e7979]"
          >
            event_note
          </span>
          <p className="text-sm font-bold text-[#161d1d] dark:text-white">
            Nenhuma consulta neste período.
          </p>
          <p className="mt-1 text-xs text-[#6e7979]">
            Troque a data, limpe os filtros{isStaff ? ' ou crie um novo agendamento' : ''}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([key, list]) => (
            <section key={key} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#161d1d] dark:text-white">
                <span>{formatLongDateKey(key)}</span>
                {key === today && (
                  <span className="rounded-full bg-[#005051] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    Hoje
                  </span>
                )}
                <span className="text-xs font-normal text-[#6e7979]">
                  {list.length} {list.length === 1 ? 'consulta' : 'consultas'}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {list.map((apt) => (
                  <AgendaRow key={apt.id} apt={apt} showDoctor={!isDoctor} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-[#dde4e3]/60 bg-white p-4 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cce8e7] text-[#005051] dark:bg-[#324b4b] dark:text-[#a0f0f1]">
      <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
        {icon}
      </span>
    </span>
    <div>
      <p className="text-2xl font-bold leading-none text-[#161d1d] dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] text-[#6e7979]">{label}</p>
    </div>
  </div>
);

const AgendaRow: React.FC<{ apt: Appointment; showDoctor: boolean }> = ({ apt, showDoctor }) => {
  const badge = statusBadge(apt.dbStatus ?? 'SCHEDULED');
  const coverage =
    apt.insuranceName === 'Particular'
      ? `Particular${apt.price ? ` • ${formatBRL(apt.price)}` : ''}`
      : apt.insuranceName;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#dde4e3]/60 bg-white p-4 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex w-full shrink-0 items-center gap-3 md:w-32 md:flex-col md:items-start md:gap-0.5">
          <span className="text-lg font-bold text-[#005051] dark:text-[#84d4d4]">
            {apt.startsAt ? formatTime(apt.startsAt) : apt.time}
          </span>
          <span className="text-[11px] text-[#6e7979]">
            até {apt.endsAt ? formatTime(apt.endsAt) : '—'} • {apt.durationMinutes} min
          </span>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[22px] text-[#6e7979]"
            >
              person
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#161d1d] dark:text-white">
                {apt.patientName ?? 'Paciente'}
              </p>
              <p className="truncate text-[11px] text-[#6e7979]">
                {[apt.patientPhone, apt.patientCpf ? maskCpf(apt.patientCpf) : null]
                  .filter(Boolean)
                  .join(' • ') || 'Sem contato cadastrado'}
              </p>
            </div>
          </div>

          {showDoctor && (
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={apt.doctorAvatar}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#161d1d] dark:text-white">
                  {apt.doctorName}
                </p>
                <p className="truncate text-[11px] text-[#6e7979]">{apt.doctorSpecialty}</p>
              </div>
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#161d1d] dark:text-white">
              {apt.procedure}
            </p>
            <p className="truncate text-[11px] text-[#6e7979]">{coverage}</p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center self-start rounded-full px-3 py-1 text-[11px] font-bold md:self-center ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {(apt.notes || apt.cancelReason) && (
        <p className="rounded-xl bg-[#eef5f4] px-3 py-2 text-[11px] text-[#3e4949] dark:bg-[#202929] dark:text-[#bec9c8]">
          {apt.cancelReason ? `Motivo do cancelamento: ${apt.cancelReason}` : `Obs.: ${apt.notes}`}
        </p>
      )}

      <AppointmentActions apt={apt} />
    </article>
  );
};
