import React from 'react';
import { FraudCase } from '../../types/banking';
import { FileText, Clock, Building2, CheckCircle, ExternalLink } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface CaseCreatedCardProps {
  data: {
    case: FraudCase;
  };
}

export const CaseCreatedCard: React.FC<CaseCreatedCardProps> = ({ data }) => {
  const { setActiveView } = useBanking();
  const c = data.case;

  return (
    <div className="bg-slate-900/95 border border-amber-500/50 rounded-xl p-4 my-2 shadow-card backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <FileText size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block">Reclamo generado</span>
            <h4 className="text-sm font-bold text-white font-mono">{c.case_id}</h4>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          🟡 En investigación
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-400 text-[10px] block">Tipo de Reclamo</span>
          <span className="text-white font-medium">{c.reason}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Monto en Disputa</span>
          <span className="text-amber-400 font-mono font-bold">${c.amount.toFixed(2)} USD</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Fecha de Incidente</span>
          <span className="text-slate-300">04/09/2026</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Canal de Ingreso</span>
          <span className="text-cyan-300 font-medium">{c.channel}</span>
        </div>
        <div className="col-span-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Building2 size={12} className="text-slate-400" />
            {c.department}
          </span>
          <span className="text-amber-300 font-medium flex items-center gap-1">
            <Clock size={12} />
            {c.estimated_resolution}
          </span>
        </div>
      </div>

      <button
        onClick={() => setActiveView('cases')}
        className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-all border border-cyan-500/30 flex items-center justify-center gap-1.5 hover:shadow-glow-teal"
      >
        <ExternalLink size={13} />
        Ver seguimiento de reclamos
      </button>
    </div>
  );
};
