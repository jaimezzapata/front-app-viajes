export const COUNTRY_PALETTE = [
  { hex: '#00FF85', am: 0x00FF85 }, // Verde Neón
  { hex: '#00E5FF', am: 0x00E5FF }, // Cian Eléctrico
  { hex: '#FFB800', am: 0xFFB800 }, // Oro Cálido
  { hex: '#B55FE6', am: 0xB55FE6 }, // Púrpura Neón
  { hex: '#FF5E7E', am: 0xFF5E7E }, // Coral / Fucsia
  { hex: '#38BDF8', am: 0x38BDF8 }, // Azul Cielo
  { hex: '#4ADE80', am: 0x4ADE80 }, // Esmeralda Fresco
  { hex: '#FB923C', am: 0xFB923C }, // Naranja
  { hex: '#A78BFA', am: 0xA78BFA }, // Violeta Pastel
  { hex: '#2DD4BF', am: 0x2DD4BF }, // Turquesa
  { hex: '#F43F5E', am: 0xF43F5E }, // Rosa Neón
  { hex: '#FBBF24', am: 0xFBBF24 }  // Ámbar
];

export function getCountryPaletteColor(countryCode) {
  if (!countryCode) return COUNTRY_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < countryCode.length; i++) {
    hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COUNTRY_PALETTE[Math.abs(hash) % COUNTRY_PALETTE.length];
}

