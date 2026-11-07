import React from 'react';
import {
  Plane,
  Calendar,
  MapPin,
  Building,
  Utensils,
  Camera,
  Navigation
} from 'lucide-react';
import MiniFlag from '../../../../components/MiniFlag';
import { formatCurrencyDisplay } from '../../../../utils/currencies';
import { cleanMetaText } from '../../../../utils/meta';
import { fixAccents } from '../../../../utils/countries';
import { getGroupDateRange } from '../../../../utils/itinerarioGrouping';

const EVENT_TYPE_ICONS = {
  vuelo: Plane,
  hotel: Building,
  alojamiento: Building,
  atraccion: Camera,
  actividad: Camera,
  tour: Camera,
  comida: Utensils,
  restaurante: Utensils,
  transporte: Navigation,
  otro: MapPin
};

export function SharedViajeItinerarioTab({
  eventos = [],
  groupedSharedSections = []
}) {
  if (eventos.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center">
        <Calendar className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
        <p className="text-sm font-semibold text-[#F1F5F9] m-0">No hay eventos ni vuelos registrados en este viaje aún</p>
        <p className="text-xs text-[#8492A6] mt-1">El itinerario cronológico se actualizará en cuanto se agreguen actividades.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-5 sm:pl-7 border-l-2 border-[#1C2436] ml-2 sm:ml-4 space-y-6 sm:space-y-7">
      {groupedSharedSections.map((group) => {
        const dateRange = getGroupDateRange(group.eventos);

        return (
          <div key={group.key} className="space-y-4">
            {/* BANNER SEPARADOR DE PAÍS Y CIUDAD */}
            <div className="relative group/banner pt-2 first:pt-0">
              <div
                className="absolute -left-[27px] sm:-left-[39px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#080A0F] border-2 border-[#00E5FF] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)] z-20"
                title={`${group.country}${group.city ? ` - ${group.city}` : ''}`}
              >
                <MapPin className="w-2.5 h-2.5 text-[#00E5FF]" />
              </div>

              <div className="relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#111726] via-[#0E131F] to-[#0A0D14] border border-[#1C2436] shadow-lg shadow-black/40 overflow-hidden">
                <div className="flex items-center gap-3.5 relative z-10 flex-wrap sm:flex-nowrap">
                  <div className="relative shrink-0 flex items-center justify-center shadow-md rounded-md overflow-hidden">
                    <MiniFlag
                      country={group.country}
                      code={group.countryCode}
                      className="w-11 h-7 sm:w-14 sm:h-9 rounded-md object-cover border border-[#1C2436]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:base font-black uppercase tracking-wider text-[#F1F5F9]">
                        {group.country}
                      </span>
                      {group.cities && group.cities.length > 0 && (
                        <span className="text-xs sm:text-sm font-bold text-[#00E5FF] tracking-tight flex items-center gap-1 truncate">
                          <span className="text-[#8492A6]/60">•</span>
                          <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                          {group.cities.join(' • ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#8492A6] mt-0.5 flex-wrap">
                      <span className="font-semibold text-[#CBD5E1]">
                        {group.eventos.length} {group.eventos.length === 1 ? 'actividad en total' : 'actividades en total'}
                      </span>
                      {dateRange && (
                        <>
                          <span className="text-[#1C2436]">•</span>
                          <span className="flex items-center gap-1 text-[#00FF85] font-medium">
                            <Calendar className="w-3 h-3 text-[#00FF85]" />
                            {dateRange}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actividades del país organizadas por ciudad */}
            {group.citySections.map((citySec, cIdx) => (
              <div key={`city-${cIdx}-${citySec.cityName || 'gen'}`} className="space-y-4">
                {citySec.cityName && (
                  <div className="flex items-center gap-2 pt-2 pb-1 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0 shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                    <span className="text-xs sm:text-sm font-bold text-[#00E5FF] tracking-wide uppercase flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                      {citySec.cityName}
                    </span>
                    <span className="text-[10px] text-[#8492A6] font-medium">
                      ({citySec.eventos.length} {citySec.eventos.length === 1 ? 'actividad' : 'actividades'})
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1C2436] to-transparent ml-2" />
                  </div>
                )}

                {citySec.eventos.map((ev) => {
                  const isVuelo = ev.tipo?.toLowerCase() === 'vuelo';
                  const Icon = EVENT_TYPE_ICONS[ev.tipo?.toLowerCase()] || MapPin;
                  const startDate = new Date(ev.fechaInicio || ev.fecha || Date.now());

                  return (
                    <div key={ev.id || Math.random()} className="relative">
                      {/* Nodo en la línea de tiempo */}
                      <div
                        className="absolute -left-[27px] sm:-left-[35px] top-3.5 w-3.5 h-3.5 rounded-full bg-[#080A0F] border-2 flex items-center justify-center"
                        style={{ borderColor: isVuelo ? '#00E5FF' : '#00FF85' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: isVuelo ? '#00E5FF' : '#00FF85' }}
                        />
                      </div>

                      {/* Card del Evento */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF]/40 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00E5FF] shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">
                                  {cleanMetaText(fixAccents(ev.titulo))}
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#151B27] text-[#00E5FF] border border-[#1C2436]">
                                  {ev.tipo || 'Actividad'}
                                </span>
                                {isVuelo && ev.tramo && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                                    {ev.tramo === 'ida' ? 'Ida' : 'Regreso'}
                                  </span>
                                )}
                                {ev.descontarPresupuesto === false && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#8492A6]/10 text-[#8492A6] border border-[#8492A6]/30">
                                    Fuera de Presupuesto
                                  </span>
                                )}
                                {ev.pagadoAdelantado && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B55FE6]/10 text-[#B55FE6] border border-[#B55FE6]/30">
                                    Pre-Viaje
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#8492A6] m-0 mt-0.5 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-[#8492A6]" />
                                <span>{startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </p>
                            </div>
                          </div>

                          {ev.costo !== undefined && ev.costo > 0 && (
                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-xs font-bold text-[#00FF85]">
                                {formatCurrencyDisplay(ev.costo, ev.moneda || 'COP', true)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Detalles logísticos para vuelos */}
                        {isVuelo && (ev.ciudadOrigen || ev.ciudadDestino || ev.aeropuertoOrigen || ev.aeropuertoDestino) && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-[#151B27]/60 border border-[#1C2436] flex items-center gap-2 text-xs flex-wrap">
                            <span className="text-[#00FF85] font-semibold flex items-center gap-1">
                              {ev.paisOrigen && <MiniFlag country={ev.paisOrigen} className="w-3 h-2" />}
                              {ev.aeropuertoOrigen || ev.ciudadOrigen || 'Origen'}
                            </span>
                            <span className="text-[#8492A6]">➔</span>
                            {ev.tieneConexion && (
                              <>
                                <span className="text-[#FFE500] font-semibold flex items-center gap-1">
                                  {ev.escalaMayor24h ? 'Stopover' : 'Escala'}: {ev.aeropuertoConexion || ev.ciudadConexion || 'Conexión'}
                                  {ev.horasEscala ? ` (${ev.horasEscala}h)` : ''}
                                </span>
                                <span className="text-[#8492A6]">➔</span>
                              </>
                            )}
                            <span className="text-[#00E5FF] font-semibold flex items-center gap-1">
                              {ev.aeropuertoDestino || ev.ciudadDestino || 'Destino'}
                              {ev.paisDestino && <MiniFlag country={ev.paisDestino} className="w-3 h-2" />}
                            </span>
                          </div>
                        )}

                        {cleanMetaText(ev.notas) && (
                          <p className="mt-2 text-xs text-[#8492A6] bg-[#0A0D14] p-2.5 rounded-lg border border-[#1C2436]/40 m-0">
                            {cleanMetaText(ev.notas)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default SharedViajeItinerarioTab;
