import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import worldGeo from 'world-atlas/countries-110m.json';
import { detectCountry } from '../utils/countries';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function WorldMap({ visitedCountries = new Map(), onSelectCountry, selectedCountryCode }) {
  const { isDark } = useTheme();
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [tooltipContent, setTooltipContent] = useState(null);

  const handleZoomIn = () => {
    if (position.zoom >= 5) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const handleMoveEnd = (pos) => {
    setPosition(pos);
  };

  // Convertir visitedCountries (Map) a un Set de códigos y nombres para búsqueda ultra rápida
  const { visitedCodes, visitedNamesMap } = useMemo(() => {
    const codes = new Set();
    const names = new Map();

    if (visitedCountries instanceof Map) {
      visitedCountries.forEach((info, code) => {
        codes.add(code);
        names.set(info.es.toLowerCase(), info);
        names.set(info.en.toLowerCase(), info);
      });
    }

    return { visitedCodes: codes, visitedNamesMap: names };
  }, [visitedCountries]);

  return (
    <div className="relative w-full bg-[#0E121B] border border-[#1C2436] rounded-2xl overflow-hidden shadow-xl select-none">
      {/* Barra de cabecera del mapa */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C2436] bg-[#0A0D14]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85]">
            <Globe className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] m-0">
              Mapa Mundi de Exploración
            </h3>
            <p className="text-[10px] text-[#8492A6] m-0">
              Países con bitácoras registradas iluminados en verde neón sólido
            </p>
          </div>
        </div>

        {/* Controles de Zoom */}
        <div className="flex items-center gap-1.5 bg-[#151B27] p-1 rounded-lg border border-[#1C2436]">
          <button
            onClick={handleZoomIn}
            title="Acercar mapa"
            className="p-1 rounded text-[#8492A6] hover:text-[#00FF85] hover:bg-[#0E121B] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Alejar mapa"
            className="p-1 rounded text-[#8492A6] hover:text-[#00FF85] hover:bg-[#0E121B] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Restablecer vista"
            className="p-1 rounded text-[#8492A6] hover:text-[#00E5FF] hover:bg-[#0E121B] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área del mapa SVG */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] bg-[#07090E] cursor-grab active:cursor-grabbing">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 160
          }}
          className="w-full h-full"
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={0.8}
            maxZoom={6}
          >
            <Geographies geography={worldGeo}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name || '';
                  const detected = detectCountry(countryName);
                  const isVisited = detected && visitedCodes.has(detected.code);
                  const isSelected = detected && selectedCountryCode === detected.code;

                  // Información del país visitado (viajes realizados)
                  const visitInfo = isVisited ? visitedCountries.get(detected.code) : null;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setTooltipContent({
                          name: countryName,
                          detected,
                          visitInfo
                        });
                      }}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                      onClick={() => {
                        if (detected && onSelectCountry) {
                          onSelectCountry(detected, visitInfo);
                        }
                      }}
                      style={{
                        default: {
                          fill: isSelected
                            ? '#FFE500'
                            : isVisited
                            ? (isDark ? '#00FF85' : '#059669')
                            : (isDark ? '#151B27' : '#E2E8F0'),
                          stroke: isVisited 
                            ? (isDark ? '#00FF85' : '#059669') 
                            : (isDark ? '#1C2436' : '#CBD5E1'),
                          strokeWidth: isVisited ? 1.0 : 0.4,
                          outline: 'none',
                          transition: 'all 200ms ease'
                        },
                        hover: {
                          fill: isVisited ? '#FFE500' : (isDark ? '#2A364F' : '#CBD5E1'),
                          stroke: isVisited ? '#FFE500' : (isDark ? '#00E5FF' : '#0284C7'),
                          strokeWidth: 1.2,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: {
                          fill: '#00E5FF',
                          stroke: '#00E5FF',
                          outline: 'none'
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip flotante */}
        {tooltipContent && (
          <div className="absolute bottom-4 left-4 z-20 bg-[#0E121B]/95 border border-[#1C2436] rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs pointer-events-none transition-all">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {tooltipContent.detected?.flag || '🌍'}
              </span>
              <div>
                <p className="text-xs font-bold text-[#F1F5F9] m-0">
                  {tooltipContent.detected?.es || tooltipContent.name}
                </p>
                <p className="text-[10px] text-[#8492A6] m-0">
                  {tooltipContent.detected?.en || tooltipContent.name}
                </p>
              </div>
            </div>

            {tooltipContent.visitInfo ? (
              <div className="mt-2 pt-2 border-t border-[#1C2436]">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded">
                  ✓ Visitado ({tooltipContent.visitInfo.viajes.length} {tooltipContent.visitInfo.viajes.length === 1 ? 'viaje' : 'viajes'})
                </span>
                <ul className="mt-1 space-y-0.5 text-[11px] text-[#CBD5E1]">
                  {tooltipContent.visitInfo.viajes.slice(0, 3).map((v) => (
                    <li key={v.id} className="truncate">
                      • {v.titulo}
                    </li>
                  ))}
                  {tooltipContent.visitInfo.viajes.length > 3 && (
                    <li className="text-[10px] text-[#8492A6]">
                      + {tooltipContent.visitInfo.viajes.length - 3} más...
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <p className="text-[10px] text-[#8492A6] mt-1.5 m-0">
                Aún no has registrado un viaje en este país
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pie con Leyenda y Estadísticas Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0A0D14] border-t border-[#1C2436] text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#00FF85] border border-[#00FF85]" />
            <span className="text-[#F1F5F9] font-medium text-[11px]">Visitado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#151B27] border border-[#1C2436]" />
            <span className="text-[#8492A6] text-[11px]">Por explorar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#FFE500] border border-[#FFE500]" />
            <span className="text-[#8492A6] text-[11px]">Selección / Hover</span>
          </div>
        </div>

        <div className="text-[11px] text-[#8492A6]">
          Total países en el mundo: <span className="font-bold text-[#F1F5F9]">195</span> • Visitados: <span className="font-bold text-[#00FF85]">{visitedCountries.size}</span> ({((visitedCountries.size / 195) * 100).toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}

export default WorldMap;
