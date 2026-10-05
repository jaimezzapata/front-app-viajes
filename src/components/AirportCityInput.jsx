import React, { useState, useRef, useEffect } from 'react';
import { Plane, MapPin, Building2, Search } from 'lucide-react';
import { searchAirports, searchCities, getMiniFlagUrl } from '../services/geoApiService';
import { detectCountry, getFlagEmoji } from '../utils/countries';
import MiniFlag from './MiniFlag';

/**
 * Input inteligente con autocompletado en tiempo real de aeropuertos, ciudades y países
 * Conectado a APIs públicas y gratuitas
 */
export function AirportCityInput({
  value,
  onChange,
  onSelectAirportOrCity,
  type = 'airport', // 'airport' | 'city' | 'both'
  placeholder = 'Buscar aeropuerto o ciudad (Ej. BOG o Tokio)...',
  required = false,
  className = '',
  label,
  dropdownAlign = 'auto' // 'auto' | 'left' | 'right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownSide, setDropdownSide] = useState('left');
  const wrapperRef = useRef(null);

  // Calcular alineación inteligente (evitar salirse por la derecha o izquierda en columnas angostas)
  const updateDropdownAlignment = () => {
    if (dropdownAlign === 'left' || dropdownAlign === 'right') {
      setDropdownSide(dropdownAlign);
      return;
    }
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      // Si el elemento está en la mitad derecha de la pantalla o a menos de 280px del borde derecho
      if (rect.left > screenWidth / 2 || (screenWidth - rect.right < 240)) {
        setDropdownSide('right');
      } else {
        setDropdownSide('left');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownAlignment();
    }
  }, [isOpen, dropdownAlign]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda debounceada en la API
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setResults([]);
      return;
    }

    let active = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        if (type === 'airport') {
          const list = await searchAirports(value, 8);
          if (active) setResults(list.map(a => ({ kind: 'airport', data: a })));
        } else if (type === 'city') {
          const list = await searchCities(value, 8);
          if (active) setResults(list.map(c => ({ kind: 'city', data: c })));
        } else {
          const [airports, cities] = await Promise.all([
            searchAirports(value, 5),
            searchCities(value, 5)
          ]);
          if (active) {
            setResults([
              ...airports.map(a => ({ kind: 'airport', data: a })),
              ...cities.map(c => ({ kind: 'city', data: c }))
            ]);
          }
        }
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value, type]);

  const handleSelect = (item) => {
    if (item.kind === 'airport') {
      const a = item.data;
      const countryInfo = detectCountry(a.country);
      const flagEmoji = countryInfo?.flag || '🌍';
      const countryFormatted = countryInfo ? `${flagEmoji} ${countryInfo.es}` : a.country;

      onChange(a.iata_code || a.city || a.name);

      if (onSelectAirportOrCity) {
        onSelectAirportOrCity({
          iata: a.iata_code || '',
          airportName: a.name || '',
          city: a.city || '',
          country: countryInfo ? countryInfo.es : (a.country || ''),
          countryCode: countryInfo?.code || '',
          countryWithFlag: countryFormatted,
          flagEmoji,
          flagUrl: countryInfo ? getMiniFlagUrl(countryInfo.code) : '',
          lat: a._geoloc?.lat,
          lng: a._geoloc?.lng
        });
      }
    } else {
      const c = item.data;
      const flagEmoji = c.flagEmoji || '🌍';
      const countryFormatted = `${flagEmoji} ${c.country}`;

      onChange(c.city);

      if (onSelectAirportOrCity) {
        onSelectAirportOrCity({
          iata: c.iata || '',
          airportName: c.airportName || '',
          city: c.city,
          country: c.country,
          countryCode: c.countryCode || '',
          countryWithFlag: countryFormatted,
          flagEmoji,
          flagUrl: c.flagUrl || '',
          lat: c.lat,
          lng: c.lng
        });
      }
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          {label} {required && <span className="text-[#FF2E55]">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2 bg-[#151B27] border border-[#1C2436] focus-within:border-[#00E5FF] rounded-lg px-2.5 py-1.5 transition-colors">
        <span className="text-[#00E5FF] shrink-0">
          {type === 'airport' ? <Plane className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            updateDropdownAlignment();
            if (results.length > 0 || (value && value.trim().length >= 2)) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className="bg-transparent text-base sm:text-xs text-[#F1F5F9] w-full focus:outline-none placeholder:text-[#8492A6]/50"
        />

        {loading && (
          <span className="w-3 h-3 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Menú flotante de resultados con diseño amplio, responsive y elegante */}
      {isOpen && (results.length > 0 || (loading && value?.trim()?.length >= 2)) && (
        <div
          className={`absolute top-full mt-1.5 z-[100] bg-[#0B0F17]/95 backdrop-blur-md border border-[#1C2436] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden max-h-72 overflow-y-auto w-full sm:w-auto min-w-full sm:min-w-[360px] max-w-[calc(100vw-2.5rem)] ${
            dropdownSide === 'right' ? 'left-0 sm:left-auto sm:right-0' : 'left-0 sm:left-0 sm:right-auto'
          }`}
        >
          {loading && results.length === 0 ? (
            <div className="p-3.5 text-center text-xs text-[#8492A6] flex items-center justify-center gap-2">
              <span className="w-3 h-3 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
              <span>Buscando aeropuertos y destinos...</span>
            </div>
          ) : (
            results.map((item, idx) => {
              if (item.kind === 'airport') {
                const a = item.data;
                const countryInfo = detectCountry(a.country);
                return (
                  <button
                    type="button"
                    key={`ap-${a.iata_code || a.name}-${idx}`}
                    onClick={() => handleSelect(item)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-[#151B27] transition-all cursor-pointer border-b border-[#1C2436]/50 last:border-b-0 group block"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono font-bold text-xs shrink-0 shadow-sm">
                          ✈️ {a.iata_code || '---'}
                        </span>
                        <span className="font-semibold text-xs text-[#F1F5F9] truncate group-hover:text-[#00E5FF] transition-colors">
                          {a.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/30 px-2 py-0.5 rounded shrink-0 uppercase tracking-wider whitespace-nowrap">
                        Aeropuerto
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#8492A6] mt-1 pl-0.5">
                      {a.city && (
                        <>
                          <span className="text-[#CBD5E1] font-medium truncate max-w-[140px]">{a.city}</span>
                          <span className="text-[#475569]">•</span>
                        </>
                      )}
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <MiniFlag code={countryInfo?.code} country={a.country} className="w-4 h-2.5 shrink-0" />
                        <span className="truncate">{countryInfo ? countryInfo.es : a.country}</span>
                      </span>
                    </div>
                  </button>
                );
              }

              const c = item.data;
              return (
                <button
                  type="button"
                  key={`city-${c.city}-${c.country}-${idx}`}
                  onClick={() => handleSelect(item)}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-[#151B27] transition-all cursor-pointer border-b border-[#1C2436]/50 last:border-b-0 group block"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#FFE500]" />
                      </div>
                      <span className="font-semibold text-xs text-[#F1F5F9] truncate group-hover:text-[#FFE500] transition-colors">
                        {c.city}
                      </span>
                      {c.iata && (
                        <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] text-[10px] font-mono font-bold shrink-0">
                          {c.iata}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-2 py-0.5 rounded shrink-0 uppercase tracking-wider whitespace-nowrap">
                      Ciudad
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#8492A6] mt-1 pl-8">
                    <MiniFlag code={c.countryCode} country={c.country} className="w-4 h-2.5 shrink-0" />
                    <span className="truncate">{c.country}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AirportCityInput;
