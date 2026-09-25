import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useDialogFocus } from './useDialogFocus';

export const AiAuditModal: React.FC = () => {
  const {
    showAiAuditModal,
    setShowAiAuditModal,
    tissGuides,
    resolveGlosa,
    convertToPrivate,
    addToast,
  } = useApp();
  const dialogRef = useDialogFocus(showAiAuditModal, () => setShowAiAuditModal(false));
  const [scanning, setScanning] = useState(false);
  const [, setAnalyzed] = useState(false);

  if (!showAiAuditModal) return null;

  const handleRunAiAudit = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setAnalyzed(true);
      addToast('Auditoria Preditiva IA concluída com 99.4% de precisão.', 'success');
    }, 1200);
  };

  const handleFixAll = () => {
    const preventive = tissGuides.filter((guide) => guide.status === 'glosa_preventiva');
    const definitive = tissGuides.filter((guide) => guide.status === 'glosa_ans_definitiva');
    preventive.forEach((guide) => resolveGlosa(guide.id, false));
    definitive.forEach((guide) => convertToPrivate(guide.id, false));
    setShowAiAuditModal(false);
    if (preventive.length + definitive.length > 0) {
      addToast('Todas as pendências foram tratadas com sucesso pela IA!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-audit-title"
        tabIndex={-1}
        className="bg-white dark:bg-[#141b1b] border border-[#dde4e3] dark:border-[#263131] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dde4e3] dark:border-[#263131]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005051] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="ai-audit-title"
                  className="text-base font-bold text-[#161d1d] dark:text-white"
                >
                  Auditoria Preditiva de Guias TISS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-[10px] font-bold">
                  Motor Neural ANS
                </span>
              </div>
              <p className="text-xs text-[#6e7979]">
                Cruzamento automático de odontograma, termos de consentimento e códigos TUSS
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAiAuditModal(false)}
            type="button"
            aria-label="Fechar auditoria de guias"
            className="w-8 h-8 rounded-full hover:bg-[#e8efee] dark:hover:bg-[#202929] flex items-center justify-center text-[#6e7979]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Audit Metrics Banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-2xl text-center border border-[#dde4e3]/60 dark:border-[#2d3838]">
            <span className="text-[10px] text-[#6e7979] font-bold uppercase block">
              Guias Auditadas
            </span>
            <span className="text-xl font-bold text-[#161d1d] dark:text-white font-mono">342</span>
          </div>
          <div className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-2xl text-center border border-[#dde4e3]/60 dark:border-[#2d3838]">
            <span className="text-[10px] text-[#6e7979] font-bold uppercase block">
              Inconsistências
            </span>
            <span className="text-xl font-bold text-[#ba1a1a] font-mono">3</span>
          </div>
          <div className="bg-[#eef5f4] dark:bg-[#202929] p-3 rounded-2xl text-center border border-[#dde4e3]/60 dark:border-[#2d3838]">
            <span className="text-[10px] text-[#6e7979] font-bold uppercase block">
              Valor Protegido
            </span>
            <span className="text-xl font-bold text-[#005051] dark:text-[#84d4d4] font-mono">
              R$ 4.820
            </span>
          </div>
        </div>

        {/* Scan Results */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-[#161d1d] dark:text-white">
            Resultados da Varredura Preventiva:
          </span>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-600 mt-0.5 text-[20px]">
                report
              </span>
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">
                  Guia #99281 (Implante Dentário #24)
                </span>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  Operadora Unimed Odonto exige radiografia pós-operatória vinculada. Arquivo
                  encontrado no prontuário digital pronto para auto-anexo.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resolveGlosa('tiss-g-1');
                addToast('Radiografia periapical vinculada à Guia #99281!', 'success');
              }}
              className="h-8 px-3 rounded-full bg-amber-600 text-white font-bold text-[11px] whitespace-nowrap hover:bg-amber-700"
            >
              Auto-Vincular
            </button>
          </div>

          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-800 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-600 mt-0.5 text-[20px]">
                cancel
              </span>
              <div>
                <span className="font-bold text-red-900 dark:text-red-200 block">
                  Guia #98940 (Clareamento Laser - Vanessa Prado)
                </span>
                <p className="text-red-800 dark:text-red-300 mt-0.5">
                  Procedimento estético não coberto pelo Bradesco Essencial Top (Código 1302).
                  Converter em recibo particular.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                convertToPrivate('tiss-g-4');
                addToast('Guia #98940 convertida para particular com fatura PIX gerada!', 'info');
              }}
              className="h-8 px-3 rounded-full bg-[#005051] text-white font-bold text-[11px] whitespace-nowrap hover:bg-[#006a6b]"
            >
              Converter
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#dde4e3] dark:border-[#263131]">
          <span className="text-[11px] text-[#6e7979]">
            Assinatura Digital ICP-Brasil: <strong>Dr. Rodrigo Albuquerque</strong>
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleRunAiAudit}
              disabled={scanning}
              className="h-10 px-4 rounded-full bg-[#e8efee] dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] text-xs font-bold hover:bg-[#dde4e3] flex items-center gap-1.5"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${scanning ? 'animate-spin' : ''}`}
              >
                sync
              </span>
              <span>{scanning ? 'Auditando...' : 'Reescanear Base'}</span>
            </button>

            <button
              onClick={handleFixAll}
              className="h-10 px-5 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white text-xs font-bold shadow-md"
            >
              Corrigir & Liberar Todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
