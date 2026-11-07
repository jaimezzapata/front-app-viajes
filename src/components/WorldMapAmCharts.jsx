import React, { useMemo, useState, useEffect } from 'react';
import { DEFAULT_LOCAL_GEO_POINT, COUNTRY_CENTROIDS } from '../utils/geoCoordinates';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_PALETTE, getCountryPaletteColor } from './world-map/palette';
import { useAmChartsMap } from './world-map/useAmChartsMap';
import { WorldMapHeader } from './world-map/WorldMapHeader';
import { WorldMapRoutesBar } from './world-map/WorldMapRoutesBar';
import { WorldMapLegend } from './world-map/WorldMapLegend';

export { COUNTRY_PALETTE, getCountryPaletteColor };

export function WorldMapAmCharts({
  visitedCountries = new Map(),
  onSelectCountry,
  selectedCountryCode,
  flightRoutes = [],
  activeFlightId = null,
  onSelectFlight,
  showFlights = true,
  multiColor = false,
  localCountryCode = 'CO',
  mapHeightClass = "h-[360px] sm:h-[460px] md:h-[540px] lg:h-[600px] xl:h-[660px]"
}) {
  const { isDark } = useTheme();
  const [projectionType, setProjectionType] = useState('geoEqualEarth'); // 'geoEqualEarth' | 'geoOrthographic'
  const [showFlightsInternal, setShowFlightsInternal] = useState(showFlights);

  const resolvedLocalGeoPoint = useMemo(() => {
    if (localCountryCode && COUNTRY_CENTROIDS[localCountryCode.toUpperCase()]) {
      return COUNTRY_CENTROIDS[localCountryCode.toUpperCase()];
    }
    return DEFAULT_LOCAL_GEO_POINT;
  }, [localCountryCode]);

  useEffect(() => {
    setShowFlightsInternal(showFlights);
  }, [showFlights]);

  const { confirmedCount, pendingCount } = useMemo(() => {
    let conf = 0;
    let pend = 0;
    if (visitedCountries instanceof Map) {
      visitedCountries.forEach((c) => {
        if (c.isPending) pend++;
        else conf++;
      });
    }
    return { confirmedCount: conf, pendingCount: pend };
  }, [visitedCountries]);

  const { chartRef, handleFocusRoute } = useAmChartsMap({
    visitedCountries,
    onSelectCountry,
    selectedCountryCode,
    flightRoutes,
    showFlightsInternal,
    multiColor,
    projectionType,
    resolvedLocalGeoPoint,
    isDark
  });

  return (
    <div className="relative w-full max-w-full bg-[#0E121B] border border-[#1C2436] rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* 1. Cabecera del mapa interactivo con selectores */}
      <WorldMapHeader
        flightRoutes={flightRoutes}
        showFlights={showFlights}
        showFlightsInternal={showFlightsInternal}
        setShowFlightsInternal={setShowFlightsInternal}
        projectionType={projectionType}
        setProjectionType={setProjectionType}
      />

      {/* 2. Contenedor Div del Mapa amCharts 5 */}
      <div
        ref={chartRef}
        className={`w-full ${mapHeightClass} bg-[#07090E] max-w-full overflow-hidden`}
      />

      {/* 3. Barra de Rutas de Vuelo Registradas */}
      <WorldMapRoutesBar
        flightRoutes={flightRoutes}
        showFlightsInternal={showFlightsInternal}
        onFocusRoute={handleFocusRoute}
      />

      {/* 4. Leyenda y Estadísticas */}
      <WorldMapLegend
        multiColor={multiColor}
        showFlightsInternal={showFlightsInternal}
        flightRoutes={flightRoutes}
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
      />
    </div>
  );
}

export default WorldMapAmCharts;
