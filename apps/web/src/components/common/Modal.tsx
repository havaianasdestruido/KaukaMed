import React, { useEffect, useId } from 'react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Enquanto `true`, não fecha por ESC nem clicando fora (ex.: salvando). */
  busy?: boolean;
  size?: 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Janela modal simples (ESC e clique fora fecham), no visual do restante do app. */
export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  onClose,
  busy = false,
  size = 'md',
  children,
  footer,
}) => {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border border-[#dde4e3]/80 bg-white shadow-2xl dark:border-[#263131] dark:bg-[#141b1b] ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#dde4e3]/60 px-6 pt-5 pb-4 dark:border-[#263131]">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-[#161d1d] dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[#6e7979] dark:text-[#bec9c8]">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#3e4949] transition-colors hover:bg-[#eef5f4] disabled:opacity-50 dark:text-[#bec9c8] dark:hover:bg-[#202929]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#dde4e3]/60 px-6 py-4 dark:border-[#263131]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
