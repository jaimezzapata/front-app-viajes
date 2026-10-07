import React, { useState, useEffect } from 'react';
import {
  Plane,
  MapPin,
  Clock,
  ArrowRight,
  CornerDownRight,
  RefreshCw,
  ArrowLeftRight,
  Check,
  Calendar
} from 'lucide-react';
import Modal from '../../../components/Modal';
import CountryInput from '../../../components/CountryInput';
import AirportCityInput from '../../../components/AirportCityInput';
import { CurrencySelector } from '../../../components/CurrencySelector';
import { formatWithMiniFlag } from '../../../services/geoApiService';

function toLocalDatetimeInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const mins = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

export function NuevoEventoModal({
  isOpen,
  onClose,
  onSaveEvento,
  eventoAEditar,
  onUpdateEvento,
  monedaDefault = 'COP',
  activeViaje = null
}) {
  const isEditing = Boolean(eventoAEditar);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('vuelo');
  const [tipoTrayecto, setTipoTrayecto] = useState('round-trip'); // 'round-trip' | 'one-way'
  const [tramo, setTramo] = useState('ida'); // 'ida' | 'regreso'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [costo, setCosto] = useState('');
  const [moneda, setMoneda] = useState(monedaDefault || 'COP');
  const [notas, setNotas] = useState('');

  // Tramo 1: Ida / Origen -> Destino
  const [ciudadOrigen, setCiudadOrigen] = useState('');
  const [paisOrigen, setPaisOrigen] = useState('');
  const [aeropuertoOrigen, setAeropuertoOrigen] = useState('');

  const [ciudadDestino, setCiudadDestino] = useState('');
  const [paisDestino, setPaisDestino] = useState('');
  const [aeropuertoDestino, setAeropuertoDestino] = useState('');

  const [tieneConexion, setTieneConexion] = useState(false);
  const [aeropuertoConexion, setAeropuertoConexion] = useState('');
  const [ciudadConexion, setCiudadConexion] = useState('');
  const [paisConexion, setPaisConexion] = useState('');
  const [horasEscala, setHorasEscala] = useState('');
  const [escalaMayor24h, setEscalaMayor24h] = useState(false);

  // Tramo 2: Retorno / Regreso (Para Vuelos Round-Trip)
  const [fechaInicioRegreso, setFechaInicioRegreso] = useState('');
  const [fechaFinRegreso, setFechaFinRegreso] = useState('');
  const [ciudadOrigenRegreso, setCiudadOrigenRegreso] = useState('');
  const [paisOrigenRegreso, setPaisOrigenRegreso] = useState('');
  const [aeropuertoOrigenRegreso, setAeropuertoOrigenRegreso] = useState('');

  const [ciudadDestinoRegreso, setCiudadDestinoRegreso] = useState('');
  const [paisDestinoRegreso, setPaisDestinoRegreso] = useState('');
  const [aeropuertoDestinoRegreso, setAeropuertoDestinoRegreso] = useState('');

  const [tieneConexionRegreso, setTieneConexionRegreso] = useState(false);
  const [aeropuertoConexionRegreso, setAeropuertoConexionRegreso] = useState('');
  const [ciudadConexionRegreso, setCiudadConexionRegreso] = useState('');
  const [paisConexionRegreso, setPaisConexionRegreso] = useState('');
  const [horasEscalaRegreso, setHorasEscalaRegreso] = useState('');
  const [escalaMayor24hRegreso, setEscalaMayor24hRegreso] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (eventoAEditar) {
      setTitulo(eventoAEditar.titulo || '');
      setTipo(eventoAEditar.tipo || 'vuelo');
      setTipoTrayecto(eventoAEditar.tipoTrayecto || 'one-way');
      setTramo(eventoAEditar.tramo || 'ida');
      setFechaInicio(toLocalDatetimeInput(eventoAEditar.fechaInicio));
      setFechaFin(toLocalDatetimeInput(eventoAEditar.fechaFin));
      setUbicacion(eventoAEditar.ubicacion || '');
      setCosto(eventoAEditar.costo !== undefined && eventoAEditar.costo !== null ? String(eventoAEditar.costo) : '');
      setMoneda(eventoAEditar.moneda || monedaDefault || 'COP');
      setNotas(eventoAEditar.notas || '');

      setCiudadOrigen(eventoAEditar.ciudadOrigen || '');
      setPaisOrigen(eventoAEditar.paisOrigen || '');
      setAeropuertoOrigen(eventoAEditar.aeropuertoOrigen || '');

      setCiudadDestino(eventoAEditar.ciudadDestino || '');
      setPaisDestino(eventoAEditar.paisDestino || '');
      setAeropuertoDestino(eventoAEditar.aeropuertoDestino || '');

      setTieneConexion(Boolean(eventoAEditar.tieneConexion));
      setAeropuertoConexion(eventoAEditar.aeropuertoConexion || '');
      setCiudadConexion(eventoAEditar.ciudadConexion || '');
      setPaisConexion(eventoAEditar.paisConexion || '');
      setHorasEscala(eventoAEditar.horasEscala !== undefined && eventoAEditar.horasEscala !== null ? String(eventoAEditar.horasEscala) : '');
      setEscalaMayor24h(Boolean(eventoAEditar.escalaMayor24h || (eventoAEditar.horasEscala && Number(eventoAEditar.horasEscala) >= 24)));

      // Campos de regreso si existen
      setFechaInicioRegreso('');
      setFechaFinRegreso('');
      setCiudadOrigenRegreso('');
      setPaisOrigenRegreso('');
      setAeropuertoOrigenRegreso('');
      setCiudadDestinoRegreso('');
      setPaisDestinoRegreso('');
      setAeropuertoDestinoRegreso('');
      setTieneConexionRegreso(false);
      setAeropuertoConexionRegreso('');
      setCiudadConexionRegreso('');
      setPaisConexionRegreso('');
      setHorasEscalaRegreso('');
      setEscalaMayor24hRegreso(false);
    } else {
      setTitulo('');
      setTipo('vuelo');
      setTipoTrayecto('round-trip');
      setTramo('ida');
      setFechaInicio('');
      setFechaFin('');
      setUbicacion('');
      setCosto('');
      setMoneda(monedaDefault || 'COP');
      setNotas('');

      setCiudadOrigen('');
      setPaisOrigen('');
      setAeropuertoOrigen('');

      setCiudadDestino('');
      setPaisDestino('');
      setAeropuertoDestino('');

      setTieneConexion(false);
      setAeropuertoConexion('');
      setCiudadConexion('');
      setPaisConexion('');
      setHorasEscala('');
      setEscalaMayor24h(false);

      setFechaInicioRegreso('');
      setFechaFinRegreso('');
      setCiudadOrigenRegreso('');
      setPaisOrigenRegreso('');
      setAeropuertoOrigenRegreso('');
      setCiudadDestinoRegreso('');
      setPaisDestinoRegreso('');
      setAeropuertoDestinoRegreso('');
      setTieneConexionRegreso(false);
      setAeropuertoConexionRegreso('');
      setCiudadConexionRegreso('');
      setPaisConexionRegreso('');
      setHorasEscalaRegreso('');
      setEscalaMayor24hRegreso(false);
    }
    setErrorMsg('');
  }, [eventoAEditar, isOpen, monedaDefault]);

  // Autocompletado del tramo de regreso al escribir origen y destino de ida
  const handleOutboundOriginChange = (city, country, airport) => {
    if (city !== undefined) setCiudadOrigen(city);
    if (country !== undefined) setPaisOrigen(country);
    if (airport !== undefined) setAeropuertoOrigen(airport);

    // Si aún no se ha modificado el destino de regreso, mantenerlo sincronizado
    if (city !== undefined && (!ciudadDestinoRegreso || ciudadDestinoRegreso === ciudadOrigen)) setCiudadDestinoRegreso(city);
    if (country !== undefined && (!paisDestinoRegreso || paisDestinoRegreso === paisOrigen)) setPaisDestinoRegreso(country);
    if (airport !== undefined && (!aeropuertoDestinoRegreso || aeropuertoDestinoRegreso === aeropuertoOrigen)) setAeropuertoDestinoRegreso(airport);
  };

  const handleOutboundDestChange = (city, country, airport) => {
    if (city !== undefined) setCiudadDestino(city);
    if (country !== undefined) setPaisDestino(country);
    if (airport !== undefined) setAeropuertoDestino(airport);

    // Si aún no se ha modificado el origen de regreso, mantenerlo sincronizado
    if (city !== undefined && (!ciudadOrigenRegreso || ciudadOrigenRegreso === ciudadDestino)) setCiudadOrigenRegreso(city);
    if (country !== undefined && (!paisOrigenRegreso || paisOrigenRegreso === paisDestino)) setPaisOrigenRegreso(country);
    if (airport !== undefined && (!aeropuertoOrigenRegreso || aeropuertoOrigenRegreso === aeropuertoDestino)) setAeropuertoOrigenRegreso(airport);
  };

  const handleSwapReturnLocations = () => {
    setCiudadOrigenRegreso(ciudadDestino);
    setPaisOrigenRegreso(paisDestino);
    setAeropuertoOrigenRegreso(aeropuertoDestino);
    setCiudadDestinoRegreso(ciudadOrigen);
    setPaisDestinoRegreso(paisOrigen);
    setAeropuertoDestinoRegreso(aeropuertoOrigen);
  };

  const handleHorasEscalaChange = (val, isReturn = false) => {
    if (isReturn) {
      setHorasEscalaRegreso(val);
      const num = Number(val);
      setEscalaMayor24hRegreso(!isNaN(num) && num >= 24);
    } else {
      setHorasEscala(val);
      const num = Number(val);
      setEscalaMayor24h(!isNaN(num) && num >= 24);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaInicio) {
      setErrorMsg('Por favor completa la fecha y hora de salida');
      return;
    }

    if (tipo === 'vuelo' && tipoTrayecto === 'round-trip' && !isEditing) {
      if (!fechaInicioRegreso) {
        setErrorMsg('Para vuelos Round-Trip, por favor indica la fecha y hora de regreso');
        return;
      }
      if (new Date(fechaInicioRegreso) < new Date(fechaInicio)) {
        setErrorMsg('La fecha de regreso no puede ser anterior a la fecha de ida');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const numHoras = horasEscala ? Number(horasEscala) : null;
      const isMayor24 = escalaMayor24h || (numHoras !== null && numHoras >= 24);

      const originTitle = aeropuertoOrigen || ciudadOrigen || 'Origen';
      const destTitle = aeropuertoDestino || ciudadDestino || 'Destino';
      const defaultTitle = isEditing
        ? titulo.trim()
        : (tipo === 'vuelo' ? `${originTitle} ➔ ${destTitle}` : titulo.trim() || 'Evento');

      // CASO 1: Creación de Vuelo Round-Trip (Genera automáticamente los dos tramos organizados)
      if (tipo === 'vuelo' && tipoTrayecto === 'round-trip' && !isEditing) {
        const roundTripGroupId = `rt-${Date.now()}`;
        const returnOriginCity = ciudadOrigenRegreso || ciudadDestino;
        const returnOriginCountry = paisOrigenRegreso || paisDestino;
        const returnOriginAirport = aeropuertoOrigenRegreso || aeropuertoDestino;

        const returnDestCity = ciudadDestinoRegreso || ciudadOrigen;
        const returnDestCountry = paisDestinoRegreso || paisOrigen;
        const returnDestAirport = aeropuertoDestinoRegreso || aeropuertoOrigen;

        const numHorasReg = horasEscalaRegreso ? Number(horasEscalaRegreso) : null;
        const isMayor24Reg = escalaMayor24hRegreso || (numHorasReg !== null && numHorasReg >= 24);

        // Tramo 1: Vuelo de Ida
        const idaPayload = {
          titulo: `Vuelo (Ida): ${originTitle} ➔ ${destTitle}`,
          tipo: 'vuelo',
          tipoTrayecto: 'round-trip',
          tramo: 'ida',
          roundTripGroupId,
          fechaInicio: new Date(fechaInicio).toISOString(),
          fechaFin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
          ubicacion: ciudadDestino ? `${ciudadDestino}, ${paisDestino || ''}` : undefined,
          costo: costo ? Number(costo) : undefined,
          moneda: moneda.toUpperCase(),
          notas: notas.trim() ? `${notas.trim()} (Tiquete Round-Trip • Tramo de Ida)` : 'Tiquete Round-Trip • Tramo de Ida',
          ciudadOrigen: ciudadOrigen.trim() || undefined,
          paisOrigen: paisOrigen.trim() ? formatWithMiniFlag(paisOrigen) : undefined,
          aeropuertoOrigen: aeropuertoOrigen.trim() || undefined,
          ciudadDestino: ciudadDestino.trim() || undefined,
          paisDestino: paisDestino.trim() ? formatWithMiniFlag(paisDestino) : undefined,
          aeropuertoDestino: aeropuertoDestino.trim() || undefined,
          tieneConexion,
          aeropuertoConexion: tieneConexion ? aeropuertoConexion.trim() || undefined : undefined,
          ciudadConexion: tieneConexion ? ciudadConexion.trim() || undefined : undefined,
          paisConexion: (tieneConexion && paisConexion.trim()) ? formatWithMiniFlag(paisConexion) : undefined,
          horasEscala: tieneConexion && numHoras !== null ? numHoras : undefined,
          escalaMayor24h: tieneConexion ? isMayor24 : false
        };

        // Tramo 2: Vuelo de Retorno
        const regresoTitleOrigin = returnOriginAirport || returnOriginCity || destTitle;
        const regresoTitleDest = returnDestAirport || returnDestCity || originTitle;

        const regresoPayload = {
          titulo: `Vuelo (Regreso): ${regresoTitleOrigin} ➔ ${regresoTitleDest}`,
          tipo: 'vuelo',
          tipoTrayecto: 'round-trip',
          tramo: 'regreso',
          roundTripGroupId,
          fechaInicio: new Date(fechaInicioRegreso).toISOString(),
          fechaFin: fechaFinRegreso ? new Date(fechaFinRegreso).toISOString() : undefined,
          ubicacion: returnDestCity ? `${returnDestCity}, ${returnDestCountry || ''}` : undefined,
          costo: 0, // El costo total queda computado en el boleto de ida para balance presupuestal
          moneda: moneda.toUpperCase(),
          notas: `Tiquete Round-Trip • Tramo de Regreso (${originTitle} ➔ ${destTitle}). Costo computado en el tramo de ida.`,
          ciudadOrigen: returnOriginCity.trim() || undefined,
          paisOrigen: returnOriginCountry.trim() ? formatWithMiniFlag(returnOriginCountry) : undefined,
          aeropuertoOrigen: returnOriginAirport.trim() || undefined,
          ciudadDestino: returnDestCity.trim() || undefined,
          paisDestino: returnDestCountry.trim() ? formatWithMiniFlag(returnDestCountry) : undefined,
          aeropuertoDestino: returnDestAirport.trim() || undefined,
          tieneConexion: tieneConexionRegreso,
          aeropuertoConexion: tieneConexionRegreso ? aeropuertoConexionRegreso.trim() || undefined : undefined,
          ciudadConexion: tieneConexionRegreso ? ciudadConexionRegreso.trim() || undefined : undefined,
          paisConexion: (tieneConexionRegreso && paisConexionRegreso.trim()) ? formatWithMiniFlag(paisConexionRegreso) : undefined,
          horasEscala: tieneConexionRegreso && numHorasReg !== null ? numHorasReg : undefined,
          escalaMayor24h: tieneConexionRegreso ? isMayor24Reg : false
        };

        await onSaveEvento([idaPayload, regresoPayload]);
        onClose();
        return;
      }

      // CASO 2: Vuelo One-Way o Evento Estándar (o Edición)
      const payload = {
        titulo: defaultTitle || (tipo === 'vuelo' ? 'Vuelo' : 'Evento'),
        tipo,
        tipoTrayecto: tipo === 'vuelo' ? tipoTrayecto : undefined,
        tramo: tipo === 'vuelo' ? tramo : undefined,
        roundTripGroupId: eventoAEditar?.roundTripGroupId || undefined,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
        ubicacion: ubicacion.trim() || (ciudadDestino ? `${ciudadDestino}, ${paisDestino || ''}` : undefined),
        costo: costo ? Number(costo) : undefined,
        moneda: moneda.toUpperCase(),
        notas: notas.trim() || undefined,

        ciudadOrigen: ciudadOrigen.trim() || undefined,
        paisOrigen: paisOrigen.trim() ? formatWithMiniFlag(paisOrigen) : undefined,
        aeropuertoOrigen: aeropuertoOrigen.trim() || undefined,
        ciudadDestino: ciudadDestino.trim() || undefined,
        paisDestino: paisDestino.trim() ? formatWithMiniFlag(paisDestino) : undefined,
        aeropuertoDestino: aeropuertoDestino.trim() || undefined,
        tieneConexion,
        aeropuertoConexion: tieneConexion ? aeropuertoConexion.trim() || undefined : undefined,
        ciudadConexion: tieneConexion ? ciudadConexion.trim() || undefined : undefined,
        paisConexion: (tieneConexion && paisConexion.trim()) ? formatWithMiniFlag(paisConexion) : undefined,
        horasEscala: tieneConexion && numHoras !== null ? numHoras : undefined,
        escalaMayor24h: tieneConexion ? isMayor24 : false
      };

      if (isEditing && onUpdateEvento) {
        await onUpdateEvento(eventoAEditar.id, payload);
      } else {
        await onSaveEvento(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el vuelo / evento');
    } finally {
      setLoading(false);
    }
  };

  const isTrayecto = tipo === 'vuelo' || tipo === 'transporte';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? (tipo === 'vuelo' ? 'Editar Vuelo' : 'Editar Evento')
          : (tipo === 'vuelo' ? 'Agendar Vuelo' : 'Añadir Evento a la Bitácora')
      }
      maxWidth={tipo === 'vuelo' && tipoTrayecto === 'round-trip' && !isEditing ? 'max-w-2xl' : 'max-w-lg'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Selector de Tipo de Evento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Tipo de Evento *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="vuelo">✈️ Vuelo</option>
              <option value="transporte">🚆 Transporte / Tren / Bus</option>
              <option value="hotel">🏨 Hotel / Alojamiento</option>
              <option value="atraccion">📍 Atracción / Paseo</option>
              <option value="comida">🍴 Comida / Restaurante</option>
              <option value="otro">📌 Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Título / Referencia {tipo === 'vuelo' ? '(Opcional)' : '*'}
            </label>
            <input
              type="text"
              required={tipo !== 'vuelo'}
              placeholder={
                tipo === 'vuelo'
                  ? 'Ej. Avianca AV010 / Latam'
                  : 'Ej. Visita al Templo Senso-ji'
              }
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
            />
          </div>
        </div>

        {/* Campo Ubicación para eventos regulares (Hoteles, atracciones, etc.) */}
        {tipo !== 'vuelo' && (
          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" /> Ubicación / Ciudad / País (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Abu Dhabi, Emiratos Árabes Unidos"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>
        )}

        {/* SELECTOR: ROUND-TRIP vs ONE-WAY para VUELOS */}
        {tipo === 'vuelo' && (
          <div className="p-1.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2">
            <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block px-1">
              Modalidad de Trayecto Aéreo
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoTrayecto('round-trip')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  tipoTrayecto === 'round-trip'
                    ? 'bg-[#00E5FF] text-[#080A0F] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                    : 'bg-[#151B27] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Round-Trip (Ida y Vuelta)</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoTrayecto('one-way')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  tipoTrayecto === 'one-way'
                    ? 'bg-[#00E5FF] text-[#080A0F] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                    : 'bg-[#151B27] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>One-Way (Solo Ida)</span>
              </button>
            </div>
          </div>
        )}

        {/* SECCIÓN TRAMO 1: SALIDA / IDA */}
        {isTrayecto && (
          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#1C2436] pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30">
                  <Plane className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-[#00FF85] uppercase tracking-wider">
                  {tipoTrayecto === 'round-trip' && !isEditing ? 'Tramo 1: Vuelo de Salida (Ida 🛫)' : 'Ruta Aérea (Origen y Destino)'}
                </span>
              </div>
              <span className="text-[10px] text-[#8492A6] font-semibold">
                {aeropuertoOrigen || ciudadOrigen || 'Origen'} ➔ {aeropuertoDestino || ciudadDestino || 'Destino'}
              </span>
            </div>

            {/* ORIGEN */}
            <div>
              <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00FF85]" /> Origen de Salida
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <AirportCityInput
                  type="airport"
                  placeholder="Aeropuerto (Ej. MDE)"
                  value={aeropuertoOrigen}
                  onChange={(val) => handleOutboundOriginChange(undefined, undefined, val)}
                  onSelectAirportOrCity={(item) => {
                    handleOutboundOriginChange(item.city || ciudadOrigen, item.countryWithFlag || paisOrigen, item.iata);
                  }}
                />
                <input
                  type="text"
                  placeholder="Ciudad (Ej. Medellín)"
                  value={ciudadOrigen}
                  onChange={(e) => handleOutboundOriginChange(e.target.value, undefined, undefined)}
                  className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
                <CountryInput
                  value={paisOrigen}
                  onChange={(val) => handleOutboundOriginChange(undefined, val, undefined)}
                  placeholder="País (Ej. Colombia)"
                />
              </div>
            </div>

            {/* DESTINO */}
            <div className="pt-2 border-t border-[#1C2436]">
              <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Destino de Llegada
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <AirportCityInput
                  type="airport"
                  placeholder="Aeropuerto (Ej. MAD)"
                  value={aeropuertoDestino}
                  onChange={(val) => handleOutboundDestChange(undefined, undefined, val)}
                  onSelectAirportOrCity={(item) => {
                    handleOutboundDestChange(item.city || ciudadDestino, item.countryWithFlag || paisDestino, item.iata);
                  }}
                />
                <input
                  type="text"
                  placeholder="Ciudad (Ej. Madrid)"
                  value={ciudadDestino}
                  onChange={(e) => handleOutboundDestChange(e.target.value, undefined, undefined)}
                  className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
                <CountryInput
                  value={paisDestino}
                  onChange={(val) => handleOutboundDestChange(undefined, val, undefined)}
                  placeholder="País (Ej. España)"
                />
              </div>
            </div>

            {/* HORARIOS DEL TRAMO 1 */}
            <div className="pt-2 border-t border-[#1C2436] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00FF85]" /> Salida de Ida *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Llegada Estimada (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            {/* ESCALA TRAMO 1 */}
            <div className="pt-2 border-t border-[#1C2436]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tieneConexion}
                  onChange={(e) => setTieneConexion(e.target.checked)}
                  className="w-4 h-4 rounded border-[#1C2436] accent-[#FFE500]"
                />
                <span className="text-xs text-[#F1F5F9] font-medium flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#FFE500]" />
                  ¿Tiene escala o conexión en este tramo?
                </span>
              </label>

              {tieneConexion && (
                <div className="mt-2.5 p-3 rounded-lg bg-[#151B27] border border-[#FFE500]/30 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#FFE500] uppercase tracking-wider block">
                    Aeropuerto y Lugar de Escala
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <AirportCityInput
                      type="airport"
                      placeholder="Aeropuerto escala (Ej. BOG / MIA)"
                      value={aeropuertoConexion}
                      onChange={setAeropuertoConexion}
                      onSelectAirportOrCity={(item) => {
                        setAeropuertoConexion(item.iata);
                        if (item.city && !ciudadConexion) setCiudadConexion(item.city);
                        if (item.countryWithFlag && !paisConexion) setPaisConexion(item.countryWithFlag);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Ciudad conexión (Ej. Bogotá)"
                      value={ciudadConexion}
                      onChange={(e) => setCiudadConexion(e.target.value)}
                      className="bg-[#0E121B] border border-[#1C2436] focus:border-[#FFE500] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                    />
                    <CountryInput
                      value={paisConexion}
                      onChange={setPaisConexion}
                      placeholder="País conexión"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Horas escala (ej. 3)"
                        value={horasEscala}
                        onChange={(e) => handleHorasEscalaChange(e.target.value, false)}
                        className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#FFE500] rounded px-2 py-1 text-xs text-[#F1F5F9]"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#8492A6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={escalaMayor24h}
                        onChange={(e) => setEscalaMayor24h(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#00FF85]"
                      />
                      <span>Stopover (+24h)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN TRAMO 2: RETORNO / REGRESO (Para Vuelos Round-Trip) */}
        {tipo === 'vuelo' && tipoTrayecto === 'round-trip' && !isEditing && (
          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#00E5FF]/40 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-[#1C2436] pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                  <RefreshCw className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
                  Tramo 2: Vuelo de Retorno (Regreso 🛬)
                </span>
              </div>
              <button
                type="button"
                onClick={handleSwapReturnLocations}
                className="text-[10px] font-bold text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                title="Restaurar trayecto invertido exacto (Destino ➔ Origen)"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Restaurar Inverso</span>
              </button>
            </div>

            {/* ORIGEN DE REGRESO */}
            <div>
              <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Salida de Retorno
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <AirportCityInput
                  type="airport"
                  placeholder="Aeropuerto (Ej. MAD)"
                  value={aeropuertoOrigenRegreso || aeropuertoDestino}
                  onChange={setAeropuertoOrigenRegreso}
                  onSelectAirportOrCity={(item) => {
                    setAeropuertoOrigenRegreso(item.iata);
                    if (item.city) setCiudadOrigenRegreso(item.city);
                    if (item.countryWithFlag) setPaisOrigenRegreso(item.countryWithFlag);
                  }}
                />
                <input
                  type="text"
                  placeholder="Ciudad salida retorno"
                  value={ciudadOrigenRegreso || ciudadDestino}
                  onChange={(e) => setCiudadOrigenRegreso(e.target.value)}
                  className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
                <CountryInput
                  value={paisOrigenRegreso || paisDestino}
                  onChange={setPaisOrigenRegreso}
                  placeholder="País retorno"
                />
              </div>
            </div>

            {/* DESTINO DE REGRESO */}
            <div className="pt-2 border-t border-[#1C2436]">
              <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00FF85]" /> Destino Final de Retorno
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <AirportCityInput
                  type="airport"
                  placeholder="Aeropuerto llegada (Ej. MDE)"
                  value={aeropuertoDestinoRegreso || aeropuertoOrigen}
                  onChange={setAeropuertoDestinoRegreso}
                  onSelectAirportOrCity={(item) => {
                    setAeropuertoDestinoRegreso(item.iata);
                    if (item.city) setCiudadDestinoRegreso(item.city);
                    if (item.countryWithFlag) setPaisDestinoRegreso(item.countryWithFlag);
                  }}
                />
                <input
                  type="text"
                  placeholder="Ciudad llegada retorno"
                  value={ciudadDestinoRegreso || ciudadOrigen}
                  onChange={(e) => setCiudadDestinoRegreso(e.target.value)}
                  className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
                <CountryInput
                  value={paisDestinoRegreso || paisOrigen}
                  onChange={setPaisDestinoRegreso}
                  placeholder="País llegada retorno"
                />
              </div>
            </div>

            {/* HORARIOS DEL REGRESO */}
            <div className="pt-2 border-t border-[#1C2436] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Salida de Retorno *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaInicioRegreso}
                  onChange={(e) => setFechaInicioRegreso(e.target.value)}
                  className="w-full bg-[#151B27] border border-[#00E5FF]/40 focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FFE500]" /> Llegada de Retorno (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={fechaFinRegreso}
                  onChange={(e) => setFechaFinRegreso(e.target.value)}
                  className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>

            {/* ESCALA TRAMO DE REGRESO */}
            <div className="pt-2 border-t border-[#1C2436]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tieneConexionRegreso}
                  onChange={(e) => setTieneConexionRegreso(e.target.checked)}
                  className="w-4 h-4 rounded border-[#1C2436] accent-[#00E5FF]"
                />
                <span className="text-xs text-[#F1F5F9] font-medium flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#00E5FF]" />
                  ¿El vuelo de regreso tiene escala o conexión?
                </span>
              </label>

              {tieneConexionRegreso && (
                <div className="mt-2.5 p-3 rounded-lg bg-[#151B27] border border-[#00E5FF]/30 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider block">
                    Aeropuerto y Lugar de Escala (Regreso)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <AirportCityInput
                      type="airport"
                      placeholder="Aeropuerto escala"
                      value={aeropuertoConexionRegreso}
                      onChange={setAeropuertoConexionRegreso}
                      onSelectAirportOrCity={(item) => {
                        setAeropuertoConexionRegreso(item.iata);
                        if (item.city) setCiudadConexionRegreso(item.city);
                        if (item.countryWithFlag) setPaisConexionRegreso(item.countryWithFlag);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Ciudad conexión regreso"
                      value={ciudadConexionRegreso}
                      onChange={(e) => setCiudadConexionRegreso(e.target.value)}
                      className="bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                    />
                    <CountryInput
                      value={paisConexionRegreso}
                      onChange={setPaisConexionRegreso}
                      placeholder="País conexión"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Horas escala (ej. 3)"
                        value={horasEscalaRegreso}
                        onChange={(e) => handleHorasEscalaChange(e.target.value, true)}
                        className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2 py-1 text-xs text-[#F1F5F9]"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] text-[#8492A6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={escalaMayor24hRegreso}
                        onChange={(e) => setEscalaMayor24hRegreso(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#00FF85]"
                      />
                      <span>Stopover (+24h)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HORARIOS PARA EVENTOS REGULARES (NO VUELOS ROUND-TRIP) */}
        {(!isTrayecto || tipo !== 'vuelo') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFE500]" /> Hora de Fin (Opcional)
              </label>
              <input
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
              />
              <span className="text-[10px] text-[#8492A6] mt-0.5 block">Default +2h si se omite</span>
            </div>
          </div>
        )}

        {/* COSTO TOTAL E INTEROPERABILIDAD MULTIDIVISA */}
        <div className="p-3 rounded-lg bg-[#151B27] border border-[#1C2436] space-y-3">
          <CurrencySelector
            value={moneda}
            onChange={(selectedCurr) => setMoneda(selectedCurr)}
            viaje={activeViaje}
            label={tipo === 'vuelo' && tipoTrayecto === 'round-trip' ? 'Moneda del Boleto Round-Trip' : 'Moneda del Evento'}
          />

          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              {tipo === 'vuelo' && tipoTrayecto === 'round-trip'
                ? 'Costo Total del Tiquete Round-Trip (Ida y Vuelta)'
                : 'Costo (Opcional)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8492A6] text-xs font-bold">
                $
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={tipo === 'vuelo' ? 'Ej. 1200' : '0.00'}
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg pl-7 pr-3 py-2 text-sm text-[#F1F5F9] focus:outline-none font-semibold"
              />
            </div>
            {tipo === 'vuelo' && tipoTrayecto === 'round-trip' && (
              <span className="text-[10px] text-[#8492A6] mt-1 block">
                ✓ Se registrará en tus gastos para no duplicar el cobro en el presupuesto.
              </span>
            )}
          </div>
        </div>

        {/* NOTAS */}
        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Notas Adicionales (Opcional)
          </label>
          <textarea
            rows={2}
            placeholder="Aerolínea, código de reserva, equipaje incluido..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none resize-none"
          />
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C2436]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#00E5FF] hover:opacity-90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-opacity disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {loading ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                <span>
                  {isEditing
                    ? 'Actualizar Vuelo'
                    : (tipo === 'vuelo' && tipoTrayecto === 'round-trip' ? 'Guardar Vuelo Round-Trip' : 'Guardar Evento')}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NuevoEventoModal;
