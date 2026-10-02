/**
 * Base de datos curada de aeropuertos y principales ciudades del mundo
 * Incluye códigos IATA, ciudades, países y código ISO-2 correspondiente.
 */

export const AIRPORTS_AND_CITIES = [
  // Colombia
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', countryCode: 'CO', name: 'El Dorado', latitude: 4.7016, longitude: -74.1469 },
  { code: 'MDE', city: 'Medellín', country: 'Colombia', countryCode: 'CO', name: 'José María Córdova', latitude: 6.1645, longitude: -75.4231 },
  { code: 'EOH', city: 'Medellín', country: 'Colombia', countryCode: 'CO', name: 'Olaya Herrera', latitude: 6.2208, longitude: -75.5906 },
  { code: 'CLO', city: 'Cali', country: 'Colombia', countryCode: 'CO', name: 'Alfonso Bonilla Aragón', latitude: 3.5432, longitude: -76.3816 },
  { code: 'CTG', city: 'Cartagena', country: 'Colombia', countryCode: 'CO', name: 'Rafael Núñez', latitude: 10.4424, longitude: -75.5130 },
  { code: 'BAQ', city: 'Barranquilla', country: 'Colombia', countryCode: 'CO', name: 'Ernesto Cortissoz', latitude: 10.8896, longitude: -74.7808 },
  { code: 'SMR', city: 'Santa Marta', country: 'Colombia', countryCode: 'CO', name: 'Simón Bolívar', latitude: 11.1196, longitude: -74.2306 },
  { code: 'ADZ', city: 'San Andrés', country: 'Colombia', countryCode: 'CO', name: 'Gustavo Rojas Pinilla', latitude: 12.5833, longitude: -81.7106 },
  { code: 'BGA', city: 'Bucaramanga', country: 'Colombia', countryCode: 'CO', name: 'Palonegro', latitude: 7.1265, longitude: -73.1848 },
  { code: 'PEI', city: 'Pereira', country: 'Colombia', countryCode: 'CO', name: 'Matecaña', latitude: 4.8125, longitude: -75.7397 },

  // Japón & Asia
  { code: 'NRT', city: 'Tokio', country: 'Japón', countryCode: 'JP', name: 'Narita', latitude: 35.7720, longitude: 140.3929 },
  { code: 'HND', city: 'Tokio', country: 'Japón', countryCode: 'JP', name: 'Haneda', latitude: 35.5494, longitude: 139.7798 },
  { code: 'KIX', city: 'Osaka', country: 'Japón', countryCode: 'JP', name: 'Kansai', latitude: 34.4347, longitude: 135.2441 },
  { code: 'ITM', city: 'Osaka', country: 'Japón', countryCode: 'JP', name: 'Itami', latitude: 34.7855, longitude: 135.4382 },
  { code: 'CTS', city: 'Sapporo', country: 'Japón', countryCode: 'JP', name: 'New Chitose', latitude: 42.7752, longitude: 141.6923 },
  { code: 'FUK', city: 'Fukuoka', country: 'Japón', countryCode: 'JP', name: 'Fukuoka', latitude: 33.5859, longitude: 130.4507 },
  { code: 'ICN', city: 'Seúl', country: 'Corea del Sur', countryCode: 'KR', name: 'Incheon International', latitude: 37.4602, longitude: 126.4407 },
  { code: 'ICH', city: 'Seúl / Incheon', country: 'Corea del Sur', countryCode: 'KR', name: 'Incheon International', latitude: 37.4602, longitude: 126.4407 },
  { code: 'GMP', city: 'Seúl', country: 'Corea del Sur', countryCode: 'KR', name: 'Gimpo', latitude: 37.5583, longitude: 126.7906 },
  { code: 'PEK', city: 'Pekín', country: 'China', countryCode: 'CN', name: 'Beijing Capital', latitude: 40.0799, longitude: 116.6031 },
  { code: 'PVG', city: 'Shanghái', country: 'China', countryCode: 'CN', name: 'Pudong', latitude: 31.1443, longitude: 121.8083 },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', name: 'Hong Kong International', latitude: 22.3080, longitude: 113.9185 },
  { code: 'TPE', city: 'Taipéi', country: 'Taiwán', countryCode: 'TW', name: 'Taoyuan', latitude: 25.0797, longitude: 121.2342 },
  { code: 'SIN', city: 'Singapur', country: 'Singapur', countryCode: 'SG', name: 'Changi', latitude: 1.3644, longitude: 103.9915 },
  { code: 'BKK', city: 'Bangkok', country: 'Tailandia', countryCode: 'TH', name: 'Suvarnabhumi', latitude: 13.6900, longitude: 100.7501 },
  { code: 'DMK', city: 'Bangkok', country: 'Tailandia', countryCode: 'TH', name: 'Don Mueang', latitude: 13.9126, longitude: 100.6068 },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malasia', countryCode: 'MY', name: 'Kuala Lumpur', latitude: 2.7456, longitude: 101.7072 },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', countryCode: 'ID', name: 'Ngurah Rai', latitude: -8.7482, longitude: 115.1672 },
  { code: 'CGK', city: 'Yakarta', country: 'Indonesia', countryCode: 'ID', name: 'Soekarno-Hatta', latitude: -6.1256, longitude: 106.6559 },
  { code: 'DEL', city: 'Nueva Delhi', country: 'India', countryCode: 'IN', name: 'Indira Gandhi', latitude: 28.5562, longitude: 77.1000 },
  { code: 'BOM', city: 'Bombay', country: 'India', countryCode: 'IN', name: 'Chhatrapati Shivaji', latitude: 19.0896, longitude: 72.8656 },

  // Medio Oriente
  { code: 'DXB', city: 'Dubái', country: 'Emiratos Árabes Unidos', countryCode: 'AE', name: 'Dubai International', latitude: 25.2532, longitude: 55.3657 },
  { code: 'AUH', city: 'Abu Dhabi', country: 'Emiratos Árabes Unidos', countryCode: 'AE', name: 'Zayed International', latitude: 24.4330, longitude: 54.6511 },
  { code: 'DOH', city: 'Doha', country: 'Catar', countryCode: 'QA', name: 'Hamad International', latitude: 25.2609, longitude: 51.5651 },
  { code: 'IST', city: 'Estambul', country: 'Turquía', countryCode: 'TR', name: 'Istanbul Airport', latitude: 41.2753, longitude: 28.7519 },
  { code: 'SAW', city: 'Estambul', country: 'Turquía', countryCode: 'TR', name: 'Sabiha Gökçen', latitude: 40.8986, longitude: 29.3092 },

  // Estados Unidos & Canadá
  { code: 'LAX', city: 'Los Ángeles', country: 'Estados Unidos', countryCode: 'US', name: 'Los Angeles International', latitude: 33.9416, longitude: -118.4085 },
  { code: 'JFK', city: 'Nueva York', country: 'Estados Unidos', countryCode: 'US', name: 'John F. Kennedy', latitude: 40.6413, longitude: -73.7781 },
  { code: 'EWR', city: 'Nueva York', country: 'Estados Unidos', countryCode: 'US', name: 'Newark Liberty', latitude: 40.6895, longitude: -74.1745 },
  { code: 'LGA', city: 'Nueva York', country: 'Estados Unidos', countryCode: 'US', name: 'LaGuardia', latitude: 40.7769, longitude: -73.8740 },
  { code: 'MIA', city: 'Miami', country: 'Estados Unidos', countryCode: 'US', name: 'Miami International', latitude: 25.7959, longitude: -80.2870 },
  { code: 'MCO', city: 'Orlando', country: 'Estados Unidos', countryCode: 'US', name: 'Orlando International', latitude: 28.4312, longitude: -81.3081 },
  { code: 'ORD', city: 'Chicago', country: 'Estados Unidos', countryCode: 'US', name: "O'Hare", latitude: 41.9742, longitude: -87.9073 },
  { code: 'SFO', city: 'San Francisco', country: 'Estados Unidos', countryCode: 'US', name: 'San Francisco International', latitude: 37.6213, longitude: -122.3790 },
  { code: 'ATL', city: 'Atlanta', country: 'Estados Unidos', countryCode: 'US', name: 'Hartsfield-Jackson', latitude: 33.6407, longitude: -84.4277 },
  { code: 'DFW', city: 'Dallas', country: 'Estados Unidos', countryCode: 'US', name: 'Dallas/Fort Worth', latitude: 32.8998, longitude: -97.0403 },
  { code: 'IAH', city: 'Houston', country: 'Estados Unidos', countryCode: 'US', name: 'George Bush Intercontinental', latitude: 29.9902, longitude: -95.3368 },
  { code: 'IAD', city: 'Washington', country: 'Estados Unidos', countryCode: 'US', name: 'Dulles', latitude: 38.9531, longitude: -77.4565 },
  { code: 'BOS', city: 'Boston', country: 'Estados Unidos', countryCode: 'US', name: 'Logan', latitude: 42.3656, longitude: -71.0096 },
  { code: 'LAS', city: 'Las Vegas', country: 'Estados Unidos', countryCode: 'US', name: 'Harry Reid', latitude: 36.0840, longitude: -115.1537 },
  { code: 'SEA', city: 'Seattle', country: 'Estados Unidos', countryCode: 'US', name: 'Seattle-Tacoma', latitude: 47.4502, longitude: -122.3088 },
  { code: 'YYZ', city: 'Toronto', country: 'Canadá', countryCode: 'CA', name: 'Pearson', latitude: 43.6777, longitude: -79.6248 },
  { code: 'YVR', city: 'Vancouver', country: 'Canadá', countryCode: 'CA', name: 'Vancouver International', latitude: 49.1967, longitude: -123.1815 },
  { code: 'YUL', city: 'Montreal', country: 'Canadá', countryCode: 'CA', name: 'Pierre Elliott Trudeau', latitude: 45.4706, longitude: -73.7408 },

  // Europa
  { code: 'MAD', city: 'Madrid', country: 'España', countryCode: 'ES', name: 'Adolfo Suárez Madrid-Barajas', latitude: 40.4839, longitude: -3.5680 },
  { code: 'BCN', city: 'Barcelona', country: 'España', countryCode: 'ES', name: 'Josep Tarradellas Barcelona-El Prat', latitude: 41.2974, longitude: 2.0833 },
  { code: 'CDG', city: 'París', country: 'Francia', countryCode: 'FR', name: 'Charles de Gaulle', latitude: 49.0097, longitude: 2.5479 },
  { code: 'ORY', city: 'París', country: 'Francia', countryCode: 'FR', name: 'Orly', latitude: 48.7262, longitude: 2.3652 },
  { code: 'LHR', city: 'Londres', country: 'Reino Unido', countryCode: 'GB', name: 'Heathrow', latitude: 51.4700, longitude: -0.4543 },
  { code: 'LGW', city: 'Londres', country: 'Reino Unido', countryCode: 'GB', name: 'Gatwick', latitude: 51.1537, longitude: -0.1821 },
  { code: 'FCO', city: 'Roma', country: 'Italia', countryCode: 'IT', name: 'Fiumicino Leonardo da Vinci', latitude: 41.8003, longitude: 12.2389 },
  { code: 'MXP', city: 'Milán', country: 'Italia', countryCode: 'IT', name: 'Malpensa', latitude: 45.6301, longitude: 8.7255 },
  { code: 'FRA', city: 'Fráncfort', country: 'Alemania', countryCode: 'DE', name: 'Frankfurt Airport', latitude: 50.0379, longitude: 8.5622 },
  { code: 'MUC', city: 'Múnich', country: 'Alemania', countryCode: 'DE', name: 'Munich Airport', latitude: 48.3537, longitude: 11.7750 },
  { code: 'BER', city: 'Berlín', country: 'Alemania', countryCode: 'DE', name: 'Berlin Brandenburg', latitude: 52.3667, longitude: 13.5033 },
  { code: 'AMS', city: 'Ámsterdam', country: 'Países Bajos', countryCode: 'NL', name: 'Schiphol', latitude: 52.3105, longitude: 4.7683 },
  { code: 'LIS', city: 'Lisboa', country: 'Portugal', countryCode: 'PT', name: 'Humberto Delgado', latitude: 38.7742, longitude: -9.1342 },
  { code: 'OPO', city: 'Oporto', country: 'Portugal', countryCode: 'PT', name: 'Francisco Sá Carneiro', latitude: 41.2421, longitude: -8.6786 },
  { code: 'ZRH', city: 'Zúrich', country: 'Suiza', countryCode: 'CH', name: 'Zurich Airport', latitude: 47.4582, longitude: 8.5555 },
  { code: 'GVA', city: 'Ginebra', country: 'Suiza', countryCode: 'CH', name: 'Geneva Airport', latitude: 46.2370, longitude: 6.1092 },
  { code: 'VIE', city: 'Viena', country: 'Austria', countryCode: 'AT', name: 'Vienna International', latitude: 48.1103, longitude: 16.5697 },
  { code: 'ATH', city: 'Atenas', country: 'Grecia', countryCode: 'GR', name: 'Eleftherios Venizelos', latitude: 37.9364, longitude: 23.9445 },
  { code: 'DUB', city: 'Dublín', country: 'Irlanda', countryCode: 'IE', name: 'Dublin Airport', latitude: 53.4264, longitude: -6.2499 },
  { code: 'BRU', city: 'Bruselas', country: 'Bélgica', countryCode: 'BE', name: 'Brussels Airport', latitude: 50.9010, longitude: 4.4856 },
  { code: 'PRG', city: 'Praga', country: 'República Checa', countryCode: 'CZ', name: 'Václav Havel', latitude: 50.1008, longitude: 14.2600 },

  // Latinoamérica
  { code: 'MEX', city: 'Ciudad de México', country: 'México', countryCode: 'MX', name: 'Benito Juárez', latitude: 19.4361, longitude: -99.0719 },
  { code: 'NLU', city: 'Ciudad de México', country: 'México', countryCode: 'MX', name: 'Felipe Ángeles (AIFA)', latitude: 19.7456, longitude: -99.0153 },
  { code: 'CUN', city: 'Cancún', country: 'México', countryCode: 'MX', name: 'Cancún International', latitude: 21.0365, longitude: -86.8771 },
  { code: 'GDL', city: 'Guadalajara', country: 'México', countryCode: 'MX', name: 'Miguel Hidalgo', latitude: 20.5218, longitude: -103.3112 },
  { code: 'PTY', city: 'Ciudad de Panamá', country: 'Panamá', countryCode: 'PA', name: 'Tocumen', latitude: 9.0714, longitude: -79.3835 },
  { code: 'LIM', city: 'Lima', country: 'Perú', countryCode: 'PE', name: 'Jorge Chávez', latitude: -12.0219, longitude: -77.1143 },
  { code: 'CUZ', city: 'Cusco', country: 'Perú', countryCode: 'PE', name: 'Alejandro Velasco Astete', latitude: -13.5357, longitude: -71.9388 },
  { code: 'SCL', city: 'Santiago', country: 'Chile', countryCode: 'CL', name: 'Arturo Merino Benítez', latitude: -33.3930, longitude: -70.7858 },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', name: 'Ministro Pistarini (Ezeiza)', latitude: -34.8222, longitude: -58.5358 },
  { code: 'AEP', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', name: 'Aeroparque Jorge Newbery', latitude: -34.5592, longitude: -58.4156 },
  { code: 'GRU', city: 'São Paulo', country: 'Brasil', countryCode: 'BR', name: 'Guarulhos', latitude: -23.4356, longitude: -46.4731 },
  { code: 'GIG', city: 'Río de Janeiro', country: 'Brasil', countryCode: 'BR', name: 'Galeão', latitude: -22.8089, longitude: -43.2436 },
  { code: 'UIO', city: 'Quito', country: 'Ecuador', countryCode: 'EC', name: 'Mariscal Sucre', latitude: -0.1292, longitude: -78.3575 },
  { code: 'GYE', city: 'Guayaquil', country: 'Ecuador', countryCode: 'EC', name: 'José Joaquín de Olmedo', latitude: -2.1574, longitude: -79.8836 },
  { code: 'SJO', city: 'San José', country: 'Costa Rica', countryCode: 'CR', name: 'Juan Santamaría', latitude: 9.9939, longitude: -84.2089 },
  { code: 'SDQ', city: 'Santo Domingo', country: 'República Dominicana', countryCode: 'DO', name: 'Las Américas', latitude: 18.4297, longitude: -69.6689 },
  { code: 'PUJ', city: 'Punta Cana', country: 'República Dominicana', countryCode: 'DO', name: 'Punta Cana International', latitude: 18.5674, longitude: -68.3634 },
  { code: 'MVD', city: 'Montevideo', country: 'Uruguay', countryCode: 'UY', name: 'Carrasco', latitude: -34.8384, longitude: -56.0308 },

  // Oceanía & África
  { code: 'SYD', city: 'Sídney', country: 'Australia', countryCode: 'AU', name: 'Kingsford Smith', latitude: -33.9399, longitude: 151.1753 },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', countryCode: 'AU', name: 'Melbourne Airport', latitude: -37.6690, longitude: 144.8410 },
  { code: 'AKL', city: 'Auckland', country: 'Nueva Zelanda', countryCode: 'NZ', name: 'Auckland Airport', latitude: -37.0082, longitude: 174.7850 },
  { code: 'CAI', city: 'El Cairo', country: 'Egipto', countryCode: 'EG', name: 'Cairo International', latitude: 30.1219, longitude: 31.4056 },
  { code: 'JNB', city: 'Johannesburgo', country: 'Sudáfrica', countryCode: 'ZA', name: 'O. R. Tambo', latitude: -26.1367, longitude: 28.2411 },
  { code: 'CPT', city: 'Ciudad del Cabo', country: 'Sudáfrica', countryCode: 'ZA', name: 'Cape Town International', latitude: -33.9715, longitude: 18.6021 }
];

