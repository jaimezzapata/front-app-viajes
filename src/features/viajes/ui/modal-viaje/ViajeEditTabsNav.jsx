import React from 'react';
import { LayoutGrid } from 'lucide-react';

export function ViajeEditTabsNav({ editTab, setEditTab }) {
  return (
    <div className="space-y-1">
      <div className="bg-[#0A0D14] p-1 rounded-xl border border-[#1C2436] grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => setEditTab('todo')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            editTab === 'todo'
              ? 'bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/40 shadow-sm'
              : 'text-[#8492A6] hover:text-[#F1F5F9] border border-transparent'
          }`}
        >
          <LayoutGrid className="w-3 h-3" />
          <span>Ver Todo</span>
        </button>

        <button
          type="button"
          onClick={() => setEditTab('ruta')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            editTab === 'ruta'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-[#8492A6] hover:text-[#F1F5F9] border border-transparent'
          }`}
        >
          <span>📍 Ruta</span>
        </button>

        <button
          type="button"
          onClick={() => setEditTab('fechas')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            editTab === 'fechas'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-[#8492A6] hover:text-[#F1F5F9] border border-transparent'
          }`}
        >
          <span>📅 Fechas</span>
        </button>

        <button
          type="button"
          onClick={() => setEditTab('presupuesto')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            editTab === 'presupuesto'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
              : 'text-[#8492A6] hover:text-[#F1F5F9] border border-transparent'
          }`}
        >
          <span>💰 Presupuesto</span>
        </button>
      </div>
      <p className="text-[10px] text-[#8492A6] px-1 m-0">
        Edita directamente el campo que requieras y presiona <strong className="text-[#00FF85]">Guardar Cambios</strong> en cualquier momento.
      </p>
    </div>
  );
}

export default ViajeEditTabsNav;

