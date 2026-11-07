import React from 'react';
import {
  Filter,
  Search,
  X,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  MapPin,
  Tag,
  CreditCard,
  Calendar,
  Banknote,
  Coins
} from 'lucide-react';
import { cleanCountryText } from '../../../../utils/countries';
import { CURRENCY_MAP } from '../../../../utils/currencies';

export function BalanceFiltrosPanel({
  showFiltersPanel,
  setShowFiltersPanel,
  searchText,
  setSearchText,
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
  selectedCategoria,
  setSelectedCategoria,
  selectedModalidad,
  setSelectedModalidad,
  selectedPresupuesto,
  setSelectedPresupuesto,
  selectedTC,
  setSelectedTC,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  selectedMoneda,
  setSelectedMoneda,
  availableCountries,
  availableCities,
  availableCurrencies,
  availableTCs,
  hasActiveFilters,
  activeFiltersCount,
  clearAllFilters,
  filteredTotals
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10 shadow-sm space-y-3">
      {/* Cabecera del panel de filtros con buscador y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="p-1.5 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 text-[#FFE500] shrink-0">
            <Filter className="w-4 h-4" />
          </span>
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por concepto, comercio o lugar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#F1F5F9] placeholder-[#8492A6] focus:outline-none transition-colors"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8492A6] hover:text-[#F1F5F9]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-1 rounded-lg bg-[#FF2E55]/10 border border-[#FF2E55]/30 hover:bg-[#FF2E55]/20 text-[#FF2E55] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar ({activeFiltersCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="px-2.5 py-1 rounded-lg bg-[#151B27] border border-[#1C2436] hover:text-[#F1F5F9] text-[#8492A6] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{showFiltersPanel ? 'Ocultar Opciones' : 'Ver Filtros'}</span>
            {showFiltersPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Formulario de selectores de filtros colapsable */}
      {showFiltersPanel && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#1C2436] animate-in fade-in duration-150 text-xs">
          {/* 1. FILTRO POR PAÍS */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>🌍</span> País (del viaje)
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Países ({availableCountries.length})</option>
              {availableCountries.map((c) => (
                <option key={c.code || c.name} value={(c.code || c.name).toLowerCase()}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. FILTRO POR CIUDAD */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00E5FF]" /> Ciudad
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas las Ciudades ({availableCities.length})</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* 3. FILTRO POR CATEGORÍA / TIPO */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#FFE500]" /> Tipo / Categoría
            </label>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="transporte">🚗 Transporte / Vuelos</option>
              <option value="alojamiento">🏨 Alojamiento / Hoteles</option>
              <option value="comida">🍽️ Comida / Restaurantes</option>
              <option value="actividades">🎟️ Actividades / Tours</option>
              <option value="compras">🛍️ Compras / Souvenirs</option>
              <option value="otros">📌 Otros Gastos</option>
            </select>
          </div>

          {/* 4. FILTRO POR MODALIDAD: ADELANTADOS VS EN RUTA */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#B55FE6]" /> Modalidad de Pago
            </label>
            <select
              value={selectedModalidad}
              onChange={(e) => setSelectedModalidad(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas las Modalidades</option>
              <option value="adelantados">🛡️ Pre-Viaje / Adelantados (Hundidos)</option>
              <option value="en_ruta">🚶 En Ruta (Durante el viaje)</option>
            </select>
          </div>

          {/* 5. FILTRO POR FECHA DESDE */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#00FF85]" /> Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            />
          </div>

          {/* 6. FILTRO POR FECHA HASTA */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#00FF85]" /> Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            />
          </div>

          {/* 7. FILTRO COMPUTABILIDAD EN PRESUPUESTO */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Banknote className="w-3 h-3 text-[#FFE500]" /> De Presupuesto
            </label>
            <select
              value={selectedPresupuesto}
              onChange={(e) => setSelectedPresupuesto(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos (Presupuesto y Terceros)</option>
              <option value="en_presupuesto">✅ En Presupuesto (Descuenta)</option>
              <option value="fuera_presupuesto">🚫 Fuera Presupuesto (Terceros)</option>
            </select>
          </div>

          {/* 8. FILTRO POR DIVISA DE COMPRA */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3 text-[#00E5FF]" /> Moneda de Pago
            </label>
            <select
              value={selectedMoneda}
              onChange={(e) => setSelectedMoneda(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas las Monedas ({availableCurrencies.length})</option>
              {availableCurrencies.map((curr) => (
                <option key={curr} value={curr}>
                  {CURRENCY_MAP[curr]?.flag || '💱'} {curr}
                </option>
              ))}
            </select>
          </div>

          {/* 9. FILTRO POR TARJETA DE CRÉDITO (TC) / MEDIO DE PAGO */}
          <div>
            <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#00E5FF]" /> Tarjeta (TC) / Pago
            </label>
            <select
              value={selectedTC}
              onChange={(e) => setSelectedTC(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="todas">Todas las Tarjetas / TC ({availableTCs.length})</option>
              {availableTCs.map((tc) => (
                <option key={tc} value={tc}>
                  💳 {tc}
                </option>
              ))}
              <option value="__sin_tc__">💵 Efectivo / Sin TC asignada</option>
            </select>
          </div>
        </div>
      )}

      {/* Resumen de badges de filtros activos y subtotales */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-[#1C2436] flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#8492A6] uppercase">Filtrando por:</span>
            {selectedCountry !== 'todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#FFE500] font-semibold text-[11px]">
                País: {cleanCountryText(selectedCountry)}
                <button type="button" onClick={() => setSelectedCountry('todos')} className="hover:text-white">×</button>
              </span>
            )}
            {selectedCity !== 'todas' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#00E5FF] font-semibold text-[11px]">
                Ciudad: {selectedCity}
                <button type="button" onClick={() => setSelectedCity('todas')} className="hover:text-white">×</button>
              </span>
            )}
            {selectedCategoria !== 'todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#F1F5F9] font-semibold text-[11px]">
                Tipo: {selectedCategoria}
                <button type="button" onClick={() => setSelectedCategoria('todos')} className="hover:text-white">×</button>
              </span>
            )}
            {selectedModalidad !== 'todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#B55FE6] font-semibold text-[11px]">
                {selectedModalidad === 'adelantados' ? 'Pre-viaje' : 'En ruta'}
                <button type="button" onClick={() => setSelectedModalidad('todos')} className="hover:text-white">×</button>
              </span>
            )}
            {selectedPresupuesto !== 'todos' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#00FF85] font-semibold text-[11px]">
                {selectedPresupuesto === 'en_presupuesto' ? 'En presupuesto' : 'Fuera presupuesto'}
                <button type="button" onClick={() => setSelectedPresupuesto('todos')} className="hover:text-white">×</button>
              </span>
            )}
            {selectedTC !== 'todas' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#00E5FF] font-semibold text-[11px]">
                TC: {selectedTC === '__sin_tc__' ? 'Efectivo / Sin TC' : selectedTC}
                <button type="button" onClick={() => setSelectedTC('todas')} className="hover:text-white">×</button>
              </span>
            )}
            {(fechaDesde || fechaHasta) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#00FF85] font-semibold text-[11px]">
                Fechas: {fechaDesde || 'Inicio'} a {fechaHasta || 'Fin'}
                <button type="button" onClick={() => { setFechaDesde(''); setFechaHasta(''); }} className="hover:text-white">×</button>
              </span>
            )}
            {selectedMoneda !== 'todas' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#00E5FF] font-semibold text-[11px]">
                Moneda: {selectedMoneda}
                <button type="button" onClick={() => setSelectedMoneda('todas')} className="hover:text-white">×</button>
              </span>
            )}
          </div>

          <div className="font-semibold text-xs ml-auto flex items-center gap-2">
            <span className="text-[#8492A6]">Total Filtrado:</span>
            <span className="text-[#00FF85] font-bold">
              $ {Math.round(filteredTotals.cop).toLocaleString()} COP
            </span>
            <span className="text-[#8492A6] text-[11px]">
              (~${filteredTotals.usd.toFixed(2)} USD)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BalanceFiltrosPanel;

