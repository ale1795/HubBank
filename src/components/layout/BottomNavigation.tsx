import React from 'react';
import { ScreenTab } from '../../types/banking';
import { Home, Wallet, ArrowLeftRight, CreditCard, MoreHorizontal } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'home' as ScreenTab, label: 'Inicio', icon: Home },
    { id: 'accounts' as ScreenTab, label: 'Cuentas', icon: Wallet },
    { id: 'transfers' as ScreenTab, label: 'Transferir', icon: ArrowLeftRight },
    { id: 'cards' as ScreenTab, label: 'Tarjetas', icon: CreditCard },
    { id: 'more' as ScreenTab, label: 'Más', icon: MoreHorizontal },
  ];

  return (
    <nav className="bg-[#425E5A] text-white border-t border-[#2E423F] px-3 py-2 flex items-center justify-around shadow-2xl sm:rounded-b-3xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#C1BA73] font-bold scale-105'
                : 'text-white/60 hover:text-white/90 font-medium'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#C1BA73] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
