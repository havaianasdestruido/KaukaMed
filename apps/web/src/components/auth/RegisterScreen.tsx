import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../data/mockData';

export const RegisterScreen: React.FC = () => {
  const { setScreen, setUserRole, addToast, dataSource, register } = useApp();
  const isRemote = dataSource === 'supabase';

  // Dados de acesso (usados para criar a conta no Supabase Auth)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [cep, setCep] = useState('01310-100');
  const [street, setStreet] = useState('Avenida Paulista');
  const [number, setNumber] = useState('1578');
  const [complement, setComplement] = useState('Apto 42 - Bloco B');
  const [neighborhood, setNeighborhood] = useState('Bela Vista');
  const [city, setCity] = useState('São Paulo');
  const [uf, setUf] = useState('SP');

  const [operator, setOperator] = useState('unimed');
  const [cardNumber, setCardNumber] = useState('0048.9123.8821-00');
  const [isConvenioExpanded, setIsConvenioExpanded] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const handleCepSearch = () => {
    addToast('CEP 01310-100 validado com sucesso na base dos Correios.', 'success');
  };

  const handleSaveDraft = () => {
    addToast('Rascunho do cadastro salvo localmente.', 'info');
  };

  const handleAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      addToast('Por favor, concorde com os termos de privacidade para continuar.', 'error');
      return;
    }
    if (isRemote) {
      if (!fullName.trim() || !email.trim() || password.length < 6) {
        addToast('Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.', 'error');
        return;
      }
      setSubmitting(true);
      await register({ fullName, email, password, cpf, phone });
      setSubmitting(false);
      return;
    }
    setUserRole('paciente');
    addToast('Cadastro finalizado com sucesso! Bem-vindo(a) à OdontoAura.', 'success');
    setScreen('inicio-dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f4fbfa] dark:bg-[#0f1515] transition-colors">
      <div className="flex flex-col w-full max-w-4xl mx-auto py-4">
        {/* Elevated Card Container M3 */}
        <div className="bg-white dark:bg-[#141b1b] rounded-[28px] shadow-xl p-6 sm:p-10 flex flex-col gap-6 relative overflow-hidden border border-[#dde4e3]/80 dark:border-[#263131]">
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#a0f0f1]/30 dark:bg-[#004f50]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 bottom-10 w-56 h-56 bg-[#cce8e7]/40 dark:bg-[#003738]/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 relative z-10 border-b border-[#dde4e3]/50 dark:border-[#263131]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#eef5f4] dark:bg-[#202929] p-2 flex items-center justify-center shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                <img
                  src={ASSETS.logo}
                  alt="OdontoAura Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#005051] dark:text-[#84d4d4] font-bold">
                  OdontoAura Clínicas
                </span>
                <h1 className="text-xl sm:text-2xl text-[#161d1d] dark:text-white font-bold">
                  Criar sua Conta OdontoAura
                </h1>
                <p className="text-xs text-[#3e4949] dark:text-[#bec9c8]">
                  Cadastre-se em poucos passos para agendar consultas e consultar seu prontuário
                  digital.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef5f4] dark:bg-[#202929] border border-[#dde4e3] dark:border-[#263131]">
              <span className="material-symbols-outlined text-[18px] text-[#005051] dark:text-[#84d4d4]">
                shield_with_heart
              </span>
              <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] font-semibold">
                Ambiente Seguro M3
              </span>
            </div>
          </div>

          {/* Stepper Section (Material You M3) */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="grid grid-cols-3 gap-2 items-center">
              {/* Step 1: Concluído */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#a0f0f1] dark:bg-[#004f50] flex items-center justify-center text-[#002020] dark:text-[#a0f0f1]">
                  <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#005051] dark:text-[#84d4d4] font-bold uppercase">
                    Etapa 1
                  </span>
                  <span className="text-xs text-[#161d1d] dark:text-white font-semibold hidden sm:inline">
                    Dados Pessoais
                  </span>
                </div>
              </div>

              {/* Step 2: Ativo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#005051] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#005051] dark:text-[#84d4d4] font-bold uppercase">
                    Etapa 2
                  </span>
                  <span className="text-xs text-[#161d1d] dark:text-white font-bold truncate">
                    Endereço Residencial
                  </span>
                </div>
              </div>

              {/* Step 3: Próximo */}
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-8 h-8 rounded-full bg-[#dde4e3] dark:bg-[#263131] text-[#3e4949] dark:text-[#bec9c8] flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#3e4949] dark:text-[#bec9c8] uppercase">
                    Etapa 3
                  </span>
                  <span className="text-xs text-[#3e4949] dark:text-[#bec9c8] hidden sm:inline">
                    Convênio & Saúde
                  </span>
                </div>
              </div>
            </div>

            {/* Linear Progress Indicator */}
            <div className="w-full bg-[#dde4e3] dark:bg-[#263131] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#005051] dark:bg-[#84d4d4] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: '66.6%' }}
              ></div>
            </div>
          </div>

          {/* Main Form Workspace */}
          <form onSubmit={handleAdvance} className="flex flex-col gap-6 relative z-10">
            {/* Section: Dados de acesso (conta) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[22px]">
                  badge
                </span>
                <h2 className="text-base text-[#161d1d] dark:text-white font-bold">
                  Dados de Acesso
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">
                      Nome completo *
                    </label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-7 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">E-mail *</label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-5 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">
                      Senha * (mín. 6 caracteres)
                    </label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-6 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">CPF</label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="text"
                      autoComplete="off"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-6 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">Celular</label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(11) 90000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Endereço Residencial */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[22px]">
                    location_on
                  </span>
                  <h2 className="text-base text-[#161d1d] dark:text-white font-bold">
                    Endereço do Titular
                  </h2>
                </div>
                <span className="text-xs text-[#6e7979]">Campos com preenchimento automático</span>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* CEP Field */}
                <div className="md:col-span-5 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#005051] dark:text-[#84d4d4] font-semibold">
                      CEP
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                        placeholder="00000-000"
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                      />
                      <button
                        onClick={handleCepSearch}
                        className="text-[#005051] dark:text-[#84d4d4] hover:opacity-80 transition-opacity p-1"
                        title="Buscar CEP"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">search</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <button
                      type="button"
                      onClick={() =>
                        addToast('Consulte seu CEP no site oficial dos Correios.', 'info')
                      }
                      className="text-[11px] text-[#005051] dark:text-[#84d4d4] hover:underline font-semibold"
                    >
                      Não sei meu CEP
                    </button>
                    <span className="text-[11px] text-[#4a6363] dark:text-[#84d4d4] flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-[#005051] dark:text-[#84d4d4]">
                        check_circle
                      </span>{' '}
                      CEP validado
                    </span>
                  </div>
                </div>

                {/* Logradouro */}
                <div className="md:col-span-7 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">
                      Logradouro (Avenida / Rua / Alameda)
                    </label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                </div>

                {/* Número */}
                <div className="md:col-span-4 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">Número</label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      placeholder="Ex: 100"
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Complemento */}
                <div className="md:col-span-8 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">
                      Complemento (opcional)
                    </label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      placeholder="Ex: Apto, Sala, Bloco"
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bairro */}
                <div className="md:col-span-5 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">Bairro</label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                  </div>
                </div>

                {/* Cidade */}
                <div className="md:col-span-5 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">Cidade</label>
                    <input
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                {/* Estado / UF */}
                <div className="md:col-span-2 flex flex-col gap-1">
                  <div className="relative bg-[#eef5f4] dark:bg-[#1a2222] rounded-xl px-4 pt-2.5 pb-2 focus-within:bg-white dark:focus-within:bg-[#202929] transition-colors shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
                    <label className="block text-[11px] text-[#6e7979] font-medium">UF</label>
                    <select
                      className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none cursor-pointer"
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                    >
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      <option value="PR">PR</option>
                      <option value="RS">RS</option>
                      <option value="SC">SC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Expandível da Etapa 3: Dados de Convênio */}
            <div className="rounded-2xl bg-[#eef5f4] dark:bg-[#1a2222] p-4 sm:p-5 flex flex-col gap-4 shadow-sm border border-[#dde4e3]/60 dark:border-[#263131]">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsConvenioExpanded(!isConvenioExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#cce8e7] dark:bg-[#324b4b] flex items-center justify-center text-[#005051] dark:text-[#a0f0f1]">
                    <span className="material-symbols-outlined text-[20px]">medical_services</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#161d1d] dark:text-white">
                        Pré-configuração de Convênio & Plano
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#cce8e7] dark:bg-[#324b4b] text-[#051f20] dark:text-[#a0f0f1] text-[10px] font-bold">
                        Etapa 3 Vinculada
                      </span>
                    </div>
                    <p className="text-xs text-[#6e7979]">
                      Selecione previamente sua operadora odontológica para validar a elegibilidade
                      imediata.
                    </p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#202929] flex items-center justify-center text-[#6e7979] shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isConvenioExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {/* Conteúdo do Bloco de Convênio */}
              {isConvenioExpanded && (
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-[#3e4949] dark:text-[#bec9c8] font-semibold mb-2">
                      Selecione sua Operadora / Modalidade:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {[
                        { id: 'unimed', name: 'Unimed Odonto', icon: 'health_and_safety' },
                        { id: 'amil', name: 'Amil Dental', icon: 'vital_signs' },
                        { id: 'sulamerica', name: 'SulAmérica', icon: 'shield' },
                        { id: 'bradesco', name: 'Bradesco Dental', icon: 'dentistry' },
                        { id: 'particular', name: 'Particular', icon: 'person' },
                      ].map((item) => {
                        const isSelected = operator === item.id;
                        return (
                          <label key={item.id} className="cursor-pointer">
                            <input
                              type="radio"
                              name="operadora"
                              value={item.id}
                              checked={isSelected}
                              onChange={() => setOperator(item.id)}
                              className="sr-only"
                            />
                            <div
                              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center shadow-sm border ${
                                isSelected
                                  ? 'bg-[#005051] text-white border-transparent'
                                  : 'bg-white dark:bg-[#202929] text-[#161d1d] dark:text-[#e1e8e7] border-[#dde4e3] dark:border-[#2d3838] hover:bg-[#f4fbfa]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[22px]">
                                {item.icon}
                              </span>
                              <span className="text-xs font-semibold">{item.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Matrícula com Validação Instantânea */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="relative bg-white dark:bg-[#202929] rounded-xl px-4 pt-2.5 pb-2 shadow-sm border border-[#dde4e3] dark:border-[#2d3838]">
                      <label className="block text-[11px] text-[#005051] dark:text-[#84d4d4] font-semibold">
                        Número da Carteirinha / Matrícula
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          className="w-full bg-transparent text-sm font-medium text-[#161d1d] dark:text-white focus:outline-none font-mono"
                          placeholder="Ex: 0000.0000.0000-00"
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                        <span className="material-symbols-outlined text-[#005051] dark:text-[#84d4d4] text-[20px]">
                          verified
                        </span>
                      </div>
                    </div>

                    {/* Box Informativo de Validação Instantânea */}
                    <div className="bg-white dark:bg-[#202929] rounded-xl p-3 flex items-center gap-3 shadow-sm border border-[#dde4e3] dark:border-[#2d3838]">
                      <div className="w-8 h-8 rounded-full bg-[#a0f0f1] dark:bg-[#004f50] flex items-center justify-center text-[#002020] dark:text-[#a0f0f1]">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[#161d1d] dark:text-white font-bold">
                          Validação Instantânea Ativa
                        </span>
                        <span className="text-[11px] text-[#4a6363] dark:text-[#bec9c8]">
                          Titular ativo · Plano Odonto Master Gold · Carência cumprida
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Termos LGPD Checkbox M3 */}
            <div className="bg-[#eef5f4] dark:bg-[#1a2222] rounded-2xl p-4 flex items-start gap-3 border border-[#dde4e3]/60 dark:border-[#263131]">
              <label className="relative flex items-center cursor-pointer mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-5 h-5 rounded text-[#005051] focus:ring-[#005051] accent-[#005051]"
                />
              </label>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs sm:text-sm text-[#161d1d] dark:text-white font-semibold">
                  Concordo com os Termos de Uso e Política de Privacidade de Dados Médicos (LGPD)
                </span>
                <p className="text-[11px] text-[#6e7979] leading-relaxed">
                  Seus dados são criptografados de ponta a ponta e armazenados de acordo com os
                  padrões da ANPD e Conselho Federal de Odontologia (CFO).
                </p>
              </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="w-full sm:w-auto h-11 px-6 rounded-full bg-[#dde4e3] dark:bg-[#202929] text-[#005051] dark:text-[#84d4d4] hover:bg-[#bec9c8] dark:hover:bg-[#263131] transition-colors text-xs font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Voltar</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="h-11 px-4 rounded-full text-[#4a6363] dark:text-[#bec9c8] hover:bg-[#cce8e7]/30 transition-colors text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">bookmark_border</span>
                  <span>Salvar rascunho</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto h-11 px-7 rounded-full bg-[#005051] hover:bg-[#006a6b] disabled:opacity-60 disabled:cursor-wait text-white transition-all text-xs font-bold shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>{submitting ? 'Criando conta…' : 'Concluir Cadastro'}</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
