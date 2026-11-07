import React, { useState, useMemo, useEffect } from 'react';
import {
  PieChart,
  FileDown,
  FileSpreadsheet,
  TrendingDown,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Coins,
  ArrowRightLeft,
  Filter,
  Search,
  X,
  Calendar,
  MapPin,
  RotateCcw,
  Tag,
  Building,
  Plane,
  Utensils,
  Camera,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import MiniFlag from '../../../components/MiniFlag';
import { exportTripPdf } from '../use-cases/exportPdf';
import { exportTripExcel } from '../use-cases/exportExcel';
import {
  TRIP_CURRENCIES,
  getCurrenciesForTrip,
  convertCurrency,
  formatCurrencyDisplay,
  CURRENCY_MAP
} from '../../../utils/currencies';
import { cleanCountryText, detectCountry } from '../../../utils/countries';
import { enrichGastoWithLocation, calculateTripBalance } from '../../../utils/balance';

const CATEGORIA_ICONS = {
  transporte: Plane,
  vuelo: Plane,
  alojamiento: Building,
  hotel: Building,
  comida: Utensils,
  actividades: Camera,
  tour: Camera,
  compras: ShoppingBag,
  otros: Tag
};

export function BalanceView({ viaje, onOpenNuevoViaje, balance, gastos = [], eventos = [] }) {
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  // Estados de filtros para auditar y sacar pagos
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('todos');
  const [selectedCity, setSelectedCity] = useState('todas');
  const [selectedCategoria, setSelectedCategoria] = useState('todos');
  const [selectedModalidad, setSelectedModalidad] = useState('todos'); // 'todos' | 'adelantados' | 'en_ruta'
  const [selectedPresupuesto, setSelectedPresupuesto] = useState('todos'); // 'todos' | 'en_presupuesto' | 'fuera_presupuesto'
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedMoneda, setSelectedMoneda] = useState('todas');

  // Enriquecer cada gasto con metadata geográfica del viaje y sus eventos asociados
  const enrichedGastos = useMemo(() => {
    return (gastos || []).map(g => enrichGastoWithLocation(g, eventos, viaje));
  }, [gastos, eventos, viaje]);

  // Lista dinámica de países presentes en este viaje
  const availableCountries = useMemo(() => {
    const map = new Map();

    if (viaje?.destino) {
      const d = detectCountry(viaje.destino);
      if (d) map.set((d.code || d.es).toLowerCase(), { code: d.code, name: d.es, flag: d.flag });
    }
    if (Array.isArray(viaje?.destinosMultidestino)) {
      viaje.destinosMultidestino.forEach(d => {
        if (d.destino) {
          const c = detectCountry(d.destino);
          if (c) map.set((c.code || c.es).toLowerCase(), { code: c.code, name: c.es, flag: c.flag });
        }
      });
    }

    enrichedGastos.forEach(g => {
      if (g.countryName && g.countryName !== 'Destino') {
        const key = (g.countryCode || g.countryName).toLowerCase();
        if (!map.has(key)) {
          map.set(key, { code: g.countryCode, name: g.countryName, flag: g.flag });
        }
      }
    });

    return Array.from(map.values());
  }, [viaje, enrichedGastos]);

  // Lista dinámica de ciudades según el país seleccionado o todo el viaje
  const availableCities = useMemo(() => {
    const set = new Set();

    if (Array.isArray(viaje?.destinosMultidestino)) {
      viaje.destinosMultidestino.forEach(d => {
        if (d.ciudad) set.add(d.ciudad.trim());
      });
    }

    enrichedGastos.forEach(g => {
      if (selectedCountry && selectedCountry !== 'todos') {
        const matchesCountry =
          (g.countryCode && g.countryCode.toLowerCase() === selectedCountry.toLowerCase()) ||
          (g.countryName && g.countryName.toLowerCase() === selectedCountry.toLowerCase());
        if (matchesCountry && g.cityName) {
          set.add(g.cityName.trim());
        }
      } else if (g.cityName) {
        set.add(g.cityName.trim());
      }
    });

    return Array.from(set).sort();
  }, [viaje, enrichedGastos, selectedCountry]);

  // Sincronizar ciudad si cambia el país seleccionado
  useEffect(() => {
    if (selectedCountry !== 'todos' && selectedCity !== 'todas') {
      const exists = availableCities.includes(selectedCity);
      if (!exists) {
        setSelectedCity('todas');
      }
    }
  }, [selectedCountry, availableCities, selectedCity]);

  // Lista de monedas presentes en los gastos
  const availableCurrencies = useMemo(() => {
    const set = new Set();
    enrichedGastos.forEach(g => {
      if (g.monedaOriginal) set.add(g.monedaOriginal.toUpperCase());
    });
    return Array.from(set).sort();
  }, [enrichedGastos]);

  // Filtrado reactivo de todos los pagos
  const filteredGastos = useMemo(() => {
    return enrichedGastos.filter(g => {
      // 1. Filtro por País
      if (selectedCountry !== 'todos') {
        const matchesCountry =
          (g.countryCode && g.countryCode.toLowerCase() === selectedCountry.toLowerCase()) ||
          (g.countryName && g.countryName.toLowerCase() === selectedCountry.toLowerCase());
        if (!matchesCountry) return false;
      }

      // 2. Filtro por Ciudad
      if (selectedCity !== 'todas') {
        if (!g.cityName || g.cityName.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // 3. Filtro por Categoría / Tipo
      if (selectedCategoria !== 'todos') {
        const cat = (g.categoria || 'otros').toLowerCase();
        if (cat !== selectedCategoria.toLowerCase()) return false;
      }

      // 4. Filtro por Modalidad (Adelantados vs En Ruta)
      if (selectedModalidad === 'adelantados') {
        if (!g.pagadoAdelantado) return false;
      } else if (selectedModalidad === 'en_ruta') {
        if (g.pagadoAdelantado) return false;
      }

      // 5. Filtro de Presupuesto (Computables vs Fuera de presupuesto)
      if (selectedPresupuesto === 'en_presupuesto') {
        if (g.noComputar) return false;
      } else if (selectedPresupuesto === 'fuera_presupuesto') {
        if (!g.noComputar) return false;
      }

      // 6. Moneda de compra
      if (selectedMoneda !== 'todas') {
        if ((g.monedaOriginal || '').toUpperCase() !== selectedMoneda.toUpperCase()) return false;
      }

      // 7. Filtro por Fecha Desde
      if (fechaDesde) {
        const gDate = g.fechaGasto ? new Date(g.fechaGasto).setHours(0, 0, 0, 0) : null;
        const fDesde = new Date(fechaDesde).setHours(0, 0, 0, 0);
        if (gDate && gDate < fDesde) return false;
      }

      // 8. Filtro por Fecha Hasta
      if (fechaHasta) {
        const gDate = g.fechaGasto ? new Date(g.fechaGasto).setHours(23, 59, 59, 999) : null;
        const fHasta = new Date(fechaHasta).setHours(23, 59, 59, 999);
        if (gDate && gDate > fHasta) return false;
      }

      // 9. Búsqueda por texto libre
      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const matchConcepto = (g.concepto || '').toLowerCase().includes(q);
        const matchCat = (g.categoria || '').toLowerCase().includes(q);
        const matchCity = (g.cityName || '').toLowerCase().includes(q);
        const matchCountry = (g.countryName || '').toLowerCase().includes(q);
        if (!matchConcepto && !matchCat && !matchCity && !matchCountry) return false;
      }

      return true;
    });
  }, [
    enrichedGastos,
    selectedCountry,
    selectedCity,
    selectedCategoria,
    selectedModalidad,
    selectedPresupuesto,
    selectedMoneda,
    fechaDesde,
    fechaHasta,
    searchText
  ]);

  // Totales y estadísticas del conjunto filtrado
  const filteredTotals = useMemo(() => {
    let cop = 0;
    let usd = 0;
    let adelCOP = 0;
    let enRutaCOP = 0;

    filteredGastos.forEach(g => {
      const gCop = Number(g.montoCOP) || 0;
      const gUsd = Number(g.montoUSD) || 0;
      cop += gCop;
      usd += gUsd;
      if (g.pagadoAdelantado) {
        adelCOP += gCop;
      } else if (!g.noComputar) {
        enRutaCOP += gCop;
      }
    });

    return { cop, usd, adelCOP, enRutaCOP };
  }, [filteredGastos]);

  // Recalcular balance dinámico para el conjunto filtrado
  const dynamicBalance = useMemo(() => {
    return calculateTripBalance(viaje, filteredGastos);
  }, [viaje, filteredGastos]);

  // Detección de filtros activos
  const activeFiltersCount = [
    selectedCountry !== 'todos',
    selectedCity !== 'todas',
    selectedCategoria !== 'todos',
    selectedModalidad !== 'todos',
    selectedPresupuesto !== 'todos',
    selectedMoneda !== 'todas',
    Boolean(fechaDesde),
    Boolean(fechaHasta),
    Boolean(searchText.trim())
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const clearAllFilters = () => {
    setSelectedCountry('todos');
    setSelectedCity('todas');
    setSelectedCategoria('todos');
    setSelectedModalidad('todos');
    setSelectedPresupuesto('todos');
    setSelectedMoneda('todas');
    setFechaDesde('');
    setFechaHasta('');
    setSearchText('');
  };

  // Cadena descriptiva de los filtros para los reportes de exportación
  const filterDescription = useMemo(() => {
    if (!hasActiveFilters) return '';
    const parts = [];
    if (selectedCountry !== 'todos') parts.push(`País: ${selectedCountry}`);
    if (selectedCity !== 'todas') parts.push(`Ciudad: ${selectedCity}`);
    if (selectedCategoria !== 'todos') parts.push(`Categoría: ${selectedCategoria}`);
    if (selectedModalidad === 'adelantados') parts.push('Adelantados');
    if (selectedModalidad === 'en_ruta') parts.push('En ruta');
    if (selectedPresupuesto === 'en_presupuesto') parts.push('En presupuesto');
    if (selectedPresupuesto === 'fuera_presupuesto') parts.push('Fuera de presupuesto');
    if (fechaDesde || fechaHasta) parts.push(`Fechas: ${fechaDesde || 'Inicio'} a ${fechaHasta || 'Fin'}`);
    if (searchText.trim()) parts.push(`"${searchText.trim()}"`);
    return parts.join(' • ');
  }, [hasActiveFilters, selectedCountry, selectedCity, selectedCategoria, selectedModalidad, selectedPresupuesto, fechaDesde, fechaHasta, searchText]);

  // Exportar PDF con los datos y filtros aplicados
  const handleExport = (onlyFiltered = true) => {
    if (!viaje) return;
    const targetGastos = (onlyFiltered && hasActiveFilters) ? filteredGastos : (gastos || []);
    const targetBalance = (onlyFiltered && hasActiveFilters) ? dynamicBalance : balance;
    exportTripPdf({
      viaje,
      balance: targetBalance,
      gastos: targetGastos,
      eventos: eventos || [],
      filterTitle: (onlyFiltered && hasActiveFilters) ? filterDescription : ''
    });
  };

  // Exportar Excel (.xlsx) con los datos y filtros aplicados
  const handleExportExcel = async (onlyFiltered = true) => {
    if (!viaje || exportingExcel) return;
    try {
      setExportingExcel(true);
      const targetGastos = (onlyFiltered && hasActiveFilters) ? filteredGastos : (gastos || []);
      const targetBalance = (onlyFiltered && hasActiveFilters) ? dynamicBalance : balance;
      await exportTripExcel({
        viaje,
        balance: targetBalance,
        gastos: targetGastos,
        eventos: eventos || [],
        filterTitle: (onlyFiltered && hasActiveFilters) ? filterDescription : ''
      });
    } catch (err) {
      console.error('Error al exportar a Excel:', err);
    } finally {
      setExportingExcel(false);
    }
  };

  const semaforoColorClass = {
    verde: 'bg-[#00FF85] text-[#00FF85] border-[#00FF85]',
    amarillo: 'bg-[#FFE500] text-[#FFE500] border-[#FFE500]',
    rojo: 'bg-[#FF2E55] text-[#FF2E55] border-[#FF2E55]'
  };

  if (!viaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={PieChart} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#FFE500]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#FFE500] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">Balance & Dashboard</h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <PieChart className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">No hay viajes registrados</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Para ver el balance presupuestario, distribución de costos y semáforos de gasto, primero crea un viaje en la base de datos.
          </p>
          {onOpenNuevoViaje && (
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Primer Viaje
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active KPIs a mostrar: Si hay filtro, mostrar métricas del filtro con indicador
  const displayBalance = hasActiveFilters ? dynamicBalance : balance;

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 w-full max-w-full overflow-hidden">
      {/* Marca de agua sólida */}
      <WatermarkIcon icon={PieChart} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#FFE500]" />

      {/* Header Ejecutivo con Botones de Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FFE500] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Balance & Finanzas
            </h2>
            {viaje?.destino && (
              <span className="text-xs sm:text-sm font-semibold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/20 px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-md">
                {cleanCountryText(viaje.destino)}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-[#8492A6] m-0">
            Auditoría de pagos, costos hundidos, multidivisa y filtros avanzados por país, ciudad y fechas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => handleExport(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFE500] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            title={hasActiveFilters ? `Exportar PDF con los ${filteredGastos.length} pagos filtrados` : 'Exportar reporte formal en PDF'}
          >
            <FileDown className="w-4 h-4" strokeWidth={2.5} />
            <span>{hasActiveFilters ? `PDF (${filteredGastos.length})` : 'Exportar PDF'}</span>
          </button>
          <button
            onClick={() => handleExportExcel(true)}
            disabled={exportingExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-sm"
            title={hasActiveFilters ? `Exportar Excel con los ${filteredGastos.length} pagos filtrados` : 'Exportar libro de cálculo Excel (.xlsx)'}
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={2.5} />
            <span>{exportingExcel ? 'Generando...' : (hasActiveFilters ? `Excel (${filteredGastos.length})` : 'Exportar Excel')}</span>
          </button>
        </div>
      </div>

      {/* PANEL DE FILTROS AVANZADOS (POR PAÍS, CIUDAD, FECHAS, TIPO, ADELANTADOS, PRESUPUESTO) */}
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

      {/* Tarjetas de KPIs Principales (Dinámicas según filtros aplicados) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 relative z-10">
        {/* Presupuesto Total */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={Banknote} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">Presupuesto Asignado</p>
          <p className="text-xl font-bold text-[#F1F5F9] mt-1 m-0">
            $ {Math.round(viaje?.presupuestoTotal || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#00E5FF] font-medium">{viaje?.monedaBase || 'COP'}</span>
        </div>

        {/* Total Consumido */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={TrendingDown} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00FF85]" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
              {hasActiveFilters ? 'Consumido (Filtrado)' : 'Total Consumido'}
            </p>
            {hasActiveFilters && (
              <span className="text-[9px] font-bold bg-[#FFE500]/15 text-[#FFE500] px-1.5 py-0.2 rounded border border-[#FFE500]/30 uppercase">
                Filtro Activo
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-[#00FF85] mt-1 m-0">
            $ {Math.round(hasActiveFilters ? filteredTotals.cop : (balance?.totalGastadoCOP || 0)).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">
            ~${Number(hasActiveFilters ? filteredTotals.usd : (balance?.totalGastadoUSD || 0)).toFixed(2)} USD
          </span>
        </div>

        {/* Dinero Requerido en Ruta */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={CreditCard} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#FFE500]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
            {hasActiveFilters ? 'En Ruta (Filtrado)' : 'Dinero en Ruta'}
          </p>
          <p className="text-xl font-bold text-[#FFE500] mt-1 m-0">
            $ {Math.round(hasActiveFilters ? filteredTotals.enRutaCOP : (balance?.dineroRequeridoEnRutaCOP || 0)).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">Efectivo / Tarjetas durante el viaje</span>
        </div>

        {/* Costos Hundidos (Adelantados) */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={ShieldCheck} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#B55FE6]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">
            {hasActiveFilters ? 'Adelantado (Filtrado)' : 'Costos Hundidos'}
          </p>
          <p className="text-xl font-bold text-[#B55FE6] mt-1 m-0">
            $ {Math.round(hasActiveFilters ? filteredTotals.adelCOP : (balance?.pagadoAdelantadoCOP || 0)).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">Pre-pagados antes de viajar</span>
        </div>
      </div>

      {/* Multidivisa: Consumo en todas las monedas del viaje */}
      <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider m-0">
              {hasActiveFilters ? 'Total Filtrado en Divisas del Viaje' : 'Total Consumido en las Monedas de tu Viaje'}
            </h3>
          </div>
          <span className="text-[11px] text-[#8492A6]">
            Base de Cálculo: <strong>$ {Math.round(hasActiveFilters ? filteredTotals.cop : (balance?.totalGastadoCOP || 0)).toLocaleString()} COP</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(viaje ? getCurrenciesForTrip(viaje) : TRIP_CURRENCIES).map((curr) => {
            const baseCOP = hasActiveFilters ? filteredTotals.cop : (balance?.totalGastadoCOP || 0);
            const amountInCurr = convertCurrency(baseCOP, 'COP', curr.code);
            return (
              <div
                key={curr.code}
                className="p-2.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85]/30 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-[#8492A6] mb-1">
                  <span className="flex items-center gap-1 font-bold text-[#F1F5F9]">
                    <span>{curr.flag}</span>
                    <span>{curr.code}</span>
                  </span>
                  <span className="text-[9px] text-[#8492A6]">{curr.symbol}</span>
                </div>
                <p className="text-sm font-extrabold text-[#00FF85] m-0 truncate">
                  {formatCurrencyDisplay(amountInCurr, curr.code, false)}
                </p>
                <span className="text-[9px] text-[#8492A6] block truncate mt-0.5">
                  {curr.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Semáforo de Presupuesto por Categoría */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider m-0 flex items-center gap-2">
            <span>Semáforo de Presupuesto por Categoría</span>
            {hasActiveFilters && (
              <span className="text-[10px] text-[#FFE500] font-semibold bg-[#FFE500]/10 px-2 py-0.5 rounded border border-[#FFE500]/20">
                Calculado sobre selección
              </span>
            )}
          </h3>
          <span className="text-xs text-[#8492A6]">
            Consumido: <strong className="text-[#F1F5F9]">{displayBalance?.porcentajeConsumido || 0}%</strong>
          </span>
        </div>

        {displayBalance?.semaforoCategorias && displayBalance.semaforoCategorias.length > 0 ? (
          <div className="space-y-4">
            {displayBalance.semaforoCategorias.map((cat) => {
              const barColor = cat.color === 'rojo' ? 'bg-[#FF2E55]' : (cat.color === 'amarillo' ? 'bg-[#FFE500]' : 'bg-[#00FF85]');

              return (
                <div key={cat.categoria} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#F1F5F9]">{cat.categoria}</span>
                    <span className="text-[#8492A6]">
                      <strong className="text-[#F1F5F9]">$ {Math.round(cat.consumidoCOP).toLocaleString()}</strong>
                      {cat.limiteCOP > 0 && ` / $ ${Math.round(cat.limiteCOP).toLocaleString()}`}
                      <span className={`ml-2 font-bold ${
                        cat.color === 'rojo' ? 'text-[#FF2E55]' : (cat.color === 'amarillo' ? 'text-[#FFE500]' : 'text-[#00FF85]')
                      }`}>
                        ({cat.porcentaje}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#151B27] overflow-hidden">
                    <div
                      className={`h-full ${barColor}`}
                      style={{ width: `${Math.min(cat.porcentaje || 0, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#8492A6] m-0">No hay categorías configuradas aún.</p>
        )}
      </div>

      {/* SECCIÓN DETALLADA: DESGLOSE Y AUDITORÍA DE PAGOS / TRANSACCIONES */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] relative z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#1C2436] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 text-[#FFE500]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0 flex items-center gap-2">
                <span>Desglose Detallado de Pagos</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#151B27] border border-[#1C2436] text-[#00E5FF] font-bold">
                  {filteredGastos.length} {filteredGastos.length === 1 ? 'pago' : 'pagos'}
                </span>
              </h3>
              <p className="text-xs text-[#8492A6] m-0 mt-0.5">
                {hasActiveFilters ? 'Transacciones según los filtros aplicados' : 'Registro de todos los pagos y costos del viaje'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/30 px-2.5 py-1 rounded-lg">
              $ {Math.round(filteredTotals.cop).toLocaleString()} COP
            </span>
            <span className="text-xs font-bold text-[#8492A6] bg-[#151B27] border border-[#1C2436] px-2 py-1 rounded-lg">
              ~${filteredTotals.usd.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* LISTADO DE PAGOS */}
        {filteredGastos.length === 0 ? (
          <div className="p-8 text-center bg-[#151B27]/40 rounded-xl border border-dashed border-[#1C2436]">
            <AlertCircle className="w-8 h-8 text-[#8492A6] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#F1F5F9] m-0">No se encontraron pagos con estos filtros</p>
            <p className="text-xs text-[#8492A6] mt-1 m-0">Prueba cambiando las fechas, la categoría o seleccionando otro país/ciudad.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#FFE500] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restablecer Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            {/* Tabla para Desktop / Tablet */}
            <table className="w-full text-left text-xs border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-[#1C2436] text-[11px] font-bold uppercase tracking-wider text-[#8492A6] bg-[#151B27]/60">
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Concepto / Comercio</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Destino (País / Ciudad)</th>
                  <th className="py-2.5 px-3">Modalidad</th>
                  <th className="py-2.5 px-3 text-right">Monto Original</th>
                  <th className="py-2.5 px-3 text-right">Subtotal COP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2436]/60">
                {filteredGastos.map((g) => {
                  const Icon = CATEGORIA_ICONS[g.categoria?.toLowerCase()] || Tag;
                  const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
                  const dateStr = g.fechaGasto ? new Date(g.fechaGasto).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

                  return (
                    <tr key={g.id} className="hover:bg-[#151B27]/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-[#8492A6] font-medium">
                        {dateStr}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#F1F5F9] max-w-xs truncate" title={g.concepto}>
                        {g.concepto || 'Sin concepto'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#151B27] border border-[#1C2436] text-[#CBD5E1]">
                          <Icon className="w-3 h-3 text-[#00E5FF]" />
                          {g.categoria || 'otros'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1]">
                          <MiniFlag country={g.countryName} code={g.countryCode} className="w-3.5 h-2.5" />
                          <span className="font-medium">
                            {g.cityName ? `${g.cityName}${g.countryName ? `, ${cleanCountryText(g.countryName)}` : ''}` : cleanCountryText(g.countryName)}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          {g.pagadoAdelantado ? (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#B55FE6]/15 border border-[#B55FE6]/30 text-[#B55FE6]">
                              Pre-Viaje
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 border border-[#00FF85]/30 text-[#00FF85]">
                              En Ruta
                            </span>
                          )}
                          {g.noComputar && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/30 text-[#FF2E55]">
                              Terceros
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-xs text-[#8492A6]">
                        {formatCurrencyDisplay(g.montoOriginal, origCurr, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-[#00FF85] font-mono text-xs">
                        $ {Math.round(g.montoCOP || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Tarjetas Mobile */}
            <div className="md:hidden space-y-2.5 px-4 sm:px-0">
              {filteredGastos.map((g) => {
                const Icon = CATEGORIA_ICONS[g.categoria?.toLowerCase()] || Tag;
                const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
                const dateStr = g.fechaGasto ? new Date(g.fechaGasto).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '-';

                return (
                  <div key={g.id} className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#F1F5F9] m-0 truncate">{g.concepto || 'Sin concepto'}</p>
                        <p className="text-[10px] text-[#8492A6] m-0 mt-0.5 flex items-center gap-1 flex-wrap">
                          <Calendar className="w-3 h-3 text-[#8492A6]" />
                          <span>{dateStr}</span>
                          <span>•</span>
                          <MiniFlag country={g.countryName} code={g.countryCode} className="w-3 h-2" />
                          <span>{g.cityName ? `${g.cityName}${g.countryName ? `, ${cleanCountryText(g.countryName)}` : ''}` : cleanCountryText(g.countryName)}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-[#00FF85] m-0 font-mono">
                          $ {Math.round(g.montoCOP || 0).toLocaleString()}
                        </p>
                        {origCurr !== 'COP' && (
                          <span className="text-[10px] text-[#8492A6] block font-mono">
                            {formatCurrencyDisplay(g.montoOriginal, origCurr, false)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1C2436]/60 pt-2 text-[10px]">
                      <span className="inline-flex items-center gap-1 font-bold uppercase text-[#8492A6]">
                        <Icon className="w-3 h-3 text-[#00E5FF]" />
                        {g.categoria || 'otros'}
                      </span>
                      <div className="flex items-center gap-1">
                        {g.pagadoAdelantado ? (
                          <span className="px-1.5 py-0.2 rounded bg-[#B55FE6]/15 text-[#B55FE6] font-bold uppercase text-[9px]">
                            Pre-Viaje
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-[#00FF85]/15 text-[#00FF85] font-bold uppercase text-[9px]">
                            En Ruta
                          </span>
                        )}
                        {g.noComputar && (
                          <span className="px-1.5 py-0.2 rounded bg-[#FF2E55]/15 text-[#FF2E55] font-bold uppercase text-[9px]">
                            Terceros
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BalanceView;
