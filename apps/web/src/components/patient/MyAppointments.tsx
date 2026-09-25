import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const MyAppointments: React.FC = () => {
  const {
    appointments,
    setScreen,
    cancelAppointment,
    setShowRayXModal,
    setShowPreConsultationModal,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'proximas' | 'historico' | 'canceladas'>('proximas');
  const [filterQuery, setFilterQuery] = useState('');
  const [checklist, setChecklist] = useState({
    brushing: true,
    card: true,
    elastics: false,
  });

  const nextAppointments = appointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'agendado',
  );
  const finishedAppointments = appointments.filter((a) => a.status === 'finalizado');
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelado');

  const handleToggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmergencyCall = () => {
    addToast(
      'Chamando plantão 24h: 0800 790 2000 (Linha direta de urgência odontológica).',
      'info',
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto w-full">
      {/* Top Breadcrumbs & Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <nav className="flex items-center gap-1.5 text-xs text-[#6e7979]">
            <button
              onClick={() => setScreen('inicio-dashboard')}
              className="hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Início</span>
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#005051] dark:text-[#84d4d4] font-bold">Minhas Consultas</span>
          </nav>
          <div className="mt-1">
            <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white tracking-tight font-bold">
              Minhas Consultas
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1 max-w-2xl leading-relaxed">
              Gerencie seus horários agendados, histórico clínico e comprovantes de atendimento de
              forma simplificada e integrada à sua saúde bucal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setScreen('agendar')}
            className="group h-11 px-5 rounded-full bg-[#005051] text-white text-xs font-bold shadow-sm hover:shadow-md hover:bg-[#006a6b] transition-all flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">
              add
            </span>
            <span>Nova Consulta</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Inline Filter Area */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#eef5f4] dark:bg-[#1a2222] p-2 rounded-2xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
        {/* M3 Pill Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 scrollbar-none" role="tablist">
          <button
            onClick={() => setActiveTab('proximas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'proximas'
                ? 'bg-[#005051] text-white shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929]'
            }`}
            role="tab"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">event_upcoming</span>
            <span>Próximas Consultas</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                activeTab === 'proximas'
                  ? 'bg-[#a0f0f1] text-[#002020]'
                  : 'bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8]'
              }`}
            >
              {nextAppointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'historico'
                ? 'bg-[#005051] text-white shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929]'
            }`}
            role="tab"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Histórico Realizado</span>
            <span className="px-2 py-0.5 rounded-full bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] text-[10px] font-bold ml-0.5">
              14
            </span>
          </button>

          <button
            onClick={() => setActiveTab('canceladas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'canceladas'
                ? 'bg-[#005051] text-white shadow-sm'
                : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#202929]'
            }`}
            role="tab"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">event_busy</span>
            <span>Canceladas</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold ml-0.5">
              {cancelledAppointments.length}
            </span>
          </button>
        </div>

        {/* Search & Period Filters */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center gap-2 bg-white dark:bg-[#202929] px-3 py-1.5 rounded-full shadow-sm w-full sm:w-64 border border-[#dde4e3] dark:border-[#2d3838]">
            <span className="material-symbols-outlined text-[#6e7979] text-[18px]">search</span>
            <input
              className="bg-transparent border-0 outline-none w-full text-xs text-[#161d1d] dark:text-white placeholder:text-[#6e7979]"
              placeholder="Filtrar especialista..."
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => addToast('Filtrando por: Outubro / Novembro 2024.', 'info')}
            className="h-9 px-3 rounded-full bg-white dark:bg-[#202929] text-[#3e4949] dark:text-[#bec9c8] text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_view_day</span>
            <span>Todos os meses</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Priority Appointments + Emergency Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Column: Scheduled Appointments (Cols 1-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-pulse"></span>
              <span className="text-xs font-bold text-[#161d1d] dark:text-white uppercase tracking-wider">
                Compromissos Agendados
              </span>
            </div>
            <span className="text-xs text-[#6e7979]">Sincronizado há 5 min</span>
          </div>

          {activeTab === 'proximas' && (
            <div className="flex flex-col gap-4">
              {nextAppointments
                .filter((apt) =>
                  apt.doctorName.toLowerCase().includes(filterQuery.trim().toLowerCase()),
                )
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-[#dde4e3]/60 dark:border-[#263131]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold">
                        <span className="material-symbols-outlined text-[16px]">
                          event_available
                        </span>
                        {apt.status === 'confirmado' ? 'Confirmada' : 'Agendada'}
                      </span>
                      <span className="text-xs text-[#6e7979]">Protocolo: {apt.id}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                      <div>
                        <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                          {apt.date} às {apt.time}
                        </h2>
                        <p className="text-xs text-[#6e7979] mt-1">{apt.procedure}</p>
                        <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] mt-1">
                          {apt.durationMinutes} min •{' '}
                          {apt.modality === 'teleorientacao' ? 'Teleorientação' : apt.room}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={apt.doctorAvatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover shadow-sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#161d1d] dark:text-white">
                            {apt.doctorName}
                          </p>
                          <p className="text-[11px] text-[#6e7979]">{apt.doctorSpecialty}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] pb-4">
                      {apt.insuranceName} • {apt.insuranceCoverage}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#dde4e3] dark:border-[#263131]">
                      <span className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
                        {apt.modality === 'teleorientacao' ? 'Atendimento remoto' : apt.unit}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => addToast(apt.notes || apt.procedure, 'info')}
                          className="h-9 px-3 rounded-full text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#eef5f4] dark:hover:bg-[#202929] text-xs font-semibold"
                          type="button"
                        >
                          Detalhes da Consulta
                        </button>
                        <button
                          onClick={() => setShowPreConsultationModal(true)}
                          className="h-9 px-3 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-semibold"
                          type="button"
                        >
                          Orientações Pré-consulta
                        </button>
                        <button
                          onClick={() => setScreen('agendar')}
                          className="h-9 px-3 rounded-full bg-[#eef5f4] dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] text-xs font-semibold"
                          type="button"
                        >
                          Reagendar
                        </button>
                        <button
                          onClick={() => cancelAppointment(apt.id)}
                          className="h-9 px-3 rounded-full text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs font-semibold"
                          type="button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {nextAppointments.length === 0 && (
                <p className="text-sm text-[#6e7979]">Nenhuma consulta agendada.</p>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="flex flex-col gap-4">
              {finishedAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white dark:bg-[#1a2222] rounded-2xl p-4 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#eef5f4] dark:bg-[#202929] flex items-center justify-center text-[#005051] dark:text-[#84d4d4]">
                      <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#161d1d] dark:text-white">
                          {apt.procedure}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#B2F1B8] text-[#002107] text-[10px] font-bold">
                          Finalizado
                        </span>
                      </div>
                      <p className="text-xs text-[#6e7979] mt-0.5">
                        {apt.doctorName} • {apt.date} às {apt.time} • {apt.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRayXModal(true)}
                      className="h-8 px-3 rounded-full bg-[#eef5f4] dark:bg-[#202929] text-xs font-semibold text-[#005051] dark:text-[#84d4d4]"
                    >
                      Ver Raio-X & Laudo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'canceladas' && (
            <div className="bg-white dark:bg-[#1a2222] rounded-2xl p-8 text-center border border-[#dde4e3]/60 dark:border-[#263131]">
              <span className="material-symbols-outlined text-[#ba1a1a] text-4xl mb-2">
                event_busy
              </span>
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white">
                {cancelledAppointments.length > 0
                  ? 'Consultas Canceladas'
                  : 'Nenhuma Consulta Cancelada'}
              </h3>
              <p className="text-xs text-[#6e7979] mt-1 max-w-sm mx-auto">
                {cancelledAppointments.length > 0
                  ? 'Você cancelou 1 agendamento. Você pode reagendar a qualquer momento sem cobrança extra.'
                  : 'Você não possui nenhum horário cancelado no período atual.'}
              </p>
              {cancelledAppointments.length > 0 && (
                <button
                  onClick={() => setScreen('agendar')}
                  className="mt-4 h-9 px-5 rounded-full bg-[#005051] text-white text-xs font-bold"
                >
                  Novo Agendamento
                </button>
              )}
            </div>
          )}
        </div>

        {/* Secondary Column: Emergency Banner & Oral Care Progress (Cols 9-12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Emergency Dental Support Card */}
          <div className="bg-gradient-to-br from-[#334863] to-[#4b607c] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">e911_emergency</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#c5dbfb]">
                  Plantão 24 Horas
                </span>
                <span className="text-base font-bold text-white">Urgência Odontológica</span>
              </div>
            </div>
            <p className="text-xs text-white/90 mb-4 leading-relaxed">
              Dor aguda, trauma ou dente quebrado? Nossa equipe de emergência está disponível em
              regime ininterrupto com suporte dedicado.
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-4 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c5dbfb] text-[20px]">call</span>
                <span className="text-sm font-bold text-white font-mono">0800 790 2000</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold uppercase">
                24/7
              </span>
            </div>
            <button
              onClick={handleEmergencyCall}
              className="w-full h-11 rounded-full bg-[#a0f0f1] text-[#002020] text-xs font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <span>Falar com Atendente Agora</span>
            </button>
          </div>

          {/* Oral Health Progress Snapshot Widget */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[22px]">
                  health_metrics
                </span>
                <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                  Seu Plano de Cuidado
                </span>
              </div>
              <span className="text-xs font-bold text-[#005051] dark:text-[#84d4d4]">
                Fase 2 de 4
              </span>
            </div>

            {/* Progress Ring & Details */}
            <div className="flex items-center gap-4 mb-4">
              {/* Inline SVG Circle Metric */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#dde4e3] dark:text-[#263131]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-[#005051] dark:text-[#84d4d4]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="68, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white leading-none">
                    68%
                  </span>
                  <span className="text-[9px] text-[#6e7979] font-semibold mt-0.5">
                    alinhamento
                  </span>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#161d1d] dark:text-white">
                  Aparelho Estético Autoligado
                </span>
                <p className="text-xs text-[#6e7979] mt-0.5 leading-tight">
                  Próxima etapa: Ajuste de torque dos incisivos superiores.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#202929] rounded-2xl flex items-center justify-between text-[#3e4949] dark:text-[#bec9c8] text-xs shadow-sm border border-[#dde4e3]/60 dark:border-[#2d3838]">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[18px]">
                  photo_camera_front
                </span>
                <span>Scanner 3D Intraoral</span>
              </span>
              <span className="text-[#005051] dark:text-[#84d4d4] font-bold text-[11px]">
                Atualizado há 1 mês
              </span>
            </div>
          </div>

          {/* Clinic Preparation Checklist */}
          <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <h3 className="text-sm font-bold text-[#161d1d] dark:text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4a6363] dark:text-[#84d4d4] text-[20px]">
                checklist
              </span>
              <span>Checklist para Quinta-Feira</span>
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li
                onClick={() => handleToggleChecklist('brushing')}
                className="flex items-start gap-2.5 cursor-pointer select-none"
              >
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    checklist.brushing ? 'text-[#005051] dark:text-[#84d4d4]' : 'text-[#6e7979]'
                  }`}
                >
                  {checklist.brushing ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span
                  className={`text-xs ${checklist.brushing ? 'text-[#161d1d] dark:text-white' : 'text-[#6e7979]'}`}
                >
                  Higienizar dentes com escovação completa e fio dental
                </span>
              </li>

              <li
                onClick={() => handleToggleChecklist('card')}
                className="flex items-start gap-2.5 cursor-pointer select-none"
              >
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    checklist.card ? 'text-[#005051] dark:text-[#84d4d4]' : 'text-[#6e7979]'
                  }`}
                >
                  {checklist.card ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span
                  className={`text-xs ${checklist.card ? 'text-[#161d1d] dark:text-white' : 'text-[#6e7979]'}`}
                >
                  Apresentar carteirinha digital do convênio no app
                </span>
              </li>

              <li
                onClick={() => handleToggleChecklist('elastics')}
                className="flex items-start gap-2.5 cursor-pointer select-none"
              >
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    checklist.elastics ? 'text-[#005051] dark:text-[#84d4d4]' : 'text-[#6e7979]'
                  }`}
                >
                  {checklist.elastics ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span
                  className={`text-xs ${checklist.elastics ? 'text-[#161d1d] dark:text-white' : 'text-[#6e7979]'}`}
                >
                  Trazer elásticos intermaxilares atuais para reposição
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section: Últimos Atendimentos Realizados (Histórico Recente) */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#161d1d] dark:text-white">
              Últimos Atendimentos Realizados
            </h2>
            <p className="text-xs text-[#6e7979]">
              Acesse laudos, receitas médicas e exames de imagem dos procedimentos anteriores.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('historico')}
            className="text-[#005051] dark:text-[#84d4d4] text-xs font-bold flex items-center gap-1 hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            <span>Ver histórico completo (14)</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* History Cards Container */}
        <div className="flex flex-col gap-3">
          {/* History Item 1 */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] hover:bg-[#e8efee] transition-colors rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-start md:items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#202929] flex flex-col items-center justify-center flex-shrink-0 shadow-sm text-[#161d1d] dark:text-white">
                <span className="text-[10px] font-bold leading-none uppercase text-[#6e7979]">
                  SET
                </span>
                <span className="text-lg font-bold leading-none mt-1">12</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                    Profilaxia e Remoção de Placa Bacteriana
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B2F1B8] text-[#002107] text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Finalizado
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#6e7979] text-xs mt-0.5 truncate">
                  <span>Dra. Helena Gusmão</span>
                  <span>•</span>
                  <span>Odontopediatria & Profilaxia</span>
                  <span>•</span>
                  <span>Unidade Jardins</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() =>
                  addToast(
                    'Laudo da Profilaxia emitido em 12/Set/2024: Procedimento sem intercorrências.',
                    'info',
                  )
                }
                className="h-9 px-3 rounded-full bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white hover:text-[#005051] text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]">
                  description
                </span>
                <span>Ver Laudo</span>
              </button>
              <button
                onClick={() =>
                  addToast('Atestado de comparecimento baixado em formato PDF assinado.', 'success')
                }
                className="h-9 px-3 rounded-full bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white hover:text-[#005051] text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-[#4a6363] dark:text-[#84d4d4]">
                  download
                </span>
                <span>Atestado</span>
              </button>
              <button
                onClick={() => setScreen('agendar')}
                className="h-9 px-3.5 rounded-full bg-[#005051] text-white text-xs font-semibold hover:bg-[#006a6b] transition-colors flex items-center gap-1 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Agendar Retorno</span>
              </button>
            </div>
          </div>

          {/* History Item 2 */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] hover:bg-[#e8efee] transition-colors rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-start md:items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#202929] flex flex-col items-center justify-center flex-shrink-0 shadow-sm text-[#161d1d] dark:text-white">
                <span className="text-[10px] font-bold leading-none uppercase text-[#6e7979]">
                  AGO
                </span>
                <span className="text-lg font-bold leading-none mt-1">15</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                    Radiografia Panorâmica Digital & Telemetria
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B2F1B8] text-[#002107] text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Finalizado
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#6e7979] text-xs mt-0.5 truncate">
                  <span>Centro Radiológico OdontoAura</span>
                  <span>•</span>
                  <span>Diagnóstico por Imagem</span>
                  <span>•</span>
                  <span>Equipamento Cone Beam 3D</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setShowRayXModal(true)}
                className="h-9 px-3.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold hover:bg-[#b1cccb] transition-colors flex items-center gap-1.5 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">radiology</span>
                <span>Ver Raio-X Digital (2 imagens)</span>
              </button>
              <button
                onClick={() => addToast('Recibo com autenticação digital exportado.', 'success')}
                className="h-9 px-3 rounded-full bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white hover:text-[#005051] text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>Recibo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
