import React, { useMemo, useState } from 'react';

import { useApp } from '../../context/AppContext';
import { bucketOf, nextAppointment, statusBadge } from '../../lib/appointmentRules';
import { describeDistance, todayKey } from '../../lib/clinicTime';
import { downloadIcs } from '../../lib/ics';
import { normalizeText } from '../../lib/text';

const SPECIALTIES = [
  {
    id: 'clinica-geral',
    title: 'Clínica Geral',
    desc: 'Limpeza e prevenção',
    icon: 'dentistry',
    category: 'Todos os Cuidados',
  },
  {
    id: 'ortodontia',
    title: 'Ortodontia',
    desc: 'Aparelhos invisíveis',
    icon: 'align_horizontal_center',
    category: 'Aparelhos & Alinhadores',
  },
  {
    id: 'odontopediatria',
    title: 'Odontopediatria',
    desc: 'Cuidado humanizado',
    icon: 'child_care',
    category: 'Saúde Infantil',
  },
  {
    id: 'implantodontia',
    title: 'Implantodontia',
    desc: 'Próteses fixas & carga',
    icon: 'build',
    category: 'Cirurgias & Implantes',
  },
  {
    id: 'endodontia',
    title: 'Endodontia',
    desc: 'Tratamento de canal',
    icon: 'biotech',
    category: 'Cirurgias & Implantes',
  },
  {
    id: 'harmonizacao',
    title: 'Harmonização',
    desc: 'Estética orofacial',
    icon: 'face_retouching_natural',
    category: 'Estética Dental',
  },
];

const FILTER_CHIPS = [
  'Todos os Cuidados',
  'Estética Dental',
  'Cirurgias & Implantes',
  'Aparelhos & Alinhadores',
  'Saúde Infantil',
];

