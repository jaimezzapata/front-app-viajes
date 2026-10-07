import React, { useState } from 'react';
import { Toaster } from 'sonner';

// Componentes estructurales
import SidebarNav from './components/SidebarNav';
import BottomNav from './components/BottomNav';
import Header from './components/Header';

// Vistas de los 5 módulos
import ViajesView from './features/viajes/ui/ViajesView';
import ItinerarioView from './features/itinerario/ui/ItinerarioView';
import BilleteraView from './features/billetera/ui/BilleteraView';
import BalanceView from './features/balance/ui/BalanceView';
import BovedaView from './features/boveda/ui/BovedaView';

// Pantallas
import AuthScreen from './features/auth/ui/AuthScreen';

// Modales
import AuthModal from './features/auth/ui/AuthModal';
import NuevoViajeModal from './features/viajes/ui/NuevoViajeModal';
import ConfirmDeleteViajeModal from './features/viajes/ui/ConfirmDeleteViajeModal';
import NuevoEventoModal from './features/itinerario/ui/NuevoEventoModal';
import ConfirmDeleteEventoModal from './features/itinerario/ui/ConfirmDeleteEventoModal';
import NuevoGastoModal from './features/billetera/ui/NuevoGastoModal';
import NuevoDocModal from './features/boveda/ui/NuevoDocModal';

// Custom Hooks
import { useAuth } from './features/auth/use-cases/useAuth';
import { useAppViajes } from './hooks/useAppViajes';
import { useTheme } from './context/ThemeContext';

