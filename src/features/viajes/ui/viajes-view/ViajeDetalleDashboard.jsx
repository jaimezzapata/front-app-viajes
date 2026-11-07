import React from 'react';
import {
  Globe2,
  Compass,
  ArrowLeft,
  Plane,
  Share2,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import WatermarkIcon from '../../../../components/WatermarkIcon';
import MiniFlag from '../../../../components/MiniFlag';
import WorldMapModal from '../../../../components/WorldMapModal';
import { cleanCountryText, fixAccents } from '../../../../utils/countries';
import ViajeModuloCards from './ViajeModuloCards';
import ViajeMetricasCard from './ViajeMetricasCard';

export function ViajeDetalleDashboard({
  currentViaje,
  status,
  diffDays,
  startDate,
  endDate,
  tripEvents = [],
  tripFlights = [],
  tripVisitedCountries,
  tripGastos = [],
  tripDocs = [],
  tripMetrics,
  isTripMapModalOpen,
  setIsTripMapModalOpen,
  handleBackToOverview,
  onOpenBitacora,
  onSelectTab,
  onCompartirViaje,
  onEditViaje,
  onDeleteViaje,
  onAddEvento,
  onAddGasto,
  onAddDoc
}) {
  return (
    <div className="space-y-5 relative pb-16">
      {/* Marcas de agua sutiles */}
      <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
      <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

      {/* Modal del Mapamundi para este Viaje Específico */}
      <WorldMapModal
        isOpen={isTripMapModalOpen}
        onClose={() => setIsTripMapModalOpen(false)}
        title={`Ruta de Viaje: ${fixAccents(currentViaje.titulo)}`}
        subtitle={`Trayectos aéreos y escalas hacia ${cleanCountryText(currentViaje.destino)}`}
        badge={tripFlights.length > 0 ? `${tripFlights.length} trayectos` : 'Sin vuelos aún'}
        visitedCountries={tripVisitedCountries}
        flightRoutes={tripFlights}
        showFlights={true}
        multiColor={false}
      />

      {/* Barra superior de Navegación: Volver a Mis Viajes + Destino + Acciones secundarias */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToOverview}
            className="px-3 py-1.5 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] text-[#CBD5E1] hover:text-[#00FF85] transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Mis Viajes</span>
          </button>

          <div className="h-5 w-px bg-[#1C2436] hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-5 bg-[#151B27] border border-[#1C2436] rounded flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <MiniFlag country={currentViaje.destino} className="w-5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#8492A6]">
              {cleanCountryText(currentViaje.destino)}
            </span>
          </div>
        </div>

        {/* Acciones de gestión del viaje */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsTripMapModalOpen(true)}
            className="h-8.5 px-3 rounded-xl bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold shadow-sm whitespace-nowrap select-none"
            title="Abrir mapa interactivo de la ruta aérea en ventana modal"
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Ver Ruta</span>
          </button>

          {onCompartirViaje && (
            <button
              type="button"
              onClick={() => onCompartirViaje(currentViaje)}
              title="Compartir bitácora con amigos"
              className="h-8.5 px-3 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap select-none"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00FF85]" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEditViaje(currentViaje)}
            title="Editar viaje"
            className="h-8.5 px-3 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap select-none"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDeleteViaje(currentViaje);
              handleBackToOverview();
            }}
            title="Eliminar viaje"
            className="h-8.5 px-2.5 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold select-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Encabezado Principal del Viaje con Botones de Registro Directos Inmediatos */}
      <div className="bg-[#0E121B] border border-[#1C2436] rounded-2xl p-4 sm:p-5 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${status.bg} ${status.color} ${status.border}`}>
                {status.label}
              </span>
              {currentViaje.tipoViaje === 'multidestino' && (
                <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/15 border border-[#00FF85]/30 px-2 py-0.5 rounded uppercase tracking-wider">
                  Multidestino
                </span>
              )}
              <span className="text-xs text-[#8492A6] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
              <span className="text-xs text-[#8492A6] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#B55FE6]" />
                {diffDays} {diffDays === 1 ? 'día' : 'días'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#F1F5F9] tracking-tight m-0">
              {fixAccents(currentViaje.titulo)}
            </h1>
            {currentViaje.descripcion && (
              <p className="text-xs text-[#8492A6] mt-1 m-0 max-w-2xl line-clamp-1">
                {fixAccents(currentViaje.descripcion)}
              </p>
            )}
          </div>

          {/* Botones de acción rápida inmediata */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#1C2436]">
            {onAddEvento && (
              <button
                type="button"
                onClick={() => onAddEvento()}
                className="h-9 px-3 bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap select-none"
                title="Registrar vuelo o actividad en el itinerario"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                <span>Actividad</span>
              </button>
            )}

            {onAddGasto && (
              <button
                type="button"
                onClick={() => onAddGasto()}
                className="h-9 px-3 bg-[#00E5FF] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap select-none"
                title="Registrar nuevo gasto para este viaje"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                <span>Gasto</span>
              </button>
            )}

            {onAddDoc && (
              <button
                type="button"
                onClick={() => onAddDoc()}
                className="h-9 px-3 bg-[#B55FE6] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap select-none"
                title="Subir documento digital a la bóveda"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                <span>Doc</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Gestión y Módulos */}
      <ViajeModuloCards
        currentViaje={currentViaje}
        tripEvents={tripEvents}
        tripGastos={tripGastos}
        tripDocs={tripDocs}
        tripMetrics={tripMetrics}
        onOpenBitacora={onOpenBitacora}
        onSelectTab={onSelectTab}
        onAddEvento={onAddEvento}
        onAddGasto={onAddGasto}
        onAddDoc={onAddDoc}
      />

      {/* Métricas Financieras del Viaje */}
      <ViajeMetricasCard tripMetrics={tripMetrics} />
    </div>
  );
}

export default ViajeDetalleDashboard;

