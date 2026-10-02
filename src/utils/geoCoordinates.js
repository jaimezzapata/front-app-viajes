import { detectCountry, COUNTRIES } from './countries.js';

// Coordenadas centroides aproximadas para los países de la aplicación
const COUNTRY_CENTROIDS = {
  CO: { latitude: 4.5709, longitude: -74.2973 },
  JP: { latitude: 36.2048, longitude: 138.2529 },
  US: { latitude: 37.0902, longitude: -95.7129 },
  ES: { latitude: 40.4637, longitude: -3.7492 },
  FR: { latitude: 46.2276, longitude: 2.2137 },
  MX: { latitude: 23.6345, longitude: -102.5528 },
  IT: { latitude: 41.8719, longitude: 12.5674 },
  DE: { latitude: 51.1657, longitude: 10.4515 },
  GB: { latitude: 55.3781, longitude: -3.4360 },
  CA: { latitude: 56.1304, longitude: -106.3468 },
  AR: { latitude: -38.4161, longitude: -63.6167 },
  BR: { latitude: -14.2350, longitude: -51.9253 },
  CL: { latitude: -35.6751, longitude: -71.5430 },
  PE: { latitude: -9.1899, longitude: -75.0152 },
  PA: { latitude: 8.5379, longitude: -80.7821 },
  EC: { latitude: -1.8312, longitude: -78.1834 },
  CR: { latitude: 9.7489, longitude: -83.7534 },
  DO: { latitude: 18.7357, longitude: -70.1627 },
  PT: { latitude: 39.3999, longitude: -8.2245 },
  NL: { latitude: 52.1326, longitude: 5.2913 },
  CH: { latitude: 46.8182, longitude: 8.2275 },
  TR: { latitude: 38.9637, longitude: 35.2433 },
  AE: { latitude: 23.4241, longitude: 53.8478 },
  AU: { latitude: -25.2744, longitude: 133.7751 },
  NZ: { latitude: -40.9006, longitude: 174.8860 },
  KR: { latitude: 35.9078, longitude: 127.7669 },
  CN: { latitude: 35.8617, longitude: 104.1954 },
  TH: { latitude: 15.8700, longitude: 100.9925 },
  VN: { latitude: 14.0583, longitude: 108.2772 },
  ID: { latitude: -0.7893, longitude: 113.9213 },
  SG: { latitude: 1.3521, longitude: 103.8198 },
  MY: { latitude: 4.2105, longitude: 101.9758 },
  EG: { latitude: 26.8206, longitude: 30.8025 },
  MA: { latitude: 31.7917, longitude: -7.0926 },
  ZA: { latitude: -30.5595, longitude: 22.9375 },
  GR: { latitude: 39.0742, longitude: 21.8243 },
  BE: { latitude: 50.5039, longitude: 4.4699 },
  AT: { latitude: 47.5162, longitude: 14.5501 },
  SE: { latitude: 60.1282, longitude: 18.6435 },
  NO: { latitude: 60.4720, longitude: 8.4689 },
  DK: { latitude: 56.2639, longitude: 9.5018 },
  FI: { latitude: 61.9241, longitude: 25.7482 },
  IE: { latitude: 53.1424, longitude: -7.6921 },
  CZ: { latitude: 49.8175, longitude: 15.4730 },
  PL: { latitude: 51.9194, longitude: 19.1451 },
  HU: { latitude: 47.1625, longitude: 19.5033 },
  UY: { latitude: -32.5228, longitude: -55.7658 },
  PY: { latitude: -23.4425, longitude: -58.4438 },
  BO: { latitude: -16.2902, longitude: -63.5887 },
  CU: { latitude: 21.5218, longitude: -77.7812 },
  GT: { latitude: 15.7835, longitude: -90.2308 },
  SV: { latitude: 13.7942, longitude: -88.8965 },
  HN: { latitude: 15.2000, longitude: -86.2419 },
  NI: { latitude: 12.8654, longitude: -85.2072 },
  PR: { latitude: 18.2208, longitude: -66.5901 },
  IL: { latitude: 31.0461, longitude: 34.8516 },
  IN: { latitude: 20.5937, longitude: 78.9629 },
  PH: { latitude: 12.8797, longitude: 121.7740 },
  QA: { latitude: 25.3548, longitude: 51.1839 },
};

// Base de datos de aeropuertos y ciudades principales del mundo (modularizada)
export { AIRPORTS_AND_CITIES, findAirport } from './airportsData.js';
import { AIRPORTS_AND_CITIES, findAirport } from './airportsData.js';


