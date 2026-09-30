import React from 'react';
import { useApp } from '../../context/AppContext';

export const RoomsManagementScreen: React.FC = () => {
  const { rooms, addToast } = useApp();

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white tracking-tight font-bold">
            Salas Cirúrgicas, Consultórios & Equipamentos
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
            Gestão de leitos operatórios, autoclaves, microscópios cirúrgicos e manutenção
            preventiva.
          </p>
        </div>

        <button
          onClick={() =>
            addToast('Comando de higienização enviado para a equipe de CME.', 'success')
          }
          className="h-10 px-5 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-colors"
        >
          Solicitar Higienização Geral
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-[#1a2222] p-5 rounded-3xl shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#005051] dark:text-[#84d4d4] uppercase">
                  {r.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-[10px] font-bold">
                  {r.statusLabel}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white">{r.specialty}</h3>
              <p className="text-xs text-[#6e7979] mt-1">
                {r.doctorName
                  ? `Profissional: ${r.doctorName}`
                  : r.technicianInfo || 'Disponível para agendamento'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#eef5f4] dark:bg-[#202929] text-xs">
              <div className="flex justify-between items-center text-[#6e7979]">
                <span>Status da Cadeira:</span>
                <span className="font-bold text-[#161d1d] dark:text-white">Pressão & Ar Ok</span>
              </div>
              <div className="flex justify-between items-center text-[#6e7979] mt-1">
                <span>Esterilização Autoclave:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Ciclo 134°C Válido
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addToast(`Checklist operacional do ${r.name} concluído.`, 'success')}
                className="flex-1 py-2 rounded-xl bg-[#eef5f4] dark:bg-[#202929] hover:bg-[#dde4e3] text-xs font-bold text-[#005051] dark:text-[#84d4d4]"
              >
                Inspecionar Equipamento
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
