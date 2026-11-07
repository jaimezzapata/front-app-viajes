import { useState, useEffect, useMemo } from 'react';
import { formatWithMiniFlag } from '../../../../services/geoApiService';

export function toLocalDatetimeInput(dateStr) {
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

export function useEventoForm({
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
  const [tarjetaCredito, setTarjetaCredito] = useState('');
  const [descontarPresupuesto, setDescontarPresupuesto] = useState(true);
  const [pagadoAdelantado, setPagadoAdelantado] = useState(true);
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
      setTarjetaCredito(eventoAEditar.tarjetaCredito || eventoAEditar.gastoAsociado?.tarjetaCredito || '');
      setNotas((eventoAEditar.notas || '').replace(/\n?<!--META:.*?:META-->/g, '').trim());

      const initialDescontar = eventoAEditar.descontarPresupuesto !== undefined
        ? Boolean(eventoAEditar.descontarPresupuesto)
        : (eventoAEditar.gastoAsociado?.noComputar !== undefined
           ? !eventoAEditar.gastoAsociado.noComputar
           : true);
      const initialAdelantado = eventoAEditar.pagadoAdelantado !== undefined
        ? Boolean(eventoAEditar.pagadoAdelantado)
        : (eventoAEditar.gastoAsociado?.pagadoAdelantado !== undefined
           ? Boolean(eventoAEditar.gastoAsociado.pagadoAdelantado)
           : (eventoAEditar.tipo === 'vuelo'));
      setDescontarPresupuesto(initialDescontar);
      setPagadoAdelantado(initialAdelantado);

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
      setTarjetaCredito('');
      setDescontarPresupuesto(true);
      setPagadoAdelantado(true);
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

  // Lista de destinos configurados en el viaje activo para autocompletar rápidamente
  const availableDestinations = useMemo(() => {
    if (!activeViaje) return [];
    const list = [];
    if (Array.isArray(activeViaje.destinosMultidestino) && activeViaje.destinosMultidestino.length > 0) {
      activeViaje.destinosMultidestino.forEach((d, idx) => {
        if (d.destino || d.ciudad) {
          list.push({
            id: d.id || `dest-${idx}`,
            ciudad: d.ciudad || '',
            destino: d.destino || ''
          });
        }
      });
    } else if (activeViaje.destino) {
      list.push({
        id: 'main-dest',
        ciudad: '',
        destino: activeViaje.destino
      });
    }
    return list;
  }, [activeViaje]);

  // Autocompletado del tramo de regreso al escribir origen y destino de ida
  const handleOutboundOriginChange = (city, country, airport) => {
    if (city !== undefined) setCiudadOrigen(city);
    if (country !== undefined) setPaisOrigen(country);
    if (airport !== undefined) setAeropuertoOrigen(airport);

    if (city !== undefined && (!ciudadDestinoRegreso || ciudadDestinoRegreso === ciudadOrigen)) setCiudadDestinoRegreso(city);
    if (country !== undefined && (!paisDestinoRegreso || paisDestinoRegreso === paisOrigen)) setPaisDestinoRegreso(country);
    if (airport !== undefined && (!aeropuertoDestinoRegreso || aeropuertoDestinoRegreso === aeropuertoOrigen)) setAeropuertoDestinoRegreso(airport);
  };

  const handleOutboundDestChange = (city, country, airport) => {
    if (city !== undefined) setCiudadDestino(city);
    if (country !== undefined) setPaisDestino(country);
    if (airport !== undefined) setAeropuertoDestino(airport);

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

  const handleTipoChange = (newTipo) => {
    setTipo(newTipo);
    if (!isEditing) {
      if (newTipo === 'vuelo' || newTipo === 'atraccion') {
        setPagadoAdelantado(true);
      }
    }
  };

  const isTrayecto = tipo === 'vuelo' || tipo === 'transporte';

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
          tarjetaCredito: tarjetaCredito.trim() || undefined,
          descontarPresupuesto,
          pagadoAdelantado,
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
          costo: 0,
          moneda: moneda.toUpperCase(),
          descontarPresupuesto,
          pagadoAdelantado,
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
      const cleanTipo = (tipo || 'otro').trim().toLowerCase();
      const payload = {
        titulo: defaultTitle || (cleanTipo === 'vuelo' ? 'Vuelo' : 'Evento'),
        tipo: cleanTipo,
        tipoTrayecto: cleanTipo === 'vuelo' ? tipoTrayecto : undefined,
        tramo: cleanTipo === 'vuelo' ? tramo : undefined,
        roundTripGroupId: cleanTipo === 'vuelo' ? (eventoAEditar?.roundTripGroupId || undefined) : undefined,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
        ubicacion: ubicacion.trim() || (ciudadDestino ? `${ciudadDestino}, ${paisDestino || ''}` : undefined),
        costo: costo ? Number(costo) : undefined,
        moneda: moneda.toUpperCase(),
        tarjetaCredito: tarjetaCredito.trim() || undefined,
        descontarPresupuesto,
        pagadoAdelantado,
        notas: notas.trim() || undefined,

        ciudadOrigen: isTrayecto ? (ciudadOrigen.trim() || undefined) : undefined,
        paisOrigen: isTrayecto ? (paisOrigen.trim() ? formatWithMiniFlag(paisOrigen) : undefined) : undefined,
        aeropuertoOrigen: isTrayecto ? (aeropuertoOrigen.trim() || undefined) : undefined,
        ciudadDestino: ciudadDestino.trim() || undefined,
        paisDestino: paisDestino.trim() ? formatWithMiniFlag(paisDestino) : undefined,
        aeropuertoDestino: isTrayecto ? (aeropuertoDestino.trim() || undefined) : undefined,
        tieneConexion: isTrayecto ? tieneConexion : false,
        aeropuertoConexion: (isTrayecto && tieneConexion) ? (aeropuertoConexion.trim() || undefined) : undefined,
        ciudadConexion: (isTrayecto && tieneConexion) ? (ciudadConexion.trim() || undefined) : undefined,
        paisConexion: (isTrayecto && tieneConexion && paisConexion.trim()) ? formatWithMiniFlag(paisConexion) : undefined,
        horasEscala: (isTrayecto && tieneConexion && numHoras !== null) ? numHoras : undefined,
        escalaMayor24h: (isTrayecto && tieneConexion) ? isMayor24 : false
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

  return {
    isEditing,
    loading,
    errorMsg,
    isTrayecto,
    availableDestinations,
    formData: {
      titulo,
      tipo,
      tipoTrayecto,
      tramo,
      fechaInicio,
      fechaFin,
      ubicacion,
      costo,
      moneda,
      tarjetaCredito,
      descontarPresupuesto,
      pagadoAdelantado,
      notas,
      ciudadOrigen,
      paisOrigen,
      aeropuertoOrigen,
      ciudadDestino,
      paisDestino,
      aeropuertoDestino,
      tieneConexion,
      aeropuertoConexion,
      ciudadConexion,
      paisConexion,
      horasEscala,
      escalaMayor24h,
      fechaInicioRegreso,
      fechaFinRegreso,
      ciudadOrigenRegreso,
      paisOrigenRegreso,
      aeropuertoOrigenRegreso,
      ciudadDestinoRegreso,
      paisDestinoRegreso,
      aeropuertoDestinoRegreso,
      tieneConexionRegreso,
      aeropuertoConexionRegreso,
      ciudadConexionRegreso,
      paisConexionRegreso,
      horasEscalaRegreso,
      escalaMayor24hRegreso
    },
    setters: {
      setTitulo,
      setTipo,
      setTipoTrayecto,
      setTramo,
      setFechaInicio,
      setFechaFin,
      setUbicacion,
      setCosto,
      setMoneda,
      setTarjetaCredito,
      setDescontarPresupuesto,
      setPagadoAdelantado,
      setNotas,
      setCiudadOrigen,
      setPaisOrigen,
      setAeropuertoOrigen,
      setCiudadDestino,
      setPaisDestino,
      setAeropuertoDestino,
      setTieneConexion,
      setAeropuertoConexion,
      setCiudadConexion,
      setPaisConexion,
      setHorasEscala,
      setEscalaMayor24h,
      setFechaInicioRegreso,
      setFechaFinRegreso,
      setCiudadOrigenRegreso,
      setPaisOrigenRegreso,
      setAeropuertoOrigenRegreso,
      setCiudadDestinoRegreso,
      setPaisDestinoRegreso,
      setAeropuertoDestinoRegreso,
      setTieneConexionRegreso,
      setAeropuertoConexionRegreso,
      setCiudadConexionRegreso,
      setPaisConexionRegreso,
      setHorasEscalaRegreso,
      setEscalaMayor24hRegreso
    },
    handlers: {
      handleTipoChange,
      handleOutboundOriginChange,
      handleOutboundDestChange,
      handleSwapReturnLocations,
      handleHorasEscalaChange,
      handleSubmit
    }
  };
}

export default useEventoForm;

