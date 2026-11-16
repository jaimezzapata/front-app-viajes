import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileDown,
  FileSpreadsheet,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  Plane,
  Building,
  Utensils,
  Camera,
  ShoppingBag,
  ShieldCheck,
  Tag,
  CreditCard,
  Users,
  User,
  LayoutList,
  Table2,
  ArrowUpDown,
  Edit2,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';
import WatermarkIcon from '../../../components/WatermarkIcon';
import MiniFlag from '../../../components/MiniFlag';
import { cleanCountryText, fixAccents } from '../../../utils/countries';
import { formatCurrencyDisplay } from '../../../utils/currencies';
import {
  buildChronologicalMasterList,
  exportCronogramaPdf,
  exportCronogramaExcel
} from '../use-cases/cronogramaReportUtils';

const CATEGORIA_META = {
  transporte: { label: 'Transporte / Vuelos', icon: Plane, color: 'text-[#00E5FF]', border: 'border-[#00E5FF]/30', bg: 'bg-[#00E5FF]/10' },
  vuelo: { label: 'Vuelo', icon: Plane, color: 'text-[#00E5FF]', border: 'border-[#00E5FF]/30', bg: 'bg-[#00E5FF]/10' },
  alojamiento: { label: 'Alojamiento / Hotel', icon: Building, color: 'text-[#FFE500]', border: 'border-[#FFE500]/30', bg: 'bg-[#FFE500]/10' },
  hotel: { label: 'Hotel', icon: Building, color: 'text-[#FFE500]', border: 'border-[#FFE500]/30', bg: 'bg-[#FFE500]/10' },
  comida: { label: 'Comida / Bebida', icon: Utensils, color: 'text-[#00FF85]', border: 'border-[#00FF85]/30', bg: 'bg-[#00FF85]/10' },
  actividades: { label: 'Actividades / Tours', icon: Camera, color: 'text-[#B55FE6]', border: 'border-[#B55FE6]/30', bg: 'bg-[#B55FE6]/10' },
  compras: { label: 'Compras', icon: ShoppingBag, color: 'text-[#00E5FF]', border: 'border-[#00E5FF]/30', bg: 'bg-[#00E5FF]/10' },
  impuestos: { label: 'Impuestos / Permisos (K-ETA, ETIAS)', icon: ShieldCheck, color: 'text-[#FFE500]', border: 'border-[#FFE500]/30', bg: 'bg-[#FFE500]/10' },
  otros: { label: 'Otros', icon: Tag, color: 'text-[#8492A6]', border: 'border-[#1C2436]', bg: 'bg-[#151B27]' }
};

