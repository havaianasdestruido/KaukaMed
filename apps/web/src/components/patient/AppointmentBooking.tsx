import React, { useEffect, useMemo, useState } from 'react';
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_TYPES, type AppointmentType } from '@kaukamed/shared';
import { useApp } from '../../context/AppContext';
import { SlotPicker } from '../common/SlotPicker';
import { formatDateTime, todayKey } from '../../lib/clinicTime';
import { formatBRL } from '../../lib/format';
import { normalizeText, matchesSpecialty } from '../../lib/text';
import { toErrorMessage } from '../../lib/supabase';
import { type AvailableSlot } from '../../services/gateway';
import { type Doctor, type PatientInsurance, type PatientSummary } from '../../types';

/** Urgência não se marca pelo portal: o paciente liga para a clínica. */
const PATIENT_TYPES: readonly AppointmentType[] = [
  'FIRST_VISIT',
  'FOLLOW_UP',
  'RETURN',
  'TELEMEDICINE',
];

/**
 * Agendamento de consulta.
 *
 * - Paciente: escolhe profissional, dia e horário e agenda para si mesmo.
 * - Recepção/administrador: escolhem primeiro o paciente e agendam em nome dele.
 *
 * Os horários vêm da grade real do dentista (`get_available_days/slots`) e o banco
 * revalida tudo na hora de gravar (`book_appointment`): o front-end nunca decide
 * preço, status, local nem se o horário está livre.
 */
