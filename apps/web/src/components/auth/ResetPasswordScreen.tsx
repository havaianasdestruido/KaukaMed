import React, { useState } from 'react';

import { useApp } from '../../context/AppContext';

/**
 * Tela exibida quando o usuário chega pelo link "Esqueci minha senha" do e-mail.
 * O Supabase já abriu uma sessão de recuperação; aqui só se define a nova senha.
 */
export const ResetPasswordScreen: React.FC = () => {
  const { completePasswordReset, addToast, logout } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      addToast('A nova senha deve ter pelo menos 8 caracteres.', 'error');
      return;
    }
    if (password !== confirm) {
      addToast('As senhas não conferem.', 'error');
      return;
    }
    setSaving(true);
    await completePasswordReset(password);
    setSaving(false);
  };

  const field =
    'w-full h-12 px-4 bg-[#eef5f4] dark:bg-[#1a2222] text-[#161d1d] dark:text-white text-sm rounded-xl outline-none focus:bg-white dark:focus:bg-[#202929] focus:ring-2 focus:ring-[#005051] dark:focus:ring-[#84d4d4] transition-all shadow-sm border border-transparent dark:border-[#263131]';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f4fbfa] p-4 dark:bg-[#0f1515]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-3xl border border-[#dde4e3]/80 bg-white p-8 shadow-2xl dark:border-[#263131] dark:bg-[#141b1b]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#cce8e7] text-[#005051] dark:bg-[#324b4b] dark:text-[#a0f0f1]">
            <span aria-hidden="true" className="material-symbols-outlined text-[26px]">
              lock_reset
            </span>
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#161d1d] dark:text-white">Definir nova senha</h1>
            <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
              Escolha uma senha nova para a sua conta OdontoAura.
            </p>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#3e4949] dark:text-[#bec9c8]">
          Nova senha (mín. 8 caracteres)
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#3e4949] dark:text-[#bec9c8]">
          Repita a nova senha
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={field}
            required
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#005051] text-sm font-semibold text-white shadow-md transition-all hover:bg-[#006a6b] disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Salvar nova senha'}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-xs font-semibold text-[#005051] hover:underline dark:text-[#84d4d4]"
        >
          Cancelar e voltar ao login
        </button>
      </form>
    </div>
  );
};
