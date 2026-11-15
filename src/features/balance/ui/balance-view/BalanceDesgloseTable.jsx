import React from 'react';
import {
  CreditCard,
  AlertCircle,
  RotateCcw,
  Plane,
  Building,
  Utensils,
  Camera,
  ShoppingBag,
  Tag,
  Calendar,
  Users
} from 'lucide-react';
import MiniFlag from '../../../../components/MiniFlag';
import { cleanCountryText } from '../../../../utils/countries';
import { formatCurrencyDisplay } from '../../../../utils/currencies';
import { getGastoAmounts } from '../../../../utils/balance';

const CATEGORIA_ICONS = {
  transporte: Plane,
  vuelo: Plane,
  alojamiento: Building,
  hotel: Building,
  comida: Utensils,
  actividades: Camera,
  tour: Camera,
  compras: ShoppingBag,
  otros: Tag
};

export function BalanceDesgloseTable({
  filteredGastos = [],
  filteredTotals,
  hasActiveFilters,
  clearAllFilters
}) {
  const showTotalDesembolsado =
    Math.round(filteredTotals?.totalDesembolsadoCOP || 0) > Math.round(filteredTotals?.cop || 0);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] relative z-10 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#1C2436] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 text-[#FFE500]">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0 flex items-center gap-2">
              <span>Desglose Detallado de Pagos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#151B27] border border-[#1C2436] text-[#00E5FF] font-bold">
                {filteredGastos.length} {filteredGastos.length === 1 ? 'pago' : 'pagos'}
              </span>
            </h3>
            <p className="text-xs text-[#8492A6] m-0 mt-0.5">
              {hasActiveFilters ? 'Transacciones según los filtros aplicados' : 'Registro de todo lo gastado (TC) y valor por persona'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {showTotalDesembolsado && (
            <span className="text-xs font-bold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-2.5 py-1 rounded-lg font-mono">
              Total TC: $ {Math.round(filteredTotals.totalDesembolsadoCOP).toLocaleString()} COP
            </span>
          )}
          <span className="text-xs font-bold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/30 px-2.5 py-1 rounded-lg font-mono">
            {showTotalDesembolsado ? 'Por Persona: ' : ''}$ {Math.round(filteredTotals.cop).toLocaleString()} COP
          </span>
          <span className="text-xs font-bold text-[#8492A6] bg-[#151B27] border border-[#1C2436] px-2 py-1 rounded-lg font-mono">
            ~${filteredTotals.usd.toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* LISTADO DE PAGOS */}
      {filteredGastos.length === 0 ? (
        <div className="p-8 text-center bg-[#151B27]/40 rounded-xl border border-dashed border-[#1C2436]">
          <AlertCircle className="w-8 h-8 text-[#8492A6] mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-[#F1F5F9] m-0">No se encontraron pagos con estos filtros</p>
          <p className="text-xs text-[#8492A6] mt-1 m-0">Prueba cambiando las fechas, la categoría o seleccionando otro país/ciudad.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#FFE500] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          {/* Tabla para Desktop / Tablet */}
          <table className="w-full text-left text-xs border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-[#1C2436] text-[11px] font-bold uppercase tracking-wider text-[#8492A6] bg-[#151B27]/60">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Concepto / Comercio</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Personas</th>
                <th className="py-2.5 px-3">TC / Medio</th>
                <th className="py-2.5 px-3">Destino (País / Ciudad)</th>
                <th className="py-2.5 px-3">Modalidad</th>
                <th className="py-2.5 px-3 text-right">Total Gastado (TC)</th>
                <th className="py-2.5 px-3 text-right">Por Persona (COP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2436]/60">
              {filteredGastos.map((g) => {
                const Icon = CATEGORIA_ICONS[g.categoria?.toLowerCase()] || Tag;
                const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
                const dateStr = g.fechaGasto ? new Date(g.fechaGasto).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                const amounts = getGastoAmounts(g);

                return (
                  <tr key={g.id} className="hover:bg-[#151B27]/50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-[#8492A6] font-medium">
                      {dateStr}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#F1F5F9] max-w-xs truncate" title={g.concepto}>
                      {g.concepto || 'Sin concepto'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#151B27] border border-[#1C2436] text-[#CBD5E1]">
                        <Icon className="w-3 h-3 text-[#00E5FF]" />
                        {g.categoria || 'otros'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          amounts.isMultiPerson
                            ? 'bg-[#FFE500]/15 border border-[#FFE500]/40 text-[#FFE500]'
                            : 'bg-[#151B27] border border-[#1C2436] text-[#8492A6]'
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        {amounts.cantidadPersonas === 1 ? '1 Persona' : `${amounts.cantidadPersonas} Personas`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {g.tarjetaCredito ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20" title={`Pagado con ${g.tarjetaCredito}`}>
                          <CreditCard className="w-3 h-3 text-[#00E5FF] shrink-0" />
                          <span className="max-w-[130px] truncate">{g.tarjetaCredito}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8492A6] italic">Efectivo / Sin TC</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1]">
                        <MiniFlag country={g.countryName} code={g.countryCode} className="w-3.5 h-2.5" />
                        <span className="font-medium">
                          {g.cityName ? `${g.cityName}${g.countryName ? `, ${cleanCountryText(g.countryName)}` : ''}` : cleanCountryText(g.countryName)}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 flex-wrap">
                        {g.pagadoAdelantado ? (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#B55FE6]/15 border border-[#B55FE6]/30 text-[#B55FE6]">
                            Pre-Viaje
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 border border-[#00FF85]/30 text-[#00FF85]">
                            En Ruta
                          </span>
                        )}
                        {g.noComputar && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/30 text-[#FF2E55]">
                            Terceros
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-xs">
                      <div className="flex flex-col items-end">
                        <span className={amounts.isMultiPerson ? 'font-bold text-[#FFE500]' : 'text-[#CBD5E1]'}>
                          $ {Math.round(amounts.montoTotalCOP || 0).toLocaleString()} COP
                        </span>
                        {origCurr !== 'COP' && (
                          <span className="text-[10px] text-[#8492A6]">
                            {formatCurrencyDisplay(amounts.montoTotalOrig, origCurr, false)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-[#00FF85] font-mono text-xs">
                      <div className="flex flex-col items-end">
                        <span>$ {Math.round(amounts.montoPorPersonaCOP || 0).toLocaleString()}</span>
                        {amounts.isMultiPerson && (
                          <span className="text-[9px] text-[#00E5FF] font-normal">
                            c/u ({amounts.cantidadPersonas}p)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Tarjetas Mobile */}
          <div className="md:hidden space-y-2.5 px-4 sm:px-0">
            {filteredGastos.map((g) => {
              const Icon = CATEGORIA_ICONS[g.categoria?.toLowerCase()] || Tag;
              const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
              const dateStr = g.fechaGasto ? new Date(g.fechaGasto).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '-';
              const amounts = getGastoAmounts(g);

              return (
                <div key={g.id} className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F1F5F9] m-0 truncate">{g.concepto || 'Sin concepto'}</p>
                      <p className="text-[10px] text-[#8492A6] m-0 mt-0.5 flex items-center gap-1 flex-wrap">
                        <Calendar className="w-3 h-3 text-[#8492A6]" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <MiniFlag country={g.countryName} code={g.countryCode} className="w-3 h-2" />
                        <span>{g.cityName ? `${g.cityName}${g.countryName ? `, ${cleanCountryText(g.countryName)}` : ''}` : cleanCountryText(g.countryName)}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#00FF85] m-0 font-mono">
                        $ {Math.round(amounts.montoPorPersonaCOP || 0).toLocaleString()}
                        {amounts.isMultiPerson ? ' /pers.' : ''}
                      </p>
                      {amounts.isMultiPerson && (
                        <span className="text-[10px] text-[#FFE500] font-bold block font-mono">
                          Total ({amounts.cantidadPersonas}p): $ {Math.round(amounts.montoTotalCOP || 0).toLocaleString()}
                        </span>
                      )}
                      {origCurr !== 'COP' && (
                        <span className="text-[10px] text-[#8492A6] block font-mono">
                          {formatCurrencyDisplay(amounts.montoTotalOrig, origCurr, false)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1C2436]/60 pt-2 text-[10px] flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-bold uppercase text-[#8492A6]">
                        <Icon className="w-3 h-3 text-[#00E5FF]" />
                        {g.categoria || 'otros'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                          amounts.isMultiPerson
                            ? 'bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/30'
                            : 'bg-[#0E121B] text-[#8492A6] border border-[#1C2436]'
                        }`}
                      >
                        <Users className="w-2.5 h-2.5" />
                        {amounts.cantidadPersonas === 1 ? '1p' : `${amounts.cantidadPersonas}p`}
                      </span>
                      {g.tarjetaCredito && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.2 rounded border border-[#00E5FF]/20">
                          <CreditCard className="w-2.5 h-2.5 text-[#00E5FF]" />
                          <span className="max-w-[110px] truncate">{g.tarjetaCredito}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {g.pagadoAdelantado ? (
                        <span className="px-1.5 py-0.2 rounded bg-[#B55FE6]/15 text-[#B55FE6] font-bold uppercase text-[9px]">
                          Pre-Viaje
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-[#00FF85]/15 text-[#00FF85] font-bold uppercase text-[9px]">
                          En Ruta
                        </span>
                      )}
                      {g.noComputar && (
                        <span className="px-1.5 py-0.2 rounded bg-[#FF2E55]/15 text-[#FF2E55] font-bold uppercase text-[9px]">
                          Terceros
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BalanceDesgloseTable;

