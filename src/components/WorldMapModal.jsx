import React, { useEffect } from 'react';
import { X, Globe2, Plane, Sparkles, MapPin } from 'lucide-react';
import WorldMapAmCharts from './WorldMapAmCharts';

export function WorldMapModal({
  isOpen,
  onClose,
  title = 'Mapamundi Interactivo',
  subtitle = 'Explora tus destinos y rutas de viaje en el mundo',
  badge = null,
  visitedCountries = new Map(),
  flightRoutes = [],
  showFlights = true,
  multiColor = false,
  onSelectCountry,
  selectedCountryCode = null
}) {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Fondo clickeable para cerrar */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Contenedor del Modal */}
      <div
        className="bg-[#0E121B] border border-[#1C2436] rounded-2xl w-full max-w-[96vw] xl:max-w-7xl h-[88vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#1C2436] flex items-center justify-between gap-3 bg-[#0D111A] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] shrink-0">
              {showFlights && flightRoutes.length > 0 ? (
                <Plane className="w-4 h-4 text-[#00E5FF]" />
              ) : (
                <Globe2 className="w-4 h-4 text-[#00FF85]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0 truncate">
                  {title}
                </h3>
                {badge && (
                  <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/20 px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8492A6] m-0 truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[#8492A6] hidden sm:inline bg-[#151B27] px-2 py-1 rounded border border-[#1C2436]">
              Presiona <kbd className="text-[#CBD5E1] font-mono">Esc</kbd> para salir
            </span>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal con el Mapa amCharts 5 */}
        <div className="flex-1 w-full min-h-0 overflow-y-auto no-scrollbar bg-[#07090E]">
          <WorldMapAmCharts
            visitedCountries={visitedCountries}
            flightRoutes={flightRoutes}
            showFlights={showFlights}
            multiColor={multiColor}
            onSelectCountry={onSelectCountry}
            selectedCountryCode={selectedCountryCode}
            mapHeightClass="h-[58vh] sm:h-[66vh] md:h-[70vh] lg:h-[72vh]"
          />
        </div>
      </div>
    </div>
  );
}

export default WorldMapModal;
