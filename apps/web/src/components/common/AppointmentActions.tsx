import React, { useState } from 'react';

import { useApp } from '../../context/AppContext';
import {
  allowedActions,
  cancelRequiresReason,
  type AppointmentAction,
} from '../../lib/appointmentRules';
import { patientCanChange } from '../../lib/clinicTime';
import { roleToDb } from '../../services/mappers';
import { type Appointment } from '../../types';
import { Modal } from './Modal';
import { SlotPicker } from './SlotPicker';

interface AppointmentActionsProps {
  apt: Appointment;
  className?: string;
}

type DialogKind = 'cancel' | 'no_show' | 'reschedule';

/**
 * Botões de ação de uma consulta, sempre de acordo com o perfil do usuário
 * (`allowedActions`). As regras de verdade são aplicadas pelo banco; aqui só se
 * mostra o que vai funcionar.
 */
export const AppointmentActions: React.FC<AppointmentActionsProps> = ({ apt, className = '' }) => {
  const { currentUser, changeAppointmentStatus } = useApp();
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [busy, setBusy] = useState<AppointmentAction | null>(null);

  if (!apt.dbStatus || !apt.startsAt) return null;

  const role = roleToDb(currentUser.role);
  const actions = allowedActions(
    { userId: currentUser.id, role },
    {
      status: apt.dbStatus,
      startsAt: apt.startsAt,
      patientId: apt.patientId,
      doctorId: apt.doctorId,
    },
  );

  const tooSoonForPatient =
    role === 'PATIENT' &&
    ['SCHEDULED', 'CONFIRMED'].includes(apt.dbStatus) &&
    !patientCanChange(apt.startsAt);

  if (actions.length === 0 && !tooSoonForPatient) return null;

  const run = async (action: Exclude<AppointmentAction, 'reschedule' | 'cancel' | 'no_show'>) => {
    setBusy(action);
    await changeAppointmentStatus(apt.id, action);
    setBusy(null);
  };

  const buttons: Record<AppointmentAction, { label: string; icon: string; tone: string }> = {
    confirm: {
      label: role === 'PATIENT' ? 'Confirmar presença' : 'Confirmar',
      icon: 'event_available',
      tone: 'bg-[#005051] text-white hover:bg-[#006a6b]',
    },
    start: {
      label: 'Iniciar atendimento',
      icon: 'play_arrow',
      tone: 'bg-[#005051] text-white hover:bg-[#006a6b]',
    },
    complete: {
      label: 'Concluir atendimento',
      icon: 'task_alt',
      tone: 'bg-[#005051] text-white hover:bg-[#006a6b]',
    },
    reschedule: {
      label: 'Reagendar',
      icon: 'edit_calendar',
      tone: 'bg-[#eef5f4] text-[#005051] hover:bg-[#cce8e7] dark:bg-[#202929] dark:text-[#84d4d4]',
    },
    cancel: {
      label: 'Cancelar',
      icon: 'event_busy',
      tone: 'text-[#ba1a1a] hover:bg-[#ffdad6]/50',
    },
    no_show: {
      label: 'Registrar falta',
      icon: 'person_off',
      tone: 'text-[#3e4949] hover:bg-[#e2eae9] dark:text-[#bec9c8] dark:hover:bg-[#202929]',
    },
  };

  const onClick = (action: AppointmentAction) => {
    if (action === 'cancel' || action === 'no_show' || action === 'reschedule') setDialog(action);
    else void run(action);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => {
            const { label, icon, tone } = buttons[action];
            return (
              <button
                key={action}
                type="button"
                disabled={busy !== null}
                onClick={() => onClick(action)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${tone}`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                  {busy === action ? 'progress_activity' : icon}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {tooSoonForPatient && (
        <p className="flex items-start gap-1.5 text-[11px] text-[#6e7979]">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
            info
          </span>
          <span>
            Faltam menos de 2 horas: para cancelar ou remarcar, fale diretamente com a clínica.
          </span>
        </p>
      )}

      {(dialog === 'cancel' || dialog === 'no_show') && (
        <ReasonDialog
          apt={apt}
          mode={dialog}
          reasonRequired={dialog === 'cancel' && cancelRequiresReason(role)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'reschedule' && <RescheduleDialog apt={apt} onClose={() => setDialog(null)} />}
    </div>
  );
};

const Summary: React.FC<{ apt: Appointment }> = ({ apt }) => (
  <div className="rounded-2xl bg-[#eef5f4] p-4 text-xs dark:bg-[#1a2222]">
    <p className="font-bold text-[#161d1d] dark:text-white">
      {apt.date} às {apt.time}
    </p>
    <p className="mt-0.5 text-[#3e4949] dark:text-[#bec9c8]">
      {apt.doctorName}
      {apt.patientName ? ` • Paciente: ${apt.patientName}` : ''}
    </p>
  </div>
);

const ReasonDialog: React.FC<{
  apt: Appointment;
  mode: 'cancel' | 'no_show';
  reasonRequired: boolean;
  onClose: () => void;
}> = ({ apt, mode, reasonRequired, onClose }) => {
  const { changeAppointmentStatus } = useApp();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const isCancel = mode === 'cancel';
  const invalid = isCancel && reasonRequired && reason.trim() === '';

  const submit = async () => {
    setSaving(true);
    const ok = await changeAppointmentStatus(apt.id, mode, isCancel ? reason : undefined);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      title={isCancel ? 'Cancelar consulta' : 'Registrar falta do paciente'}
      subtitle={
        isCancel ? 'Esta ação libera o horário na agenda.' : 'O horário volta a ficar disponível.'
      }
      onClose={onClose}
      busy={saving}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-full px-4 text-xs font-semibold text-[#3e4949] hover:bg-[#eef5f4] dark:text-[#bec9c8] dark:hover:bg-[#202929]"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || invalid}
            className="h-10 rounded-full bg-[#ba1a1a] px-5 text-xs font-bold text-white hover:bg-[#93000a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Salvando…' : isCancel ? 'Confirmar cancelamento' : 'Confirmar falta'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Summary apt={apt} />
        {isCancel && (
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#161d1d] dark:text-white">
            <span>
              Motivo do cancelamento{' '}
              {reasonRequired ? '*' : <span className="font-normal">(opcional)</span>}
            </span>
            <textarea
              rows={3}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: paciente pediu para desmarcar"
              className="w-full resize-none rounded-xl border border-[#dde4e3] bg-[#eef5f4] p-3 text-xs font-normal text-[#161d1d] outline-none focus:ring-2 focus:ring-[#005051] dark:border-[#263131] dark:bg-[#202929] dark:text-white"
            />
          </label>
        )}
      </div>
    </Modal>
  );
};

const RescheduleDialog: React.FC<{ apt: Appointment; onClose: () => void }> = ({
  apt,
  onClose,
}) => {
  const { rescheduleAppointment } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    const ok = await rescheduleAppointment(apt.id, selected);
    setSaving(false);
    if (ok) onClose();
    else {
      // Provavelmente alguém pegou o horário: recarrega a grade.
      setSelected(null);
      setRefreshKey((n) => n + 1);
    }
  };

  return (
    <Modal
      title="Reagendar consulta"
      subtitle="Escolha um novo dia e horário com o mesmo profissional."
      size="lg"
      onClose={onClose}
      busy={saving}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-full px-4 text-xs font-semibold text-[#3e4949] hover:bg-[#eef5f4] dark:text-[#bec9c8] dark:hover:bg-[#202929]"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || !selected}
            className="h-10 rounded-full bg-[#005051] px-5 text-xs font-bold text-white hover:bg-[#006a6b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Confirmar novo horário'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Summary apt={apt} />
        {apt.doctorId && (
          <SlotPicker
            doctorId={apt.doctorId}
            value={selected}
            onChange={setSelected}
            currentStart={apt.startsAt}
            refreshKey={refreshKey}
          />
        )}
        <p className="text-[11px] text-[#6e7979]">
          Depois de remarcada, a consulta volta ao status “Agendado” e precisa ser confirmada de
          novo.
        </p>
      </div>
    </Modal>
  );
};
