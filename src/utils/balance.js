/**
 * Módulo Centralizado de Cálculos Financieros y Presupuesto (Single Source of Truth)
 * 
 * Unifica las reglas de negocio contables para toda la aplicación:
 * - noComputar: Excluye compras de terceros o vuelos/actividades desmarcadas del presupuesto.
 * - esIngreso: Resta reembolsos o tax-free del total gastado.
 * - pagadoAdelantado: Contabiliza costos hundidos pre-viaje sin alterar el saldo en ruta.
 * - Distribución y semáforos por categoría.
 */

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

  const categoriasMap = {
    transporte: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.3 },
    alojamiento: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.35 },
    comida: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.15 },
    actividades: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.1 },
    compras: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.05 },
    otros: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.05 }
  };

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

    const cat = (g.categoria || 'otros').toLowerCase();
    if (categoriasMap[cat]) {
      categoriasMap[cat].gastoCOP += cop;
      categoriasMap[cat].gastoUSD += usd;
    }
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
