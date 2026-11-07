import React from 'react';
import { Globe, Plane, Map as MapIcon } from 'lucide-react';

export function WorldMapHeader({
  flightRoutes = [],
  showFlights = true,
  showFlightsInternal,
  setShowFlightsInternal,
  projectionType,
  setProjectionType
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 sm:px-4 py-3 border-b border-[#1C2436] bg-[#0A0D14]">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85] shrink-0 mt-0.5 sm:mt-0 shadow-sm">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F1F5F9] m-0 leading-tight">
              Mapa Mundi de Viajes y Rutas Aéreas
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {flightRoutes.length > 0 && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/40 inline-flex items-center gap-1 whitespace-nowrap leading-none">
                  <Plane className="w-3 h-3 shrink-0" />
                  <span>{flightRoutes.length} {flightRoutes.length === 1 ? 'Trayecto' : 'Trayectos'}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#8492A6] m-0 mt-0.5 leading-snug">
            Países visitados iluminados con líneas de trayecto aéreo entre origen y destino
          </p>
        </div>
      </div>

      {/* Acciones y Selectores */}
      <div className="flex flex-wrap items-center gap-2">
        {showFlights && flightRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFlightsInternal(!showFlightsInternal)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border ${
              showFlightsInternal
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-[#151B27] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{showFlightsInternal ? 'Ocultar Trayectos' : 'Ver Trayectos'}</span>
          </button>
        )}

        <div className="flex items-center gap-1 bg-[#151B27] p-1 rounded-lg border border-[#1C2436]">
          <button
            type="button"
            onClick={() => setProjectionType('geoEqualEarth')}
            className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
              projectionType === 'geoEqualEarth'
                ? 'bg-[#0E121B] text-[#00FF85] border border-[#00FF85]/30'
                : 'text-[#8492A6] hover:text-[#F1F5F9]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Mapa Plano</span>
          </button>
          <button
            type="button"
            onClick={() => setProjectionType('geoOrthographic')}
            className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors flex items-center gap-1.5 ${
              projectionType === 'geoOrthographic'
                ? 'bg-[#0E121B] text-[#00E5FF] border border-[#00E5FF]/30'
                : 'text-[#8492A6] hover:text-[#F1F5F9]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Globo 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorldMapHeader;

