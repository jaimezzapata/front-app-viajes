import React from 'react';
import { Globe2, MapPin, Wallet, PieChart, ShieldCheck } from 'lucide-react';

export const TABS = [
  { id: 'viajes', label: 'Mis Viajes', icon: Globe2, neonColor: 'text-[#00FF85]', activeBorder: 'border-[#00FF85]', indicatorBg: 'bg-[#00FF85]' },
  { id: 'itinerario', label: 'Itinerario', icon: MapPin, neonColor: 'text-[#00E5FF]', activeBorder: 'border-[#00E5FF]', indicatorBg: 'bg-[#00E5FF]' },
  { id: 'billetera', label: 'Billetera', icon: Wallet, neonColor: 'text-[#00FF85]', activeBorder: 'border-[#00FF85]', indicatorBg: 'bg-[#00FF85]' },
  { id: 'balance', label: 'Balance', icon: PieChart, neonColor: 'text-[#FFE500]', activeBorder: 'border-[#FFE500]', indicatorBg: 'bg-[#FFE500]' },
  { id: 'boveda', label: 'Bóveda', icon: ShieldCheck, neonColor: 'text-[#B55FE6]', activeBorder: 'border-[#B55FE6]', indicatorBg: 'bg-[#B55FE6]' }
];

export function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E121B] border-t border-[#1C2436] md:hidden px-1 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around select-none backdrop-blur-md w-full max-w-full overflow-hidden">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 min-w-0 max-w-[80px] min-h-[44px] rounded-lg transition-colors relative cursor-pointer ${
              isActive ? 'bg-[#151B27]' : 'text-[#8492A6] hover:text-[#F1F5F9]'
            }`}
          >
            {/* Indicador de pestaña activa superior */}
            {isActive && (
              <span className={`absolute top-0 left-1 right-1 h-[2px] ${tab.indicatorBg || 'bg-[#00FF85]'}`} />
            )}
            
            <Icon
              className={`w-4.5 h-4.5 mb-1 shrink-0 ${
                isActive ? tab.neonColor : 'text-[#8492A6]'
              }`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-[10px] sm:text-[11px] font-medium tracking-tight truncate w-full text-center ${
                isActive ? 'text-[#F1F5F9]' : 'text-[#8492A6]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
