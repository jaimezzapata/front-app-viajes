import React from 'react';
import { Banknote, TrendingDown, CreditCard, ShieldCheck, Edit2, Users } from 'lucide-react';
import WatermarkIcon from '../../../../components/WatermarkIcon';

export function BalanceKpiCards({ viaje, hasActiveFilters, filteredTotals, balance, onOpenConfigPresupuesto }) {
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
    ? (filteredTotals?.acompanantesCOP || Math.max(0, totalDesembolsadoCOP - porPersonaCOP))
    : (balance?.gastoAcompanantesCOP || Math.max(0, totalDesembolsadoCOP - porPersonaCOP));
  const adelCOP = hasActiveFilters ? (filteredTotals?.adelCOP || 0) : (balance?.pagadoAdelantadoCOP || 0);
  const adelTotalCOP = hasActiveFilters
    ? (filteredTotals?.adelTotalCOP || adelCOP)
    : (balance?.pagadoAdelantadoTotalCOP || adelCOP);

  const hasMultiPerson = Math.round(totalDesembolsadoCOP) > Math.round(miParteCOP) || (balance?.multiPersonGastosCount || 0) > 0;

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
          <span className="text-[10px] text-[#00E5FF] font-medium">{viaje?.monedaBase || 'COP'} (Por persona)</span>
        </div>

        {/* Total Consumido (Mi Presupuesto / Por Persona) */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={TrendingDown} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00FF85]" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
              {hasActiveFilters ? 'Consumido (Mi Parte)' : 'Consumido (Por Persona)'}
            </p>
            {hasActiveFilters && (
              <span className="text-[9px] font-bold bg-[#FFE500]/15 text-[#FFE500] px-1.5 py-0.2 rounded border border-[#FFE500]/30 uppercase">
                Filtro Activo
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-[#00FF85] mt-1 m-0">
            $ {Math.round(miParteCOP).toLocaleString()}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-[10px] text-[#8492A6] font-medium">
              ~${Number(miParteUSD).toFixed(2)} USD
            </span>
            {Math.round(totalDesembolsadoCOP) > Math.round(miParteCOP) && (
              <span className="text-[10px] font-bold text-[#FFE500] font-mono">
                Todo gastado TC: $ {Math.round(totalDesembolsadoCOP).toLocaleString()}
              </span>
            )}
          </div>
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
            $ {Math.round(adelCOP).toLocaleString()}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-[10px] text-[#8492A6] font-medium">Pre-pagados antes de viajar</span>
            {Math.round(adelTotalCOP) > Math.round(adelCOP) && (
              <span className="text-[10px] font-bold text-[#00E5FF] font-mono">
                Total TC pre-viaje: $ {Math.round(adelTotalCOP).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Banner de Auditoría: Todo lo Gastado (TC) vs Valor por Persona */}
      {hasMultiPerson && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0E121B] via-[#121928] to-[#0E121B] border border-[#00E5FF]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider m-0">
                Registro de Compras Compartidas (2 o 3 Personas en TC)
              </h4>
              <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                Se registra tanto el total descontado en tu tarjeta como el valor real por persona.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-[#080A0F]/80 border border-[#FFE500]/30">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FFE500] block">
                Todo lo Gastado (Total TC)
              </span>
              <span className="text-xs sm:text-sm font-extrabold font-mono text-[#F1F5F9]">
                $ {Math.round(totalDesembolsadoCOP).toLocaleString()} COP
              </span>
              <span className="text-[9px] text-[#8492A6] block font-mono">
                ~${Number(totalDesembolsadoUSD).toFixed(2)} USD
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#080A0F]/80 border border-[#00FF85]/30">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#00FF85] block">
                Valor por Persona (Mi Parte)
              </span>
              <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00FF85]">
                $ {Math.round(porPersonaCOP).toLocaleString()} COP
              </span>
              <span className="text-[9px] text-[#8492A6] block font-mono">
                1 persona
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#080A0F]/80 border border-[#00E5FF]/30">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#00E5FF] block">
                Parte Otros Pasajeros
              </span>
              <span className="text-xs sm:text-sm font-extrabold font-mono text-[#00E5FF]">
                $ {Math.round(acompanantesCOP).toLocaleString()} COP
              </span>
              <span className="text-[9px] text-[#8492A6] block font-mono">
                Reembolsable / Terceros
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BalanceKpiCards;

