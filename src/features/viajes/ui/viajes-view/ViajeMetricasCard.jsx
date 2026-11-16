import React from 'react';
import { DollarSign, TrendingUp, Sparkles, Ban, CheckCircle2 } from 'lucide-react';

export function ViajeMetricasCard({ tripMetrics }) {
  if (!tripMetrics) return null;

  const hasFueraPresupuesto = (tripMetrics.totalFueraPresupuestoCOP || 0) > 0;

  return (
    <section className="space-y-3 relative z-10">
      <div className={`grid grid-cols-2 ${hasFueraPresupuesto ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-2.5 sm:gap-3.5`}>
        {/* Presupuesto Total */}
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3.5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#FFE500]" />
            Presupuesto (Sin Tiquetes)
          </p>
          <p className="text-lg sm:text-xl font-black text-[#FFE500] mt-0.5 m-0 truncate">
            ${tripMetrics.presupuesto.toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
            Moneda Base: {tripMetrics.monedaBase}
          </span>
        </div>

        {/* Total Gastado en Presupuesto (1 Persona) */}
        <div className="bg-[#0E121B] border border-[#00FF85]/30 rounded-xl p-3.5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#00FF85] m-0 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#00FF85]" />
            Gastado En Presupuesto (1p)
          </p>
          <p className="text-lg sm:text-xl font-black text-[#00FF85] mt-0.5 m-0 truncate">
            ${Math.round(tripMetrics.totalGastadoCOP).toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
            {tripMetrics.gastosComputablesCount} registros incluidos
            {Math.round(tripMetrics.totalDesembolsadoCOP || 0) > Math.round(tripMetrics.totalGastadoCOP || 0) &&
              ` • TC (2p): $${Math.round(tripMetrics.totalDesembolsadoCOP).toLocaleString('es-CO')}`}
          </span>
        </div>

        {/* Fuera de Presupuesto (Tiquetes Salida y Llegada) */}
        {hasFueraPresupuesto && (
          <div className="bg-[#0E121B] border border-[#FF2E55]/30 rounded-xl p-3.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#FF2E55] m-0 flex items-center gap-1">
              <Ban className="w-3 h-3 text-[#FF2E55]" />
              Fuera de Presupuesto
            </p>
            <p className="text-lg sm:text-xl font-black text-[#FF2E55] mt-0.5 m-0 truncate">
              ${Math.round(tripMetrics.totalFueraPresupuestoCOP).toLocaleString('es-CO')}
            </p>
            <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
              Tiquetes salida/llegada (No suma al ppto)
            </span>
          </div>
        )}

        {/* Total Gastado en USD (En Presupuesto) */}
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3.5">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#B55FE6]" />
            En Presupuesto (USD)
          </p>
          <p className="text-lg sm:text-xl font-black text-[#B55FE6] mt-0.5 m-0 truncate">
            ${tripMetrics.totalGastadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
            Equivalente de lo incluido
          </span>
        </div>

        {/* Saldo Disponible */}
        <div className={`bg-[#0E121B] border rounded-xl p-3.5 ${tripMetrics.isOverBudget ? 'border-[#FF2E55]' : 'border-[#1C2436]'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
              Saldo Disponible
            </p>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${tripMetrics.isOverBudget ? 'text-[#FF2E55] bg-[#FF2E55]/10' : 'text-[#00FF85] bg-[#00FF85]/10'}`}>
              {tripMetrics.isOverBudget ? `${tripMetrics.porcentajePresupuesto}%` : `${Math.max(0, 100 - tripMetrics.porcentajePresupuesto)}% libre`}
            </span>
          </div>
          <p className={`text-lg sm:text-xl font-black mt-0.5 m-0 truncate ${tripMetrics.isOverBudget ? 'text-[#FF2E55]' : 'text-[#00FF85]'}`}>
            ${Math.round(tripMetrics.saldoRestante).toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
            {tripMetrics.isOverBudget ? '⚠️ Presupuesto excedido' : 'Dentro de lo planeado'}
          </span>
        </div>
      </div>

      {/* Barra Visual de Ejecución del Presupuesto */}
      <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8492A6] font-medium flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3 h-3 text-[#00E5FF]" />
            Ejecución Presupuestal
          </span>
          <span className="text-[#F1F5F9] font-bold text-[11px]">
            {tripMetrics.porcentajePresupuesto}% de ${tripMetrics.presupuesto.toLocaleString('es-CO')} {tripMetrics.monedaBase}
          </span>
        </div>
        <div className="w-full bg-[#151B27] h-2 rounded-full overflow-hidden border border-[#1C2436]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              tripMetrics.isOverBudget
                ? 'bg-[#FF2E55]'
                : tripMetrics.porcentajePresupuesto > 85
                ? 'bg-[#FFB800]'
                : 'bg-gradient-to-r from-[#00E5FF] to-[#00FF85]'
            }`}
            style={{ width: `${Math.min(100, tripMetrics.porcentajePresupuesto)}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export default ViajeMetricasCard;

