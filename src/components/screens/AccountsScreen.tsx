import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { CreditCard, Sparkles, PiggyBank, DollarSign, ShieldCheck, ChevronRight, SlidersHorizontal, Plus, Eye, EyeOff } from 'lucide-react';
import infinityMark from '../../assets/logo-bancovi-mark.svg';

export const AccountsScreen: React.FC = () => {
  const { accounts, setIsDrawerOpen, sendLiveText } = useBanking();
  const [activeSegment, setActiveSegment] = useState<'mis' | 'compartidas'>('mis');
  const [showBalance, setShowBalance] = useState(true);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-4 pb-32 text-slate-800 animate-in fade-in duration-200 max-w-md mx-auto">
      {/* Segmented Control (Mis cuentas | Cuentas compartidas) */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveSegment('mis')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSegment === 'mis'
              ? 'bg-[#425E5A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mis cuentas
        </button>
        <button
          onClick={() => setActiveSegment('compartidas')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSegment === 'compartidas'
              ? 'bg-[#425E5A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cuentas compartidas
        </button>
      </div>

      {/* Saldo Total Card (Page 5 of PDF) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#425E5A] via-[#093230] to-[#2E423F] text-white p-6 shadow-xl">
        <div className="absolute right-4 -bottom-6 w-44 h-44 opacity-25 pointer-events-none">
          <img src={infinityMark} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
            <span>Saldo total</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/70 hover:text-white"
              aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
            >
              {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>

          <div className="text-3xl font-extrabold font-mono tracking-tight text-white mt-1.5 mb-1">
            {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
          </div>

          <p className="text-[11px] text-white/70">Total en todas tus cuentas</p>

          <button
            onClick={() => {
              setIsDrawerOpen(true);
              sendLiveText('Dame un resumen de mis saldos');
            }}
            className="mt-4 px-3.5 py-1.5 rounded-full bg-[#C1BA73] hover:bg-[#D6CE94] text-[#425E5A] font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Resumen de saldos</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Mis Cuentas List Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-800">Mis cuentas</span>
        <div className="flex items-center gap-2 text-slate-500">
          <button className="p-1 rounded hover:bg-slate-100">
            <SlidersHorizontal size={14} />
          </button>
          <button className="p-1 rounded bg-[#425E5A] text-white">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Accounts List (Page 5 of PDF) */}
      <div className="space-y-3">
        {accounts.map((acc) => {
          const isCard = acc.name.includes('Tarjeta');
          const isDeposit = acc.name.includes('Depósito');
          const isSavings = acc.name.includes('Ahorro');

          return (
            <div
              key={acc.account_id}
              onClick={() => {
                setIsDrawerOpen(true);
                sendLiveText(`Cuéntame más sobre mi ${acc.name}`);
              }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between hover:border-[#C1BA73] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#425E5A] text-[#C1BA73] flex items-center justify-center shadow-sm">
                  {isSavings ? (
                    <Sparkles size={18} />
                  ) : isDeposit ? (
                    <DollarSign size={18} />
                  ) : (
                    <CreditCard size={18} />
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#425E5A]">
                    {acc.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {acc.account_number_masked}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {acc.type}
                  </span>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="text-sm font-extrabold font-mono text-slate-900">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isCard ? 'de $5,000.00' : isDeposit ? `Vence ${acc.expiry_date || '12/03/2027'}` : 'Disponible'}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#425E5A]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Guarantee Banner (Page 5 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={18} />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-slate-900 block">Tus depósitos están protegidos</span>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Banco Visionario está respaldado por el Fondo de Garantía de Depósitos.
          </p>
          <a href="#garantia" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#425E5A] font-bold mt-1 inline-block hover:underline">
            Conoce más &gt;
          </a>
        </div>
      </div>
    </div>
  );
};
