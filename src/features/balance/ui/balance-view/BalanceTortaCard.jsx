import React, { useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import {
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  TrendingDown,
  Wallet,
  ShieldAlert,
  Settings2,
  Layers,
  PlusCircle
} from 'lucide-react';

const SEMAFORO_CONFIG = {
  verde: {
    id: 'verde',
    label: 'VERDE • CONTROL SALUDABLE',
    shortLabel: 'En Rango Seguro',
    description: 'El consumo se mantiene por debajo del 75% del presupuesto asignado.',
    stroke: '#00FF85',
    textClass: 'text-[#00FF85]',
    bgBadge: 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]',
    glowColor: 'rgba(0, 255, 133, 0.35)',
    Icon: CheckCircle2
  },
  amarillo: {
    id: 'amarillo',
    label: 'AMARILLO • PRECAUCIÓN (75% - 99%)',
    shortLabel: 'Zona de Alerta',
    description: 'Se ha consumido al menos el 75% del presupuesto. Margen reducido para nuevos gastos.',
    stroke: '#FFE500',
    textClass: 'text-[#FFE500]',
    bgBadge: 'bg-[#FFE500]/15 border-[#FFE500]/40 text-[#FFE500]',
    glowColor: 'rgba(255, 229, 0, 0.35)',
    Icon: AlertTriangle
  },
  rojo: {
    id: 'rojo',
    label: 'ROJO • PRESUPUESTO EXCEDIDO (≥ 100%)',
    shortLabel: 'Tope Superado',
    description: 'Los gastos incluidos en presupuesto superaron el tope asignado para el viaje.',
    stroke: '#FF2E55',
    textClass: 'text-[#FF2E55]',
    bgBadge: 'bg-[#FF2E55]/15 border-[#FF2E55]/40 text-[#FF2E55]',
    glowColor: 'rgba(255, 46, 85, 0.4)',
    Icon: OctagonAlert
  }
};

/**
 * Convierte coordenadas polares (ángulo en grados donde 0° es arriba a las 12 en punto) a cartesianas
 */
function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians)
  };
}

/**
 * Genera el path SVG para una tajada de torta (pie slice) desde startAngle hasta endAngle
 */