export const AppointmentBooking: React.FC = () => {
  const {
    currentUser,
    gateway,
    myInsurances,
    bookingSpecialty,
    setBookingSpecialty,
    bookingPatient,
    setBookingPatient,
    bookAppointment,
    setScreen,
    addToast,
  } = useApp();

  const isStaff = currentUser.role === 'funcionario' || currentUser.role === 'administrador';

  // ---- profissionais -------------------------------------------------------
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [reloadDoctors, setReloadDoctors] = useState(0);
  const [specialty, setSpecialty] = useState<string | null>(bookingSpecialty);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // ---- horário -------------------------------------------------------------
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [slotRefresh, setSlotRefresh] = useState(0);

  // ---- detalhes ------------------------------------------------------------
  const [type, setType] = useState<AppointmentType>('FIRST_VISIT');
  const [insuranceId, setInsuranceId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // ---- paciente (somente recepção) ----------------------------------------
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<PatientSummary[]>([]);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientSummary | null>(bookingPatient);
  const [patientInsurances, setPatientInsurances] = useState<PatientInsurance[]>([]);

  // O paciente pré-selecionado só vale para esta abertura da tela.
  useEffect(() => {
    if (bookingPatient) setBookingPatient(null);
  }, [bookingPatient, setBookingPatient]);

  useEffect(() => {
    let cancelled = false;
    setLoadingDoctors(true);
    setDoctorsError(null);
    gateway
      .listDoctors()
      .then((list) => {
        if (!cancelled) setDoctors(list.filter((d) => d.isActive !== false));
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setDoctorsError(toErrorMessage(e, 'Não foi possível carregar os profissionais.'));
      })
      .finally(() => {
        if (!cancelled) setLoadingDoctors(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, reloadDoctors]);

  // Busca de pacientes (recepção), com um pequeno atraso enquanto digita.
  useEffect(() => {
    if (!isStaff) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      gateway
        .listPatients(patientQuery)
        .then((list) => {
          if (cancelled) return;
          setPatientResults(list.slice(0, 6));
          setPatientsError(null);
        })
        .catch((e: unknown) => {
          if (!cancelled) setPatientsError(toErrorMessage(e, 'Não foi possível buscar pacientes.'));
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [gateway, isStaff, patientQuery]);

  // Convênios do paciente escolhido pela recepção.
  useEffect(() => {
    if (!isStaff) return;
    setInsuranceId(null);
    if (!patient) {
      setPatientInsurances([]);
      return;
    }
    let cancelled = false;
    gateway
      .listPatientInsurances(patient.id)
      .then((list) => {
        if (!cancelled) setPatientInsurances(list);
      })
      .catch(() => {
        if (!cancelled) setPatientInsurances([]);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, isStaff, patient]);

  const insurances = isStaff ? patientInsurances : myInsurances;
  const today = todayKey();
  const usable = (plan: PatientInsurance) =>
    plan.status === 'ACTIVE' && (!plan.validUntil || plan.validUntil >= today);

  // Conjunto de especialidades oferecidas (chips de filtro).
  const specialties = useMemo(
    () =>
      [...new Set(doctors.flatMap((d) => d.specialties))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      ),
    [doctors],
  );

  const filteredDoctors = useMemo(() => {
    if (!specialty) return doctors;
    const list = doctors.filter((d) => matchesSpecialty(d.specialties, specialty));
    return list;
  }, [doctors, specialty]);

  const presetHasNoDoctor =
    Boolean(specialty) && filteredDoctors.length === 0 && doctors.length > 0;
  const visibleDoctors = presetHasNoDoctor ? doctors : filteredDoctors;

  const doctor = doctors.find((d) => d.id === doctorId) ?? null;
  const selectedInsurance = insurances.find((i) => i.id === insuranceId) ?? null;

  const durationMinutes = slot
    ? Math.round((new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60000)
    : null;

  const patientReady = !isStaff || patient !== null;
  const canConfirm = patientReady && doctor !== null && startsAt !== null && !saving;

  const step = !patientReady || !doctor ? 1 : !startsAt ? 2 : 3;

  const pickDoctor = (id: string) => {
    setDoctorId(id);
    setStartsAt(null);
    setSlot(null);
  };

  const handleConfirm = async () => {
    if (!canConfirm || !doctor || !startsAt) return;
    setSaving(true);
    const ok = await bookAppointment({
      doctorId: doctor.id,
      startsAt,
      type,
      insuranceId: selectedInsurance && usable(selectedInsurance) ? selectedInsurance.id : null,
      notes,
      patientId: isStaff ? patient?.id : undefined,
    });
    setSaving(false);

    if (ok) {
      setBookingSpecialty(null);
      setScreen(isStaff ? 'admin-agenda' : 'consultas');
    } else {
      // Quase sempre: alguém reservou o horário antes. Recarrega a grade.
      setStartsAt(null);
      setSlot(null);
      setSlotRefresh((n) => n + 1);
    }
  };

  const steps = [
    { n: 1, title: isStaff ? 'Paciente & Profissional' : 'Profissional' },
    { n: 2, title: 'Data e Horário' },
    { n: 3, title: 'Confirmação & Cobertura' },
  ];

  return (
    <div className="flex w-full flex-col pb-16">
      {/* Cabeçalho */}
      <header className="mb-6 flex flex-col gap-1">
        <nav
          aria-label="Navegação hierárquica"
          className="flex items-center gap-1 text-xs text-[#6e7979]"
        >
          <button
            onClick={() => setScreen(isStaff ? 'admin-agenda' : 'inicio-dashboard')}
            className="transition-colors hover:text-[#005051] dark:hover:text-[#84d4d4]"
          >
            {isStaff ? 'Agenda' : 'Início'}
          </button>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          <span className="font-bold text-[#161d1d] dark:text-white">Agendar Consulta</span>
        </nav>
        <div className="mt-1 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#161d1d] sm:text-3xl dark:text-white">
              {isStaff ? 'Novo agendamento' : 'Agendamento de Consulta Odontológica'}
            </h1>
            <p className="mt-1 text-xs text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
              {isStaff
                ? 'Escolha o paciente, o profissional e um horário livre da agenda.'
                : 'Escolha o profissional e o melhor horário para o seu atendimento.'}
            </p>
          </div>
        </div>
      </header>

      {/* Etapas */}
      <section className="mb-6 w-full rounded-2xl border border-[#dde4e3]/60 bg-[#eef5f4] p-4 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {steps.map((s) => {
            const done = s.n < step;
            const active = s.n === step;
            return (
              <li
                key={s.n}
                className={`flex items-center gap-2.5 rounded-xl p-3 ${
                  active
                    ? 'bg-[#006a6b] text-white shadow-sm ring-2 ring-[#005051]/30 dark:bg-[#004f50]'
                    : 'border border-[#dde4e3]/60 bg-white shadow-sm dark:border-[#2d3838] dark:bg-[#202929]'
                } ${!done && !active ? 'opacity-75' : ''}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? 'bg-[#005051] text-white'
                      : active
                        ? 'bg-[#a0f0f1] text-[#002020]'
                        : 'bg-[#dde4e3] text-[#3e4949] dark:bg-[#263131] dark:text-[#bec9c8]'
                  }`}
                >
                  {done ? (
                    <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                      check
                    </span>
                  ) : (
                    s.n
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      active ? 'text-[#97e7e7]' : 'text-[#6e7979]'
                    }`}
                  >
                    {done ? 'Concluída' : active ? 'Etapa atual' : `Etapa ${s.n}`}
                  </p>
                  <p
                    className={`truncate text-xs font-bold ${
                      active ? 'text-white' : 'text-[#161d1d] dark:text-white'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Coluna de escolhas */}
        <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
          {isStaff && (
            <section className="flex flex-col gap-3 rounded-2xl border border-[#dde4e3]/60 bg-white p-5 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#161d1d] dark:text-white">
                Paciente
              </h2>
              {patient ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#eef5f4] p-4 dark:bg-[#202929]">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#161d1d] dark:text-white">
                      {patient.name}
                    </p>
                    <p className="truncate text-xs text-[#6e7979]">
                      {[patient.cpf, patient.phone].filter(Boolean).join(' • ') ||
                        'Sem CPF/telefone'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPatient(null)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-[#005051] hover:bg-[#cce8e7]/50 dark:text-[#84d4d4]"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-full border border-[#dde4e3] bg-[#eef5f4] px-4 py-2 dark:border-[#2d3838] dark:bg-[#202929]">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[20px] text-[#6e7979]"
                    >
                      search
                    </span>
                    <input
                      className="w-full border-0 bg-transparent text-xs text-[#161d1d] outline-none placeholder:text-[#6e7979] dark:text-white"
                      placeholder="Buscar paciente por nome ou CPF…"
                      value={patientQuery}
                      onChange={(e) => setPatientQuery(e.target.value)}
                      aria-label="Buscar paciente"
                    />
                  </div>
                  {patientsError && <p className="text-xs text-[#93000a]">{patientsError}</p>}
                  <ul className="flex flex-col gap-1.5">
                    {patientResults.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setPatient(p)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#eef5f4] dark:hover:bg-[#202929]"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-[#161d1d] dark:text-white">
                              {p.name}
                            </span>
                            <span className="block truncate text-[11px] text-[#6e7979]">
                              {[p.cpf, p.phone].filter(Boolean).join(' • ') || p.email || '—'}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className="material-symbols-outlined text-[18px] text-[#6e7979]"
                          >
                            chevron_right
                          </span>
                        </button>
                      </li>
                    ))}
                    {patientResults.length === 0 && !patientsError && (
                      <li className="px-3 py-2 text-xs text-[#6e7979]">
                        Nenhum paciente encontrado.
                      </li>
                    )}
                  </ul>
                </>
              )}
            </section>
          )}

          {/* Profissional */}
          <section className="flex flex-col gap-4 rounded-2xl border border-[#dde4e3]/60 bg-white p-5 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#161d1d] dark:text-white">
                Profissional
              </h2>
              {specialty && (
                <button
                  type="button"
                  onClick={() => {
                    setSpecialty(null);
                    setBookingSpecialty(null);
                  }}
                  className="text-[11px] font-bold text-[#005051] hover:underline dark:text-[#84d4d4]"
                >
                  Limpar filtro
                </button>
              )}
            </div>

            {specialties.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[null, ...specialties].map((name) => {
                  const selected =
                    name === null
                      ? !specialty
                      : Boolean(specialty) &&
                        normalizeText(name) === normalizeText(specialty ?? '');
                  return (
                    <button
                      key={name ?? 'todas'}
                      type="button"
                      onClick={() => setSpecialty(name)}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-[#005051] text-white shadow-sm'
                          : 'bg-[#dde4e3] text-[#3e4949] hover:bg-[#cce8e7] dark:bg-[#263131] dark:text-[#bec9c8]'
                      }`}
                    >
                      {name ?? 'Todas'}
                    </button>
                  );
                })}
              </div>
            )}

            {presetHasNoDoctor && (
              <p className="rounded-xl bg-[#fff0c2] p-3 text-xs text-[#6b5200]">
                Nenhum profissional de “{specialty}” atende no momento. Mostrando todos.
              </p>
            )}

            {loadingDoctors ? (
              <p className="flex items-center gap-2 text-xs text-[#6e7979]">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined animate-spin text-[18px]"
                >
                  progress_activity
                </span>
                Carregando profissionais…
              </p>
            ) : doctorsError ? (
              <div className="flex flex-col items-start gap-2 rounded-2xl bg-[#ffdad6]/60 p-4 text-xs text-[#93000a]">
                <span>{doctorsError}</span>
                <button
                  type="button"
                  onClick={() => setReloadDoctors((n) => n + 1)}
                  className="rounded-full bg-white px-3 py-1.5 font-semibold shadow-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : visibleDoctors.length === 0 ? (
              <p className="text-xs text-[#6e7979]">Nenhum profissional cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visibleDoctors.map((d) => {
                  const selected = d.id === doctorId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => pickDoctor(d.id)}
                      aria-pressed={selected}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-[#005051] bg-[#cce8e7]/50 shadow-sm ring-2 ring-[#005051]/20 dark:bg-[#324b4b]/40'
                          : 'border-[#dde4e3]/70 bg-[#eef5f4] hover:bg-[#e2eae9] dark:border-[#2d3838] dark:bg-[#202929]'
                      }`}
                    >
                      <img
                        src={d.avatar}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full object-cover shadow-sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#161d1d] dark:text-white">
                          {d.name}
                        </span>
                        <span className="block truncate text-[11px] text-[#6e7979]">{d.cro}</span>
                        <span className="mt-1 block text-[11px] font-semibold text-[#005051] dark:text-[#84d4d4]">
                          {d.specialties.join(' • ')}
                        </span>
                        <span className="mt-1 block text-[11px] text-[#3e4949] dark:text-[#bec9c8]">
                          {d.schedule}
                          {d.consultationPrice !== undefined
                            ? ` • ${formatBRL(d.consultationPrice)}`
                            : ''}
                        </span>
                      </span>
                      {selected && (
                        <span
                          aria-hidden="true"
                          className="material-symbols-outlined text-[22px] text-[#005051] dark:text-[#84d4d4]"
                        >
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tipo de atendimento */}
          <section className="flex flex-col gap-3 rounded-2xl border border-[#dde4e3]/60 bg-white p-5 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#161d1d] dark:text-white">
              Tipo de atendimento
            </h2>
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_TYPES.filter((t) => isStaff || PATIENT_TYPES.includes(t)).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`rounded-full px-4 py-2.5 text-xs font-semibold shadow-sm transition-all ${
                    type === t
                      ? 'bg-[#cce8e7] text-[#051f20] ring-1 ring-[#005051]/30 dark:bg-[#324b4b] dark:text-[#a0f0f1]'
                      : 'bg-[#eef5f4] text-[#3e4949] hover:bg-[#e2eae9] dark:bg-[#202929] dark:text-[#bec9c8]'
                  }`}
                >
                  {APPOINTMENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </section>

          {/* Data e horário */}
          <section className="flex flex-col gap-4 rounded-2xl border border-[#dde4e3]/60 bg-white p-5 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#161d1d] dark:text-white">
              Data e horário
            </h2>
            {doctor ? (
              <SlotPicker
                doctorId={doctor.id}
                value={startsAt}
                onChange={(iso, picked) => {
                  setStartsAt(iso);
                  setSlot(picked ?? null);
                }}
                refreshKey={slotRefresh}
              />
            ) : (
              <p className="rounded-2xl bg-[#eef5f4] p-4 text-xs text-[#3e4949] dark:bg-[#202929] dark:text-[#bec9c8]">
                Escolha um profissional para ver os horários disponíveis.
              </p>
            )}
          </section>
        </div>

        {/* Resumo */}
        <aside className="sticky top-20 flex flex-col gap-4 lg:col-span-5 xl:col-span-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#dde4e3]/60 bg-white p-5 shadow-md sm:p-6 dark:border-[#263131] dark:bg-[#1a2222]">
            <div className="flex items-center justify-between border-b border-[#dde4e3]/50 pb-2 dark:border-[#263131]">
              <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                Resumo do Atendimento
              </h2>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8efee] text-[#005051] dark:bg-[#202929] dark:text-[#84d4d4]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  calendar_today
                </span>
              </span>
            </div>

            <dl className="flex flex-col gap-3 rounded-xl bg-[#eef5f4] p-4 dark:bg-[#202929]">
              <SummaryRow icon="person" label="Paciente">
                {isStaff ? (patient?.name ?? 'Não escolhido') : currentUser.name}
              </SummaryRow>
              <SummaryRow icon="medical_services" label="Profissional">
                {doctor ? (
                  <>
                    {doctor.name}
                    <span className="block text-[11px] font-normal text-[#6e7979]">
                      {doctor.specialties[0]} • {doctor.cro}
                    </span>
                  </>
                ) : (
                  'Não escolhido'
                )}
              </SummaryRow>
              <SummaryRow icon="schedule" label="Data e horário">
                {startsAt ? (
                  <>
                    {formatDateTime(startsAt)}
                    {durationMinutes ? (
                      <span className="block text-[11px] font-normal text-[#6e7979]">
                        Duração prevista: {durationMinutes} minutos
                      </span>
                    ) : null}
                  </>
                ) : (
                  'Não escolhido'
                )}
              </SummaryRow>
              <SummaryRow icon="location_on" label="Local">
                {doctor?.room ?? '—'}
                {doctor?.locationAddress && (
                  <span className="block text-[11px] font-normal text-[#6e7979]">
                    {doctor.locationAddress}
                  </span>
                )}
              </SummaryRow>
            </dl>

            {/* Cobertura */}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-xs font-bold text-[#161d1d] dark:text-white">
                Forma de atendimento
              </legend>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#dde4e3] bg-white p-3 text-xs dark:border-[#2d3838] dark:bg-[#202929]">
                <input
                  type="radio"
                  name="cobertura"
                  checked={insuranceId === null}
                  onChange={() => setInsuranceId(null)}
                  className="accent-[#005051]"
                />
                <span className="flex-1 font-semibold text-[#161d1d] dark:text-white">
                  Particular
                </span>
                <span className="font-mono text-[#3e4949] dark:text-[#bec9c8]">
                  {doctor?.consultationPrice !== undefined
                    ? formatBRL(doctor.consultationPrice)
                    : '—'}
                </span>
              </label>
              {insurances.map((plan) => {
                const ok = usable(plan);
                return (
                  <label
                    key={plan.id}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
                      ok
                        ? 'cursor-pointer border-[#dde4e3] bg-white dark:border-[#2d3838] dark:bg-[#202929]'
                        : 'cursor-not-allowed border-dashed border-[#dde4e3] bg-[#f4f7f8] opacity-70 dark:border-[#2d3838] dark:bg-[#1a2222]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cobertura"
                      disabled={!ok}
                      checked={insuranceId === plan.id}
                      onChange={() => setInsuranceId(plan.id)}
                      className="accent-[#005051]"
                    />
                    <span className="flex-1">
                      <span className="block font-semibold text-[#161d1d] dark:text-white">
                        {plan.insuranceName}
                      </span>
                      <span className="block text-[11px] text-[#6e7979]">
                        Carteirinha {plan.cardNumber}
                        {!ok &&
                          ` • ${plan.status === 'SUSPENDED' ? 'suspenso' : 'vencido'} — indisponível`}
                      </span>
                    </span>
                  </label>
                );
              })}
              {insurances.length === 0 && (
                <p className="text-[11px] text-[#6e7979]">
                  {isStaff && !patient
                    ? 'Escolha o paciente para ver os convênios dele.'
                    : 'Nenhum convênio cadastrado. A recepção cadastra e valida a carteirinha no atendimento.'}
                </p>
              )}
              {selectedInsurance && (
                <p className="text-[11px] text-[#4a6363] dark:text-[#bec9c8]">
                  A cobertura do convênio é confirmada pela clínica no atendimento.
                </p>
              )}
            </fieldset>

            {/* Observações */}
            <div className="flex flex-col gap-1">
              <label
                className="flex items-center justify-between text-xs font-semibold text-[#161d1d] dark:text-white"
                htmlFor="symptoms"
              >
                <span>Observações ou sintomas (opcional)</span>
                <span className="text-[10px] font-normal text-[#6e7979]">{notes.length}/200</span>
              </label>
              <textarea
                id="symptoms"
                rows={2}
                maxLength={200}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-[#dde4e3] bg-[#eef5f4] p-3 text-xs text-[#161d1d] outline-none transition-all placeholder:text-[#6e7979] focus:ring-2 focus:ring-[#005051] dark:border-[#263131] dark:bg-[#202929] dark:text-white"
                placeholder="Ex.: sinto desconforto ao mastigar do lado direito…"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={!canConfirm}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#005051] text-xs font-bold text-white shadow-md transition-all hover:bg-[#006a6b] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                <span>{saving ? 'Salvando consulta…' : 'Confirmar agendamento'}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {saving ? 'progress_activity' : 'arrow_forward'}
                </span>
              </button>
              {!canConfirm && !saving && (
                <p className="text-center text-[11px] text-[#6e7979]">
                  {!patientReady
                    ? 'Escolha o paciente para continuar.'
                    : !doctor
                      ? 'Escolha o profissional para continuar.'
                      : 'Escolha um horário para continuar.'}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setBookingSpecialty(null);
                  addToast('Agendamento cancelado.', 'info');
                  setScreen(isStaff ? 'admin-agenda' : 'inicio-dashboard');
                }}
                className="h-10 w-full rounded-full bg-transparent text-xs font-semibold text-[#6e7979] transition-colors hover:bg-[#eef5f4] dark:hover:bg-[#202929]"
              >
                Cancelar
              </button>
            </div>

            <div className="flex items-start justify-center gap-1.5 text-center text-[11px] text-[#6e7979]">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                lock
              </span>
              <span>Cancelamento e remarcação pelo portal até 2 horas antes do horário.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ icon: string; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div className="flex items-start gap-3">
    <span
      aria-hidden="true"
      className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-[#005051] dark:text-[#84d4d4]"
    >
      {icon}
    </span>
    <div className="min-w-0">
      <dt className="text-[11px] text-[#6e7979]">{label}</dt>
      <dd className="text-xs font-bold text-[#161d1d] dark:text-white">{children}</dd>
    </div>
  </div>
);
