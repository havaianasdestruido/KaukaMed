import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';

export const PatientManagementScreen: React.FC = () => {
  const { setScreen, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const mockPatients = [
    {
      id: 'p-1',
      name: 'Camila Santos',
      cpf: '***.412.339-00',
      plan: 'Unimed Odonto Master Gold',
      lastVisit: '24 Out 2024',
      status: 'Em Tratamento (Ortodontia)',
      avatar: ASSETS.drMariana,
    },
    {
      id: 'p-2',
      name: 'Jorge Mendes',
      cpf: '***.123.882-00',
      plan: 'Unimed Odonto',
      lastVisit: '18 Out 2024',
      status: 'Pós-Cirúrgico (Implante)',
      avatar: ASSETS.drMarcelo,
    },
    {
      id: 'p-3',
      name: 'Lucas Ferraz',
      cpf: '***.028.114-01',
      plan: 'Amil Dental 200',
      lastVisit: '14 Out 2024',
      status: 'Prevenção (Kids)',
      avatar: ASSETS.draHelena,
    },
    {
      id: 'p-4',
      name: 'Vanessa Prado',
      cpf: '***.301.992-00',
      plan: 'Bradesco Dental',
      lastVisit: '11 Out 2024',
      status: 'Estética / Clareamento',
      avatar: ASSETS.draRenata,
    },
    {
      id: 'p-5',
      name: 'Eduardo Silveira',
      cpf: '***.774.219-00',
      plan: 'Particular',
      lastVisit: '05 Out 2024',
      status: 'Endodontia Molar #36',
      avatar: ASSETS.drFelipe,
    },
  ];

  const filtered = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white tracking-tight font-bold">
            Gestão de Pacientes & Prontuários
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
            Acesso centralizado a prontuários eletrônicos, termos de consentimento e históricos
            clínicos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen('prontuario')}
            className="h-10 px-4 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-colors"
          >
            Abrir Odontograma
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2222] rounded-2xl p-4 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7979] text-[18px]">
            search
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do paciente, CPF ou convênio..."
            className="w-full bg-[#eef5f4] dark:bg-[#202929] text-[#161d1d] dark:text-white placeholder:text-[#6e7979] pl-9 pr-4 py-2 rounded-xl text-xs outline-none border border-[#dde4e3] dark:border-[#2d3838]"
          />
        </div>
        <span className="text-xs text-[#6e7979]">{filtered.length} pacientes ativos</span>
      </div>

      <div className="bg-white dark:bg-[#1a2222] rounded-2xl shadow-sm overflow-hidden border border-[#dde4e3]/60 dark:border-[#263131]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#eef5f4] dark:bg-[#202929] text-[#6e7979] text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5 font-bold">Paciente & CPF</th>
              <th className="py-3 px-4 font-bold">Convênio / Plano</th>
              <th className="py-3 px-4 font-bold">Última Consulta</th>
              <th className="py-3 px-4 font-bold">Status Clínico</th>
              <th className="py-3 px-5 text-right font-bold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dde4e3]/60 dark:divide-[#263131] text-xs text-[#161d1d] dark:text-white">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-[#f4fbfa] dark:hover:bg-[#202929] transition-colors"
              >
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold block">{p.name}</span>
                      <span className="text-[11px] text-[#6e7979] font-mono">{p.cpf}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold">{p.plan}</span>
                </td>
                <td className="py-3 px-4 text-[#6e7979]">{p.lastVisit}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-semibold text-[11px]">
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-5 text-right">
                  <button
                    onClick={() => {
                      setScreen('prontuario');
                      addToast(`Prontuário de ${p.name} carregado.`, 'info');
                    }}
                    className="h-8 px-3 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-colors inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    <span>Prontuário</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
