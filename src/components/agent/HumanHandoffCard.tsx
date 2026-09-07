import React, { useState } from 'react';
import { Headphones, CheckCircle2, UserCheck, ArrowRight, PhoneCall } from 'lucide-react';
import { HumanHandoffPayload } from '../../types/banking';

interface HumanHandoffCardProps {
  data: Partial<HumanHandoffPayload>;
}

export const HumanHandoffCard: React.FC<HumanHandoffCardProps> = ({ data }) => {
  const [isCalling, setIsCalling] = useState(false);

  return (
    <div className="bg-slate-900/95 border border-purple-500/40 rounded-xl p-4 my-2 shadow-card backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Headphones size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-300 font-bold block">
              Transferencia a Asesor
            </span>
            <h4 className="text-sm font-bold text-white">Context-Rich Escalation</h4>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/80">
          COLA VIP
        </span>
      </div>

      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 mb-3 text-xs">
        <span className="text-[11px] font-semibold text-purple-300 block mb-2">
          📋 Contexto transferido al asesor humano:
        </span>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Cliente autenticado:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 size={13} /> Guillermo Calderón
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Motivo:</span>
            <span className="text-white font-medium">{data.reason || 'Transacción no reconocida / Asesoría'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Monto:</span>
            <span className="text-amber-400 font-mono font-bold">$300.00 USD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Caso:</span>
            <span className="text-cyan-300 font-mono font-semibold">{data.case_id || 'FRA-20260905-00421'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tarjeta:</span>
            <span className="text-slate-200 font-mono">****4821</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Acción:</span>
            <span className="text-red-400 font-semibold">Tarjeta bloqueada</span>
          </div>
        </div>
      </div>

      {!isCalling ? (
        <button
          onClick={() => setIsCalling(true)}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <PhoneCall size={14} />
          Hablar con un asesor (Llamada Prioritaria)
        </button>
      ) : (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="font-bold text-emerald-400">Conectando con Asesor Senior...</span>
              <p className="text-[10px] text-slate-400">Asignado: Lic. Mario Morales (Prevención)</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-300">00:03</span>
        </div>
      )}
    </div>
  );
};
