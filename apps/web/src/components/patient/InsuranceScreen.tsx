import React from 'react';

import { useApp } from '../../context/AppContext';
import { formatDate, todayKey } from '../../lib/clinicTime';
import { type PatientInsurance } from '../../types';

const STATUS_LABEL: Record<PatientInsurance['status'], { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-[#B2F1B8] text-[#002107]' },
  SUSPENDED: { label: 'Suspenso', className: 'bg-[#fff0c2] text-[#6b5200]' },
  EXPIRED: { label: 'Vencido', className: 'bg-[#ffdad6] text-[#93000a]' },
};

/** Meu Convênio (paciente): carteirinhas cadastradas pela clínica. */
export const InsuranceScreen: React.FC = () => {
  const { currentUser, myInsurances, setScreen, setBookingSpecialty } = useApp();
  const today = todayKey();

  const isUsable = (plan: PatientInsurance) =>
    plan.status === 'ACTIVE' && (!plan.validUntil || plan.validUntil >= today);
  const main = myInsurances.find(isUsable) ?? myInsurances[0];
  const others = myInsurances.filter((p) => p.id !== main?.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#161d1d] sm:text-3xl dark:text-white">
            Meu Convênio
          </h1>
          <p className="mt-1 text-xs text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
            Convênios cadastrados pela clínica no seu perfil. A cobertura de cada procedimento é
            confirmada com a operadora no atendimento.
          </p>
        </div>

        <button
          onClick={() => {
            setBookingSpecialty(null);
            setScreen('agendar');
          }}
          className="h-10 rounded-full bg-[#005051] px-5 text-xs font-bold text-white transition-colors hover:bg-[#006a6b]"
        >
          Agendar consulta
        </button>
      </div>

      {main ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-6">
            <div
              className={`relative flex aspect-[1.58/1] w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br p-6 text-white shadow-2xl ${
                isUsable(main)
                  ? 'from-[#005051] via-[#006a6b] to-[#003839]'
                  : 'from-[#5a6363] via-[#6e7979] to-[#3e4949]'
              }`}
            >
              <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-[#a0f0f1]/20 blur-2xl"></div>

              <div className="z-10 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0f0f1]">
                    Carteirinha
                  </span>
                  <span className="text-xl font-bold tracking-tight">{main.insuranceName}</span>
                </div>
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[28px] text-[#a0f0f1]"
                >
                  contactless
                </span>
              </div>

              <div className="z-10 my-2">
                <span className="mb-0.5 block text-[10px] font-bold text-[#a0f0f1]">
                  NÚMERO DA CARTEIRINHA
                </span>
                <span className="font-mono text-base font-bold tracking-wider sm:text-lg">
                  {main.cardNumber}
                </span>
              </div>

              <div className="z-10 flex items-end justify-between text-xs">
                <div>
                  <span className="block text-[9px] text-[#a0f0f1]">BENEFICIÁRIO</span>
                  <span className="font-bold uppercase">{currentUser.name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] text-[#a0f0f1]">VALIDADE</span>
                  <span className="font-bold">
                    {main.validUntil ? formatDate(`${main.validUntil}T12:00:00Z`) : 'Sem prazo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-[#dde4e3]/60 bg-white p-6 shadow-sm md:col-span-6 dark:border-[#263131] dark:bg-[#1a2222]">
            <div className="flex items-center gap-2 border-b border-[#dde4e3]/60 pb-2 dark:border-[#263131]">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[22px] text-[#005051] dark:text-[#84d4d4]"
              >
                verified_user
              </span>
              <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">Situação</h2>
              <span
                className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_LABEL[main.status].className}`}
              >
                {STATUS_LABEL[main.status].label}
              </span>
            </div>

            <ul className="flex flex-col gap-2 text-xs text-[#3e4949] dark:text-[#bec9c8]">
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]"
                >
                  {isUsable(main) ? 'check_circle' : 'error'}
                </span>
                <span>
                  {isUsable(main)
                    ? 'Este convênio pode ser escolhido ao agendar uma consulta.'
                    : 'Este convênio não pode ser usado para agendar (suspenso ou vencido). Fale com a recepção.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]"
                >
                  info
                </span>
                <span>
                  Cobertura, carência e coparticipação são confirmadas pela clínica junto à
                  operadora. Este app ainda não consulta a elegibilidade online.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]"
                >
                  edit_note
                </span>
                <span>
                  Para incluir ou atualizar uma carteirinha, apresente-a na recepção da clínica.
                </span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#dde4e3]/60 bg-white p-10 text-center shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
          <span
            aria-hidden="true"
            className="material-symbols-outlined mb-2 text-[40px] text-[#6e7979]"
          >
            credit_card_off
          </span>
          <h2 className="text-base font-bold text-[#161d1d] dark:text-white">
            Nenhum convênio cadastrado
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#3e4949] dark:text-[#bec9c8]">
            Seus atendimentos serão <strong>particulares</strong>. Se você tem plano odontológico,
            leve a carteirinha à recepção para cadastrá-la no seu perfil.
          </p>
        </div>
      )}

      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-[#161d1d] dark:text-white">Outros convênios</h2>
          {others.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#dde4e3]/60 bg-white p-4 text-xs shadow-sm dark:border-[#263131] dark:bg-[#1a2222]"
            >
              <div>
                <p className="font-bold text-[#161d1d] dark:text-white">{plan.insuranceName}</p>
                <p className="font-mono text-[11px] text-[#6e7979]">{plan.cardNumber}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_LABEL[plan.status].className}`}
              >
                {STATUS_LABEL[plan.status].label}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
