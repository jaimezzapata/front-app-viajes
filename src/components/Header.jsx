import React, { useState, useRef, useEffect } from 'react';
import { Plane, Wifi, WifiOff, User, Plus, Globe2, Edit2, Trash2, MoreVertical, X } from 'lucide-react';
import { cleanCountryText, fixAccents } from '../utils/countries';
import MiniFlag from './MiniFlag';
import ThemeToggle from './ThemeToggle';

export function Header({
  activeViaje,
  viajes = [],
  onSelectViaje,
  onNewViaje,
  onEditViaje,
  onDeleteViaje,
  isOnline = true,
  usuario,
  onOpenAuth,
  activeTab,
  onSelectTab
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú móvil al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  return (
    <header className="bg-[#0E121B] border-b border-[#1C2436] px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Selector de Viaje Activo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center shrink-0 text-[#00E5FF]">
            <Plane className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            {viajes.length > 0 ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <select
                  value={activeViaje?.id || ''}
                  onChange={(e) => onSelectViaje(e.target.value)}
                  className="bg-[#151B27] text-[#F1F5F9] text-xs sm:text-sm font-semibold border border-[#1C2436] rounded px-2 sm:px-2.5 py-1 focus:outline-none focus:border-[#00E5FF] truncate cursor-pointer max-w-[150px] xs:max-w-[200px] sm:max-w-[280px]"
                >
                  {viajes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {fixAccents(v.titulo)} ({cleanCountryText(v.destino)})
                    </option>
                  ))}
                </select>

                <button
                  onClick={onNewViaje}
                  title="Nuevo Viaje"
                  className="p-1 sm:p-1.5 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#00FF85] transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                </button>

                {/* Acciones de viaje en Desktop */}
                {activeViaje && onEditViaje && (
                  <button
                    onClick={() => onEditViaje(activeViaje)}
                    title="Editar Viaje Activo"
                    className="hidden sm:inline-flex p-1 sm:p-1.5 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#8492A6] hover:text-[#00E5FF] transition-colors cursor-pointer shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                  </button>
                )}

                {activeViaje && onDeleteViaje && (
                  <button
                    onClick={() => onDeleteViaje(activeViaje)}
                    title="Eliminar Viaje Activo"
                    className="hidden sm:inline-flex p-1 sm:p-1.5 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                  </button>
                )}

                {activeTab !== 'viajes' && onSelectTab && (
                  <button
                    onClick={() => onSelectTab('viajes')}
                    title="Ver Mapa Mundi y Todos los Viajes"
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#00FF85] text-xs font-semibold cursor-pointer transition-colors shrink-0"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Mapa Mundi</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-[#8492A6]">Sin viajes</span>
                <button
                  onClick={onNewViaje}
                  className="text-[11px] sm:text-xs bg-[#00FF85] text-[#080A0F] font-bold px-2 py-0.5 rounded hover:opacity-90"
                >
                  Crear Viaje
                </button>
              </div>
            )}

            {/* Subtítulo limpio en móvil y desktop */}
            {activeViaje && (
              <p className="text-[10px] sm:text-[11px] text-[#8492A6] m-0 mt-0.5 truncate flex items-center gap-1 sm:gap-1.5">
                <span>{new Date(activeViaje.fechaInicio).toLocaleDateString()} - {new Date(activeViaje.fechaFin).toLocaleDateString()}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <MiniFlag country={activeViaje.destino} className="w-3.5 h-2.5 sm:w-4 sm:h-2.5 shrink-0" />
                  <span className="text-[#F1F5F9] font-medium truncate">{cleanCountryText(activeViaje.destino)}</span>
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Indicador de Red, Selector de Tema y Usuario */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Selector de Modo Claro / Oscuro */}
          <ThemeToggle size="sm" />

          {/* Chip de estado de conexión (Compacto en móvil, completo en desktop) */}
          <div
            title={isOnline ? 'Conectado a Internet' : 'Modo Offline'}
            className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full text-[11px] font-semibold border ${
              isOnline
                ? 'bg-[#151B27] border-[#1C2436] text-[#00FF85]'
                : 'bg-[#151B27] border-[#FF2E55] text-[#FF2E55]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#00FF85]' : 'bg-[#FF2E55]'
              }`}
            />
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Botón de opciones móviles (Dropdown de acciones) */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer"
              title="Más opciones"
            >
              {showMobileMenu ? (
                <X className="w-4 h-4 text-[#FF2E55]" strokeWidth={2.2} />
              ) : (
                <MoreVertical className="w-4 h-4" strokeWidth={2.2} />
              )}
            </button>

            {/* Menú Desplegable Móvil */}
            {showMobileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0E121B] border border-[#1C2436] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                {activeViaje && onEditViaje && (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onEditViaje(activeViaje);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#F1F5F9] hover:bg-[#151B27] text-left cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Editar Viaje</span>
                  </button>
                )}

                {activeViaje && onDeleteViaje && (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onDeleteViaje(activeViaje);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#FF2E55] hover:bg-[#FF2E55]/10 text-left cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Viaje</span>
                  </button>
                )}

                {activeTab !== 'viajes' && onSelectTab && (
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onSelectTab('viajes');
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#00FF85] hover:bg-[#151B27] text-left cursor-pointer transition-colors"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Ver Mapa Mundi</span>
                  </button>
                )}

                <div className="h-[1px] bg-[#1C2436] my-0.5" />

                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenAuth();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#8492A6] hover:bg-[#151B27] hover:text-[#F1F5F9] text-left cursor-pointer transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#00FF85]" />
                  <span className="truncate">{usuario ? usuario.nombre : 'Perfil'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Botón de usuario en desktop */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex md:hidden p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] text-[#00FF85]"
            title="Perfil de Usuario"
          >
            <User className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
