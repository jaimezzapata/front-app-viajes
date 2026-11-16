import { resolveEventCountry, resolveEventCity } from './itinerarioGrouping';
import { detectCountry, cleanCountryText, getCountryFlag } from './countries';
import { findAirport } from './airportsData';

/**
 * Enriquece un gasto con país y ciudad basándose en el evento vinculado,
 * el viaje activo, o el concepto/fecha del gasto.
 */
export function enrichGastoWithLocation(gasto, eventos = [], viaje = null) {
  if (!gasto) return gasto;

  let countryName = '';
  let countryCode = '';
  let flag = '';
  let cityName = '';

  // 1. Si está vinculado a un evento del itinerario
  if (gasto.eventoId && Array.isArray(eventos)) {
    const ev = eventos.find(e => e.id === gasto.eventoId);
    if (ev) {
      const c = resolveEventCountry(ev, viaje);
      countryName = c.countryName;
      countryCode = c.countryCode;
      flag = c.flag;
      cityName = resolveEventCity(ev, countryName, viaje);
    }
  }

  // 2. Si el gasto ya contiene campos directos
  if (!countryName && (gasto.paisDestino || gasto.pais)) {
    const c = detectCountry(gasto.paisDestino || gasto.pais);
    if (c) {
      countryName = c.es;
      countryCode = c.code;
      flag = c.flag;
    }
  }
  if (!cityName && (gasto.ciudadDestino || gasto.ciudad)) {
    cityName = cleanCountryText(gasto.ciudadDestino || gasto.ciudad);
  }

  // 3. Detección en el concepto del gasto
  if ((!countryName || !cityName) && gasto.concepto) {
    if (!countryName) {
      const c = detectCountry(gasto.concepto);
      if (c) {
        countryName = c.es;
        countryCode = c.code;
        flag = c.flag;
      }
    }

    if (!cityName) {
      const airportMatch = findAirport(gasto.concepto);
      if (airportMatch) {
        cityName = airportMatch.city;
        if (!countryName && airportMatch.country) {
          countryName = airportMatch.country;
          countryCode = airportMatch.countryCode;
          flag = getCountryFlag(countryCode);
        }
      } else if (viaje && Array.isArray(viaje.destinosMultidestino)) {
        for (const d of viaje.destinosMultidestino) {
          if (d.ciudad && gasto.concepto.toLowerCase().includes(d.ciudad.toLowerCase())) {
            cityName = d.ciudad;
            break;
          }
        }
      }
    }
  }

  // 4. Inferencia por fecha: si coincide con la fecha de un evento del itinerario
  if ((!countryName || !cityName) && gasto.fechaGasto && Array.isArray(eventos) && eventos.length > 0) {
    const gDateStr = gasto.fechaGasto.split('T')[0];
    const sameDayEv = eventos.find(e => {
      const eDate = (e.fechaInicio || e.fecha || '').split('T')[0];
      return eDate === gDateStr;
    });
    if (sameDayEv) {
      if (!countryName) {
        const c = resolveEventCountry(sameDayEv, viaje);
        countryName = c.countryName;
        countryCode = c.countryCode;
        flag = c.flag;
      }
      if (!cityName) {
        cityName = resolveEventCity(sameDayEv, countryName, viaje);
      }
    }
  }

  // 5. Fallback al destino principal del viaje
  if (!countryName && viaje?.destino) {
    const c = detectCountry(viaje.destino);
    if (c) {
      countryName = c.es;
      countryCode = c.code;
      flag = c.flag;
    } else {
      countryName = cleanCountryText(viaje.destino);
      flag = getCountryFlag(countryName);
    }
  }

  return {
    ...gasto,
    countryName: countryName || 'Destino',
    countryCode: countryCode || '',
    flag: flag || (countryCode ? getCountryFlag(countryCode) : '🌍'),
    cityName: cityName || ''
  };
}

