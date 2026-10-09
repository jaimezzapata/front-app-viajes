/**
 * Diccionario y motor de detección de países bilingüe (Español / Inglés / Códigos ISO)
 * 100% Offline, sin dependencias externas.
 */

// Algoritmo Unicode para convertir código ISO Alpha-2 en bandera Emoji
export function getFlagEmoji(isoCode) {
  if (!isoCode || typeof isoCode !== 'string' || isoCode.length !== 2) return '🌍';
  const code = isoCode.toUpperCase();
  const codePoints = code.split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Lista curada y exhaustiva de países con nombres en Español e Inglés y códigos ISO
export const COUNTRIES = [
  { code: 'CO', es: 'Colombia', en: 'Colombia', aliases: ['col', 'colombiano'] },
  { code: 'JP', es: 'Japón', en: 'Japan', aliases: ['japon', 'nippon', 'nihon', 'jpn'] },
  { code: 'US', es: 'Estados Unidos', en: 'United States', aliases: ['usa', 'eeuu', 'ee.uu.', 'ee uu', 'us', 'america', 'united states of america'] },
  { code: 'ES', es: 'España', en: 'Spain', aliases: ['espana', 'esp', 'madrid', 'barcelona', 'mad', 'bcn', 'valencia', 'sevilla'] },
  { code: 'FR', es: 'Francia', en: 'France', aliases: ['fra', 'paris', 'cdg', 'ory', 'marsella', 'lyon'] },
  { code: 'MX', es: 'México', en: 'Mexico', aliases: ['mex'] },
  { code: 'IT', es: 'Italia', en: 'Italy', aliases: ['ita'] },
  { code: 'DE', es: 'Alemania', en: 'Germany', aliases: ['deutschland', 'deu', 'ger'] },
  { code: 'GB', es: 'Reino Unido', en: 'United Kingdom', aliases: ['uk', 'great britain', 'england', 'inglaterra', 'gran bretana', 'gbr'] },
  { code: 'CA', es: 'Canadá', en: 'Canada', aliases: ['can'] },
  { code: 'AR', es: 'Argentina', en: 'Argentina', aliases: ['arg'] },
  { code: 'BR', es: 'Brasil', en: 'Brazil', aliases: ['bra'] },
  { code: 'CL', es: 'Chile', en: 'Chile', aliases: ['chl'] },
  { code: 'PE', es: 'Perú', en: 'Peru', aliases: ['per'] },
  { code: 'PA', es: 'Panamá', en: 'Panama', aliases: ['pan'] },
  { code: 'EC', es: 'Ecuador', en: 'Ecuador', aliases: ['ecu'] },
  { code: 'CR', es: 'Costa Rica', en: 'Costa Rica', aliases: ['cri'] },
  { code: 'DO', es: 'República Dominicana', en: 'Dominican Republic', aliases: ['republica dominicana', 'dom'] },
  { code: 'PT', es: 'Portugal', en: 'Portugal', aliases: ['prt'] },
  { code: 'NL', es: 'Países Bajos', en: 'Netherlands', aliases: ['holanda', 'holland', 'paises bajos', 'nld'] },
  { code: 'CH', es: 'Suiza', en: 'Switzerland', aliases: ['che', 'swiss'] },
  { code: 'TR', es: 'Turquía', en: 'Turkey', aliases: ['turquia', 'turkiye', 'tur'] },
  { code: 'AE', es: 'Emiratos Árabes Unidos', en: 'United Arab Emirates', aliases: ['uae', 'emiratos arabes', 'emiratos arabes unidos', 'emiratos', 'dubai', 'dubái', 'abu dhabi', 'abu dabi', 'abudhabi', 'abudabi', 'auh', 'dxb', 'sharjah'] },
  { code: 'AU', es: 'Australia', en: 'Australia', aliases: ['aus'] },
  { code: 'NZ', es: 'Nueva Zelanda', en: 'New Zealand', aliases: ['nzl'] },
  { code: 'KR', es: 'Corea del Sur', en: 'South Korea', aliases: ['korea', 'corea', 'kor'] },
  { code: 'CN', es: 'China', en: 'China', aliases: ['chn'] },
  { code: 'TH', es: 'Tailandia', en: 'Thailand', aliases: ['tha'] },
  { code: 'VN', es: 'Vietnam', en: 'Vietnam', aliases: ['vnm'] },
  { code: 'ID', es: 'Indonesia', en: 'Indonesia', aliases: ['idn', 'bali'] },
  { code: 'SG', es: 'Singapur', en: 'Singapore', aliases: ['sgp'] },
  { code: 'MY', es: 'Malasia', en: 'Malaysia', aliases: ['mys'] },
  { code: 'EG', es: 'Egipto', en: 'Egypt', aliases: ['egy'] },
  { code: 'MA', es: 'Marruecos', en: 'Morocco', aliases: ['mar'] },
  { code: 'ZA', es: 'Sudáfrica', en: 'South Africa', aliases: ['sudafrica', 'zaf'] },
  { code: 'GR', es: 'Grecia', en: 'Greece', aliases: ['grc'] },
  { code: 'BE', es: 'Bélgica', en: 'Belgium', aliases: ['belgica', 'bel'] },
  { code: 'AT', es: 'Austria', en: 'Austria', aliases: ['aut'] },
  { code: 'SE', es: 'Suecia', en: 'Sweden', aliases: ['swe'] },
  { code: 'NO', es: 'Noruega', en: 'Norway', aliases: ['nor'] },
  { code: 'DK', es: 'Dinamarca', en: 'Denmark', aliases: ['dnk'] },
  { code: 'FI', es: 'Finlandia', en: 'Finland', aliases: ['fin'] },
  { code: 'IE', es: 'Irlanda', en: 'Ireland', aliases: ['irl'] },
  { code: 'CZ', es: 'República Checa', en: 'Czech Republic', aliases: ['republica checa', 'chequia', 'cze'] },
  { code: 'PL', es: 'Polonia', en: 'Poland', aliases: ['pol', 'varsovia', 'warsaw', 'cracovia', 'krakow', 'waw', 'krk', 'polska'] },
  { code: 'HU', es: 'Hungría', en: 'Hungary', aliases: ['hungria', 'hun'] },
  { code: 'UY', es: 'Uruguay', en: 'Uruguay', aliases: ['ury'] },
  { code: 'PY', es: 'Paraguay', en: 'Paraguay', aliases: ['pry'] },
  { code: 'BO', es: 'Bolivia', en: 'Bolivia', aliases: ['bol'] },
  { code: 'CU', es: 'Cuba', en: 'Cuba', aliases: ['cub'] },
  { code: 'GT', es: 'Guatemala', en: 'Guatemala', aliases: ['gtm'] },
  { code: 'SV', es: 'El Salvador', en: 'El Salvador', aliases: ['slv'] },
  { code: 'HN', es: 'Honduras', en: 'Honduras', aliases: ['hnd'] },
  { code: 'NI', es: 'Nicaragua', en: 'Nicaragua', aliases: ['nic'] },
  { code: 'PR', es: 'Puerto Rico', en: 'Puerto Rico', aliases: ['pri'] },
  { code: 'IL', es: 'Israel', en: 'Israel', aliases: ['isr'] },
  { code: 'IN', es: 'India', en: 'India', aliases: ['ind'] },
  { code: 'PH', es: 'Filipinas', en: 'Philippines', aliases: ['phl'] },
  { code: 'QA', es: 'Catar', en: 'Qatar', aliases: ['qatar', 'qat'] },
  { code: 'SA', es: 'Arabia Saudita', en: 'Saudi Arabia', aliases: ['sau'] }
];

function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .trim();
}

