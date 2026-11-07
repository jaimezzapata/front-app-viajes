import React, { useState } from 'react';
import { useViajesData } from './viajes-view/useViajesData';
import { ViajeDetalleDashboard } from './viajes-view/ViajeDetalleDashboard';
import { ViajesCatalogoView } from './viajes-view/ViajesCatalogoView';

export function ViajesView({
  viajes = [],
  activeViajeId = null,
  eventos = [],
  gastos = [],
  documentos = [],
  balance = null,
  onSelectTab,
  onSelectViaje,
  onOpenNuevoViaje,
  onEditViaje,
  onDeleteViaje,
  onOpenBitacora,
  onCompartirViaje,
  onAddEvento,
  onAddGasto,
  onAddDoc,
  onSyncFromCloud
}) {
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

  const {
    selectedViajeId,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    isGlobalMapModalOpen,
    setIsGlobalMapModalOpen,
    isTripMapModalOpen,
    setIsTripMapModalOpen,
    globalVisitedCountries,
    currentViaje,
    tripEvents,
    tripFlights,
    tripVisitedCountries,
    tripGastos,
    tripDocs,
    tripMetrics,
    getViajeStatus,
    filteredViajes,
    handleSelectViaje,
    handleBackToOverview
  } = useViajesData({
    viajes,
    activeViajeId,
    eventos,
    gastos,
    documentos,
    balance,
    onSelectViaje
  });

  // VISTA 1: MODO DETALLE DEL VIAJE SELECCIONADO
  if (selectedViajeId && currentViaje) {
    const status = getViajeStatus(currentViaje);
    const startDate = new Date(currentViaje.fechaInicio);
    const endDate = new Date(currentViaje.fechaFin);
    const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

    return (
      <ViajeDetalleDashboard
        currentViaje={currentViaje}
        status={status}
        diffDays={diffDays}
        startDate={startDate}
        endDate={endDate}
        tripEvents={tripEvents}
        tripFlights={tripFlights}
        tripVisitedCountries={tripVisitedCountries}
        tripGastos={tripGastos}
        tripDocs={tripDocs}
        tripMetrics={tripMetrics}
        isTripMapModalOpen={isTripMapModalOpen}
        setIsTripMapModalOpen={setIsTripMapModalOpen}
        handleBackToOverview={handleBackToOverview}
        onOpenBitacora={onOpenBitacora}
        onSelectTab={onSelectTab}
        onCompartirViaje={onCompartirViaje}
        onEditViaje={onEditViaje}
        onDeleteViaje={onDeleteViaje}
        onAddEvento={onAddEvento}
        onAddGasto={onAddGasto}
        onAddDoc={onAddDoc}
      />
    );
  }

  // VISTA 2: CATÁLOGO Y RESUMEN GENERAL DE VIAJES
  return (
    <ViajesCatalogoView
      filteredViajes={filteredViajes}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      globalVisitedCountries={globalVisitedCountries}
      isGlobalMapModalOpen={isGlobalMapModalOpen}
      setIsGlobalMapModalOpen={setIsGlobalMapModalOpen}
      setSelectedCountryCode={setSelectedCountryCode}
      handleSelectViaje={handleSelectViaje}
      onOpenNuevoViaje={onOpenNuevoViaje}
      onSyncFromCloud={onSyncFromCloud}
      activeViajeId={activeViajeId}
      onEditViaje={onEditViaje}
      onDeleteViaje={onDeleteViaje}
      onCompartirViaje={onCompartirViaje}
      getViajeStatus={getViajeStatus}
    />
  );
}

export default ViajesView;
