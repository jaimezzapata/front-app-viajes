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
    pagadoAdelantado: evento.pagadoAdelantado !== undefined ? Boolean(evento.pagadoAdelantado) : (meta.pagadoAdelantado !== undefined ? Boolean(meta.pagadoAdelantado) : false)
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
    destinosMultidestino: viaje.destinosMultidestino || meta.destinosMultidestino || []
  };
}
