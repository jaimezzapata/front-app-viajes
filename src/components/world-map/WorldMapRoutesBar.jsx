import React from 'react';
import { Navigation } from 'lucide-react';
import { ROUTE_COLORS } from '../../utils/geoCoordinates';

export function WorldMapRoutesBar({
  flightRoutes = [],
  showFlightsInternal,
  onFocusRoute
}) {
  if (!showFlightsInternal || !flightRoutes.length) return null;

  return (
    <div className="px-3 sm:px-4 py-2.5 bg-[#0D111A] border-t border-[#1C2436] flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
      <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider shrink-0 flex items-center gap-1">
        <Navigation className="w-3 h-3 text-[#00E5FF]" /> Trayectos:
      </span>
      {flightRoutes.map((route, idx) => {
        const colorHex = route.color || ROUTE_COLORS[idx % ROUTE_COLORS.length].hex;
        const isRoundTrip = route.tipoTrayecto === 'round-trip' || route.esRoundTrip;
        const tramoLabel = isRoundTrip
          ? (route.tramo === 'regreso' ? 'Vuelta 🛬' : 'Ida 🛫')
          : 'Solo Ida';

        return (
          <button
            key={route.id}
            onClick={() => onFocusRoute(route)}
            style={{ borderColor: `${colorHex}50` }}
            className="px-2.5 py-1 bg-[#151B27] hover:bg-[#1E2738] border rounded-md text-[11px] text-[#F1F5F9] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm group"
            title={`${route.titulo} (${tramoLabel})`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: colorHex }}
            />
            <span
              className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded"
              style={{ backgroundColor: `${colorHex}20`, color: colorHex }}
            >
              {tramoLabel}
            </span>
            <span className="font-bold text-[#F1F5F9]">
              {route.origin.airportName || route.origin.city}
            </span>
            <span className="font-black" style={{ color: colorHex }}>➔</span>
            {route.connection && (
              <>
                <span className="text-[#FFE500] font-semibold text-[10px]">
                  via {route.connection.airportName || route.connection.city}
                </span>
                <span className="font-black" style={{ color: colorHex }}>➔</span>
              </>
            )}
            <span className="font-bold" style={{ color: colorHex }}>
              {route.destination.airportName || route.destination.city}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default WorldMapRoutesBar;

