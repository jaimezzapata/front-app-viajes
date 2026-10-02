import React, { useState, useEffect } from 'react';
import { Coins, ArrowRightLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  TRIP_CURRENCIES,
  getOtherCurrenciesConversions,
  formatCurrencyDisplay,
  syncLiveCurrencyRates,
  getLiveRatesInfo
} from '../utils/currencies';

/**
 * Selector de divisas con acceso directo de 1 click y sincronización de API
 */
export function CurrencySelector({
  value,
  onChange,
  label = 'Moneda',
  className = ''
}) {
  const currentCode = (value || 'COP').toUpperCase();
  const [ratesInfo, setRatesInfo] = useState(getLiveRatesInfo());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Sincronizar con API al montar
    syncLiveCurrencyRates().then(setRatesInfo);

    const handleUpdate = (e) => {
      if (e.detail) setRatesInfo(e.detail);
    };

    window.addEventListener('currency-rates-updated', handleUpdate);
    return () => window.removeEventListener('currency-rates-updated', handleUpdate);
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const updated = await syncLiveCurrencyRates();
      setRatesInfo(updated);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#8492A6] uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-[#00E5FF]" />
          {label} *
        </label>
        
        {/* Badge indicador de API en vivo */}
        <button
          type="button"
          onClick={handleManualSync}
          disabled={syncing}
          className="flex items-center gap-1 text-[10px] text-[#00FF85] bg-[#00FF85]/10 hover:bg-[#00FF85]/20 border border-[#00FF85]/30 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
          title="Actualizar tasas de cambio con la API"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Actualizando...' : 'API en Vivo'}</span>
        </button>
      </div>

      {/* Pastillas rápidas para las monedas del viaje */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {TRIP_CURRENCIES.map((curr) => {
          const isSelected = curr.code === currentCode;
          return (
            <button
              type="button"
              key={curr.code}
              onClick={() => onChange(curr.code)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#F1F5F9] shadow-sm shadow-[#00E5FF]/20 ring-1 ring-[#00E5FF]/50'
                  : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:border-[#8492A6]/40 hover:text-[#F1F5F9]'
              }`}
            >
              <span className="text-base leading-none mb-1">{curr.flag}</span>
              <span className="text-xs font-bold leading-tight">{curr.code}</span>
              <span className="text-[9px] text-[#8492A6] truncate max-w-full">
                {curr.symbol}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Widget que muestra en vivo la conversión a las demás monedas del viaje con tasas de la API
 */
export function LiveCurrencyConversions({
  amount,
  currency,
  title = 'Conversión automática a tus monedas de viaje'
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('currency-rates-updated', handleUpdate);
    return () => window.removeEventListener('currency-rates-updated', handleUpdate);
  }, []);

  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) {
    return null;
  }

  const conversions = getOtherCurrenciesConversions(num, currency);
  if (conversions.length === 0) return null;

  return (
    <div className="p-3 rounded-lg bg-[#0E121B] border border-[#1C2436] space-y-2 mt-2">
      <div className="flex items-center justify-between text-[11px] text-[#8492A6] font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-[#00FF85]">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {title}
        </span>
        <span className="text-[10px] text-[#00E5FF] font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#00FF85]" />
          Tasas de API en vivo
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {conversions.map((conv) => (
          <div
            key={conv.code}
            className="p-2 rounded-md bg-[#151B27]/80 border border-[#1C2436] hover:border-[#00FF85]/30 transition-colors"
          >
            <div className="flex items-center justify-between text-[10px] text-[#8492A6] mb-0.5">
              <span className="flex items-center gap-1">
                <span>{conv.flag}</span>
                <span className="font-bold text-[#F1F5F9]">{conv.code}</span>
              </span>
              <span className="text-[9px] text-[#8492A6] truncate">{conv.shortName}</span>
            </div>
            <div className="text-xs font-extrabold text-[#00FF85] tracking-tight">
              {conv.shortDisplay}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CurrencySelector;
