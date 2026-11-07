import React from 'react';
import { Coins } from 'lucide-react';
import {
  TRIP_CURRENCIES,
  getCurrenciesForTrip,
  convertCurrency,
  formatCurrencyDisplay
} from '../../../../utils/currencies';

export function BalanceMultidivisaGrid({ viaje, hasActiveFilters, filteredTotals, balance }) {
  const baseCOP = hasActiveFilters ? filteredTotals.cop : (balance?.totalGastadoCOP || 0);
  const currencies = viaje ? getCurrenciesForTrip(viaje) : TRIP_CURRENCIES;

  return (
    <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider m-0">
            {hasActiveFilters ? 'Total Filtrado en Divisas del Viaje' : 'Total Consumido en las Monedas de tu Viaje'}
          </h3>
        </div>
        <span className="text-[11px] text-[#8492A6]">
          Base de Cálculo: <strong>$ {Math.round(baseCOP).toLocaleString()} COP</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {currencies.map((curr) => {
          const amountInCurr = convertCurrency(baseCOP, 'COP', curr.code);
          return (
            <div
              key={curr.code}
              className="p-2.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85]/30 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-[#8492A6] mb-1">
                <span className="flex items-center gap-1 font-bold text-[#F1F5F9]">
                  <span>{curr.flag}</span>
                  <span>{curr.code}</span>
                </span>
                <span className="text-[9px] text-[#8492A6]">{curr.symbol}</span>
              </div>
              <p className="text-sm font-extrabold text-[#00FF85] m-0 truncate">
                {formatCurrencyDisplay(amountInCurr, curr.code, false)}
              </p>
              <span className="text-[9px] text-[#8492A6] block truncate mt-0.5">
                {curr.shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BalanceMultidivisaGrid;

