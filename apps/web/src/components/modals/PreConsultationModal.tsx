import React from 'react';
import { useApp } from '../../context/AppContext';

export const PreConsultationModal: React.FC = () => {
  const { showPreConsultationModal, setShowPreConsultationModal, addToast } = useApp();

  if (!showPreConsultationModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141b1b] border border-[#dde4e3] dark:border-[#263131] rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dde4e3] dark:border-[#263131]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1]">
              <span className="material-symbols-outlined text-[22px]">info</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                Orientações Pré-Consulta
              </h2>
              <p className="text-xs text-[#6e7979]">
                Protocolo de biossegurança e acolhimento OdontoAura
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPreConsultationModal(false)}
            className="w-8 h-8 rounded-full hover:bg-[#e8efee] dark:hover:bg-[#202929] flex items-center justify-center text-[#6e7979]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-3 text-xs text-[#3e4949] dark:text-[#bec9c8]">
          <div className="p-3 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5">
              dentistry
            </span>
            <div>
              <span className="font-bold text-[#161d1d] dark:text-white block">
                Higiene Bucal Prévia
              </span>
              <p className="mt-0.5 leading-relaxed">
                Recomendamos escovação cuidadosa e uso do fio dental cerca de 30 minutos antes do
                atendimento.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5">
              medical_services
            </span>
            <div>
              <span className="font-bold text-[#161d1d] dark:text-white block">
                Aparelhos & Alinhadores
              </span>
              <p className="mt-0.5 leading-relaxed">
                Traga seu estojo protetor, o par atual de alinhadores invisíveis e os elásticos
                intermaxilares em uso.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5">
              badge
            </span>
            <div>
              <span className="font-bold text-[#161d1d] dark:text-white block">
                Documento & Carteirinha
              </span>
              <p className="mt-0.5 leading-relaxed">
                Apresente documento oficial com foto e a carteirinha do convênio (disponível
                digitalmente no aplicativo).
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px] mt-0.5">
              local_parking
            </span>
            <div>
              <span className="font-bold text-[#161d1d] dark:text-white block">
                Estacionamento com Valet Cortesia
              </span>
              <p className="mt-0.5 leading-relaxed">
                Unidade Jardins dispõe de serviço de manobrista gratuito por até 2 horas na Av.
                Paulista, 1578.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dde4e3] dark:border-[#263131]">
          <button
            onClick={() => {
              setShowPreConsultationModal(false);
              addToast('Orientações salvas e enviadas para o seu WhatsApp.', 'success');
            }}
            className="h-10 px-5 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-all shadow-md"
          >
            Entendido, estou pronto
          </button>
        </div>
      </div>
    </div>
  );
};
