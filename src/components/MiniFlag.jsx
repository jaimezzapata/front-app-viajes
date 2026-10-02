import React, { useState } from 'react';
import { detectCountry, getFlagEmoji } from '../utils/countries';
import { getMiniFlagUrl, extractIsoFromFlagEmoji } from '../services/geoApiService';

/**
 * Componente para renderizar la mini bandera de un país
 * Usa la imagen de alta definición de FlagCDN con fallback al emoji Unicode
 */
export function MiniFlag({ country, code, className = 'w-4 h-3', showEmojiFallback = true }) {
  const [imgError, setImgError] = useState(false);

  let iso = code;
  if (!iso && country) {
    iso = extractIsoFromFlagEmoji(country);
    if (!iso) {
      const detected = detectCountry(country);
      if (detected) iso = detected.code;
    }
  }

  const emoji = iso ? getFlagEmoji(iso) : '🌍';
  const flagUrl = iso ? getMiniFlagUrl(iso) : '';

  if (!flagUrl || imgError) {
    return showEmojiFallback ? <span className="select-none inline-block text-base leading-none">{emoji}</span> : null;
  }

  return (
    <img
      src={flagUrl}
      alt={country || iso || 'bandera'}
      onError={() => setImgError(true)}
      className={`inline-block rounded-xs object-cover shadow-xs border border-[#1C2436]/60 shrink-0 ${className}`}
      loading="lazy"
    />
  );
}

export default MiniFlag;
