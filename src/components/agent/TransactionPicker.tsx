import React from 'react';
import { BankTransaction } from '../../types/banking';
import { useBanking } from '../../context/BankingContext';
import { AlertCircle, ArrowUpRight, DollarSign, CreditCard } from 'lucide-react';

interface TransactionPickerProps {
  data: {
    transactions: BankTransaction[];
  };
}

export const TransactionPicker: React.FC<TransactionPickerProps> = ({ data }) => {
  const { selectTransactionToDispute } = useBanking();
  const txList = data.transactions?.slice(0, 4) || [];

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 my-2 shadow-card backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <CreditCard size={15} className="text-cyan-400" />
          <h4 className="text-xs font-semibold text-white">Últimos Movimientos</h4>
        </div>
        <span className="text-[10px] text-slate-400">Selecciona el cargo a reportar</span>
      </div>

      <div className="space-y-2">
        {txList.map((tx) => {
          const isSuspectATM = tx.amount === 300 || tx.merchant.includes('ATM');
          return (
            <div
              key={tx.id}
              onClick={() => selectTransactionToDispute(tx.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                isSuspectATM
                  ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/40 hover:border-amber-400 shadow-sm'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSuspectATM ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {isSuspectATM ? <AlertCircle size={16} /> : <DollarSign size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {tx.merchant}
                    </span>
                    {isSuspectATM && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                        Reportar
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span>{tx.type_label}</span>
                    <span>•</span>
                    <span className="font-mono">****{tx.card_last4}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold font-mono block ${isSuspectATM ? 'text-amber-400 font-extrabold' : 'text-slate-100'}`}>
                  -${tx.amount.toFixed(2)}
                </span>
                <span className="text-[10px] text-cyan-400 group-hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                  Seleccionar <ArrowUpRight size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
