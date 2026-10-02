/**
 * Definición y motor de conversión multidivisa para el viaje con sincronización de API en tiempo real
 * Monedas del viaje:
 * - COP: Pesos colombianos 🇨🇴
 * - EUR: Euros 🇪🇺
 * - KRW: Won surcoreano (Corea del Sur) 🇰🇷
 * - JPY: Yenes japoneses 🇯🇵
 * - AED: Dírham de Abu Dhabi / EAU 🇦🇪
 * - USD: Dólar estadounidense (Referencia) 🇺🇸
 */

const STORAGE_KEY = 'app_viajes_live_currency_rates_v1';

// Tasas iniciales de respaldo (1 USD = X unidades)
const DEFAULT_RATES_FROM_USD = {
  USD: 1.0,
  COP: 3333.96,
  EUR: 0.8818,
  KRW: 1355.84,
  JPY: 157.30,
  AED: 3.6725
};

export const TRIP_CURRENCIES = [
  {
    code: 'COP',
    name: 'Pesos Colombianos',
    shortName: 'Peso Colombiano',
    country: 'Colombia',
    symbol: '$',
    flag: '🇨🇴',
    decimals: 0
  },
  {
    code: 'EUR',
    name: 'Euros',
    shortName: 'Euro',
    country: 'Europa',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2
  },
  {
    code: 'KRW',
    name: 'Moneda Corea del Sur (Won)',
    shortName: 'Won Surcoreano',
    country: 'Corea del Sur',
    symbol: '₩',
    flag: '🇰🇷',
    decimals: 0
  },
  {
    code: 'JPY',
    name: 'Yenes Japoneses',
    shortName: 'Yen Japonés',
    country: 'Japón',
    symbol: '¥',
    flag: '🇯🇵',
    decimals: 0
  },
  {
    code: 'AED',
    name: 'Moneda Abu Dhabi (Dírham)',
    shortName: 'Dírham EAU',
    country: 'Abu Dhabi / EAU',
    symbol: 'AED',
    flag: '🇦🇪',
    decimals: 2
  },
  {
    code: 'USD',
    name: 'Dólar Estadounidense',
    shortName: 'Dólar USD',
    country: 'Estados Unidos',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2
  }
];

export const CURRENCY_MAP = TRIP_CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {});

// Almacén en memoria de tasas activas
let activeRates = { ...DEFAULT_RATES_FROM_USD };
let lastSyncDate = null;
let syncSource = 'fallback';

// Cargar caché local al importar si existe
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.rates && parsed.rates.USD) {
        activeRates = { ...DEFAULT_RATES_FROM_USD, ...parsed.rates };
        lastSyncDate = parsed.lastUpdated ? new Date(parsed.lastUpdated) : null;
        syncSource = parsed.source || 'cache';
      }
    }
  } catch (e) {
    // Ignorar error de parsing
  }
}

/**
 * Obtener el estado actual de las tasas de cambio
 */
export function getLiveRatesInfo() {
  return {
    rates: { ...activeRates },
    lastUpdated: lastSyncDate,
    source: syncSource,
    formattedLastUpdated: lastSyncDate
      ? lastSyncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null
  };
}

/**
 * Sincronizar tasas de cambio con la API externa
 * Intenta primero el endpoint del backend (/api/divisas), y de respaldo la API pública directa
 */
export async function syncLiveCurrencyRates() {
  let fetchedRates = null;
  let source = 'live-api';

  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${apiBase}/divisas`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeout);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && json.data && json.data.rates) {
        fetchedRates = json.data.rates;
        source = 'backend-api';
      }
    }
  } catch (err) {
    // Continuar con fallback directo
  }

  // Fallback directo a open.er-api.com si el backend no respondió
  if (!fetchedRates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal }).catch(() => null);
      clearTimeout(timeout);

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json && json.rates) {
          fetchedRates = json.rates;
          source = 'open-er-api';
        }
      }
    } catch (err) {
      // Ignorar error
    }
  }

  if (fetchedRates) {
    activeRates = {
      ...DEFAULT_RATES_FROM_USD,
      ...fetchedRates,
      USD: 1.0
    };
    lastSyncDate = new Date();
    syncSource = source;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            rates: activeRates,
            lastUpdated: lastSyncDate.toISOString(),
            source
          })
        );
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('currency-rates-updated', { detail: getLiveRatesInfo() }));
    }
  }

  return getLiveRatesInfo();
}

/**
 * Redondea y formatea el valor numérico según la divisa
 */
export function roundCurrencyAmount(amount, currencyCode) {
  const code = (currencyCode || 'COP').toUpperCase();
  const meta = CURRENCY_MAP[code] || { decimals: 2 };
  if (meta.decimals === 0) {
    return Math.round(Number(amount) || 0);
  }
  return Number((Number(amount) || 0).toFixed(meta.decimals));
}

/**
 * Convierte un monto de una divisa origen a una divisa destino usando las tasas de la API
 */
export function convertCurrency(amount, fromCode, toCode) {
  const num = Number(amount) || 0;
  const from = (fromCode || 'COP').toUpperCase();
  const to = (toCode || 'COP').toUpperCase();

  if (from === to) {
    return roundCurrencyAmount(num, to);
  }

  const rateFrom = activeRates[from] || DEFAULT_RATES_FROM_USD[from] || 1.0;
  const rateTo = activeRates[to] || DEFAULT_RATES_FROM_USD[to] || 1.0;

  // Conversión cruzada directa: num * (rateTo / rateFrom)
  const converted = num * (rateTo / rateFrom);

  return roundCurrencyAmount(converted, to);
}

/**
 * Formatea un monto con símbolo y separadores de miles
 */
export function formatCurrencyDisplay(amount, currencyCode, includeCode = true) {
  const code = (currencyCode || 'COP').toUpperCase();
  const meta = CURRENCY_MAP[code] || { symbol: '$', decimals: 2, code };
  const num = Number(amount) || 0;

  const formatted = num.toLocaleString('es-CO', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals
  });

  if (code === 'AED') {
    return includeCode ? `${formatted} AED` : formatted;
  }
  return includeCode ? `${meta.symbol} ${formatted} ${code}` : `${meta.symbol} ${formatted}`;
}

/**
 * Retorna las conversiones a todas las DEMÁS monedas del viaje usando la API
 */
export function getOtherCurrenciesConversions(amount, currentCode) {
  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) return [];

  const current = (currentCode || 'COP').toUpperCase();

  return TRIP_CURRENCIES
    .filter(c => c.code !== current)
    .map(c => {
      const convertedVal = convertCurrency(num, current, c.code);
      return {
        ...c,
        amount: convertedVal,
        display: formatCurrencyDisplay(convertedVal, c.code, true),
        shortDisplay: `${c.symbol} ${convertedVal.toLocaleString('es-CO', {
          minimumFractionDigits: c.decimals,
          maximumFractionDigits: c.decimals
        })}`
      };
    });
}