function normalizeStr(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resuelve las coordenadas geográficas (latitud, longitud) para un punto dado
 * buscando por código IATA de aeropuerto, nombre de ciudad o país.
 */
export function resolveLocationCoordinates({
  ciudad = '',
  pais = '',
  aeropuerto = '',
  latitud = null,
  longitud = null
}) {
  // 1. Si ya tiene coordenadas válidas explícitas
  if (
    latitud !== null &&
    latitud !== undefined &&
    longitud !== null &&
    longitud !== undefined &&
    !isNaN(Number(latitud)) &&
    !isNaN(Number(longitud))
  ) {
    return {
      latitude: Number(latitud),
      longitude: Number(longitud),
      label: ciudad || aeropuerto || pais || 'Punto'
    };
  }

  // 2. Extraer posible código IATA de 3 letras de aeropuerto (ej. "BOG", "BOG (El Dorado)", "Narita (NRT)")
  const rawIataMatch = aeropuerto ? aeropuerto.match(/\b([A-Z]{3})\b/) : null;
  const iataCode = rawIataMatch ? rawIataMatch[1].toUpperCase() : (aeropuerto && aeropuerto.trim().length === 3 ? aeropuerto.trim().toUpperCase() : null);

  if (iataCode) {
    const matchByIata = AIRPORTS_AND_CITIES.find(a => a.code === iataCode);
    if (matchByIata) {
      return {
        latitude: matchByIata.latitude,
        longitude: matchByIata.longitude,
        code: matchByIata.code,
        city: matchByIata.city,
        country: matchByIata.country,
        countryCode: matchByIata.countryCode,
        label: `${matchByIata.code} - ${matchByIata.city}`
      };
    }
  }

  const normCiudad = normalizeStr(ciudad);
  const normAeropuerto = normalizeStr(aeropuerto);

  // 3. Buscar coincidencia por nombre de ciudad en nuestra lista
  if (normCiudad) {
    const matchByCity = AIRPORTS_AND_CITIES.find(a => {
      const normA = normalizeStr(a.city);
      return normA === normCiudad || normCiudad.includes(normA) || normA.includes(normCiudad);
    });
    if (matchByCity) {
      return {
        latitude: matchByCity.latitude,
        longitude: matchByCity.longitude,
        code: matchByCity.code,
        city: matchByCity.city,
        country: matchByCity.country,
        countryCode: matchByCity.countryCode,
        label: `${matchByCity.code} - ${matchByCity.city}`
      };
    }
  }

  // 4. Buscar coincidencia por nombre o parte del aeropuerto
  if (normAeropuerto) {
    const matchByAirName = AIRPORTS_AND_CITIES.find(a => {
      const normA = normalizeStr(a.name);
      return normAeropuerto.includes(normA) || normA.includes(normAeropuerto);
    });
    if (matchByAirName) {
      return {
        latitude: matchByAirName.latitude,
        longitude: matchByAirName.longitude,
        code: matchByAirName.code,
        city: matchByAirName.city,
        country: matchByAirName.country,
        countryCode: matchByAirName.countryCode,
        label: `${matchByAirName.code} - ${matchByAirName.city}`
      };
    }
  }

  // 5. Detectar país vía detectCountry
  const detected = detectCountry(pais || ciudad || aeropuerto);
  if (detected && COUNTRY_CENTROIDS[detected.code]) {
    const coords = COUNTRY_CENTROIDS[detected.code];
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      code: detected.code,
      city: ciudad || detected.es,
      country: detected.es,
      countryCode: detected.code,
      label: `${detected.flag} ${ciudad || detected.es}`
    };
  }

  return null;
}

// Paleta de colores neón y vibrantes para distinguir individualmente cada trayecto en el mapa
export const ROUTE_COLORS = [
  { hex: '#00E5FF', amColor: 0x00E5FF, name: 'Cian Eléctrico', bg: 'bg-[#00E5FF]', text: 'text-[#00E5FF]', border: 'border-[#00E5FF]' },
  { hex: '#FF9100', amColor: 0xFF9100, name: 'Naranja Neón', bg: 'bg-[#FF9100]', text: 'text-[#FF9100]', border: 'border-[#FF9100]' },
  { hex: '#A855F7', amColor: 0xA855F7, name: 'Violeta Eléctrico', bg: 'bg-[#A855F7]', text: 'text-[#A855F7]', border: 'border-[#A855F7]' },
  { hex: '#00FF85', amColor: 0x00FF85, name: 'Verde Neón', bg: 'bg-[#00FF85]', text: 'text-[#00FF85]', border: 'border-[#00FF85]' },
  { hex: '#FF2E55', amColor: 0xFF2E55, name: 'Coral / Rosa Neón', bg: 'bg-[#FF2E55]', text: 'text-[#FF2E55]', border: 'border-[#FF2E55]' },
  { hex: '#FFE500', amColor: 0xFFE500, name: 'Amarillo Neón', bg: 'bg-[#FFE500]', text: 'text-[#FFE500]', border: 'border-[#FFE500]' },
  { hex: '#38BDF8', amColor: 0x38BDF8, name: 'Azul Celeste', bg: 'bg-[#38BDF8]', text: 'text-[#38BDF8]', border: 'border-[#38BDF8]' },
  { hex: '#EC4899', amColor: 0xEC4899, name: 'Fucsia Neón', bg: 'bg-[#EC4899]', text: 'text-[#EC4899]', border: 'border-[#EC4899]' },
  { hex: '#14B8A6', amColor: 0x14B8A6, name: 'Turquesa', bg: 'bg-[#14B8A6]', text: 'text-[#14B8A6]', border: 'border-[#14B8A6]' },
  { hex: '#F59E0B', amColor: 0xF59E0B, name: 'Ámbar Dorado', bg: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]' }
];

