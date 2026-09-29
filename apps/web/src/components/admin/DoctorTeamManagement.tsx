import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const DoctorTeamManagement: React.FC = () => {
  const { doctors, setScreen, setShowNewDoctorModal, addToast } = useApp();

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.cro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'Todos' || doc.status.toLowerCase().includes(statusFilter.toLowerCase());

    const matchesCategory =
      activeFilter === 'Todos' ||
      (activeFilter === 'Cirurgiões-Dentistas' && !doc.name.includes('TSB')) ||
      (activeFilter === 'Ortodontia' && doc.specialties.some((s) => s.includes('Ortodontia'))) ||
      (activeFilter === 'Implantodontia' &&
        doc.specialties.some((s) => s.includes('Implantodontia'))) ||
      (activeFilter === 'Equipe de Apoio / ASB' && doc.name.includes('TSB'));

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-16">
      {/* Header and Top Controls */}
      <div className="flex flex-col gap-2">
        {/* Breadcrumb & System State */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-[#6e7979]">
            <button
              onClick={() => setScreen('admin-visao-geral')}
              className="hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors"
            >
              Início
            </button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Gestão de Pessoas</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#005051] dark:text-[#84d4d4] font-bold">Dentistas & Equipe</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-ping"></span>
            <span>Sincronização Ativa CFO / CRO-SP • Atualizado há 12 min</span>
          </div>
        </div>

        {/* Title & Action CTAs */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mt-1">
          <div className="flex flex-col max-w-2xl">
            <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight">
              Gestão de Dentistas e Equipe Clínica
            </h1>
            <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
              Controle de credenciamento CRO, escalas de plantão, comissões de procedimentos e
              permissões de acesso clínico.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => addToast('Matriz de comissões e repasses atualizada.', 'info')}
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-[#e8efee] dark:bg-[#202929] hover:bg-[#dde4e3] text-[#161d1d] dark:text-white text-xs font-bold transition-all shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#4a6363] dark:text-[#84d4d4]">
                tune
              </span>
              <span>Configurar Comissões</span>
            </button>

            <button
              onClick={() =>
                addToast('Escala completa do mês de Outubro exportada em planilha.', 'success')
              }
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-white dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] text-xs font-bold hover:bg-[#eef5f4] transition-all shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">sim_card_download</span>
              <span>Exportar Escala & Relatórios</span>
            </button>

            <button
              onClick={() => setShowNewDoctorModal(true)}
              className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold transition-all shadow-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Cadastrar Profissional</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Especialistas */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
              Total de Especialistas
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#a0f0f1] text-[#002020] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#161d1d] dark:text-white font-mono">
                {doctors.length + 18}
              </span>
              <span className="text-xs text-[#005051] dark:text-[#84d4d4] font-bold">
                +2 no trimestre
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#dde4e3]/60 dark:border-[#263131] text-xs text-[#6e7979]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#005051] dark:bg-[#84d4d4]"></span>
              <span>18 Cirurgiões-Dentistas</span>
              <span>•</span>
              <span>6 ASB/TSB</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ocupação Média */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
              Ocupação Média Escala
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">event_available</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#161d1d] dark:text-white font-mono">
                91.4%
              </span>
              <span className="inline-flex items-center text-xs text-[#005051] dark:text-[#84d4d4] font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> 4.2%
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#dde4e3]/60 dark:border-[#263131] text-xs text-[#6e7979]">
              <span className="font-semibold text-[#161d1d] dark:text-white">
                8 plantonistas ativos
              </span>
              <span>em atendimento hoje</span>
            </div>
          </div>
        </div>

        {/* Card 3: Repasses do Mês */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
              Repasses do Mês
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#d2e4ff] dark:bg-[#1e293b] text-[#005051] dark:text-[#84d4d4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-[#6e7979]">R$</span>
              <span className="text-3xl font-bold text-[#161d1d] dark:text-white font-mono">
                142.850
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#dde4e3]/60 dark:border-[#263131] text-xs text-[#6e7979]">
              <span>Previsão fechamento: 30/Mês</span>
              <span className="text-[11px] bg-white dark:bg-[#202929] px-2 py-0.5 rounded font-bold text-[#161d1d] dark:text-white">
                D-5
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Regularidade Regulatória */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
              CROs & Documentação
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#a0f0f1] text-[#002020] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#161d1d] dark:text-white font-mono">
                100%
              </span>
              <span className="text-xs text-[#005051] dark:text-[#84d4d4] font-bold">
                Em Conformidade
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#dde4e3]/60 dark:border-[#263131] text-xs text-[#6e7979]">
              <span className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]">
                check_circle
              </span>
              <span>Zero pendências CFO/CROSP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Segmented Filter Bar */}
      <div className="bg-white dark:bg-[#1a2222] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            'Todos',
            'Cirurgiões-Dentistas',
            'Ortodontia',
            'Implantodontia',
            'Equipe de Apoio / ASB',
          ].map((chip) => {
            const isSelected = activeFilter === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveFilter(chip)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] shadow-sm'
                    : 'bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#e2eae9] text-[#3e4949] dark:text-[#bec9c8]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Selectors and Search */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="relative w-full sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7979] text-[18px]">
              search
            </span>
            <input
              className="w-full bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white placeholder:text-[#6e7979] pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#005051] border border-[#dde4e3] dark:border-[#2d3838]"
              placeholder="Buscar por nome, CRO, especialidade..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer border border-[#dde4e3] dark:border-[#2d3838]"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Em Cirurgia">Em Cirurgia</option>
              <option value="Escala Regular">Escala Regular</option>
              <option value="Plantão Ativo">Plantão Ativo</option>
              <option value="Ativo">Ativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Professional Roster Table Container */}
      <div className="bg-white dark:bg-[#1a2222] rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[#dde4e3]/60 dark:border-[#263131]">
        <div className="px-5 py-3 bg-[#eef5f4] dark:bg-[#202929] flex items-center justify-between border-b border-[#dde4e3]/50 dark:border-[#263131]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#161d1d] dark:text-white">
              Corpo Clínico Credenciado
            </span>
            <span className="bg-[#dde4e3] dark:bg-[#263131] text-[10px] text-[#3e4949] dark:text-[#bec9c8] px-2 py-0.5 rounded-full font-bold">
              {filteredDoctors.length} registros
            </span>
          </div>
          <span className="text-xs text-[#6e7979] hidden md:inline">
            Ordenando por: <strong>Mais Atendimentos</strong>
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#eef5f4]/60 dark:bg-[#1a2222] text-[#6e7979] text-[11px] uppercase tracking-wider select-none border-b border-[#dde4e3]/60 dark:border-[#263131]">
                <th className="py-3 px-5 font-bold">Profissional & CRO</th>
                <th className="py-3 px-3 font-bold">Contrato</th>
                <th className="py-3 px-3 font-bold">Escala & Consultório</th>
                <th className="py-3 px-3 font-bold text-center">Atendimentos</th>
                <th className="py-3 px-3 font-bold">Comissões / Repasse</th>
                <th className="py-3 px-3 font-bold">Avaliação (NPS)</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-5 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e3]/60 dark:divide-[#263131] text-xs text-[#161d1d] dark:text-white">
              {filteredDoctors.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-[#f4fbfa] dark:hover:bg-[#202929] transition-colors"
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#cce8e7] dark:ring-[#324b4b]">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold truncate">{doc.name}</span>
                          {doc.isCertified && (
                            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[16px]">
                              verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#005051] dark:text-[#84d4d4] font-bold">
                          {doc.cro}
                        </span>
                        <span className="text-[11px] text-[#6e7979] truncate">
                          {doc.specialties.join(' • ')}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#eef5f4] dark:bg-[#263131] text-[11px] text-[#3e4949] dark:text-[#bec9c8] font-medium">
                      {doc.contractType}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">{doc.schedule}</span>
                      <span className="text-[11px] text-[#6e7979] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#005051] dark:bg-[#84d4d4]"></span>
                        <span>{doc.room}</span>
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {doc.appointmentsCount > 0 ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-sm font-mono">{doc.appointmentsCount}</span>
                        <span className="text-[10px] text-[#6e7979]">consultas</span>
                      </div>
                    ) : (
                      <span className="text-[#6e7979]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {doc.monthlyRevenue > 0 ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#005051] dark:text-[#84d4d4]">
                            {doc.commissionPercentage}%
                          </span>
                          <span className="text-[11px] text-[#6e7979] font-mono">
                            (R$ {doc.monthlyRevenue.toLocaleString('pt-BR')})
                          </span>
                        </div>
                        <div className="w-24 bg-[#dde4e3] dark:bg-[#263131] rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-[#005051] dark:bg-[#84d4d4] h-full rounded-full"
                            style={{ width: `${Math.min(doc.commissionPercentage * 1.8, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-medium">Salário Base CLT</span>
                        <span className="text-[10px] text-[#6e7979]">+ Insalubridade 40%</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">
                        star
                      </span>
                      <span className="font-bold font-mono">{doc.npsScore.toFixed(1)}</span>
                      <span className="text-[11px] text-[#6e7979]">(NPS {doc.npsPercentage}%)</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        doc.status === 'Em Atendimento' || doc.status === 'Em Cirurgia'
                          ? 'bg-[#a0f0f1] text-[#002020]'
                          : doc.status === 'Plantão Ativo'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                      <span>{doc.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() =>
                          addToast(
                            `Prontuários sob responsabilidade de ${doc.name} abertos.`,
                            'info',
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-[#e8efee] dark:hover:bg-[#202929] text-[#6e7979] hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors"
                        title="Ver Prontuários"
                      >
                        <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                      </button>
                      <button
                        onClick={() =>
                          addToast(
                            `Grade de horários e escala de ${doc.name} aberta para ajuste.`,
                            'info',
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-[#e8efee] dark:hover:bg-[#202929] text-[#6e7979] hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors"
                        title="Editar Escala"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          calendar_month
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          addToast(`Menu de configurações do profissional ${doc.name}.`, 'info')
                        }
                        className="p-1.5 rounded-lg hover:bg-[#e8efee] dark:hover:bg-[#202929] text-[#6e7979] hover:text-[#161d1d] dark:hover:text-white transition-colors"
                        title="Opções"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#eef5f4] dark:bg-[#202929] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6e7979] border-t border-[#dde4e3]/60 dark:border-[#263131]">
          <span>
            Exibindo <strong>{filteredDoctors.length}</strong> profissionais cadastrados
          </span>
          <div className="flex items-center gap-1">
            <span className="w-8 h-8 rounded-lg bg-[#005051] text-white font-bold flex items-center justify-center">
              1
            </span>
            <button className="w-8 h-8 rounded-lg bg-white dark:bg-[#1a2222] hover:bg-[#dde4e3] flex items-center justify-center font-semibold">
              2
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Quick Configuration & Rules Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Repasse Rules Card */}
        <div className="lg:col-span-2 bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1]">
                <span className="material-symbols-outlined text-[20px]">calculate</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">
                  Regras Ativas de Repasse & Comissão por Especialidade
                </h2>
                <p className="text-[11px] text-[#6e7979]">
                  Parâmetros vigentes aplicados aos cálculos automáticos de fechamento
                </p>
              </div>
            </div>
            <button
              onClick={() => addToast('Configurador de matriz de comissão aberto.', 'info')}
              className="text-xs text-[#005051] dark:text-[#84d4d4] font-bold hover:underline flex items-center gap-0.5"
            >
              <span>Editar Matriz</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#202929] p-3 rounded-xl flex flex-col border border-[#dde4e3]/60 dark:border-[#2d3838]">
              <span className="text-[11px] text-[#6e7979]">Ortodontia</span>
              <span className="text-xl font-bold text-[#005051] dark:text-[#84d4d4] font-mono">
                45%
              </span>
              <span className="text-[10px] text-[#6e7979] mt-1">Líquido de alinhador</span>
            </div>
            <div className="bg-white dark:bg-[#202929] p-3 rounded-xl flex flex-col border border-[#dde4e3]/60 dark:border-[#2d3838]">
              <span className="text-[11px] text-[#6e7979]">Implantodontia</span>
              <span className="text-xl font-bold text-[#005051] dark:text-[#84d4d4] font-mono">
                50%
              </span>
              <span className="text-[10px] text-[#6e7979] mt-1">Dedução kit cirúrgico</span>
            </div>
            <div className="bg-white dark:bg-[#202929] p-3 rounded-xl flex flex-col border border-[#dde4e3]/60 dark:border-[#2d3838]">
              <span className="text-[11px] text-[#6e7979]">Clínica Geral</span>
              <span className="text-xl font-bold text-[#005051] dark:text-[#84d4d4] font-mono">
                40%
              </span>
              <span className="text-[10px] text-[#6e7979] mt-1">Procedimentos diretos</span>
            </div>
            <div className="bg-white dark:bg-[#202929] p-3 rounded-xl flex flex-col border border-[#dde4e3]/60 dark:border-[#2d3838]">
              <span className="text-[11px] text-[#6e7979]">Próteses & Lab</span>
              <span className="text-xl font-bold text-[#334863] dark:text-[#c5dbfb] font-mono">
                Variável
              </span>
              <span className="text-[10px] text-[#6e7979] mt-1">Com dedução protético</span>
            </div>
          </div>
        </div>

        {/* Quick Alerts Card: Regulatory & Next Shifts */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 flex flex-col justify-between shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px]">
                  schedule
                </span>
                <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                  Próximo Plantão Noturno
                </span>
              </div>
              <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Hoje • 19h00
              </span>
            </div>

            <div className="bg-white dark:bg-[#202929] rounded-xl p-3 flex items-center gap-3 border border-[#dde4e3]/60 dark:border-[#2d3838]">
              <div className="w-10 h-10 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">emergency</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#161d1d] dark:text-white truncate">
                  Dra. Carla Monteiro
                </span>
                <span className="text-[11px] text-[#6e7979]">
                  Equipe de apoio: Camila Ferraz (TSB)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#dde4e3]/60 dark:border-[#263131] text-xs text-[#6e7979]">
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]">
                notifications_active
              </span>{' '}
              Escala noturna confirmada
            </span>
            <button
              onClick={() =>
                addToast('Visualização detalhada da escala de plantão noturno aberta.', 'info')
              }
              className="text-[#005051] dark:text-[#84d4d4] font-bold hover:underline"
            >
              Ver Escala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
