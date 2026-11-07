import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Hotel,
  Compass,
  Car,
  Utensils,
  CreditCard,
  DollarSign,
  Coins,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import Modal from '../../../components/Modal';
import MiniFlag from '../../../components/MiniFlag';
import { cleanMetaText } from '../../../utils/meta';
import { cleanCountryText } from '../../../utils/countries';
import {
  CURRENCY_MAP,
  formatCurrencyDisplay,
  getOtherCurrenciesConversions
} from '../../../utils/currencies';

const TYPE_CONFIG = {
  vuelo: { label: 'Vuelo', icon: Plane, color: '#00E5FF', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]/30' },
  hotel: { label: 'Hotel / Alojamiento', icon: Hotel, color: '#FFE500', bg: 'bg-[#FFE500]/10', border: 'border-[#FFE500]/30' },
  atraccion: { label: 'Atracción / Paseo', icon: Compass, color: '#00FF85', bg: 'bg-[#00FF85]/10', border: 'border-[#00FF85]/30' },
  transporte: { label: 'Transporte Terrestre / Tren', icon: Car, color: '#B55FE6', bg: 'bg-[#B55FE6]/10', border: 'border-[#B55FE6]/30' },
  comida: { label: 'Gastronomía / Restaurante', icon: Utensils, color: '#FF9100', bg: 'bg-[#FF9100]/10', border: 'border-[#FF9100]/30' },
  otro: { label: 'Evento / Actividad', icon: MapPin, color: '#8492A6', bg: 'bg-[#8492A6]/10', border: 'border-[#8492A6]/30' }
};

