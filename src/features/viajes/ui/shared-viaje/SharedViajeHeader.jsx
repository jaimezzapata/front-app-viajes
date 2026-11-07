import React from 'react';
import { Globe2, Share2, Plane } from 'lucide-react';
import ThemeToggle from '../../../../components/ThemeToggle';

export function SharedViajeHeader({ onOpenShareModal, onExit, onGoToApp }) {
  return (
    <header className="bg-[#0E121B] border-b border-[#1C2436] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-40 w-full max-w-full overflow-hidden backdrop-blur-md">
      <div className="max-w-[1700px] w-full mx-auto flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85] shrink-0">
            <Globe2 className="w-4 h-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-[#F1F5F9] uppercase truncate">
                BITÁCORA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30 shrink-0">
                Viaje Compartido
              </span>
            </div>
            <p className="text-[10px] text-[#8492A6] m-0 truncate">
              Vista pública interactiva en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle size="sm" />

          <button
            onClick={onOpenShareModal}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Compartir este viaje"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </button>

          <button
            onClick={onGoToApp || onExit}
            className="px-3 sm:px-4 py-1.5 rounded-lg bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plane className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Crear Mi Bitácora</span>
            <span className="sm:hidden">App</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default SharedViajeHeader;