/**
 * Módulo Centralizado de Cálculos Financieros y Presupuesto (Single Source of Truth)
 * 
 * Unifica las reglas de negocio contables para toda la aplicación:
 * - noComputar: Excluye compras de terceros o vuelos/actividades desmarcadas del presupuesto.
 * - esIngreso: Resta reembolsos o tax-free del total gastado.
 * - pagadoAdelantado: Contabiliza costos hundidos pre-viaje sin alterar el saldo en ruta.
 * - Distribución y semáforos por categoría.
 */

export const DEFAULT_CATEGORIAS_PRESUPUESTO = [
  { categoria: 'transporte', porcentaje: 28 },
  { categoria: 'alojamiento', porcentaje: 32 },
  { categoria: 'comida', porcentaje: 15 },
  { categoria: 'actividades', porcentaje: 10 },
  { categoria: 'compras', porcentaje: 5 },
  { categoria: 'impuestos', porcentaje: 5 },
  { categoria: 'otros', porcentaje: 5 }
];

export const CATEGORIA_LABELS = {
  transporte: 'Transporte / Vuelos',
  alojamiento: 'Alojamiento / Hoteles',
  comida: 'Comida / Bebida',
  actividades: 'Actividades / Tours',
  compras: 'Compras',
  impuestos: 'Impuestos / Permisos (K-ETA, ETIAS, Visas)',
  otros: 'Otros'
};

/**
 * Obtiene la configuración activa de categorías de presupuesto para un viaje.
 * Respeta tanto `viaje.categoriasPresupuesto` como `viaje.presupuestos` (Prisma),
 * o usa la distribución por defecto si no se ha personalizado aún.
 */
export function getViajeCategoriasConfig(viaje) {
  const presupuestoTotalCOP = Number(viaje?.presupuestoTotal) || 0;

  const ensureImpuestosPresent = (list) => {
    const hasImpuestos = list.some(
      (i) => (i.categoria || '').toLowerCase() === 'impuestos'
    );
    if (hasImpuestos) return list;
    // Insertar 'impuestos' justo antes de 'otros' si existe, o al final
    const otrosIdx = list.findIndex((i) => (i.categoria || '').toLowerCase() === 'otros');
    const newItem = {
      categoria: 'impuestos',
      porcentaje: 0,
      limiteCOP: 0
    };
    if (otrosIdx >= 0) {
      const copy = [...list];
      copy.splice(otrosIdx, 0, newItem);
      return copy;
    }
    return [...list, newItem];
  };

  if (Array.isArray(viaje?.categoriasPresupuesto) && viaje.categoriasPresupuesto.length > 0) {
    const mapped = viaje.categoriasPresupuesto.map((item) => {
      const cat = (item.categoria || 'otros').trim().toLowerCase();
      const pct =
        item.porcentaje !== undefined && item.porcentaje !== null
          ? Number(item.porcentaje)
          : presupuestoTotalCOP > 0 && item.limite !== undefined
          ? Number(((Number(item.limite) / presupuestoTotalCOP) * 100).toFixed(1))
          : 0;
      const limiteCOP =
        presupuestoTotalCOP > 0
          ? Math.round(presupuestoTotalCOP * (pct / 100))
          : Number(item.limite) || 0;
      return {
        categoria: cat,
        porcentaje: pct,
        limiteCOP
      };
    });
    return ensureImpuestosPresent(mapped);
  }

  if (Array.isArray(viaje?.presupuestos) && viaje.presupuestos.length > 0) {
    const mapped = viaje.presupuestos.map((item) => {
      const cat = (item.categoria || 'otros').trim().toLowerCase();
      const limite = Number(item.limite) || 0;
      const pct =
        presupuestoTotalCOP > 0
          ? Number(((limite / presupuestoTotalCOP) * 100).toFixed(1))
          : 0;
      return {
        categoria: cat,
        porcentaje: pct,
        limiteCOP: limite
      };
    });
    return ensureImpuestosPresent(mapped);
  }

  return DEFAULT_CATEGORIAS_PRESUPUESTO.map((item) => ({
    categoria: item.categoria,
    porcentaje: item.porcentaje,
    limiteCOP: Math.round(presupuestoTotalCOP * (item.porcentaje / 100))
  }));
}

