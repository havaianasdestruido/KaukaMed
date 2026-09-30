import React from 'react';

import { useApp } from '../../context/AppContext';

interface DemoNoticeProps {
  /** Nome da funcionalidade (ex.: "Faturamento TISS"). */
  feature: string;
  /** Texto que substitui a explicação padrão (quando parte da tela já usa dados reais). */
  detail?: string;
  className?: string;
}

/**
 * Aviso de tela ilustrativa.
 *
 * Várias telas do protótipo (faturamento, salas, odontograma…) ainda usam dados
 * de exemplo. Com o banco real conectado, isso precisa ficar claro para quem usa
 * — senão números inventados parecem dados da clínica. No modo demonstração
 * (sem Supabase) tudo é exemplo, então o aviso não aparece.
 */
export const DemoNotice: React.FC<DemoNoticeProps> = ({ feature, detail, className = '' }) => {
  const { dataSource } = useApp();
  if (dataSource !== 'supabase') return null;

  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-2xl border border-[#f0d98a] bg-[#fff8dc] p-4 text-xs text-[#6b5200] dark:border-[#5a4a10] dark:bg-[#2b2508] dark:text-[#f3dd8a] ${className}`}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
        science
      </span>
      <div>
        <p className="font-bold">Tela ilustrativa — {feature}</p>
        <p className="mt-0.5 leading-relaxed">
          {detail ?? (
            <>
              Os números e registros abaixo são <strong>dados de exemplo</strong>: esta área ainda
              não está ligada ao banco de dados.
            </>
          )}{' '}
          Isso faz parte do que falta entregar (veja o backlog em <code>docs/ENTREGA-V1.md</code>).
          Login, cadastro, agendamento e a lista de consultas já funcionam com dados reais.
        </p>
      </div>
    </div>
  );
};
