/**
 * Motor de Divisas Dinámico y Escalable Global
 * 
 * Soporta cualquier país del mundo (Brasil -> BRL, México -> MXN, Japón -> JPY, etc.)
 * Genera divisas dinámicamente según la ruta del viaje (origen, escalas, destinos).
 * Captura y congela la tasa de cambio exacta en el instante de la compra.
 */

import { detectCountry } from './countries.js';

const STORAGE_KEY = 'app_viajes_live_currency_rates_v2';

// Catálogo Global de Divisas con Metadatos, Símbolos y Banderas
export const GLOBAL_CURRENCIES = [
  { code: 'COP', name: 'Pesos Colombianos', shortName: 'Peso Colombiano', country: 'Colombia', symbol: '$', flag: '🇨🇴', decimals: 0, countryCode: 'CO' },
  { code: 'BRL', name: 'Real Brasileño', shortName: 'Real Brasileño', country: 'Brasil', symbol: 'R$', flag: '🇧🇷', decimals: 2, countryCode: 'BR' },
  { code: 'MXN', name: 'Peso Mexicano', shortName: 'Peso Mexicano', country: 'México', symbol: '$', flag: '🇲🇽', decimals: 2, countryCode: 'MX' },
  { code: 'USD', name: 'Dólar Estadounidense', shortName: 'Dólar USD', country: 'Estados Unidos', symbol: '$', flag: '🇺🇸', decimals: 2, countryCode: 'US' },
  { code: 'EUR', name: 'Euros', shortName: 'Euro', country: 'Europa', symbol: '€', flag: '🇪🇺', decimals: 2, countryCode: 'ES' },
  { code: 'JPY', name: 'Yenes Japoneses', shortName: 'Yen Japonés', country: 'Japón', symbol: '¥', flag: '🇯🇵', decimals: 0, countryCode: 'JP' },
  { code: 'KRW', name: 'Won Surcoreano', shortName: 'Won Surcoreano', country: 'Corea del Sur', symbol: '₩', flag: '🇰🇷', decimals: 0, countryCode: 'KR' },
  { code: 'AED', name: 'Dírham de Emiratos', shortName: 'Dírham EAU', country: 'Emiratos Árabes / Abu Dhabi', symbol: 'AED', flag: '🇦🇪', decimals: 2, countryCode: 'AE' },
  { code: 'GBP', name: 'Libra Esterlina', shortName: 'Libra', country: 'Reino Unido', symbol: '£', flag: '🇬🇧', decimals: 2, countryCode: 'GB' },
  { code: 'CHF', name: 'Franco Suizo', shortName: 'Franco Suizo', country: 'Suiza', symbol: 'CHF', flag: '🇨🇭', decimals: 2, countryCode: 'CH' },
  { code: 'CAD', name: 'Dólar Canadiense', shortName: 'Dólar CAD', country: 'Canadá', symbol: '$', flag: '🇨🇦', decimals: 2, countryCode: 'CA' },
  { code: 'AUD', name: 'Dólar Australiano', shortName: 'Dólar AUD', country: 'Australia', symbol: '$', flag: '🇦🇺', decimals: 2, countryCode: 'AU' },
  { code: 'NZD', name: 'Dólar Neozelandés', shortName: 'Dólar NZD', country: 'Nueva Zelanda', symbol: '$', flag: '🇳🇿', decimals: 2, countryCode: 'NZ' },
  { code: 'ARS', name: 'Peso Argentino', shortName: 'Peso Argentino', country: 'Argentina', symbol: '$', flag: '🇦🇷', decimals: 2, countryCode: 'AR' },
  { code: 'CLP', name: 'Peso Chileno', shortName: 'Peso Chileno', country: 'Chile', symbol: '$', flag: '🇨🇱', decimals: 0, countryCode: 'CL' },
  { code: 'PEN', name: 'Sol Peruano', shortName: 'Sol Peruano', country: 'Perú', symbol: 'S/', flag: '🇵🇪', decimals: 2, countryCode: 'PE' },
  { code: 'UYU', name: 'Peso Uruguayo', shortName: 'Peso Uruguayo', country: 'Uruguay', symbol: '$', flag: '🇺🇾', decimals: 2, countryCode: 'UY' },
  { code: 'TRY', name: 'Lira Turca', shortName: 'Lira Turca', country: 'Turquía', symbol: '₺', flag: '🇹🇷', decimals: 2, countryCode: 'TR' },
  { code: 'CNY', name: 'Yuan Chino', shortName: 'Yuan Chino', country: 'China', symbol: '¥', flag: '🇨🇳', decimals: 2, countryCode: 'CN' },
  { code: 'THB', name: 'Baht Tailandés', shortName: 'Baht Tailandés', country: 'Tailandia', symbol: '฿', flag: '🇹🇭', decimals: 2, countryCode: 'TH' },
  { code: 'VND', name: 'Dong Vietnamita', shortName: 'Dong', country: 'Vietnam', symbol: '₫', flag: '🇻🇳', decimals: 0, countryCode: 'VN' },
  { code: 'IDR', name: 'Rupia Indonesia', shortName: 'Rupia Indonesia', country: 'Indonesia', symbol: 'Rp', flag: '🇮🇩', decimals: 0, countryCode: 'ID' },
  { code: 'SGD', name: 'Dólar de Singapur', shortName: 'Dólar Singapur', country: 'Singapur', symbol: '$', flag: '🇸🇬', decimals: 2, countryCode: 'SG' },
  { code: 'MYR', name: 'Ringgit Malayo', shortName: 'Ringgit', country: 'Malasia', symbol: 'RM', flag: '🇲🇾', decimals: 2, countryCode: 'MY' },
  { code: 'INR', name: 'Rupia India', shortName: 'Rupia India', country: 'India', symbol: '₹', flag: '🇮🇳', decimals: 2, countryCode: 'IN' },
  { code: 'PHP', name: 'Peso Filipino', shortName: 'Peso Filipino', country: 'Filipinas', symbol: '₱', flag: '🇵🇭', decimals: 2, countryCode: 'PH' },
  { code: 'EGP', name: 'Libra Egipcia', shortName: 'Libra Egipcia', country: 'Egipto', symbol: 'E£', flag: '🇪🇬', decimals: 2, countryCode: 'EG' },
  { code: 'MAD', name: 'Dírham Marroquí', shortName: 'Dírham Marroquí', country: 'Marruecos', symbol: 'MAD', flag: '🇲🇦', decimals: 2, countryCode: 'MA' },
  { code: 'ZAR', name: 'Rand Sudafricano', shortName: 'Rand', country: 'Sudáfrica', symbol: 'R', flag: '🇿🇦', decimals: 2, countryCode: 'ZA' },
  { code: 'QAR', name: 'Riyal Catarí', shortName: 'Riyal Catarí', country: 'Catar', symbol: 'QR', flag: '🇶🇦', decimals: 2, countryCode: 'QA' },
  { code: 'SAR', name: 'Riyal Saudí', shortName: 'Riyal Saudí', country: 'Arabia Saudita', symbol: 'SR', flag: '🇸🇦', decimals: 2, countryCode: 'SA' },
  { code: 'SEK', name: 'Corona Sueca', shortName: 'Corona Sueca', country: 'Suecia', symbol: 'kr', flag: '🇸🇪', decimals: 2, countryCode: 'SE' },
  { code: 'NOK', name: 'Corona Noruega', shortName: 'Corona Noruega', country: 'Noruega', symbol: 'kr', flag: '🇳🇴', decimals: 2, countryCode: 'NO' },
  { code: 'DKK', name: 'Corona Danesa', shortName: 'Corona Danesa', country: 'Dinamarca', symbol: 'kr', flag: '🇩🇰', decimals: 2, countryCode: 'DK' },
  { code: 'PLN', name: 'Złoty Polaco', shortName: 'Złoty', country: 'Polonia', symbol: 'zł', flag: '🇵🇱', decimals: 2, countryCode: 'PL' },
  { code: 'CZK', name: 'Corona Checa', shortName: 'Corona Checa', country: 'República Checa', symbol: 'Kč', flag: '🇨🇿', decimals: 2, countryCode: 'CZ' },
  { code: 'HUF', name: 'Forinto Húngaro', shortName: 'Forinto', country: 'Hungría', symbol: 'Ft', flag: '🇭🇺', decimals: 0, countryCode: 'HU' },
  { code: 'ILS', name: 'Nuevo Shekel', shortName: 'Shekel', country: 'Israel', symbol: '₪', flag: '🇮🇱', decimals: 2, countryCode: 'IL' },
  { code: 'DOP', name: 'Peso Dominicano', shortName: 'Peso Dominicano', country: 'República Dominicana', symbol: 'RD$', flag: '🇩🇴', decimals: 2, countryCode: 'DO' },
  { code: 'CRC', name: 'Colón Costarricense', shortName: 'Colón', country: 'Costa Rica', symbol: '₡', flag: '🇨🇷', decimals: 0, countryCode: 'CR' },
  { code: 'BOB', name: 'Boliviano', shortName: 'Boliviano', country: 'Bolivia', symbol: 'Bs.', flag: '🇧🇴', decimals: 2, countryCode: 'BO' },
  { code: 'PYG', name: 'Guaraní Paraguayo', shortName: 'Guaraní', country: 'Paraguay', symbol: '₲', flag: '🇵🇾', decimals: 0, countryCode: 'PY' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', shortName: 'Quetzal', country: 'Guatemala', symbol: 'Q', flag: '🇬🇹', decimals: 2, countryCode: 'GT' }
];

export const CURRENCY_MAP = GLOBAL_CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {});

