import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { 
  Building2, 
  CreditCard, 
  QrCode, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const TransfersScreen: React.FC = () => {
  const { accounts, setIsDrawerOpen, sendMessage } = useBanking();
  const [transferType, setTransferType] = useState<'propias' | 'otros' | 'qr'>('propias');
  const [selectedDest, setSelectedDest] = useState('Cuenta de Ahorro a la Vista **** 7712');
  const [amount, setAmount] = useState('100.00');
  const [description, setDescription] = useState('Ahorro mensual');
  const [isScheduled, setIsScheduled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const chips = ['25', '50', '100', '250', 'Otro'];

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompleted(true);
  };

  return (
    <div className="space-y-4 pb-32 text-slate-800 animate-in fade-in duration-200 max-w-md mx-auto">
      {/* 3 Tabs (Page 6 of PDF) */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setTransferType('propias')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
            transferType === 'propias' ? 'bg-[#425E5A] text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          <CreditCard size={13} />
          <span>A cuentas propias</span>
        </button>

        <button
          onClick={() => setTransferType('otros')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
            transferType === 'otros' ? 'bg-[#425E5A] text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          <Building2 size={13} />
          <span>A otros bancos</span>
        </button>

        <button
          onClick={() => setTransferType('qr')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] ${
            transferType === 'qr' ? 'bg-[#425E5A] text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          <QrCode size={13} />
          <span>Con QR</span>
        </button>
      </div>

      {isCompleted ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Transferencia Exitosa</h3>
            <p className="text-xs text-slate-500 mt-1">Se transfirieron ${amount} a {selectedDest}</p>
          </div>
          <button
            onClick={() => setIsCompleted(false)}
            className="w-full py-2.5 rounded-xl bg-[#425E5A] text-white font-bold text-xs"
          >
            Hacer otra transferencia
          </button>
        </div>
      ) : (
        <form onSubmit={handleTransfer} className="space-y-4">
          {/* Desde (Page 6 of PDF) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Desde</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#425E5A] text-[#C1BA73] flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cuenta Corriente</h4>
                  <p className="text-[10px] text-slate-400 font-mono">**** 4829 | Cuenta de Cheques</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-mono text-slate-900">$12,430.50</span>
                <span className="text-[10px] text-slate-400 block">Disponible</span>
              </div>
            </div>
          </div>

          {/* Hacia (Page 6 of PDF) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Hacia</span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer hover:border-[#425E5A]">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <Plus size={14} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Selecciona una cuenta</span>
                  <span className="text-[10px] text-slate-400 block">Elige una de tus cuentas</span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* Cuentas frecuentes */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span>CUENTAS FRECUENTES</span>
                <span className="text-[#425E5A] font-semibold cursor-pointer">Ver todas</span>
              </div>

              <div className="space-y-2 text-xs">
                <div
                  onClick={() => setSelectedDest('Cuenta de Ahorro a la Vista **** 7712')}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                    selectedDest.includes('7712') ? 'border-[#425E5A] bg-[#425E5A]/5' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#425E5A] text-[#C1BA73] flex items-center justify-center">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Cuenta de Ahorro a la Vista</span>
                      <span className="text-[10px] text-slate-400 font-mono block">**** 7712 | Cuenta de Ahorros</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">$8,162.35 &gt;</span>
                </div>

                <div
                  onClick={() => setSelectedDest('Depósito a Plazo Fijo **** 1198')}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                    selectedDest.includes('1198') ? 'border-[#425E5A] bg-[#425E5A]/5' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#425E5A] text-[#C1BA73] flex items-center justify-center">
                      <DollarSign size={14} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Depósito a Plazo Fijo</span>
                      <span className="text-[10px] text-slate-400 font-mono block">**** 1198 | A plazo fijo</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">$5,000.00 &gt;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monto & Quick Chips (Page 6 of PDF) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Monto</span>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-base font-bold text-slate-400">$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ingresa el monto"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono text-slate-900 focus:outline-none focus:border-[#425E5A] focus:bg-white"
              />
              <span className="absolute right-3.5 text-xs text-slate-400 font-mono">USD</span>
            </div>

            <div className="flex gap-2 text-xs">
              {chips.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => c !== 'Otro' && setAmount(`${c}.00`)}
                  className={`flex-1 py-1.5 rounded-lg border font-medium text-[11px] transition-all ${
                    amount === `${c}.00` ? 'bg-[#425E5A] text-white border-[#425E5A]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c === 'Otro' ? 'Otro' : `$${c}`}
                </button>
              ))}
            </div>

            {/* Descripción */}
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Descripción (opcional)</span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Para qué es esta transferencia?"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#425E5A]"
              />
            </div>

            {/* Programar Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs">
                <Calendar size={15} className="text-[#425E5A]" />
                <div>
                  <span className="font-semibold text-slate-800">Programar transferencia</span>
                  <p className="text-[10px] text-slate-400">Elige la fecha y hora</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 accent-[#425E5A] cursor-pointer"
              />
            </div>
          </div>

          {/* Continuar Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#425E5A] hover:bg-[#2E423F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Continuar</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
};
