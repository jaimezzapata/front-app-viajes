import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

export function ViajeFechasStep({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  duracionDias,
  descripcion,
  setDescripcion
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
            Fecha de Inicio *
          </label>
          <input
            type="date"
            required
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#00FF85]" />
            Fecha de Fin *
          </label>
          <input
            type="date"
            required
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
        </div>
      </div>

      {/* Tarjeta de Resumen de Duración */}
      {duracionDias > 0 && (
        <div className="p-3 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00FF85]" />
            <span className="text-xs font-bold text-[#F1F5F9]">
              Duración calculada:
            </span>
          </div>
          <span className="text-sm font-extrabold text-[#00FF85]">
            {duracionDias} {duracionDias === 1 ? 'día' : 'días'} de viaje
          </span>
        </div>
      )}

      {/* Descripción / Notas del viaje */}
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          Descripción o Notas de la Aventura (Opcional)
        </label>
        <textarea
          rows={3}
          placeholder="Ej. Recorrido por playas paradisíacas, templos históricos y gastronomía local..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none resize-none placeholder:text-[#8492A6]/40"
        />
      </div>
    </div>
  );
}

export default ViajeFechasStep;

