import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resolveEventCountry, resolveEventCity } from '../../../utils/itinerarioGrouping';
import { enrichGastoWithLocation, getGastoAmounts } from '../../../utils/balance';
import { cleanCountryText, fixAccents } from '../../../utils/countries';
import { formatCurrencyDisplay, convertCurrency } from '../../../utils/currencies';
import { cleanMetaText } from '../../../utils/meta';

/**
 * Calcula la duración legible entre dos fechas
 */
export function formatDurationDetailed(fechaInicio, fechaFin, horasEscala = null) {
  if (!fechaInicio) return '-';
  const start = new Date(fechaInicio);
  const end = fechaFin ? new Date(fechaFin) : null;
  if (isNaN(start.getTime())) return '-';

  const parts = [];
  if (end && !isNaN(end.getTime()) && end > start) {
    const diffMs = end.getTime() - start.getTime();
    const totalMins = Math.round(diffMs / (1000 * 60));
    const days = Math.floor(totalMins / (60 * 24));
    const hours = Math.floor((totalMins % (60 * 24)) / 60);
    const mins = totalMins % 60;

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 && days === 0) parts.push(`${mins}m`);
  }

  if (horasEscala && Number(horasEscala) > 0) {
    parts.push(`(Escala: ${horasEscala}h)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'Puntual';
}

/**
 * Formatea la hora de inicio y fin de un registro
 */
export function formatTimeRange(fechaInicio, fechaFin, isDateOnly = false) {
  if (!fechaInicio) return '--:--';
  const start = new Date(fechaInicio);
  if (isNaN(start.getTime())) return '--:--';

  const startStr = start.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (isDateOnly && startStr === '12:00') {
    return 'En el día';
  }

  if (!fechaFin) return startStr;
  const end = new Date(fechaFin);
  if (isNaN(end.getTime()) || end <= start) return startStr;

  const endStr = end.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const sameDay = start.toISOString().split('T')[0] === end.toISOString().split('T')[0];
  if (!sameDay) {
    const diffDays = Math.max(
      1,
      Math.round(
        (new Date(end.toISOString().split('T')[0]) - new Date(start.toISOString().split('T')[0])) /
          (1000 * 60 * 60 * 24)
      )
    );
    return `${startStr} ➔ ${endStr} (+${diffDays}d)`;
  }

  return startStr === endStr ? startStr : `${startStr} ➔ ${endStr}`;
}

/**
 * Convierte una fecha ISO o Date en fecha local a medianoche sin desplazamiento de zona horaria
 * cuando viene en formato YYYY-MM-DD o medianoche UTC (T00:00:00).
 */
export function toSafeLocalDateOnly(input) {
  if (!input) return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.\d+)?Z?)?$/);
    if (isoDateMatch) {
      return new Date(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]));
    }
  }
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calcula el rango efectivo del viaje:
 * - Día 1: Fecha en que inicia el viaje (`viaje.fechaInicio`).
 * - Día Final: Fecha de llegada al país nuevamente (el mayor entre `viaje.fechaFin` y la llegada del último vuelo/evento del itinerario).
 */
export function getEffectiveTripDateRange(viaje, eventos = []) {
  const startDate = toSafeLocalDateOnly(viaje?.fechaInicio);
  let endDate = toSafeLocalDateOnly(viaje?.fechaFin);

  if (Array.isArray(eventos) && eventos.length > 0) {
    eventos.forEach((ev) => {
      const candidateRaw = ev?.fechaFin || ev?.fechaInicio;
      const candidate = toSafeLocalDateOnly(candidateRaw);
      if (candidate && (!endDate || candidate > endDate)) {
        endDate = candidate;
      }
    });
  }

  if (startDate && endDate && endDate < startDate) {
    endDate = new Date(startDate.getTime());
  }

  return { startDate, endDate };
}

/**
 * Construye la lista cronológica maestra unificando Eventos del Itinerario y Gastos
 * con todos los campos detallados: día, hora, duración, lugar/ruta, ciudad, país,
 * personas, tarjeta, montos originales, total TC y valor por persona.
 */
export function buildChronologicalMasterList({
  viaje,
  eventos = [],
  gastos = [],
  onlyTripDaysAndItinerary = false
}) {
  const safeEventos = Array.isArray(eventos) ? eventos : [];
  const safeGastos = Array.isArray(gastos) ? gastos : [];

  const { startDate: tripStartDate, endDate: tripEndBase } = getEffectiveTripDateRange(viaje, safeEventos);
  const tripEndDate = tripEndBase
    ? new Date(tripEndBase.getFullYear(), tripEndBase.getMonth(), tripEndBase.getDate(), 23, 59, 59, 999)
    : null;

  // Mapa de gastos vinculados a un eventoId
  const gastoByEventoId = new Map();
  safeGastos.forEach((g) => {
    if (g.eventoId) {
      gastoByEventoId.set(g.eventoId, g);
    }
  });

  const unifiedItems = [];

  const computeDayLabel = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return { dayNumber: null, dayLabel: 'Sin fecha' };
    if (!tripStartDate) return { dayNumber: 1, dayLabel: 'Día 1' };
    const dCopy = new Date(dateObj);
    dCopy.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dCopy - tripStartDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return {
        dayNumber: diffDays,
        dayLabel: `Pre-Viaje (${Math.abs(diffDays)}d antes)`
      };
    }
    return {
      dayNumber: diffDays + 1,
      dayLabel: `Día ${diffDays + 1}`
    };
  };

  // 1. Procesar todos los eventos del itinerario (vuelos, hoteles, transporte, tours, comida, impuestos, etc.)
  safeEventos.forEach((ev) => {
    const linkedGasto = gastoByEventoId.get(ev.id) || ev.gastoAsociado || null;
    const countryInfo = resolveEventCountry(ev, viaje);
    const cityName = resolveEventCity(ev, countryInfo.countryName, viaje);

    const startDate = ev.fechaInicio ? new Date(ev.fechaInicio) : null;
    const endDate = ev.fechaFin ? new Date(ev.fechaFin) : null;
    const dateKey = startDate && !isNaN(startDate.getTime())
      ? startDate.toISOString().split('T')[0]
      : 'sin-fecha';

    const { dayNumber, dayLabel } = computeDayLabel(startDate);

    const tipo = (ev.tipo || 'otro').toLowerCase();
    const categoria = linkedGasto?.categoria
      ? linkedGasto.categoria.toLowerCase()
      : tipo === 'hotel'
      ? 'alojamiento'
      : tipo === 'vuelo' || tipo === 'transporte'
      ? 'transporte'
      : tipo === 'comida'
      ? 'comida'
      : tipo === 'impuestos' || tipo === 'permisos'
      ? 'impuestos'
      : 'actividades';

    // Construir lugar / ruta detallada
    let lugarDetalle = cleanMetaText(ev.ubicacion || '');
    let rutaAerea = '';
    let escalaInfo = '';

    if (tipo === 'vuelo' || tipo === 'transporte') {
      const orig = ev.aeropuertoOrigen
        ? `${ev.ciudadOrigen ? `${cleanCountryText(ev.ciudadOrigen)} (${ev.aeropuertoOrigen})` : ev.aeropuertoOrigen}`
        : cleanCountryText(ev.ciudadOrigen || ev.paisOrigen || 'Origen');
      const dest = ev.aeropuertoDestino
        ? `${ev.ciudadDestino ? `${cleanCountryText(ev.ciudadDestino)} (${ev.aeropuertoDestino})` : ev.aeropuertoDestino}`
        : cleanCountryText(ev.ciudadDestino || ev.paisDestino || 'Destino');

      if (ev.tieneConexion && (ev.aeropuertoConexion || ev.ciudadConexion)) {
        const esc = ev.aeropuertoConexion || cleanCountryText(ev.ciudadConexion);
        rutaAerea = `${orig} ➔ ${esc} ➔ ${dest}`;
        escalaInfo = `Escala en ${esc}${ev.horasEscala ? ` (${ev.horasEscala}h)` : ''}`;
      } else {
        rutaAerea = `${orig} ➔ ${dest}`;
      }
      if (!lugarDetalle) lugarDetalle = rutaAerea;
    }

    if (!lugarDetalle) {
      lugarDetalle = cityName
        ? `${cityName}${countryInfo.countryName ? `, ${cleanCountryText(countryInfo.countryName)}` : ''}`
        : cleanCountryText(countryInfo.countryName || 'Destino');
    }

    // Montos y personas unificados usando getGastoAmounts (Single Source of Truth)
    const paxCount = Math.max(
      1,
      Math.round(Number(linkedGasto?.cantidadPersonas || ev.cantidadPersonas) || 1)
    );
    const monedaOrig = (
      linkedGasto?.monedaOriginal ||
      ev.moneda ||
      viaje?.monedaBase ||
      'COP'
    ).toUpperCase();

    const rawCostoTotal =
      Number(linkedGasto?.costoTotal ?? linkedGasto?.montoOriginal ?? ev.costoTotal ?? ev.costo) || 0;

    const noComputar =
      linkedGasto?.noComputar !== undefined
        ? Boolean(linkedGasto.noComputar)
        : ev.descontarPresupuesto !== undefined
        ? !Boolean(ev.descontarPresupuesto)
        : false;

    const pagadoAdelantado =
      linkedGasto?.pagadoAdelantado !== undefined
        ? Boolean(linkedGasto.pagadoAdelantado)
        : Boolean(ev.pagadoAdelantado);

    const rawTotalCOP =
      Number(linkedGasto?.montoTotalCOP ?? linkedGasto?.montoCOP) ||
      (rawCostoTotal > 0 ? convertCurrency(rawCostoTotal, monedaOrig, 'COP') : 0);
    const rawTotalUSD =
      Number(linkedGasto?.montoTotalUSD ?? linkedGasto?.montoUSD) ||
      (rawCostoTotal > 0 ? convertCurrency(rawCostoTotal, monedaOrig, 'USD') : 0);

    const amounts = getGastoAmounts({
      tipo,
      categoria,
      cantidadPersonas: paxCount,
      computarSoloMiParte: true,
      noComputar,
      costoTotal: rawCostoTotal,
      montoOriginal: rawCostoTotal,
      montoTotalCOP: rawTotalCOP,
      montoCOP: rawTotalCOP,
      montoTotalUSD: rawTotalUSD,
      montoUSD: rawTotalUSD
    });

    const rawCostoPorPersona = amounts.montoPorPersonaOrig;
    const montoTotalCOP = amounts.montoTotalCOP;
    const montoPorPersonaCOP = amounts.montoPorPersonaCOP;
    const montoComputableCOP = amounts.montoComputableCOP;
    const montoTotalUSD = amounts.montoTotalUSD;
    const montoPorPersonaUSD = amounts.montoPorPersonaUSD;

    const tarjetaCredito =
      linkedGasto?.tarjetaCredito || ev.tarjetaCredito || '';

    unifiedItems.push({
      id: `item-ev-${ev.id}`,
      rawEvento: ev,
      rawGasto: linkedGasto,
      sourceType: rawCostoTotal > 0 ? 'evento_con_gasto' : 'evento',
      timestamp: startDate && !isNaN(startDate.getTime()) ? startDate.getTime() : 0,
      dateKey,
      fechaInicio: ev.fechaInicio,
      fechaFin: ev.fechaFin || null,
      dayNumber,
      dayLabel,
      fechaDisplay: startDate && !isNaN(startDate.getTime())
        ? startDate.toLocaleDateString('es-CO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        : '-',
      fechaFinDisplay:
        endDate && !isNaN(endDate.getTime()) && endDate.toISOString().split('T')[0] !== dateKey
          ? endDate.toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : null,
      horaDisplay: formatTimeRange(ev.fechaInicio, ev.fechaFin, false),
      duracionDisplay: formatDurationDetailed(ev.fechaInicio, ev.fechaFin, ev.horasEscala),
      titulo: fixAccents(cleanMetaText(ev.titulo || 'Actividad')),
      tipo,
      categoria,
      tramo: ev.tramo || null,
      tipoTrayecto: ev.tipoTrayecto || null,
      countryName: cleanCountryText(countryInfo.countryName || 'Destino'),
      countryCode: countryInfo.countryCode || '',
      flag: countryInfo.flag || '🌍',
      cityName: cleanCountryText(cityName || ev.ciudadDestino || ev.ciudadOrigen || '-'),
      lugarDetalle: fixAccents(lugarDetalle),
      rutaAerea,
      escalaInfo,
      cantidadPersonas: paxCount,
      tarjetaCredito,
      monedaOriginal: monedaOrig,
      montoOriginalTotal: rawCostoTotal,
      montoOriginalPorPersona: rawCostoPorPersona,
      tasaCambio: linkedGasto?.tasaCambioFecha || null,
      montoTotalCOP,
      montoPorPersonaCOP,
      montoComputableCOP,
      montoTotalUSD,
      montoPorPersonaUSD,
      pagadoAdelantado,
      noComputar,
      esIngreso: false,
      notas: fixAccents(cleanMetaText(ev.notas || ''))
    });
  });

  // 2. Procesar gastos sueltos de Billetera que NO están vinculados a un evento del itinerario
  safeGastos.forEach((g) => {
    if (g.eventoId && safeEventos.some((e) => e.id === g.eventoId)) {
      return; // Ya fue incluido y enriquecido junto a su evento
    }

    const enriched = enrichGastoWithLocation(g, safeEventos, viaje);
    const amounts = getGastoAmounts(g);
    const gDate = g.fechaGasto ? new Date(g.fechaGasto) : null;

    // En el reporte cronológico solo se incluyen registros asociados a días del viaje o al itinerario
    if (onlyTripDaysAndItinerary && tripStartDate && tripEndDate) {
      if (!gDate || isNaN(gDate.getTime()) || gDate < tripStartDate || gDate > tripEndDate) {
        return;
      }
    }

    const dateKey = gDate && !isNaN(gDate.getTime())
      ? gDate.toISOString().split('T')[0]
      : 'sin-fecha';

    const { dayNumber, dayLabel } = computeDayLabel(gDate);

    unifiedItems.push({
      id: `item-g-${g.id}`,
      rawEvento: null,
      rawGasto: g,
      sourceType: 'gasto_billetera',
      timestamp: gDate && !isNaN(gDate.getTime()) ? gDate.getTime() : 0,
      dateKey,
      fechaInicio: g.fechaGasto,
      fechaFin: null,
      dayNumber,
      dayLabel,
      fechaDisplay: gDate && !isNaN(gDate.getTime())
        ? gDate.toLocaleDateString('es-CO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        : '-',
      fechaFinDisplay: null,
      horaDisplay: formatTimeRange(g.fechaGasto, null, true),
      duracionDisplay: 'Transacción',
      titulo: fixAccents(cleanMetaText(g.concepto || 'Gasto')),
      tipo: (g.categoria || 'otros').toLowerCase(),
      categoria: (g.categoria || 'otros').toLowerCase(),
      tramo: null,
      tipoTrayecto: null,
      countryName: cleanCountryText(enriched.countryName || 'Destino'),
      countryCode: enriched.countryCode || '',
      flag: enriched.flag || '🌍',
      cityName: cleanCountryText(enriched.cityName || '-'),
      lugarDetalle: enriched.cityName
        ? `${cleanCountryText(enriched.cityName)}, ${cleanCountryText(enriched.countryName)}`
        : cleanCountryText(enriched.countryName || 'En Ruta'),
      rutaAerea: '',
      escalaInfo: '',
      cantidadPersonas: amounts.cantidadPersonas,
      tarjetaCredito: g.tarjetaCredito || '',
      monedaOriginal: (g.monedaOriginal || 'COP').toUpperCase(),
      montoOriginalTotal: amounts.montoTotalOrig,
      montoOriginalPorPersona: amounts.montoPorPersonaOrig,
      tasaCambio: g.tasaCambioFecha || null,
      montoTotalCOP: amounts.montoTotalCOP,
      montoPorPersonaCOP: amounts.montoPorPersonaCOP,
      montoComputableCOP: g.noComputar ? 0 : amounts.montoComputableCOP,
      montoTotalUSD: amounts.montoTotalUSD,
      montoPorPersonaUSD: amounts.montoPorPersonaUSD,
      pagadoAdelantado: Boolean(g.pagadoAdelantado),
      noComputar: Boolean(g.noComputar),
      esIngreso: Boolean(g.esIngreso),
      notas: g.esIngreso
        ? 'Reembolso / Tax-Free'
        : g.noComputar
        ? 'Gasto de terceros / Fuera de presupuesto'
        : g.pagadoAdelantado
        ? 'Pagado por adelantado (Pre-Viaje)'
        : ''
    });
  });

  // Ordenar cronológicamente
  unifiedItems.sort((a, b) => a.timestamp - b.timestamp);
  return unifiedItems;
}

/**
 * Exporta el Cronograma Maestro Detallado a PDF (Formato Horizontal A4 para máxima riqueza de columnas)
 */
export function exportCronogramaPdf({ viaje, items = [], summary, filterSummaryText = '' }) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Cabecera ejecutiva
  doc.setFillColor(14, 18, 27);
  doc.rect(0, 0, 297, 32, 'F');

  doc.setTextColor(0, 255, 133);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `REPORTE CRONOLÓGICO DETALLADO • ${(viaje?.titulo || 'MI VIAJE').toUpperCase()}`,
    14,
    13
  );

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Ruta / Destino: ${cleanCountryText(viaje?.destino || '')}   |   Registros: ${items.length}   |   Generado: ${new Date().toLocaleString('es-CO')}`,
    14,
    20
  );

  doc.setTextColor(0, 229, 255);
  doc.setFontSize(8);
  doc.text(
    `EN PRESUPUESTO -> Por Persona (1p): $ ${Math.round(summary.enPresupuestoPorPersonaCOP || 0).toLocaleString('es-CO')} COP  |  Total TC En Ppto: $ ${Math.round(summary.enPresupuestoTotalCOP || 0).toLocaleString('es-CO')} COP   ||   FUERA DE PPTO (Tiquetes): $ ${Math.round(summary.fueraPresupuestoTotalCOP || 0).toLocaleString('es-CO')} COP   ||   GRAN TOTAL: $ ${Math.round(summary.totalDesembolsadoCOP || 0).toLocaleString('es-CO')} COP`,
    14,
    27
  );

  const tableRows = items.map((it, idx) => [
    idx + 1,
    `${it.dayLabel}\n${it.fechaDisplay}${it.fechaFinDisplay ? `\nal ${it.fechaFinDisplay}` : ''}`,
    `${it.horaDisplay}\n(${it.duracionDisplay})`,
    it.countryName || '-',
    it.cityName || '-',
    it.rutaAerea ? `${it.rutaAerea}${it.escalaInfo ? `\n${it.escalaInfo}` : ''}` : it.lugarDetalle || '-',
    `${it.titulo}${it.notas ? `\n[${it.notas}]` : ''}`,
    it.categoria.toUpperCase(),
    it.noComputar ? 'NO (Fuera Ppto)' : 'SÍ (En Ppto)',
    `${it.cantidadPersonas}p`,
    it.tarjetaCredito || (it.montoOriginalTotal > 0 ? 'Efectivo' : '-'),
    it.montoOriginalTotal > 0
      ? formatCurrencyDisplay(it.montoOriginalTotal, it.monedaOriginal, false)
      : '-',
    it.montoTotalCOP > 0 ? `$ ${Math.round(it.montoTotalCOP).toLocaleString('es-CO')}` : '-',
    it.montoPorPersonaCOP > 0 ? `$ ${Math.round(it.montoPorPersonaCOP).toLocaleString('es-CO')}` : '-'
  ]);

  autoTable(doc, {
    startY: 36,
    head: [
      [
        '#',
        'Día / Fecha',
        'Hora / Tiempo',
        'País',
        'Ciudad',
        'Lugar / Ruta',
        'Actividad / Concepto',
        'Categoría',
        'Presupuesto',
        'Pers.',
        'TC / Medio',
        'Valor Orig.',
        'Total TC (COP)',
        'Por Persona (COP)'
      ]
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [0, 255, 133],
      fontSize: 7,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 6.5,
      cellPadding: 1.8,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 18 },
      4: { cellWidth: 16 },
      5: { cellWidth: 32 },
      6: { cellWidth: 38 },
      7: { cellWidth: 16 },
      8: { cellWidth: 18, halign: 'center' },
      9: { cellWidth: 9, halign: 'center' },
      10: { cellWidth: 18 },
      11: { cellWidth: 17, halign: 'right' },
      12: { cellWidth: 19, halign: 'right' },
      13: { cellWidth: 19, halign: 'right' }
    }
  });

  const safeName = (viaje?.titulo || 'Viaje').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Cronograma_Detallado_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Exporta el Cronograma Maestro Detallado a Excel (.xlsx) con dos hojas:
 * 1. Cronograma Detallado (todas las columnas cronológicas)
 * 2. Resumen Día por Día
 */
