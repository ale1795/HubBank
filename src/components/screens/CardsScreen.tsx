import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { 
  Lock, 
  Unlock, 
  Sliders, 
  Bell, 
  KeyRound, 
  MoreHorizontal, 
  Wifi, 
  Shield, 
  ShoppingBag, 
  Fuel, 
  Utensils, 
  AlertCircle,
  CreditCard,
  Settings,
  Info,
  Receipt,
  Landmark
} from 'lucide-react';
import infinityMark from '../../assets/logo-bancovi-mark.svg';
import { useDragScroll } from '../../hooks/useDragScroll';

interface CardsScreenProps {
  highlightedTxId?: string | null;
}

export const CardsScreen: React.FC<CardsScreenProps> = ({ highlightedTxId }) => {
  const { cards, confirmCardBlock, transactions } = useBanking();
  const [activeTab, setActiveTab] = useState<'mis' | 'solicitar' | 'beneficios'>('mis');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.card_id);
  const cardSwitcher = useDragScroll<HTMLDivElement>();

  const activeCard = cards.find(c => c.card_id === selectedCardId) || cards[0];
  const isBlocked = activeCard.status === 'BLOCKED';
  const isBlocking = activeCard.status === 'BLOCKING';

  return (
    <div className="space-y-4 pb-32 text-slate-800 animate-in fade-in duration-200 max-w-md mx-auto">
      {/* 3 Tabs (Page 7 of PDF) */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('mis')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'mis' ? 'bg-[#425E5A] text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          Mis tarjetas
        </button>
        <button
          onClick={() => setActiveTab('solicitar')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'solicitar' ? 'bg-[#425E5A] text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          Solicitar tarjeta
        </button>
        <button
          onClick={() => setActiveTab('beneficios')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'beneficios' ? 'bg-[#425E5A] text-white shadow-sm' : 'text-slate-600'
          }`}
        >
          Beneficios
        </button>
      </div>

      {/* Mis Tarjetas Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-800">Mis tarjetas</span>
        <span className="text-[11px] text-[#425E5A] font-medium flex items-center gap-1 cursor-pointer hover:underline">
          Administrar tarjetas <Settings size={12} />
        </span>
      </div>

      {/* Card Switcher (only shown when the customer has more than one card) */}
      {cards.length > 1 && (
        <div
          ref={cardSwitcher.ref}
          {...cardSwitcher.handlers}
          className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none cursor-grab active:cursor-grabbing select-none"
        >
          {cards.map((c) => (
            <button
              key={c.card_id}
              onClick={() => setSelectedCardId(c.card_id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                c.card_id === activeCard.card_id
                  ? 'bg-[#425E5A] text-white border-[#425E5A] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#C1BA73]'
              }`}
            >
              {c.card_type === 'CREDIT' ? 'Crédito' : 'Débito'} •••• {c.last4}
            </button>
          ))}
        </div>
      )}

      {/* Realistic Plastic Card (Page 7 of PDF) */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 text-white min-h-[210px] flex flex-col justify-between shadow-2xl transition-all duration-500 border ${
          isBlocked
            ? 'bg-gradient-to-br from-red-950 via-[#425E5A] to-black border-red-500 shadow-red-900/30'
            : isBlocking
            ? 'bg-gradient-to-br from-amber-950 via-[#425E5A] to-slate-900 border-amber-400 animate-pulse'
            : 'bg-gradient-to-br from-[#425E5A] via-[#0D4442] to-[#2E423F] border-[#C1BA73]/40'
        }`}
      >
        {/* Golden Infinity Watermark */}
        <div className="absolute right-6 -bottom-6 w-52 h-52 opacity-35 pointer-events-none">
          <img src={infinityMark} alt="" className="w-full h-full object-contain" />
        </div>

        {/* Live Block Ribbon */}
        {isBlocked && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-lg animate-bounce">
            <Lock size={11} />
            <span>BLOQUEADA TEMPORALMENTE</span>
          </div>
        )}

        {isBlocking && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-lg animate-pulse">
            <span>BLOQUEANDO...</span>
          </div>
        )}

        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white">BANCO VISIONARIO</span>
          </div>

          {!isBlocked && !isBlocking && (
            <div className="text-right">
              <span className="text-[10px] text-white/70 block uppercase font-mono">
                {activeCard.card_type === 'CREDIT' ? 'Crédito' : 'Débito'}
              </span>
              <span className="text-xs font-mono font-bold text-[#C1BA73]">•••• {activeCard.last4}</span>
            </div>
          )}
        </div>

        {/* EMV Chip & Contactless */}
        <div className="flex items-center gap-3 my-2 relative z-10">
          <div className="w-10 h-7 rounded bg-gradient-to-tr from-[#C1BA73] to-[#E5C77E] border border-white/20 shadow-sm" />
          <Wifi size={16} className="text-white/80 rotate-90" />
        </div>

        {/* Card Footer: Holder & Network Mark */}
        <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
          <div>
            <span className="text-[9px] text-white/60 block uppercase font-mono tracking-wider">Titular</span>
            <span className="text-xs font-bold text-white tracking-widest">{activeCard.card_holder}</span>
          </div>

          <div className="flex items-center">
            {activeCard.brand === 'MASTERCARD' ? (
              <div className="relative w-9 h-6" aria-label="Mastercard">
                <span className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#EB001B]" />
                <span className="absolute left-3 top-0 w-6 h-6 rounded-full bg-[#F79E1B] mix-blend-screen" />
              </div>
            ) : (
              <span className="font-extrabold text-lg italic tracking-tighter text-white">{activeCard.brand}</span>
            )}
          </div>
        </div>
      </div>

      {/* Gasto del Mes Card (Page 7 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">Gasto del mes <Info size={11} className="text-slate-400" /></span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
            ${activeCard.monthly_spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">Actualizado hoy, 9:30 a.m.</span>
        </div>

        {/* Radial Progress Gauge (62% de tu límite) */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#425E5A]"
                strokeDasharray={`${activeCard.spent_percentage}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-800">{activeCard.spent_percentage}%</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Límite disponible</span>
            <span className="text-xs font-bold font-mono text-slate-800">${activeCard.limit_available.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-slate-400 block">de ${activeCard.total_limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas (Page 7 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <span className="text-xs font-bold text-slate-800 block mb-3 px-1">Acciones rápidas</span>
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-700 font-medium">
          <button
            onClick={() => confirmCardBlock(activeCard.card_id, !isBlocked)}
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              isBlocked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 border border-slate-100 text-[#425E5A]'
            }`}>
              {isBlocked ? <Unlock size={17} /> : <Lock size={17} />}
            </div>
            <span className="leading-tight">{isBlocked ? 'Desbloquear' : 'Bloquear tarjeta'}</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <Sliders size={17} />
            </div>
            <span className="leading-tight">Administrar límites</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <Bell size={17} />
            </div>
            <span className="leading-tight">Alertas y avisos</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <KeyRound size={17} />
            </div>
            <span className="leading-tight">Cambiar NIP</span>
          </button>

          <button
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
              <MoreHorizontal size={17} />
            </div>
            <span className="leading-tight">Más opciones</span>
          </button>
        </div>
      </div>

      {/* Movimientos Recientes de la Tarjeta (Page 7 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <span className="font-bold text-slate-800">Movimientos recientes</span>
          <span className="text-[#425E5A] font-medium text-[11px] cursor-pointer hover:underline">Ver todos &gt;</span>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          {transactions.filter(tx => tx.card_last4 === activeCard.last4).length === 0 && (
            <p className="text-[11px] text-slate-400 text-center py-4">
              Sin movimientos recientes en esta tarjeta.
            </p>
          )}
          {(() => {
            const cardTx = transactions.filter(tx => tx.card_last4 === activeCard.last4);
            const highlightIdx = highlightedTxId
              ? cardTx.findIndex(t => t.merchant.toLowerCase() === highlightedTxId.toLowerCase())
              : -1;
            return highlightIdx > 3
              ? [cardTx[highlightIdx], ...cardTx.filter((_, i) => i !== highlightIdx)].slice(0, 4)
              : cardTx.slice(0, 4);
          })().map((tx) => {
            const isHighlight = !!highlightedTxId && tx.merchant.toLowerCase() === highlightedTxId.toLowerCase();
            const CategoryIcon =
              tx.category === 'Supermercado' ? ShoppingBag :
              tx.category === 'Combustible' ? Fuel :
              tx.category === 'Restaurante' ? Utensils :
              tx.category === 'Servicios' ? Receipt :
              tx.category === 'Cajero Automático' ? Landmark :
              CreditCard;

            return (
              <div
                key={tx.id}
                className={`pt-2.5 flex items-center justify-between transition-all rounded-xl p-1.5 ${
                  isHighlight ? 'bg-amber-50 ring-2 ring-amber-400' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <CategoryIcon size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{tx.merchant}</span>
                    <span className="text-[10px] text-slate-400">{tx.detail}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-slate-900 block">${Math.abs(tx.amount).toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">{tx.date}, {tx.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Banner (Page 7 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#425E5A]/10 text-[#425E5A] flex items-center justify-center shrink-0 mt-0.5">
          <Shield size={18} />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-bold text-slate-900 block">Tu seguridad es nuestra prioridad</span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Activa las notificaciones para mantener tus tarjetas protegidas.
          </p>
          <a href="#activar" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#425E5A] font-bold mt-1 inline-block hover:underline">
            Activar ahora &gt;
          </a>
        </div>
      </div>
    </div>
  );
};
