import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';
import { type ToothRecord } from '../../types';

export const MedicalRecordOdontogram: React.FC = () => {
  const { odontogram, selectedTooth, setSelectedTooth, setShowRayXModal, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'odontograma' | 'exames' | 'receitas'>('odontograma');

  const upperRight = odontogram.filter((t) => t.number >= 11 && t.number <= 18).reverse();
  const upperLeft = odontogram.filter((t) => t.number >= 21 && t.number <= 28);
  const lowerRight = odontogram.filter((t) => t.number >= 41 && t.number <= 48).reverse();
  const lowerLeft = odontogram.filter((t) => t.number >= 31 && t.number <= 38);

  const getToothColor = (condition: ToothRecord['condition']) => {
    switch (condition) {
      case 'healthy':
        return 'bg-[#e8efee] dark:bg-[#202929] border-[#dde4e3] dark:border-[#2d3838] text-[#161d1d] dark:text-white';
      case 'restoration':
        return 'bg-[#cce8e7] dark:bg-[#324b4b] border-[#84d4d4] text-[#005051] dark:text-[#a0f0f1]';
      case 'endodontics':
        return 'bg-[#d2e4ff] dark:bg-[#1e293b] border-[#4b607c] text-[#334863] dark:text-[#d2e4ff]';
      case 'implant':
        return 'bg-[#ffdad6] dark:bg-[#410002] border-[#ba1a1a] text-[#ba1a1a] dark:text-[#ffdad6]';
      case 'orthodontics':
        return 'bg-[#a0f0f1] dark:bg-[#004f50] border-[#005051] text-[#002020] dark:text-[#a0f0f1]';
      case 'cavity':
        return 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-[#161d1d] dark:text-white tracking-tight font-bold">
            Prontuário & Odontograma Digital
          </h1>
          <p className="text-xs sm:text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
            Mapeamento da arcada dentária (padrão FDI), histórico clínico e exames de imagem
            radiográfica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRayXModal(true)}
            className="h-10 px-4 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">radiology</span>
            <span>Ver Raio-X Digital</span>
          </button>
          <button
            onClick={() =>
              addToast('Prontuário completo exportado em PDF certificado ICP-Brasil.', 'success')
            }
            className="h-10 px-4 rounded-full bg-white dark:bg-[#1a2222] text-[#3e4949] dark:text-[#bec9c8] text-xs font-semibold hover:bg-[#e8efee] transition-colors flex items-center gap-1.5 border border-[#dde4e3] dark:border-[#263131]"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#eef5f4] dark:bg-[#1a2222] p-1.5 rounded-2xl w-fit border border-[#dde4e3]/60 dark:border-[#263131]">
        <button
          onClick={() => setActiveTab('odontograma')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'odontograma'
              ? 'bg-[#005051] text-white shadow-sm'
              : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9]'
          }`}
        >
          Odontograma Interativo
        </button>
        <button
          onClick={() => setActiveTab('exames')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'exames'
              ? 'bg-[#005051] text-white shadow-sm'
              : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9]'
          }`}
        >
          Radiografias & Imagens
        </button>
        <button
          onClick={() => setActiveTab('receitas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'receitas'
              ? 'bg-[#005051] text-white shadow-sm'
              : 'text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9]'
          }`}
        >
          Receituário & Atestados
        </button>
      </div>

      {activeTab === 'odontograma' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Tooth Map */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dde4e3]/50 dark:border-[#263131] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
                  Arcada Dentária do Paciente
                </h2>
                <span className="text-xs text-[#6e7979]">
                  Clique sobre qualquer dente para inspecionar condições clínicas
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#6e7979]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a0f0f1]"></span> Ortodontia
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#cce8e7]"></span> Restauração
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffdad6]"></span> Implante
                </span>
              </div>
            </div>

            {/* Upper Jaw (Arcada Superior) */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-[#6e7979] uppercase tracking-wider">
                Arcada Superior (Maxila)
              </span>
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-2">
                {upperRight.concat(upperLeft).map((t) => {
                  const isSelected = selectedTooth?.number === t.number;
                  return (
                    <button
                      key={t.number}
                      type="button"
                      onClick={() => setSelectedTooth(t)}
                      className={`w-10 h-14 sm:w-11 sm:h-16 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all border ${
                        isSelected
                          ? 'ring-2 ring-[#005051] dark:ring-[#84d4d4] scale-105 shadow-md ' +
                            getToothColor(t.condition)
                          : getToothColor(t.condition)
                      }`}
                    >
                      <span className="text-[10px] font-bold">{t.number}</span>
                      <span className="material-symbols-outlined text-[20px]">
                        {t.condition === 'implant'
                          ? 'anchor'
                          : t.condition === 'orthodontics'
                            ? 'grain'
                            : t.condition === 'endodontics'
                              ? 'cable'
                              : 'dentistry'}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full h-px bg-[#dde4e3] dark:bg-[#263131] my-1"></div>

            {/* Lower Jaw (Arcada Inferior) */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-2">
                {lowerRight.concat(lowerLeft).map((t) => {
                  const isSelected = selectedTooth?.number === t.number;
                  return (
                    <button
                      key={t.number}
                      type="button"
                      onClick={() => setSelectedTooth(t)}
                      className={`w-10 h-14 sm:w-11 sm:h-16 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all border ${
                        isSelected
                          ? 'ring-2 ring-[#005051] dark:ring-[#84d4d4] scale-105 shadow-md ' +
                            getToothColor(t.condition)
                          : getToothColor(t.condition)
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span className="material-symbols-outlined text-[20px]">
                        {t.condition === 'implant'
                          ? 'anchor'
                          : t.condition === 'orthodontics'
                            ? 'grain'
                            : t.condition === 'endodontics'
                              ? 'cable'
                              : 'dentistry'}
                      </span>
                      <span className="text-[10px] font-bold">{t.number}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-bold text-[#6e7979] uppercase tracking-wider">
                Arcada Inferior (Mandíbula)
              </span>
            </div>
          </div>

          {/* Right: Tooth Inspection Card */}
          <div className="lg:col-span-4 bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#dde4e3]/60 dark:border-[#263131] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[24px]">
                  dentistry
                </span>
                <h3 className="text-base font-bold text-[#161d1d] dark:text-white">
                  Detalhes do Dente #{selectedTooth?.number}
                </h3>
              </div>
              <span className="text-xs text-[#005051] dark:text-[#84d4d4] font-bold bg-[#cce8e7] dark:bg-[#324b4b] px-2.5 py-0.5 rounded-full">
                {selectedTooth?.number && selectedTooth.number > 30 ? 'Inferior' : 'Superior'}
              </span>
            </div>

            {selectedTooth && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl">
                  <span className="text-[10px] text-[#6e7979] uppercase font-bold">
                    Diagnóstico / Condição
                  </span>
                  <p className="text-sm font-bold text-[#161d1d] dark:text-white mt-0.5">
                    {selectedTooth.conditionLabel}
                  </p>
                </div>

                <div className="p-3 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl">
                  <span className="text-[10px] text-[#6e7979] uppercase font-bold">
                    Observações Clínicas
                  </span>
                  <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] mt-1 leading-relaxed">
                    {selectedTooth.notes ||
                      'Elemento dental hígido com boa resposta pulpar e tecidos periodontais saudáveis.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[#6e7979]">
                  <span>Última Intervenção:</span>
                  <span className="font-semibold text-[#161d1d] dark:text-white">
                    {selectedTooth.lastUpdated}
                  </span>
                </div>

                <button
                  onClick={() => setShowRayXModal(true)}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-bold text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">radiology</span>
                  <span>Ver Radiografia Desse Quadrante</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'exames' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white">
                Radiografia Panorâmica Digital
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                15 Ago 2024
              </span>
            </div>
            <div
              onClick={() => setShowRayXModal(true)}
              className="relative w-full h-52 bg-black rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img
                src={ASSETS.panoramicXray}
                alt="Panorâmica Digital"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                  <span className="text-xs font-semibold">Abrir Visualizador Radiológico</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#6e7979]">
              Tomografia Cone Beam 3D panorâmica de alta resolução com calibração métrica e laudo
              radiológico completo.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a2222] rounded-3xl p-6 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#161d1d] dark:text-white">
                Scanner 3D Intraoral
              </h3>
              <span className="text-[11px] font-bold text-[#005051] dark:text-[#84d4d4] bg-[#cce8e7] dark:bg-[#324b4b] px-2 py-0.5 rounded-full">
                24 Set 2024
              </span>
            </div>
            <div className="w-full h-52 bg-[#eef5f4] dark:bg-[#202929] rounded-2xl flex flex-col items-center justify-center p-4 border border-[#dde4e3] dark:border-[#2d3838]">
              <span className="material-symbols-outlined text-4xl text-[#005051] dark:text-[#84d4d4] mb-2">
                view_in_ar
              </span>
              <span className="text-sm font-bold text-[#161d1d] dark:text-white">
                Modelo Digital 3D das Arcadas
              </span>
              <span className="text-xs text-[#6e7979] mt-1">
                Formato STL / PLY pronto para alinhador ortodôntico
              </span>
            </div>
            <button
              onClick={() => addToast('Arquivo de malha 3D intraoral exportado.', 'success')}
              className="h-10 rounded-full bg-[#005051] text-white text-xs font-bold hover:bg-[#006a6b] transition-colors"
            >
              Baixar Modelo 3D (STL)
            </button>
          </div>
        </div>
      )}

      {activeTab === 'receitas' && (
        <div className="flex flex-col gap-4">
          {[
            {
              title: 'Prescrição de Medicamentos Pós-Procedimento',
              doc: 'Dr. Marcelo Arantes • CRO/SP 89.412',
              date: '24 Out 2024',
              items: 'Amoxicilina 500mg (8/8h por 7 dias), Ibuprofeno 600mg (12/12h por 3 dias)',
            },
            {
              title: 'Atestado de Comparecimento Odontológico',
              doc: 'Dra. Helena Gusmão • CRO/SP 102.840',
              date: '12 Set 2024',
              items: 'Atesto que Camila Santos esteve em consulta clínica das 10h às 11h',
            },
          ].map((rec, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1a2222] rounded-2xl p-5 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#161d1d] dark:text-white">{rec.title}</h4>
                  <p className="text-xs text-[#6e7979]">
                    {rec.doc} • {rec.date}
                  </p>
                  <p className="text-xs text-[#3e4949] dark:text-[#bec9c8] mt-1 italic">
                    {rec.items}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  addToast(
                    'Documento assinado digitalmente ICP-Brasil baixado com sucesso.',
                    'success',
                  )
                }
                className="h-9 px-4 rounded-full bg-[#005051] text-white text-xs font-semibold hover:bg-[#006a6b] transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Baixar PDF Assinado</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
