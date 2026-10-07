import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Plane,
  Hotel,
  Compass,
  Car,
  Utensils,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowRight,
  GitCommit,
  Navigation,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Coins,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import WorldMapAmCharts from '../../../components/WorldMapAmCharts';
import MiniFlag from '../../../components/MiniFlag';
import { extractVisitedCountries, cleanCountryText } from '../../../utils/countries';
import { extractFlightTrajectories } from '../../../utils/geoCoordinates';
import {
  CURRENCY_MAP,
  formatCurrencyDisplay,
  getOtherCurrenciesConversions
} from '../../../utils/currencies';

const TYPE_ICONS = {
  vuelo: Plane,
  hotel: Hotel,
  atraccion: Compass,
  transporte: Car,
  comida: Utensils,
  otro: MapPin
};

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'vuelo', label: 'Vuelos' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'hotel', label: 'Hoteles' },
  { id: 'atraccion', label: 'Atracciones' },
  { id: 'comida', label: 'Comida' }
];

export function ItinerarioView({
  activeViaje,
  eventos = [],
  onAddEvento,
  onOpenNuevoViaje,
  onEditEvento,
  onDeleteEvento,
  onCompartirViaje,
  hasConflicts = false,
  conflicts = []
}) {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [showMap, setShowMap] = useState(false);
  const [showRoutesList, setShowRoutesList] = useState(false);
  const [expandedCostId, setExpandedCostId] = useState(null);

  // Extraer países visitados (>24h y stopovers) de este itinerario y viaje
  const visitedCountries = useMemo(() => {
    return extractVisitedCountries(eventos, activeViaje ? [activeViaje] : []);
  }, [eventos, activeViaje]);

  // Extraer trayectos de vuelos registrados en este itinerario
  const flightRoutes = useMemo(() => {
    return extractFlightTrajectories(eventos);
  }, [eventos]);

  const filteredEventos = useMemo(() => {
    const list = activeFilter === 'todos'
      ? eventos
      : eventos.filter(e => (e.tipo || 'otro').toLowerCase() === activeFilter);
    return [...list].sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
  }, [eventos, activeFilter]);

  if (!activeViaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={Compass} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#00E5FF] rounded-sm" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">La Ruta & Itinerario</h2>
        </div>
        <div className="p-8 sm:p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0">No hay viajes registrados</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Para registrar rutas aéreas, vuelos y actividades en la bitácora, primero debes crear un viaje en la base de datos.
          </p>
          {onOpenNuevoViaje && (
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Primer Viaje
            </button>
          )}
        </div>
      </div>
    );
  }

  const cleanDestino = cleanCountryText(activeViaje.destino);

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 w-full max-w-full overflow-hidden">
      {/* Marca de agua sólida del módulo de itinerario */}
      <WatermarkIcon icon={Compass} className="w-72 h-72 top-4 right-2 pointer-events-none" opacity="opacity-[0.02]" color="text-[#00E5FF]" />

      {/* Header y Acciones - Mobile First */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Itinerario
            </h2>
            {cleanDestino && (
              <span className="text-xs sm:text-sm font-semibold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-md truncate max-w-[220px] sm:max-w-md">
                {cleanDestino}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-[#8492A6] mt-1 m-0">
            Línea de tiempo cronológica: orígenes, conexiones aéreas, horarios y actividades.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onCompartirViaje && activeViaje && (
            <button
              type="button"
              onClick={() => onCompartirViaje(activeViaje)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] text-xs font-semibold transition-colors cursor-pointer"
              title="Compartir este itinerario"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00FF85]" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          )}

          <button
            onClick={onAddEvento}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00E5FF] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Vuelo / Actividad</span>
          </button>
        </div>
      </div>

      {/* Alerta de solapamiento / conflictos (RF 3.1) */}
      {(hasConflicts || conflicts.length > 0) && (
        <div className="mb-4 p-3 rounded-lg bg-[#151B27] border-l-4 border-[#FFE500] flex items-start gap-2.5 relative z-10">
          <AlertTriangle className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" strokeWidth={2.5} />
          <div className="min-w-0 text-xs">
            <h4 className="font-bold text-[#FFE500] m-0 uppercase tracking-wider">Solapamiento detectado</h4>
            <p className="text-[#F1F5F9] mt-0.5 m-0">
              Existen eventos con horarios coincidentes. Se mantienen visibles para no alterar tu logística.
            </p>
          </div>
        </div>
      )}

      {/* SECCIÓN: Trayecto Aéreo y Mapa Interactivo - Diseño Compacto y Colapsable en Móvil */}
      {flightRoutes.length > 0 && (
        <div className="mb-5 rounded-xl bg-[#0E121B] border border-[#1C2436] relative z-10 overflow-hidden shadow-sm">
          {/* Cabecera del resumen de vuelos */}
          <div className="p-3 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 shrink-0">
                <Plane className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[#F1F5F9] m-0 flex items-center gap-2 flex-wrap">
                  <span>Rutas Aéreas</span>
                  <span className="text-[10px] text-[#00FF85] font-bold bg-[#00FF85]/15 px-2 py-0.5 rounded-full border border-[#00FF85]/30">
                    {flightRoutes.length} {flightRoutes.length === 1 ? 'tramo' : 'tramos'}
                  </span>
                </h3>
                {/* Resumen rápido de tramos en una sola línea */}
                <p className="text-[11px] text-[#8492A6] m-0 truncate mt-0.5">
                  {flightRoutes.map((r, i) => (
                    <span key={r.id}>
                      {i > 0 && ' • '}
                      <span style={{ color: r.color || '#00E5FF' }}>
                        {r.origin?.code || r.origin?.displayTitle} ➔ {r.destination?.code || r.destination?.displayTitle}
                      </span>
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="px-2.5 py-1 bg-[#151B27] hover:bg-[#1E2738] border border-[#00E5FF]/40 text-[#00E5FF] font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>{showMap ? 'Ocultar Mapa' : 'Mapa'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRoutesList(!showRoutesList)}
                className="p-1 bg-[#151B27] hover:bg-[#1E2738] border border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                title={showRoutesList ? 'Ocultar tramos' : 'Ver todos los tramos'}
              >
                {showRoutesList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lista de tramos (Colapsable en móvil para no saturar) */}
          {showRoutesList && (
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 border-t border-[#1C2436] flex flex-col sm:flex-row sm:flex-wrap gap-2 animate-in fade-in duration-150">
              {flightRoutes.map((route) => {
                const targetEv = route.event || eventos.find(e => e.id === route.id);
                const colorHex = route.color || '#00E5FF';
                const isRoundTrip = route.tipoTrayecto === 'round-trip' || route.esRoundTrip;
                const tramoLabel = isRoundTrip
                  ? (route.tramo === 'regreso' ? 'Vuelta' : 'Ida')
                  : 'Ida';

                return (
                  <div
                    key={route.id}
                    style={{ borderColor: `${colorHex}40` }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#151B27] border flex items-center justify-between sm:justify-start gap-2 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: `${colorHex}20`, color: colorHex }}
                      >
                        {tramoLabel}
                      </span>
                      <span className="text-[#F1F5F9] font-bold truncate">
                        {route.origin.displayTitle}
                      </span>
                      <span className="font-bold text-[11px]" style={{ color: colorHex }}>➔</span>
                      {route.connection && (
                        <span className="text-[#FFE500] text-[10px] truncate">
                          vía {route.connection.code || route.connection.displayTitle} ➔
                        </span>
                      )}
                      <span className="font-bold truncate" style={{ color: colorHex }}>
                        {route.destination.displayTitle}
                      </span>
                    </div>

                    {targetEv && onEditEvento && onDeleteEvento && (
                      <div className="flex items-center gap-1 shrink-0 ml-auto pl-2 border-l border-[#1C2436]">
                        <button
                          type="button"
                          onClick={() => onEditEvento(targetEv)}
                          title="Editar vuelo"
                          className="p-1 rounded bg-[#0E121B] hover:text-[#00E5FF] text-[#8492A6] border border-[#1C2436] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEvento(targetEv)}
                          title="Eliminar vuelo"
                          className="p-1 rounded bg-[#0E121B] hover:text-[#FF2E55] text-[#8492A6] border border-[#1C2436] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mapa Mundi amCharts renderizado cuando el usuario lo despliega */}
          {showMap && (
            <div className="border-t border-[#1C2436]">
              <WorldMapAmCharts flightRoutes={flightRoutes} visitedCountries={visitedCountries} />
            </div>
          )}
        </div>
      )}

      {/* Pills de Filtrado - Scroll horizontal sin saturar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 relative z-10 no-scrollbar">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                isActive
                  ? 'bg-[#151B27] text-[#00E5FF] border-[#00E5FF]/60 shadow-xs'
                  : 'bg-[#0E121B] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Timeline Vertical */}
      {filteredEventos.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-xl bg-[#0E121B] border border-[#1C2436] text-center relative z-10">
          <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-[#F1F5F9] m-0">No hay eventos en este filtro</p>
          <p className="text-xs text-[#8492A6] mt-1 m-0">Presiona "Vuelo / Actividad" para agendar nuevos trayectos o paseos.</p>
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-7 border-l-2 border-[#1C2436] ml-2 sm:ml-4 space-y-4 sm:space-y-5 z-10">
          {filteredEventos.map((ev) => {
            const isVuelo = ev.tipo?.toLowerCase() === 'vuelo';
            const Icon = TYPE_ICONS[ev.tipo?.toLowerCase()] || MapPin;
            const parseDate = (d) => {
              if (!d) return null;
              const p = new Date(d);
              return isNaN(p.getTime()) ? null : p;
            };
            const startDate = parseDate(ev.fechaInicio) || parseDate(ev.fecha) || new Date();
            const endDate = parseDate(ev.fechaFin) || startDate;

            const hasFlightLogistics = ev.ciudadOrigen || ev.aeropuertoOrigen || ev.tieneConexion || ev.ciudadDestino;

            const matchingRoute = flightRoutes.find(
              r => r.id === ev.id || r.event?.id === ev.id || (ev.roundTripGroupId && r.roundTripGroupId === ev.roundTripGroupId && r.tramo === ev.tramo)
            );
            const routeColor = matchingRoute?.color || (ev.tramo === 'regreso' ? '#FF9100' : '#00E5FF');
            const isRoundTrip = ev.tipoTrayecto === 'round-trip';
            const tramo = ev.tramo;

            return (
              <div key={ev.id} className="relative group">
                {/* Nodo de la línea de tiempo */}
                <div
                  className="absolute -left-[23px] sm:-left-[35px] top-3.5 w-3.5 h-3.5 rounded-full bg-[#080A0F] border-2 flex items-center justify-center transition-all shadow-xs"
                  style={{ borderColor: isVuelo ? routeColor : '#00E5FF' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isVuelo ? routeColor : '#00E5FF' }}
                  />
                </div>

                {/* Tarjeta del evento */}
                <div
                  className="relative p-3.5 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF]/40 transition-colors overflow-hidden shadow-xs"
                  style={isVuelo ? { borderLeft: `3px solid ${routeColor}` } : {}}
                >
                  <WatermarkIcon icon={Icon} className="w-24 h-24 -bottom-3 -right-3 pointer-events-none" opacity="opacity-[0.02]" color="text-[#00E5FF]" />

                  {/* Fila superior: Tipo, Modalidad y Costo */}
                  <div className="flex items-center justify-between gap-2 mb-2 relative z-10 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="p-1 rounded bg-[#151B27] border border-[#1C2436]"
                        style={isVuelo ? { color: routeColor } : { color: '#00E5FF' }}
                      >
                        <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                      </span>
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={isVuelo ? { color: routeColor } : { color: '#00E5FF' }}
                      >
                        {ev.tipo || 'Evento'}
                      </span>

                      {/* BADGE: ROUND-TRIP vs ONE-WAY */}
                      {isVuelo && (
                        isRoundTrip ? (
                          <span
                            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 shadow-xs"
                            style={{
                              backgroundColor: `${routeColor}15`,
                              color: routeColor,
                              borderColor: `${routeColor}40`
                            }}
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            {tramo === 'regreso' ? 'Regreso' : 'Ida'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-[#8492A6] bg-[#151B27] border border-[#1C2436] px-1.5 py-0.5 rounded uppercase">
                            Solo Ida
                          </span>
                        )
                      )}

                      {ev.tieneConexion && (
                        <span className="text-[9px] font-bold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-1.5 py-0.5 rounded uppercase">
                          Con Escala
                        </span>
                      )}
                    </div>

                    {ev.costo && Number(ev.costo) > 0 && (
                      <div className="flex items-center gap-1 shrink-0 ml-auto">
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded border border-[#00FF85]/20">
                          <span>{CURRENCY_MAP[(ev.moneda || 'COP').toUpperCase()]?.flag || '💱'}</span>
                          {formatCurrencyDisplay(ev.costo, ev.moneda || 'COP', true)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedCostId(expandedCostId === ev.id ? null : ev.id)}
                          className="px-1.5 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#8492A6] hover:text-[#00E5FF] transition-colors cursor-pointer text-[10px] font-medium"
                          title="Ver en otras divisas"
                        >
                          <ArrowRightLeft className="w-3 h-3 inline text-[#00E5FF]" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Panel de conversiones expandible */}
                  {ev.costo && Number(ev.costo) > 0 && expandedCostId === ev.id && (
                    <div className="my-2 p-2 rounded-lg bg-[#151B27] border border-[#1C2436] relative z-10 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px] text-[#8492A6] mb-1.5">
                        <span className="flex items-center gap-1 text-[#00E5FF] font-semibold">
                          <Coins className="w-3 h-3" />
                          Conversión del gasto
                        </span>
                        <span>Original: {formatCurrencyDisplay(ev.costo, ev.moneda || 'COP', true)}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {getOtherCurrenciesConversions(ev.costo, ev.moneda || 'COP').map((conv) => (
                          <div key={conv.code} className="p-1.5 rounded bg-[#0E121B] border border-[#1C2436]">
                            <span className="text-[9px] text-[#8492A6] flex items-center gap-1">
                              <span>{conv.flag}</span>
                              <span className="font-bold text-[#F1F5F9]">{conv.code}</span>
                            </span>
                            <span className="text-xs font-bold text-[#00FF85] block truncate mt-0.5">
                              {conv.shortDisplay}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Título del evento */}
                  <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0 mb-2 relative z-10">
                    {ev.titulo}
                  </h3>

                  {/* TRAYECTO DE VUELO - Componente Unificado Horizontal */}
                  {hasFlightLogistics ? (
                    <div
                      className="my-2.5 p-3 rounded-xl bg-[#151B27]/70 border relative z-10"
                      style={{ borderColor: `${routeColor}30` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* ORIGEN */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#00FF85] uppercase">
                            <span>🛫 Salida</span>
                          </div>
                          <p className="text-base sm:text-lg font-black text-[#F1F5F9] m-0 tracking-tight leading-tight">
                            {ev.aeropuertoOrigen || ev.ciudadOrigen || 'ORG'}
                          </p>
                          <p className="text-[11px] text-[#CBD5E1] m-0 truncate flex items-center gap-1">
                            <MiniFlag country={ev.paisOrigen} className="w-3 h-2" />
                            <span>{ev.ciudadOrigen || cleanCountryText(ev.paisOrigen) || 'Origen'}</span>
                          </p>
                          <p className="text-[10px] text-[#00E5FF] m-0 font-medium mt-0.5">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {startDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                          </p>
                        </div>

                        {/* RUTA CENTRAL Y CONEXIÓN */}
                        <div className="flex flex-col items-center justify-center px-2 text-center shrink-0">
                          <Plane className="w-4 h-4" style={{ color: routeColor }} />
                          <div className="w-12 sm:w-20 h-[1.5px] my-1" style={{ backgroundColor: `${routeColor}50` }} />
                          {ev.tieneConexion || ev.aeropuertoConexion || ev.ciudadConexion ? (
                            <span className="text-[9px] font-bold text-[#FFE500] bg-[#FFE500]/15 px-1.5 py-0.2 rounded border border-[#FFE500]/30 whitespace-nowrap">
                              {ev.escalaMayor24h ? 'Stopover' : 'Escala'} {ev.aeropuertoConexion || ev.ciudadConexion || ''}
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-[#8492A6]">Directo</span>
                          )}
                        </div>

                        {/* DESTINO */}
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase" style={{ color: routeColor }}>
                            <span>🛬 Llegada</span>
                          </div>
                          <p className="text-base sm:text-lg font-black text-[#F1F5F9] m-0 tracking-tight leading-tight">
                            {ev.aeropuertoDestino || ev.ciudadDestino || 'DST'}
                          </p>
                          <p className="text-[11px] text-[#CBD5E1] m-0 truncate flex items-center justify-end gap-1">
                            <span>{ev.ciudadDestino || cleanCountryText(ev.paisDestino) || 'Destino'}</span>
                            <MiniFlag country={ev.paisDestino} className="w-3 h-2" />
                          </p>
                          <p className="text-[10px] text-[#FFE500] m-0 font-medium mt-0.5">
                            {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {endDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Horario estándar para eventos regulares (hoteles, tours) */
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#8492A6] relative z-10 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                        {startDate.toLocaleDateString([], { day: 'numeric', month: 'short' })} • {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {ev.ubicacion && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#8492A6]" />
                          {ev.ubicacion}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notas */}
                  {ev.notas && (
                    <p className="text-xs text-[#8492A6] bg-[#151B27] p-2 rounded-lg border border-[#1C2436] m-0 relative z-10 mb-2">
                      {ev.notas}
                    </p>
                  )}

                  {/* Acciones de Tarjeta */}
                  <div className="pt-2 border-t border-[#1C2436] flex items-center justify-between gap-2 relative z-10">
                    <span className="text-[10px] text-[#8492A6]">
                      {isVuelo ? '✈️ Vuelo' : '📍 Actividad'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onEditEvento && (
                        <button
                          type="button"
                          onClick={() => onEditEvento(ev)}
                          className="px-2 py-1 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      )}
                      {onDeleteEvento && (
                        <button
                          type="button"
                          onClick={() => onDeleteEvento(ev)}
                          className="px-2 py-1 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ItinerarioView;
