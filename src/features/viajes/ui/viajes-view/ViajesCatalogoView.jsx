import React from 'react';
import { Globe2, Compass, Plus, Search, RefreshCw } from 'lucide-react';
import WatermarkIcon from '../../../../components/WatermarkIcon';
import WorldMapModal from '../../../../components/WorldMapModal';
import { ViajeCardItem } from './ViajeCardItem';

export function ViajesCatalogoView({
  filteredViajes = [],
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  globalVisitedCountries,
  isGlobalMapModalOpen,
  setIsGlobalMapModalOpen,
  setSelectedCountryCode,
  handleSelectViaje,
  onOpenNuevoViaje,
  onSyncFromCloud,
  activeViajeId,
  onEditViaje,
  onDeleteViaje,
  onCompartirViaje,
  getViajeStatus
}) {
  return (
    <div className="space-y-6 relative pb-16">
      {/* Marcas de agua sutiles de fondo */}
      <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
      <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

      {/* Modal del Mapamundi Global */}
      <WorldMapModal
        isOpen={isGlobalMapModalOpen}
        onClose={() => setIsGlobalMapModalOpen(false)}
        title="Mapamundi Global • Destinos Explorados"
        subtitle="Todos los países configurados y visitados en tus bitácoras de viaje"
        badge={`${globalVisitedCountries.size} ${globalVisitedCountries.size === 1 ? 'país' : 'países'}`}
        visitedCountries={globalVisitedCountries}
        showFlights={false}
        multiColor={true}
        onSelectCountry={(code, info) => {
          setSelectedCountryCode(code);
          if (info && info.viajes && info.viajes[0]) {
            setIsGlobalMapModalOpen(false);
            handleSelectViaje(info.viajes[0].id);
          }
        }}
      />

      {/* 1. CABECERA PRINCIPAL CON BOTONES ALINEADOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2436]/80 relative z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#F1F5F9] tracking-tight m-0">
              Bitácoras de Viaje
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 tracking-wider uppercase whitespace-nowrap">
              {filteredViajes.length} {filteredViajes.length === 1 ? 'viaje' : 'viajes'}
            </span>
          </div>
          <p className="text-xs text-[#8492A6] mt-1 m-0">
            Gestiona tus aventuras y visualiza tus rutas en el mundo
          </p>
        </div>

        {/* Botones de acción principales */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsGlobalMapModalOpen(true)}
            className="h-10 px-4 bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 text-[#00E5FF] font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap select-none shrink-0"
            title="Abrir mapamundi global en ventana modal"
          >
            <Globe2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <span className="whitespace-nowrap">Ver Mapa</span>
            {globalVisitedCountries.size > 0 && (
              <span className="bg-[#00E5FF]/20 text-[#00E5FF] text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 shrink-0">
                {globalVisitedCountries.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenNuevoViaje}
            className="h-10 px-4 bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-opacity inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap select-none shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span className="whitespace-nowrap">Nuevo Viaje</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS INTEGRADA: BÚSQUEDA Y FILTROS */}
      <section className="space-y-4 relative z-10 w-full max-w-full overflow-hidden">
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-sm">
          {/* Campo de Búsqueda */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por destino, país o nombre del viaje..."
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F1F5F9] focus:outline-none placeholder-[#8492A6]/60 transition-colors"
            />
          </div>

          {/* Filtros de Estado */}
          <div className="flex items-center gap-1 bg-[#151B27] p-1 rounded-xl border border-[#1C2436] shrink-0 overflow-x-auto no-scrollbar justify-between md:justify-start">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'en_curso', label: 'En Curso' },
              { id: 'proximos', label: 'Próximos' },
              { id: 'finalizados', label: 'Pasados' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 text-center flex-1 md:flex-initial ${
                  filterStatus === f.id
                    ? 'bg-[#0E121B] text-[#00FF85] border border-[#00FF85]/40 shadow-xs font-bold'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Tarjetas de Viaje o Estado Vacío */}
        {filteredViajes.length === 0 ? (
          <div className="bg-[#0E121B] border border-dashed border-[#1C2436] rounded-2xl p-12 text-center">
            <Globe2 className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#F1F5F9] m-0">No se encontraron viajes</h3>
            <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No hay bitácoras que coincidan con la búsqueda.'
                : 'Crea tu primera bitácora de viaje para empezar a pintar tus destinos en el mapa.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                onClick={onOpenNuevoViaje}
                className="px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                + Crear Primer Viaje
              </button>
              {onSyncFromCloud && (
                <button
                  onClick={onSyncFromCloud}
                  className="px-4 py-2 bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#CBD5E1] hover:text-[#00FF85] font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-2 group"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#00E5FF] group-hover:rotate-180 transition-transform duration-500" />
                  <span>Sincronizar desde la Nube</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredViajes.map((viaje) => (
              <ViajeCardItem
                key={viaje.id}
                viaje={viaje}
                status={getViajeStatus(viaje)}
                isActive={activeViajeId === viaje.id}
                onSelect={handleSelectViaje}
                onEdit={onEditViaje}
                onDelete={onDeleteViaje}
                onShare={onCompartirViaje}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ViajesCatalogoView;