// Mapeo exhaustivo de códigos ISO Alpha-2 a Divisas Oficiales
export const COUNTRY_TO_CURRENCY_MAP = {
  CO: 'COP',
  BR: 'BRL',
  MX: 'MXN',
  US: 'USD',
  ES: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  PT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  JP: 'JPY',
  KR: 'KRW',
  AE: 'AED',
  GB: 'GBP',
  CH: 'CHF',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  AR: 'ARS',
  CL: 'CLP',
  PE: 'PEN',
  UY: 'UYU',
  TR: 'TRY',
  CN: 'CNY',
  TH: 'THB',
  VN: 'VND',
  ID: 'IDR',
  SG: 'SGD',
  MY: 'MYR',
  IN: 'INR',
  PH: 'PHP',
  EG: 'EGP',
  MA: 'MAD',
  ZA: 'ZAR',
  QA: 'QAR',
  SA: 'SAR',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  IL: 'ILS',
  DO: 'DOP',
  CR: 'CRC',
  PA: 'USD',
  EC: 'USD',
  BO: 'BOB',
  PY: 'PYG',
  GT: 'GTQ',
  HN: 'USD',
  NI: 'USD',
  CU: 'USD'
};

// Monedas iniciales por defecto para retrocompatibilidad
export const TRIP_CURRENCIES = [
  CURRENCY_MAP['COP'],
  CURRENCY_MAP['USD'],
  CURRENCY_MAP['EUR'],
  CURRENCY_MAP['BRL'],
  CURRENCY_MAP['MXN'],
  CURRENCY_MAP['JPY']
];

