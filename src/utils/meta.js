/**
 * Utilidades para sanitizar texto y deserializar metadata oculta de eventos y viajes
 */

export function cleanMetaText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\n?<!--META:.*?:META-->/g, '').trim();
}

export function parseEventoMeta(evento) {
  if (!evento) return evento;
  let notas = evento.notas || '';
  let meta = {};

  if (typeof notas === 'string' && notas.includes('<!--META:')) {
    const match = notas.match(/<!--META:(.*?):META-->/);
    if (match) {
      try {
        meta = JSON.parse(match[1]);
      } catch {}
    }
  }

  const cleanNotas = cleanMetaText(notas);

  const rawPax = evento.cantidadPersonas !== undefined
    ? Number(evento.cantidadPersonas)
    : (meta.cantidadPersonas !== undefined ? Number(meta.cantidadPersonas) : 1);
  const cantidadPersonas = !isNaN(rawPax) && rawPax >= 1 ? Math.round(rawPax) : 1;

  const modoCostoPersonas = evento.modoCostoPersonas || meta.modoCostoPersonas || 'total';
  const computarSoloMiParte = evento.computarSoloMiParte !== undefined
    ? Boolean(evento.computarSoloMiParte)
    : (meta.computarSoloMiParte !== undefined ? Boolean(meta.computarSoloMiParte) : true);

  const rawCosto = Number(evento.costo) || 0;
  const costoTotal = evento.costoTotal !== undefined && Number(evento.costoTotal) > 0
    ? Number(evento.costoTotal)
    : (meta.costoTotal !== undefined && Number(meta.costoTotal) > 0
      ? Number(meta.costoTotal)
      : rawCosto);

  const costoPorPersona = evento.costoPorPersona !== undefined && Number(evento.costoPorPersona) > 0
    ? Number(evento.costoPorPersona)
    : (meta.costoPorPersona !== undefined && Number(meta.costoPorPersona) > 0
      ? Number(meta.costoPorPersona)
      : (cantidadPersonas > 1 ? Number((costoTotal / cantidadPersonas).toFixed(2)) : costoTotal));

  return {
    ...evento,
    titulo: cleanMetaText(evento.titulo),
    notas: cleanNotas || null,
    horasEscala: evento.horasEscala !== undefined ? evento.horasEscala : (meta.horasEscala !== undefined ? meta.horasEscala : null),
    escalaMayor24h: evento.escalaMayor24h !== undefined ? Boolean(evento.escalaMayor24h) : Boolean(meta.escalaMayor24h),
    tipoTrayecto: evento.tipoTrayecto || meta.tipoTrayecto || (evento.tipo === 'vuelo' ? 'one-way' : null),
    tramo: evento.tramo || meta.tramo || null,
    roundTripGroupId: evento.roundTripGroupId || meta.roundTripGroupId || null,
    descontarPresupuesto: evento.descontarPresupuesto !== undefined ? Boolean(evento.descontarPresupuesto) : (meta.descontarPresupuesto !== undefined ? Boolean(meta.descontarPresupuesto) : true),
    pagadoAdelantado: evento.pagadoAdelantado !== undefined ? Boolean(evento.pagadoAdelantado) : (meta.pagadoAdelantado !== undefined ? Boolean(meta.pagadoAdelantado) : false),
    tarjetaCredito: evento.tarjetaCredito !== undefined ? evento.tarjetaCredito : (meta.tarjetaCredito || null),
    cantidadPersonas,
    modoCostoPersonas,
    computarSoloMiParte,
    costoTotal,
    costoPorPersona
  };
}

export function parseGastoMeta(gasto) {
  if (!gasto) return gasto;
  let concepto = gasto.concepto || '';
  let meta = {};

  if (typeof concepto === 'string' && concepto.includes('<!--META:')) {
    const match = concepto.match(/<!--META:(.*?):META-->/);
    if (match) {
      try {
        meta = JSON.parse(match[1]);
      } catch {}
    }
  }

  const cleanConcepto = cleanMetaText(concepto);
  const rawPax = gasto.cantidadPersonas !== undefined
    ? Number(gasto.cantidadPersonas)
    : (meta.cantidadPersonas !== undefined ? Number(meta.cantidadPersonas) : 1);
  const cantidadPersonas = !isNaN(rawPax) && rawPax >= 1 ? Math.round(rawPax) : 1;

  const modoCostoPersonas = gasto.modoCostoPersonas || meta.modoCostoPersonas || 'total';
  const computarSoloMiParte = gasto.computarSoloMiParte !== undefined
    ? Boolean(gasto.computarSoloMiParte)
    : (meta.computarSoloMiParte !== undefined ? Boolean(meta.computarSoloMiParte) : true);

  const rawMontoOrig = Number(gasto.montoOriginal) || 0;
  const costoTotal = gasto.costoTotal !== undefined && Number(gasto.costoTotal) > 0
    ? Number(gasto.costoTotal)
    : (meta.costoTotal !== undefined && Number(meta.costoTotal) > 0
      ? Number(meta.costoTotal)
      : rawMontoOrig);

  const costoPorPersona = gasto.costoPorPersona !== undefined && Number(gasto.costoPorPersona) > 0
    ? Number(gasto.costoPorPersona)
    : (meta.costoPorPersona !== undefined && Number(meta.costoPorPersona) > 0
      ? Number(meta.costoPorPersona)
      : (cantidadPersonas > 1 ? Number((costoTotal / cantidadPersonas).toFixed(2)) : costoTotal));

  return {
    ...gasto,
    concepto: cleanConcepto,
    tarjetaCredito: gasto.tarjetaCredito !== undefined ? gasto.tarjetaCredito : (meta.tarjetaCredito || null),
    cantidadPersonas,
    modoCostoPersonas,
    computarSoloMiParte,
    costoTotal,
    costoPorPersona
  };
}

export function parseViajeMeta(viaje) {
  if (!viaje) return viaje;
  let descripcion = viaje.descripcion || '';
  let meta = {};

  if (typeof descripcion === 'string' && descripcion.includes('<!--META:')) {
    const match = descripcion.match(/<!--META:(.*?):META-->/);
    if (match) {
      try {
        meta = JSON.parse(match[1]);
      } catch {}
    }
  }

  return {
    ...viaje,
    titulo: cleanMetaText(viaje.titulo),
    descripcion: cleanMetaText(descripcion) || null,
    origen: viaje.origen || meta.origen || null,
    escalas: viaje.escalas || meta.escalas || null,
    tipoViaje: viaje.tipoViaje || meta.tipoViaje || 'unico',
    destinosMultidestino: viaje.destinosMultidestino || meta.destinosMultidestino || [],
    ...(viaje.categoriasPresupuesto || meta.categoriasPresupuesto
      ? { categoriasPresupuesto: viaje.categoriasPresupuesto || meta.categoriasPresupuesto }
      : {})
  };
}
