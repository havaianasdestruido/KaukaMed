import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';
import { type Doctor } from '../../types';

export const NewDoctorModal: React.FC = () => {
  const { showNewDoctorModal, setShowNewDoctorModal, addNewDoctor } = useApp();

  const [name, setName] = useState('');
  const [cro, setCro] = useState('CRO/SP ');
  const [specialty, setSpecialty] = useState('Ortodontia & Alinhadores');
  const [contractType, setContractType] = useState('Contrato PJ');
  const [schedule, setSchedule] = useState('Seg a Sex');
  const [room, setRoom] = useState('Consultório 04');
  const [commission, setCommission] = useState(45);

  if (!showNewDoctorModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name: name.startsWith('Dr.') || name.startsWith('Dra.') ? name : `Dr. ${name}`,
      cro: cro.trim() || 'CRO/SP 120.450',
      specialties: [specialty],
      contractType,
      schedule,
      room,
      appointmentsCount: 0,
      commissionPercentage: Number(commission),
      monthlyRevenue: 0,
      npsScore: 5.0,
      npsPercentage: 100,
      status: 'Ativo',
      avatar: ASSETS.drFelipe,
      isCertified: true,
    };

    addNewDoctor(newDoc);
    setShowNewDoctorModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141b1b] border border-[#dde4e3] dark:border-[#263131] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#dde4e3] dark:border-[#263131]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#cce8e7] dark:bg-[#324b4b] text-[#005051] dark:text-[#a0f0f1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                Cadastrar Novo Profissional Clínico
              </h2>
              <p className="text-xs text-[#6e7979]">
                Validação automática junto ao Conselho Federal de Odontologia
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewDoctorModal(false)}
            className="w-8 h-8 rounded-full hover:bg-[#e8efee] dark:hover:bg-[#202929] flex items-center justify-center text-[#6e7979]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Dra. Juliana Neves"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none focus:ring-2 focus:ring-[#005051]"
              />
            </div>

            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Registro CRO
              </label>
              <input
                type="text"
                required
                placeholder="CRO/SP 000.000"
                value={cro}
                onChange={(e) => setCro(e.target.value)}
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white font-mono border border-[#dde4e3] dark:border-[#2d3838] outline-none focus:ring-2 focus:ring-[#005051]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Especialidade Principal
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none"
              >
                <option value="Ortodontia & Alinhadores">Ortodontia & Alinhadores</option>
                <option value="Implantodontia & Bucomaxilo">Implantodontia & Bucomaxilo</option>
                <option value="Odontopediatria & Hebiatria">Odontopediatria & Hebiatria</option>
                <option value="Dentística & Harmonização">Dentística & Harmonização</option>
                <option value="Endodontia Microscópica">Endodontia Microscópica</option>
                <option value="Clínica Geral & Urgências">Clínica Geral & Urgências</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Regime Contratual
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none"
              >
                <option value="Contrato PJ">Contrato PJ</option>
                <option value="PJ - Sócio Clínico">PJ - Sócio Clínico</option>
                <option value="CLT Dedicado">CLT Dedicado</option>
                <option value="Plantonista 24h">Plantonista 24h</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Escala de Atendimento
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Ex: Seg, Qua, Sex"
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Consultório / Sala
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ex: Consultório 04"
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white border border-[#dde4e3] dark:border-[#2d3838] outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-[#3e4949] dark:text-[#bec9c8] block mb-1">
                Comissão Repasse (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full h-11 px-3 bg-[#eef5f4] dark:bg-[#202929] rounded-xl text-[#161d1d] dark:text-white font-mono border border-[#dde4e3] dark:border-[#2d3838] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dde4e3] dark:border-[#263131]">
            <button
              type="button"
              onClick={() => setShowNewDoctorModal(false)}
              className="h-10 px-4 rounded-full bg-[#eef5f4] dark:bg-[#202929] text-[#3e4949] dark:text-[#bec9c8] font-semibold hover:bg-[#dde4e3]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-6 rounded-full bg-[#005051] hover:bg-[#006a6b] text-white font-bold shadow-md"
            >
              Concluir Credenciamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
