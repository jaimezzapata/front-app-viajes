import { useState, useMemo, useEffect } from 'react';
import { exportTripPdf } from '../../use-cases/exportPdf';
import { exportTripExcel } from '../../use-cases/exportExcel';
import { detectCountry } from '../../../../utils/countries';
import { enrichGastoWithLocation, calculateTripBalance } from '../../../../utils/balance';

export function useBalanceFilters({ viaje, gastos = [], eventos = [], balance = null }) {
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('todos');
  const [selectedCity, setSelectedCity] = useState('todas');
  const [selectedCategoria, setSelectedCategoria] = useState('todos');
  const [selectedModalidad, setSelectedModalidad] = useState('todos');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState('todos');
  const [selectedTC, setSelectedTC] = useState('todas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedMoneda, setSelectedMoneda] = useState('todas');

  // Enriquecer cada gasto con metadata geográfica
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

  // Lista dinámica de ciudades según país seleccionado
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

  // Monedas presentes
  const availableCurrencies = useMemo(() => {
    const set = new Set();
    enrichedGastos.forEach(g => {
      if (g.monedaOriginal) set.add(g.monedaOriginal.toUpperCase());
    });
    return Array.from(set).sort();
  }, [enrichedGastos]);

  // Tarjetas de Crédito presentes
  const availableTCs = useMemo(() => {
    const set = new Set();
    enrichedGastos.forEach(g => {
      if (g.tarjetaCredito && g.tarjetaCredito.trim()) {
        set.add(g.tarjetaCredito.trim());
      }
    });
    return Array.from(set).sort();
  }, [enrichedGastos]);

  // Filtrado reactivo de todos los pagos
  const filteredGastos = useMemo(() => {
    return enrichedGastos.filter(g => {
      if (selectedCountry !== 'todos') {
        const matchesCountry =
          (g.countryCode && g.countryCode.toLowerCase() === selectedCountry.toLowerCase()) ||
          (g.countryName && g.countryName.toLowerCase() === selectedCountry.toLowerCase());
        if (!matchesCountry) return false;
      }

      if (selectedCity !== 'todas') {
        if (!g.cityName || g.cityName.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      if (selectedCategoria !== 'todos') {
        const cat = (g.categoria || 'otros').toLowerCase();
        if (cat !== selectedCategoria.toLowerCase()) return false;
      }

      if (selectedModalidad === 'adelantados') {
        if (!g.pagadoAdelantado) return false;
      } else if (selectedModalidad === 'en_ruta') {
        if (g.pagadoAdelantado) return false;
      }

      if (selectedPresupuesto === 'en_presupuesto') {
        if (g.noComputar) return false;
      } else if (selectedPresupuesto === 'fuera_presupuesto') {
        if (!g.noComputar) return false;
      }

      if (selectedMoneda !== 'todas') {
        if ((g.monedaOriginal || '').toUpperCase() !== selectedMoneda.toUpperCase()) return false;
      }

      if (selectedTC !== 'todas') {
        if (selectedTC === '__sin_tc__') {
          if (g.tarjetaCredito && g.tarjetaCredito.trim()) return false;
        } else {
          if ((g.tarjetaCredito || '').toLowerCase() !== selectedTC.toLowerCase()) return false;
        }
      }

      if (fechaDesde) {
        const gDate = g.fechaGasto ? new Date(g.fechaGasto).setHours(0, 0, 0, 0) : null;
        const fDesde = new Date(fechaDesde).setHours(0, 0, 0, 0);
        if (gDate && gDate < fDesde) return false;
      }

      if (fechaHasta) {
        const gDate = g.fechaGasto ? new Date(g.fechaGasto).setHours(23, 59, 59, 999) : null;
        const fHasta = new Date(fechaHasta).setHours(23, 59, 59, 999);
        if (gDate && gDate > fHasta) return false;
      }

      if (searchText.trim()) {
        const q = searchText.toLowerCase().trim();
        const matchConcepto = (g.concepto || '').toLowerCase().includes(q);
        const matchCat = (g.categoria || '').toLowerCase().includes(q);
        const matchCity = (g.cityName || '').toLowerCase().includes(q);
        const matchCountry = (g.countryName || '').toLowerCase().includes(q);
        const matchTC = (g.tarjetaCredito || '').toLowerCase().includes(q);
        if (!matchConcepto && !matchCat && !matchCity && !matchCountry && !matchTC) return false;
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
    selectedTC,
    fechaDesde,
    fechaHasta,
    searchText
  ]);

  // Totales de la selección filtrada
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

  // Balance dinámico para la selección
  const dynamicBalance = useMemo(() => {
    return calculateTripBalance(viaje, filteredGastos);
  }, [viaje, filteredGastos]);

  // Conteo de filtros activos
  const activeFiltersCount = [
    selectedCountry !== 'todos',
    selectedCity !== 'todas',
    selectedCategoria !== 'todos',
    selectedModalidad !== 'todos',
    selectedPresupuesto !== 'todos',
    selectedMoneda !== 'todas',
    selectedTC !== 'todas',
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
    setSelectedTC('todas');
    setFechaDesde('');
    setFechaHasta('');
    setSearchText('');
  };

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
    if (selectedTC !== 'todas') parts.push(`TC: ${selectedTC === '__sin_tc__' ? 'Efectivo / Sin TC' : selectedTC}`);
    if (selectedMoneda !== 'todas') parts.push(`Moneda: ${selectedMoneda}`);
    if (fechaDesde || fechaHasta) parts.push(`Fechas: ${fechaDesde || 'Inicio'} a ${fechaHasta || 'Fin'}`);
    if (searchText.trim()) parts.push(`"${searchText.trim()}"`);
    return parts.join(' • ');
  }, [hasActiveFilters, selectedCountry, selectedCity, selectedCategoria, selectedModalidad, selectedPresupuesto, selectedTC, selectedMoneda, fechaDesde, fechaHasta, searchText]);

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

  const displayBalance = hasActiveFilters ? dynamicBalance : balance;

  return {
    exportingExcel,
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
    filteredGastos,
    filteredTotals,
    dynamicBalance,
    displayBalance,
    activeFiltersCount,
    hasActiveFilters,
    clearAllFilters,
    filterDescription,
    handleExport,
    handleExportExcel
  };
}

export default useBalanceFilters;
