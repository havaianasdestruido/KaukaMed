import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';

export const PatientDashboard: React.FC = () => {
  const { currentUser, setScreen, setShowRayXModal, setShowPreConsultationModal, addToast } =
    useApp();

  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('Todos os Cuidados');
  const [specialtySearch, setSpecialtySearch] = useState('');

  const specialties = [
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

  const filteredSpecialties = specialties.filter((s) => {
    const matchesCategory =
      activeSpecialtyFilter === 'Todos os Cuidados' || s.category === activeSpecialtyFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(specialtySearch.toLowerCase()) ||
      s.desc.toLowerCase().includes(specialtySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCalendar = () => {
    addToast('Evento adicionado ao seu Google Agenda e sincronizado com o smartphone.', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16">
      {/* 1. Header de Boas-vindas Tonal */}
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#eef5f4] dark:bg-[#1a2222] rounded-[28px] p-6 sm:p-8 shadow-sm overflow-hidden border border-[#dde4e3]/60 dark:border-[#263131]">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#cce8e7]/40 dark:bg-[#004f50]/20 blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-[0_2px_8px_rgba(0,40,40,0.12)] ring-4 ring-white dark:ring-[#202929]"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#005051] dark:bg-[#84d4d4] ring-4 ring-[#eef5f4] dark:ring-[#1a2222]"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#161d1d] dark:text-white tracking-tight">
                Olá, {currentUser.name}
              </h1>
              <span className="text-2xl animate-pulse">👋</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1 flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]">
                verified
              </span>
              Sua saúde bucal está em dia. Próxima consulta em 3 dias.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={() => setScreen('prontuario')}
            className="h-10 px-5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">medical_information</span>
            <span>Ver Meu Prontuário</span>
          </button>
          <button
            onClick={() =>
              addToast('Prontuário criptografado com chave de segurança ICP-Brasil.', 'info')
            }
            aria-label="Opções Rápidas"
            className="w-10 h-10 rounded-full bg-white dark:bg-[#202929] text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] dark:hover:text-white flex items-center justify-center shadow-sm hover:shadow transition-all border border-[#dde4e3]/60 dark:border-[#263131]"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </header>

      {/* 2. Hero Card: Próximo Agendamento */}
      <section className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-[28px] p-6 sm:p-8 shadow-md overflow-hidden border border-[#dde4e3]/60 dark:border-[#263131]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006a6b] dark:bg-[#004f50] text-white font-medium text-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#a0f0f1] animate-ping"></span>
              Próximo Agendamento
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#002020] dark:text-[#a0f0f1] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005051] dark:bg-[#84d4d4]"></span>
              Confirmado
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#3e4949] dark:text-[#bec9c8] text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px]">domain</span>
            <span>Consultório 03 - Unidade Jardins</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#6e7979] font-bold">
              Data & Horário
            </span>
            <div className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold flex items-center gap-3">
              <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[32px] sm:text-[36px]">
                calendar_today
              </span>
              <span>Quinta-feira, 24 de Outubro</span>
            </div>
            <p className="text-lg text-[#005051] dark:text-[#84d4d4] font-semibold pl-10 sm:pl-11">
              às 14:30{' '}
              <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-normal">
                (Duração estimada: 45 min)
              </span>
            </p>

            <div className="mt-4 pt-4 flex items-center gap-4 border-t border-[#dde4e3]/60 dark:border-[#263131]">
              <div className="w-14 h-14 rounded-2xl bg-[#dde4e3] dark:bg-[#202929] flex items-center justify-center text-[#005051] dark:text-[#84d4d4] overflow-hidden shadow-inner flex-shrink-0">
                <img
                  src={ASSETS.drMarcelo}
                  alt="Dr. Marcelo Arantes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#161d1d] dark:text-white leading-tight">
                  Dr. Marcelo Arantes
                </h2>
                <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
                  Ortodontia & Estética Facial • CRO/SP 89.412
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-[#005051] dark:text-[#84d4d4] font-bold mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                  4.9 (148 avaliações)
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-2.5 justify-center bg-white/80 dark:bg-[#202929]/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-[#dde4e3]/80 dark:border-[#2d3838]">
            <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold mb-1">
              Ações Rápidas do Agendamento
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setScreen('agendar')}
                className="h-10 px-4 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-semibold hover:bg-[#b1cccb] transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                <span>Reagendar Consulta</span>
              </button>

              <button
                onClick={() => setShowPreConsultationModal(true)}
                className="h-10 px-4 rounded-full bg-[#e8efee] dark:bg-[#263131] text-[#005051] dark:text-[#84d4d4] text-xs font-semibold hover:bg-[#dde4e3] transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>Ver Orientações Pré-consulta</span>
              </button>

              <button
                onClick={handleAddToCalendar}
                className="h-10 px-4 rounded-full text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e8efee] dark:hover:bg-[#263131] text-xs font-medium transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">event</span>
                <span>Adicionar ao Google Agenda</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grid de Ações Rápidas M3 */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#161d1d] dark:text-white tracking-tight">
            Ações Rápidas
          </h2>
          <span className="text-xs text-[#6e7979]">Acesso frequente</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agendar Consulta (FAB Proeminente) */}
          <button
            onClick={() => setScreen('agendar')}
            className="group relative flex flex-col justify-between p-6 rounded-[24px] bg-[#005051] text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden min-h-[170px] text-left"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none group-hover:scale-125 transition-transform duration-300"></div>
            <div className="flex items-center justify-between z-10 w-full">
              <div className="w-12 h-12 rounded-full bg-[#a0f0f1] text-[#002020] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[24px]">add_task</span>
              </div>
              <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold">
                Prioritário
              </span>
            </div>
            <div className="z-10 mt-4">
              <h3 className="text-base font-bold text-white">Agendar Consulta</h3>
              <p className="text-xs text-[#97e7e7] mt-1">Marque horário com especialistas</p>
            </div>
          </button>

          {/* Minhas Consultas */}
          <button
            onClick={() => setScreen('consultas')}
            className="group relative flex flex-col justify-between p-6 rounded-[24px] bg-white dark:bg-[#1a2222] text-[#161d1d] dark:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[170px] text-left border border-[#dde4e3]/60 dark:border-[#263131]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-12 h-12 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
              <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#002020] dark:text-[#a0f0f1] text-[11px] font-bold">
                2 ativas
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white group-hover:text-[#005051] dark:group-hover:text-[#84d4d4] transition-colors">
                Minhas Consultas
              </h3>
              <p className="text-xs text-[#6e7979] mt-1">Próximos passos e histórico</p>
            </div>
          </button>

          {/* Prontuário & Exames */}
          <button
            onClick={() => setScreen('prontuario')}
            className="group relative flex flex-col justify-between p-6 rounded-[24px] bg-white dark:bg-[#1a2222] text-[#161d1d] dark:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[170px] text-left border border-[#dde4e3]/60 dark:border-[#263131]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-12 h-12 rounded-full bg-[#d2e4ff] dark:bg-[#1e293b] text-[#005051] dark:text-[#84d4d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
              </div>
              <span className="material-symbols-outlined text-[#6e7979] text-[20px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white group-hover:text-[#005051] dark:group-hover:text-[#84d4d4] transition-colors">
                Prontuário & Exames
              </h3>
              <p className="text-xs text-[#6e7979] mt-1">Odontograma, raios-x e laudos</p>
            </div>
          </button>

          {/* Meu Convênio */}
          <button
            onClick={() => setScreen('convenio')}
            className="group relative flex flex-col justify-between p-6 rounded-[24px] bg-white dark:bg-[#1a2222] text-[#161d1d] dark:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[170px] text-left border border-[#dde4e3]/60 dark:border-[#263131]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-12 h-12 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#005051] dark:text-[#84d4d4] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005051] dark:bg-[#84d4d4]"></span>
                Ativo
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white group-hover:text-[#005051] dark:group-hover:text-[#84d4d4] transition-colors">
                Meu Convênio
              </h3>
              <p className="text-xs text-[#6e7979] mt-1">Validação e rede de cobertura</p>
            </div>
          </button>
        </div>
      </section>

      {/* 4. Seção Especialidades Odontológicas */}
      <section className="flex flex-col gap-6 bg-[#eef5f4] dark:bg-[#1a2222] rounded-[28px] p-6 sm:p-8 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#161d1d] dark:text-white tracking-tight">
              Especialidades Odontológicas
            </h2>
            <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-0.5">
              Conheça os tratamentos disponíveis na nossa rede credenciada
            </p>
          </div>

          {/* Barra de Busca M3 Pill */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#202929] px-4 py-2 rounded-full shadow-sm w-full md:w-80 border border-[#dde4e3] dark:border-[#2d3838]">
            <span className="material-symbols-outlined text-[#6e7979] text-[20px]">search</span>
            <input
              className="bg-transparent border-0 outline-none w-full text-xs text-[#161d1d] dark:text-white placeholder:text-[#6e7979]"
              placeholder="Buscar clareamento, implante, profilaxia..."
              type="search"
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
            />
          </div>
        </div>

        {/* Chips de Filtro Rápido */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            'Todos os Cuidados',
            'Estética Dental',
            'Cirurgias & Implantes',
            'Aparelhos & Alinhadores',
            'Saúde Infantil',
          ].map((chip) => {
            const isSelected = activeSpecialtyFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => setActiveSpecialtyFilter(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#005051] text-white shadow-sm'
                    : 'bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#cce8e7]'
                }`}
                type="button"
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Grid de Cards de Especialidades */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredSpecialties.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setScreen('agendar');
                addToast(`Especialidade ${item.title} selecionada para agendamento!`, 'info');
              }}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-white dark:bg-[#202929] hover:bg-[#cce8e7]/30 dark:hover:bg-[#2d3838] transition-all shadow-sm group cursor-pointer border border-[#dde4e3]/60 dark:border-[#263131]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
              </div>
              <span className="text-sm font-bold text-[#161d1d] dark:text-white leading-tight">
                {item.title}
              </span>
              <span className="text-[11px] text-[#6e7979] mt-1">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Linha do Tempo & Histórico Recente */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#161d1d] dark:text-white tracking-tight">
              Histórico e Linha do Tempo
            </h2>
            <span className="text-xs text-[#6e7979]">Recentes</span>
          </div>
          <button
            onClick={() => setScreen('consultas')}
            className="text-xs text-[#005051] dark:text-[#84d4d4] hover:underline flex items-center gap-1 font-bold"
          >
            <span>Ver todo o histórico</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Item 1: Agendado */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a2222] hover:bg-[#eef5f4] dark:hover:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1] shrink-0">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                    Manutenção de Alinhador Ortodôntico
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FFDDB9] text-[#2D1600] text-[11px] font-bold">
                    Agendado
                  </span>
                </div>
                <p className="text-xs text-[#6e7979] mt-0.5">
                  Dr. Marcelo Arantes • 24 Out 2024 às 14:30 • Unidade Jardins
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setScreen('consultas')}
                className="h-9 px-3 rounded-full bg-[#eef5f4] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] text-xs font-semibold transition-colors"
                type="button"
              >
                Detalhes
              </button>
              <span className="material-symbols-outlined text-[#bec9c8] text-[20px]">
                more_horiz
              </span>
            </div>
          </div>

          {/* Item 2: Finalizado Profilaxia */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a2222] hover:bg-[#eef5f4] dark:hover:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1] shrink-0">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                    Profilaxia & Remoção de Placa Bacteriana
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#B2F1B8] text-[#002107] text-[11px] font-bold">
                    Finalizado
                  </span>
                </div>
                <p className="text-xs text-[#6e7979] mt-0.5">
                  Dra. Helena Gusmão • 12 Set 2024 às 10:00 • Laudo e fotos anexados
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() =>
                  addToast(
                    'Laudo Clínico: Profilaxia realizada sem sangramento gengival ativo. Índice de placa reduzido.',
                    'info',
                  )
                }
                className="h-9 px-3 rounded-full bg-[#eef5f4] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] hover:text-[#161d1d] text-xs font-semibold transition-colors flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>Ver Laudo</span>
              </button>
              <span className="material-symbols-outlined text-[#bec9c8] text-[20px]">
                more_horiz
              </span>
            </div>
          </div>

          {/* Item 3: Finalizado Raio-X */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1a2222] hover:bg-[#eef5f4] dark:hover:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1] shrink-0">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                    Radiografia Panorâmica Digital
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#B2F1B8] text-[#002107] text-[11px] font-bold">
                    Finalizado
                  </span>
                </div>
                <p className="text-xs text-[#6e7979] mt-0.5">
                  Centro Radiológico Aura • 15 Ago 2024 às 16:15 • 2 imagens disponíveis
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setShowRayXModal(true)}
                className="h-9 px-3 rounded-full bg-[#eef5f4] dark:bg-[#263131] text-[#005051] dark:text-[#84d4d4] hover:bg-[#cce8e7] text-xs font-semibold transition-colors flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Ver Raio-X</span>
              </button>
              <span className="material-symbols-outlined text-[#bec9c8] text-[20px]">
                more_horiz
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