// Tasas iniciales de respaldo seguras (1 USD = X unidades)
const DEFAULT_RATES_FROM_USD = {
  USD: 1.0,
  COP: 3199.58,
  BRL: 4.98,
  MXN: 17.98,
  EUR: 0.889,
  JPY: 158.15,
  KRW: 1338.92,
  AED: 3.6725,
  GBP: 0.754,
  CHF: 0.832,
  CAD: 1.36,
  AUD: 1.52,
  ARS: 880.0,
  CLP: 940.0,
  PEN: 3.75,
  UYU: 38.5,
  TRY: 32.5,
  CNY: 7.23,
  THB: 36.5,
  VND: 25400.0,
  IDR: 16200.0,
  SGD: 1.35,
  MYR: 4.72,
  INR: 83.5,
  PHP: 58.0,
  EGP: 47.8,
  MAD: 10.0,
  ZAR: 18.5,
  QAR: 3.64,
  SAR: 3.75,
  SEK: 10.5,
  NOK: 10.7,
  DKK: 6.9,
  PLN: 3.95,
  CZK: 23.2,
  HUF: 365.0,
  ILS: 3.7
};

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
  } catch {}
}

/**
 * Detecta la moneda oficial para cualquier país (por nombre, código ISO o aeropuerto)
 * Escalable a cualquier país del mundo.
 * @param {string} countryQueryOrCode - Ej. 'Brasil', 'BR', 'México', 'Japón', 'MDE'
 * @returns {object} Metadatos de la moneda
 */