export function App() {
  const { theme, isDark } = useTheme();
  // Tras iniciar sesión o registrarse, la pantalla principal es Mis Viajes y Mapa Mundi
  const [activeTab, setActiveTab] = useState('viajes');

  // Estados de modales
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNuevoViajeOpen, setIsNuevoViajeOpen] = useState(false);
  const [viajeAEditar, setViajeAEditar] = useState(null);
  const [viajeAEliminar, setViajeAEliminar] = useState(null);
  const [isNuevoEventoOpen, setIsNuevoEventoOpen] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState(null);
  const [eventoAEliminar, setEventoAEliminar] = useState(null);
  const [isNuevoGastoOpen, setIsNuevoGastoOpen] = useState(false);
  const [isNuevoDocOpen, setIsNuevoDocOpen] = useState(false);

  // Hook de autenticación simple (nombre y correo)
  const { usuario, loginOrRegister, logout } = useAuth();

  // Hook maestro de bitácora y datos offline (llamado incondicionalmente según las Reglas de Hooks de React)
  const {
    viajes,
    activeViaje,
    activeViajeId,
    setActiveViajeId,
    eventos,
    gastos,
    documentos,
    balance,
    isOnline,
    handleSaveViaje,
    handleUpdateViaje,
    handleDeleteViaje,
    handleSaveEvento,
    handleUpdateEvento,
    handleDeleteEvento,
    handleSaveGasto,
    handleSaveDocumento
  } = useAppViajes(usuario);

  // Si no hay usuario autenticado, la pantalla principal es obligatoriamente el inicio de sesión / registro
  // y se protegen todas las rutas, vistas y navegación de la bitácora
  if (!usuario) {
    return (
      <>
        <Toaster
          position="top-right"
          theme={theme}
          toastOptions={{
            style: {
              background: isDark ? '#0E121B' : '#FFFFFF',
              border: isDark ? '1px solid #1C2436' : '1px solid #E2E8F0',
              color: isDark ? '#F1F5F9' : '#0F172A'
            }
          }}
        />
        <AuthScreen onLoginOrRegister={loginOrRegister} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] flex flex-col md:flex-row font-sans w-full max-w-full overflow-x-hidden">
      {/* Notificaciones Sonner configuradas dinámicamente con el tema */}
      <Toaster
        position="top-right"
        theme={theme}
        toastOptions={{
          style: {
            background: isDark ? '#0E121B' : '#FFFFFF',
            border: isDark ? '1px solid #1C2436' : '1px solid #E2E8F0',
            color: isDark ? '#F1F5F9' : '#0F172A'
          }
        }}
      />

      {/* Navegación Lateral para PC y Tablet (REGLAS 1.5) */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        usuario={usuario}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen w-full max-w-full overflow-x-hidden">
        {/* Cabecera común */}
        <Header
          activeViaje={activeViaje}
          viajes={viajes}
          onSelectViaje={setActiveViajeId}
          onNewViaje={() => {
            setViajeAEditar(null);
            setIsNuevoViajeOpen(true);
          }}
          onEditViaje={(viaje) => {
            setViajeAEditar(viaje);
            setIsNuevoViajeOpen(true);
          }}
          onDeleteViaje={(viaje) => setViajeAEliminar(viaje)}
          isOnline={isOnline}
          usuario={usuario}
          onOpenAuth={() => setIsAuthOpen(true)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Área de Contenido por Tab con Contenedor Responsivo Ampliado (max-w-[1700px] en PC) */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 md:pb-8 max-w-[1700px] w-full mx-auto min-w-0 overflow-x-hidden">
          {activeTab === 'viajes' && (
            <ViajesView
              viajes={viajes}
              activeViajeId={activeViajeId}
              eventos={eventos}
              onSelectViaje={(id) => {
                setActiveViajeId(id);
              }}
              onOpenBitacora={(id) => {
                setActiveViajeId(id);
                setActiveTab('itinerario');
              }}
              onOpenNuevoViaje={() => {
                setViajeAEditar(null);
                setIsNuevoViajeOpen(true);
              }}
              onEditViaje={(viaje) => {
                setViajeAEditar(viaje);
                setIsNuevoViajeOpen(true);
              }}
              onDeleteViaje={(viaje) => {
                const target = typeof viaje === 'string' ? viajes.find(v => v.id === viaje) : viaje;
                setViajeAEliminar(target || { id: viaje, titulo: 'este viaje' });
              }}
            />
          )}

          {activeTab === 'itinerario' && (
            <ItinerarioView
              activeViaje={activeViaje}
              eventos={eventos}
              onOpenNuevoViaje={() => {
                setViajeAEditar(null);
                setIsNuevoViajeOpen(true);
              }}
              onAddEvento={() => {
                setEventoAEditar(null);
                setIsNuevoEventoOpen(true);
              }}
              onEditEvento={(evento) => {
                setEventoAEditar(evento);
                setIsNuevoEventoOpen(true);
              }}
              onDeleteEvento={(evento) => {
                setEventoAEliminar(evento);
              }}
            />
          )}

          {activeTab === 'billetera' && (
            <BilleteraView
              activeViaje={activeViaje}
              gastos={gastos}
              onOpenNuevoViaje={() => {
                setViajeAEditar(null);
                setIsNuevoViajeOpen(true);
              }}
              onAddGasto={() => setIsNuevoGastoOpen(true)}
              monedaBase={activeViaje?.monedaBase}
            />
          )}

          {activeTab === 'balance' && (
            <BalanceView
              viaje={activeViaje}
              onOpenNuevoViaje={() => {
                setViajeAEditar(null);
                setIsNuevoViajeOpen(true);
              }}
              balance={balance}
              gastos={gastos}
              eventos={eventos}
            />
          )}

          {activeTab === 'boveda' && (
            <BovedaView
              activeViaje={activeViaje}
              documentos={documentos}
              onOpenNuevoViaje={() => {
                setViajeAEditar(null);
                setIsNuevoViajeOpen(true);
              }}
              onAddDocumento={() => setIsNuevoDocOpen(true)}
            />
          )}
        </main>

        {/* Navegación Inferior en Móvil (< 768px) */}
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Modales de la aplicación */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        usuario={usuario}
        onLoginOrRegister={loginOrRegister}
        onLogout={logout}
      />

      <NuevoViajeModal
        isOpen={isNuevoViajeOpen}
        onClose={() => {
          setIsNuevoViajeOpen(false);
          setViajeAEditar(null);
        }}
        onSaveViaje={handleSaveViaje}
        viajeAEditar={viajeAEditar}
        onUpdateViaje={handleUpdateViaje}
      />

      <ConfirmDeleteViajeModal
        isOpen={Boolean(viajeAEliminar)}
        viaje={viajeAEliminar}
        onClose={() => setViajeAEliminar(null)}
        onConfirmDelete={async (id) => {
          await handleDeleteViaje(id);
          setViajeAEliminar(null);
        }}
      />

      <NuevoEventoModal
        isOpen={isNuevoEventoOpen}
        onClose={() => {
          setIsNuevoEventoOpen(false);
          setEventoAEditar(null);
        }}
        eventoAEditar={eventoAEditar}
        onSaveEvento={handleSaveEvento}
        onUpdateEvento={handleUpdateEvento}
        monedaDefault={activeViaje?.monedaBase || 'COP'}
      />

      <ConfirmDeleteEventoModal
        isOpen={Boolean(eventoAEliminar)}
        evento={eventoAEliminar}
        onClose={() => setEventoAEliminar(null)}
        onConfirmDelete={async (id) => {
          await handleDeleteEvento(id);
          setEventoAEliminar(null);
        }}
      />

      <NuevoGastoModal
        isOpen={isNuevoGastoOpen}
        onClose={() => setIsNuevoGastoOpen(false)}
        onSaveGasto={handleSaveGasto}
        monedaDefault={activeViaje?.monedaBase || 'COP'}
      />

      <NuevoDocModal
        isOpen={isNuevoDocOpen}
        onClose={() => setIsNuevoDocOpen(false)}
        onSaveDocumento={handleSaveDocumento}
      />
    </div>
  );
}

export default App;
