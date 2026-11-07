import React from 'react';
import { Clock } from 'lucide-react';

export function EventoHorariosSection({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Hora de Inicio *
        </label>
        <input
          type="datetime-local"
          required
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#FFE500]" /> Hora de Fin (Opcional)
        </label>
        <input
          type="datetime-local"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
        />
        <span className="text-[10px] text-[#8492A6] mt-0.5 block">Default +2h si se omite</span>
      </div>
    </div>
  );
}

export default EventoHorariosSection;