import { findAirport } from './airportsData.js';

/**
 * Detecta un país a partir de una cadena (sea código de aeropuerto IATA, ciudad, país en español/inglés, alias o código ISO)
 * @param {string} query
 * @returns {{ code: string, es: string, en: string, flag: string } | null}
 */
export function detectCountry(query) {
  if (!query || typeof query !== 'string') return null;

  // 0. Si comienza con emoji de bandera, extraer código ISO directamente de los codepoints regionales
  const chars = Array.from(query.trim());
  if (chars.length >= 2) {
    const cp0 = chars[0].codePointAt(0);
    const cp1 = chars[1].codePointAt(0);
    if (cp0 >= 0x1f1e6 && cp0 <= 0x1f1ff && cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff) {
      const iso = String.fromCharCode(cp0 - 0x1f1e6 + 65) + String.fromCharCode(cp1 - 0x1f1e6 + 65);
      const byIso = COUNTRIES.find(c => c.code === iso);
      if (byIso) {
        return { ...byIso, flag: chars[0] + chars[1] };
      }
      return { code: iso, es: query.replace(/^([\uD83C][\uDDE6-\uDDFF]){2}\s*/u, '').trim() || iso, en: iso, flag: chars[0] + chars[1] };
    }
  }

  const clean = normalize(query.replace(/^([\uD83C][\uDDE6-\uDDFF]){2}\s*/u, ''));
  if (!clean) return null;

  // 1. Coincidencia exacta por código ISO-2 (ej. "BR", "CO", "ES", "US", "CH", "FR", "DE", "IT")
  if (clean.length === 2) {
    const byCode = COUNTRIES.find(c => c.code.toLowerCase() === clean);
    if (byCode) {
      return { ...byCode, flag: getFlagEmoji(byCode.code) };
    }
  }

  // 2. Coincidencia por nombre en Español o Inglés (ej. "Brasil", "Brazil", "Colombia", "Suiza")
  const byName = COUNTRIES.find(c => {
    const normEs = normalize(c.es);
    const normEn = normalize(c.en);
    return normEs === clean || normEn === clean;
  });
  if (byName) {
    return { ...byName, flag: getFlagEmoji(byName.code) };
  }

  // 3. Coincidencia exacta por alias oficial (ej. "bra", "col", "jpn", "usa")
  const byAlias = COUNTRIES.find(c =>
    c.aliases && c.aliases.some(alias => normalize(alias) === clean)
  );
  if (byAlias) {
    return { ...byAlias, flag: getFlagEmoji(byAlias.code) };
  }

  // 4. Detección por código de aeropuerto IATA (ej. MDE, MAD, ICN, BOG, MIA, DOH, IST) o ciudad conocida
  const airportMatch = findAirport(query);
  if (airportMatch && airportMatch.countryCode) {
    const byIso = COUNTRIES.find(c => c.code === airportMatch.countryCode);
    if (byIso) {
      return { ...byIso, flag: getFlagEmoji(byIso.code) };
    }
    return {
      code: airportMatch.countryCode,
      es: airportMatch.country,
      en: airportMatch.country,
      flag: getFlagEmoji(airportMatch.countryCode)
    };
  }

  // 5. Búsqueda por palabra completa o nombre de país (evita falsos positivos por subcadenas)
  const cleanTokens = clean.split(/[^a-z0-9]+/).filter(Boolean);

  const bySubstring = COUNTRIES.find(c => {
    const normEs = normalize(c.es);
    const normEn = normalize(c.en);

    // Coincidencia de nombre oficial (mínimo 4 caracteres con límites de palabra)
    if (normEs.length >= 4 && clean.includes(normEs)) {
      const regex = new RegExp(`(^|[^a-z0-9])${normEs}([^a-z0-9]|$)`);
      if (regex.test(clean)) return true;
    }
    if (normEn.length >= 4 && clean.includes(normEn)) {
      const regex = new RegExp(`(^|[^a-z0-9])${normEn}([^a-z0-9]|$)`);
      if (regex.test(clean)) return true;
    }

    // Coincidencia con alias oficiales como token/palabra completa
    if (c.aliases) {
      return c.aliases.some(a => {
        const normA = normalize(a);
        return normA && cleanTokens.includes(normA);
      });
    }

    return false;
  });
  if (bySubstring) {
    return { ...bySubstring, flag: getFlagEmoji(bySubstring.code) };
  }

  return null;
}

