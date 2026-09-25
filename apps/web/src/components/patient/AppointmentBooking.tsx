import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';

export const AppointmentBooking: React.FC = () => {
  const { setScreen, addAppointment, addToast } = useApp();

  const [modality, setModality] = useState<'presencial' | 'teleorientacao'>('presencial');
  const [selectedDay, setSelectedDay] = useState<{ day: string; num: number; dateString: string }>({
    day: 'Qui',
    num: 24,
    dateString: 'Quinta-feira, 24 de Outubro de 2024',
  });
  const [selectedTime, setSelectedTime] = useState<string>('14:30');
  const [symptoms, setSymptoms] = useState('');

  const days = [
    {
      day: 'Seg',
      num: 21,
      spots: '4 vagas',
      disabled: false,
      dateString: 'Segunda-feira, 21 de Outubro de 2024',
    },
    {
      day: 'Ter',
      num: 22,
      spots: '6 vagas',
      disabled: false,
      dateString: 'Terça-feira, 22 de Outubro de 2024',
    },
    {
      day: 'Qua',
      num: 23,
      spots: '2 vagas',
      disabled: false,
      dateString: 'Quarta-feira, 23 de Outubro de 2024',
    },
    {
      day: 'Qui',
      num: 24,
      spots: '8 livres',
      disabled: false,
      dateString: 'Quinta-feira, 24 de Outubro de 2024',
    },
    {
      day: 'Sex',
      num: 25,
      spots: '5 vagas',
      disabled: false,
      dateString: 'Sexta-feira, 25 de Outubro de 2024',
    },
    {
      day: 'Sáb',
      num: 26,
      spots: 'Lotado',
      disabled: true,
      dateString: 'Sábado, 26 de Outubro de 2024',
    },
  ];

  const morningSlots = [
    { time: '08:30', available: true },
    { time: '09:15', available: false },
    { time: '10:00', available: true },
    { time: '10:45', available: true },
    { time: '11:30', available: true },
  ];

  const afternoonSlots = [
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:15', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
  ];

  const eveningSlots = [
    { time: '18:00', available: true },
    { time: '18:45', available: true },
  ];

  const handleConfirmAppointment = () => {
    addAppointment({
      date: selectedDay.dateString,
      time: selectedTime,
      doctorName: 'Dr. Marcelo Arantes',
      doctorSpecialty: 'Ortodontia & Alinhadores',
      doctorCro: 'CRO/SP 89.412',
      doctorAvatar: ASSETS.drMarcelo,
      room: 'Consultório 03 - Unidade Jardins',
      unit: 'OdontoAura Unidade Jardins',
      procedure: 'Avaliação & Manutenção Ortodôntica',
      insuranceName: 'Unimed Odonto Master Gold',
      insuranceCoverage: '100% Coberto',
      copayAmount: 0,
      notes: symptoms || 'Agendamento direto pelo portal do paciente',
    });
    setScreen('consultas');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Breadcrumb & Header Section */}
      <header className="flex flex-col gap-1 mb-6">
        <nav
          aria-label="Navegação hierárquica"
          className="flex items-center gap-1 text-xs text-[#6e7979]"
        >
          <button
            onClick={() => setScreen('inicio-dashboard')}
            className="hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors"
          >
            Início
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#161d1d] dark:text-white font-bold">Agendar Consulta</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight">
              Agendamento de Consulta Odontológica
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
              Selecione a especialidade, profissional e o melhor horário para o seu atendimento
              clínico humanizado.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#e8efee] dark:bg-[#202929] px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-pulse"></span>
            <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-semibold">
              Atendimento ativo em São Paulo / SP
            </span>
          </div>
        </div>
      </header>

      {/* M3 Horizontal Stepper */}
      <section className="w-full bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-4 mb-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 relative">
          {/* Step 1: Concluído */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-[#202929] p-3 rounded-xl shadow-sm border border-[#dde4e3]/60 dark:border-[#2d3838]">
            <div className="w-8 h-8 rounded-full bg-[#005051] dark:bg-[#004f50] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#6e7979] uppercase tracking-wider font-bold">
                Etapa 1
              </p>
              <p className="text-xs text-[#161d1d] dark:text-white font-bold truncate">
                Especialidade & Motivo
              </p>
            </div>
          </div>

          {/* Step 2: Concluído */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-[#202929] p-3 rounded-xl shadow-sm border border-[#dde4e3]/60 dark:border-[#2d3838]">
            <div className="w-8 h-8 rounded-full bg-[#005051] dark:bg-[#004f50] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#6e7979] uppercase tracking-wider font-bold">
                Etapa 2
              </p>
              <p className="text-xs text-[#161d1d] dark:text-white font-bold truncate">
                Profissional Escolhido
              </p>
            </div>
          </div>

          {/* Step 3: Ativa */}
          <div className="flex items-center gap-2.5 bg-[#006a6b] dark:bg-[#004f50] p-3 rounded-xl text-white shadow-sm ring-2 ring-[#005051]/30">
            <div className="w-8 h-8 rounded-full bg-[#a0f0f1] text-[#002020] flex items-center justify-center text-xs font-bold shrink-0">
              3
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#97e7e7] uppercase tracking-wider font-bold">
                Etapa Atual
              </p>
              <p className="text-xs text-white font-bold truncate">Data e Horário</p>
            </div>
          </div>

          {/* Step 4: Pendente */}
          <div className="flex items-center gap-2.5 bg-[#e8efee] dark:bg-[#202929] p-3 rounded-xl opacity-75">
            <div className="w-8 h-8 rounded-full bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] flex items-center justify-center text-xs font-bold shrink-0">
              4
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#6e7979] uppercase tracking-wider font-bold">
                Pendente
              </p>
              <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] truncate">
                Confirmação & Cobertura
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Selection Area (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Selected Professional & Specialty Summary Card */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={ASSETS.drMarcelo}
                  alt="Dr. Marcelo Arantes"
                  className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-[#005051]/20"
                />
                <span
                  className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a2222]"
                  title="Disponível para agenda"
                ></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] px-2.5 py-0.5 rounded-full font-bold">
                    Ortodontia & Alinhadores
                  </span>
                  <span className="flex items-center text-amber-600 dark:text-amber-400 text-xs font-bold gap-0.5">
                    <span className="material-symbols-outlined text-[15px]">star</span>
                    4.9 <span className="text-[#6e7979] font-normal">(128 avaliações)</span>
                  </span>
                </div>
                <h2 className="text-base text-[#161d1d] dark:text-white font-bold mt-1 truncate">
                  Dr. Marcelo Arantes
                </h2>
                <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
                  CRO/SP 89.412 • Unidade Jardins • Consultório 03
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                addToast(
                  'Especialista Dr. Marcelo Arantes é a referência recomendada para seu plano.',
                  'info',
                )
              }
              className="shrink-0 text-xs text-[#005051] dark:text-[#84d4d4] hover:bg-[#cce8e7]/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 font-bold self-end sm:self-center"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Alterar</span>
            </button>
          </div>

          {/* Attendance Modality Selection */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs text-[#161d1d] dark:text-white font-bold uppercase tracking-wider">
              Modalidade do Atendimento
            </h3>
            <div className="flex flex-wrap gap-3 mt-0.5">
              <button
                onClick={() => setModality('presencial')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                  modality === 'presencial'
                    ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] ring-1 ring-[#005051]/30'
                    : 'bg-white dark:bg-[#1a2222] text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                <span>Presencial na Clínica (Unidade Jardins)</span>
              </button>

              <button
                onClick={() => {
                  setModality('teleorientacao');
                  addToast(
                    'Teleorientação selecionada: link da chamada será enviado por SMS e e-mail.',
                    'info',
                  );
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                  modality === 'teleorientacao'
                    ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] ring-1 ring-[#005051]/30'
                    : 'bg-white dark:bg-[#1a2222] text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4]'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">videocam</span>
                <span>Teleorientação / Pré-avaliação Online</span>
              </button>
            </div>
          </div>

          {/* Weekly / Monthly Date Carousel */}
          <div className="bg-white dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col gap-4 border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#005051] dark:text-[#84d4d4] font-bold uppercase tracking-wider">
                  Mês Vigente
                </span>
                <h3 className="text-base font-bold text-[#161d1d] dark:text-white">
                  Outubro / Novembro 2024
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label="Semana anterior"
                  onClick={() => addToast('Semana anterior: 14 a 19 de Outubro.', 'info')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#6e7979] hover:bg-[#eef5f4] dark:hover:bg-[#202929] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  aria-label="Próxima semana"
                  onClick={() =>
                    addToast('Próxima semana: 28 de Outubro a 02 de Novembro.', 'info')
                  }
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#6e7979] hover:bg-[#eef5f4] dark:hover:bg-[#202929] transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Days Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {days.map((d) => {
                const isSelected = selectedDay.num === d.num;
                return (
                  <button
                    key={d.num}
                    type="button"
                    disabled={d.disabled}
                    onClick={() => {
                      if (!d.disabled) {
                        setSelectedDay({ day: d.day, num: d.num, dateString: d.dateString });
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-[#005051] text-white shadow-md scale-105'
                        : d.disabled
                          ? 'bg-[#eef5f4] dark:bg-[#202929] opacity-50 cursor-not-allowed text-[#6e7979]'
                          : 'bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#e2eae9] text-[#161d1d] dark:text-[#e1e8e7]'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-[#6e7979]'}`}
                    >
                      {d.day}
                    </span>
                    <span className="text-xl font-bold my-0.5">{d.num}</span>
                    <span
                      className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-[#006a6b] text-[#97e7e7]'
                          : d.disabled
                            ? 'text-[#6e7979]'
                            : 'text-[#005051] dark:text-[#84d4d4]'
                      }`}
                    >
                      {d.spots}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Grid Separated by Shift */}
          <div className="bg-white dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col gap-5 border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-bold text-[#161d1d] dark:text-white">
                  Horários Disponíveis em {selectedDay.num} de Outubro
                </h3>
                <p className="text-xs text-[#6e7979]">
                  Selecione o melhor período do dia para sua consulta.
                </p>
              </div>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-[#6e7979]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dde4e3] dark:bg-[#263131]"></span>
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005051] dark:bg-[#84d4d4]"></span>
                  <span className="font-bold text-[#005051] dark:text-[#84d4d4]">Selecionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#bec9c8] opacity-50"></span>
                  <span>Ocupado</span>
                </div>
              </div>
            </div>

            {/* Morning Shift */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
                <span className="material-symbols-outlined text-[18px] text-amber-600">
                  wb_sunny
                </span>
                <span>Turno da Manhã (08h às 12h)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {morningSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#005051] text-white shadow-sm ring-2 ring-[#005051]/20'
                          : !slot.available
                            ? 'bg-[#dde4e3] dark:bg-[#202929] text-[#6e7979] line-through cursor-not-allowed'
                            : 'bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white hover:bg-[#cce8e7]'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Afternoon Shift */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
                <span className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]">
                  sunny
                </span>
                <span>Turno da Tarde (13h às 18h)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {afternoonSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#005051] text-white shadow-sm ring-2 ring-[#005051]/20 flex items-center gap-1.5'
                          : !slot.available
                            ? 'bg-[#dde4e3] dark:bg-[#202929] text-[#6e7979] line-through cursor-not-allowed'
                            : 'bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white hover:bg-[#cce8e7]'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      )}
                      <span>{slot.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evening Shift */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
                <span className="material-symbols-outlined text-[18px] text-[#334863]">
                  nights_stay
                </span>
                <span>Turno da Noite (18h às 20h)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {eveningSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#005051] text-white shadow-sm ring-2 ring-[#005051]/20 flex items-center gap-1.5'
                          : 'bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white hover:bg-[#cce8e7]'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      )}
                      <span>{slot.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Appointment Summary & Insurance Verification (Sticky) */}
        <aside className="lg:col-span-5 xl:col-span-4 sticky top-20 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#1a2222] rounded-2xl p-5 sm:p-6 shadow-md flex flex-col gap-4 border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between pb-1 border-b border-[#dde4e3]/50 dark:border-[#263131]">
              <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                Resumo do Atendimento
              </h2>
              <span className="w-8 h-8 rounded-full bg-[#e8efee] dark:bg-[#202929] flex items-center justify-center text-[#005051] dark:text-[#84d4d4]">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </span>
            </div>

            {/* Clinic & Details Spec */}
            <div className="flex flex-col gap-3 bg-[#eef5f4] dark:bg-[#202929] p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5 shrink-0">
                  medical_services
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6e7979]">Procedimento</p>
                  <p className="text-xs font-bold text-[#161d1d] dark:text-white">
                    Avaliação & Manutenção Ortodôntica
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5 shrink-0">
                  schedule
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6e7979]">Data e Horário</p>
                  <p className="text-xs font-bold text-[#161d1d] dark:text-white">
                    {selectedDay.day}, {selectedDay.num} de Outubro às {selectedTime}
                  </p>
                  <p className="text-[11px] text-[#6e7979]">Duração prevista: 45 minutos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5 shrink-0">
                  location_on
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6e7979]">Local do Atendimento</p>
                  <p className="text-xs font-bold text-[#161d1d] dark:text-white">
                    OdontoAura Unidade Jardins
                  </p>
                  <p className="text-[11px] text-[#6e7979]">
                    Av. Paulista, 1578 • 4º andar • Consultório 03
                  </p>
                </div>
              </div>
            </div>

            {/* Insurance Verification Card */}
            <div className="bg-[#cce8e7]/50 dark:bg-[#324b4b]/40 p-4 rounded-xl flex flex-col gap-1.5 border border-[#cce8e7] dark:border-[#324b4b]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[22px]">
                    verified_user
                  </span>
                  <span className="text-xs font-bold text-[#051f20] dark:text-[#a0f0f1]">
                    Unimed Odonto
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Plano Elegível
                </span>
              </div>
              <p className="text-[11px] text-[#4a6363] dark:text-[#bec9c8]">
                Plano Master Gold • Cartão nº **** 8820
              </p>
              <p className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                Carência cumprida com 100% de cobertura para a consulta.
              </p>
              <div className="mt-1 pt-2 border-t border-[#cce8e7]/80 dark:border-[#324b4b] flex items-center justify-between text-xs">
                <span className="text-[#4a6363] dark:text-[#bec9c8]">Valor particular padrão:</span>
                <span className="text-[#6e7979] line-through font-mono">R$ 220,00</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#161d1d] dark:text-white">Coparticipação estimada:</span>
                <span className="text-[#005051] dark:text-[#84d4d4] font-extrabold text-sm font-mono">
                  R$ 0,00
                </span>
              </div>
            </div>

            {/* Optional Symptoms Note */}
            <div className="flex flex-col gap-1">
              <label
                className="text-xs text-[#161d1d] dark:text-white font-semibold flex items-center justify-between"
                htmlFor="symptoms"
              >
                <span>Observações ou sintomas (opcional)</span>
                <span className="text-[10px] text-[#6e7979]">Máx 200 carac.</span>
              </label>
              <textarea
                id="symptoms"
                rows={2}
                maxLength={200}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full rounded-xl bg-[#eef5f4] dark:bg-[#202929] p-3 text-xs text-[#161d1d] dark:text-white placeholder:text-[#6e7979] border border-[#dde4e3] dark:border-[#263131] focus:ring-2 focus:ring-[#005051] outline-none transition-all resize-none"
                placeholder="Ex: sinto ligeiro desconforto na arcada superior direita após troca de elástico..."
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmAppointment}
                className="w-full h-12 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Avançar para Confirmação</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('inicio-dashboard')}
                className="w-full h-10 rounded-full bg-transparent hover:bg-[#eef5f4] dark:hover:bg-[#202929] text-[#6e7979] text-xs font-semibold transition-colors"
              >
                Voltar à etapa anterior
              </button>
            </div>

            {/* Micro Assurance Info */}
            <div className="flex items-center justify-center gap-1.5 text-[#6e7979] text-[11px] text-center">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Cancelamento gratuito até 24h antes do horário.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
