import React, { useState, useEffect, useRef } from 'react';
import { Coins, ArrowRightLeft, RefreshCw, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import {
  TRIP_CURRENCIES,
  GLOBAL_CURRENCIES,
  CURRENCY_MAP,
  getCurrenciesForTrip,
  getOtherCurrenciesConversions,
  getExactExchangeRate,
  formatCurrencyDisplay,
  syncLiveCurrencyRates,
  getLiveRatesInfo
} from '../utils/currencies';

/**
 * Selector de divisas dinámico según la ruta del viaje, con acceso directo y selector global
 */
export function CurrencySelector({
  value,
  onChange,
  viaje = null,
  currencies = null,
  label = 'Moneda',
  className = '',
  showAllOption = true
}) {
  const currentCode = (value || 'COP').toUpperCase();
  const [ratesInfo, setRatesInfo] = useState(getLiveRatesInfo());
  const [syncing, setSyncing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Sincronizar con API al montar
    syncLiveCurrencyRates().then(setRatesInfo);

    const handleUpdate = (e) => {
      if (e.detail) setRatesInfo(e.detail);
    };

    window.addEventListener('currency-rates-updated', handleUpdate);
    return () => window.removeEventListener('currency-rates-updated', handleUpdate);
  }, []);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Calcular las monedas dinámicas según la ruta del viaje
  const dynamicCurrencies = React.useMemo(() => {
    let list = [];
    if (Array.isArray(currencies) && currencies.length > 0) {
      list = [...currencies];
    } else if (viaje) {
      list = getCurrenciesForTrip(viaje);
    } else {
      list = [...TRIP_CURRENCIES];
    }

    // Asegurar que la moneda seleccionada actualmente siempre esté visible en las pastillas
    if (currentCode && !list.some(c => c.code === currentCode)) {
      const activeObj = CURRENCY_MAP[currentCode];
      if (activeObj) list.push(activeObj);
    }

    return list;
  }, [viaje, currencies, currentCode]);

  // Lista de monedas filtradas para el buscador "+ Otra Divisa"
  const filteredAllCurrencies = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return GLOBAL_CURRENCIES;
    return GLOBAL_CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectFromDropdown = (code) => {
    onChange(code);
    setIsDropdownOpen(false);
    setSearchQuery('');
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
          title="Actualizar tasas de cambio con la API en tiempo real"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Actualizando...' : 'API en Vivo'}</span>
        </button>
      </div>

      {/* Pastillas dinámicas para las monedas de la ruta */}
      <div className="flex flex-wrap gap-1.5 min-w-0 relative" ref={dropdownRef}>
        {dynamicCurrencies.map((curr) => {
          const isSelected = curr.code === currentCode;
          return (
            <button
              type="button"
              key={curr.code}
              onClick={() => onChange(curr.code)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-left min-w-[70px] ${
                isSelected
                  ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#F1F5F9] shadow-sm shadow-[#00E5FF]/20 ring-1 ring-[#00E5FF]/50'
                  : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:border-[#8492A6]/40 hover:text-[#F1F5F9]'
              }`}
            >
              <span className="text-sm leading-none">{curr.flag}</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{curr.code}</span>
                <span className="text-[9px] text-[#8492A6] leading-none">{curr.symbol}</span>
              </div>
            </button>
          );
        })}

        {/* Botón "+ Otra Divisa" para seleccionar cualquier divisa mundial */}
        {showAllOption && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isDropdownOpen
                  ? 'bg-[#1C2436] border-[#00E5FF] text-[#00E5FF]'
                  : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] hover:border-[#8492A6]/40'
              }`}
              title="Elegir entre todas las divisas mundiales"
            >
              <span>+ Otra</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180 text-[#00E5FF]' : ''}`} />
            </button>

            {/* Menú desplegable flotante de todas las divisas mundiales */}
            {isDropdownOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-50 w-64 bg-[#0B0F17]/98 backdrop-blur-md border border-[#1C2436] rounded-xl shadow-2xl p-2 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Buscar divisa o país..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredAllCurrencies.map((c) => {
                    const isSelected = c.code === currentCode;
                    return (
                      <button
                        type="button"
                        key={c.code}
                        onClick={() => handleSelectFromDropdown(c.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold'
                            : 'hover:bg-[#151B27] text-[#CBD5E1]'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate mr-2">
                          <span>{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </span>
                        <span className="font-bold shrink-0">{c.code}</span>
                      </button>
                    );
                  })}
                  {filteredAllCurrencies.length === 0 && (
                    <div className="p-2 text-center text-xs text-[#8492A6]">
                      Sin resultados
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
  viaje = null,
  title = 'Conversión en vivo a monedas de la ruta'
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

  const routeCurrencies = viaje ? getCurrenciesForTrip(viaje) : null;
  const conversions = getOtherCurrenciesConversions(num, currency, routeCurrencies);
  const currentCode = (currency || 'COP').toUpperCase();
  const rateToCOP = getExactExchangeRate(currentCode, 'COP');

  return (
    <div className="p-3 rounded-lg bg-[#0E121B] border border-[#1C2436] space-y-2 mt-2">
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-[#00FF85]">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {title}
        </span>
        <span className="text-[10px] text-[#00E5FF] font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#00FF85]" />
          Tasa exacta: 1 {currentCode} = ${rateToCOP.toLocaleString('es-CO', { minimumFractionDigits: currentCode === 'JPY' || currentCode === 'KRW' ? 4 : 2, maximumFractionDigits: 4 })} COP
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-0">
        {conversions.map((conv) => (
          <div
            key={conv.code}
            className="p-2 rounded-md bg-[#151B27]/80 border border-[#1C2436] hover:border-[#00FF85]/30 transition-colors min-w-0 overflow-hidden"
          >
            <div className="flex items-center justify-between text-[10px] text-[#8492A6] mb-0.5 gap-1 min-w-0">
              <span className="flex items-center gap-1 shrink-0">
                <span>{conv.flag}</span>
                <span className="font-bold text-[#F1F5F9]">{conv.code}</span>
              </span>
              <span className="text-[9px] text-[#8492A6] truncate">{conv.shortName}</span>
            </div>
            <div className="text-xs font-extrabold text-[#00FF85] tracking-tight truncate">
              {conv.shortDisplay}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CurrencySelector;
