import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle, ShieldCheck } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface CardBlockPromptProps {
  data: {
    card_last4: string;
    card_id: string;
    transaction: any;
  };
}

export const CardBlockPrompt: React.FC<CardBlockPromptProps> = ({ data }) => {
  const { confirmCardBlock, cards } = useBanking();
  const [decided, setDecided] = useState<boolean>(false);
  const isBlocked = cards.find(c => c.last4 === data.card_last4)?.status === 'BLOCKED';

  const handleBlock = (shouldBlock: boolean) => {
    setDecided(true);
    confirmCardBlock(data.card_id, shouldBlock);
  };

  return (
    <div className="bg-slate-900/95 border border-amber-500/50 rounded-xl p-4 my-2 shadow-card">
      <div className="flex items-center gap-2 mb-2 text-amber-300">
        <ShieldAlert size={17} />
        <h4 className="text-xs font-bold uppercase tracking-wider">Acción Preventiva Recomendada</h4>
      </div>

      <p className="text-xs text-slate-200 mb-3">
        ¿Deseas bloquear temporalmente la tarjeta de crédito terminada en{' '}
        <strong className="text-amber-400 font-mono">****{data.card_last4}</strong> para evitar nuevos cargos sospechosos?
      </p>

      {!decided && !isBlocked ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleBlock(true)}
            className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Lock size={14} />
            Sí, bloquear tarjeta
          </button>
          <button
            onClick={() => handleBlock(false)}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all border border-slate-700 flex items-center justify-center gap-1.5"
          >
            No, continuar sin bloquear
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            {isBlocked ? (
              <>
                <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Lock size={12} />
                </div>
                <div>
                  <span className="font-bold text-red-400">🔒 BLOQUEADA TEMPORALMENTE</span>
                  <p className="text-[11px] text-slate-400">Tarjeta terminada en {data.card_last4} protegida</p>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck size={16} className="text-slate-400" />
                <span className="text-slate-300">Tarjeta activa (Bloqueo omitido por usuario)</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