function createPieSlicePath(cx, cy, r, startAngle, endAngle) {
  const clampedSpan = Math.min(Math.max(endAngle - startAngle, 0), 359.99);
  if (clampedSpan <= 0.01) return '';
  const start = polarToCartesian(cx, cy, r, startAngle + clampedSpan);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = clampedSpan <= 180 ? '0' : '1';
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

function createArcPath(cx, cy, r, startAngle, endAngle) {
  const clampedSpan = Math.min(Math.max(endAngle - startAngle, 0), 359.99);
  if (clampedSpan <= 0.01) return '';
  const start = polarToCartesian(cx, cy, r, startAngle + clampedSpan);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = clampedSpan <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

export function BalanceTortaCard({
  viaje,
  displayBalance,
  hasActiveFilters,
  filteredTotals,
  onOpenConfigPresupuesto,
  onOpenInyectarPresupuesto
}) {
  const { isDark } = useTheme();
  const sliceSeparatorStroke = isDark ? '#0E121B' : '#FFFFFF';
  const baseRingStroke = isDark ? '#151B27' : '#E2E8F0';
  const [chartMode, setChartMode] = useState('simple'); // 'simple' | 'modalidad' | 'origen'
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const presupuestoCOP = Number(viaje?.presupuestoTotal || displayBalance?.presupuestoTotalCOP || 0);
  const inyeccionesPresupuesto = Array.isArray(viaje?.inyeccionesPresupuesto)
    ? viaje.inyeccionesPresupuesto
    : Array.isArray(displayBalance?.inyeccionesPresupuesto)
    ? displayBalance.inyeccionesPresupuesto
    : [];
  const totalInyectadoCOP = inyeccionesPresupuesto.reduce(
    (acc, item) => acc + Math.max(0, Number(item?.monto) || 0),
    0
  );
  const presupuestoBaseCOP = Math.max(0, presupuestoCOP - totalInyectadoCOP);
  const presupuestoPersonas = Math.max(1, Math.round(Number(viaje?.presupuestoPersonas || displayBalance?.presupuestoPersonas) || 1));
  const gastadoCOP = Number(
    hasActiveFilters
      ? (filteredTotals?.cop ?? displayBalance?.totalGastadoCOP ?? 0)
      : (displayBalance?.totalGastadoCOP ?? 0)
  );
  const gastadoUSD = Number(
    hasActiveFilters
      ? (filteredTotals?.usd ?? displayBalance?.totalGastadoUSD ?? 0)
      : (displayBalance?.totalGastadoUSD ?? 0)
  );

  const preViajeCOP = Number(
    hasActiveFilters
      ? (filteredTotals?.adelCOP ?? displayBalance?.pagadoAdelantadoCOP ?? 0)
      : (displayBalance?.pagadoAdelantadoCOP ?? 0)
  );
  const enRutaCOP = Number(
    hasActiveFilters
      ? (filteredTotals?.enRutaCOP ?? displayBalance?.dineroRequeridoEnRutaCOP ?? 0)
      : (displayBalance?.dineroRequeridoEnRutaCOP ?? 0)
  );

  const diferenciaCOP = presupuestoCOP - gastadoCOP;
  const restanteCOP = Math.max(0, diferenciaCOP);
  const excedidoCOP = Math.max(0, gastadoCOP - presupuestoCOP);

  // Tasa implícita USD/COP para estimar USD del presupuesto y restante
  const impliedRateCOPPerUSD = gastadoCOP > 0 && gastadoUSD > 0 ? gastadoCOP / gastadoUSD : 4200;
  const restanteUSD = impliedRateCOPPerUSD > 0 ? restanteCOP / impliedRateCOPPerUSD : 0;
  const excedidoUSD = impliedRateCOPPerUSD > 0 ? excedidoCOP / impliedRateCOPPerUSD : 0;

  const rawPctGastado = presupuestoCOP > 0 ? (gastadoCOP / presupuestoCOP) * 100 : 0;
  const pctGastadoVisual = Math.min(Math.max(rawPctGastado, 0), 100);
  const pctRestanteVisual = Math.max(0, 100 - pctGastadoVisual);
  const pctInyectadoDelTotal = presupuestoCOP > 0 ? (totalInyectadoCOP / presupuestoCOP) * 100 : 0;
  const pctBaseDelTotal = Math.max(0, 100 - pctInyectadoDelTotal);

  const semaforoKey =
    rawPctGastado >= 100 ? 'rojo' : rawPctGastado >= 75 ? 'amarillo' : 'verde';
  const semaforo = SEMAFORO_CONFIG[semaforoKey];
  const StatusIcon = semaforo.Icon;

  // Umbrales del semáforo en COP
  const umbralAmarilloCOP = presupuestoCOP * 0.75;
  const margenParaAmarilloCOP = Math.max(0, umbralAmarilloCOP - gastadoCOP);

  // Construcción de segmentos de la torta (0° a 360°)
  const slices = [];
  if (presupuestoCOP <= 0 && gastadoCOP <= 0) {
    slices.push({
      id: 'sin_datos',
      label: 'Sin Presupuesto Configurado',
      amountCOP: 0,
      pct: 100,
      color: '#1C2436',
      startAngle: 0,
      endAngle: 359.99
    });
  } else if (chartMode === 'origen' && presupuestoCOP > 0) {
    // Modo Origen del Presupuesto: Presupuesto Base vs. Inyecciones Adicionales
    const pctBase = (presupuestoBaseCOP / presupuestoCOP) * 100;
    const pctInyectado = Math.max(0, 100 - pctBase);
    const spanBase = (pctBase / 100) * 360;
    if (pctBase > 0) {
      slices.push({
        id: 'ppto_base',
        label: 'Presupuesto Base Inicial',
        amountCOP: presupuestoBaseCOP,
        pct: Number(pctBase.toFixed(1)),
        color: '#00E5FF',
        startAngle: 0,
        endAngle: spanBase
      });
    }
    if (pctInyectado > 0) {
      slices.push({
        id: 'ppto_inyectado',
        label: 'Presupuesto Inyectado (+)',
        amountCOP: totalInyectadoCOP,
        pct: Number(pctInyectado.toFixed(1)),
        color: '#B55FE6',
        startAngle: spanBase,
        endAngle: 360
      });
    }
  } else if (chartMode === 'modalidad' && gastadoCOP > 0) {
    const pctPreViaje = presupuestoCOP > 0
      ? Math.min((preViajeCOP / presupuestoCOP) * 100, 100)
      : (preViajeCOP / gastadoCOP) * 100;
    const pctEnRuta = Math.max(0, pctGastadoVisual - pctPreViaje);

    let currentAngle = 0;
    if (pctPreViaje > 0) {
      const span = (pctPreViaje / 100) * 360;
      slices.push({
        id: 'pre_viaje',
        label: 'Gastado Pre-Viaje (Adelantado)',
        amountCOP: preViajeCOP,
        pct: Number(
          (presupuestoCOP > 0 ? (preViajeCOP / presupuestoCOP) * 100 : pctPreViaje).toFixed(1)
        ),
        color: semaforoKey === 'rojo' ? '#FF2E55' : '#B55FE6',
        startAngle: currentAngle,
        endAngle: currentAngle + span
      });
      currentAngle += span;
    }
    if (pctEnRuta > 0) {
      const span = (pctEnRuta / 100) * 360;
      slices.push({
        id: 'en_ruta',
        label: 'Gastado En Ruta (Destino)',
        amountCOP: enRutaCOP,
        pct: Number(
          (presupuestoCOP > 0 ? (enRutaCOP / presupuestoCOP) * 100 : pctEnRuta).toFixed(1)
        ),
        color: semaforo.stroke,
        startAngle: currentAngle,
        endAngle: currentAngle + span
      });
      currentAngle += span;
    }
    if (pctRestanteVisual > 0) {
      const span = (pctRestanteVisual / 100) * 360;
      slices.push({
        id: 'restante',
        label: 'Saldo Restante Disponible',
        amountCOP: restanteCOP,
        pct: Number(pctRestanteVisual.toFixed(1)),
        color: '#00E5FF',
        startAngle: currentAngle,
        endAngle: 360
      });
    }
  } else {
    // Modo Simple: Lo que se ha gastado (con color semáforo) vs Lo que resta
    const spanGastado = (pctGastadoVisual / 100) * 360;
    if (pctGastadoVisual > 0) {
      slices.push({
        id: 'gastado',
        label: 'Lo que se ha gastado (En Presupuesto)',
        amountCOP: gastadoCOP,
        pct: Number(rawPctGastado.toFixed(1)),
        color: semaforo.stroke,
        startAngle: 0,
        endAngle: spanGastado
      });
    }
    if (pctRestanteVisual > 0) {
      if (totalInyectadoCOP > 0 && presupuestoCOP > 0) {
        const restanteInyectadoCOP = Math.min(restanteCOP, totalInyectadoCOP);
        const restanteBaseCOP = Math.max(0, restanteCOP - restanteInyectadoCOP);
        const pctRestanteBase = (restanteBaseCOP / presupuestoCOP) * 100;
        const pctRestanteIny = Math.max(0, pctRestanteVisual - pctRestanteBase);
        const spanRestanteBase = (pctRestanteBase / 100) * 360;

        if (pctRestanteBase > 0.05) {
          slices.push({
            id: 'restante',
            label: 'Resta Presupuesto Base',
            amountCOP: restanteBaseCOP,
            pct: Number(pctRestanteBase.toFixed(1)),
            color: '#00E5FF',
            startAngle: spanGastado,
            endAngle: spanGastado + spanRestanteBase
          });
        }
        if (pctRestanteIny > 0.05) {
          slices.push({
            id: 'restante_inyectado',
            label: 'Resta Inyectado (+)',
            amountCOP: restanteInyectadoCOP,
            pct: Number(pctRestanteIny.toFixed(1)),
            color: '#B55FE6',
            startAngle: spanGastado + spanRestanteBase,
            endAngle: 360
          });
        }
      } else {
        slices.push({
          id: 'restante',
          label: 'Lo que resta (Disponible)',
          amountCOP: restanteCOP,
          pct: Number(pctRestanteVisual.toFixed(1)),
          color: '#00E5FF',
          startAngle: spanGastado,
          endAngle: 360
        });
      }
    }
  }

  const activeSlice =
    hoveredSlice === 'outer_inyectado'
      ? {
          id: 'outer_inyectado',
          label: 'Capital Inyectado (+)',
          amountCOP: totalInyectadoCOP,
          pct: Number(pctInyectadoDelTotal.toFixed(1)),
          color: '#B55FE6'
        }
      : slices.find((s) => s.id === hoveredSlice) || null;

  // Coordenadas para marcador del 75% (umbral amarillo = 270°)
  const cx = 120;
  const cy = 120;
  const outerRadius = totalInyectadoCOP > 0 ? 90 : 96;
  const innerRadius = 56;
  const haloRadius = 103;
  const marker75Inner = polarToCartesian(cx, cy, innerRadius - 4, 270);
  const marker75Outer = polarToCartesian(cx, cy, outerRadius + 6, 270);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10">
      {/* Encabezado Superior */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-[#1C2436]">
        <div className="flex items-start sm:items-center gap-3 flex-wrap">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-colors"
            style={{
              backgroundColor: `${semaforo.stroke}15`,
              borderColor: `${semaforo.stroke}45`,
              color: semaforo.stroke,
              boxShadow: `0 0 18px ${semaforo.glowColor}`
            }}
          >
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] uppercase tracking-wider m-0">
                Torta de Control de Gastos: Gastado vs. Restante
              </h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
                Ppto para {presupuestoPersonas} {presupuestoPersonas === 1 ? 'persona' : 'personas'}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${semaforo.bgBadge}`}
              >
                <StatusIcon className="w-3 h-3" />
                {semaforo.label}
              </span>
              {hasActiveFilters && (
                <span className="text-[10px] font-semibold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-2 py-0.5 rounded">
                  Vista filtrada
                </span>
              )}
            </div>
            <p className="text-xs text-[#8492A6] m-0 mt-0.5">
              {semaforo.description}
            </p>
          </div>
        </div>

        {/* Selector de modo de torta y botón configurar */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <div className="inline-flex rounded-lg bg-[#151B27] border border-[#1C2436] p-0.5">
            <button
              type="button"
              onClick={() => setChartMode('simple')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                chartMode === 'simple'
                  ? 'bg-[#00E5FF] text-[#080A0F]'
                  : 'text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              Gastado vs. Resta
            </button>
            <button
              type="button"
              onClick={() => setChartMode('modalidad')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                chartMode === 'modalidad'
                  ? 'bg-[#00E5FF] text-[#080A0F]'
                  : 'text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Pre-Viaje / Ruta</span>
            </button>
            {totalInyectadoCOP > 0 && (
              <button
                type="button"
                onClick={() => setChartMode('origen')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  chartMode === 'origen'
                    ? 'bg-[#B55FE6] text-white'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                Base vs. Inyectado
              </button>
            )}
          </div>

          {onOpenInyectarPresupuesto && (
            <button
              type="button"
              onClick={onOpenInyectarPresupuesto}
              className="px-2.5 py-1.5 rounded-lg bg-[#B55FE6]/15 hover:bg-[#B55FE6]/25 border border-[#B55FE6]/45 text-[#B55FE6] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
              title="Inyectar presupuesto adicional al viaje"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Inyectar</span>
            </button>
          )}

          {onOpenConfigPresupuesto && (
            <button
              type="button"
              onClick={onOpenConfigPresupuesto}
              className="px-2.5 py-1.5 rounded-lg bg-[#151B27] hover:bg-[#1C2436] border border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
              title="Ajustar tope de presupuesto"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">Tope Ppto</span>
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo Principal: Semáforo Físico + Gráfico de Torta + Tarjetas Gastado vs Restante */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* COLUMNA 1 (3 cols): Semáforo Visual de 3 Luces */}
        <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8492A6]">
              Semáforo de Presupuesto
            </span>
            <span className={`text-[11px] font-bold uppercase ${semaforo.textClass}`}>
              {semaforo.shortLabel}
            </span>
          </div>

          {/* Caja de 3 luces del semáforo */}
          <div className="space-y-2">
            {/* Luz Verde */}
            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                semaforoKey === 'verde'
                  ? 'bg-[#00FF85]/15 border-[#00FF85] shadow-[0_0_15px_rgba(0,255,133,0.2)]'
                  : 'bg-[#0E121B]/60 border-[#1C2436] opacity-55'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full shrink-0 transition-all ${
                    semaforoKey === 'verde'
                      ? 'bg-[#00FF85] shadow-[0_0_12px_#00FF85] ring-2 ring-[#00FF85]/40'
                      : 'bg-[#00FF85]/30'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-[#F1F5F9] m-0 leading-tight">
                    Verde • Saludable
                  </p>
                  <p className="text-[10px] text-[#8492A6] m-0">
                    Consumo menor al 75%
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#00FF85]">
                0% – 74.9%
              </span>
            </div>

            {/* Luz Amarilla */}
            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                semaforoKey === 'amarillo'
                  ? 'bg-[#FFE500]/15 border-[#FFE500] shadow-[0_0_15px_rgba(255,229,0,0.2)]'
                  : 'bg-[#0E121B]/60 border-[#1C2436] opacity-55'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full shrink-0 transition-all ${
                    semaforoKey === 'amarillo'
                      ? 'bg-[#FFE500] shadow-[0_0_12px_#FFE500] ring-2 ring-[#FFE500]/40'
                      : 'bg-[#FFE500]/30'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-[#F1F5F9] m-0 leading-tight">
                    Amarillo • Precaución
                  </p>
                  <p className="text-[10px] text-[#8492A6] m-0">
                    Acercándose al límite ($ {Math.round(umbralAmarilloCOP).toLocaleString('es-CO')})
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#FFE500]">
                75% – 99.9%
              </span>
            </div>

            {/* Luz Roja */}
            <div
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                semaforoKey === 'rojo'
                  ? 'bg-[#FF2E55]/15 border-[#FF2E55] shadow-[0_0_15px_rgba(255,46,85,0.25)]'
                  : 'bg-[#0E121B]/60 border-[#1C2436] opacity-55'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full shrink-0 transition-all ${
                    semaforoKey === 'rojo'
                      ? 'bg-[#FF2E55] shadow-[0_0_12px_#FF2E55] ring-2 ring-[#FF2E55]/40'
                      : 'bg-[#FF2E55]/30'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-[#F1F5F9] m-0 leading-tight">
                    Rojo • Sobregiro
                  </p>
                  <p className="text-[10px] text-[#8492A6] m-0">
                    Tope superado ($ {Math.round(presupuestoCOP).toLocaleString('es-CO')})
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#FF2E55]">
                ≥ 100%
              </span>
            </div>
          </div>

          {/* Mensaje de margen hacia el siguiente cambio de semáforo */}
          <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1C2436] text-[11px]">
            {semaforoKey === 'verde' && (
              <p className="m-0 text-[#8492A6]">
                Margen antes de <strong className="text-[#FFE500]">Amarillo (75%)</strong>:{' '}
                <strong className="text-[#00FF85] font-mono">
                  $ {Math.round(margenParaAmarilloCOP).toLocaleString('es-CO')} COP
                </strong>
              </p>
            )}
            {semaforoKey === 'amarillo' && (
              <p className="m-0 text-[#8492A6]">
                Margen antes de <strong className="text-[#FF2E55]">Rojo (100%)</strong>:{' '}
                <strong className="text-[#FFE500] font-mono">
                  $ {Math.round(restanteCOP).toLocaleString('es-CO')} COP
                </strong>
              </p>
            )}
            {semaforoKey === 'rojo' && (
              <p className="m-0 text-[#8492A6]">
                Exceso actual sobre el presupuesto (100%):{' '}
                <strong className="text-[#FF2E55] font-mono">
                  + $ {Math.round(excedidoCOP).toLocaleString('es-CO')} COP
                </strong>{' '}
                <span className="text-[10px] font-mono">(+{(rawPctGastado - 100).toFixed(1)}%)</span>
              </p>
            )}
          </div>
        </div>

        {/* COLUMNA 2 (4 cols): Gráfico de Torta / Dona Interactivo */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-60 h-60 flex items-center justify-center">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full overflow-visible select-none"
              role="img"
              aria-label="Gráfico de torta de presupuesto gastado y restante"
            >
              <defs>
                <filter id="semaforoGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <pattern
                  id="injectedStripePattern"
                  width="6"
                  height="6"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="6" height="6" fill="#B55FE6" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2.2" />
                </pattern>
              </defs>

              {/* Anillo Exterior de Origen del Capital (solo cuando hay capital inyectado) */}
              {totalInyectadoCOP > 0 && presupuestoCOP > 0 && (
                <g>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={haloRadius}
                    fill="none"
                    stroke="#00E5FF"
                    strokeOpacity="0.28"
                    strokeWidth="6"
                  />
                  {pctInyectadoDelTotal >= 99.9 ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={haloRadius}
                      fill="none"
                      stroke="#B55FE6"
                      strokeWidth={hoveredSlice === 'outer_inyectado' ? '9' : '6.5'}
                      className="transition-all duration-200 cursor-pointer"
                      style={{ filter: 'url(#semaforoGlow)' }}
                      onMouseEnter={() => setHoveredSlice('outer_inyectado')}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  ) : (
                    <path
                      d={createArcPath(
                        cx,
                        cy,
                        haloRadius,
                        (pctBaseDelTotal / 100) * 360,
                        360
                      )}
                      fill="none"
                      stroke="#B55FE6"
                      strokeLinecap="round"
                      strokeWidth={hoveredSlice === 'outer_inyectado' ? '9' : '6.5'}
                      className="transition-all duration-200 cursor-pointer"
                      style={{ filter: 'url(#semaforoGlow)' }}
                      onMouseEnter={() => setHoveredSlice('outer_inyectado')}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  )}
                </g>
              )}

              {/* Círculo base de fondo */}
              <circle
                cx={cx}
                cy={cy}
                r={outerRadius}
                fill="none"
                stroke={baseRingStroke}
                strokeWidth="4"
              />

              {/* Porciones de la Torta */}
              {slices.map((slice) => {
                const isHovered = hoveredSlice === slice.id;
                const r = isHovered ? outerRadius + 5 : outerRadius;
                const span = slice.endAngle - slice.startAngle;

                // Si una sola porción ocupa el 100% (360°), renderizamos un círculo completo
                if (span >= 359.9) {
                  return (
                    <circle
                      key={slice.id}
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={slice.color}
                      stroke={sliceSeparatorStroke}
                      strokeWidth="2.5"
                      className="transition-all duration-200 cursor-pointer"
                      style={
                        slice.id !== 'restante'
                          ? { filter: 'url(#semaforoGlow)' }
                          : undefined
                      }
                      onMouseEnter={() => setHoveredSlice(slice.id)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                }

                const d = createPieSlicePath(cx, cy, r, slice.startAngle, slice.endAngle);
                const isInjectedSlice =
                  slice.id === 'restante_inyectado' || slice.id === 'ppto_inyectado';
                return (
                  <path
                    key={slice.id}
                    d={d}
                    fill={isInjectedSlice ? 'url(#injectedStripePattern)' : slice.color}
                    stroke={sliceSeparatorStroke}
                    strokeWidth="2.5"
                    className="transition-all duration-200 cursor-pointer"
                    style={
                      slice.id !== 'restante' && isHovered
                        ? { filter: 'url(#semaforoGlow)' }
                        : undefined
                    }
                    onMouseEnter={() => setHoveredSlice(slice.id)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}

              {/* Marcador punteado de alerta al 75% (270°) */}
              {presupuestoCOP > 0 && (
                <g>
                  <line
                    x1={marker75Inner.x}
                    y1={marker75Inner.y}
                    x2={marker75Outer.x}
                    y2={marker75Outer.y}
                    stroke="#FFE500"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                  <text
                    x={marker75Outer.x - 18}
                    y={marker75Outer.y - 4}
                    fill="#FFE500"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    75%
                  </text>
                </g>
              )}
            </svg>

            {/* Centro de la Torta (Agujero adaptable a Modo Claro/Oscuro para lectura del % y Semáforo) */}
            <div className="absolute w-28 h-28 rounded-full bg-[#0E121B] border-2 border-[#1C2436] flex flex-col items-center justify-center pointer-events-none text-center px-2 shadow-inner">
              {activeSlice ? (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8492A6] max-w-[95px] truncate">
                    {activeSlice.id === 'restante'
                      ? 'Resta Base'
                      : activeSlice.id === 'restante_inyectado'
                      ? 'Resta Inyectado'
                      : activeSlice.id === 'ppto_base'
                      ? 'Ppto Base'
                      : activeSlice.id === 'ppto_inyectado' || activeSlice.id === 'outer_inyectado'
                      ? 'Capital Inyectado'
                      : 'Gastado'}
                  </span>
                  <span
                    className="text-lg font-extrabold font-mono leading-tight"
                    style={{ color: activeSlice.color }}
                  >
                    {activeSlice.pct}%
                  </span>
                  <span className="text-[9px] font-bold text-[#F1F5F9] font-mono mt-0.5">
                    $ {Math.round(activeSlice.amountCOP).toLocaleString('es-CO')}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8492A6]">
                    Consumido
                  </span>
                  <span
                    className={`text-xl font-extrabold font-mono leading-tight ${semaforo.textClass}`}
                  >
                    {rawPctGastado.toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-semibold text-[#8492A6] mt-0.5">
                    {restanteCOP > 0
                      ? `Resta ${(100 - pctGastadoVisual).toFixed(1)}%`
                      : '0% Disponible'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Leyenda Interactiva debajo de la Torta */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
            {slices.map((s) => {
              const isInjected = s.id === 'restante_inyectado' || s.id === 'ppto_inyectado';
              return (
                <button
                  key={s.id}
                  type="button"
                  onMouseEnter={() => setHoveredSlice(s.id)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    hoveredSlice === s.id
                      ? 'bg-[#151B27] border-[#00E5FF]'
                      : 'bg-[#151B27]/60 border-[#1C2436]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={
                      isInjected
                        ? {
                            background:
                              'repeating-linear-gradient(45deg, #B55FE6, #B55FE6 2px, rgba(255,255,255,0.55) 2px, rgba(255,255,255,0.55) 4px)'
                          }
                        : { backgroundColor: s.color }
                    }
                  />
                  <span className="text-[#8492A6] font-medium">{s.label}:</span>
                  <strong className="text-[#F1F5F9] font-mono">{s.pct}%</strong>
                </button>
              );
            })}

            {totalInyectadoCOP > 0 && chartMode !== 'origen' && (
              <button
                type="button"
                onMouseEnter={() => setHoveredSlice('outer_inyectado')}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={onOpenInyectarPresupuesto}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  hoveredSlice === 'outer_inyectado'
                    ? 'bg-[#B55FE6]/20 border-[#B55FE6]'
                    : 'bg-[#B55FE6]/10 border-[#B55FE6]/40'
                }`}
                title="Porcentaje del presupuesto total que proviene de capital inyectado"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, #B55FE6, #B55FE6 2px, rgba(255,255,255,0.55) 2px, rgba(255,255,255,0.55) 4px)'
                  }}
                />
                <span className="text-[#B55FE6] font-bold">
                  Capital Inyectado: +{pctInyectadoDelTotal.toFixed(1)}%
                </span>
                <strong className="text-[#F1F5F9] font-mono">
                  ($ {Math.round(totalInyectadoCOP).toLocaleString('es-CO')})
                </strong>
              </button>
            )}
          </div>
        </div>

        {/* COLUMNA 3 (4 cols): Tarjetas de Control "Lo que se ha gastado" vs "Lo que resta" */}
        <div className="lg:col-span-4 space-y-3">
          {/* Tarjeta 1: LO QUE SE HA GASTADO */}
          <div
            className="p-3.5 rounded-xl bg-[#151B27] border transition-colors"
            style={{ borderColor: `${semaforo.stroke}50` }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8492A6] flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" style={{ color: semaforo.stroke }} />
                <span>Lo que se ha gastado (En Ppto)</span>
              </span>
              <span
                className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded border ${semaforo.bgBadge}`}
              >
                {rawPctGastado.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className={`text-xl font-extrabold font-mono m-0 ${semaforo.textClass}`}>
                $ {Math.round(gastadoCOP).toLocaleString('es-CO')} COP
              </p>
              <span className="text-xs font-mono text-[#8492A6]">
                ~${gastadoUSD.toFixed(2)} USD
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-[#1C2436] flex items-center justify-between text-[11px] text-[#8492A6]">
              <span>
                Pre-Viaje:{' '}
                <strong className="text-[#B55FE6] font-mono">
                  $ {Math.round(preViajeCOP).toLocaleString('es-CO')}
                </strong>
              </span>
              <span>
                En Ruta:{' '}
                <strong className="text-[#00FF85] font-mono">
                  $ {Math.round(enRutaCOP).toLocaleString('es-CO')}
                </strong>
              </span>
            </div>
          </div>

          {/* Tarjeta 2: LO QUE RESTA (O SOBREGIRO SI SE EXCEDIÓ EL 100%) */}
          {diferenciaCOP >= 0 ? (
            <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#00E5FF]/40">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8492A6] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Lo que resta (Saldo Disponible)</span>
                </span>
                <span className="text-[11px] font-extrabold font-mono px-2 py-0.5 rounded bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF]">
                  {pctRestanteVisual.toFixed(1)}% libre
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="text-xl font-extrabold font-mono text-[#00E5FF] m-0">
                  $ {Math.round(restanteCOP).toLocaleString('es-CO')} COP
                </p>
                <span className="text-xs font-mono text-[#8492A6]">
                  ~${restanteUSD.toFixed(2)} USD
                </span>
              </div>

              <p className="text-[11px] text-[#8492A6] m-0 mt-1.5">
                Disponible sobre el presupuesto asignado de{' '}
                <strong className="text-[#F1F5F9] font-mono">
                  $ {Math.round(presupuestoCOP).toLocaleString('es-CO')} COP
                </strong>
                .
              </p>

              {totalInyectadoCOP > 0 && (
                <div className="mt-2 pt-2 border-t border-[#1C2436] flex items-center justify-between gap-2 text-[11px] flex-wrap">
                  <span className="text-[#8492A6]">
                    Base:{' '}
                    <strong className="text-[#00E5FF] font-mono">
                      $ {Math.round(presupuestoBaseCOP).toLocaleString('es-CO')}
                    </strong>
                  </span>
                  <span className="text-[#8492A6]">
                    + Inyectado ({inyeccionesPresupuesto.length}):{' '}
                    <strong className="text-[#B55FE6] font-mono">
                      +$ {Math.round(totalInyectadoCOP).toLocaleString('es-CO')}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#FF2E55]/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF2E55]" />
                  <span>Lo que resta: $ 0 (Presupuesto Superado)</span>
                </span>
                <span className="text-[11px] font-extrabold font-mono px-2 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/40 text-[#FF2E55]">
                  0% libre
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="text-xl font-extrabold font-mono text-[#FF2E55] m-0">
                  - $ {Math.round(excedidoCOP).toLocaleString('es-CO')} COP
                </p>
                <span className="text-xs font-mono text-[#8492A6]">
                  ~-${excedidoUSD.toFixed(2)} USD
                </span>
              </div>

              <p className="text-[11px] text-[#8492A6] m-0 mt-1.5">
                El gasto individual en presupuesto supera por{' '}
                <strong className="text-[#FF2E55] font-mono">
                  $ {Math.round(excedidoCOP).toLocaleString('es-CO')} COP
                </strong>{' '}
                el tope de{' '}
                <strong className="text-[#F1F5F9] font-mono">
                  $ {Math.round(presupuestoCOP).toLocaleString('es-CO')} COP
                </strong>
                .
              </p>
            </div>
          )}

          {/* Barra Horizontal de Progreso con Marcadores de Semáforo (75% y 100%) */}
          <div className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436]">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1.5">
              <span>0%</span>
              <span className="text-[#FFE500]">75% Alerta</span>
              <span className="text-[#FF2E55]">100% Tope</span>
            </div>
            <div className="relative h-3 rounded-full bg-[#0E121B] border border-[#1C2436] overflow-hidden">
              {/* Zona de capital inyectado al final de la barra (diferenciada en violeta rayado) */}
              {totalInyectadoCOP > 0 && pctInyectadoDelTotal > 0 && pctInyectadoDelTotal < 100 && (
                <div
                  className="absolute top-0 bottom-0 right-0 opacity-40"
                  style={{
                    width: `${pctInyectadoDelTotal}%`,
                    background:
                      'repeating-linear-gradient(45deg, #B55FE6, #B55FE6 3px, rgba(255,255,255,0.25) 3px, rgba(255,255,255,0.25) 6px)'
                  }}
                  title={`Capital Inyectado (+${pctInyectadoDelTotal.toFixed(1)}%)`}
                />
              )}
              {/* Marca vertical del 75% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#FFE500]/80 z-10"
                style={{ left: '75%' }}
                title="Umbral Amarillo (75%)"
              />
              {/* Relleno con color del semáforo */}
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${pctGastadoVisual}%`,
                  backgroundColor: semaforo.stroke,
                  boxShadow: `0 0 10px ${semaforo.glowColor}`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceTortaCard;
