import React from 'react';
import { PieChart, FileDown, FileSpreadsheet } from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import { cleanCountryText } from '../../../utils/countries';
import { useBalanceFilters } from './balance-view/useBalanceFilters';
import { BalanceFiltrosPanel } from './balance-view/BalanceFiltrosPanel';
import { BalanceKpiCards } from './balance-view/BalanceKpiCards';
import { BalanceMultidivisaGrid } from './balance-view/BalanceMultidivisaGrid';
import { BalanceSemaforoCard } from './balance-view/BalanceSemaforoCard';
import { BalanceDesgloseTable } from './balance-view/BalanceDesgloseTable';

export function BalanceView({ viaje, onOpenNuevoViaje, balance, gastos = [], eventos = [] }) {
  const {
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
    displayBalance,
    activeFiltersCount,
    hasActiveFilters,
    clearAllFilters,
    handleExport,
    handleExportExcel
  } = useBalanceFilters({ viaje, gastos, eventos, balance });

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

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 w-full max-w-full overflow-hidden">
      {/* Marca de agua sólida */}
      <WatermarkIcon icon={PieChart} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#FFE500]" />

      {/* Header Ejecutivo con Botones de Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2-h-2 rounded-full bg-[#FFE500] shrink-0" />
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

      {/* PANEL DE FILTROS AVANZADOS */}
      <BalanceFiltrosPanel
        showFiltersPanel={showFiltersPanel}
        setShowFiltersPanel={setShowFiltersPanel}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCategoria={selectedCategoria}
        setSelectedCategoria={setSelectedCategoria}
        selectedModalidad={selectedModalidad}
        setSelectedModalidad={setSelectedModalidad}
        selectedPresupuesto={selectedPresupuesto}
        setSelectedPresupuesto={setSelectedPresupuesto}
        selectedTC={selectedTC}
        setSelectedTC={setSelectedTC}
        fechaDesde={fechaDesde}
        setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta}
        setFechaHasta={setFechaHasta}
        selectedMoneda={selectedMoneda}
        setSelectedMoneda={setSelectedMoneda}
        availableCountries={availableCountries}
        availableCities={availableCities}
        availableCurrencies={availableCurrencies}
        availableTCs={availableTCs}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
        clearAllFilters={clearAllFilters}
        filteredTotals={filteredTotals}
      />

      {/* Tarjetas de KPIs Principales */}
      <BalanceKpiCards
        viaje={viaje}
        hasActiveFilters={hasActiveFilters}
        filteredTotals={filteredTotals}
        balance={balance}
      />

      {/* Multidivisa: Consumo en todas las monedas del viaje */}
      <BalanceMultidivisaGrid
        viaje={viaje}
        hasActiveFilters={hasActiveFilters}
        filteredTotals={filteredTotals}
        balance={balance}
      />

      {/* Semáforo de Presupuesto por Categoría */}
      <BalanceSemaforoCard
        displayBalance={displayBalance}
        hasActiveFilters={hasActiveFilters}
      />

      {/* SECCIÓN DETALLADA: DESGLOSE Y AUDITORÍA DE PAGOS */}
      <BalanceDesgloseTable
        filteredGastos={filteredGastos}
        filteredTotals={filteredTotals}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      />
    </div>
  );
}

export default BalanceView;
