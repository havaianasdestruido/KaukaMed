import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';
import { useDialogFocus } from './useDialogFocus';

export const RayXModal: React.FC = () => {
  const { showRayXModal, setShowRayXModal, addToast } = useApp();
  const dialogRef = useDialogFocus(showRayXModal, () => setShowRayXModal(false));

  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInverted, setIsInverted] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [activeCalipers, setActiveCalipers] = useState(false);

  if (!showRayXModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ray-x-title"
        tabIndex={-1}
        className="bg-[#141b1b] border border-neutral-800 text-white rounded-3xl max-w-5xl w-full h-[90vh] max-h-[800px] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-[#1a2222] border-b border-neutral-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005051] flex items-center justify-center text-[#a0f0f1]">
              <span className="material-symbols-outlined text-[24px]">radiology</span>
            </div>
            <div>
              <h2 id="ray-x-title" className="text-base font-bold text-white">
                Visualizador Radiológico OdontoAura PACS
              </h2>
              <p className="text-xs text-neutral-400">
                Exame demonstrativo #RX-88412 • Dados clínicos fictícios, sem vínculo com o paciente
                conectado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewer Adjustments */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-neutral-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-800 text-neutral-300"
                title="Reduzir Zoom"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              </button>
              <span className="text-xs font-mono px-2 text-neutral-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.5))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-800 text-neutral-300"
                title="Aumentar Zoom"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>

              <div className="h-4 w-px bg-neutral-700 mx-1"></div>

              <button
                onClick={() => setIsInverted(!isInverted)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isInverted
                    ? 'bg-[#a0f0f1] text-[#002020]'
                    : 'hover:bg-neutral-800 text-neutral-300'
                }`}
                title="Inverter Contraste Negativo"
              >
                <span className="material-symbols-outlined text-[18px]">contrast</span>
              </button>

              <button
                onClick={() => setActiveCalipers(!activeCalipers)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  activeCalipers
                    ? 'bg-[#a0f0f1] text-[#002020]'
                    : 'hover:bg-neutral-800 text-neutral-300'
                }`}
                title="Compasso de Medição Milimétrica"
              >
                <span className="material-symbols-outlined text-[18px]">straighten</span>
              </button>
            </div>

            <button
              onClick={() => {
                addToast('Arquivo DICOM de alta resolução baixado.', 'success');
              }}
              className="h-9 px-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>DICOM</span>
            </button>

            <button
              onClick={() => setShowRayXModal(false)}
              type="button"
              aria-label="Fechar visualizador radiológico"
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas Area */}
        <div className="flex-1 bg-black overflow-hidden relative flex items-center justify-center p-4">
          <div
            className="transition-transform duration-150 ease-out cursor-grab active:cursor-grabbing max-w-full max-h-full"
            style={{
              transform: `scale(${zoomLevel})`,
              filter: `${isInverted ? 'invert(1)' : ''} brightness(${brightness}%)`,
            }}
          >
            <img
              src={ASSETS.panoramicXray}
              alt="Radiografia Panorâmica em Alta Resolução"
              className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Metric Calipers Overlay */}
          {activeCalipers && (
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-neutral-700 text-xs text-neutral-300 flex flex-col gap-1 pointer-events-none">
              <span className="font-bold text-[#a0f0f1] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">straighten</span>
                Medição de Calibre Ósseo Ativa
              </span>
              <span>
                Distância alveolar elemento #14 a #15: <strong>8.4 mm</strong>
              </span>
              <span>
                Espaço intra-radicular elemento #24: <strong>7.1 mm</strong>
              </span>
            </div>
          )}
        </div>

        {/* Bottom Medical Diagnostic Notes */}
        <div className="px-6 py-3 bg-[#1a2222] border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-neutral-300">
            <span>
              <strong>Laudo:</strong> Estruturas ósseas preservadas, ausência de lesões periapicais
              nos molares.
            </span>
            <span className="text-[#a0f0f1] font-semibold">
              Assinado: Dr. Rodrigo Albuquerque (CRO/SP 72.190)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400">Brilho:</span>
            <input
              type="range"
              min={60}
              max={160}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-24 accent-[#005051]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
