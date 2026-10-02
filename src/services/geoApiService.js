import { COUNTRIES, getFlagEmoji, detectCountry } from '../utils/countries';

const COUNTRIES_API = 'https://countriesnow.space/api/v0.1/countries';
const AIRPORTS_API = 'https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json';

// Caché en memoria
let cachedCountries = null;
let cachedAirports = null;
let isFetchingCountries = false;
let isFetchingAirports = false;

/**
 * Obtiene la URL de la mini bandera oficial (PNG alta resolución vía flagcdn)
 * @param {string} isoCode - Código ISO Alpha-2 (ej. 'CO', 'JP')
 * @returns {string}
 */
export function getMiniFlagUrl(isoCode) {
  if (!isoCode || typeof isoCode !== 'string' || isoCode.length !== 2) return '';
  return `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
}

/**
 * Extrae el código ISO Alpha-2 de un emoji de bandera si existe
 * @param {string} text
 * @returns {string|null}
 */
export function extractIsoFromFlagEmoji(text) {
  if (!text || typeof text !== 'string') return null;
  const chars = Array.from(text);
  if (chars.length >= 2) {
    const cp0 = chars[0].codePointAt(0);
    const cp1 = chars[1].codePointAt(0);
    if (cp0 >= 0x1f1e6 && cp0 <= 0x1f1ff && cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff) {
      return String.fromCharCode(cp0 - 0x1f1e6 + 65) + String.fromCharCode(cp1 - 0x1f1e6 + 65);
    }
  }
  return null;
}

export { cleanCountryText, fixAccents } from '../utils/countries';

/**
 * Limpia el texto de cualquier bandera emoji al inicio o duplicados
 * @param {string} text
 * @returns {string}
 */
export function stripMiniFlag(text) {
  return cleanCountryText(text);
}

/**
 * Da formato estándar a un país guardándolo con su mini bandera emoji
 * @param {string} countryName
 * @param {string} [isoCode]
 * @returns {string}
 */
export function formatWithMiniFlag(countryName, isoCode) {
  if (!countryName) return '';
  const clean = cleanCountryText(countryName);
  const detected = detectCountry(isoCode || clean);
  const flag = detected?.flag || (isoCode ? getFlagEmoji(isoCode) : '🌍');
  return `${flag} ${clean}`;
}

/**
 * Carga la lista de países y ciudades desde la API pública gratuita con fallback offline
 */
export async function getCountries() {
  if (cachedCountries && cachedCountries.length > 0) {
    return cachedCountries;
  }

  // Intentar leer de localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('geo_countries_cache');
      if (stored) {
        cachedCountries = JSON.parse(stored);
        return cachedCountries;
      }
    } catch {}
  }

  if (isFetchingCountries) {
    return COUNTRIES.map(c => ({
      code: c.code,
      name: c.es,
      en: c.en,
      flagEmoji: getFlagEmoji(c.code),
      flagUrl: getMiniFlagUrl(c.code),
      cities: []
    }));
  }

  isFetchingCountries = true;
  try {
    const res = await fetch(COUNTRIES_API);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        const enriched = json.data.map(item => {
          const code = (item.iso2 || '').toUpperCase();
          const known = COUNTRIES.find(k => k.code === code);
          return {
            code,
            iso3: (item.iso3 || '').toUpperCase(),
            name: known ? known.es : item.country,
            en: item.country,
            flagEmoji: getFlagEmoji(code),
            flagUrl: getMiniFlagUrl(code),
            cities: item.cities || []
          };
        });

        cachedCountries = enriched;
        try {
          localStorage.setItem('geo_countries_cache', JSON.stringify(enriched));
        } catch {}
        return enriched;
      }
    }
  } catch {
    // Si falla o no hay conexión, usar catálogo local enriquecido
  } finally {
    isFetchingCountries = false;
  }

  cachedCountries = COUNTRIES.map(c => ({
    code: c.code,
    name: c.es,
    en: c.en,
    flagEmoji: getFlagEmoji(c.code),
    flagUrl: getMiniFlagUrl(c.code),
    cities: []
  }));
  return cachedCountries;
}

/**
 * Carga aeropuertos comerciales globales desde la API pública gratuita (Algolia Dataset)
 */
export async function getAirports() {
  if (cachedAirports && cachedAirports.length > 0) {
    return cachedAirports;
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('geo_airports_cache');
      if (stored) {
        cachedAirports = JSON.parse(stored);
        return cachedAirports;
      }
    } catch {}
  }

  if (isFetchingAirports) {
    return [];
  }

  isFetchingAirports = true;
  try {
    const res = await fetch(AIRPORTS_API);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        cachedAirports = list;
        try {
          // Guardar en cache local para acceso offline
          localStorage.setItem('geo_airports_cache', JSON.stringify(list));
        } catch {}
        return list;
      }
    }
  } catch {
    // Modo offline
  } finally {
    isFetchingAirports = false;
  }

  return cachedAirports || [];
}

/**
 * Búsqueda inteligente de aeropuertos por IATA, nombre, ciudad o país
 * @param {string} query
 * @param {number} limit
 */
export async function searchAirports(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const airports = await getAirports();

  const exactIata = [];
  const startsIata = [];
  const matchesCity = [];
  const matchesName = [];

  for (const a of airports) {
    if (!a.iata_code) continue;
    const iata = a.iata_code.toLowerCase();
    const city = (a.city || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    const country = (a.country || '').toLowerCase();

    if (iata === q) {
      exactIata.push(a);
    } else if (iata.startsWith(q)) {
      startsIata.push(a);
    } else if (city.includes(q)) {
      matchesCity.push(a);
    } else if (name.includes(q) || country.includes(q)) {
      matchesName.push(a);
    }

    if (exactIata.length + startsIata.length + matchesCity.length + matchesName.length >= limit * 3) {
      break;
    }
  }

  return [...exactIata, ...startsIata, ...matchesCity, ...matchesName].slice(0, limit);
}

/**
 * Búsqueda inteligente de ciudades a partir de los aeropuertos y países
 */
export async function searchCities(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const airports = await getAirports();

  const seen = new Set();
  const results = [];

  for (const a of airports) {
    if (!a.city) continue;
    const cityKey = `${a.city.toLowerCase()}-${(a.country || '').toLowerCase()}`;
    if (seen.has(cityKey)) continue;

    if (a.city.toLowerCase().includes(q) || (a.iata_code && a.iata_code.toLowerCase() === q)) {
      seen.add(cityKey);
      const countryInfo = detectCountry(a.country);
      results.push({
        city: a.city,
        country: countryInfo ? countryInfo.es : a.country,
        countryCode: countryInfo?.code || '',
        flagEmoji: countryInfo?.flag || '🌍',
        flagUrl: countryInfo ? getMiniFlagUrl(countryInfo.code) : '',
        iata: a.iata_code,
        airportName: a.name,
        lat: a._geoloc?.lat,
        lng: a._geoloc?.lng
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}
