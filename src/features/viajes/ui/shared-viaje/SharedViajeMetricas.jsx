import React from 'react';
import { Globe2 } from 'lucide-react';

export function SharedViajeMetricas({
  visitedCountries,
  flightRoutes,
  eventosCount,
  gastosCount,
  totalGastadoUSD,
  onOpenMapModal
}) {
  return (
    <>
      {/* MÉTRICAS CLAVE (GRID 4x) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
            Países Explorados
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00FF85]">
              {visitedCountries.size}
            </span>
            <span className="text-xs text-[#8492A6]">en el mapa</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm overflow-hidden truncate">
            {Array.from(visitedCountries.values()).map((c) => (
              <span key={c.code} title={c.es}>
                {c.flag}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
            Trayectos Aéreos
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#00E5FF]">
              {flightRoutes.length}
            </span>
            <span className="text-xs text-[#8492A6]">vuelos enlazados</span>
          </div>
          <span className="text-[10px] text-[#00E5FF] mt-1 block">
            {flightRoutes.length === 0 ? 'Sin vuelos registrados' : 'Animación de vuelo activa'}
          </span>
        </div>

        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
            Eventos & Planes
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#B55FE6]">
              {eventosCount}
            </span>
            <span className="text-xs text-[#8492A6]">actividades</span>
          </div>
          <span className="text-[10px] text-[#8492A6] mt-1 block truncate">
            Itinerario agendado
          </span>
        </div>

        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
          <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
            Gastos Registrados
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#FFE500]">
              {gastosCount}
            </span>
            <span className="text-xs text-[#8492A6]">compras/servicios</span>
          </div>
          <span className="text-[10px] text-[#FFE500] mt-1 block truncate">
            {gastosCount > 0 ? `≈ $${totalGastadoUSD} USD total` : 'Sin gastos aún'}
          </span>
        </div>
      </div>

      {/* ACCESO A MAPAMUNDI INTERACTIVO (BANNER) */}
      <div className="relative z-10 p-3.5 sm:p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
            <Globe2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-[#F1F5F9] uppercase">
                Mapamundi & Rutas
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                {visitedCountries.size} {visitedCountries.size === 1 ? 'País' : 'Países'} · {flightRoutes.length} {flightRoutes.length === 1 ? 'Vuelo' : 'Vuelos'}
              </span>
            </div>
            <p className="text-xs text-[#8492A6] m-0 mt-0.5">
              Visualiza los países explorados y trayectos aéreos en una ventana interactiva a pantalla completa.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMapModal}
          className="px-4 py-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Globe2 className="w-4 h-4" />
          <span>Ver Mapamundi</span>
        </button>
      </div>
    </>
  );
}

export default SharedViajeMetricas;

