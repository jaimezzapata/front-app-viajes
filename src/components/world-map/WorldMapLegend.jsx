import React from 'react';
import { Plane } from 'lucide-react';

export function WorldMapLegend({
  multiColor = false,
  showFlightsInternal,
  flightRoutes = [],
  confirmedCount = 0,
  pendingCount = 0
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0A0D14] border-t border-[#1C2436] text-xs">
      <div className="flex flex-wrap items-center gap-4">
        {multiColor ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF85] border border-[#0A0D14]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] border border-[#0A0D14]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] border border-[#0A0D14]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#B55FE6] border border-[#0A0D14]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E] border border-[#0A0D14]" />
            </div>
            <span className="text-[#F1F5F9] font-semibold text-[11px]">Países Visitados</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#00FF85] border border-[#00FF85]" />
            <span className="text-[#F1F5F9] font-semibold text-[11px]">Destino Confirmado (Con Vuelo)</span>
          </div>
        )}

        {!multiColor && (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-transparent border-2 border-dashed border-[#00E5FF]" />
            <span className="text-[#00E5FF] font-semibold text-[11px]">Ruta Pendiente (Sin Vuelo)</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#151B27] border border-[#1C2436]" />
          <span className="text-[#8492A6] text-[11px]">Por explorar</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#FFE500] border border-[#FFE500]" />
          <span className="text-[#8492A6] text-[11px]">Selección</span>
        </div>

        {showFlightsInternal && flightRoutes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-[#00E5FF]" />
            <span className="text-[#00E5FF] font-bold text-[11px] flex items-center gap-1">
              <Plane className="w-3 h-3" /> Trayecto de Vuelo
            </span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-[#8492A6]">
        {multiColor ? (
          <>
            Países visitados:{' '}
            <span className="font-bold text-[#00FF85] text-xs">
              {confirmedCount}
            </span>{' '}
            de <span className="font-semibold text-[#F1F5F9]">195</span> ({((confirmedCount / 195) * 100).toFixed(1)}% del mundo)
          </>
        ) : (
          <>
            Confirmados:{' '}
            <span className="font-bold text-[#00FF85] text-xs">
              {confirmedCount}
            </span>
            {pendingCount > 0 && (
              <>
                {' '}| En ruta pendiente:{' '}
                <span className="font-bold text-[#00E5FF] text-xs">
                  {pendingCount}
                </span>
              </>
            )}{' '}
            de <span className="font-semibold text-[#F1F5F9]">195</span>
          </>
        )}
      </div>
    </div>
  );
}

export default WorldMapLegend;