/**
 * Obtiene el desglose exacto de montos para un gasto (soporta compras para 1, 2, 3 o más personas).
 * - montoTotalCOP / montoTotalOrig: Todo lo gastado/descontado de la TC (todas las personas).
 * - montoPorPersonaCOP / montoPorPersonaOrig: Cuánto corresponde por 1 persona.
 * - montoComputableCOP: Valor que se descuenta del presupuesto personal (por defecto 1 persona cuando es grupal, o el total si computarSoloMiParte === false).
 * - montoAcompanantesCOP: Parte correspondiente a las demás personas compradas en la misma transacción.
 */
export function getGastoAmounts(g) {
  if (!g) {
    return {
      cantidadPersonas: 1,
      isMultiPerson: false,
      computarSoloMiParte: true,
      montoTotalOrig: 0,
      montoPorPersonaOrig: 0,
      montoTotalCOP: 0,
      montoPorPersonaCOP: 0,
      montoComputableCOP: 0,
      montoAcompanantesCOP: 0,
      montoTotalUSD: 0,
      montoPorPersonaUSD: 0,
      montoComputableUSD: 0,
      montoAcompanantesUSD: 0
    };
  }

  const pax = Math.max(1, Math.round(Number(g.cantidadPersonas) || 1));
  const isMultiPerson = pax > 1;
  const computarSoloMiParte = g.computarSoloMiParte !== undefined ? Boolean(g.computarSoloMiParte) : true;

  const rawOrig = Number(g.costoTotal || g.montoOriginal) || 0;
  const montoTotalOrig = rawOrig;
  const montoPorPersonaOrig =
    g.costoPorPersona && Number(g.costoPorPersona) > 0
      ? Number(g.costoPorPersona)
      : isMultiPerson
      ? Number((montoTotalOrig / pax).toFixed(2))
      : montoTotalOrig;

  const rawCOP = Number(g.montoTotalCOP || g.montoCOP) || 0;
  const montoTotalCOP = rawCOP;
  const montoPorPersonaCOP =
    g.montoPorPersonaCOP && Number(g.montoPorPersonaCOP) > 0
      ? Number(g.montoPorPersonaCOP)
      : isMultiPerson
      ? Math.round(montoTotalCOP / pax)
      : montoTotalCOP;

  const rawUSD = Number(g.montoTotalUSD || g.montoUSD) || 0;
  const montoTotalUSD = rawUSD;
  const montoPorPersonaUSD =
    g.montoPorPersonaUSD && Number(g.montoPorPersonaUSD) > 0
      ? Number(g.montoPorPersonaUSD)
      : isMultiPerson
      ? Number((montoTotalUSD / pax).toFixed(2))
      : montoTotalUSD;

  const montoComputableCOP = isMultiPerson && computarSoloMiParte ? montoPorPersonaCOP : montoTotalCOP;
  const montoAcompanantesCOP = isMultiPerson ? Math.max(0, montoTotalCOP - montoPorPersonaCOP) : 0;

  const montoComputableUSD = isMultiPerson && computarSoloMiParte ? montoPorPersonaUSD : montoTotalUSD;
  const montoAcompanantesUSD = isMultiPerson ? Math.max(0, Number((montoTotalUSD - montoPorPersonaUSD).toFixed(2))) : 0;

  return {
    cantidadPersonas: pax,
    isMultiPerson,
    computarSoloMiParte,
    montoTotalOrig,
    montoPorPersonaOrig,
    montoTotalCOP,
    montoPorPersonaCOP,
    montoComputableCOP,
    montoAcompanantesCOP,
    montoTotalUSD,
    montoPorPersonaUSD,
    montoComputableUSD,
    montoAcompanantesUSD
  };
}