/**
 * Retorna la bandera emoji del país o un icono de mundo si no se detecta
 */
export function getCountryFlag(query) {
  const match = detectCountry(query);
  return match ? match.flag : '🌍';
}

/**
 * REGLA DE NEGOCIO:
 * Un país se considera visitado y se debe pintar en el mapa si:
 * 1. Es el destino de un vuelo o viaje.
 * 2. Se está en el país más de 24 horas (>= 24h), lo cual incluye:
 *    - Stopovers (escalas aéreas >= 24 horas, tanto en el tramo de ida como en el de regreso).
 *    - Conexiones o cambios entre vuelos consecutivos con espera >= 24 horas.
 *    - Alojamientos o eventos con estadía >= 24 horas en dicho país.
 *    - Destinos de viajes multidestino o regulares con estadía >= 24 horas.
 *
 * @param {Array} eventos - Lista de eventos/vuelos del itinerario
 * @param {Array} viajes - Lista de viajes para asociar metadata
 * @returns {Map<string, { code: string, es: string, en: string, flag: string, viajes: Array, eventos: Array, motivo: string, horasEscala?: number }>}
 */
export function extractVisitedCountries(eventos = [], viajes = []) {
  const visited = new Map();

  const safeEventos = Array.isArray(eventos) ? eventos : [];
  const safeViajes = Array.isArray(viajes) ? viajes : [];

  // Mapa de viajes por ID para referencia rápida
  const viajesById = new Map();
  safeViajes.forEach(v => {
    if (v && v.id) viajesById.set(v.id, v);
  });

  // Helper para agregar o consolidar un país visitado / en ruta
  const addVisited = (countryObj, viaje = null, evento = null, motivo = '', horasEscala = null, isConfirmed = false, role = '') => {
    if (!countryObj || !countryObj.code) return;
    const code = countryObj.code.toUpperCase();

    if (!visited.has(code)) {
      visited.set(code, {
        code,
        es: countryObj.es,
        en: countryObj.en,
        flag: countryObj.flag || getFlagEmoji(code),
        viajes: viaje ? [viaje] : [],
        eventos: evento ? [evento] : [],
        motivo: motivo || (isConfirmed ? 'Destino confirmado' : 'Ruta pendiente'),
        horasEscala: horasEscala !== null ? horasEscala : undefined,
        isPending: !isConfirmed,
        hasConfirmedFlight: Boolean(isConfirmed),
        role: role || (isConfirmed ? 'confirmado' : 'pendiente')
      });
    } else {
      const item = visited.get(code);
      if (viaje && !item.viajes.some(v => v.id === viaje.id)) {
        item.viajes.push(viaje);
      }
      if (evento && !item.eventos.some(e => e.id === evento.id)) {
        item.eventos.push(evento);
      }
      if (horasEscala && (!item.horasEscala || horasEscala > item.horasEscala)) {
        item.horasEscala = horasEscala;
      }
      // Si la nueva entrada está confirmada por un vuelo o trayecto registrado, se actualiza a confirmado
      if (isConfirmed) {
        item.isPending = false;
        item.hasConfirmedFlight = true;
        if (motivo) item.motivo = motivo;
        if (role) item.role = role;
      }
    }
  };

  // 1. VIAJES CONFIGURADOS INICIALMENTE (Origen y Destinos pendientes por registrar vuelos)
  safeViajes.forEach(v => {
    // Origen del viaje (marcado como ruta pendiente hasta registrar vuelo de salida)
    const origCountry =
      detectCountry(v.origen) ||
      detectCountry(v.ciudadOrigen) ||
      detectCountry(v.paisOrigen);

    if (origCountry) {
      addVisited(
        origCountry,
        v,
        null,
        `Punto de partida (${v.titulo}) - Ruta pendiente por registrar vuelos`,
        null,
        false,
        'origen'
      );
    }

    // A. Viajes Multidestino
    if ((v.tipoViaje || '').toLowerCase() === 'multidestino') {
      if (Array.isArray(v.destinosMultidestino) && v.destinosMultidestino.length > 0) {
        v.destinosMultidestino.forEach(item => {
          const destCountry =
            detectCountry(item.destino) ||
            detectCountry(item.ciudad) ||
            detectCountry(item.pais);
          if (destCountry) {
            addVisited(
              destCountry,
              v,
              null,
              `Destino multidestino (${v.titulo}) - Ruta pendiente por registrar vuelos`,
              null,
              false,
              'destino'
            );
          }

          // Escala del multidestino (si tiene escala configurada)
          if (item.escala || item.paisEscala || item.ciudadEscala) {
            const connCountry =
              detectCountry(item.escala) ||
              detectCountry(item.paisEscala) ||
              detectCountry(item.ciudadEscala);
            if (connCountry) {
              addVisited(
                connCountry,
                v,
                null,
                `Escala multidestino (${v.titulo}) - Ruta pendiente`,
                null,
                false,
                'escala'
              );
            }
          }
        });
      } else if (v.destino) {
        const subDestinos = String(v.destino).split(/[,;\-\/]+/).map(s => s.trim()).filter(Boolean);
        subDestinos.forEach(sub => {
          const destCountry = detectCountry(sub);
          if (destCountry) {
            addVisited(
              destCountry,
              v,
              null,
              `Destino multidestino (${v.titulo}) - Ruta pendiente por registrar vuelos`,
              null,
              false,
              'destino'
            );
          }
        });
      }
    } else {
      // B. Viaje simple / regular
      const tripCountry =
        detectCountry(v.pais) ||
        detectCountry(v.destino) ||
        detectCountry(v.ciudad);
      if (tripCountry) {
        addVisited(
          tripCountry,
          v,
          null,
          `Destino planificado (${v.titulo}) - Ruta pendiente por registrar vuelos`,
          null,
          false,
          'destino'
        );
      }
      if (v.destino && typeof v.destino === 'string') {
        const subDestinos = v.destino.split(/[,;\-\/]+/).map(s => s.trim()).filter(Boolean);
        subDestinos.forEach(sub => {
          const dc = detectCountry(sub);
          if (dc) {
            addVisited(
              dc,
              v,
              null,
              `Destino planificado (${v.titulo}) - Ruta pendiente por registrar vuelos`,
              null,
              false,
              'destino'
            );
          }
        });
      }
      // Escala en viaje regular si se especificó
      if (v.escalas || v.paisEscala || v.escala) {
        const connC =
          detectCountry(v.escalas) ||
          detectCountry(v.paisEscala) ||
          detectCountry(v.escala);
        if (connC) {
          addVisited(
            connC,
            v,
            null,
            `Escala programada (${v.titulo}) - Ruta pendiente`,
            null,
            false,
            'escala'
          );
        }
      }
    }
  });

  // 2. VUELOS Y TRAYECTOS AÉREOS REGISTRADOS EN ITINERARIO (CONFIRMAN Y COLOREAN PAÍSES)
  const flightEvents = safeEventos.filter(e => {
    const isVuelo = (e.tipo || '').toLowerCase() === 'vuelo';
    const isTransporte = (e.tipo || '').toLowerCase() === 'transporte';
    const hasFlightLogistics = Boolean(
      e.ciudadDestino || e.paisDestino || e.aeropuertoDestino ||
      e.ciudadOrigen || e.paisOrigen || e.aeropuertoOrigen
    );
    return isVuelo || isTransporte || hasFlightLogistics;
  });

  flightEvents.forEach(ev => {
    const viaje = viajesById.get(ev.viajeId);

    // --- A. DESTINO DEL VUELO / TRAYECTO (CONFIRMADO) ---
    const destCountry =
      detectCountry(ev.paisDestino) ||
      detectCountry(ev.ciudadDestino) ||
      detectCountry(ev.aeropuertoDestino) ||
      detectCountry(ev.ubicacion);

    if (destCountry) {
      addVisited(
        destCountry,
        viaje,
        ev,
        `Destino de vuelo (${ev.ciudadDestino || ev.aeropuertoDestino || destCountry.es})`,
        null,
        true, // Confirmado por vuelo explícito
        'destino_vuelo'
      );
    }

    // --- B. ORIGEN DEL VUELO / TRAYECTO (CONFIRMADO) ---
    const origCountry =
      detectCountry(ev.paisOrigen) ||
      detectCountry(ev.ciudadOrigen) ||
      detectCountry(ev.aeropuertoOrigen);

    if (origCountry) {
      addVisited(
        origCountry,
        viaje,
        ev,
        `Origen de vuelo (${ev.ciudadOrigen || ev.aeropuertoOrigen || origCountry.es})`,
        null,
        true, // Confirmado por vuelo explícito
        'origen_vuelo'
      );
    }

    // --- C. STOPOVER / ESCALA TRAMO 1 (>= 24 HORAS) ---
    const horas = ev.horasEscala !== undefined && ev.horasEscala !== null && ev.horasEscala !== ''
      ? Number(ev.horasEscala)
      : null;
    const isStopover = ev.escalaMayor24h === true || (horas !== null && horas >= 24);
    const hasConnection = Boolean(
      ev.tieneConexion || ev.aeropuertoConexion || ev.ciudadConexion || ev.paisConexion || ev.horasEscala || ev.escalaMayor24h
    );

    if (isStopover || (hasConnection && horas !== null && horas >= 24)) {
      const connCountry =
        detectCountry(ev.paisConexion) ||
        detectCountry(ev.ciudadConexion) ||
        detectCountry(ev.aeropuertoConexion) ||
        detectCountry(ev.ubicacionConexion) ||
        detectCountry(ev.notas) ||
        detectCountry(ev.titulo);

      if (connCountry) {
        addVisited(
          connCountry,
          viaje,
          ev,
          `Escala Stopover ≥24h (${horas ? `${horas}h` : '≥24h'}) en ${ev.aeropuertoConexion || ev.ciudadConexion || connCountry.es}`,
          horas,
          true,
          'stopover'
        );
      }
    }

    // --- D. STOPOVER / ESCALA TRAMO DE REGRESO (>= 24 HORAS) ---
    const horasReg = ev.horasEscalaRegreso !== undefined && ev.horasEscalaRegreso !== null && ev.horasEscalaRegreso !== ''
      ? Number(ev.horasEscalaRegreso)
      : null;
    const isStopoverReg = ev.escalaMayor24hRegreso === true || (horasReg !== null && horasReg >= 24);
    const hasConnectionReg = Boolean(
      ev.tieneConexionRegreso || ev.aeropuertoConexionRegreso || ev.ciudadConexionRegreso || ev.paisConexionRegreso || ev.horasEscalaRegreso || ev.escalaMayor24hRegreso
    );

    if (isStopoverReg || (hasConnectionReg && horasReg !== null && horasReg >= 24)) {
      const connCountryReg =
        detectCountry(ev.paisConexionRegreso) ||
        detectCountry(ev.ciudadConexionRegreso) ||
        detectCountry(ev.aeropuertoConexionRegreso) ||
        detectCountry(ev.ubicacionConexionRegreso);

      if (connCountryReg) {
        addVisited(
          connCountryReg,
          viaje,
          ev,
          `Escala Stopover ≥24h Regreso (${horasReg ? `${horasReg}h` : '≥24h'}) en ${ev.aeropuertoConexionRegreso || ev.ciudadConexionRegreso || connCountryReg.es}`,
          horasReg,
          true,
          'stopover'
        );
      }
    }
  });

  // 3. CAMBIO DE VUELO ENTRE TRAMOS CONSECUTIVOS (Stopover entre vuelos >= 24 horas)
  const sortedFlights = [...flightEvents]
    .filter(f => f.fechaInicio)
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

  for (let i = 0; i < sortedFlights.length - 1; i++) {
    const flight1 = sortedFlights[i];
    const flight2 = sortedFlights[i + 1];

    const arrivalCountry =
      detectCountry(flight1.paisDestino) ||
      detectCountry(flight1.ciudadDestino) ||
      detectCountry(flight1.aeropuertoDestino) ||
      detectCountry(flight1.titulo);

    const departureCountry =
      detectCountry(flight2.paisOrigen) ||
      detectCountry(flight2.ciudadOrigen) ||
      detectCountry(flight2.aeropuertoOrigen) ||
      detectCountry(flight2.titulo);

    if (arrivalCountry && departureCountry && arrivalCountry.code === departureCountry.code) {
      const arrivalTime = flight1.fechaFin
        ? new Date(flight1.fechaFin).getTime()
        : new Date(flight1.fechaInicio).getTime() + (2 * 3600 * 1000);
      const departureTime = new Date(flight2.fechaInicio).getTime();
      const diffHours = (departureTime - arrivalTime) / (1000 * 60 * 60);

      // Si la estadía entre vuelos es mayor o igual a 24 horas, es un Stopover confirmado
      if (diffHours >= 24) {
        const viaje = viajesById.get(flight1.viajeId) || viajesById.get(flight2.viajeId);
        addVisited(
          arrivalCountry,
          viaje,
          flight1,
          `Estadía / Stopover entre vuelos (${Math.round(diffHours)}h en ${arrivalCountry.es})`,
          Math.round(diffHours),
          true,
          'stopover'
        );
      }
    }
  }

  // 4. OTROS EVENTOS CON ESTADÍA >= 24 HORAS (Alojamientos, hoteles, estancias, actividades)
  safeEventos.forEach(ev => {
    const isFlight = (ev.tipo || '').toLowerCase() === 'vuelo' || (ev.ciudadDestino && ev.ciudadOrigen);
    if (isFlight) return;

    const isHotel = ['hotel', 'alojamiento', 'hospedaje'].includes((ev.tipo || '').toLowerCase());
    let diffHours = 0;
    if (ev.fechaInicio && ev.fechaFin) {
      diffHours = (new Date(ev.fechaFin).getTime() - new Date(ev.fechaInicio).getTime()) / (1000 * 3600);
    }

    const eventCountry =
      detectCountry(ev.pais) ||
      detectCountry(ev.ciudad) ||
      detectCountry(ev.ubicacion) ||
      detectCountry(ev.titulo) ||
      detectCountry(ev.notas);

    const mentions24h =
      /24\s*h|stopover|estadia|estadía|dias|días|\+24/i.test(ev.notas || '') ||
      /24\s*h|stopover|estadia|estadía|dias|días|\+24/i.test(ev.titulo || '');

    if (eventCountry && (isHotel || diffHours >= 24 || ev.escalaMayor24h === true || (ev.horasEscala && Number(ev.horasEscala) >= 24) || mentions24h)) {
      const viaje = viajesById.get(ev.viajeId);
      addVisited(
        eventCountry,
        viaje,
        ev,
        `${isHotel ? 'Hotel / Alojamiento' : 'Estadía'} ≥24h (${Math.round(diffHours || 24)}h) en ${eventCountry.es}`,
        diffHours || 24,
        true,
        'alojamiento'
      );
    }
  });

  // 5. ESCANEO GLOBAL DE SEGURIDAD (Cualquier evento o nota que registre estadía > 24h en un país)
  safeEventos.forEach(ev => {
    const combined = `${ev.titulo || ''} ${ev.notas || ''} ${ev.ubicacion || ''}`;
    if (/24\s*h|stopover|escala|estadia|estadía|qued/i.test(combined)) {
      const detected = detectCountry(combined);
      if (detected && !visited.has(detected.code)) {
        const viaje = viajesById.get(ev.viajeId);
        addVisited(
          detected,
          viaje,
          ev,
          `Estadía ≥24h registrada en bitácora (${ev.titulo || detected.es})`,
          24,
          true,
          'estadía'
        );
      }
    }
  });

  return visited;
}

