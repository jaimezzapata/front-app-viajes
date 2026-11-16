import React from 'react';
import { Banknote, TrendingDown, CreditCard, ShieldCheck, Edit2, Users, Plane, Ban, CheckCircle2 } from 'lucide-react';
import WatermarkIcon from '../../../../components/WatermarkIcon';

export function BalanceKpiCards({ viaje, hasActiveFilters, filteredTotals, balance, onOpenConfigPresupuesto }) {
  const presupuestoPersonas = Math.max(1, Math.round(Number(viaje?.presupuestoPersonas || balance?.presupuestoPersonas) || 1));
  const presupuestoTotalNum = Number(viaje?.presupuestoTotal || balance?.presupuestoTotalCOP || 0);
  const miParteCOP = hasActiveFilters ? (filteredTotals?.cop || 0) : (balance?.totalGastadoCOP || 0);
  const miParteUSD = hasActiveFilters ? (filteredTotals?.usd || 0) : (balance?.totalGastadoUSD || 0);
  const totalDesembolsadoCOP = hasActiveFilters
    ? (filteredTotals?.totalDesembolsadoCOP || miParteCOP)
    : (balance?.totalDesembolsadoCOP || miParteCOP);
  const totalDesembolsadoUSD = hasActiveFilters
    ? (filteredTotals?.totalDesembolsadoUSD || miParteUSD)
    : (balance?.totalDesembolsadoUSD || miParteUSD);
  const porPersonaCOP = hasActiveFilters
    ? (filteredTotals?.porPersonaCOP || miParteCOP)
    : (balance?.totalPorPersonaCOP || miParteCOP);
  const acompanantesCOP = hasActiveFilters
    ? (filteredTotals?.acompanantesCOP ?? Math.max(0, totalDesembolsadoCOP - porPersonaCOP))
    : (balance?.gastoAcompanantesCOP ?? Math.max(0, totalDesembolsadoCOP - porPersonaCOP));
  const adelCOP = hasActiveFilters ? (filteredTotals?.adelCOP || 0) : (balance?.pagadoAdelantadoCOP || 0);
  const adelTotalCOP = hasActiveFilters
    ? (filteredTotals?.adelTotalCOP || adelCOP)
    : (balance?.pagadoAdelantadoTotalCOP || adelCOP);

  const fueraPresupuestoCOP = balance?.totalFueraPresupuestoCOP || 0;
  const fueraPresupuestoPorPersonaCOP = balance?.totalFueraPresupuestoPorPersonaCOP || fueraPresupuestoCOP;
  const fueraPresupuestoItems = balance?.gastosFueraPresupuestoItems || [];
  const granTotalPorPersonaCOP = porPersonaCOP + fueraPresupuestoPorPersonaCOP;
  const granTotalGeneralCOP = totalDesembolsadoCOP + fueraPresupuestoCOP;

  const hasMultiPerson = Math.round(totalDesembolsadoCOP) > Math.round(porPersonaCOP) || (balance?.multiPersonGastosCount || 0) > 0;
  const hasFueraPresupuesto = Math.round(fueraPresupuestoCOP) > 0;

  return (
    <div className="mb-6 relative z-10 space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Presupuesto Total */}
        <div
          onClick={onOpenConfigPresupuesto}
          title={onOpenConfigPresupuesto ? 'Haz clic para editar el presupuesto total y los % por categoría' : undefined}
          className={`relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden transition-all ${
            onOpenConfigPresupuesto ? 'hover:border-[#00E5FF] cursor-pointer group' : ''
          }`}
        >
          <WatermarkIcon icon={Banknote} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
              Presupuesto ({presupuestoPersonas} {presupuestoPersonas === 1 ? 'Pers.' : 'Pers.'})
            </p>
            {onOpenConfigPresupuesto && (
              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-1.5 py-0.5 rounded flex items-center gap-1 group-hover:bg-[#00E5FF]/20 transition-colors">
                <Edit2 className="w-2.5 h-2.5" />
                <span>Editar</span>
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-[#F1F5F9] mt-1 m-0 group-hover:text-[#00E5FF] transition-colors">
            $ {Math.round(presupuestoTotalNum).toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-[#00E5FF] font-medium block">
            {viaje?.monedaBase || 'COP'} • {presupuestoPersonas === 1 ? 'Individual (1p)' : `Grupal (${presupuestoPersonas}p ≈ $${Math.round(presupuestoTotalNum / presupuestoPersonas).toLocaleString('es-CO')}/p)`}
          </span>
        </div>

        {/* Total Consumido (En Presupuesto - Según Alcance Definido) */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={TrendingDown} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00FF85]" />
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
              {hasActiveFilters ? 'En Presupuesto (Filtrado)' : `Consumido en Ppto (${presupuestoPersonas}p)`}
            </p>
            <span className="text-[9px] font-bold bg-[#00FF85]/15 text-[#00FF85] px-1.5 py-0.2 rounded border border-[#00FF85]/30 uppercase">
              Incluido
            </span>
          </div>
          <p className="text-xl font-bold text-[#00FF85] mt-1 m-0">
            $ {Math.round(miParteCOP).toLocaleString('es-CO')}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-[10px] text-[#8492A6] font-medium">
              ~${Number(miParteUSD).toFixed(2)} USD • Frente al presupuesto ({presupuestoPersonas} {presupuestoPersonas === 1 ? 'pers.' : 'pers.'})
            </span>
            {presupuestoPersonas === 1 && Math.round(totalDesembolsadoCOP) > Math.round(miParteCOP) && (
              <span className="text-[10px] font-bold text-[#FFE500] font-mono">
                Total TC en Ppto (2p): $ {Math.round(totalDesembolsadoCOP).toLocaleString('es-CO')}
              </span>
            )}
            {presupuestoPersonas > 1 && Math.round(porPersonaCOP) !== Math.round(miParteCOP) && (
              <span className="text-[10px] font-bold text-[#00E5FF] font-mono">
                Por Persona (1p): $ {Math.round(porPersonaCOP).toLocaleString('es-CO')}
              </span>
            )}
          </div>
        </div>

        {/* Dinero Requerido en Ruta */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={CreditCard} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#FFE500]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
            {hasActiveFilters ? 'En Ruta (Filtrado)' : 'Dinero en Ruta (En Ppto)'}
          </p>
          <p className="text-xl font-bold text-[#FFE500] mt-1 m-0">
            $ {Math.round(hasActiveFilters ? filteredTotals.enRutaCOP : (balance?.dineroRequeridoEnRutaCOP || 0)).toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">Hoteles / pagos pendientes en destino</span>
        </div>

        {/* Costos Hundidos (Adelantados dentro del presupuesto) */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={ShieldCheck} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#B55FE6]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
            {hasActiveFilters ? 'Adelantado (Filtrado)' : 'Pre-Viaje (En Ppto)'}
          </p>
          <p className="text-xl font-bold text-[#B55FE6] mt-1 m-0">
            $ {Math.round(adelCOP).toLocaleString('es-CO')}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-[10px] text-[#8492A6] font-medium">Pagados por anticipado (1 persona)</span>
            {Math.round(adelTotalCOP) > Math.round(adelCOP) && (
              <span className="text-[10px] font-bold text-[#00E5FF] font-mono">
                Total TC pre-viaje (2p): $ {Math.round(adelTotalCOP).toLocaleString('es-CO')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SEGMENTACIÓN EN 3 NIVELES: 1) GASTO POR PERSONA, 2) GASTO TOTAL PERSONAS, 3) GASTO TOTAL DEL VIAJE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* SEGMENTO 1: GASTO POR PERSONA (EN PRESUPUESTO) */}
        <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#00FF85]/35 flex flex-col justify-between gap-2.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF85]/15 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-extrabold text-[#F1F5F9] uppercase tracking-wider m-0">
                  1. Gasto por Persona
                </h4>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                  En Presupuesto
                </span>
              </div>
              <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                Vuelos internos y permisos al 50% (1 cupo) + Alojamiento al 100% (mismo valor para 1 o 2 personas) + Actividades.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151B27] border border-[#00FF85]/40 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#00FF85] block">
                Costo Individual en Presupuesto
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-[#00FF85]">
                $ {Math.round(porPersonaCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <span className="text-[10px] text-[#8492A6] font-mono">
              ~${Number(miParteUSD).toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* SEGMENTO 2: GASTO PARA EL TOTAL DE PERSONAS (EN PRESUPUESTO - 2 PERSONAS) */}
        <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#00E5FF]/35 flex flex-col justify-between gap-2.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-extrabold text-[#F1F5F9] uppercase tracking-wider m-0">
                  2. Gasto Total de Personas
                </h4>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                  En Presupuesto (2 Pers.)
                </span>
              </div>
              <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                Total para las 2 personas en vuelos internos y permisos (100%) + Alojamiento para 2 personas (100%) + Actividades.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151B27] border border-[#00E5FF]/40 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#00E5FF] block">
                Total para 2 Personas (En Presupuesto)
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-[#F1F5F9]">
                $ {Math.round(totalDesembolsadoCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <span className="text-[10px] text-[#8492A6] font-mono">
              ~${Number(totalDesembolsadoUSD).toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* SEGMENTO 3: GASTO TOTAL DEL VIAJE (INCLUYENDO TIQUETES FUERA DE PRESUPUESTO) */}
        <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#FF2E55]/40 flex flex-col justify-between gap-2.5 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF2E55]/15 border border-[#FF2E55]/30 flex items-center justify-center text-[#FF2E55] shrink-0">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-extrabold text-[#F1F5F9] uppercase tracking-wider m-0">
                  3. Gasto Total del Viaje
                </h4>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF2E55]/15 text-[#FF2E55] border border-[#FF2E55]/30">
                  Incluye Tiquetes Fuera de Ppto
                </span>
              </div>
              <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                Suma lo incluido en presupuesto ($ {Math.round(totalDesembolsadoCOP).toLocaleString('es-CO')}) + tiquetes de salida y llegada ($ {Math.round(fueraPresupuestoCOP).toLocaleString('es-CO')} fuera de presupuesto).
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151B27] border border-[#FF2E55]/40 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF2E55] block">
                Gasto Total Acumulado del Viaje
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-[#F1F5F9]">
                $ {Math.round(granTotalGeneralCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <span className="text-[10px] text-[#8492A6] font-mono">
              1p + Tiquetes: $ {Math.round(granTotalPorPersonaCOP).toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceKpiCards;

