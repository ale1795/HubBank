import React from 'react';
import { ScreenTab } from '../../types/banking';
import { VisionarioLogo } from '../common/VisionarioLogo';
import { useBanking } from '../../context/BankingContext';
import { Bell, Wifi, Battery, Signal } from 'lucide-react';

interface AppHeaderProps {
  activeTab: ScreenTab;
  onOpenNito: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onOpenNito
}) => {
  const { customer } = useBanking();
  const initials = `${customer.first_name[0]}${customer.last_name[0]}`;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'accounts': return 'Cuentas';
      case 'transfers': return 'Transferir';
      case 'cards': return 'Tarjetas';
      case 'more': return 'Más';
      default: return null;
    }
  };

  const title = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-[#425E5A] text-white border-b border-[#2E423F] px-4 pt-2 pb-3 shadow-md sm:rounded-t-3xl">
      {/* Phone Status Bar (9:41, Icons) */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-white/80 pb-2 px-1">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal size={12} />
          <Wifi size={12} />
          <Battery size={14} className="fill-current" />
        </div>
      </div>

      {/* Main Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0">
            <VisionarioLogo variant="compact" size="sm" />
          </div>
          {title && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/20 min-w-0">
              <span className="text-sm font-bold tracking-tight text-white truncate">{title}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notifications Bell */}
          <div className="relative cursor-pointer p-1 text-white/90 hover:text-white shrink-0">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C1BA73] ring-2 ring-[#425E5A]" />
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#2E423F] border border-[#C1BA73]/50 text-[#C1BA73] text-xs font-bold flex items-center justify-center shadow-inner shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