/**
 * Repara tildes o caracteres rotos por teclado/encoding (ej. "Jap+on" -> "Japón", "avi+on" -> "avión")
 * Utiliza códigos de escape unicode para evitar problemas de codificación en el compilador/terminal.
 * @param {string} text
 * @returns {string}
 */
export function fixAccents(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Tecla muerta produciendo '+' antes de vocal o 'n'
    .replace(/\+a/g, '\u00E1')
    .replace(/\+e/g, '\u00E9')
    .replace(/\+i/g, '\u00ED')
    .replace(/\+o/g, '\u00F3')
    .replace(/\+u/g, '\u00FA')
    .replace(/\+n/g, '\u00F1')
    .replace(/\+A/g, '\u00C1')
    .replace(/\+E/g, '\u00C9')
    .replace(/\+I/g, '\u00CD')
    .replace(/\+O/g, '\u00D3')
    .replace(/\+U/g, '\u00DA')
    .replace(/\+N/g, '\u00D1')
    // Acento agudo suelto seguido de letra (´a -> á)
    .replace(/\u00B4a/g, '\u00E1')
    .replace(/\u00B4e/g, '\u00E9')
    .replace(/\u00B4i/g, '\u00ED')
    .replace(/\u00B4o/g, '\u00F3')
    .replace(/\u00B4u/g, '\u00FA')
    .replace(/\u00B4A/g, '\u00C1')
    .replace(/\u00B4E/g, '\u00C9')
    .replace(/\u00B4I/g, '\u00CD')
    .replace(/\u00B4O/g, '\u00D3')
    .replace(/\u00B4U/g, '\u00DA')
    .replace(/~n/g, '\u00F1')
    .replace(/~N/g, '\u00D1')
    // Mojibake comunes (UTF-8 interpretado como ISO-8859-1 / Windows-1252)
    .replace(/\u00C3\u00A1/g, '\u00E1')
    .replace(/\u00C3\u00A9/g, '\u00E9')
    .replace(/\u00C3\u00AD/g, '\u00ED')
    .replace(/\u00C3\u00B3/g, '\u00F3')
    .replace(/\u00C3\u00BA/g, '\u00FA')
    .replace(/\u00C3\u00B1/g, '\u00F1')
    .replace(/\u00C3\u0081/g, '\u00C1')
    .replace(/\u00C3\u0089/g, '\u00C9')
    .replace(/\u00C3\u008D/g, '\u00CD')
    .replace(/\u00C3\u0093/g, '\u00D3')
    .replace(/\u00C3\u009A/g, '\u00DA')
    .replace(/\u00C3\u0091/g, '\u00D1');
}