/** Painel inicial do paciente: próxima consulta, atalhos e últimas consultas (dados reais). */
export const PatientDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    myInsurances,
    setScreen,
    setBookingSpecialty,
    setShowPreConsultationModal,
    dataSource,
  } = useApp();

  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('Todos os Cuidados');
  const [specialtySearch, setSpecialtySearch] = useState('');

  const withStatus = useMemo(
    () => appointments.filter((a) => a.dbStatus).map((a) => ({ ...a, status: a.dbStatus! })),
    [appointments],
  );
  const next = nextAppointment(withStatus);
  const upcomingCount = appointments.filter(
    (a) => a.dbStatus && bucketOf(a.dbStatus) === 'upcoming',
  ).length;
  const recent = useMemo(
    () =>
      [...appointments]
        .filter((a) => a.startsAt)
        .sort((a, b) => new Date(b.startsAt!).getTime() - new Date(a.startsAt!).getTime())
        .slice(0, 4),
    [appointments],
  );

  const plan = myInsurances.find(
    (i) => i.status === 'ACTIVE' && (!i.validUntil || i.validUntil >= todayKey()),
  );
  const firstName = currentUser.name.split(' ').slice(0, 2).join(' ');

  const filteredSpecialties = SPECIALTIES.filter((s) => {
    const matchesCategory =
      activeSpecialtyFilter === 'Todos os Cuidados' || s.category === activeSpecialtyFilter;
    const term = normalizeText(specialtySearch);
    const matchesSearch =
      term === '' || normalizeText(s.title).includes(term) || normalizeText(s.desc).includes(term);
    return matchesCategory && matchesSearch;
  });

  const goBook = (specialty: string | null = null) => {
    setBookingSpecialty(specialty);
    setScreen('agendar');
  };

  const nextBadge = next ? statusBadge(next.status) : null;

  return (
    <div className="flex w-full flex-col gap-6 pb-16">
      {/* 1. Boas-vindas */}
      <header className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] border border-[#dde4e3]/60 bg-[#eef5f4] p-6 shadow-sm md:flex-row md:items-center sm:p-8 dark:border-[#263131] dark:bg-[#1a2222]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#cce8e7]/40 blur-3xl dark:bg-[#004f50]/20"></div>
        <div className="z-10 flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt=""
            className="h-16 w-16 rounded-full object-cover shadow-[0_2px_8px_rgba(0,40,40,0.12)] ring-4 ring-white md:h-20 md:w-20 dark:ring-[#202929]"
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#161d1d] sm:text-2xl dark:text-white">
              Olá, {firstName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]"
              >
                {next ? 'event_upcoming' : 'event_note'}
              </span>
              {next?.startsAt
                ? `Sua próxima consulta é ${describeDistance(next.startsAt)}.`
                : 'Você não tem consultas marcadas no momento.'}
            </p>
          </div>
        </div>

        <div className="z-10 flex shrink-0 items-center gap-3">
          <button
            onClick={() => goBook()}
            className="flex h-10 items-center gap-2 rounded-full bg-[#005051] px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#006a6b] hover:shadow active:scale-95"
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
              add_task
            </span>
            <span>Agendar Consulta</span>
          </button>
        </div>
      </header>

      {/* 2. Próximo agendamento */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#dde4e3]/60 bg-[#eef5f4] p-6 shadow-md sm:p-8 dark:border-[#263131] dark:bg-[#1a2222]">
        {next && nextBadge ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006a6b] px-3 py-1 text-xs font-medium tracking-wide text-white dark:bg-[#004f50]">
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#a0f0f1]"></span>
                  Próximo Agendamento
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${nextBadge.className}`}
                >
                  {nextBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3e4949] dark:text-[#bec9c8]">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  domain
                </span>
                <span>{next.room}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-1 lg:col-span-7">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e7979]">
                  Data & Horário
                </span>
                <div className="flex items-center gap-3 text-2xl font-bold text-[#161d1d] sm:text-3xl dark:text-white">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[32px] text-[#005051] sm:text-[36px] dark:text-[#84d4d4]"
                  >
                    calendar_today
                  </span>
                  <span>{next.date}</span>
                </div>
                <p className="pl-10 text-lg font-semibold text-[#005051] sm:pl-11 dark:text-[#84d4d4]">
                  às {next.time}{' '}
                  <span className="text-xs font-normal text-[#3e4949] dark:text-[#bec9c8]">
                    (duração estimada: {next.durationMinutes} min)
                  </span>
                </p>

                <div className="mt-4 flex items-center gap-4 border-t border-[#dde4e3]/60 pt-4 dark:border-[#263131]">
                  <img
                    src={next.doctorAvatar}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-inner"
                  />
                  <div>
                    <h2 className="text-base font-bold leading-tight text-[#161d1d] dark:text-white">
                      {next.doctorName}
                    </h2>
                    <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
                      {next.doctorSpecialty} • {next.doctorCro}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6e7979]">{next.procedure}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2.5 rounded-2xl border border-[#dde4e3]/80 bg-white/80 p-5 shadow-sm backdrop-blur-md lg:col-span-5 dark:border-[#2d3838] dark:bg-[#202929]/90">
                <span className="mb-1 text-xs font-bold text-[#3e4949] dark:text-[#bec9c8]">
                  Ações do agendamento
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setScreen('consultas')}
                    className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#cce8e7] px-4 text-xs font-semibold text-[#051f20] transition-colors hover:bg-[#b1cccb] dark:bg-[#324b4b] dark:text-[#a0f0f1]"
                    type="button"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                      edit_calendar
                    </span>
                    <span>Confirmar, reagendar ou cancelar</span>
                  </button>
                  <button
                    onClick={() => setShowPreConsultationModal(true)}
                    className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#e8efee] px-4 text-xs font-semibold text-[#005051] transition-colors hover:bg-[#dde4e3] dark:bg-[#263131] dark:text-[#84d4d4]"
                    type="button"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                      info
                    </span>
                    <span>Ver orientações pré-consulta</span>
                  </button>
                  {next.startsAt && next.endsAt && (
                    <button
                      onClick={() =>
                        downloadIcs({
                          id: next.id,
                          startsAt: next.startsAt!,
                          endsAt: next.endsAt!,
                          doctorName: next.doctorName,
                          procedure: next.procedure,
                          location: next.unit,
                          notes: next.notes,
                        })
                      }
                      className="flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-medium text-[#3e4949] transition-colors hover:bg-[#e8efee] dark:text-[#bec9c8] dark:hover:bg-[#263131]"
                      type="button"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                        event
                      </span>
                      <span>Adicionar ao calendário (.ics)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[40px] text-[#6e7979]"
            >
              event_note
            </span>
            <h2 className="text-lg font-bold text-[#161d1d] dark:text-white">
              Nenhuma consulta marcada
            </h2>
            <p className="max-w-md text-xs text-[#3e4949] dark:text-[#bec9c8]">
              Escolha o profissional e um horário livre — leva menos de um minuto.
            </p>
            <button
              onClick={() => goBook()}
              className="mt-1 h-11 rounded-full bg-[#005051] px-6 text-xs font-bold text-white shadow-sm hover:bg-[#006a6b]"
              type="button"
            >
              Agendar minha consulta
            </button>
          </div>
        )}
      </section>

      {/* 3. Ações rápidas */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#161d1d] dark:text-white">
            Ações Rápidas
          </h2>
          <span className="text-xs text-[#6e7979]">Acesso frequente</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => goBook()}
            className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#005051] p-6 text-left text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-125"></div>
            <div className="z-10 flex w-full items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#a0f0f1] text-[#002020] shadow-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">
                  add_task
                </span>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white">
                Prioritário
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="text-base font-bold text-white">Agendar Consulta</h3>
              <p className="mt-1 text-xs text-[#97e7e7]">Marque horário com especialistas</p>
            </div>
          </button>

          <QuickCard
            icon="calendar_month"
            title="Minhas Consultas"
            subtitle="Próximos passos e histórico"
            chip={
              upcomingCount > 0
                ? `${upcomingCount} ${upcomingCount === 1 ? 'ativa' : 'ativas'}`
                : 'Nenhuma ativa'
            }
            onClick={() => setScreen('consultas')}
          />

          <QuickCard
            icon="clinical_notes"
            title="Prontuário & Exames"
            subtitle="Odontograma, raios-x e laudos"
            chip={dataSource === 'supabase' ? 'Exemplo' : undefined}
            onClick={() => setScreen('prontuario')}
            iconBg="bg-[#d2e4ff] dark:bg-[#1e293b]"
          />

          <QuickCard
            icon="verified_user"
            title="Meu Convênio"
            subtitle="Validação e rede de cobertura"
            chip={plan ? plan.insuranceName : 'Particular'}
            onClick={() => setScreen('convenio')}
          />
        </div>
      </section>

      {/* 4. Especialidades */}
      <section className="flex flex-col gap-6 rounded-[28px] border border-[#dde4e3]/60 bg-[#eef5f4] p-6 shadow-sm sm:p-8 dark:border-[#263131] dark:bg-[#1a2222]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#161d1d] dark:text-white">
              Especialidades Odontológicas
            </h2>
            <p className="mt-0.5 text-xs text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
              Escolha uma especialidade e veja os profissionais com horário livre
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-full border border-[#dde4e3] bg-white px-4 py-2 shadow-sm md:w-80 dark:border-[#2d3838] dark:bg-[#202929]">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[20px] text-[#6e7979]"
            >
              search
            </span>
            <input
              className="w-full border-0 bg-transparent text-xs text-[#161d1d] outline-none placeholder:text-[#6e7979] dark:text-white"
              placeholder="Buscar clareamento, implante, profilaxia..."
              type="search"
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTER_CHIPS.map((chip) => {
            const isSelected = activeSpecialtyFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => setActiveSpecialtyFilter(chip)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#005051] text-white shadow-sm'
                    : 'bg-[#dde4e3] text-[#3e4949] hover:bg-[#cce8e7] dark:bg-[#263131] dark:text-[#bec9c8]'
                }`}
                type="button"
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {filteredSpecialties.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goBook(item.title)}
              className="group flex cursor-pointer flex-col items-center rounded-2xl border border-[#dde4e3]/60 bg-white p-4 text-center shadow-sm transition-all hover:bg-[#cce8e7]/30 dark:border-[#263131] dark:bg-[#202929] dark:hover:bg-[#2d3838]"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#cce8e7] text-[#005051] transition-transform group-hover:scale-110 dark:bg-[#324b4b] dark:text-[#a0f0f1]">
                <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
                  {item.icon}
                </span>
              </div>
              <span className="text-sm font-bold leading-tight text-[#161d1d] dark:text-white">
                {item.title}
              </span>
              <span className="mt-1 text-[11px] text-[#6e7979]">{item.desc}</span>
            </button>
          ))}
          {filteredSpecialties.length === 0 && (
            <p className="col-span-full text-xs text-[#6e7979]">
              Nenhuma especialidade encontrada.
            </p>
          )}
        </div>
      </section>

      {/* 5. Últimas consultas */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[#161d1d] dark:text-white">
              Últimas Consultas
            </h2>
            <span className="text-xs text-[#6e7979]">Recentes</span>
          </div>
          <button
            onClick={() => setScreen('consultas')}
            className="flex items-center gap-1 text-xs font-bold text-[#005051] hover:underline dark:text-[#84d4d4]"
          >
            <span>Ver todas</span>
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {recent.length === 0 && (
            <p className="rounded-2xl border border-[#dde4e3]/60 bg-white p-5 text-xs text-[#6e7979] dark:border-[#263131] dark:bg-[#1a2222]">
              Suas consultas vão aparecer aqui depois do primeiro agendamento.
            </p>
          )}
          {recent.map((apt) => {
            const badge = statusBadge(apt.dbStatus ?? 'SCHEDULED');
            return (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-2xl border border-[#dde4e3]/60 bg-white p-4 shadow-sm transition-colors hover:bg-[#eef5f4] dark:border-[#263131] dark:bg-[#1a2222] dark:hover:bg-[#202929]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#cce8e7] text-[#005051] dark:bg-[#324b4b] dark:text-[#a0f0f1]">
                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                      {apt.dbStatus === 'COMPLETED'
                        ? 'check_circle'
                        : apt.dbStatus === 'CANCELLED'
                          ? 'event_busy'
                          : 'calendar_clock'}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                        {apt.procedure}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#6e7979]">
                      {apt.doctorName} • {apt.date} às {apt.time} • {apt.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setScreen('consultas')}
                  className="hidden h-9 rounded-full bg-[#eef5f4] px-3 text-xs font-semibold text-[#3e4949] transition-colors hover:text-[#161d1d] sm:block dark:bg-[#263131] dark:text-[#bec9c8]"
                  type="button"
                >
                  Detalhes
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const QuickCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  chip?: string;
  iconBg?: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, chip, iconBg = 'bg-[#cce8e7] dark:bg-[#324b4b]', onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex min-h-[170px] flex-col justify-between rounded-[24px] border border-[#dde4e3]/60 bg-white p-6 text-left text-[#161d1d] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[#263131] dark:bg-[#1a2222] dark:text-white"
  >
    <div className="flex w-full items-center justify-between gap-2">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-[#005051] dark:text-[#a0f0f1] ${iconBg}`}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[24px]">
          {icon}
        </span>
      </div>
      {chip && (
        <span className="inline-flex h-6 max-w-[60%] items-center justify-center truncate rounded-full bg-[#cce8e7] px-2.5 text-[11px] font-bold text-[#002020] dark:bg-[#324b4b] dark:text-[#a0f0f1]">
          {chip}
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-base font-bold text-[#161d1d] transition-colors group-hover:text-[#005051] dark:text-white dark:group-hover:text-[#84d4d4]">
        {title}
      </h3>
      <p className="mt-1 text-xs text-[#6e7979]">{subtitle}</p>
    </div>
  </button>
);
