import React from 'react';
import { BankTransaction } from '../../types/banking';
import { ShieldAlert, CheckCircle2, Loader2, MapPin, Calendar, CreditCard } from 'lucide-react';

interface FraudWorkflowCardProps {
  data: {
    transaction: BankTransaction;
    step?: number;
  };
}

export const FraudWorkflowCard: React.FC<FraudWorkflowCardProps> = ({ data }) => {
  const tx = data.transaction;

  return (
    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 my-2 shadow-card backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Investigación de Transacción</h4>
            <p className="text-[11px] text-amber-400/90">Protocolo Antifraude Nito</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold animate-pulse">
          EN CURSO
        </span>
      </div>

      {/* Selected Transaction Summary Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 mb-3 text-xs">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Transacción seleccionada</span>
            <span className="text-white font-bold text-sm">{tx.merchant}</span>
          </div>
          <span className="text-base font-extrabold font-mono text-amber-400">
            ${tx.amount.toFixed(2)} USD
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            <span>{tx.date} • {tx.time || '18:42'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard size={13} className="text-slate-400" />
            <span>Tarjeta: <strong className="font-mono text-cyan-300">****{tx.card_last4}</strong></span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-slate-400 text-[10px]">
            <MapPin size={12} className="text-amber-400" />
            <span>{tx.location || 'ATM Red Visionario - Centro'}</span>
          </div>
        </div>
      </div>

      {/* Progress checklist */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40">
          <span className="text-slate-300">1. Transacción identificada</span>
          <CheckCircle2 size={14} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40">
          <span className="text-slate-300">2. Cliente autenticado</span>
          <CheckCircle2 size={14} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40">
          <span className="text-slate-300">3. Tarjeta identificada (terminada en 4821)</span>
          <CheckCircle2 size={14} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40">
          <span className="text-slate-300">4. Transacción marcada como sospechosa</span>
          <CheckCircle2 size={14} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40">
          <span className="text-amber-200">5. Generando reporte de investigación</span>
          <Loader2 size={14} className="text-amber-400 animate-spin" />
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40">
          <span className="text-slate-400">6. Generando número de caso oficial</span>
          <span className="text-[10px] text-slate-500 font-mono">En espera...</span>
        </div>
      </div>
    </div>
  );
};
