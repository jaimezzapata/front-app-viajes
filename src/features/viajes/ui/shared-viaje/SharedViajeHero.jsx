import React from 'react';
import { Globe2, Clock, Calendar } from 'lucide-react';
import WatermarkIcon from '../../../../components/WatermarkIcon';
import MiniFlag from '../../../../components/MiniFlag';
import { cleanCountryText, fixAccents } from '../../../../utils/countries';

export function SharedViajeHero({ viaje, status, diffDays, totalGastadoCOP }) {
  const cleanDestino = cleanCountryText(viaje.destino);
  const tituloViaje = fixAccents(viaje.titulo);

  return (
    <div className="relative p-4 sm:p-6 rounded-2xl bg-[#0E121B] border border-[#1C2436] shadow-xl overflow-hidden">
      <WatermarkIcon icon={Globe2} className="w-80 h-80 -bottom-10 -right-10 pointer-events-none" opacity="opacity-[0.03]" color="text-[#00E5FF]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Badges superiores */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${status.bg} ${status.color} ${status.border}`}>
              {status.label}
            </span>

            {viaje.tipoViaje === 'multidestino' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                🗺️ Ruta Multidestino
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                📍 Destino Único
              </span>
            )}

            <span className="text-[11px] text-[#8492A6] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#B55FE6]" />
              <span>{diffDays} {diffDays === 1 ? 'Día' : 'Días de aventura'}</span>
            </span>
          </div>

          {/* Título Principal y Destino */}
          <h1 className="text-xl sm:text-3xl font-black text-[#F1F5F9] m-0 tracking-tight leading-tight">
            {tituloViaje}
          </h1>

          {/* Ruta o Destinos */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1.5 bg-[#151B27] px-3 py-1.5 rounded-lg border border-[#1C2436] text-[#CBD5E1]">
              <MiniFlag country={viaje.destino} className="w-5 h-3.5 shrink-0" />
              <span className="truncate">{cleanDestino}</span>
            </div>

            {viaje.origen && (
              <span className="text-xs text-[#8492A6] flex items-center gap-1">
                <span>Partida desde:</span>
                <strong className="text-[#00FF85]">{cleanCountryText(viaje.origen)}</strong>
              </span>
            )}

            {viaje.escalas && (
              <span className="text-xs text-[#8492A6] flex items-center gap-1">
                <span>• Escalas:</span>
                <strong className="text-[#FFE500]">{cleanCountryText(viaje.escalas)}</strong>
              </span>
            )}
          </div>

          {/* Fechas */}
          <p className="text-xs text-[#8492A6] mt-2 m-0 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>
              Del {new Date(viaje.fechaInicio).toLocaleDateString()} al {new Date(viaje.fechaFin).toLocaleDateString()}
            </span>
          </p>

          {viaje.descripcion && (
            <p className="text-xs text-[#8492A6] mt-2.5 max-w-3xl leading-relaxed m-0 bg-[#0A0D14]/80 p-2.5 rounded-lg border border-[#1C2436]/50">
              {fixAccents(viaje.descripcion)}
            </p>
          )}
        </div>

        {/* Tarjeta rápida de Presupuesto del Viaje */}
        <div className="bg-[#0A0D14] border border-[#1C2436] rounded-xl p-3.5 sm:p-4 shrink-0 flex flex-col justify-center min-w-[220px]">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
            Presupuesto Total
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#FFE500] m-0 mt-0.5">
            ${(Number(viaje.presupuestoTotal) || 0).toLocaleString('es-CO')}
            <span className="text-xs font-semibold text-[#8492A6] ml-1">{viaje.monedaBase || 'COP'}</span>
          </p>

          {totalGastadoCOP > 0 && (
            <div className="mt-2 pt-2 border-t border-[#1C2436] flex items-center justify-between text-xs">
              <span className="text-[#8492A6]">Registrado:</span>
              <span className="font-bold text-[#00FF85]">
                ${totalGastadoCOP.toLocaleString('es-CO')} COP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SharedViajeHero;

