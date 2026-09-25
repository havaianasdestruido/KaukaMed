import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const InsuranceScreen: React.FC = () => {
  const { currentUser, addToast, setScreen } = useApp();
  const [cardNumber, setCardNumber] = useState(currentUser.planNumber || '0048.9123.8821-00');
  const [operator, setOperator] = useState('unimed');

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Elegibilidade verificada em tempo real via WebService ANS: 100% Coberto sem carência!',
      'success',
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white tracking-tight font-bold">
            Meu Convênio & Cobertura Odontológica
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
            Validação instantânea de elegibilidade, carteirinha digital e tabela de coparticipação.
          </p>
        </div>

        <button
          onClick={() => setScreen('agendar')}
          className="h-10 px-5 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-colors"
        >
          Agendar com Convênio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Virtual Card Preview (Left 6 cols) */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="relative w-full aspect-[1.58/1] rounded-3xl p-6 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#005051] via-[#006a6b] to-[#003839] border border-white/20 flex flex-col justify-between">
            <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-[#a0f0f1]/20 blur-2xl pointer-events-none"></div>

            <div className="flex items-start justify-between z-10">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#a0f0f1]">
                  Carteirinha Digital
                </span>
                <span className="text-xl font-bold tracking-tight">Unimed Odonto</span>
              </div>
              <span className="material-symbols-outlined text-[28px] text-[#a0f0f1]">
                contactless
              </span>
            </div>

            <div className="z-10 my-2">
              <span className="text-[10px] text-[#a0f0f1] font-bold block mb-0.5">
                NÚMERO DA CARTEIRINHA
              </span>
              <span className="text-base sm:text-lg font-mono tracking-wider font-bold">
                {cardNumber}
              </span>
            </div>

            <div className="flex items-end justify-between z-10 text-xs">
              <div>
                <span className="text-[9px] text-[#a0f0f1] block">BENEFICIÁRIO</span>
                <span className="font-bold uppercase">{currentUser.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#a0f0f1] block">PLANO</span>
                <span className="font-bold">Master Gold</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                addToast(
                  'Carteirinha digital salva na sua Apple Wallet / Google Wallet.',
                  'success',
                )
              }
              className="flex-1 h-10 rounded-full bg-[#eef5f4] dark:bg-[#1a2222] hover:bg-[#e2eae9] text-[#161d1d] dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#dde4e3] dark:border-[#263131]"
            >
              <span className="material-symbols-outlined text-[18px]">wallet</span>
              <span>Salvar na Carteira Digital</span>
            </button>
            <button
              onClick={() => addToast('QR Code de autorização gerado para a recepção.', 'info')}
              className="h-10 px-4 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-xs font-bold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code</span>
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Live Validation Form (Right 6 cols) */}
        <div className="md:col-span-6 bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#dde4e3]/60 dark:border-[#263131]">
              <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[22px]">
                verified
              </span>
              <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">
                Validar Elegibilidade do Convênio
              </h2>
            </div>

            <form onSubmit={handleValidate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                  Operadora
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-xs font-semibold text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none"
                >
                  <option value="unimed">Unimed Odonto (Master Gold)</option>
                  <option value="amil">Amil Dental (Dental 200)</option>
                  <option value="bradesco">Bradesco Dental (Essencial Top)</option>
                  <option value="sulamerica">SulAmérica Odonto</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                  Número da Matrícula
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-xs font-mono font-semibold text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#B2F1B8]/40 border border-[#B2F1B8] text-xs text-[#002107] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#2E6C38]">
                  check_circle
                </span>
                <span>Cobertura ativa para consultas, profilaxia, ortodontia e restaurações.</span>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                <span>Revalidar com Operadora</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
