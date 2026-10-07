import React, { useState, useRef, useEffect } from 'react';
import { detectCountry, getFlagEmoji } from '../utils/countries';
import { getCountries, formatWithMiniFlag, stripMiniFlag } from '../services/geoApiService';
import MiniFlag from './MiniFlag';

export function CountryInput({
  value,
  onChange,
  placeholder = 'Ej. Colombia o Japón',
  required = false,
  className = '',
  label,
  saveWithMiniFlag = true,
  dropdownAlign = 'auto' // 'auto' | 'left' | 'right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [countryList, setCountryList] = useState([]);
  const [dropdownSide, setDropdownSide] = useState('left');
  const wrapperRef = useRef(null);

  // Calcular alineación inteligente
  const updateDropdownAlignment = () => {
    if (dropdownAlign === 'left' || dropdownAlign === 'right') {
      setDropdownSide(dropdownAlign);
      return;
    }
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
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

  // Cargar lista desde la API pública gratuita al montar
  useEffect(() => {
    let isMounted = true;
    getCountries().then((list) => {
      if (isMounted && Array.isArray(list)) {
        setCountryList(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const countryInfo = detectCountry(value);
  const displayFlag = countryInfo ? countryInfo.flag : '🌍';
  const displayCode = countryInfo?.code || '';

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar sugerencias
  const query = (filter || '').toLowerCase().trim();
  const suggestions = countryList
    .filter((c) => {
      if (!query) return true;
      const cleanQ = stripMiniFlag(query).toLowerCase();
      return (
        c.name.toLowerCase().includes(cleanQ) ||
        (c.en && c.en.toLowerCase().includes(cleanQ)) ||
        c.code.toLowerCase().includes(cleanQ)
      );
    })
    .slice(0, 10);

  const handleSelect = (c) => {
    // Almacenar el nombre limpio del país (ej. "Brasil", "Colombia") evitando artefactos
    // de texto de bandera regional en Windows ("CH Brasil", "BR Brasil")
    const selectedName = c.name;
    onChange(selectedName);
    setFilter(selectedName);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    setFilter(rawVal);
    onChange(rawVal);
    updateDropdownAlignment();
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          {label} {required && <span className="text-[#FF2E55]">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2 bg-[#151B27] border border-[#1C2436] focus-within:border-[#00E5FF] rounded-lg px-2.5 py-1.5 transition-colors">
        {/* Badge con la mini bandera oficial de FlagCDN o emoji */}
        <div
          className="shrink-0 w-7 h-5 flex items-center justify-center bg-[#080A0F] border border-[#1C2436] rounded overflow-hidden"
          title={countryInfo ? `${countryInfo.es} (${countryInfo.code})` : 'País'}
        >
          {displayCode ? (
            <MiniFlag code={displayCode} country={value} className="w-5 h-3.5" />
          ) : (
            <span className="text-xs select-none">{displayFlag}</span>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setFilter(value || '');
            updateDropdownAlignment();
            setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className="bg-transparent text-base sm:text-xs text-[#F1F5F9] w-full focus:outline-none placeholder:text-[#8492A6]/50"
        />
      </div>

      {/* Menú flotante de sugerencias con mini banderas oficiales */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-[100] bg-[#0B0F17]/95 backdrop-blur-md border border-[#1C2436] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden max-h-60 overflow-y-auto w-full sm:w-auto min-w-full sm:min-w-[280px] max-w-[calc(100vw-2.5rem)] ${
            dropdownSide === 'right' ? 'left-0 sm:left-auto sm:right-0' : 'left-0 sm:left-0 sm:right-auto'
          }`}
        >
          {suggestions.length > 0 ? (
            suggestions.map((c) => (
              <button
                type="button"
                key={c.code}
                onClick={() => handleSelect(c)}
                className="w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#151B27] text-[#F1F5F9] transition-colors cursor-pointer border-b border-[#1C2436]/50 last:border-b-0 group"
              >
                <span className="flex items-center gap-2.5 truncate mr-2">
                  <MiniFlag code={c.code} country={c.name} className="w-5 h-3.5 shrink-0" />
                  <span className="font-semibold text-[#F1F5F9] truncate group-hover:text-[#00E5FF] transition-colors">
                    {c.name}
                  </span>
                  {c.en && c.en !== c.name && (
                    <span className="text-[10px] text-[#8492A6] shrink-0">({c.en})</span>
                  )}
                </span>
                <span className="text-[10px] font-bold text-[#00E5FF] uppercase bg-[#151B27] px-1.5 py-0.5 rounded border border-[#1C2436] shrink-0">
                  {c.code}
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-[#8492A6]">
              Sin coincidencias de país
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CountryInput;
