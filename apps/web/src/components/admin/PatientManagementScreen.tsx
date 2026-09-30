import React, { useEffect, useState } from 'react';

import { useApp } from '../../context/AppContext';
import { formatDate, formatDateTime } from '../../lib/clinicTime';
import { initialsAvatar } from '../../lib/avatar';
import { maskCpf } from '../../lib/cpf';
import { toErrorMessage } from '../../lib/supabase';
import { type PatientSummary } from '../../types';

/**
 * Pacientes (recepção, administrador e dentista).
 *
 * A recepção vê todos os pacientes; o dentista, só os que já agendaram com ele —
 * regra aplicada pelo banco em `list_patients`. O prontuário clínico ainda não
 * está ligado ao banco (veja o backlog em docs/ENTREGA-V1.md).
 */
export const PatientManagementScreen: React.FC = () => {
  const { currentUser, gateway, setScreen, setBookingPatient, setBookingSpecialty, dataVersion } =
    useApp();
  const canBook = currentUser.role === 'funcionario' || currentUser.role === 'administrador';

  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    gateway
      .listPatients(debounced)
      .then((list) => {
        if (!cancelled) setPatients(list);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e, 'Não foi possível carregar os pacientes.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, debounced, dataVersion, reloadToken]);

  const book = (patient: PatientSummary) => {
    setBookingSpecialty(null);
    setBookingPatient(patient);
    setScreen('agendar');
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#161d1d] sm:text-3xl dark:text-white">
          {currentUser.role === 'dentista' ? 'Meus Pacientes' : 'Pacientes'}
        </h1>
        <p className="mt-1 text-xs text-[#3e4949] sm:text-sm dark:text-[#bec9c8]">
          {currentUser.role === 'dentista'
            ? 'Pacientes que já agendaram consulta com você.'
            : 'Pacientes cadastrados, convênio e histórico de consultas.'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#dde4e3]/60 bg-white p-4 shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
        <div className="relative w-full max-w-md">
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6e7979]"
          >
            search
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF ou e-mail…"
            aria-label="Buscar pacientes"
            className="w-full rounded-xl border border-[#dde4e3] bg-[#eef5f4] py-2 pr-4 pl-9 text-xs text-[#161d1d] outline-none placeholder:text-[#6e7979] focus:ring-2 focus:ring-[#005051] dark:border-[#2d3838] dark:bg-[#202929] dark:text-white"
          />
        </div>
        <span className="shrink-0 text-xs text-[#6e7979]">
          {loading
            ? 'Buscando…'
            : `${patients.length} ${patients.length === 1 ? 'paciente' : 'pacientes'}`}
        </span>
      </div>

      {error ? (
        <div className="flex flex-col items-start gap-2 rounded-2xl bg-[#ffdad6]/60 p-5 text-xs text-[#93000a]">
          <span className="font-bold">Não foi possível carregar os pacientes.</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#dde4e3]/60 bg-white shadow-sm dark:border-[#263131] dark:bg-[#1a2222]">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#eef5f4] text-[11px] uppercase tracking-wider text-[#6e7979] dark:bg-[#202929]">
              <tr>
                <th className="px-5 py-3 font-bold">Paciente & CPF</th>
                <th className="px-4 py-3 font-bold">Contato</th>
                <th className="px-4 py-3 font-bold">Convênio</th>
                <th className="px-4 py-3 font-bold">Consultas</th>
                <th className="px-4 py-3 font-bold">Última / próxima</th>
                {canBook && <th className="px-5 py-3 text-right font-bold">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e3]/60 text-xs text-[#161d1d] dark:divide-[#263131] dark:text-white">
              {patients.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-[#f4fbfa] dark:hover:bg-[#202929]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={initialsAvatar(p.name)}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <span className="block font-bold">{p.name}</span>
                        <span className="font-mono text-[11px] text-[#6e7979]">
                          {maskCpf(p.cpf)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#3e4949] dark:text-[#bec9c8]">
                    <span className="block">{p.phone ?? '—'}</span>
                    <span className="block text-[11px] text-[#6e7979]">{p.email ?? ''}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.insuranceName ?? 'Particular'}</td>
                  <td className="px-4 py-3">{p.appointmentsCount}</td>
                  <td className="px-4 py-3 text-[#6e7979]">
                    <span className="block">
                      Última: {p.lastVisit ? formatDate(p.lastVisit) : '—'}
                    </span>
                    <span className="block">
                      Próxima: {p.nextVisit ? formatDateTime(p.nextVisit) : '—'}
                    </span>
                  </td>
                  {canBook && (
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => book(p)}
                        type="button"
                        className="inline-flex h-8 items-center gap-1 rounded-full bg-[#005051] px-3 text-xs font-bold text-white transition-colors hover:bg-[#006a6b]"
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                          add_task
                        </span>
                        <span>Agendar</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr>
                  <td colSpan={canBook ? 6 : 5} className="px-5 py-10 text-center text-[#6e7979]">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
