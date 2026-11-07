import { detectCountry, cleanCountryText, getCountryFlag } from './countries';
import { findAirport, AIRPORTS_AND_CITIES } from './airportsData';

/**
 * Resuelve el país asociado a un evento del itinerario.
 * Prioriza destino para arribos, origen para retornos, y metadata contextual.
 */
export function resolveEventCountry(ev, activeViaje = null) {
  if (!ev) {
    return {
      countryName: 'Destino',
      countryCode: '',
      flag: '🌍'
    };
  }

  let countryName = '';
  let countryCode = '';
  let flag = '';

  const isVuelo = (ev.tipo || '').toLowerCase() === 'vuelo';
  const isRegreso = ev.tramo === 'regreso';

  // 1. Si es vuelo de regreso que parte del destino y regresa al origen
  // e.g., Vuelo Madrid -> Bogotá con destino del viaje España
  if (isVuelo && isRegreso && ev.paisOrigen) {
    const origDetected = detectCountry(ev.paisOrigen);
    if (origDetected) {
      countryName = origDetected.es;
      countryCode = origDetected.code;
      flag = origDetected.flag;
    }
  }

  // 2. Destino explícito del evento (paisDestino o pais)
  if (!countryName) {
    const rawCountry = ev.paisDestino || ev.pais || '';
    if (rawCountry) {
      const detected = detectCountry(rawCountry);
      if (detected) {
        countryName = detected.es;
        countryCode = detected.code;
        flag = detected.flag;
      } else {
        countryName = cleanCountryText(rawCountry);
        flag = getCountryFlag(countryName);
      }
    }
  }

  // 3. Código IATA de aeropuerto de destino (aeropuertoDestino)
  if (!countryName && ev.aeropuertoDestino) {
    const airport = findAirport(ev.aeropuertoDestino);
    if (airport && airport.country) {
      countryName = airport.country;
      countryCode = airport.countryCode;
      flag = getCountryFlag(countryCode);
    }
  }

  // 4. Ciudad de destino (ciudadDestino o ciudad)
  if (!countryName && (ev.ciudadDestino || ev.ciudad)) {
    const airport = findAirport(ev.ciudadDestino || ev.ciudad);
    if (airport && airport.country) {
      countryName = airport.country;
      countryCode = airport.countryCode;
      flag = getCountryFlag(countryCode);
    }
  }

  // 5. Ubicación en texto libre (hoteles, tours, atracciones, restaurantes)
  if (!countryName && ev.ubicacion) {
    const detected = detectCountry(ev.ubicacion);
    if (detected) {
      countryName = detected.es;
      countryCode = detected.code;
      flag = detected.flag;
    }
  }

  // 6. Si es vuelo y aún no tiene país, revisar origen de salida
  if (!countryName && isVuelo && ev.paisOrigen) {
    const detected = detectCountry(ev.paisOrigen);
    if (detected) {
      countryName = detected.es;
      countryCode = detected.code;
      flag = detected.flag;
    }
  }

  // 7. Comparar con los destinos multidestino configurados en el viaje activo
  if (!countryName && activeViaje && Array.isArray(activeViaje.destinosMultidestino)) {
    const combined = `${ev.titulo || ''} ${ev.ubicacion || ''} ${ev.ciudadDestino || ''}`.toLowerCase();
    for (const d of activeViaje.destinosMultidestino) {
      const cMatch = d.ciudad && combined.includes(d.ciudad.toLowerCase());
      const dMatch = d.destino && combined.includes(d.destino.toLowerCase());
      if (cMatch || dMatch) {
        const detected = detectCountry(d.destino);
        if (detected) {
          countryName = detected.es;
          countryCode = detected.code;
          flag = detected.flag;
          break;
        }
      }
    }
  }

  // 8. Fallback al país principal del viaje activo
  if (!countryName && activeViaje?.destino) {
    const detected = detectCountry(activeViaje.destino);
    if (detected) {
      countryName = detected.es;
      countryCode = detected.code;
      flag = detected.flag;
    } else {
      countryName = cleanCountryText(activeViaje.destino);
      flag = getCountryFlag(countryName);
    }
  }

  return {
    countryName: countryName || 'Destino',
    countryCode: countryCode || '',
    flag: flag || (countryCode ? getCountryFlag(countryCode) : '🌍')
  };
}

/**
 * Resuelve la ciudad asociada a un evento del itinerario.
 */
