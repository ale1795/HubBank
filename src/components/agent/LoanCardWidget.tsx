import React from 'react';
import { BankLoan } from '../../types/banking';
import { BadgePercent, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface LoanCardWidgetProps {
  data: {
    loan: BankLoan;
  };
}

export const LoanCardWidget: React.FC<LoanCardWidgetProps> = ({ data }) => {
  const { setActiveView } = useBanking();
  const loan = data.loan;

  return (
    <div className="bg-slate-900/95 border border-emerald-500/40 rounded-xl p-4 my-2 shadow-card backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BadgePercent size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{loan.product}</h4>
            <p className="text-[11px] text-emerald-400 font-mono">ID: {loan.loan_id}</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
          AL DÍA
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-400 text-[10px] block">Saldo pendiente</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            ${loan.outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Próxima cuota</span>
          <span className="text-sm font-bold font-mono text-white">
            ${loan.next_payment.toFixed(2)} USD
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Fecha de pago</span>
          <span className="text-slate-200 font-medium flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" />
            {loan.next_payment_date}
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Tasa de Interés</span>
          <span className="text-emerald-300 font-bold font-mono">{loan.interest_rate.toFixed(2)}% APR</span>
        </div>
      </div>

      <button
        onClick={() => setActiveView('loans')}
        className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium transition-all border border-emerald-500/30 flex items-center justify-center gap-1"
      >
        Ver plan de amortización completo <ArrowRight size={12} />
      </button>
    </div>
  );
};