export async function exportCronogramaExcel({ viaje, items = [], summary, dayGroups = [], filterSummaryText = '' }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bitácora de Viajes';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('⏱️ Cronograma Detallado', {
    views: [{ state: 'frozen', ySplit: 3, showGridLines: true }]
  });

  ws.mergeCells('A1:R1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `✈️ CRONOGRAMA Y REPORTE MAESTRO DETALLADO — ${(viaje?.titulo || 'MI VIAJE').toUpperCase()}`;
  titleCell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FF00FF85' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 30;

  ws.mergeCells('A2:R2');
  const subCell = ws.getCell('A2');
  subCell.value = `EN PRESUPUESTO (Por Persona 1p): $${Math.round(summary.enPresupuestoPorPersonaCOP || 0).toLocaleString('es-CO')} COP  |  EN PRESUPUESTO (Total TC): $${Math.round(summary.enPresupuestoTotalCOP || 0).toLocaleString('es-CO')} COP  |  FUERA DE PRESUPUESTO (Tiquetes): $${Math.round(summary.fueraPresupuestoTotalCOP || 0).toLocaleString('es-CO')} COP  |  GRAN TOTAL: $${Math.round(summary.totalDesembolsadoCOP || 0).toLocaleString('es-CO')} COP`;
  subCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FFCBD5E1' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 22;

  const headers = [
    '#',
    'DÍA DEL VIAJE',
    'FECHA INICIO',
    'FECHA FIN',
    'HORA / RANGO',
    'DURACIÓN / TIEMPO',
    'PAÍS',
    'CIUDAD',
    'LUGAR / RUTA / ESCALA',
    'CONCEPTO / ACTIVIDAD',
    'CATEGORÍA / TIPO',
    '¿EN PRESUPUESTO?',
    'PERSONAS',
    'TARJETA (TC) / MEDIO',
    'MONTO ORIGINAL',
    'DIVISA',
    'TOTAL GASTADO TC (COP)',
    'VALOR POR PERSONA (COP)'
  ];

  const headRow = ws.addRow(headers);
  headRow.height = 24;
  headRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFF8FAFC' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  items.forEach((it, idx) => {
    const row = ws.addRow([
      idx + 1,
      it.dayLabel,
      it.fechaDisplay,
      it.fechaFinDisplay || it.fechaDisplay,
      it.horaDisplay,
      it.duracionDisplay,
      it.countryName,
      it.cityName,
      it.rutaAerea ? `${it.rutaAerea}${it.escalaInfo ? ` (${it.escalaInfo})` : ''}` : it.lugarDetalle,
      it.titulo + (it.notas ? ` — ${it.notas}` : ''),
      it.categoria.toUpperCase(),
      it.noComputar ? 'NO (Fuera de Presupuesto)' : 'SÍ (Incluido en Presupuesto)',
      it.cantidadPersonas,
      it.tarjetaCredito || (it.montoOriginalTotal > 0 ? 'Efectivo / Sin TC' : '-'),
      it.montoOriginalTotal || 0,
      it.monedaOriginal || 'COP',
      Math.round(it.montoTotalCOP || 0),
      Math.round(it.montoPorPersonaCOP || 0)
    ]);

    row.height = 20;
    row.getCell(15).numFmt = '#,##0.00';
    row.getCell(17).numFmt = '$#,##0';
    row.getCell(18).numFmt = '$#,##0';
  });

  // Filas de subtotales discriminados (En Presupuesto vs Fuera de Presupuesto vs Gran Total)
  const addSummaryRow = (label, desc, totalTC, totalPorPersona, colorArgb) => {
    const r = ws.addRow([
      '',
      label,
      desc,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      label,
      Math.round(totalTC || 0),
      Math.round(totalPorPersona || 0)
    ]);
    r.height = 23;
    r.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: colorArgb } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    });
    r.getCell(17).numFmt = '$#,##0';
    r.getCell(18).numFmt = '$#,##0';
  };

  addSummaryRow(
    '✅ EN PRESUPUESTO',
    'Vuelos internos, hoteles, actividades y permisos incluidos',
    summary.enPresupuestoTotalCOP,
    summary.enPresupuestoPorPersonaCOP,
    'FF00FF85'
  );

  if (summary.fueraPresupuestoTotalCOP > 0) {
    addSummaryRow(
      '🚫 FUERA DE PPTO',
      'Tiquetes de salida/llegada excluidos del presupuesto',
      summary.fueraPresupuestoTotalCOP,
      summary.fueraPresupuestoPorPersonaCOP,
      'FFFF2E55'
    );
  }

  addSummaryRow(
    '📊 GRAN TOTAL',
    `${items.length} registros totales (Incluido + Fuera de Presupuesto)`,
    summary.totalDesembolsadoCOP,
    summary.totalPorPersonaCOP,
    'FF38BDF8'
  );

  ws.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: 18 }
  };

  const colWidths = [6, 16, 18, 16, 18, 18, 18, 18, 32, 38, 18, 26, 12, 22, 16, 10, 22, 22];
  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // Hoja 2: Resumen Día por Día
  if (Array.isArray(dayGroups) && dayGroups.length > 0) {
    const wsDays = workbook.addWorksheet('📅 Resumen por Día');
    const dayHead = wsDays.addRow([
      'DÍA',
      'FECHA',
      'PAÍSES',
      'CIUDADES',
      'CANT. ACTIVIDADES / GASTOS',
      'TOTAL GASTADO TC (COP)',
      'VALOR POR PERSONA (COP)'
    ]);
    dayHead.height = 24;
    dayHead.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFF8FAFC' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    });

    dayGroups.forEach((dg) => {
      const r = wsDays.addRow([
        dg.dayLabel,
        dg.fechaDisplay,
        dg.countries.join(', '),
        dg.cities.join(', '),
        dg.items.length,
        Math.round(dg.totalDesembolsadoCOP),
        Math.round(dg.totalPorPersonaCOP)
      ]);
      r.getCell(6).numFmt = '$#,##0';
      r.getCell(7).numFmt = '$#,##0';
    });

    [18, 22, 26, 28, 24, 24, 24].forEach((w, i) => {
      wsDays.getColumn(i + 1).width = w;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (viaje?.titulo || 'Viaje').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `Cronograma_Detallado_${safeName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

