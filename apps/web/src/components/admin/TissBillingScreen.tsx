import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const TissBillingScreen: React.FC = () => {
  const {
    tissGuides,
    setScreen,
    transmitTissBatch,
    resolveGlosa,
    convertToPrivate,
    setShowAiAuditModal,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lotes' | 'auditoria' | 'tuss' | 'conciliacao'>(
    'lotes',
  );
  const [operatorFilter, setOperatorFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredGuides = tissGuides.filter((g) => {
    const matchesOperator = operatorFilter === 'Todas' || g.insurer.includes(operatorFilter);
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'glosa' &&
        (g.status === 'glosa_preventiva' || g.status === 'glosa_ans_definitiva')) ||
      (statusFilter === 'pronto' && g.status === 'pronto_transmissao');
    return matchesOperator && matchesStatus;
  });

  const handleExportXml = () => {
    addToast(
      'Lote gerado com sucesso: LOTE_TISS_40100_ODONTOAURA.XML pronto para download.',
      'success',
    );
  };

  const handleValidateBatch = () => {
    addToast('342 guias validadas contra o Schema XSD da ANS sem erros de sintaxe.', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6e7979]">
            <button
              onClick={() => setScreen('admin-visao-geral')}
              className="hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Início</span>
            </button>
            <span>/</span>
            <span className="hover:text-[#005051] cursor-pointer">Financeiro</span>
            <span>/</span>
            <span className="text-[#005051] dark:text-[#84d4d4] font-bold">
              Faturamento & Convênios TISS
            </span>
          </nav>

          <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold tracking-tight">
            Faturamento & Convênios TISS
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] max-w-3xl leading-relaxed">
            Processamento eletrônico de lotes ANS Padrão 4.01.00, conciliação de guias SADT, recurso
            de glosas preventivas e auditoria de repasses operacionais.
          </p>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleExportXml}
            className="h-10 px-4 rounded-full bg-[#e8efee] dark:bg-[#202929] hover:bg-[#dde4e3] text-[#005051] dark:text-[#84d4d4] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border border-[#dde4e3] dark:border-[#2d3838]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar Extrato XML/PDF</span>
          </button>

          <button
            onClick={handleValidateBatch}
            className="h-10 px-4 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] hover:bg-[#b1cccb] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            <span>Validar Guias em Lote</span>
          </button>

          <button
            onClick={() =>
              addToast('Novo lote TISS gerado automaticamente com 28 guias elegíveis.', 'success')
            }
            className="h-10 px-5 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            <span>+ Gerar Novo Lote TISS</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Metrics (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
                Faturamento Bruto Convênios
              </span>
              <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold mt-1 font-mono">
                R$ 187.897,00
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">monetization_on</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[#005051] dark:text-[#84d4d4] font-bold">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              64% do faturamento total
            </span>
            <span className="text-[#6e7979]">Mês Atual (Out)</span>
          </div>
          <div className="w-full bg-[#dde4e3] dark:bg-[#263131] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#005051] dark:bg-[#84d4d4] h-full rounded-full"
              style={{ width: '64%' }}
            ></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
                Guias Prontas para Envio
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold font-mono">
                  342
                </span>
                <span className="text-xs text-[#6e7979]">guias validadas</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#a0f0f1] text-[#002020] font-bold flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">schedule_send</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-[#3e4949] dark:text-[#bec9c8] font-medium">
              R$ 52.410,00 no lote #2024-10B
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-bold text-[10px]">
              Apto p/ XML
            </span>
          </div>
          <div className="w-full bg-[#dde4e3] dark:bg-[#263131] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#4a6363] h-full rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* KPI 3: Glosas Preventivas */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
                Glosas Preventivas (IA)
              </span>
              <span className="text-2xl sm:text-3xl text-[#ba1a1a] font-bold mt-1 font-mono">
                R$ 4.820,00
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-[#ba1a1a] font-bold flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-[15px]">report_problem</span>3 guias
              retidas antes de envio
            </span>
            <button
              onClick={() => setShowAiAuditModal(true)}
              className="text-[#005051] dark:text-[#84d4d4] underline font-bold hover:opacity-80"
            >
              Auditar
            </button>
          </div>
          <div className="w-full bg-[#dde4e3] dark:bg-[#263131] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '14%' }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#6e7979] uppercase tracking-wider font-bold">
                Prazo Médio de Liquidação
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white font-bold font-mono">
                  22
                </span>
                <span className="text-xs text-[#6e7979]">dias corridos</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#e8efee] dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[#3e4949] dark:text-[#bec9c8]">
              <span className="material-symbols-outlined text-[15px] text-[#005051] dark:text-[#84d4d4]">
                check_circle
              </span>
              Recebimento via DDA
            </span>
            <span className="text-[#005051] dark:text-[#84d4d4] font-bold">-4 dias vs. 2023</span>
          </div>
          <div className="w-full bg-[#dde4e3] dark:bg-[#263131] h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#006a6b] h-full rounded-full" style={{ width: '73%' }}></div>
          </div>
        </div>
      </div>

      {/* Insurers / Participação de Convênios Bento Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px]">
              pie_chart
            </span>
            <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">
              Participação & Ciclos Operacionais por Operadora
            </h2>
          </div>
          <span className="text-xs text-[#6e7979]">Competência Atual: Outubro / 2024</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unimed Odonto */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:bg-[#e8efee] transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#202929] flex items-center justify-center font-bold text-[#005051] dark:text-[#84d4d4] text-xs shadow-sm">
                  UO
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161d1d] dark:text-white">
                    Unimed Odonto
                  </h3>
                  <p className="text-[11px] text-[#6e7979]">57.5% das guias</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-[10px] font-bold">
                0.8% glosa
              </span>
            </div>
            <div className="mt-4 pt-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xl font-bold text-[#161d1d] dark:text-white font-mono">
                  R$ 108.167
                </span>
                <span className="text-xs text-[#005051] dark:text-[#84d4d4] font-semibold">
                  196 guias
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#3e4949] dark:text-[#bec9c8]">
                <span className="h-2 w-2 rounded-full bg-[#005051] dark:bg-[#84d4d4] animate-pulse"></span>
                <span>
                  Lote Aberto até <strong>28/Out</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Amil Dental */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:bg-[#e8efee] transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#202929] flex items-center justify-center font-bold text-[#334863] dark:text-[#d2e4ff] text-xs shadow-sm">
                  AD
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161d1d] dark:text-white">Amil Dental</h3>
                  <p className="text-[11px] text-[#6e7979]">24.2% das guias</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] text-[10px] font-bold">
                1.2% glosa
              </span>
            </div>
            <div className="mt-4 pt-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xl font-bold text-[#161d1d] dark:text-white font-mono">
                  R$ 45.544
                </span>
                <span className="text-xs text-[#6e7979]">83 guias</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#3e4949] dark:text-[#bec9c8]">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Lote Processado (Aguard. Retorno)</span>
              </div>
            </div>
          </div>

          {/* Bradesco Dental */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:bg-[#e8efee] transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#202929] flex items-center justify-center font-bold text-[#ba1a1a] text-xs shadow-sm">
                  BD
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161d1d] dark:text-white">
                    Bradesco Dental
                  </h3>
                  <p className="text-[11px] text-[#6e7979]">12.1% das guias</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-[10px] font-bold">
                0.5% glosa
              </span>
            </div>
            <div className="mt-4 pt-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xl font-bold text-[#161d1d] dark:text-white font-mono">
                  R$ 22.772
                </span>
                <span className="text-xs text-[#6e7979]">41 guias</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#005051] dark:text-[#84d4d4] font-semibold">
                <span className="material-symbols-outlined text-[14px]">price_check</span>
                <span>Aguardando Pagamento (DDA)</span>
              </div>
            </div>
          </div>

          {/* SulAmérica Odonto */}
          <div className="bg-[#eef5f4] dark:bg-[#1a2222] p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:bg-[#e8efee] transition-all border border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#202929] flex items-center justify-center font-bold text-[#4a6363] text-xs shadow-sm">
                  SO
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#161d1d] dark:text-white">SulAmérica</h3>
                  <p className="text-[11px] text-[#6e7979]">6.2% das guias</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#a0f0f1] text-[#002020] text-[10px] font-bold">
                0% glosa
              </span>
            </div>
            <div className="mt-4 pt-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xl font-bold text-[#161d1d] dark:text-white font-mono">
                  R$ 11.386
                </span>
                <span className="text-xs text-[#6e7979]">22 guias</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#6e7979]">
                <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                <span>Em Análise Prévia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tabs & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="inline-flex p-1 bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl gap-1 border border-[#dde4e3]/60 dark:border-[#263131]">
            <button
              onClick={() => setActiveTab('lotes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'lotes'
                  ? 'bg-white dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] shadow-sm'
                  : 'text-[#3e4949] dark:text-[#bec9c8]'
              }`}
            >
              <span>Lotes de Envio TISS</span>
              <span className="px-2 py-0.5 rounded-full bg-[#a0f0f1] text-[#002020] text-[10px] font-bold">
                8
              </span>
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'auditoria'
                  ? 'bg-white dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] shadow-sm'
                  : 'text-[#3e4949] dark:text-[#bec9c8]'
              }`}
            >
              <span>Auditoria de Guias & Glosas</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                3 pendentes
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tuss')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'tuss'
                  ? 'bg-white dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] shadow-sm font-bold'
                  : 'text-[#3e4949] dark:text-[#bec9c8]'
              }`}
            >
              Tabelas TUSS
            </button>

            <button
              onClick={() => setActiveTab('conciliacao')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'conciliacao'
                  ? 'bg-white dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] shadow-sm font-bold'
                  : 'text-[#3e4949] dark:text-[#bec9c8]'
              }`}
            >
              Conciliação Bancária
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="h-10 px-4 bg-white dark:bg-[#1a2222] rounded-full text-xs font-semibold text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#263131] shadow-sm cursor-pointer"
            >
              <option value="Todas">Todas as Operadoras</option>
              <option value="Unimed">Unimed Odonto</option>
              <option value="Amil">Amil Dental</option>
              <option value="Bradesco">Bradesco Dental</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 bg-white dark:bg-[#1a2222] rounded-full text-xs font-semibold text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#263131] shadow-sm cursor-pointer"
            >
              <option value="Todos">Status: Todos</option>
              <option value="glosa">Com Glosa Preventiva</option>
              <option value="pronto">Prontos para Transmissão</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#1a2222] rounded-2xl shadow-sm overflow-hidden border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead className="bg-[#eef5f4] dark:bg-[#202929] text-[#6e7979] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Lote / Guia TISS</th>
                  <th className="py-3.5 px-4 font-bold">Operadora / Convênio</th>
                  <th className="py-3.5 px-4 font-bold">Beneficiário & Matrícula</th>
                  <th className="py-3.5 px-4 font-bold">Procedimento & Código TUSS</th>
                  <th className="py-3.5 px-4 text-right font-bold">Valor Total</th>
                  <th className="py-3.5 px-4 font-bold">Status & Alerta ANS</th>
                  <th className="py-3.5 px-4 text-center font-bold">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde4e3]/60 dark:divide-[#263131] text-xs text-[#161d1d] dark:text-white">
                {filteredGuides.map((guide) => (
                  <tr
                    key={guide.id}
                    className={`hover:bg-[#f4fbfa] dark:hover:bg-[#202929] transition-colors ${
                      guide.id.includes('batch')
                        ? 'bg-[#cce8e7]/10 dark:bg-[#324b4b]/10'
                        : guide.status === 'glosa_ans_definitiva'
                          ? 'bg-red-50/40 dark:bg-red-950/10'
                          : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5">
                          {guide.id.includes('batch') ? 'folder_zip' : 'description'}
                        </span>
                        <div>
                          <span className="font-bold text-[#005051] dark:text-[#84d4d4] block">
                            {guide.number}
                          </span>
                          <span className="text-[11px] text-[#6e7979]">{guide.guideType}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="font-semibold block">{guide.insurer}</span>
                      <span className="text-[11px] text-[#6e7979]">{guide.plan}</span>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="font-bold block">{guide.patientName}</span>
                      <span className="text-[11px] text-[#6e7979] font-mono">
                        {guide.patientCard}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="font-semibold block">{guide.procedureName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#eef5f4] dark:bg-[#202929] text-[#4a6363] dark:text-[#bec9c8] font-mono">
                          {guide.tussCode}
                        </span>
                        {guide.toothOrRegion && (
                          <span className="text-[10px] text-[#6e7979]">{guide.toothOrRegion}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right">
                      <span
                        className={`font-bold font-mono text-sm ${
                          guide.status === 'glosa_ans_definitiva' ? 'text-[#ba1a1a]' : ''
                        }`}
                      >
                        R$ {guide.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="block text-[10px] text-[#6e7979]">
                        Exec.: {guide.executionDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold w-fit ${
                            guide.status === 'pronto_transmissao'
                              ? 'bg-[#a0f0f1] text-[#002020]'
                              : guide.status === 'glosa_preventiva'
                                ? 'bg-amber-100 text-amber-900'
                                : guide.status === 'autorizado_instantaneo'
                                  ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1]'
                                  : guide.status === 'faturada_conciliada'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-[#ffdad6] text-[#93000a]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {guide.status === 'glosa_preventiva'
                              ? 'report'
                              : guide.status === 'glosa_ans_definitiva'
                                ? 'cancel'
                                : 'check_circle'}
                          </span>
                          <span>{guide.statusLabel}</span>
                        </div>
                        {guide.alertMessage && (
                          <span className="text-[11px] text-[#ba1a1a] font-medium leading-tight">
                            {guide.alertMessage}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-center">
                      {guide.status === 'pronto_transmissao' && (
                        <button
                          onClick={() => transmitTissBatch(guide.id)}
                          className="h-8 px-3.5 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                          <span>Transmitir XML</span>
                        </button>
                      )}

                      {guide.status === 'glosa_preventiva' && (
                        <button
                          onClick={() => resolveGlosa(guide.id)}
                          className="h-8 px-3.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] hover:bg-[#b1cccb] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">attachment</span>
                          <span>Anexar RX & Liberar</span>
                        </button>
                      )}

                      {guide.status === 'autorizado_instantaneo' && (
                        <button
                          onClick={() =>
                            addToast(
                              'Guia autorizada via token de elegibilidade biométrica.',
                              'info',
                            )
                          }
                          className="h-8 px-3 rounded-full bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#dde4e3] text-[#161d1d] dark:text-white text-xs font-medium inline-flex items-center gap-1 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Ver Detalhes</span>
                        </button>
                      )}

                      {guide.status === 'faturada_conciliada' && (
                        <button
                          onClick={() =>
                            addToast('Comprovante DDA de liquidação bancária baixado.', 'success')
                          }
                          className="h-8 px-3 rounded-full bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#dde4e3] text-[#161d1d] dark:text-white text-xs font-medium inline-flex items-center gap-1 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            receipt_long
                          </span>
                          <span>Recibo DDA</span>
                        </button>
                      )}

                      {guide.status === 'glosa_ans_definitiva' && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => convertToPrivate(guide.id)}
                            className="h-8 px-3 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              swap_horiz
                            </span>
                            <span>Converter Particular</span>
                          </button>
                          <button
                            onClick={() =>
                              addToast(
                                'Recurso administrativo protocolado no portal da operadora.',
                                'info',
                              )
                            }
                            className="h-8 w-8 rounded-full bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#dde4e3] flex items-center justify-center text-[#161d1d] dark:text-white"
                            title="Recorrer Glosa"
                          >
                            <span className="material-symbols-outlined text-[16px]">gavel</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-[#eef5f4] dark:bg-[#202929] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6e7979] border-t border-[#dde4e3]/60 dark:border-[#263131]">
            <div className="flex items-center gap-2">
              <span>
                Mostrando <strong>{filteredGuides.length}</strong> guias
              </span>
              <span>•</span>
              <span>Atualizado há 3 minutos via WebService ANS</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-3 py-1 rounded-lg bg-[#005051] text-white font-bold">1</span>
              <button className="px-3 py-1 rounded-lg bg-white dark:bg-[#1a2222] hover:bg-[#dde4e3] text-[#161d1d] dark:text-white font-semibold">
                2
              </button>
              <button className="px-3 py-1 rounded-lg bg-white dark:bg-[#1a2222] hover:bg-[#dde4e3] text-[#161d1d] dark:text-white font-semibold">
                3
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tools / TISS Utilities Bento Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* XML Schema ANS Card */}
        <div className="lg:col-span-2 bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#dde4e3]/60 dark:border-[#263131]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#161d1d] dark:text-white">
                  Motor de Validação de Schemas ANS
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-[#005051] text-white text-[10px] font-bold">
                  v4.01.00 Oficial
                </span>
              </div>
              <p className="text-xs text-[#6e7979] mt-0.5 leading-relaxed">
                Gera arquivos XML compatíveis com todas as operadoras do padrão TISS. Valida tokens
                de prestador, assinaturas digitais ICP-Brasil e tabelas vigentes TUSS.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              addToast('Dicionário de códigos TUSS sincronizado com a ANS.', 'success')
            }
            className="h-10 px-4 rounded-full bg-white dark:bg-[#202929] hover:bg-[#dde4e3] text-[#161d1d] dark:text-white text-xs font-bold shrink-0 transition-all flex items-center gap-2 border border-[#dde4e3] dark:border-[#2d3838]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            <span>Atualizar Dicionário TUSS</span>
          </button>
        </div>

        {/* AI Pre-Audit Prompt Card */}
        <div className="bg-[#005051] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#a0f0f1] bg-[#006a6b] px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Auditoria Preditiva IA
              </span>
              <span className="text-xs text-[#a0f0f1]">Taxa de Sucesso: 99.4%</span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">Auditar Guias Pré-Envio</h4>
            <p className="text-xs text-[#97e7e7] mt-1 leading-relaxed">
              Nossa rede neural analisa inconsistências entre o odontograma, o laudo periapical e a
              codificação TUSS para evitar glosas financeiras.
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowAiAuditModal(true)}
              className="w-full h-10 rounded-full bg-[#a0f0f1] text-[#002020] text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">magic_button</span>
              <span>Auditar Todas as Guias com IA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