function formatDateTimeFull(d) {
  if (!d) return 'No especificada';
  const date = new Date(d);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  const str = date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  // Capitalizar primer caracter
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDuration(start, end) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  const diffMs = e.getTime() - s.getTime();
  if (diffMs <= 0) return null;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMinutes / (60 * 24));
  const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
  const minutes = diffMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} min`);
  return parts.join(' ') || `${diffMinutes} min`;
}

export function DetalleEventoModal({
  isOpen,
  onClose,
  evento,
  onEdit,
  onDelete
}) {
  if (!evento) return null;

  const tipoKey = (evento.tipo || 'otro').toLowerCase();
  const cfg = TYPE_CONFIG[tipoKey] || TYPE_CONFIG.otro;
  const IconComponent = cfg.icon;

  const isVuelo = tipoKey === 'vuelo';
  const isRoundTrip = evento.tipoTrayecto === 'round-trip';
  const tramo = evento.tramo;
  const routeColor = tramo === 'regreso' ? '#FF9100' : cfg.color;

  const startDate = evento.fechaInicio ? new Date(evento.fechaInicio) : null;
  const endDate = evento.fechaFin ? new Date(evento.fechaFin) : startDate;
  const durationText = formatDuration(startDate, endDate);

  const isDescontado = evento.descontarPresupuesto !== undefined
    ? evento.descontarPresupuesto
    : (evento.gastoAsociado?.noComputar !== undefined ? !evento.gastoAsociado.noComputar : true);

  const isAdelantado = evento.pagadoAdelantado !== undefined
    ? evento.pagadoAdelantado
    : (evento.gastoAsociado?.pagadoAdelantado !== undefined ? evento.gastoAsociado.pagadoAdelantado : isVuelo);

  const tarjetaCredito = evento.tarjetaCredito || evento.gastoAsociado?.tarjetaCredito || null;
  const notasLimpias = cleanMetaText(evento.notas);

  // Destino y Ciudad
  const ciudad = evento.ciudadDestino || evento.ciudad || '';
  const pais = evento.paisDestino || evento.pais || '';
  const ubicacion = evento.ubicacion || '';

  // Google Maps Search Query
  const mapsSearchQuery = ubicacion || (ciudad ? `${ciudad}, ${cleanCountryText(pais)}` : cleanCountryText(pais));
  const mapsUrl = mapsSearchQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Evento"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(evento);
              }}
              className="px-3 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-xs font-semibold text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(evento);
                }}
                className="px-4 py-2 rounded-lg bg-[#00E5FF] hover:opacity-90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Evento</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cabecera / Banner del Tipo */}
        <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#1C2436] relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.border}`}
                  style={{ color: routeColor }}
                >
                  <IconComponent className="w-3.5 h-3.5" strokeWidth={2.3} />
                  <span>{cfg.label}</span>
                </span>

                {isVuelo && (
                  isRoundTrip ? (
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1 shadow-xs"
                      style={{
                        backgroundColor: `${routeColor}15`,
                        color: routeColor,
                        borderColor: `${routeColor}40`
                      }}
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      {tramo === 'regreso' ? 'Boleto Regreso' : 'Boleto Ida'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#8492A6] bg-[#151B27] border border-[#1C2436] px-2 py-0.5 rounded uppercase">
                      Solo Ida
                    </span>
                  )
                )}

                {evento.tieneConexion && (
                  <span className="text-[10px] font-bold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-2 py-0.5 rounded uppercase">
                    Escala {evento.escalaMayor24h ? '(Stopover >24h)' : ''}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-[#F1F5F9] m-0 tracking-tight leading-snug">
                {evento.titulo}
              </h2>

              {(ciudad || pais) && (
                <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1] mt-2">
                  <MiniFlag country={pais} className="w-4 h-3" />
                  <span className="font-semibold text-[#F1F5F9]">{ciudad ? `${ciudad}, ` : ''}{cleanCountryText(pais)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Horarios y Fechas */}
        <div className="p-3.5 rounded-xl bg-[#151B27]/50 border border-[#1C2436] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#8492A6] uppercase tracking-wider border-b border-[#1C2436] pb-1.5">
            <span className="flex items-center gap-1.5 text-[#00E5FF]">
              <Calendar className="w-3.5 h-3.5" />
              Cronograma & Fechas
            </span>
            {durationText && (
              <span className="text-[11px] font-semibold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded border border-[#00FF85]/20">
                Duración: {durationText}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1C2436]">
              <span className="text-[10px] font-bold text-[#00FF85] uppercase tracking-wider block mb-1">
                {isVuelo ? '🛫 Salida / Despegue' : '🟢 Inicio / Check-in'}
              </span>
              <p className="text-[#F1F5F9] font-bold text-xs sm:text-sm m-0">
                {formatDateTimeFull(evento.fechaInicio)}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1C2436]">
              <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider block mb-1">
                {isVuelo ? '🛬 Llegada / Aterrizaje' : '🔴 Fin / Check-out'}
              </span>
              <p className="text-[#F1F5F9] font-bold text-xs sm:text-sm m-0">
                {formatDateTimeFull(evento.fechaFin || evento.fechaInicio)}
              </p>
            </div>
          </div>
        </div>

        {/* Logística de Vuelo (Solo vuelos con origen o destino) */}
        {isVuelo && (evento.ciudadOrigen || evento.aeropuertoOrigen || evento.ciudadDestino || evento.aeropuertoDestino) && (
          <div className="p-3.5 rounded-xl bg-[#151B27]/50 border border-[#1C2436] space-y-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#00E5FF] uppercase tracking-wider border-b border-[#1C2436] pb-1.5">
              <Plane className="w-3.5 h-3.5" style={{ color: routeColor }} />
              Ruta & Logística Aérea
            </span>

            <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436] flex items-center justify-between gap-2">
              {/* ORIGEN */}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-[#00FF85] uppercase block">Origen</span>
                <p className="text-lg font-black text-[#F1F5F9] m-0 tracking-tight leading-tight">
                  {evento.aeropuertoOrigen || evento.ciudadOrigen || 'ORG'}
                </p>
                <p className="text-[11px] text-[#CBD5E1] m-0 truncate flex items-center gap-1">
                  <MiniFlag country={evento.paisOrigen} className="w-3.5 h-2.5" />
                  <span>{evento.ciudadOrigen || cleanCountryText(evento.paisOrigen) || 'Origen'}</span>
                </p>
              </div>

              {/* TRAYECTO CENTRAL */}
              <div className="flex flex-col items-center justify-center px-2 text-center shrink-0">
                <Plane className="w-4 h-4" style={{ color: routeColor }} />
                <div className="w-12 sm:w-16 h-px my-1" style={{ backgroundColor: `${routeColor}50` }} />
                {evento.tieneConexion ? (
                  <span className="text-[9px] font-bold text-[#FFE500] bg-[#FFE500]/15 px-1.5 py-0.5 rounded border border-[#FFE500]/30">
                    {evento.escalaMayor24h ? 'Stopover' : 'Escala'} {evento.aeropuertoConexion || evento.ciudadConexion || ''}
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-[#8492A6]">Vuelo Directo</span>
                )}
              </div>

              {/* DESTINO */}
              <div className="min-w-0 flex-1 text-right">
                <span className="text-[9px] font-bold uppercase block" style={{ color: routeColor }}>Destino</span>
                <p className="text-lg font-black text-[#F1F5F9] m-0 tracking-tight leading-tight">
                  {evento.aeropuertoDestino || evento.ciudadDestino || 'DST'}
                </p>
                <p className="text-[11px] text-[#CBD5E1] m-0 truncate flex items-center justify-end gap-1">
                  <span>{evento.ciudadDestino || cleanCountryText(evento.paisDestino) || 'Destino'}</span>
                  <MiniFlag country={evento.paisDestino} className="w-3.5 h-2.5" />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ubicación y Mapa */}
        {ubicacion && (
          <div className="p-3.5 rounded-xl bg-[#151B27]/50 border border-[#1C2436] space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Ubicación Física & Dirección
            </span>
            <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1C2436] flex items-center justify-between gap-2">
              <span className="text-xs text-[#CBD5E1] font-medium break-words flex-1">
                {ubicacion}
              </span>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#00E5FF] text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Ver en Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sección Financiera y Presupuesto */}
        <div className="p-3.5 rounded-xl bg-[#151B27]/50 border border-[#1C2436] space-y-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#00FF85] uppercase tracking-wider border-b border-[#1C2436] pb-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Finanzas & Desglose de Pago
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-[#0E121B] border border-[#1C2436]">
              <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-1">
                Costo Registrado
              </span>
              {evento.costo && Number(evento.costo) > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-[#00FF85]">
                    {CURRENCY_MAP[(evento.moneda || 'COP').toUpperCase()]?.flag || '💱'}{' '}
                    {formatCurrencyDisplay(evento.costo, evento.moneda || 'COP', true)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-[#8492A6]">
                  {isVuelo && tramo === 'regreso' ? 'Costo computado en tramo de ida' : 'Sin costo / Gratuito'}
                </span>
              )}
            </div>

            <div className="p-3 rounded-lg bg-[#0E121B] border border-[#1C2436]">
              <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-1">
                Método de Pago / Tarjeta
              </span>
              {tarjetaCredito ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-bold text-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                  {tarjetaCredito}
                </span>
              ) : (
                <span className="text-xs text-[#8492A6] italic">
                  Efectivo / No especificada
                </span>
              )}
            </div>
          </div>

          {/* Badges de condición contable */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded border flex items-center gap-1 ${
                isAdelantado
                  ? 'text-[#FFE500] bg-[#FFE500]/10 border-[#FFE500]/30'
                  : 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {isAdelantado ? 'Pre-viaje (Costo hundido)' : 'Durante el Viaje'}
            </span>

            <span
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded border flex items-center gap-1 ${
                isDescontado
                  ? 'text-[#00FF85] bg-[#00FF85]/10 border-[#00FF85]/30'
                  : 'text-[#B55FE6] bg-[#B55FE6]/10 border-[#B55FE6]/30'
              }`}
            >
              {isDescontado ? 'En Presupuesto' : 'No Descuenta Presupuesto'}
            </span>
          </div>

          {/* Conversiones a otras divisas */}
          {evento.costo && Number(evento.costo) > 0 && (
            <div className="pt-2 border-t border-[#1C2436]">
              <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#00E5FF]" />
                Conversión en otras monedas
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {getOtherCurrenciesConversions(evento.costo, evento.moneda || 'COP').map((conv) => (
                  <div key={conv.code} className="p-1.5 rounded bg-[#0E121B] border border-[#1C2436]">
                    <span className="text-[9px] text-[#8492A6] flex items-center gap-1">
                      <span>{conv.flag}</span>
                      <span className="font-bold text-[#F1F5F9]">{conv.code}</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#00FF85] block truncate mt-0.5">
                      {conv.shortDisplay}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notas y Observaciones */}
        <div className="p-3.5 rounded-xl bg-[#151B27]/50 border border-[#1C2436] space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#8492A6] uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />
            Notas & Anotaciones
          </span>
          {notasLimpias ? (
            <div className="p-3 rounded-lg bg-[#0E121B] border border-[#1C2436] text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">
              {notasLimpias}
            </div>
          ) : (
            <p className="text-xs text-[#8492A6] italic m-0 p-2">
              Sin notas adicionales registradas para este evento.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DetalleEventoModal;

