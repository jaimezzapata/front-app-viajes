import React from 'react';
import { Plane, Calendar, Globe2, ArrowLeft, Wallet, ShieldCheck } from 'lucide-react';
import WorldMapModal from '../../../components/WorldMapModal';
import CompartirViajeModal from './CompartirViajeModal';
import { fixAccents } from '../../../utils/countries';
import { useSharedViajeData } from './shared-viaje/useSharedViajeData';
import { SharedViajeHeader } from './shared-viaje/SharedViajeHeader';
import { SharedViajeHero } from './shared-viaje/SharedViajeHero';
import { SharedViajeMetricas } from './shared-viaje/SharedViajeMetricas';
import { SharedViajeItinerarioTab } from './shared-viaje/SharedViajeItinerarioTab';
import { SharedViajeGastosTab } from './shared-viaje/SharedViajeGastosTab';
import { SharedViajeDocsTab } from './shared-viaje/SharedViajeDocsTab';

export function SharedViajeView({ shareId, shareDataRaw, onExit, onGoToApp }) {
  const {
    loading,
    error,
    viaje,
    eventos,
    gastos,
    documentos,
    activeTab,
    setActiveTab,
    isShareModalOpen,
    setIsShareModalOpen,
    isMapModalOpen,
    setIsMapModalOpen,
    visitedCountries,
    flightRoutes,
    groupedSharedSections,
    totalGastadoCOP,
    totalGastadoUSD,
    diffDays,
    status
  } = useSharedViajeData({ shareId, shareDataRaw });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col items-center justify-center p-6 select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#0E121B] border border-[#00FF85]/40 flex items-center justify-center text-[#00FF85] animate-pulse mb-4 shadow-xl shadow-[#00FF85]/10">
          <Plane className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-[#F1F5F9] m-0">Cargando bitácora de viaje...</h2>
        <p className="text-xs text-[#8492A6] mt-1">Preparando mapa interactivo, trayectos aéreos e itinerario</p>
      </div>
    );
  }

  if (error || !viaje) {
    return (
      <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#FF2E55]/10 border border-[#FF2E55] flex items-center justify-center text-[#FF2E55] mb-4">
          <Globe2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#F1F5F9] m-0">Bitácora no disponible</h2>
        <p className="text-xs text-[#8492A6] mt-2 max-w-md">{error || 'El viaje que buscas no existe o fue retirado.'}</p>
        <button
          onClick={onGoToApp || onExit}
          className="mt-6 px-5 py-2.5 rounded-xl bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir a la Bitácora de Viajes</span>
        </button>
      </div>
    );
  }

  const tituloViaje = fixAccents(viaje.titulo);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] font-sans flex flex-col w-full max-w-full overflow-x-hidden">
      {/* 1. BARRA SUPERIOR DE CABECERA PÚBLICA */}
      <SharedViajeHeader
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onExit={onExit}
        onGoToApp={onGoToApp}
      />

      {/* 2. CONTENIDO PRINCIPAL FLUIDO */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1700px] w-full mx-auto min-w-0 overflow-x-hidden space-y-4 sm:space-y-6">
        {/* HERO CARD DE RESUMEN DEL VIAJE */}
        <SharedViajeHero
          viaje={viaje}
          status={status}
          diffDays={diffDays}
          totalGastadoCOP={totalGastadoCOP}
        />

        {/* MÉTRICAS CLAVE Y ACCESO A MAPAMUNDI */}
        <SharedViajeMetricas
          visitedCountries={visitedCountries}
          flightRoutes={flightRoutes}
          eventosCount={eventos.length}
          gastosCount={gastos.length}
          totalGastadoUSD={totalGastadoUSD}
          onOpenMapModal={() => setIsMapModalOpen(true)}
        />

        {/* MODAL DEL MAPAMUNDI */}
        <WorldMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          title={`Ruta: ${tituloViaje}`}
          subtitle="Visualización geográfica de los países y trayectos de este viaje"
          badge={`${visitedCountries.size} ${visitedCountries.size === 1 ? 'país' : 'países'} · ${flightRoutes.length} ${flightRoutes.length === 1 ? 'vuelo' : 'vuelos'}`}
          visitedCountries={visitedCountries}
          flightRoutes={flightRoutes}
          showFlights={flightRoutes.length > 0}
          multiColor={false}
        />

        {/* NAVEGACIÓN POR PESTAÑAS (ITINERARIO / GASTOS / DOCUMENTOS) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-[#1C2436] pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('itinerario')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'itinerario'
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                  : 'text-[#8492A6] hover:bg-[#151B27] hover:text-[#F1F5F9]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Itinerario Cronológico ({eventos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gastos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'gastos'
                  ? 'bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/40 shadow-sm'
                  : 'text-[#8492A6] hover:bg-[#151B27] hover:text-[#F1F5F9]'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Gastos & Monedas ({gastos.length})</span>
            </button>

            {documentos.length > 0 && (
              <button
                onClick={() => setActiveTab('documentos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  activeTab === 'documentos'
                    ? 'bg-[#B55FE6]/15 text-[#B55FE6] border border-[#B55FE6]/40 shadow-sm'
                    : 'text-[#8492A6] hover:bg-[#151B27] hover:text-[#F1F5F9]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Documentos & Reservas ({documentos.length})</span>
              </button>
            )}
          </div>

          {activeTab === 'itinerario' && (
            <SharedViajeItinerarioTab
              eventos={eventos}
              groupedSharedSections={groupedSharedSections}
            />
          )}

          {activeTab === 'gastos' && (
            <SharedViajeGastosTab gastos={gastos} />
          )}

          {activeTab === 'documentos' && (
            <SharedViajeDocsTab documentos={documentos} />
          )}
        </div>
      </main>

      {/* 3. MODAL DE COMPARTIR */}
      <CompartirViajeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        viaje={viaje}
        eventos={eventos}
        gastos={gastos}
      />
    </div>
  );
}

export default SharedViajeView;