export function getCurrencyForCountry(countryQueryOrCode) {
  if (!countryQueryOrCode || typeof countryQueryOrCode !== 'string') {
    return CURRENCY_MAP['COP'];
  }

  const detected = detectCountry(countryQueryOrCode);
  if (detected && detected.code) {
    const currCode = COUNTRY_TO_CURRENCY_MAP[detected.code.toUpperCase()];
    if (currCode && CURRENCY_MAP[currCode]) {
      return CURRENCY_MAP[currCode];
    }
  }

  // Comprobar coincidencia directa con código de moneda
  const upper = countryQueryOrCode.toUpperCase().trim();
  if (CURRENCY_MAP[upper]) {
    return CURRENCY_MAP[upper];
  }

  return CURRENCY_MAP['USD'] || CURRENCY_MAP['COP'];
}

/**
 * Genera dinámicamente las divisas correspondientes a la ruta de un viaje.
 * Inspecciona destino principal, origen, escalas y tramos multidestino.
 * @param {object} viaje - Objeto del viaje con destino, origen, escalas, etc.
 * @returns {Array<object>} Lista ordenada y deduplicada de monedas del viaje
 */
export function getCurrenciesForTrip(viaje) {
  const resultCodes = new Set();

  if (viaje) {
    // 1. Moneda del destino principal
    if (viaje.destino) {
      const curr = getCurrencyForCountry(viaje.destino);
      if (curr) resultCodes.add(curr.code);
    }

    // 2. Moneda configurada explícitamente como monedaLocal
    if (viaje.monedaLocal && CURRENCY_MAP[viaje.monedaLocal.toUpperCase()]) {
      resultCodes.add(viaje.monedaLocal.toUpperCase());
    }

    // 3. Monedas de escalas del viaje
    if (viaje.escalas) {
      const currEscala = getCurrencyForCountry(viaje.escalas);
      if (currEscala) resultCodes.add(currEscala.code);
    }

    // 4. Monedas de multidestinos si aplica
    if (Array.isArray(viaje.destinosMultidestino)) {
      viaje.destinosMultidestino.forEach(dest => {
        if (dest.destino) {
          const c = getCurrencyForCountry(dest.destino);
          if (c) resultCodes.add(c.code);
        }
        if (dest.ciudad) {
          const c = getCurrencyForCountry(dest.ciudad);
          if (c) resultCodes.add(c.code);
        }
        if (dest.escala) {
          const c = getCurrencyForCountry(dest.escala);
          if (c) resultCodes.add(c.code);
        }
      });
    }

    // 5. Moneda del punto de partida / origen (por defecto COP si Colombia)
    if (viaje.origen) {
      const currOrigen = getCurrencyForCountry(viaje.origen);
      if (currOrigen) resultCodes.add(currOrigen.code);
    }

    // 6. Moneda base (COP)
    if (viaje.monedaBase && CURRENCY_MAP[viaje.monedaBase.toUpperCase()]) {
      resultCodes.add(viaje.monedaBase.toUpperCase());
    }
  }

  // Siempre asegurar COP y USD como referencia global y local
  resultCodes.add('COP');
  resultCodes.add('USD');

  // Convertir a objetos completos y ordenar
  return Array.from(resultCodes)
    .map(code => CURRENCY_MAP[code])
    .filter(Boolean);
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

function resolveCurrenciesApiBase() {
  const defaultBase = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? 'https://back-app-viajes.onrender.com'
    : 'http://localhost:4000';

  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : defaultBase;

  return rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`;
}

/**
 * Sincronizar tasas de cambio con la API externa en tiempo real
 * Resiliente y tolerante a fallos: backend -> open.er-api -> exchangerate-api -> local cache
 */
export async function syncLiveCurrencyRates() {
  let fetchedRates = null;
  let source = 'live-api';

  // 1. Intentar endpoint oficial del backend
  try {
    const apiBase = resolveCurrenciesApiBase();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`${apiBase}/divisas`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeout);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && json.data && json.data.rates) {
        fetchedRates = json.data.rates;
        source = 'backend-api';
      }
    }
  } catch {}

  // 2. Fallback primario directo a open.er-api.com
  if (!fetchedRates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal }).catch(() => null);
      clearTimeout(timeout);

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json && json.rates) {
          fetchedRates = json.rates;
          source = 'open-er-api';
        }
      }
    } catch {}
  }

  // 3. Fallback secundario a api.exchangerate-api.com
  if (!fetchedRates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { signal: controller.signal }).catch(() => null);
      clearTimeout(timeout);

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json && json.rates) {
          fetchedRates = json.rates;
          source = 'exchangerate-api';
        }
      }
    } catch {}
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
      } catch {}
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
 * Obtiene la tasa de cambio exacta congelada entre dos monedas en este instante
 * @param {string} fromCode - Divisa origen (ej. 'JPY', 'BRL', 'USD')
 * @param {string} toCode - Divisa destino (ej. 'COP')
 * @returns {number} Tasa de cambio unitaria exacta
 */
export function getExactExchangeRate(fromCode, toCode = 'COP') {
  const from = (fromCode || 'COP').toUpperCase();
  const to = (toCode || 'COP').toUpperCase();

  if (from === to) return 1.0;

  const rateFrom = activeRates[from] || DEFAULT_RATES_FROM_USD[from] || 1.0;
  const rateTo = activeRates[to] || DEFAULT_RATES_FROM_USD[to] || 1.0;

  return rateTo / rateFrom;
}

/**
 * Convierte un monto de una divisa origen a una divisa destino usando las tasas de la API
 * @param {number|string} amount
 * @param {string} fromCode
 * @param {string} toCode
 * @param {number} [customRate] - Tasa congelada histórica opcional
 */
export function convertCurrency(amount, fromCode, toCode, customRate = null) {
  const num = Number(amount) || 0;
  const from = (fromCode || 'COP').toUpperCase();
  const to = (toCode || 'COP').toUpperCase();

  if (from === to) {
    return roundCurrencyAmount(num, to);
  }

  if (customRate && Number(customRate) > 0) {
    return roundCurrencyAmount(num * Number(customRate), to);
  }

  const rate = getExactExchangeRate(from, to);
  const converted = num * rate;

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
 * Retorna las conversiones a las demás monedas relevantes usando la API
 * @param {number|string} amount
 * @param {string} currentCode
 * @param {Array<object>} [targetCurrencies] - Lista opcional de monedas de la ruta
 */
export function getOtherCurrenciesConversions(amount, currentCode, targetCurrencies = null) {
  const num = Number(amount);
  if (!num || isNaN(num) || num <= 0) return [];

  const current = (currentCode || 'COP').toUpperCase();
  const list = Array.isArray(targetCurrencies) && targetCurrencies.length > 0
    ? targetCurrencies
    : TRIP_CURRENCIES;

  return list
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