export function ReportesView({
  viaje,
  eventos = [],
  gastos = [],
  onOpenNuevoViaje,
  onEditEvento,
  onEditGasto
}) {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'tabla'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [showFilters, setShowFilters] = useState(false);
  const [showResumenFinanciero, setShowResumenFinanciero] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('todos');
  const [selectedCity, setSelectedCity] = useState('todas');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState('todos'); // todos | en_presupuesto | fuera_presupuesto
  const [selectedSource, setSelectedSource] = useState('todos'); // todos | con_valor | solo_vuelos | solo_itinerario | solo_billetera
  const [selectedPax, setSelectedPax] = useState('todos'); // todos | 1 | multi
  const [selectedTC, setSelectedTC] = useState('todas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Construir lista cronológica maestra unificada
  const masterItems = useMemo(() => {
    if (!viaje) return [];
    return buildChronologicalMasterList({ viaje, eventos, gastos });
  }, [viaje, eventos, gastos]);

  // Opciones dinámicas para los selectores de filtro
  const filterOptions = useMemo(() => {
    const countriesSet = new Set();
    const citiesSet = new Set();
    const tcsSet = new Set();
    const categoriasSet = new Set();

    masterItems.forEach((it) => {
      if (it.countryName && it.countryName !== '-') countriesSet.add(it.countryName);
      if (it.cityName && it.cityName !== '-') citiesSet.add(it.cityName);
      if (it.tarjetaCredito) tcsSet.add(it.tarjetaCredito);
      if (it.categoria) categoriasSet.add(it.categoria);
    });

    return {
      countries: Array.from(countriesSet).sort(),
      cities: Array.from(citiesSet).sort(),
      tcs: Array.from(tcsSet).sort(),
      categorias: Array.from(categoriasSet).sort()
    };
  }, [masterItems]);

  // Aplicar filtros y ordenamiento
  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    const list = masterItems.filter((it) => {
      if (selectedCountry !== 'todos' && it.countryName.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (selectedCity !== 'todas' && it.cityName.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedCategoria !== 'todas' && it.categoria !== selectedCategoria) {
        return false;
      }
      if (selectedPresupuesto === 'en_presupuesto' && it.noComputar) {
        return false;
      }
      if (selectedPresupuesto === 'fuera_presupuesto' && !it.noComputar) {
        return false;
      }
      if (selectedSource === 'con_valor' && !(it.montoTotalCOP > 0)) {
        return false;
      }
      if (selectedSource === 'solo_vuelos' && it.tipo !== 'vuelo' && it.tipo !== 'transporte' && it.categoria !== 'transporte') {
        return false;
      }
      if (selectedSource === 'solo_itinerario' && !it.rawEvento) {
        return false;
      }
      if (selectedSource === 'solo_billetera' && it.sourceType !== 'gasto_billetera') {
        return false;
      }
      if (selectedPax === '1' && it.cantidadPersonas !== 1) {
        return false;
      }
      if (selectedPax === 'multi' && it.cantidadPersonas <= 1) {
        return false;
      }
      if (selectedTC !== 'todas') {
        if (selectedTC === '__sin_tc__' && it.tarjetaCredito) return false;
        if (selectedTC !== '__sin_tc__' && it.tarjetaCredito !== selectedTC) return false;
      }
      if (fechaDesde && it.dateKey !== 'sin-fecha' && it.dateKey < fechaDesde) {
        return false;
      }
      if (fechaHasta && it.dateKey !== 'sin-fecha' && it.dateKey > fechaHasta) {
        return false;
      }

      if (q) {
        const haystack = [
          it.titulo,
          it.countryName,
          it.cityName,
          it.lugarDetalle,
          it.rutaAerea,
          it.escalaInfo,
          it.categoria,
          it.tarjetaCredito,
          it.notas,
          it.dayLabel,
          it.fechaDisplay
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (sortOrder === 'desc') {
      return [...list].sort((a, b) => b.timestamp - a.timestamp);
    }
    return [...list].sort((a, b) => a.timestamp - b.timestamp);
  }, [
    masterItems,
    searchText,
    selectedCountry,
    selectedCity,
    selectedCategoria,
    selectedPresupuesto,
    selectedSource,
    selectedPax,
    selectedTC,
    fechaDesde,
    fechaHasta,
    sortOrder
  ]);

  // Agrupación Día por Día para la vista de Línea de Tiempo
  const dayGroups = useMemo(() => {
    const groupsMap = new Map();

    filteredItems.forEach((it) => {
      const key = it.dateKey || 'sin-fecha';
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          dateKey: key,
          dayLabel: it.dayLabel,
          fechaDisplay: it.fechaDisplay,
          items: [],
          countriesSet: new Set(),
          citiesSet: new Set(),
          totalDesembolsadoCOP: 0,
          totalPorPersonaCOP: 0,
          enPresupuestoTotalCOP: 0,
          enPresupuestoPorPersonaCOP: 0,
          fueraPresupuestoTotalCOP: 0,
          totalComputableCOP: 0
        });
      }
      const grp = groupsMap.get(key);
      grp.items.push(it);
      if (it.countryName && it.countryName !== '-') grp.countriesSet.add(it.countryName);
      if (it.cityName && it.cityName !== '-') grp.citiesSet.add(it.cityName);

      if (it.esIngreso) {
        grp.totalDesembolsadoCOP -= it.montoTotalCOP || 0;
        grp.totalPorPersonaCOP -= it.montoPorPersonaCOP || 0;
        grp.totalComputableCOP -= it.montoComputableCOP || 0;
      } else {
        grp.totalDesembolsadoCOP += it.montoTotalCOP || 0;
        grp.totalPorPersonaCOP += it.montoPorPersonaCOP || 0;
        grp.totalComputableCOP += it.montoComputableCOP || 0;
        if (it.noComputar) {
          grp.fueraPresupuestoTotalCOP += it.montoTotalCOP || 0;
        } else {
          grp.enPresupuestoTotalCOP += it.montoTotalCOP || 0;
          grp.enPresupuestoPorPersonaCOP += it.montoPorPersonaCOP || 0;
        }
      }
    });

    return Array.from(groupsMap.values()).map((g) => ({
      ...g,
      countries: Array.from(g.countriesSet),
      cities: Array.from(g.citiesSet)
    }));
  }, [filteredItems]);

  // Resumen de totales de la selección actual (discriminando En Presupuesto vs Fuera de Presupuesto)
  const summary = useMemo(() => {
    let totalDesembolsadoCOP = 0;
    let totalPorPersonaCOP = 0;
    let totalPorPersonaUSD = 0;
    let enPresupuestoTotalCOP = 0;
    let enPresupuestoPorPersonaCOP = 0;
    let enPresupuestoPorPersonaUSD = 0;
    let fueraPresupuestoTotalCOP = 0;
    let fueraPresupuestoPorPersonaCOP = 0;
    const fueraPresupuestoItems = [];
    let totalEventos = 0;
    let totalConCosto = 0;
    let enPresupuestoCount = 0;
    const countriesVisited = new Set();
    const citiesVisited = new Set();

    filteredItems.forEach((it) => {
      if (it.rawEvento) totalEventos += 1;
      if (it.montoTotalCOP > 0) totalConCosto += 1;
      if (it.countryName && it.countryName !== '-') countriesVisited.add(it.countryName);
      if (it.cityName && it.cityName !== '-') citiesVisited.add(it.cityName);

      if (it.esIngreso) {
        totalDesembolsadoCOP -= it.montoTotalCOP || 0;
        totalPorPersonaCOP -= it.montoPorPersonaCOP || 0;
        totalPorPersonaUSD -= it.montoPorPersonaUSD || 0;
        enPresupuestoTotalCOP -= it.montoTotalCOP || 0;
        enPresupuestoPorPersonaCOP -= it.montoPorPersonaCOP || 0;
        enPresupuestoPorPersonaUSD -= it.montoPorPersonaUSD || 0;
      } else {
        totalDesembolsadoCOP += it.montoTotalCOP || 0;
        totalPorPersonaCOP += it.montoPorPersonaCOP || 0;
        totalPorPersonaUSD += it.montoPorPersonaUSD || 0;

        if (it.noComputar) {
          if (it.montoTotalCOP > 0) {
            fueraPresupuestoTotalCOP += it.montoTotalCOP || 0;
            fueraPresupuestoPorPersonaCOP += it.montoPorPersonaCOP || 0;
            fueraPresupuestoItems.push(it);
          }
        } else {
          if (it.montoTotalCOP > 0) enPresupuestoCount += 1;
          enPresupuestoTotalCOP += it.montoTotalCOP || 0;
          enPresupuestoPorPersonaCOP += it.montoPorPersonaCOP || 0;
          enPresupuestoPorPersonaUSD += it.montoPorPersonaUSD || 0;
        }
      }
    });

    return {
      totalItems: filteredItems.length,
      totalDays: dayGroups.length,
      totalEventos,
      totalConCosto,
      enPresupuestoCount,
      countriesCount: countriesVisited.size,
      citiesCount: citiesVisited.size,
      totalDesembolsadoCOP,
      totalPorPersonaCOP,
      totalPorPersonaUSD,
      enPresupuestoTotalCOP,
      enPresupuestoPorPersonaCOP,
      enPresupuestoPorPersonaUSD,
      enPresupuestoAcompanantesCOP: Math.max(0, enPresupuestoTotalCOP - enPresupuestoPorPersonaCOP),
      fueraPresupuestoTotalCOP,
      fueraPresupuestoPorPersonaCOP,
      fueraPresupuestoItems
    };
  }, [filteredItems, dayGroups]);

  const activeFiltersCount = [
    searchText.trim() !== '',
    selectedCountry !== 'todos',
    selectedCity !== 'todas',
    selectedCategoria !== 'todas',
    selectedPresupuesto !== 'todos',
    selectedSource !== 'todos',
    selectedPax !== 'todos',
    selectedTC !== 'todas',
    fechaDesde !== '',
    fechaHasta !== ''
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchText('');
    setSelectedCountry('todos');
    setSelectedCity('todas');
    setSelectedCategoria('todas');
    setSelectedPresupuesto('todos');
    setSelectedSource('todos');
    setSelectedPax('todos');
    setSelectedTC('todas');
    setFechaDesde('');
    setFechaHasta('');
  };

  const buildFilterSummaryText = () => {
    const parts = [];
    if (selectedCountry !== 'todos') parts.push(`País: ${selectedCountry}`);
    if (selectedCity !== 'todas') parts.push(`Ciudad: ${selectedCity}`);
    if (selectedCategoria !== 'todas') parts.push(`Categoría: ${selectedCategoria}`);
    if (selectedTC !== 'todas') parts.push(`TC: ${selectedTC}`);
    if (selectedPax !== 'todos') parts.push(`Personas: ${selectedPax}`);
    if (fechaDesde || fechaHasta) parts.push(`Fechas: ${fechaDesde || '*'} a ${fechaHasta || '*'}`);
    return parts.join(' • ');
  };

  const handleDownloadPdf = () => {
    try {
      exportCronogramaPdf({
        viaje,
        items: filteredItems,
        summary,
        filterSummaryText: buildFilterSummaryText()
      });
      toast.success('Reporte PDF cronológico descargado');
    } catch (err) {
      toast.error('Error al generar el PDF: ' + (err.message || ''));
    }
  };

  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      await exportCronogramaExcel({
        viaje,
        items: filteredItems,
        summary,
        dayGroups,
        filterSummaryText: buildFilterSummaryText()
      });
      toast.success('Libro Excel cronológico descargado');
    } catch (err) {
      toast.error('Error al generar Excel: ' + (err.message || ''));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleDownloadCsv = () => {
    const headers = [
      'Dia',
      'Fecha Inicio',
      'Fecha Fin',
      'Hora',
      'Duracion',
      'Pais',
      'Ciudad',
      'Lugar o Ruta',
      'Concepto o Actividad',
      'Categoria',
      'Personas',
      'TC o Medio',
      'Monto Original',
      'Moneda',
      'Total TC COP',
      'Valor por Persona COP',
      'Notas'
    ];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = filteredItems.map((it) =>
      [
        it.dayLabel,
        it.fechaDisplay,
        it.fechaFinDisplay || it.fechaDisplay,
        it.horaDisplay,
        it.duracionDisplay,
        it.countryName,
        it.cityName,
        it.rutaAerea || it.lugarDetalle,
        it.titulo,
        it.categoria,
        it.cantidadPersonas,
        it.tarjetaCredito || 'Efectivo',
        it.montoOriginalTotal,
        it.monedaOriginal,
        Math.round(it.montoTotalCOP || 0),
        Math.round(it.montoPorPersonaCOP || 0),
        it.notas
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (viaje?.titulo || 'Viaje').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.href = url;
    a.download = `Cronograma_${safeName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo CSV cronológico descargado');
  };

  if (!viaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={FileText} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#00E5FF] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">
            Reportes & Cronograma
          </h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <FileText className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">Selecciona un viaje</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Para visualizar y descargar el reporte cronológico detallado, primero selecciona o crea un viaje.
          </p>
          {onOpenNuevoViaje && (
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Viaje
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 space-y-5 w-full max-w-full overflow-hidden">
      <WatermarkIcon icon={FileText} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#00E5FF]" />

      {/* 1. CABECERA PRINCIPAL Y BOTONES DE DESCARGA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00E5FF] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Reportes & Cronograma Detallado
            </h2>
            <span className="text-xs font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2.5 py-0.5 rounded-md">
              {fixAccents(viaje.titulo)}
            </span>
          </div>
          <p className="text-xs text-[#8492A6] m-0">
            Visualización y descarga cronológica completa: día, hora, duración, país, ciudad, lugar/ruta, personas, tarjeta y valor total vs por persona.
          </p>
        </div>

        {/* Botones de Descarga Directa (respetan los filtros activos) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-xl bg-[#FFE500] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Descargar reporte cronológico detallado en PDF (Formato Horizontal A4)"
          >
            <FileDown className="w-4 h-4" strokeWidth={2.5} />
            <span>PDF Cronológico ({filteredItems.length})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={exportingExcel}
            className="px-3.5 py-2 rounded-xl bg-[#00FF85] hover:opacity-90 disabled:opacity-50 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Descargar libro Excel (.xlsx) con Cronograma Detallado y Resumen por Día"
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={2.5} />
            <span>{exportingExcel ? 'Generando...' : `Excel Detallado (${filteredItems.length})`}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3 py-2 rounded-xl bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            title="Descargar archivo CSV plano"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA COMPACTA DE RESUMEN (Sin ocupar toda la pantalla antes del cronograma) */}
      <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436] relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1">
          <div className="px-2.5 py-1.5 rounded-lg bg-[#151B27] border border-[#00FF85]/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#00FF85] block truncate">
              1. Por Persona (Ppto)
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-[#00FF85]">
              $ {Math.round(summary.enPresupuestoPorPersonaCOP).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-[#151B27] border border-[#00E5FF]/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#00E5FF] block truncate">
              2. Total Personas (Ppto)
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-[#F1F5F9]">
              $ {Math.round(summary.enPresupuestoTotalCOP).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-[#151B27] border border-[#FF2E55]/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF2E55] block truncate">
              3. Total Viaje (+Tiquetes)
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-[#F1F5F9]">
              $ {Math.round(summary.totalDesembolsadoCOP).toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowResumenFinanciero((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>{showResumenFinanciero ? 'Ocultar Detalle 3 Niveles' : 'Ver Detalle 3 Niveles'}</span>
          {showResumenFinanciero ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Detalle Expandible de los 3 Niveles de Gasto */}
      {showResumenFinanciero && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 relative z-10">
        {/* SEGMENTO 1: GASTO POR PERSONA (EN PRESUPUESTO) */}
        <div className="p-4 rounded-2xl bg-[#0E121B] border border-[#00FF85]/35 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00FF85]/15 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#F1F5F9] m-0">
                    1. Gasto por Persona
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                    ✅ En Presupuesto
                  </span>
                </div>
                <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                  Vuelos internos y permisos al 50% (1 persona) + Alojamiento al 100% (mismo valor para 1 o 2 personas) + Actividades.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#00FF85]/40 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#00FF85] block">
                Gasto por Persona (En Presupuesto)
              </span>
              <span className="text-base sm:text-lg font-black text-[#00FF85] font-mono block mt-0.5">
                $ {Math.round(summary.enPresupuestoPorPersonaCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <span className="text-[11px] text-[#8492A6] font-mono">
              ~${summary.enPresupuestoPorPersonaUSD.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* SEGMENTO 2: GASTO PARA EL TOTAL DE PERSONAS (EN PRESUPUESTO - 2 PERSONAS) */}
        <div className="p-4 rounded-2xl bg-[#0E121B] border border-[#00E5FF]/35 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#F1F5F9] m-0">
                    2. Gasto Total de Personas
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                    En Presupuesto (2 Pers.)
                  </span>
                </div>
                <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                  Vuelos internos y permisos para las 2 personas (100%) + Alojamiento para 2 personas (100%, sin duplicar) + Actividades.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#00E5FF]/40 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#00E5FF] block">
                Gasto Total de Personas (En Presupuesto)
              </span>
              <span className="text-base sm:text-lg font-black text-[#F1F5F9] font-mono block mt-0.5">
                $ {Math.round(summary.enPresupuestoTotalCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <span className="text-[11px] text-[#8492A6]">
              {summary.enPresupuestoCount} registros
            </span>
          </div>
        </div>

        {/* SEGMENTO 3: GASTO TOTAL DEL VIAJE (INCLUYE TIQUETES FUERA DE PRESUPUESTO) */}
        <div className="p-4 rounded-2xl bg-[#0E121B] border border-[#FF2E55]/40 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF2E55]/15 border border-[#FF2E55]/30 flex items-center justify-center text-[#FF2E55] shrink-0">
                <Ban className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#F1F5F9] m-0">
                    3. Gasto Total del Viaje
                  </h3>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF2E55]/15 text-[#FF2E55] border border-[#FF2E55]/30">
                    Con Tiquetes Fuera de Ppto
                  </span>
                </div>
                <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                  Suma el gasto en presupuesto ($ {Math.round(summary.enPresupuestoTotalCOP).toLocaleString('es-CO')}) + tiquetes principales de salida y llegada ($ {Math.round(summary.fueraPresupuestoTotalCOP).toLocaleString('es-CO')} fuera de presupuesto).
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#FF2E55]/40 flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF2E55] block">
                Gasto Total Acumulado del Viaje
              </span>
              <span className="text-base sm:text-lg font-black text-[#F1F5F9] font-mono block mt-0.5">
                $ {Math.round(summary.totalDesembolsadoCOP).toLocaleString('es-CO')} COP
              </span>
            </div>
            <span className="text-[10px] text-[#8492A6] font-mono">
              1p + Tiquetes: $ {Math.round(summary.totalPorPersonaCOP).toLocaleString('es-CO')}
            </span>
          </div>
        </div>
        </div>
      )}

      {/* 3. PANEL DE FILTROS AVANZADOS Y SELECTOR DE VISTA */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E121B] border border-[#1C2436] relative z-10 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Buscador global */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar por ciudad, país, aeropuerto (MDE, MAD, ICN, NRT, CJU), hotel, concepto o tarjeta..."
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>

          {/* Controles de Vista y Orden */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Switch Línea de Tiempo vs Tabla */}
            <div className="inline-flex rounded-xl bg-[#151B27] p-1 border border-[#1C2436]">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-[#0E121B] text-[#00FF85] border border-[#00FF85]/40'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Día por Día</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tabla')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'tabla'
                    ? 'bg-[#0E121B] text-[#00E5FF] border border-[#00E5FF]/40'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Sábana / Tabla</span>
              </button>
            </div>

            {/* Orden Ascendente / Descendente */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-1.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-xs font-semibold text-[#CBD5E1] cursor-pointer flex items-center gap-1.5"
              title="Cambiar orden cronológico"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>{sortOrder === 'asc' ? 'Día 1 ➔ Final' : 'Recientes ➔ Inicio'}</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-2.5 py-1.5 rounded-xl bg-[#FF2E55]/10 border border-[#FF2E55]/30 text-[#FF2E55] text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar ({activeFiltersCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl bg-[#151B27] border border-[#1C2436] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5 text-[#FFE500]" />
              <span>{showFilters ? 'Ocultar Filtros' : 'Filtros'}</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Selectores de Filtros Detallados */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2.5 border-t border-[#1C2436] text-xs">
            {/* 1. País */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                🌍 País
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todos">Todos los Países ({filterOptions.countries.length})</option>
                {filterOptions.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Ciudad */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                📍 Ciudad
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todas">Todas las Ciudades ({filterOptions.cities.length})</option>
                {filterOptions.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Categoría / Tipo */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                🏷️ Categoría / Tipo
              </label>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todas">Todas las Categorías</option>
                <option value="transporte">✈️ Transporte / Vuelos</option>
                <option value="alojamiento">🏨 Alojamiento / Hoteles</option>
                <option value="comida">🍽️ Comida / Bebida</option>
                <option value="actividades">🎟️ Actividades / Tours</option>
                <option value="impuestos">🪪 Impuestos / Permisos (K-ETA, ETIAS)</option>
                <option value="compras">🛍️ Compras</option>
                <option value="otros">📌 Otros</option>
              </select>
            </div>

            {/* 4. Presupuesto (Incluido vs Fuera de Presupuesto) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                💰 Estado en Presupuesto
              </label>
              <select
                value={selectedPresupuesto}
                onChange={(e) => setSelectedPresupuesto(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todos">Todos (En Presupuesto + Fuera de Ppto)</option>
                <option value="en_presupuesto">✅ Solo Incluido en Presupuesto</option>
                <option value="fuera_presupuesto">🚫 Solo Fuera de Presupuesto (Tiquetes Salida/Llegada)</option>
              </select>
            </div>

            {/* 5. Tipo de Registro */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                🔎 Mostrar Registros
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todos">Todo el Cronograma (Eventos + Gastos)</option>
                <option value="con_valor">💰 Solo Registros con Costo ($ &gt; 0)</option>
                <option value="solo_vuelos">✈️ Solo Vuelos y Transporte</option>
                <option value="solo_itinerario">🗓️ Solo Actividades de Itinerario</option>
                <option value="solo_billetera">💳 Solo Gastos Directos de Billetera</option>
              </select>
            </div>

            {/* 5. Cantidad de Personas */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                👥 Cantidad de Personas
              </label>
              <select
                value={selectedPax}
                onChange={(e) => setSelectedPax(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todos">Todas (1, 2 o 3 personas)</option>
                <option value="1">👤 Solo 1 Persona (Individual)</option>
                <option value="multi">👥 Compartidos (2 o 3 Personas)</option>
              </select>
            </div>

            {/* 6. Tarjeta (TC) / Medio */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                💳 Tarjeta (TC) / Medio
              </label>
              <select
                value={selectedTC}
                onChange={(e) => setSelectedTC(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              >
                <option value="todas">Todas las Tarjetas / Medios</option>
                {filterOptions.tcs.map((tc) => (
                  <option key={tc} value={tc}>
                    💳 {tc}
                  </option>
                ))}
                <option value="__sin_tc__">💵 Efectivo / Sin TC</option>
              </select>
            </div>

            {/* 7. Fecha Desde */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                📅 Fecha Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              />
            </div>

            {/* 8. Fecha Hasta */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                📅 Fecha Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. CONTENIDO PRINCIPAL: LÍNEA DE TIEMPO DÍA POR DÍA O SÁBANA TABULAR */}
      {filteredItems.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <Calendar className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
          <p className="text-sm font-bold text-[#F1F5F9] m-0">
            No se encontraron registros para estos filtros
          </p>
          <p className="text-xs text-[#8492A6] mt-1 m-0">
            Prueba cambiando el país, ciudad, categoría o restableciendo los filtros.
          </p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#FFE500] text-[#080A0F] font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Restablecer Filtros
            </button>
          )}
        </div>
      ) : viewMode === 'timeline' ? (
        /* VISTA 1: LÍNEA DE TIEMPO CRONOLÓGICA DÍA POR DÍA */
        <div className="space-y-5 relative z-10">
          {dayGroups.map((dayGroup) => (
            <div
              key={dayGroup.dateKey}
              className="rounded-2xl bg-[#0E121B] border border-[#1C2436] overflow-hidden shadow-sm"
            >
              {/* Cabecera del Día */}
              <div className="p-3.5 sm:p-4 bg-[#151B27] border-b border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-black text-xs uppercase tracking-wider">
                    {dayGroup.dayLabel}
                  </span>
                  <span className="text-sm font-extrabold text-[#F1F5F9] capitalize">
                    {dayGroup.fechaDisplay}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0E121B] border border-[#1C2436] text-[#8492A6] font-semibold">
                    {dayGroup.items.length} {dayGroup.items.length === 1 ? 'registro' : 'registros'}
                  </span>

                  {/* Países y ciudades del día */}
                  {dayGroup.countries.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#CBD5E1] bg-[#0E121B] border border-[#1C2436] px-2.5 py-0.5 rounded-lg"
                    >
                      <MiniFlag country={c} className="w-3.5 h-2.5" />
                      <span>{c}</span>
                    </span>
                  ))}
                  {dayGroup.cities.length > 0 && (
                    <span className="text-xs text-[#8492A6] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00FF85]" />
                      <span>{dayGroup.cities.join(' • ')}</span>
                    </span>
                  )}
                </div>

                {/* Totales financieros del día discriminados */}
                {dayGroup.totalDesembolsadoCOP > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {dayGroup.fueraPresupuestoTotalCOP > 0 && (
                      <span className="text-[11px] font-bold font-mono text-[#FF2E55] bg-[#FF2E55]/10 border border-[#FF2E55]/30 px-2.5 py-0.5 rounded-lg">
                        🚫 Fuera de Ppto: $ {Math.round(dayGroup.fueraPresupuestoTotalCOP).toLocaleString('es-CO')}
                      </span>
                    )}
                    {dayGroup.enPresupuestoTotalCOP > 0 && (
                      <>
                        {Math.round(dayGroup.enPresupuestoTotalCOP) > Math.round(dayGroup.enPresupuestoPorPersonaCOP) && (
                          <span className="text-[11px] font-bold font-mono text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-2 py-0.5 rounded-lg">
                            Total TC En Ppto: $ {Math.round(dayGroup.enPresupuestoTotalCOP).toLocaleString('es-CO')}
                          </span>
                        )}
                        <span className="text-[11px] font-bold font-mono text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/30 px-2.5 py-0.5 rounded-lg">
                          ✅ En Ppto (1p): $ {Math.round(dayGroup.enPresupuestoPorPersonaCOP).toLocaleString('es-CO')} COP
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Registros cronológicos dentro del día */}
              <div className="divide-y divide-[#1C2436]/60">
                {dayGroup.items.map((it) => {
                  const catMeta = CATEGORIA_META[it.tipo] || CATEGORIA_META[it.categoria] || CATEGORIA_META.otros;
                  const Icon = catMeta.icon;
                  const isMulti = it.cantidadPersonas > 1;

                  return (
                    <div
                      key={it.id}
                      className="p-3.5 sm:p-4 hover:bg-[#151B27]/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      {/* Columna Izquierda: Hora, Duración, Lugar, País, Ciudad y Detalles */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Bloque de Hora y Duración */}
                        <div className="w-24 sm:w-28 shrink-0 p-2 rounded-xl bg-[#151B27] border border-[#1C2436] text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-[#00E5FF] font-mono">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate">{it.horaDisplay}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-[#8492A6] block mt-0.5">
                            {it.duracionDisplay}
                          </span>
                          {it.fechaFinDisplay && (
                            <span className="text-[9px] text-[#FFE500] font-bold block mt-0.5">
                              Llega: {it.fechaFinDisplay}
                            </span>
                          )}
                        </div>

                        {/* Información Principal del Evento / Gasto */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                            >
                              <Icon className="w-3 h-3" />
                              {catMeta.label}
                            </span>

                            {/* País y Ciudad */}
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[11px] font-semibold text-[#F1F5F9]">
                              <MiniFlag country={it.countryName} code={it.countryCode} className="w-3.5 h-2.5" />
                              <span>
                                {it.cityName && it.cityName !== '-'
                                  ? `${it.cityName}, ${it.countryName}`
                                  : it.countryName}
                              </span>
                            </span>

                            {/* Cantidad de personas */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isMulti
                                  ? 'bg-[#FFE500]/15 border border-[#FFE500]/40 text-[#FFE500]'
                                  : 'bg-[#151B27] border border-[#1C2436] text-[#8492A6]'
                              }`}
                            >
                              {isMulti ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              <span>{isMulti ? `${it.cantidadPersonas} Personas` : '1 Persona'}</span>
                            </span>

                            {/* Tarjeta de Crédito */}
                            {it.tarjetaCredito && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] font-bold text-[#00E5FF]">
                                <CreditCard className="w-3 h-3" />
                                <span>{it.tarjetaCredito}</span>
                              </span>
                            )}

                            {it.pagadoAdelantado && (
                              <span className="px-1.5 py-0.5 rounded bg-[#B55FE6]/15 border border-[#B55FE6]/30 text-[9px] font-bold uppercase text-[#B55FE6]">
                                Pre-Viaje
                              </span>
                            )}

                            {/* Insignia explícita: En Presupuesto vs Fuera de Presupuesto */}
                            {it.montoOriginalTotal > 0 && (
                              it.noComputar ? (
                                <span className="px-2 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/40 text-[10px] font-bold uppercase text-[#FF2E55]">
                                  🚫 Fuera de Presupuesto (No suma al ppto)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#00FF85]/15 border border-[#00FF85]/30 text-[10px] font-bold uppercase text-[#00FF85]">
                                  ✅ Incluido en Presupuesto
                                </span>
                              )
                            )}
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0">
                            {it.titulo}
                          </h4>

                          {/* Lugar / Ruta / Aeropuertos / Escalas */}
                          <div className="flex items-center gap-2 flex-wrap text-xs text-[#CBD5E1]">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#00FF85] shrink-0" />
                              <span>{it.rutaAerea || it.lugarDetalle}</span>
                            </span>
                            {it.escalaInfo && (
                              <span className="text-[11px] font-bold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-2 py-0.2 rounded">
                                ⏱️ {it.escalaInfo}
                              </span>
                            )}
                          </div>

                          {it.notas && (
                            <p className="text-[11px] text-[#8492A6] m-0 italic">
                              📝 {it.notas}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Columna Derecha: Valores (Moneda Original, Total TC y Por Persona) + Editar */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1C2436]/60 shrink-0">
                        {it.montoOriginalTotal > 0 ? (
                          <div className="text-left lg:text-right">
                            <div className="flex items-center lg:justify-end gap-1.5">
                              <span className="text-xs font-bold font-mono text-[#CBD5E1]">
                                {formatCurrencyDisplay(it.montoOriginalTotal, it.monedaOriginal, true)}
                              </span>
                              {isMulti && (
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/30">
                                  Total {it.cantidadPersonas}p
                                </span>
                              )}
                            </div>

                            {isMulti && it.categoria !== 'alojamiento' && it.tipo !== 'hotel' && (
                              <p className="text-[11px] font-bold font-mono text-[#FFE500] m-0 mt-0.5">
                                Total ({it.cantidadPersonas}p): $ {Math.round(it.montoTotalCOP).toLocaleString('es-CO')} COP
                              </p>
                            )}

                            <p className="text-xs sm:text-sm font-black font-mono text-[#00FF85] m-0 mt-0.5">
                              {isMulti
                                ? (it.categoria === 'alojamiento' || it.tipo === 'hotel'
                                    ? `1 o ${it.cantidadPersonas}p (igual): `
                                    : 'Por persona (50%): ')
                                : 'Valor: '}
                              $ {Math.round(it.montoPorPersonaCOP).toLocaleString('es-CO')} COP
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8492A6] italic">
                            Sin costo registrado
                          </span>
                        )}

                        {(onEditEvento || onEditGasto) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (it.rawEvento && onEditEvento) {
                                onEditEvento(it.rawEvento);
                              } else if (it.rawGasto && onEditGasto) {
                                onEditGasto(it.rawGasto);
                              }
                            }}
                            title="Editar este registro"
                            className="p-2 rounded-xl bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#8492A6] hover:text-[#00E5FF] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA 2: SÁBANA / TABLA MAESTRA CRONOLÓGICA */
        <div className="rounded-2xl bg-[#0E121B] border border-[#1C2436] overflow-hidden relative z-10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C2436] text-[10px] font-bold uppercase tracking-wider text-[#8492A6] bg-[#151B27]">
                  <th className="py-3 px-2.5">#</th>
                  <th className="py-3 px-2.5">Día / Fecha</th>
                  <th className="py-3 px-2.5">Hora</th>
                  <th className="py-3 px-2.5">Duración</th>
                  <th className="py-3 px-2.5">País</th>
                  <th className="py-3 px-2.5">Ciudad</th>
                  <th className="py-3 px-2.5">Lugar / Ruta</th>
                  <th className="py-3 px-2.5">Concepto / Actividad</th>
                  <th className="py-3 px-2.5">Categoría</th>
                  <th className="py-3 px-2.5">Presupuesto</th>
                  <th className="py-3 px-2.5">Pers.</th>
                  <th className="py-3 px-2.5">TC / Medio</th>
                  <th className="py-3 px-2.5 text-right">Valor Orig.</th>
                  <th className="py-3 px-2.5 text-right">Total TC (COP)</th>
                  <th className="py-3 px-2.5 text-right">Por Persona (COP)</th>
                  <th className="py-3 px-2.5 text-center">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2436]/60">
                {filteredItems.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-[#151B27]/50 transition-colors">
                    <td className="py-2.5 px-2.5 font-mono text-[#8492A6]">{idx + 1}</td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="font-bold text-[#00E5FF] block text-[10px] uppercase">
                        {it.dayLabel}
                      </span>
                      <span className="text-[#F1F5F9] font-medium">{it.fechaDisplay}</span>
                      {it.fechaFinDisplay && (
                        <span className="text-[10px] text-[#FFE500] block">
                          ➔ {it.fechaFinDisplay}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap font-mono text-[#CBD5E1]">
                      {it.horaDisplay}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-[#8492A6]">
                      {it.duracionDisplay}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#F1F5F9]">
                        <MiniFlag country={it.countryName} code={it.countryCode} className="w-3.5 h-2.5" />
                        <span>{it.countryName}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap font-medium text-[#CBD5E1]">
                      {it.cityName}
                    </td>
                    <td className="py-2.5 px-2.5 max-w-[200px] truncate text-[#CBD5E1]" title={it.rutaAerea || it.lugarDetalle}>
                      {it.rutaAerea || it.lugarDetalle}
                      {it.escalaInfo && (
                        <span className="block text-[10px] text-[#FFE500]">{it.escalaInfo}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 max-w-[240px]">
                      <span className="font-bold text-[#F1F5F9] block truncate" title={it.titulo}>
                        {it.titulo}
                      </span>
                      {it.notas && (
                        <span className="text-[10px] text-[#8492A6] block truncate" title={it.notas}>
                          {it.notas}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[10px] font-bold uppercase text-[#00E5FF]">
                        {it.categoria}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {it.montoOriginalTotal > 0 ? (
                        it.noComputar ? (
                          <span className="px-2 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/40 text-[10px] font-bold uppercase text-[#FF2E55]">
                            🚫 Fuera de Ppto
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#00FF85]/15 border border-[#00FF85]/30 text-[10px] font-bold uppercase text-[#00FF85]">
                            ✅ En Presupuesto
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-[#8492A6]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          it.cantidadPersonas > 1
                            ? 'bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/30'
                            : 'text-[#8492A6]'
                        }`}
                      >
                        {it.cantidadPersonas}p
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-[#00E5FF] font-semibold">
                      {it.tarjetaCredito || (it.montoOriginalTotal > 0 ? 'Efectivo' : '-')}
                    </td>
                    <td className="py-2.5 px-2.5 text-right whitespace-nowrap font-mono text-[#8492A6]">
                      {it.montoOriginalTotal > 0
                        ? formatCurrencyDisplay(it.montoOriginalTotal, it.monedaOriginal, false)
                        : '-'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right whitespace-nowrap font-mono font-bold text-[#FFE500]">
                      {it.montoTotalCOP > 0
                        ? `$ ${Math.round(it.montoTotalCOP).toLocaleString('es-CO')}`
                        : '-'}
                    </td>
                    <td className="py-2.5 px-2.5 text-right whitespace-nowrap font-mono font-bold text-[#00FF85]">
                      {it.montoPorPersonaCOP > 0
                        ? `$ ${Math.round(it.montoPorPersonaCOP).toLocaleString('es-CO')}`
                        : '-'}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (it.rawEvento && onEditEvento) onEditEvento(it.rawEvento);
                          else if (it.rawGasto && onEditGasto) onEditGasto(it.rawGasto);
                        }}
                        className="p-1.5 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportesView;

