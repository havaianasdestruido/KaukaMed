import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';
import { type UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const {
    setScreen,
    setUserRole,
    isDark,
    toggleTheme,
    addToast,
    dataSource,
    login,
    requestPasswordReset,
  } = useApp();
  const isRemote = dataSource === 'supabase';
  const [submitting, setSubmitting] = useState(false);

  const [selectedRole, setSelectedRole] = useState<UserRole>('paciente');
  const [identifier, setIdentifier] = useState(isRemote ? '' : 'camila.santos@email.com');
  const [password, setPassword] = useState(isRemote ? '' : '••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Com backend real, o papel vem da conta — não preenchemos e-mails de exemplo.
    if (isRemote) return;
    if (role === 'paciente') {
      setIdentifier('camila.santos@email.com');
    } else if (role === 'dentista') {
      setIdentifier('marcelo.arantes@odontoaura.com.br');
    } else if (role === 'administrador') {
      setIdentifier('rodrigo.diretoria@odontoaura.com.br');
    } else {
      setIdentifier('renata.recepcao@odontoaura.com.br');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRemote) {
      if (!identifier.trim() || !password) {
        addToast('Informe e-mail e senha.', 'error');
        return;
      }
      setSubmitting(true);
      await login(identifier, password);
      setSubmitting(false);
      return;
    }
    setUserRole(selectedRole);
    addToast(`Bem-vindo de volta! Autenticado como ${selectedRole.toUpperCase()}.`, 'success');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f4fbfa] dark:bg-[#0f1515] transition-colors">
      <div className="w-full max-w-6xl mx-auto my-auto overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-[#141b1b] flex flex-col lg:flex-row relative border border-[#dde4e3]/80 dark:border-[#263131]">
        {/* Top Right Theme Toggle */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-[#eef5f4] dark:bg-[#202929] px-3 py-1 rounded-full shadow-sm border border-[#dde4e3] dark:border-[#2d3838]">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex items-center gap-1.5 text-[#3e4949] dark:text-[#bec9c8] hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors text-xs font-semibold px-1 py-0.5 rounded-full"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDark ? 'dark_mode' : 'light_mode'}
            </span>
            <span>{isDark ? 'Modo Escuro' : 'Modo Claro'}</span>
          </button>
        </div>

        {/* Coluna Esquerda: Institucional / Acolhimento */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#006a6b] via-[#005051] to-[#003839] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Elementos Decorativos de Fundo */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#a0f0f1] opacity-10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 bottom-20 w-56 h-56 rounded-full bg-[#cce8e7] opacity-15 blur-2xl pointer-events-none"></div>

          {/* Topo Brand Essence */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white mb-6 border border-white/10">
              <span className="material-symbols-outlined text-[18px] text-[#a0f0f1]">verified</span>
              <span className="text-xs tracking-wide font-medium">
                Plataforma Certificada CFO / SBIS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight tracking-tight">
              Seu sorriso em harmonia com a sua saúde.
            </h2>
            <p className="mt-3 text-sm text-[#a0f0f1] opacity-90 max-w-sm leading-relaxed">
              A precisão do prontuário digital e a empatia do atendimento humanizado em um só
              ecossistema integrado.
            </p>
          </div>

          {/* Ilustração Clínica / Visual Central */}
          <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center">
            <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md p-2.5 border border-white/15">
              <img
                src={ASSETS.operatoryRoom}
                alt="Ambiente OdontoAura"
                className="w-full h-44 object-cover rounded-xl shadow-inner"
              />
              <div className="mt-2.5 px-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a0f0f1] animate-pulse"></span>
                  <span className="text-xs text-white font-medium">Ambiente Operatório Ativo</span>
                </div>
                <span className="text-[11px] text-[#84d4d4]">Criptografia 256-bit</span>
              </div>
            </div>
          </div>

          {/* Rodapé Lado Esquerdo: Badges de Segurança */}
          <div className="relative z-10 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                <span className="material-symbols-outlined text-[#a0f0f1] text-[22px]">lock</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">LGPD Saúde</p>
                  <p className="text-[11px] text-[#84d4d4] truncate">Dados blindados</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                <span className="material-symbols-outlined text-[#a0f0f1] text-[22px]">
                  fingerprint
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    Certificação ICP-Brasil
                  </p>
                  <p className="text-[11px] text-[#84d4d4] truncate">Assinatura digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Formulário de Login M3 */}
        <div className="lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#141b1b]">
          <div className="max-w-md w-full mx-auto flex flex-col">
            {/* Header com Logo e Boas-Vindas */}
            <div className="flex items-center gap-3 mb-5">
              <img
                src={ASSETS.logo}
                alt="OdontoAura Logo"
                className="w-12 h-12 object-contain rounded-xl"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#005051] dark:text-[#84d4d4] tracking-tight">
                  OdontoAura
                </span>
                <span className="text-[11px] text-[#4a6363] dark:text-[#bec9c8] uppercase tracking-wider font-semibold">
                  Tecnologia Odontológica
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#161d1d] dark:text-white">
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-[#3e4949] dark:text-[#bec9c8] mt-1">
                Acesse sua conta para gerenciar consultas e tratamentos
              </p>
            </div>

            {/* Seletor de Perfil (M3 Filter Chips) */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-[#3e4949] dark:text-[#bec9c8] block mb-2">
                Selecione seu perfil de acesso:
              </label>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {(['paciente', 'funcionario', 'dentista', 'administrador'] as UserRole[]).map(
                  (role) => {
                    const isSelected = selectedRole === role;
                    const label =
                      role === 'paciente'
                        ? 'Paciente'
                        : role === 'funcionario'
                          ? 'Funcionário'
                          : role === 'dentista'
                            ? 'Dentista'
                            : 'Administrador';

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs transition-all font-medium ${
                          isSelected
                            ? 'bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] font-bold shadow-sm ring-1 ring-[#005051]/30'
                            : 'bg-[#eef5f4] dark:bg-[#202929] text-[#3e4949] dark:text-[#bec9c8] hover:bg-[#e2eae9] dark:hover:bg-[#263131]'
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-[#005051] dark:text-[#84d4d4]">
                            check
                          </span>
                        )}
                        <span>{label}</span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {/* Campo 1: E-mail ou CPF */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e7979] group-focus-within:text-[#005051] dark:group-focus-within:text-[#84d4d4] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <input
                  id="identifierInput"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-13 pl-11 pr-4 bg-[#eef5f4] dark:bg-[#1a2222] text-[#161d1d] dark:text-white text-sm rounded-xl outline-none focus:bg-white dark:focus:bg-[#202929] focus:ring-2 focus:ring-[#005051] dark:focus:ring-[#84d4d4] transition-all shadow-sm border border-transparent dark:border-[#263131]"
                  placeholder="E-mail ou CPF"
                />
              </div>

              {/* Campo 2: Senha com toggle */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e7979] group-focus-within:text-[#005051] dark:group-focus-within:text-[#84d4d4] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-13 pl-11 pr-12 bg-[#eef5f4] dark:bg-[#1a2222] text-[#161d1d] dark:text-white text-sm rounded-xl outline-none focus:bg-white dark:focus:bg-[#202929] focus:ring-2 focus:ring-[#005051] dark:focus:ring-[#84d4d4] transition-all shadow-sm border border-transparent dark:border-[#263131]"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar ou ocultar senha"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6e7979] hover:text-[#005051] dark:hover:text-[#84d4d4] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Lembrar & Recuperar Senha */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#005051] focus:ring-[#005051] accent-[#005051]"
                  />
                  <span className="text-xs text-[#161d1d] dark:text-[#bec9c8]">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => void requestPasswordReset(identifier)}
                  className="text-xs text-[#005051] dark:text-[#84d4d4] hover:underline font-semibold focus:outline-none"
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* CTA Principal M3 Filled Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 mt-2 rounded-full bg-[#005051] hover:bg-[#006a6b] disabled:opacity-60 disabled:cursor-wait text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <span>{submitting ? 'Entrando…' : 'Entrar no OdontoAura'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Divisor Social */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full h-px bg-[#dde4e3] dark:bg-[#263131]"></div>
              <span className="absolute bg-white dark:bg-[#141b1b] px-3 text-xs text-[#6e7979]">
                ou continue com
              </span>
            </div>

            {/* Botões Sociais Outlined M3 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isRemote) {
                    addToast('Login com Google ainda não está habilitado.', 'info');
                    return;
                  }
                  setUserRole('paciente');
                  addToast('Autenticado com sucesso via Google!', 'success');
                }}
                className="h-11 rounded-full bg-[#eef5f4] dark:bg-[#1a2222] hover:bg-[#e2eae9] dark:hover:bg-[#202929] text-[#161d1d] dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    fill="#EA4335"
                  ></path>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isRemote) {
                    addToast('Login com Gov.br ainda não está habilitado.', 'info');
                    return;
                  }
                  setUserRole('paciente');
                  addToast('Autenticado com sucesso via Gov.br!', 'success');
                }}
                className="h-11 rounded-full bg-[#eef5f4] dark:bg-[#1a2222] hover:bg-[#e2eae9] dark:hover:bg-[#202929] text-[#005051] dark:text-[#84d4d4] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]"
              >
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
                <span>Gov.br</span>
              </button>
            </div>

            {/* Rodapé do Card */}
            <div className="mt-5 pt-2 text-center">
              <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
                Não possui conta?{' '}
                <button
                  type="button"
                  onClick={() => setScreen('cadastro')}
                  className="text-xs text-[#005051] dark:text-[#84d4d4] font-bold hover:underline ml-1"
                >
                  Cadastre-se na clínica
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
