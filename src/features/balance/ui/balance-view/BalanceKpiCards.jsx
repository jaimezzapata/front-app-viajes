import React from 'react';
import { Banknote, TrendingDown, CreditCard, ShieldCheck, Edit2 } from 'lucide-react';
import WatermarkIcon from '../../../../components/WatermarkIcon';

export function BalanceKpiCards({ viaje, hasActiveFilters, filteredTotals, balance, onOpenConfigPresupuesto }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 relative z-10">
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
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">Presupuesto Asignado</p>
          {onOpenConfigPresupuesto && (
            <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-1.5 py-0.5 rounded flex items-center gap-1 group-hover:bg-[#00E5FF]/20 transition-colors">
              <Edit2 className="w-2.5 h-2.5" />
              <span>Editar</span>
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-[#F1F5F9] mt-1 m-0 group-hover:text-[#00E5FF] transition-colors">
          $ {Math.round(viaje?.presupuestoTotal || 0).toLocaleString()}
        </p>
        <span className="text-[10px] text-[#00E5FF] font-medium">{viaje?.monedaBase || 'COP'}</span>
      </div>

      {/* Total Consumido */}
      <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
        <WatermarkIcon icon={TrendingDown} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00FF85]" />
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
            {hasActiveFilters ? 'Consumido (Filtrado)' : 'Total Consumido'}
          </p>
          {hasActiveFilters && (
            <span className="text-[9px] font-bold bg-[#FFE500]/15 text-[#FFE500] px-1.5 py-0.2 rounded border border-[#FFE500]/30 uppercase">
              Filtro Activo
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-[#00FF85] mt-1 m-0">
          $ {Math.round(hasActiveFilters ? filteredTotals.cop : (balance?.totalGastadoCOP || 0)).toLocaleString()}
        </p>
        <span className="text-[10px] text-[#8492A6] font-medium">
          ~${Number(hasActiveFilters ? filteredTotals.usd : (balance?.totalGastadoUSD || 0)).toFixed(2)} USD
        </span>
      </div>

      {/* Dinero Requerido en Ruta */}
      <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
        <WatermarkIcon icon={CreditCard} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#FFE500]" />
        <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
          {hasActiveFilters ? 'En Ruta (Filtrado)' : 'Dinero en Ruta'}
        </p>
        <p className="text-xl font-bold text-[#FFE500] mt-1 m-0">
          $ {Math.round(hasActiveFilters ? filteredTotals.enRutaCOP : (balance?.dineroRequeridoEnRutaCOP || 0)).toLocaleString()}
        </p>
        <span className="text-[10px] text-[#8492A6] font-medium">Efectivo / Tarjetas durante el viaje</span>
      </div>

      {/* Costos Hundidos (Adelantados) */}
      <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
        <WatermarkIcon icon={ShieldCheck} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#B55FE6]" />
        <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
          {hasActiveFilters ? 'Adelantado (Filtrado)' : 'Costos Hundidos'}
        </p>
        <p className="text-xl font-bold text-[#B55FE6] mt-1 m-0">
          $ {Math.round(hasActiveFilters ? filteredTotals.adelCOP : (balance?.pagadoAdelantadoCOP || 0)).toLocaleString()}
        </p>
        <span className="text-[10px] text-[#8492A6] font-medium">Pre-pagados antes de viajar</span>
      </div>
    </div>
  );
}

export default BalanceKpiCards;