export function resolveEventCity(ev, countryName = '', activeViaje = null) {
  if (!ev) return '';

  let cityName = cleanCountryText(ev.ciudadDestino || ev.ciudad || '');

  // 1. Aeropuerto de destino
  if (!cityName && ev.aeropuertoDestino) {
    const airport = findAirport(ev.aeropuertoDestino);
    if (airport && airport.city) cityName = airport.city;
  }

  // 2. Campo ubicacion
  if (!cityName && ev.ubicacion) {
    const airportMatch = findAirport(ev.ubicacion);
    if (airportMatch && airportMatch.city) {
      cityName = airportMatch.city;
    } else {
      const parts = ev.ubicacion.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        const secondToLast = parts[parts.length - 2];
        if (detectCountry(last)) {
          cityName = secondToLast;
        } else {
          for (const p of parts) {
            const m = findAirport(p);
            if (m && m.city) {
              cityName = m.city;
              break;
            }
          }
        }
      } else {
        for (const item of AIRPORTS_AND_CITIES) {
          if (ev.ubicacion.toLowerCase().includes(item.city.toLowerCase())) {
            cityName = item.city;
            break;
          }
        }
      }
    }
  }

  // 3. Destinos del viaje activo
  if (!cityName && activeViaje && Array.isArray(activeViaje.destinosMultidestino)) {
    const combined = `${ev.titulo || ''} ${ev.ubicacion || ''}`.toLowerCase();
    for (const d of activeViaje.destinosMultidestino) {
      if (d.ciudad && combined.includes(d.ciudad.toLowerCase())) {
        cityName = d.ciudad;
        break;
      }
    }
  }

  // 4. Limpieza si la ciudad repite el nombre del país
  if (cityName && countryName && cityName.toLowerCase().includes(countryName.toLowerCase())) {
    cityName = cityName.replace(new RegExp(countryName, 'gi'), '').replace(/,\s*$/, '').trim();
  }

  return cleanCountryText(cityName);
}

/**
 * Agrupa los eventos en BLOQUES POR PAÍS.
 * Cada bloque de país tiene un único banner con su bandera.
 * Dentro de cada país, las actividades se subdividen limpiamente por Ciudad.
 *
 * @param {Array} eventos - Eventos del itinerario ordenados cronológicamente
 * @param {Object|null} activeViaje - Viaje activo
 * @returns {Array<Object>} Lista de bloques de país con sus ciudades y eventos
 */
export function groupEventosByCountryCity(eventos = [], activeViaje = null) {
  if (!Array.isArray(eventos) || eventos.length === 0) return [];

  // 1. Decorar cada evento con su país y ciudad resueltos
  const decorated = eventos.map(ev => {
    const country = resolveEventCountry(ev, activeViaje);
    const city = resolveEventCity(ev, country.countryName, activeViaje);
    return { ev, country, city };
  });

  // 2. Agrupar en bloques de país respetando el flujo cronológico de visita
  const countryGroups = [];
  let currentCountryGroup = null;

  decorated.forEach(({ ev, country, city }) => {
    const countryKey = (country.countryCode || country.countryName || 'DEST').toUpperCase().trim();

    // Iniciar nuevo bloque de país únicamente cuando cambia el país
    if (!currentCountryGroup || currentCountryGroup.countryKey !== countryKey) {
      currentCountryGroup = {
        key: `country_${countryKey}_${countryGroups.length}`,
        countryKey,
        country: country.countryName,
        countryCode: country.countryCode,
        flag: country.flag,
        eventos: [ev],
        citiesSet: new Set(city ? [city] : [])
      };
      countryGroups.push(currentCountryGroup);
    } else {
      currentCountryGroup.eventos.push(ev);
      if (city) currentCountryGroup.citiesSet.add(city);
    }
  });

  // 3. Organizar las ciudades y subsecciones dentro de cada bloque de país
  countryGroups.forEach(cg => {
    cg.cities = Array.from(cg.citiesSet);

    const citySections = [];
    let currentCitySection = null;

    cg.eventos.forEach(ev => {
      const city = resolveEventCity(ev, cg.country, activeViaje);
      const normCity = city ? city.trim() : '';

      if (!currentCitySection || currentCitySection.cityName !== normCity) {
        currentCitySection = {
          cityName: normCity,
          eventos: [ev]
        };
        citySections.push(currentCitySection);
      } else {
        currentCitySection.eventos.push(ev);
      }
    });

    cg.citySections = citySections;
  });

  return countryGroups;
}

/**
 * Genera una cadena legible con el rango de fechas para un grupo de actividades
 * Ej: "12 oct - 15 oct" o "12 oct"
 */
export function getGroupDateRange(eventos = []) {
  if (!Array.isArray(eventos) || eventos.length === 0) return '';

  const parseD = (d) => {
    if (!d) return null;
    const p = new Date(d);
    return isNaN(p.getTime()) ? null : p;
  };

  const dates = eventos
    .map(e => parseD(e.fechaInicio) || parseD(e.fecha))
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (dates.length === 0) return '';
  const first = dates[0];
  const last = dates[dates.length - 1];

  const formatOpts = { day: 'numeric', month: 'short' };
  const firstStr = first.toLocaleDateString([], formatOpts);
  const lastStr = last.toLocaleDateString([], formatOpts);

  if (firstStr === lastStr) {
    return firstStr;
  }
  return `${firstStr} - ${lastStr}`;
}
