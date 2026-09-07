import React from 'react';
import { useBanking } from '../../context/BankingContext';
import { ScreenTab } from '../../types/banking';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeftRight, 
  FileText, 
  CreditCard, 
  Download, 
  MoreHorizontal, 
  ShoppingBag, 
  Zap, 
  AlertCircle,
  TrendingDown,
  Sparkles,
  Pencil,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import infinityMark from '../../assets/logo-bancovi-mark.svg';
import { useDragScroll } from '../../hooks/useDragScroll';

// El Salvador's local hour, regardless of the timezone the app happens to be viewed from.
const getElSalvadorHour = () => {
  const hourPart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/El_Salvador',
    hour: 'numeric',
    hour12: false
  })
    .formatToParts(new Date())
    .find(p => p.type === 'hour')?.value;
  return (Number(hourPart) || 0) % 24;
};

const getGreeting = () => {
  const hour = getElSalvadorHour();
  if (hour >= 5 && hour < 12) return { text: 'Buenos días', Icon: Sun, color: 'text-amber-500' };
  if (hour >= 12 && hour < 19) return { text: 'Buenas tardes', Icon: Sunset, color: 'text-orange-500' };
  return { text: 'Buenas noches', Icon: Moon, color: 'text-indigo-400' };
};

interface HomeScreenProps {
  onNavigate: (tab: ScreenTab) => void;
  highlightedTxId?: string | null;
  isConsultingTx?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  highlightedTxId,
  isConsultingTx = false
}) => {
  const { customer, accounts, transactions, setIsDrawerOpen, sendLiveText } = useBanking();
  const [showBalance, setShowBalance] = React.useState(true);

  const checking = accounts.find(a => a.account_id === 'ACC-4829') || accounts[0];
  const savings = accounts.find(a => a.account_id === 'ACC-7712') || accounts[1];
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const greeting = getGreeting();
  const accountsCarousel = useDragScroll<HTMLDivElement>();

  return (
    <div className="space-y-4 pb-32 text-slate-800 animate-in fade-in duration-200 max-w-md mx-auto">
      {/* Saludo Personalizado */}
      <div className="pt-2 px-1">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <greeting.Icon size={20} className={greeting.color} />
          <span>{greeting.text}, {customer.first_name}</span>
        </h1>
        <p className="text-xs text-slate-500">¿Qué deseas hacer hoy?</p>
      </div>

      {/* Saldo Total Card (Matching Page 4 of PDF) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#425E5A] via-[#093230] to-[#2E423F] text-white p-6 shadow-xl">
        {/* Official Infinity Watermark */}
        <div className="absolute right-4 -bottom-6 w-44 h-44 opacity-25 pointer-events-none">
          <img src={infinityMark} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
            <span>Saldo total</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/70 hover:text-white"
            >
              {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>

          <div className="text-3xl font-extrabold font-mono tracking-tight text-white mt-1.5 mb-1">
            {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
          </div>

          <p className="text-[11px] text-white/70">Tus cuentas en un vistazo</p>

          <button
            onClick={() => onNavigate('accounts')}
            className="mt-4 px-3.5 py-1.5 rounded-full bg-[#C1BA73] hover:bg-[#D6CE94] text-[#425E5A] font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Ver cuentas</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Acciones Rápidas (Page 4 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <span className="font-bold text-slate-800">Acciones rápidas</span>
          <span className="text-[10px] text-slate-400 cursor-pointer hover:text-[#425E5A] flex items-center gap-1">
            Personalizar <Pencil size={11} />
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-700 font-medium">
          <button
            onClick={() => onNavigate('transfers')}
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <ArrowLeftRight size={18} />
            </div>
            <span>Transferir</span>
          </button>

          <button
            onClick={() => {
              setIsDrawerOpen(true);
              sendLiveText('Quiero pagar un servicio');
            }}
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <FileText size={18} />
            </div>
            <span className="leading-tight">Pagar servicios</span>
          </button>

          <button
            onClick={() => onNavigate('cards')}
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <CreditCard size={18} />
            </div>
            <span className="leading-tight">Pagar tarjeta</span>
          </button>

          <button
            onClick={() => {
              setIsDrawerOpen(true);
              sendLiveText('Quiero hacer un depósito');
            }}
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A] shadow-sm">
              <Download size={18} />
            </div>
            <span>Depositar</span>
          </button>

          <button
            onClick={() => onNavigate('more')}
            className="flex flex-col items-center gap-1.5 p-1 hover:text-[#425E5A]"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
              <MoreHorizontal size={18} />
            </div>
            <span>Más</span>
          </button>
        </div>
      </div>

      {/* Mis Cuentas (Carousel Preview - Page 4 of PDF) */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2 px-1">
          <span className="font-bold text-slate-800">Mis cuentas</span>
          <button onClick={() => onNavigate('accounts')} className="text-[#425E5A] font-medium text-[11px] hover:underline">
            Ver todas &gt;
          </button>
        </div>

        <div
          ref={accountsCarousel.ref}
          {...accountsCarousel.handlers}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
        >
          {/* Card 1: checking account */}
          <div className="w-full shrink-0 snap-center bg-[#425E5A] text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CreditCard size={14} className="text-[#C1BA73]" />
                <span className="font-semibold">{checking.name}</span>
              </div>
              <span className="text-[10px] text-white/60 font-mono">{checking.account_number_masked}</span>
            </div>

            <div className="mt-3">
              <div className="text-lg font-bold font-mono text-white">
                ${checking.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/70 mt-1">
                <span>Disponible</span>
                <button onClick={() => onNavigate('accounts')} className="text-[#C1BA73] font-medium hover:underline">Ver detalle &gt;</button>
              </div>
            </div>
          </div>

          {/* Card 2: savings account */}
          <div className="w-full shrink-0 snap-center bg-[#425E5A] text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Sparkles size={14} className="text-[#C1BA73]" />
                <span className="font-semibold">{savings.name}</span>
              </div>
              <span className="text-[10px] text-white/60 font-mono">{savings.account_number_masked}</span>
            </div>

            <div className="mt-3">
              <div className="text-lg font-bold font-mono text-white">
                ${savings.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/70 mt-1">
                <span>Disponible</span>
                <button onClick={() => onNavigate('accounts')} className="text-[#C1BA73] font-medium hover:underline">Ver detalle &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movimientos Recientes (Page 4 of PDF) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Movimientos recientes</span>
            {isConsultingTx && (
              <span className="text-[10px] text-[#425E5A] font-medium bg-[#425E5A]/10 px-2 py-0.5 rounded-full animate-pulse">
                Nito consultando...
              </span>
            )}
          </div>
          <button onClick={() => onNavigate('accounts')} className="text-[#425E5A] font-medium text-[11px] hover:underline">
            Ver todos &gt;
          </button>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {transactions.slice(0, 4).map((tx) => {
            const isHighlight = highlightedTxId === tx.id || (highlightedTxId === '300' && Math.abs(tx.amount) === 300);
            const isPositive = tx.amount > 0;

            return (
              <div
                key={tx.id}
                className={`pt-2.5 flex items-center justify-between transition-all rounded-xl p-1.5 ${
                  isHighlight
                    ? 'bg-amber-50 ring-2 ring-amber-400'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isPositive ? (
                      <ArrowLeftRight size={16} />
                    ) : tx.category === 'Supermercado' ? (
                      <ShoppingBag size={16} />
                    ) : tx.category === 'Servicios' ? (
                      <Zap size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {tx.merchant}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tx.detail}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold font-mono block ${
                    isPositive ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {isPositive ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {tx.date}, {tx.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