/**
 * Limpia el texto de cualquier bandera emoji o artefacto de código duplicado (ej: "ES ES España" -> "España")
 * También repara cualquier tilde rota en los nombres de países o rutas.
 * @param {string} text
 * @returns {string}
 */
export function cleanCountryText(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Normalizar separadores de ruta
  const delimStr = text.replace(/\s*(?:->|➔|→)\s*/g, ' |DELIM| ');

  // 2. Procesar cada tramo de la ruta de manera independiente
  const parts = delimStr.split(' |DELIM| ').map(part => {
    let p = part.trim();
    // Eliminar banderas emoji (símbolos regionales y surrogates) y emojis en general
    p = p.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '');
    p = p.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    p = p.replace(/[\uD83C][\uDDE6-\uDDFF]/g, '');

    // Eliminar códigos ISO de 2 letras repetidos o iniciales (ej: "ES ES España", "KR KR Corea del Sur")
    p = p.replace(/^([a-zA-Z]{2}\s+)+/i, '');
    p = p.replace(/\b([a-zA-Z]{2})\s+(?=[A-Za-z\u00C0-\u00FF])/gi, '');

    // Reparar tildes
    p = fixAccents(p);

    // Limpiar espacios repetidos
    return p.replace(/\s{2,}/g, ' ').trim();
  });

  return parts.filter(Boolean).join(' ➔ ');
}