export function calculateTripBalance(viaje, gastos = []) {
  if (!viaje) {
    return {
      presupuestoTotalCOP: 0,
      presupuesto: 0,
      totalGastadoCOP: 0,
      totalGastadoUSD: 0,
      totalDesembolsadoCOP: 0,
      totalDesembolsadoUSD: 0,
      totalPorPersonaCOP: 0,
      totalPorPersonaUSD: 0,
      gastoAcompanantesCOP: 0,
      gastoAcompanantesUSD: 0,
      multiPersonGastosCount: 0,
      gastoBase: 0,
      pagadoAdelantadoCOP: 0,
      pagadoAdelantadoTotalCOP: 0,
      dineroRequeridoEnRutaCOP: 0,
      comprasTercerosCOP: 0,
      ingresosReembolsosCOP: 0,
      balanceDisponibleCOP: 0,
      saldoRestante: 0,
      porcentajeConsumido: 0,
      porcentajePresupuesto: 0,
      isOverBudget: false,
      semaforoGlobal: 'verde',
      semaforoCategorias: [],
      monedaBase: 'COP',
      gastosComputablesCount: 0,
      totalFueraPresupuestoCOP: 0,
      totalFueraPresupuestoUSD: 0
    };
  }

  const presupuestoTotalCOP = Number(viaje.presupuestoTotal) || 0;
  const monedaBase = (viaje.monedaBase || 'COP').toUpperCase();

  let totalGastadoCOP = 0;
  let totalGastadoUSD = 0;
  let totalDesembolsadoCOP = 0;
  let totalDesembolsadoUSD = 0;
  let totalPorPersonaCOP = 0;
  let totalPorPersonaUSD = 0;
  let gastoAcompanantesCOP = 0;
  let gastoAcompanantesUSD = 0;
  let multiPersonGastosCount = 0;
  let pagadoAdelantadoCOP = 0;
  let pagadoAdelantadoTotalCOP = 0;
  let enRutaCOP = 0;
  let comprasTercerosCOP = 0;
  let ingresosCOP = 0;
  let totalFueraPresupuestoCOP = 0;
  let totalFueraPresupuestoUSD = 0;
  let gastosComputablesCount = 0;

  const categoriasConfig = getViajeCategoriasConfig(viaje);
  const categoriasMap = {};
  for (const cfg of categoriasConfig) {
    categoriasMap[cfg.categoria] = {
      gastoCOP: 0,
      gastoUSD: 0,
      gastoTotalDesembolsadoCOP: 0,
      porcentajeAsignado: cfg.porcentaje,
      limiteCOP: cfg.limiteCOP
    };
  }

  const safeGastos = Array.isArray(gastos) ? gastos : [];

  for (const g of safeGastos) {
    const amounts = getGastoAmounts(g);
    const {
      isMultiPerson,
      computarSoloMiParte,
      montoTotalCOP,
      montoTotalUSD,
      montoPorPersonaCOP,
      montoPorPersonaUSD,
      montoComputableCOP,
      montoComputableUSD,
      montoAcompanantesCOP,
      montoAcompanantesUSD
    } = amounts;

    if (isMultiPerson) {
      multiPersonGastosCount++;
    }

    // Regla 2: Reembolsos / Tax-Free (esIngreso)
    if (g.esIngreso) {
      ingresosCOP += montoTotalCOP;
      totalGastadoCOP -= montoComputableCOP;
      totalGastadoUSD -= montoComputableUSD;
      totalDesembolsadoCOP -= montoTotalCOP;
      totalDesembolsadoUSD -= montoTotalUSD;
      totalPorPersonaCOP -= montoPorPersonaCOP;
      totalPorPersonaUSD -= montoPorPersonaUSD;
      continue;
    }

    // Todo lo desembolsado / cargado a TC o efectivo (incluyendo 2 o 3 personas)
    totalDesembolsadoCOP += montoTotalCOP;
    totalDesembolsadoUSD += montoTotalUSD;

    // Contabilizar gastos pagados antes del viaje como costo hundido
    if (g.pagadoAdelantado) {
      pagadoAdelantadoTotalCOP += montoTotalCOP;
      pagadoAdelantadoCOP += g.noComputar ? montoTotalCOP : montoComputableCOP;
    }

    // Regla 1: Exclusión total de presupuesto (noComputar)
    if (g.noComputar) {
      comprasTercerosCOP += montoTotalCOP;
      totalFueraPresupuestoCOP += montoTotalCOP;
      totalFueraPresupuestoUSD += montoTotalUSD;
      continue;
    }

    // Si es para 2 o 3 personas y computa solo mi parte, la parte de acompañantes se registra en terceros/acompañantes
    if (isMultiPerson) {
      gastoAcompanantesCOP += montoAcompanantesCOP;
      gastoAcompanantesUSD += montoAcompanantesUSD;
      if (computarSoloMiParte) {
        comprasTercerosCOP += montoAcompanantesCOP;
        totalFueraPresupuestoCOP += montoAcompanantesCOP;
        totalFueraPresupuestoUSD += montoAcompanantesUSD;
      }
    }

    // Regla 3: Gastos computables en el presupuesto del viaje
    totalGastadoCOP += montoComputableCOP;
    totalGastadoUSD += montoComputableUSD;
    totalPorPersonaCOP += montoPorPersonaCOP;
    totalPorPersonaUSD += montoPorPersonaUSD;
    gastosComputablesCount++;

    if (!g.pagadoAdelantado) {
      enRutaCOP += montoComputableCOP;
    }

    const cat = (g.categoria || 'otros').trim().toLowerCase();
    if (!categoriasMap[cat]) {
      categoriasMap[cat] = {
        gastoCOP: 0,
        gastoUSD: 0,
        gastoTotalDesembolsadoCOP: 0,
        porcentajeAsignado: 0,
        limiteCOP: 0
      };
    }
    categoriasMap[cat].gastoCOP += montoComputableCOP;
    categoriasMap[cat].gastoUSD += montoComputableUSD;
    categoriasMap[cat].gastoTotalDesembolsadoCOP += montoTotalCOP;
  }

  const gastoBase = monedaBase === 'USD' ? totalGastadoUSD : totalGastadoCOP;
  const balanceDisponibleCOP = presupuestoTotalCOP - totalGastadoCOP;
  const porcentajeConsumido = presupuestoTotalCOP > 0 ? (totalGastadoCOP / presupuestoTotalCOP) * 100 : 0;
  const isOverBudget = balanceDisponibleCOP < 0;

  let semaforoGlobal = 'verde';
  if (porcentajeConsumido >= 100) semaforoGlobal = 'rojo';
  else if (porcentajeConsumido >= 75) semaforoGlobal = 'amarillo';

  const semaforoCategorias = Object.entries(categoriasMap).map(([key, val]) => {
    const porcentaje = val.limiteCOP > 0 ? (val.gastoCOP / val.limiteCOP) * 100 : 0;
    let color = 'verde';
    if (porcentaje >= 100) color = 'rojo';
    else if (porcentaje >= 75) color = 'amarillo';

    return {
      categoria: key,
      porcentajeAsignado: Number((val.porcentajeAsignado || 0).toFixed(1)),
      limiteCOP: val.limiteCOP,
      consumidoCOP: val.gastoCOP,
      consumidoUSD: val.gastoUSD,
      consumidoTotalDesembolsadoCOP: val.gastoTotalDesembolsadoCOP,
      porcentaje: Number(porcentaje.toFixed(1)),
      color
    };
  });

  return {
    presupuestoTotalCOP,
    presupuesto: presupuestoTotalCOP,
    totalGastadoCOP,
    totalGastadoUSD,
    totalDesembolsadoCOP,
    totalDesembolsadoUSD,
    totalPorPersonaCOP,
    totalPorPersonaUSD,
    gastoAcompanantesCOP,
    gastoAcompanantesUSD,
    multiPersonGastosCount,
    gastoBase,
    pagadoAdelantadoCOP,
    pagadoAdelantadoTotalCOP,
    dineroRequeridoEnRutaCOP: enRutaCOP,
    comprasTercerosCOP,
    ingresosReembolsosCOP: ingresosCOP,
    balanceDisponibleCOP,
    saldoRestante: balanceDisponibleCOP,
    porcentajeConsumido: Number(porcentajeConsumido.toFixed(1)),
    porcentajePresupuesto: Math.round(porcentajeConsumido),
    isOverBudget,
    semaforoGlobal,
    semaforoCategorias,
    monedaBase,
    gastosComputablesCount,
    totalFueraPresupuestoCOP,
    totalFueraPresupuestoUSD
  };
}
