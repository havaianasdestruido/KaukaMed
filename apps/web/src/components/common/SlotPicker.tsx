import React, { useCallback, useEffect, useState } from 'react';

import { useApp } from '../../context/AppContext';
import {
  dayOfMonth,
  formatLongDateKey,
  formatTime,
  monthName,
  weekdayShort,
  type DateKey,
} from '../../lib/clinicTime';
import { periodOf, type DayPeriod } from '../../lib/slots';
import { toErrorMessage } from '../../lib/supabase';
import { type AvailableDay, type AvailableSlot } from '../../services/gateway';

interface SlotPickerProps {
  doctorId: string;
  /** Início (ISO) do horário escolhido. */
  value: string | null;
  onChange: (startIso: string | null, slot?: AvailableSlot) => void;
  /** Horário atual da consulta (remarcação): aparece, mas não pode ser escolhido de novo. */
  currentStart?: string;
  /** Muda para forçar o recarregamento (ex.: alguém pegou o horário antes). */
  refreshKey?: number;
}

const PERIODS: { id: DayPeriod; label: string; icon: string }[] = [
  { id: 'manha', label: 'Manhã', icon: 'wb_sunny' },
  { id: 'tarde', label: 'Tarde', icon: 'partly_cloudy_day' },
  { id: 'noite', label: 'Noite', icon: 'nights_stay' },
];

/** Seletor de dia e horário de um dentista, alimentado pela grade real da agenda. */
export const SlotPicker: React.FC<SlotPickerProps> = ({
  doctorId,
  value,
  onChange,
  currentStart,
  refreshKey = 0,
}) => {
  const { gateway } = useApp();

  const [days, setDays] = useState<AvailableDay[]>([]);
  const [day, setDay] = useState<DateKey | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Dias com horário nas próximas semanas.
  useEffect(() => {
    let cancelled = false;
    setLoadingDays(true);
    setError(null);
    setSlots([]);
    gateway
      .listAvailableDays(doctorId, 28)
      .then((list) => {
        if (cancelled) return;
        setDays(list);
        setDay((previous) => {
          if (previous && list.some((d) => d.date === previous && d.freeSlots > 0)) return previous;
          return list.find((d) => d.freeSlots > 0)?.date ?? null;
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e, 'Não foi possível carregar a agenda.'));
      })
      .finally(() => {
        if (!cancelled) setLoadingDays(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, doctorId, refreshKey, reloadToken]);

  // Horários do dia escolhido.
  useEffect(() => {
    if (!day) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    gateway
      .listAvailableSlots(doctorId, day)
      .then((list) => {
        if (!cancelled) setSlots(list);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e, 'Não foi possível carregar os horários.'));
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateway, doctorId, day, refreshKey, reloadToken]);

  // Se o horário escolhido deixou de estar livre (recarga), limpa a escolha.
  useEffect(() => {
    if (value && slots.length > 0 && !slots.some((s) => s.start === value && s.available)) {
      const stillOnThisDay = slots.some((s) => s.start === value);
      if (stillOnThisDay) onChange(null);
    }
  }, [slots, value, onChange]);

  const retry = useCallback(() => setReloadToken((n) => n + 1), []);

  const freeDays = days.filter((d) => d.freeSlots > 0);

  if (loadingDays) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-[#6e7979]">
        <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[18px]">
          progress_activity
        </span>
        Carregando agenda do profissional…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-2xl bg-[#ffdad6]/60 p-4 text-xs text-[#93000a]">
        <span>{error}</span>
        <button
          type="button"
          onClick={retry}
          className="rounded-full bg-white px-3 py-1.5 font-semibold text-[#93000a] shadow-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (freeDays.length === 0) {
    return (
      <p className="rounded-2xl bg-[#eef5f4] p-4 text-xs text-[#3e4949] dark:bg-[#1a2222] dark:text-[#bec9c8]">
        Este profissional não tem horários livres nas próximas semanas. Escolha outro profissional
        ou fale com a clínica.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#005051] dark:text-[#84d4d4]">
          {day ? `${monthName(day)} de ${day.slice(0, 4)}` : 'Escolha o dia'}
        </span>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2" role="listbox" aria-label="Dias">
          {days.map((d) => {
            const full = d.freeSlots === 0;
            const selected = d.date === day;
            return (
              <button
                key={d.date}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={full}
                onClick={() => {
                  setDay(d.date);
                  onChange(null);
                }}
                className={`flex h-[86px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl text-center transition-all ${
                  selected
                    ? 'bg-[#005051] text-white shadow-md ring-2 ring-[#005051]/20'
                    : full
                      ? 'cursor-not-allowed bg-[#dde4e3] text-[#6e7979] opacity-70 dark:bg-[#202929]'
                      : 'bg-[#eef5f4] text-[#161d1d] hover:bg-[#cce8e7] dark:bg-[#202929] dark:text-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{weekdayShort(d.date)}</span>
                <span className="text-xl font-bold leading-tight">{dayOfMonth(d.date)}</span>
                <span className="text-[10px] opacity-80">
                  {full ? 'Lotado' : d.freeSlots === 1 ? '1 vaga' : `${d.freeSlots} vagas`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {day && (
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-[#161d1d] dark:text-white">
            Horários de {formatLongDateKey(day)}
          </h4>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-xs text-[#6e7979]">
              <span
                aria-hidden="true"
                className="material-symbols-outlined animate-spin text-[18px]"
              >
                progress_activity
              </span>
              Carregando horários…
            </div>
          ) : (
            PERIODS.map((period) => {
              const inPeriod = slots.filter((s) => periodOf(formatTime(s.start)) === period.id);
              if (inPeriod.length === 0) return null;
              return (
                <div key={period.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3e4949] dark:text-[#bec9c8]">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]"
                    >
                      {period.icon}
                    </span>
                    {period.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inPeriod.map((slot) => {
                      const isCurrent = currentStart
                        ? new Date(currentStart).getTime() === new Date(slot.start).getTime()
                        : false;
                      const selected = value === slot.start;
                      const disabled = !slot.available || isCurrent;
                      return (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={disabled}
                          onClick={() => onChange(slot.start, slot)}
                          title={
                            isCurrent
                              ? 'Horário atual da consulta'
                              : slot.available
                                ? undefined
                                : 'Horário já reservado'
                          }
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                            selected
                              ? 'bg-[#005051] text-white shadow-sm ring-2 ring-[#005051]/20'
                              : disabled
                                ? 'cursor-not-allowed bg-[#dde4e3] text-[#6e7979] line-through dark:bg-[#202929]'
                                : 'bg-[#eef5f4] text-[#161d1d] hover:bg-[#cce8e7] dark:bg-[#202929] dark:text-white'
                          }`}
                        >
                          {selected && (
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined text-[16px]"
                            >
                              check_circle
                            </span>
                          )}
                          {formatTime(slot.start)}
                          {isCurrent && <span className="text-[10px] font-normal">(atual)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
