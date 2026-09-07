import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface ConversationalAuthProps {
  data: {
    customer_name: string;
    birth_date: string;
    card_last4: string;
    status: string;
  };
}

export const ConversationalAuth: React.FC<ConversationalAuthProps> = ({ data }) => {
  const { verifyCustomerIdentity, customer } = useBanking();
  const [step, setStep] = useState(0);
  const [otp] = useState('749210');

  useEffect(() => {
    if (customer.authenticated) {
      setStep(4);
      return;
    }

    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 900);
    const t3 = setTimeout(() => setStep(3), 1400);
    const t4 = setTimeout(() => {
      setStep(4);
      verifyCustomerIdentity();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 my-2 shadow-card backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Verificación de Identidad Segura</h4>
            <p className="text-[11px] text-slate-400">Autenticación conversacional multifactor</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
          DEMO AUTH MOCK
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Step 1: Cliente */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-950/50">
          <span className="text-slate-300">1. Cliente identificado:</span>
          <div className="flex items-center gap-1.5 font-medium text-white">
            {step >= 1 ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-emerald-300">{data.customer_name}</span>
              </>
            ) : (
              <Loader2 size={14} className="text-cyan-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Step 2: Fecha de nacimiento */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-950/50">
          <span className="text-slate-300">2. Fecha de nacimiento validada:</span>
          <div className="flex items-center gap-1.5 font-medium text-white">
            {step >= 2 ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-emerald-300">{data.birth_date}</span>
              </>
            ) : (
              <span className="text-slate-500">Pendiente...</span>
            )}
          </div>
        </div>

        {/* Step 3: Tarjeta */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-950/50">
          <span className="text-slate-300">3. Tarjeta terminada en:</span>
          <div className="flex items-center gap-1.5 font-medium text-white">
            {step >= 3 ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="font-mono text-cyan-300">****{data.card_last4}</span>
              </>
            ) : (
              <span className="text-slate-500">Validando...</span>
            )}
          </div>
        </div>

        {/* Step 4: OTP */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-950/50">
          <span className="text-slate-300 flex items-center gap-1">
            <KeyRound size={12} className="text-amber-400" />
            Código OTP validado:
          </span>
          <div className="flex items-center gap-1.5 font-medium text-white">
            {step >= 4 ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="font-mono text-emerald-300 font-bold">{otp} ✓</span>
              </>
            ) : (
              <div className="flex items-center gap-1 text-cyan-400">
                <Loader2 size={13} className="animate-spin" />
                <span className="text-[11px]">Generando token SMS...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {step >= 4 && (
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Identidad verificada con éxito
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ID_SESSION: AUTH-9928</span>
        </div>
      )}
    </div>
  );
};