/**
 * Convierte un listado de eventos de itinerario en trayectos / rutas de vuelo
 * estructuradas para representar en mapas (con origen, escalas, destino y coordenadas).
 */
export function extractFlightTrajectories(eventos = [], viajes = []) {
  const routes = [];
  const processedTripIdsWithFlights = new Set();

  const safeEventos = Array.isArray(eventos) ? eventos : [];
  const safeViajes = Array.isArray(viajes) ? viajes : [];

  // 1. Procesar eventos registrados en el itinerario
  safeEventos.forEach(ev => {
    const isVuelo = (ev.tipo || '').toLowerCase() === 'vuelo';
    const isTransporte = (ev.tipo || '').toLowerCase() === 'transporte';

    // Debe ser vuelo o tener datos de origen y destino
    const hasLogistics =
      ev.ciudadOrigen ||
      ev.aeropuertoOrigen ||
      ev.paisOrigen ||
      ev.ciudadDestino ||
      ev.aeropuertoDestino ||
      ev.paisDestino;

    if (!isVuelo && !isTransporte && !hasLogistics) {
      return;
    }

    if (ev.viajeId) {
      processedTripIdsWithFlights.add(ev.viajeId);
    }

    // Resolver Origen
    const originCoords = resolveLocationCoordinates({
      ciudad: ev.ciudadOrigen || '',
      pais: ev.paisOrigen || '',
      aeropuerto: ev.aeropuertoOrigen || '',
      latitud: ev.latitud,
      longitud: ev.longitud
    });

    // Resolver Destino
    const destCoords = resolveLocationCoordinates({
      ciudad: ev.ciudadDestino || ev.ubicacion || '',
      pais: ev.paisDestino || '',
      aeropuerto: ev.aeropuertoDestino || ''
    });

    // Si ambos puntos tienen coordenadas, crear la ruta
    if (originCoords && destCoords) {
      // Resolver conexión si existe
      let connCoords = null;
      if (ev.tieneConexion) {
        connCoords = resolveLocationCoordinates({
          ciudad: ev.ciudadConexion || '',
          pais: ev.paisConexion || '',
          aeropuerto: ev.aeropuertoConexion || ''
        });
      }

      routes.push({
        id: ev.id,
        event: ev,
        titulo: ev.titulo || 'Vuelo',
        tipo: ev.tipo || 'vuelo',
        tipoTrayecto: ev.tipoTrayecto || 'one-way',
        tramo: ev.tramo || null,
        roundTripGroupId: ev.roundTripGroupId || null,
        fechaInicio: ev.fechaInicio,
        fechaFin: ev.fechaFin,
        costo: ev.costo,
        moneda: ev.moneda || 'USD',
        notas: ev.notas,
        origin: {
          ...originCoords,
          airportName: ev.aeropuertoOrigen || originCoords.code || '',
          displayTitle: ev.aeropuertoOrigen || ev.ciudadOrigen || originCoords.label
        },
        destination: {
          ...destCoords,
          airportName: ev.aeropuertoDestino || destCoords.code || '',
          displayTitle: ev.aeropuertoDestino || ev.ciudadDestino || destCoords.label
        },
        connection: connCoords
          ? {
              ...connCoords,
              airportName: ev.aeropuertoConexion || connCoords.code || '',
              displayTitle: ev.aeropuertoConexion || ev.ciudadConexion || connCoords.label
            }
          : null
      });

      // Si el evento fue registrado como round-trip pero no fue desglosado como evento independiente:
      if ((ev.tipoTrayecto === 'round-trip' || ev.esRoundTrip) && !ev.tramo) {
        routes.push({
          id: `${ev.id}-regreso`,
          event: ev,
          titulo: `Regreso: ${ev.ciudadDestino || destCoords.label} ➔ ${ev.ciudadOrigen || originCoords.label}`,
          tipo: 'vuelo',
          tipoTrayecto: 'round-trip',
          tramo: 'regreso',
          roundTripGroupId: ev.roundTripGroupId || ev.id,
          fechaInicio: ev.fechaRegreso || ev.fechaFin,
          fechaFin: ev.fechaRegresoFin || ev.fechaFin,
          costo: 0,
          moneda: ev.moneda || 'USD',
          notas: ev.notas,
          origin: {
            ...destCoords,
            airportName: ev.aeropuertoDestino || destCoords.code || '',
            displayTitle: ev.aeropuertoDestino || ev.ciudadDestino || destCoords.label
          },
          destination: {
            ...originCoords,
            airportName: ev.aeropuertoOrigen || originCoords.code || '',
            displayTitle: ev.aeropuertoOrigen || ev.ciudadOrigen || originCoords.label
          },
          connection: null
        });
      }
    }
  });

  // 2. Procesar rutas configuradas directamente en los VIAJES (Multidestino o Único)
  safeViajes.forEach(v => {
    // Si ya tiene vuelos detallados en el itinerario, no duplicar
    if (processedTripIdsWithFlights.has(v.id)) {
      return;
    }

    // A. VIAJE MULTIDESTINO: Trazar recorrido consecutivo Origen -> Destino 1 -> Destino 2 -> ...
    if ((v.tipoViaje || '').toLowerCase() === 'multidestino') {
      const stops = Array.isArray(v.destinosMultidestino) ? v.destinosMultidestino : [];
      let currentOriginCoords = v.origen ? resolveLocationCoordinates({ ciudad: v.origen, pais: v.origen, aeropuerto: v.origen }) : null;
      let currentOriginLabel = v.origen || 'Origen';

      stops.forEach((stop, index) => {
        const destCoords = resolveLocationCoordinates({
          ciudad: stop.ciudad || stop.destino || '',
          pais: stop.destino || '',
          aeropuerto: stop.aeropuerto || ''
        });

        if (currentOriginCoords && destCoords) {
          let connCoords = null;
          if (stop.tieneEscala && stop.escala) {
            connCoords = resolveLocationCoordinates({
              ciudad: stop.escala,
              pais: stop.escala,
              aeropuerto: stop.escala
            });
          }

          routes.push({
            id: `route-${v.id}-leg-${index}`,
            viajeId: v.id,
            titulo: `${v.titulo} (Tramo ${index + 1})`,
            tipo: 'vuelo',
            origin: {
              ...currentOriginCoords,
              airportName: currentOriginCoords.code || '',
              displayTitle: currentOriginLabel
            },
            destination: {
              ...destCoords,
              airportName: destCoords.code || '',
              displayTitle: stop.destino || destCoords.label
            },
            connection: connCoords
              ? {
                  ...connCoords,
                  airportName: connCoords.code || '',
                  displayTitle: stop.escala || connCoords.label
                }
              : null
          });

          // El siguiente tramo sale desde el destino de este tramo
          currentOriginCoords = destCoords;
          currentOriginLabel = stop.destino || destCoords.label;
        }
      });
    } else {
      // B. VIAJE DE ÚNICO DESTINO CON ORIGEN Y CONEXIÓN
      if (v.origen && v.destino) {
        const originCoords = resolveLocationCoordinates({ ciudad: v.origen, pais: v.origen, aeropuerto: v.origen });
        const destCoords = resolveLocationCoordinates({ ciudad: v.destino, pais: v.destino, aeropuerto: v.destino });

        if (originCoords && destCoords) {
          let connCoords = null;
          if (v.escalas) {
            connCoords = resolveLocationCoordinates({ ciudad: v.escalas, pais: v.escalas, aeropuerto: v.escalas });
          }

          routes.push({
            id: `route-${v.id}-main`,
            viajeId: v.id,
            titulo: `${v.titulo} (Ruta prevista)`,
            tipo: 'vuelo',
            origin: {
              ...originCoords,
              airportName: originCoords.code || '',
              displayTitle: v.origen
            },
            destination: {
              ...destCoords,
              airportName: destCoords.code || '',
              displayTitle: v.destino
            },
            connection: connCoords
              ? {
                  ...connCoords,
                  airportName: connCoords.code || '',
                  displayTitle: v.escalas
                }
              : null
          });
        }
      }
    }
  });

  // Asignar a cada trayecto un color vibrante diferente para el mapa
  routes.forEach((route, idx) => {
    const colorDef = ROUTE_COLORS[idx % ROUTE_COLORS.length];
    route.color = colorDef.hex;
    route.colorAm = colorDef.amColor;
    route.colorDef = colorDef;
  });

  return routes;
}