function normalizeAirportStr(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca un aeropuerto o ciudad en la base de datos a partir de código IATA, ciudad o nombre
 * @param {string} query
 * @returns {object|null}
 */
export function findAirport(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim();

  // 1. Extraer código de 3 letras mayúsculas si existe (ej. "MAD", "BOG (El Dorado)", "Incheon (ICN)")
  const rawIataMatch = clean.match(/\b([A-Z]{3})\b/);
  const iataCode = rawIataMatch ? rawIataMatch[1].toUpperCase() : (clean.length === 3 ? clean.toUpperCase() : null);

  if (iataCode) {
    const match = AIRPORTS_AND_CITIES.find(a => a.code === iataCode);
    if (match) return match;
  }

  const norm = normalizeAirportStr(clean);
  if (!norm) return null;

  // 2. Coincidencia directa de código en minúsculas
  const matchByCode = AIRPORTS_AND_CITIES.find(a => a.code.toLowerCase() === norm);
  if (matchByCode) return matchByCode;

  // 3. Coincidencias especiales para principales hubs mundiales y sus variantes ortográficas
  if (norm.includes('abu dhabi') || norm.includes('abu dabi') || norm.includes('abudhabi') || norm.includes('abudabi') || norm === 'auh') {
    return AIRPORTS_AND_CITIES.find(a => a.code === 'AUH') || null;
  }
  if (norm.includes('dubai') || norm.includes('dubai') || norm === 'dxb') {
    return AIRPORTS_AND_CITIES.find(a => a.code === 'DXB') || null;
  }
  if (norm.includes('doha') || norm === 'doh') {
    return AIRPORTS_AND_CITIES.find(a => a.code === 'DOH') || null;
  }
  if (norm.includes('incheon') || norm === 'ich' || norm === 'icn') {
    return AIRPORTS_AND_CITIES.find(a => a.code === 'ICN') || null;
  }

  // 4. Coincidencia por ciudad
  const matchByCity = AIRPORTS_AND_CITIES.find(a => {
    const normCity = normalizeAirportStr(a.city);
    return normCity === norm || norm.includes(normCity) || normCity.includes(norm);
  });
  if (matchByCity) return matchByCity;

  // 5. Coincidencia por nombre de aeropuerto
  const matchByName = AIRPORTS_AND_CITIES.find(a => {
    const normName = normalizeAirportStr(a.name);
    return normName === norm || norm.includes(normName) || normName.includes(norm);
  });
  if (matchByName) return matchByName;

  return null;
}

