import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { setScreen, rooms, setShowNewDoctorModal, addToast } = useApp();

  const [datePeriod, setDatePeriod] = useState<'hoje' | '7dias' | 'mes' | 'personalizado'>('mes');
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  return (
    <div className="flex flex-col w-full gap-6 pb-16">
      {/* CABEÇALHO DO DASHBOARD / FILTRO EXECUTIVO */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-pulse"></span>
                Monitoramento Ativo
              </span>
              <span className="text-xs text-[#6e7979]">Sincronizado há 2 min</span>
            </div>
            <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight">
              Painel de Controle Administrativo
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]">
                analytics
              </span>
              <span>
                Visão consolidada em tempo real • Unidade Jardins (Matriz) • Outubro de 2024
              </span>
            </p>
          </div>

          {/* Action buttons & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Date Selector Pills */}
            <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-1 rounded-full flex items-center shadow-sm border border-[#dde4e3] dark:border-[#263131]">
              <button
                onClick={() => setDatePeriod('hoje')}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  datePeriod === 'hoje'
                    ? 'bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white font-bold shadow-sm'
                    : 'text-[#3e4949] dark:text-[#bec9c8]'
                }`}
                type="button"
              >
                Hoje
              </button>
              <button
                onClick={() => setDatePeriod('7dias')}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  datePeriod === '7dias'
                    ? 'bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white font-bold shadow-sm'
                    : 'text-[#3e4949] dark:text-[#bec9c8]'
                }`}
                type="button"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => setDatePeriod('mes')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  datePeriod === 'mes'
                    ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] shadow-sm'
                    : 'text-[#3e4949] dark:text-[#bec9c8]'
                }`}
                type="button"
              >
                Mês Atual
              </button>
              <button
                onClick={() => {
                  setDatePeriod('personalizado');
                  addToast('Seletor de datas personalizado aberto.', 'info');
                }}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${
                  datePeriod === 'personalizado'
                    ? 'bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white font-bold shadow-sm'
                    : 'text-[#3e4949] dark:text-[#bec9c8]'
                }`}
                type="button"
              >
                <span>Personalizado</span>
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </button>
            </div>

            {/* Export Action Button */}
            <button
              onClick={() => addToast('Relatório executivo gerado em PDF/XLSX.', 'success')}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold hover:opacity-90 transition-all shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span className="hidden sm:inline">Exportar Relatório</span>
            </button>

            {/* New Action Primary Button with Popover */}
            <div className="relative">
              <button
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-all shadow-md"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Nova Ação</span>
                <span className="material-symbols-outlined text-[18px] ml-0.5">expand_more</span>
              </button>

              {showActionDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#202929] text-[#161d1d] dark:text-white rounded-2xl shadow-xl p-2 z-50 border border-[#dde4e3] dark:border-[#2d3838]">
                  <button
                    onClick={() => {
                      setShowActionDropdown(false);
                      setShowNewDoctorModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#eef5f4] dark:hover:bg-[#263131] transition-colors text-xs font-semibold text-left"
                  >
                    <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px]">
                      person_add
                    </span>
                    <span>Novo Dentista</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowActionDropdown(false);
                      addToast('Agenda clínica bloqueada para manutenção.', 'info');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#eef5f4] dark:hover:bg-[#263131] transition-colors text-xs font-semibold text-left text-[#ba1a1a]"
                  >
                    <span className="material-symbols-outlined text-[20px]">event_busy</span>
                    <span>Bloquear Agenda</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowActionDropdown(false);
                      setScreen('admin-faturamento');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#eef5f4] dark:hover:bg-[#263131] transition-colors text-xs font-semibold text-left"
                  >
                    <span className="material-symbols-outlined text-[#334863] text-[20px]">
                      verified
                    </span>
                    <span>Novo Convênio TISS</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowActionDropdown(false);
                      addToast('Módulo de despesas e compras de materiais aberto.', 'info');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#eef5f4] dark:hover:bg-[#263131] transition-colors text-xs font-semibold text-left"
                  >
                    <span className="material-symbols-outlined text-[#4a6363] text-[20px]">
                      receipt_long
                    </span>
                    <span>Lançar Despesa</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CARDS DE KPIS EXECUTIVOS (GRID DE 4 CARDS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Mensal */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
              Faturamento Mensal
            </span>
            <div className="w-9 h-9 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#84d4d4]">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight font-mono">
              R$ 284.650
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#a0f0f1] text-[#002020] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +14.2%
              </span>
              <span className="text-[11px] text-[#6e7979]">vs mês anterior</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex justify-between items-center text-xs text-[#6e7979] mb-1">
              <span>Meta Mensal</span>
              <span className="font-bold text-[#161d1d] dark:text-white">88.9% (R$ 320k)</span>
            </div>
            <div className="w-full h-2 bg-[#dde4e3] dark:bg-[#263131] rounded-full overflow-hidden">
              <div
                className="bg-[#005051] dark:bg-[#84d4d4] h-full rounded-full"
                style={{ width: '88.9%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Consultas Realizadas */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
              Consultas no Mês
            </span>
            <div className="w-9 h-9 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#84d4d4]">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight font-mono">
                1.428
              </span>
              <span className="text-xs text-[#6e7979]">atendimentos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#a0f0f1] text-[#002020] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">north_east</span>
                +6.8%
              </span>
              <span className="text-[11px] text-[#6e7979]">Média 58/dia</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] bg-white dark:bg-[#202929] px-3 py-1.5 rounded-xl border border-[#dde4e3]/60 dark:border-[#2d3838]">
            <span className="text-[#3e4949] dark:text-[#bec9c8] flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#005051] dark:bg-[#84d4d4]"></span> 64%
              Convênio
            </span>
            <span className="text-[#3e4949] dark:text-[#bec9c8] flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#334863]"></span> 36% Particular
            </span>
          </div>
        </div>

        {/* Card 3: Taxa de Ocupação */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
              Taxa de Ocupação
            </span>
            <div className="w-9 h-9 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#84d4d4]">
              <span className="material-symbols-outlined text-[20px]">
                airline_seat_recline_extra
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight font-mono">
                84.5%
              </span>
              <span className="text-xs text-[#6e7979]">8 de 10 salas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#B2F1B8] text-[#002107] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Capacidade Ideal
              </span>
              <span className="text-[11px] text-[#6e7979]">Faixa 80-85%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex-1 h-2 bg-[#005051] dark:bg-[#84d4d4] rounded-full"></div>
            ))}
            {[9, 10].map((i) => (
              <div key={i} className="flex-1 h-2 bg-[#dde4e3] dark:bg-[#263131] rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Card 4: No-Show */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-bold">
              Taxa de No-Show
            </span>
            <div className="w-9 h-9 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#84d4d4]">
              <span className="material-symbols-outlined text-[20px]">event_busy</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight font-mono">
                4.2%
              </span>
              <span className="text-xs text-[#6e7979]">Mínima Histórica</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#B2F1B8] text-[#002107] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">south</span>
                -1.8% no mês
              </span>
              <span className="text-[11px] text-[#6e7979]">WhatsApp Bot Ativo</span>
            </div>
          </div>
          <div className="mt-4 pt-3 flex items-center gap-2 text-xs text-[#4a6363] dark:text-[#bec9c8]">
            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[18px]">
              verified
            </span>
            <span>98.6% das consultas confirmadas</span>
          </div>
        </div>
      </section>

      {/* SEÇÃO PRINCIPAL (GRID 12 COLUNAS: 8 ESQUERDA / 4 DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: OPERAÇÃO CLÍNICA & FINANCEIRA (8 COLUNAS) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Bloco A: Visão Operacional das Salas e Consultórios */}
          <section className="bg-white dark:bg-[#1a2222] p-6 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-[#dde4e3]/50 dark:border-[#263131] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">meeting_room</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                    Ocupação das Salas em Tempo Real
                  </h2>
                  <p className="text-xs text-[#6e7979]">
                    Monitoramento simultâneo dos consultórios odontológicos ativos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    addToast('Remanejamento de horários liberado para a recepção.', 'info')
                  }
                  className="text-[#005051] dark:text-[#84d4d4] hover:bg-[#eef5f4] dark:hover:bg-[#202929] px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  type="button"
                >
                  Remanejar Horário
                </button>
                <button
                  onClick={() => setScreen('admin-salas')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold hover:opacity-90 transition-colors"
                  type="button"
                >
                  <span>Mapa Completo</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* 6 Operatory Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rooms.map((room) => {
                const isWorking =
                  room.status === 'em_atendimento' || room.status === 'em_procedimento';
                const isClean = room.status === 'higienizado_livre';
                const isMaintenance = room.status === 'manutencao_preventiva';

                return (
                  <div
                    key={room.id}
                    className="bg-[#eef5f4] dark:bg-[#202929] p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all hover:bg-[#e8efee] dark:hover:bg-[#263131] border border-[#dde4e3]/60 dark:border-[#2d3838]"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isWorking
                          ? 'bg-[#84d4d4]'
                          : isClean
                            ? 'bg-[#B2F1B8]'
                            : isMaintenance
                              ? 'bg-[#FFDDB9]'
                              : 'bg-[#B2F1B8]'
                      }`}
                    ></div>

                    <div className="pl-2 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#161d1d] dark:text-white">
                          {room.name}
                        </span>
                        <span className="text-[11px] text-[#6e7979] block">{room.specialty}</span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          isWorking
                            ? 'bg-[#a0f0f1] text-[#002020]'
                            : isClean
                              ? 'bg-[#B2F1B8] text-[#002107]'
                              : isMaintenance
                                ? 'bg-[#FFDDB9] text-[#2D1600]'
                                : 'bg-[#B2F1B8] text-[#002107]'
                        }`}
                      >
                        {isWorking && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#005051] animate-pulse"></span>
                        )}
                        {isClean && (
                          <span className="material-symbols-outlined text-[12px]">check</span>
                        )}
                        {isMaintenance && (
                          <span className="material-symbols-outlined text-[12px]">build</span>
                        )}
                        <span>{room.statusLabel}</span>
                      </span>
                    </div>

                    <div className="pl-2 mt-2 pt-2 bg-white/70 dark:bg-[#1a2222]/80 p-2 rounded-xl text-xs">
                      {room.doctorName ? (
                        <>
                          <p className="font-semibold text-[#161d1d] dark:text-white truncate">
                            {room.doctorName} • {room.patientName}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-[#6e7979] mt-1">
                            <span>{room.currentProcedure}</span>
                            <span className="text-[#005051] dark:text-[#84d4d4] font-bold">
                              Término: {room.remainingMinutes} min
                            </span>
                          </div>
                        </>
                      ) : room.technicianInfo ? (
                        <>
                          <p className="font-semibold text-[#161d1d] dark:text-white truncate">
                            Calibração do Microscópio & Autoclave
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-[#6e7979] mt-1">
                            <span>Técnico: BioMed Assistência</span>
                            <span className="text-[#ba1a1a] font-semibold">Liberação: 16:30</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-[#161d1d] dark:text-white truncate">
                            {room.nextScheduled || 'Cadeira pronta para atendimento'}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-[#6e7979] mt-1">
                            <span>
                              {room.nextTime ? `Próximo às ${room.nextTime}` : 'Plantão ativo'}
                            </span>
                            <span className="text-[#005051] dark:text-[#84d4d4] font-semibold">
                              Sem fila
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bloco B: Receita vs Despesas & Desempenho Financeiro */}
          <section className="bg-white dark:bg-[#1a2222] p-6 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-[#dde4e3]/50 dark:border-[#263131]">
              <div>
                <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                  Desempenho Financeiro Consolidado
                </h2>
                <p className="text-xs text-[#6e7979]">
                  Evolução de faturamento, repasses clínicos e custos operacionais
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#161d1d] dark:text-white font-semibold">
                  <span className="w-3 h-3 rounded-sm bg-[#005051] dark:bg-[#84d4d4]"></span>{' '}
                  Receita Bruta
                </span>
                <span className="flex items-center gap-1.5 text-[#3e4949] dark:text-[#bec9c8]">
                  <span className="w-3 h-3 rounded-sm bg-[#4a6363]"></span> Repasses
                </span>
                <span className="flex items-center gap-1.5 text-[#3e4949] dark:text-[#bec9c8]">
                  <span className="w-3 h-3 rounded-sm bg-[#dde4e3] dark:bg-[#263131]"></span> Custos
                </span>
              </div>
            </div>

            {/* Visual Bar Chart Representation */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 border-b border-[#dde4e3] dark:border-[#263131] pb-2">
                {[
                  { month: 'Maio', r: 70, d: 45, c: 25, val: 'R$ 220k' },
                  { month: 'Jun', r: 78, d: 48, c: 28, val: 'R$ 242k' },
                  { month: 'Jul', r: 82, d: 50, c: 24, val: 'R$ 255k' },
                  { month: 'Ago', r: 86, d: 52, c: 26, val: 'R$ 268k' },
                  { month: 'Set', r: 80, d: 49, c: 25, val: 'R$ 249k' },
                  { month: 'Out (Atual)', r: 95, d: 55, c: 27, val: 'R$ 284.6k', current: true },
                ].map((b, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      <div
                        className={`w-1/3 rounded-t-md transition-all ${
                          b.current
                            ? 'bg-[#005051] dark:bg-[#84d4d4]'
                            : 'bg-[#005051]/80 dark:bg-[#84d4d4]/70'
                        }`}
                        style={{ height: `${b.r}%` }}
                        title={`Receita: ${b.val}`}
                      ></div>
                      <div
                        className="w-1/3 bg-[#4a6363] dark:bg-[#b1cccb] rounded-t-md"
                        style={{ height: `${b.d}%` }}
                        title="Repasse Dentistas"
                      ></div>
                      <div
                        className="w-1/3 bg-[#dde4e3] dark:bg-[#263131] rounded-t-md"
                        style={{ height: `${b.c}%` }}
                        title="Custos Operacionais"
                      ></div>
                    </div>
                    <span
                      className={`text-[11px] truncate ${
                        b.current
                          ? 'font-bold text-[#005051] dark:text-[#84d4d4]'
                          : 'text-[#6e7979]'
                      }`}
                    >
                      {b.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Médio & Insights Footnote */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-xl border border-[#dde4e3]/60 dark:border-[#2d3838]">
                <span className="text-[11px] text-[#6e7979] block">Ticket Médio Particular</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white font-mono">
                    R$ 380,00
                  </span>
                  <span className="text-[10px] text-[#005051] dark:text-[#84d4d4] font-bold">
                    +8% alta
                  </span>
                </div>
              </div>
              <div className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-xl border border-[#dde4e3]/60 dark:border-[#2d3838]">
                <span className="text-[11px] text-[#6e7979] block">Ticket Médio Convênio</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white font-mono">
                    R$ 195,00
                  </span>
                  <span className="text-[10px] text-[#6e7979] font-medium">Estável</span>
                </div>
              </div>
              <div className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-xl border border-[#dde4e3]/60 dark:border-[#2d3838]">
                <span className="text-[11px] text-[#6e7979] block">Margem Operacional Líquida</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-[#161d1d] dark:text-white font-mono">
                    35.4%
                  </span>
                  <span className="text-[10px] text-[#005051] dark:text-[#84d4d4] font-bold">
                    Meta &gt;32%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bloco C: Alertas Críticos & Pendências Administrativas */}
          <section className="bg-white dark:bg-[#1a2222] p-6 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between pb-3 border-b border-[#dde4e3]/50 dark:border-[#263131]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                    Alertas Críticos & Pendências
                  </h2>
                  <p className="text-xs text-[#6e7979]">
                    Ações operacionais que exigem intervenção da gerência
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-bold">
                3 Requerem Atenção
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {/* Item 1: Glosas TISS */}
              <div className="bg-[#eef5f4] dark:bg-[#202929] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#e8efee] dark:hover:bg-[#263131] transition-colors border border-[#dde4e3]/60 dark:border-[#2d3838]">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[22px] mt-0.5">
                    assignment_late
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#161d1d] dark:text-white">
                        3 Guias TISS com Glosa Preventiva
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
                        R$ 4.820 retidos
                      </span>
                    </div>
                    <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] mt-0.5">
                      Divergência de radiografia panorâmica com Unimed Odonto (2) e Amil Dental (1).
                      Prazo de recurso: 4 dias úteis.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setScreen('admin-faturamento')}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-all whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm"
                  type="button"
                >
                  Auditar Guias
                </button>
              </div>

              {/* Item 2: Estoque Crítico */}
              <div className="bg-[#eef5f4] dark:bg-[#202929] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#e8efee] dark:hover:bg-[#263131] transition-colors border border-[#dde4e3]/60 dark:border-[#2d3838]">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#8a5100] dark:text-amber-400 text-[22px] mt-0.5">
                    inventory_2
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#161d1d] dark:text-white">
                        Estoque Crítico: Resina 3M & Articaína
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FFDDB9] text-[#2D1600] text-[10px] font-bold">
                        Ponto de Reposição
                      </span>
                    </div>
                    <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] mt-0.5">
                      Articaína 4% (restam 3 tubetes) e Resina Filtek Z350 (tom A2/A3 em 1 unidade).
                      Cotação aprovada com Dental Cremer.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    addToast('Pedido de reposição #OC-889 enviado para Dental Cremer.', 'success')
                  }
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold hover:opacity-90 transition-colors whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm"
                  type="button"
                >
                  Comprar Reposição
                </button>
              </div>

              {/* Item 3: Alvará Sanitário e ICP-Brasil */}
              <div className="bg-[#eef5f4] dark:bg-[#202929] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#e8efee] dark:hover:bg-[#263131] transition-colors border border-[#dde4e3]/60 dark:border-[#2d3838]">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#4a6363] dark:text-[#84d4d4] text-[22px] mt-0.5">
                    verified_user
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#161d1d] dark:text-white">
                        Alvará Sanitário & Certificado Digital ICP-Brasil
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] text-[10px] font-bold">
                        Vence em 22 dias
                      </span>
                    </div>
                    <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] mt-0.5">
                      Documentação do CROSP e laudo radiológico assinados pelo Dr. Rodrigo
                      aguardando upload no portal da Prefeitura.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    addToast(
                      'Documentação enviada para o portal da Vigilância Sanitária.',
                      'success',
                    )
                  }
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold hover:opacity-90 transition-colors whitespace-nowrap self-start sm:self-auto shrink-0 shadow-sm"
                  type="button"
                >
                  Resolver Pendência
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA: PAINEL OPERACIONAL & EQUIPE (4 COLUNAS) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Bloco D: Produtividade da Equipe Clínica */}
          <section className="bg-white dark:bg-[#1a2222] p-6 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between pb-3 border-b border-[#dde4e3]/50 dark:border-[#263131]">
              <div>
                <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">
                  Produtividade Clínica
                </h2>
                <p className="text-xs text-[#6e7979]">Top Especialistas no Mês</p>
              </div>
              <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px]">
                military_tech
              </span>
            </div>

            <div className="flex flex-col gap-2.5 mt-3">
              {[
                {
                  name: 'Dr. Marcelo Arantes',
                  spec: 'Ortodontia • 184 consultas',
                  rev: 'R$ 68.400',
                  nps: '98%',
                  img: ASSETS.drMarcelo,
                },
                {
                  name: 'Dra. Renata Silveira',
                  spec: 'Implantodontia • 92 proced.',
                  rev: 'R$ 89.200',
                  nps: '96%',
                  img: ASSETS.draRenata,
                },
                {
                  name: 'Dra. Helena Gusmão',
                  spec: 'Odontopediatria • 146 consultas',
                  rev: 'R$ 42.100',
                  nps: '99%',
                  img: ASSETS.draHelena,
                },
                {
                  name: 'Dr. Felipe Diniz',
                  spec: 'Estética • 78 proced.',
                  rev: 'R$ 54.800',
                  nps: '95%',
                  img: ASSETS.drFelipe,
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => setScreen('admin-dentistas')}
                  className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-2xl flex items-center justify-between gap-2 hover:bg-[#e8efee] dark:hover:bg-[#263131] transition-all cursor-pointer border border-[#dde4e3]/60 dark:border-[#2d3838]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <img
                        src={doc.img}
                        alt={doc.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#005051] dark:bg-[#84d4d4] ring-2 ring-white"></span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#161d1d] dark:text-white truncate">
                        {doc.name}
                      </h3>
                      <span className="text-[11px] text-[#6e7979] block truncate">{doc.spec}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-[#161d1d] dark:text-white font-mono">
                      {doc.rev}
                    </span>
                    <span className="text-[10px] text-[#005051] dark:text-[#84d4d4] block font-semibold">
                      NPS {doc.nps}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-2">
              <button
                onClick={() => setScreen('admin-dentistas')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005051] dark:text-[#84d4d4] hover:underline"
              >
                <span>Ver escala completa & comissões</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* Bloco E: Distribuição por Convênios & Particular */}
          <section className="bg-white dark:bg-[#1a2222] p-6 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between pb-3 border-b border-[#dde4e3]/50 dark:border-[#263131]">
              <div>
                <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">
                  Convênios vs Particular
                </h2>
                <p className="text-xs text-[#6e7979]">Participação no faturamento bruto</p>
              </div>
              <span className="material-symbols-outlined text-[#4a6363] text-[20px]">
                pie_chart
              </span>
            </div>

            <div className="flex flex-col gap-3.5 mt-3">
              {[
                {
                  name: 'Unimed Odonto',
                  pct: '38%',
                  val: 'R$ 108.167',
                  color: 'bg-[#005051] dark:bg-[#84d4d4]',
                },
                {
                  name: 'Particular / PIX / Crédito',
                  pct: '34%',
                  val: 'R$ 96.781',
                  color: 'bg-[#006a6b] dark:bg-[#a0f0f1]',
                },
                { name: 'Amil Dental', pct: '16%', val: 'R$ 45.544', color: 'bg-[#4a6363]' },
                { name: 'Bradesco Dental', pct: '8%', val: 'R$ 22.772', color: 'bg-[#334863]' },
                { name: 'SulAmérica Odonto', pct: '4%', val: 'R$ 11.386', color: 'bg-[#bec9c8]' },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#161d1d] dark:text-white">{c.name}</span>
                    <span className="font-bold text-[#161d1d] dark:text-white font-mono">
                      {c.pct} • {c.val}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#dde4e3] dark:bg-[#263131] rounded-full overflow-hidden">
                    <div
                      className={`${c.color} h-full rounded-full`}
                      style={{ width: c.pct }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen('admin-faturamento')}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white hover:bg-[#e2eae9] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#dde4e3] dark:border-[#2d3838]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Negociar Tabelas & Coparticipação</span>
            </button>
          </section>

          {/* Bloco F: Atalhos Rápidos de Gestão */}
          <section className="bg-white dark:bg-[#1a2222] p-6 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
            <h2 className="text-sm font-bold text-[#161d1d] dark:text-white mb-3">
              Atalhos Administrativos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScreen('admin-pacientes')}
                className="bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#cce8e7] hover:text-[#005051] p-3 rounded-2xl text-left flex flex-col gap-2 transition-all group border border-[#dde4e3]/60 dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] group-hover:scale-110 transition-transform text-[24px]">
                  fact_check
                </span>
                <span className="text-xs font-bold text-[#161d1d] dark:text-white leading-tight">
                  Auditoria de Prontuários
                </span>
              </button>

              <button
                onClick={() => setScreen('admin-dentistas')}
                className="bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#cce8e7] hover:text-[#005051] p-3 rounded-2xl text-left flex flex-col gap-2 transition-all group border border-[#dde4e3]/60 dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] group-hover:scale-110 transition-transform text-[24px]">
                  calendar_month
                </span>
                <span className="text-xs font-bold text-[#161d1d] dark:text-white leading-tight">
                  Escala & Plantões
                </span>
              </button>

              <button
                onClick={() =>
                  addToast('Inventário e reposição de insumos clínicos aberto.', 'info')
                }
                className="bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#cce8e7] hover:text-[#005051] p-3 rounded-2xl text-left flex flex-col gap-2 transition-all group border border-[#dde4e3]/60 dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] group-hover:scale-110 transition-transform text-[24px]">
                  inventory
                </span>
                <span className="text-xs font-bold text-[#161d1d] dark:text-white leading-tight">
                  Estoque Clínico
                </span>
              </button>

              <button
                onClick={() =>
                  addToast('Painel de conformidade LGPD e controle de logs ativo.', 'info')
                }
                className="bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#cce8e7] hover:text-[#005051] p-3 rounded-2xl text-left flex flex-col gap-2 transition-all group border border-[#dde4e3]/60 dark:border-[#2d3838]"
                type="button"
              >
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] group-hover:scale-110 transition-transform text-[24px]">
                  shield_person
                </span>
                <span className="text-xs font-bold text-[#161d1d] dark:text-white leading-tight">
                  LGPD & Acessos
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
