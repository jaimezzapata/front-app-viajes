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
  { categoria: 'transporte', porcentaje: 30 },
  { categoria: 'alojamiento', porcentaje: 35 },
  { categoria: 'comida', porcentaje: 15 },
  { categoria: 'actividades', porcentaje: 10 },
  { categoria: 'compras', porcentaje: 5 },
  { categoria: 'otros', porcentaje: 5 }
];

/**
 * Obtiene la configuración activa de categorías de presupuesto para un viaje.
 * Respeta tanto `viaje.categoriasPresupuesto` como `viaje.presupuestos` (Prisma),
 * o usa la distribución por defecto si no se ha personalizado aún.
 */
export function getViajeCategoriasConfig(viaje) {
  const presupuestoTotalCOP = Number(viaje?.presupuestoTotal) || 0;

  if (Array.isArray(viaje?.categoriasPresupuesto) && viaje.categoriasPresupuesto.length > 0) {
    return viaje.categoriasPresupuesto.map((item) => {
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
  }

  if (Array.isArray(viaje?.presupuestos) && viaje.presupuestos.length > 0) {
    return viaje.presupuestos.map((item) => {
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
  }

  return DEFAULT_CATEGORIAS_PRESUPUESTO.map((item) => ({
    categoria: item.categoria,
    porcentaje: item.porcentaje,
    limiteCOP: Math.round(presupuestoTotalCOP * (item.porcentaje / 100))
  }));
}

export function calculateTripBalance(viaje, gastos = []) {
  if (!viaje) {
    return {
      presupuestoTotalCOP: 0,
      presupuesto: 0,
      totalGastadoCOP: 0,
      totalGastadoUSD: 0,
      gastoBase: 0,
      pagadoAdelantadoCOP: 0,
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
  let pagadoAdelantadoCOP = 0;
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
      porcentajeAsignado: cfg.porcentaje,
      limiteCOP: cfg.limiteCOP
    };
  }

  const safeGastos = Array.isArray(gastos) ? gastos : [];

  for (const g of safeGastos) {
    const cop = Number(g.montoCOP) || 0;
    const usd = Number(g.montoUSD) || 0;

    // Contabilizar siempre gastos pagados antes del viaje como costo hundido
    if (g.pagadoAdelantado) {
      pagadoAdelantadoCOP += cop;
    }

    // Regla 1: Exclusión de presupuesto (noComputar)
    if (g.noComputar) {
      comprasTercerosCOP += cop;
      totalFueraPresupuestoCOP += cop;
      totalFueraPresupuestoUSD += usd;
      continue;
    }

    // Regla 2: Reembolsos / Tax-Free (esIngreso)
    if (g.esIngreso) {
      ingresosCOP += cop;
      totalGastadoCOP -= cop;
      totalGastadoUSD -= usd;
      continue;
    }

    // Regla 3: Gastos computables en el presupuesto del viaje
    totalGastadoCOP += cop;
    totalGastadoUSD += usd;
    gastosComputablesCount++;

    if (!g.pagadoAdelantado) {
      enRutaCOP += cop;
    }

    const cat = (g.categoria || 'otros').trim().toLowerCase();
    if (!categoriasMap[cat]) {
      categoriasMap[cat] = {
        gastoCOP: 0,
        gastoUSD: 0,
        porcentajeAsignado: 0,
        limiteCOP: 0
      };
    }
    categoriasMap[cat].gastoCOP += cop;
    categoriasMap[cat].gastoUSD += usd;
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
      porcentaje: Number(porcentaje.toFixed(1)),
      color
    };
  });

  return {
    presupuestoTotalCOP,
    presupuesto: presupuestoTotalCOP,
    totalGastadoCOP,
    totalGastadoUSD,
    gastoBase,
    pagadoAdelantadoCOP,
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
