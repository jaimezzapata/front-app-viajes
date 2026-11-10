import React from 'react';
import { Navigation } from 'lucide-react';
import { ROUTE_COLORS } from '../../utils/geoCoordinates';
import { useTheme } from '../../context/ThemeContext';

export function WorldMapRoutesBar({
  flightRoutes = [],
  showFlightsInternal,
  onFocusRoute
}) {
  const { isDark } = useTheme();
  if (!showFlightsInternal || !flightRoutes.length) return null;

  return (
    <div className="px-3 sm:px-4 py-2.5 bg-[#0D111A] border-t border-[#1C2436] flex flex-wrap items-center gap-2 max-w-full">
      <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider shrink-0 flex items-center gap-1 mr-1">
        <Navigation className="w-3 h-3 text-[#00E5FF]" /> Trayectos ({flightRoutes.length}):
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
            type="button"
            onClick={() => onFocusRoute(route)}
            style={{
              borderColor: isDark ? `${colorHex}55` : '#CBD5E1',
              backgroundColor: isDark ? '#151B27' : '#0F172A'
            }}
            className="px-2.5 py-1 hover:opacity-90 border rounded-lg text-[11px] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm group"
            title={`Haz clic para enfocar: ${route.titulo} (${tramoLabel})`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: colorHex }}
            />
            <span
              className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${colorHex}25`,
                color: colorHex,
                border: `1px solid ${colorHex}50`
              }}
            >
              {tramoLabel}
            </span>
            <span className="font-bold" style={{ color: '#F8FAFC' }}>
              {route.origin.airportName || route.origin.city}
            </span>
            <span className="font-black" style={{ color: colorHex }}>➔</span>
            {route.connection && (
              <>
                <span className="font-semibold text-[10px]" style={{ color: '#FDE047' }}>
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

