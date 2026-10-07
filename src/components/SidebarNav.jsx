import React from 'react';
import { Compass, User, Globe2, LogOut } from 'lucide-react';
import { TABS } from './BottomNav';
import WatermarkIcon from './WatermarkIcon';
import ThemeToggle from './ThemeToggle';

export function SidebarNav({ activeTab, onSelectTab, usuario, onOpenAuth, onLogout }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0E121B] border-r border-[#1C2436] min-h-screen p-5 select-none relative overflow-hidden shrink-0">
      {/* Marca de agua sólida en el sidebar */}
      <WatermarkIcon icon={Globe2} className="w-56 h-56 -bottom-10 -right-12" opacity="opacity-[0.03]" color="text-[#00E5FF]" />

      {/* Header Logo */}
      <div className="flex items-center gap-3 mb-8 z-10">
        <div className="w-10 h-10 bg-[#151B27] border border-[#2B3750] flex items-center justify-center rounded-lg">
          <Compass className="w-6 h-6 text-[#00FF85]" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-[#F1F5F9] m-0">BITÁCORA</h1>
          <span className="text-[10px] tracking-widest text-[#00E5FF] uppercase font-semibold">Offline First</span>
        </div>
      </div>

      {/* Tabs list */}
      <nav className="flex flex-col gap-1.5 z-10 flex-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors text-left relative ${
                isActive
                  ? 'bg-[#151B27] text-[#F1F5F9] border-l-2 ' + tab.activeBorder
                  : 'text-[#8492A6] hover:bg-[#121622] hover:text-[#F1F5F9]'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? tab.neonColor : 'text-[#8492A6]'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile & Theme toggle */}
      <div className="pt-4 border-t border-[#1C2436] z-10 flex flex-col gap-3">
        {/* Toggle de tema claro / oscuro */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8492A6]">
            Tema
          </span>
          <ThemeToggle size="sm" showLabel={true} />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenAuth}
            className="flex-1 min-w-0 flex items-center gap-3 p-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#2B3750] transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#080A0F] border border-[#00FF85] flex items-center justify-center text-[#00FF85] shrink-0">
              <User className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F1F5F9] truncate m-0">
                {usuario ? usuario.nombre : 'Iniciar Sesión'}
              </p>
              <p className="text-[10px] text-[#8492A6] truncate m-0">
                {usuario ? usuario.email : 'Sin autenticar'}
              </p>
            </div>
          </button>

          {usuario && onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer shrink-0"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4 text-[#FF2E55]" strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default SidebarNav;
