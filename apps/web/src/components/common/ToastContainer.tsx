import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0 ${
            toast.type === 'error'
              ? 'bg-[#ba1a1a] text-white'
              : toast.type === 'info'
                ? 'bg-[#006a6b] text-white'
                : 'bg-[#005051] text-white'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px]">
              {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <span className="text-sm font-medium leading-snug">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            aria-label="Fechar notificação"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
