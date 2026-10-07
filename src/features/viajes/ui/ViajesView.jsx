import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe2,
  Plus,
  Calendar,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Plane,
  Search,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  Share2,
  Wallet,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  Upload,
  Map as MapIcon
} from 'lucide-react';
import WorldMapModal from '../../../components/WorldMapModal';
import WatermarkIcon from '../../../components/WatermarkIcon';
import MiniFlag from '../../../components/MiniFlag';
import { extractVisitedCountries, getCountryFlag, cleanCountryText, fixAccents } from '../../../utils/countries';
import { extractFlightTrajectories } from '../../../utils/geoCoordinates';

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
  onAddDoc
}) {
  // Estado local para controlar si estamos en el Resumen Inicial (null) o en el Detalle de un Viaje
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'en_curso' | 'proximos' | 'finalizados'
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

  // Estados para abrir el mapamundi en ventana modal (oculto por defecto para no saturar la pantalla)
  const [isGlobalMapModalOpen, setIsGlobalMapModalOpen] = useState(false);
  const [isTripMapModalOpen, setIsTripMapModalOpen] = useState(false);

  // Si activeViajeId cambia externamente a null, limpiar selectedViajeId
  useEffect(() => {
    if (activeViajeId === null && selectedViajeId !== null) {
      setSelectedViajeId(null);
    }
  }, [activeViajeId]);

  // Compilar todos los eventos de todos los viajes registrados para el mapa global
  const allEventsList = useMemo(() => {
    const list = [...(eventos || [])];
    if (typeof localStorage !== 'undefined') {
      viajes.forEach((v) => {
        if (v.id !== activeViajeId) {
          try {
            const raw = localStorage.getItem(`app_viajes_eventos_${v.id}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                list.push(...parsed);
              }
            }
          } catch {}
        }
      });
    }
    return list;
  }, [eventos, viajes, activeViajeId]);

  // Mapa de países para la vista global:
  // Refleja TODOS los países configurados en los viajes (origen, destinos, escalas)
  const globalVisitedCountries = useMemo(() => {
    const allVisited = extractVisitedCountries(allEventsList, viajes);
    const result = new Map();

    allVisited.forEach((info, code) => {
      result.set(code, {
        ...info,
        isPending: false // Relleno sólido con su color asignado en la vista global
      });
    });

    return result;
  }, [allEventsList, viajes]);

  // Viaje actualmente seleccionado en modo detalle
  const currentViaje = useMemo(() => {
    if (!selectedViajeId) return null;
    return viajes.find((v) => v.id === selectedViajeId) || null;
  }, [viajes, selectedViajeId]);

  // Si el viaje seleccionado ya no existe (ej. fue eliminado), volver al resumen
  useEffect(() => {
    if (selectedViajeId && !currentViaje) {
      setSelectedViajeId(null);
    }
  }, [selectedViajeId, currentViaje]);

  // Eventos específicos del viaje seleccionado
  const tripEvents = useMemo(() => {
    if (!selectedViajeId) return [];
    if (selectedViajeId === activeViajeId && Array.isArray(eventos) && eventos.length > 0) {
      return eventos;
    }
    try {
      const raw = localStorage.getItem(`app_viajes_eventos_${selectedViajeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [selectedViajeId, activeViajeId, eventos]);

  // Rutas y trayectos aéreos del viaje seleccionado
  const tripFlights = useMemo(() => {
    if (!currentViaje) return [];
    return extractFlightTrajectories(tripEvents, [currentViaje]);
  }, [tripEvents, currentViaje]);

  // Países del viaje seleccionado para el mapa de detalle
  const tripVisitedCountries = useMemo(() => {
    if (!currentViaje) return new Map();
    return extractVisitedCountries(tripEvents, [currentViaje]);
  }, [tripEvents, currentViaje]);

  // Gastos específicos del viaje seleccionado
  const tripGastos = useMemo(() => {
    if (!selectedViajeId) return [];
    if (selectedViajeId === activeViajeId && Array.isArray(gastos) && gastos.length > 0) {
      return gastos;
    }
    try {
      const raw = localStorage.getItem(`app_viajes_gastos_${selectedViajeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [selectedViajeId, activeViajeId, gastos]);

  // Documentos específicos del viaje seleccionado
  const tripDocs = useMemo(() => {
    if (!selectedViajeId) return [];
    if (selectedViajeId === activeViajeId && Array.isArray(documentos) && documentos.length > 0) {
      return documentos;
    }
    try {
      const raw = localStorage.getItem(`app_viajes_docs_${selectedViajeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [selectedViajeId, activeViajeId, documentos]);

  // Métricas financieras calculadas exclusivamente para el viaje seleccionado
  const tripMetrics = useMemo(() => {
    if (!currentViaje) {
      return {
        presupuesto: 0,
        monedaBase: 'COP',
        totalGastadoCOP: 0,
        totalGastadoUSD: 0,
        saldoRestante: 0,
        porcentajePresupuesto: 0,
        isOverBudget: false
      };
    }

    const presupuesto = Number(currentViaje.presupuestoTotal) || 0;
    const monedaBase = (currentViaje.monedaBase || 'COP').toUpperCase();

    const totalGastadoCOP = tripGastos.reduce((sum, g) => sum + (Number(g.montoCOP) || 0), 0);
    const totalGastadoUSD = tripGastos.reduce((sum, g) => sum + (Number(g.montoUSD) || 0), 0);

    const gastoBase = monedaBase === 'USD' ? totalGastadoUSD : totalGastadoCOP;
    const saldoRestante = presupuesto - gastoBase;
    const porcentajePresupuesto = presupuesto > 0 ? Math.round((gastoBase / presupuesto) * 100) : 0;
    const isOverBudget = saldoRestante < 0;

    return {
      presupuesto,
      monedaBase,
      totalGastadoCOP,
      totalGastadoUSD,
      gastoBase,
      saldoRestante,
      porcentajePresupuesto,
      isOverBudget
    };
  }, [currentViaje, tripGastos]);

  // Calcular estado del viaje (en curso, próximo, finalizado)
  const getViajeStatus = (viaje) => {
    if (!viaje || !viaje.fechaInicio || !viaje.fechaFin) {
      return { id: 'proximos', label: 'Planificado', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]' };
    }
    const now = new Date();
    const start = new Date(viaje.fechaInicio);
    const end = new Date(viaje.fechaFin);

    if (now >= start && now <= end) {
      return { id: 'en_curso', label: 'En curso', color: 'text-[#00FF85]', bg: 'bg-[#00FF85]/10', border: 'border-[#00FF85]' };
    }
    if (now < start) {
      return { id: 'proximos', label: 'Próximo', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]' };
    }
    return { id: 'finalizados', label: 'Finalizado', color: 'text-[#8492A6]', bg: 'bg-[#151B27]', border: 'border-[#1C2436]' };
  };

  // Filtrado de viajes para el listado
  const filteredViajes = useMemo(() => {
    return viajes.filter((v) => {
      const matchSearch =
        v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.destino.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'todos') return true;
      const status = getViajeStatus(v);
      return status.id === filterStatus;
    });
  }, [viajes, searchTerm, filterStatus]);

  // Handler para seleccionar un viaje e ir a su vista de detalle
  const handleSelectViaje = (viajeId) => {
    setSelectedViajeId(viajeId);
    if (onSelectViaje) {
      onSelectViaje(viajeId);
    }
  };

  // Handler para regresar al resumen global inicial
  const handleBackToOverview = () => {
    setSelectedViajeId(null);
    setSelectedCountryCode(null);
  };

  // =========================================================================
  // VISTA 1: MODO DETALLE DEL VIAJE SELECCIONADO
  // Flujo optimizado: Datos y registros a la mano; mapa disponible en ventana modal
  // =========================================================================
  if (selectedViajeId && currentViaje) {
    const status = getViajeStatus(currentViaje);
    const startDate = new Date(currentViaje.fechaInicio);
    const endDate = new Date(currentViaje.fechaFin);
    const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

    return (
      <div className="space-y-5 relative pb-16">
        {/* Marcas de agua sutiles */}
        <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
        <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

        {/* Modal del Mapamundi para este Viaje Específico (Oculto por defecto, se abre con el botón) */}
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
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Botón para abrir el mapa de ruta en modal */}
            <button
              onClick={() => setIsTripMapModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Abrir mapa interactivo de la ruta aérea en ventana modal"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Ver Ruta en el Mapa</span>
            </button>

            {onCompartirViaje && (
              <button
                type="button"
                onClick={() => onCompartirViaje(currentViaje)}
                title="Compartir bitácora con amigos"
                className="px-2.5 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <Share2 className="w-3.5 h-3.5 text-[#00FF85]" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            )}

            <button
              onClick={() => onEditViaje(currentViaje)}
              title="Editar viaje"
              className="px-2.5 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={() => {
                onDeleteViaje(currentViaje);
                handleBackToOverview();
              }}
              title="Eliminar viaje"
              className="px-2.5 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
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

            {/* BOTONES DE ACCIÓN RÁPIDA INMEDIATOS (A LA MANO, 0 SCROLL) */}
            <div className="flex items-center gap-2 flex-wrap shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#1C2436]">
              {onAddEvento && (
                <button
                  onClick={() => onAddEvento()}
                  className="px-3.5 py-2 bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Registrar vuelo o actividad en el itinerario"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>+ Vuelo / Actividad</span>
                </button>
              )}

              {onAddGasto && (
                <button
                  onClick={() => onAddGasto()}
                  className="px-3.5 py-2 bg-[#00E5FF] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Registrar nuevo gasto para este viaje"
                >
                  <DollarSign className="w-4 h-4" strokeWidth={2.5} />
                  <span>+ Gasto</span>
                </button>
              )}

              {onAddDoc && (
                <button
                  onClick={() => onAddDoc()}
                  className="px-3 py-2 bg-[#151B27] border border-[#B55FE6]/40 hover:border-[#B55FE6] text-[#B55FE6] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Subir boleto, reserva o pasaporte"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Documento</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* REUBICACIÓN PRINCIPAL: GRID DE GESTIÓN Y ACCESO RÁPIDO (A LA MANO) */}
        <section className="relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* 1. Módulo Itinerario & Vuelos */}
            <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded">
                    {tripEvents.length} {tripEvents.length === 1 ? 'actividad' : 'actividades'}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#00FF85] transition-colors">
                  Itinerario & Vuelos
                </h4>
                <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
                  Vuelos, escalas y agenda diaria
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-between gap-1.5">
                {onAddEvento && (
                  <button
                    onClick={() => onAddEvento()}
                    className="text-[11px] font-semibold text-[#00FF85] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Registrar
                  </button>
                )}
                <button
                  onClick={() => onOpenBitacora(currentViaje.id)}
                  className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#00FF85] cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <span>Abrir</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 2. Módulo Billetera & Gastos */}
            <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:scale-105 transition-transform">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded">
                    {tripGastos.length} {tripGastos.length === 1 ? 'comprobante' : 'comprobantes'}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#00E5FF] transition-colors">
                  Billetera & Gastos
                </h4>
                <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
                  Control de pagos y divisas
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-between gap-1.5">
                {onAddGasto && (
                  <button
                    onClick={() => onAddGasto()}
                    className="text-[11px] font-semibold text-[#00E5FF] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Registrar
                  </button>
                )}
                <button
                  onClick={() => onSelectTab && onSelectTab('billetera')}
                  className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#00E5FF] cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <span>Abrir</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 3. Módulo Balance Financiero */}
            <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#FFE500] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-[#FFE500] group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tripMetrics.isOverBudget ? 'text-[#FF2E55] bg-[#FF2E55]/10' : 'text-[#FFE500] bg-[#FFE500]/10'}`}>
                    {tripMetrics.porcentajePresupuesto}% gastado
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#FFE500] transition-colors">
                  Balance Financiero
                </h4>
                <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
                  Presupuesto vs ejecución
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-end">
                <button
                  onClick={() => onSelectTab && onSelectTab('balance')}
                  className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#FFE500] cursor-pointer flex items-center gap-1"
                >
                  <span>Ver Balance</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 4. Módulo Bóveda de Documentos */}
            <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#B55FE6] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#B55FE6]/10 border border-[#B55FE6]/30 flex items-center justify-center text-[#B55FE6] group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#B55FE6] bg-[#B55FE6]/10 px-2 py-0.5 rounded">
                    {tripDocs.length} {tripDocs.length === 1 ? 'archivo' : 'archivos'}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#B55FE6] transition-colors">
                  Bóveda Digital
                </h4>
                <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
                  Pasaportes, reservas y tickets
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-between gap-1.5">
                {onAddDoc && (
                  <button
                    onClick={() => onAddDoc()}
                    className="text-[11px] font-semibold text-[#B55FE6] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Subir
                  </button>
                )}
                <button
                  onClick={() => onSelectTab && onSelectTab('boveda')}
                  className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#B55FE6] cursor-pointer flex items-center gap-1 ml-auto"
                >
                  <span>Abrir</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MÉTRICAS FINANCIERAS RESUMIDAS DEL VIAJE */}
        <section className="space-y-3 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* Presupuesto Total */}
            <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#FFE500]" />
                Presupuesto
              </p>
              <p className="text-lg sm:text-xl font-black text-[#FFE500] mt-0.5 m-0 truncate">
                ${tripMetrics.presupuesto.toLocaleString('es-CO')}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                Moneda Base: {tripMetrics.monedaBase}
              </span>
            </div>

            {/* Total Gastado en COP */}
            <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#00E5FF]" />
                Gastado (COP)
              </p>
              <p className="text-lg sm:text-xl font-black text-[#00E5FF] mt-0.5 m-0 truncate">
                ${tripMetrics.totalGastadoCOP.toLocaleString('es-CO')}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                {tripGastos.length} gastos registrados
              </span>
            </div>

            {/* Total Gastado en USD */}
            <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#B55FE6]" />
                Gastado (USD)
              </p>
              <p className="text-lg sm:text-xl font-black text-[#B55FE6] mt-0.5 m-0 truncate">
                ${tripMetrics.totalGastadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                Tasa exacta capturada
              </span>
            </div>

            {/* Saldo Disponible */}
            <div className={`bg-[#0E121B] border rounded-xl p-3.5 ${tripMetrics.isOverBudget ? 'border-[#FF2E55]' : 'border-[#1C2436]'}`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
                  Saldo Disponible
                </p>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${tripMetrics.isOverBudget ? 'text-[#FF2E55] bg-[#FF2E55]/10' : 'text-[#00FF85] bg-[#00FF85]/10'}`}>
                  {tripMetrics.porcentajePresupuesto}%
                </span>
              </div>
              <p className={`text-lg sm:text-xl font-black mt-0.5 m-0 truncate ${tripMetrics.isOverBudget ? 'text-[#FF2E55]' : 'text-[#00FF85]'}`}>
                ${tripMetrics.saldoRestante.toLocaleString('es-CO')}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                {tripMetrics.isOverBudget ? '⚠️ Presupuesto excedido' : 'Dentro de lo planeado'}
              </span>
            </div>
          </div>

          {/* Barra Visual de Ejecución del Presupuesto */}
          <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8492A6] font-medium flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                Ejecución Presupuestal
              </span>
              <span className="text-[#F1F5F9] font-bold text-[11px]">
                {tripMetrics.porcentajePresupuesto}% de ${tripMetrics.presupuesto.toLocaleString('es-CO')} {tripMetrics.monedaBase}
              </span>
            </div>
            <div className="w-full bg-[#151B27] h-2 rounded-full overflow-hidden border border-[#1C2436]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  tripMetrics.isOverBudget
                    ? 'bg-[#FF2E55]'
                    : tripMetrics.porcentajePresupuesto > 85
                    ? 'bg-[#FFB800]'
                    : 'bg-gradient-to-r from-[#00E5FF] to-[#00FF85]'
                }`}
                style={{ width: `${Math.min(100, tripMetrics.porcentajePresupuesto)}%` }}
              />
            </div>
          </div>
        </section>

        {/* Modal de la Ruta en Mapa del Viaje Seleccionado */}
        <WorldMapModal
          isOpen={isTripMapModalOpen}
          onClose={() => setIsTripMapModalOpen(false)}
          title={`Ruta: ${fixAccents(currentViaje.titulo || 'Detalle del Viaje')}`}
          subtitle={`${cleanCountryText(currentViaje.origen)} ➔ ${cleanCountryText(currentViaje.destino)}`}
          badge={`${tripFlights.length} ${tripFlights.length === 1 ? 'vuelo registrado' : 'vuelos registrados'}`}
          visitedCountries={tripVisitedCountries}
          flightRoutes={tripFlights}
          showFlights={tripFlights.length > 0}
          multiColor={false}
        />
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: RESUMEN GENERAL LIMPIO Y MINIMALISTA (VISTA INICIAL TRAS LOGIN)
  // El mapamundi está oculto por defecto y se abre en ventana modal con un botón.
  // El espacio es 100% aprovechado para el listado de viajes registrados.
  // =========================================================================
  return (
    <div className="space-y-6 relative pb-16">
      {/* Marcas de agua sutiles de fondo */}
      <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
      <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

      {/* Modal del Mapamundi Global (Oculto por defecto, se abre con clic en el botón) */}
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

      {/* 1. CABECERA PRINCIPAL CON BOTONES ALINEADOS (ALTURA UNIFORME h-10) */}
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

        {/* Botones de acción principales (h-10 exacto, sin quiebres de línea, perfectamente alineados) */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Botón para abrir el mapamundi en modal */}
          <button
            type="button"
            onClick={() => setIsGlobalMapModalOpen(true)}
            className="h-10 px-4 bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 text-[#00E5FF] font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap select-none"
            title="Abrir mapamundi global en ventana modal"
          >
            <Globe2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
            <span className="whitespace-nowrap">Ver Mapa Mundi</span>
            {globalVisitedCountries.size > 0 && (
              <span className="bg-[#00E5FF]/20 text-[#00E5FF] text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 shrink-0">
                {globalVisitedCountries.size}
              </span>
            )}
          </button>

          {/* Botón Nuevo Viaje */}
          <button
            type="button"
            onClick={onOpenNuevoViaje}
            className="h-10 px-4 bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-opacity inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap select-none"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span className="whitespace-nowrap">Nuevo Viaje</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS INTEGRADA: BÚSQUEDA Y FILTROS APROVECHANDO TODO EL ANCHO */}
      <section className="space-y-4 relative z-10 w-full max-w-full overflow-hidden">
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-2xl p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-sm">
          {/* Campo de Búsqueda que se expande en todo el ancho disponible */}
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

          {/* Filtros de Estado integrados en la misma barra */}
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

        {/* Grid Limpio de Tarjetas de Viaje */}
        {filteredViajes.length === 0 ? (
          <div className="bg-[#0E121B] border border-dashed border-[#1C2436] rounded-2xl p-12 text-center">
            <Globe2 className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#F1F5F9] m-0">No se encontraron viajes</h3>
            <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No hay bitácoras que coincidan con la búsqueda.'
                : 'Crea tu primera bitácora de viaje para empezar a pintar tus destinos en el mapa.'}
            </p>
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Primer Viaje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredViajes.map((viaje) => {
              const status = getViajeStatus(viaje);
              const isActive = activeViajeId === viaje.id;
              const startDate = new Date(viaje.fechaInicio);
              const endDate = new Date(viaje.fechaFin);
              const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={viaje.id}
                  onClick={() => handleSelectViaje(viaje.id)}
                  className={`bg-[#0E121B] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-[#00E5FF] hover:shadow-lg hover:shadow-[#00E5FF]/5 group relative cursor-pointer ${
                    isActive ? 'border-[#00FF85]' : 'border-[#1C2436]'
                  }`}
                >
                  {/* Encabezado del Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <div className="w-8 h-6 bg-[#151B27] border border-[#1C2436] rounded flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          <MiniFlag country={viaje.destino} className="w-6 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#CBD5E1] bg-[#151B27] px-2.5 py-1 rounded-full border border-[#1C2436] truncate max-w-[150px]">
                          {cleanCountryText(viaje.destino)}
                        </span>
                        {viaje.tipoViaje === 'multidestino' && (
                          <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/15 border border-[#00FF85]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Multidestino
                          </span>
                        )}
                      </div>

                      {/* Badge de Estado */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${status.bg} ${status.color} ${status.border}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F1F5F9] m-0 group-hover:text-[#00E5FF] transition-colors">
                      {fixAccents(viaje.titulo)}
                    </h3>
                    {viaje.descripcion && (
                      <p className="text-xs text-[#8492A6] mt-1 line-clamp-2 m-0">
                        {fixAccents(viaje.descripcion)}
                      </p>
                    )}

                    {/* Metadatos (Origen, Fechas, Duración, Presupuesto) */}
                    <div className="mt-4 pt-4 border-t border-[#1C2436] space-y-2 text-xs">
                      {viaje.origen && (
                        <div className="flex items-center justify-between text-[#8492A6]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
                            Origen
                          </span>
                          <span className="text-[#F1F5F9] font-medium truncate max-w-[170px]">
                            {cleanCountryText(viaje.origen)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[#8492A6]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                          Fechas
                        </span>
                        <span className="text-[#F1F5F9] font-medium">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#8492A6]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#B55FE6]" />
                          Duración
                        </span>
                        <span className="text-[#F1F5F9] font-medium">
                          {diffDays} {diffDays === 1 ? 'día' : 'días'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#8492A6]">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[#FFE500]" />
                          Presupuesto
                        </span>
                        <span className="text-[#FFE500] font-bold">
                          ${(Number(viaje.presupuestoTotal) || 0).toLocaleString('es-CO')} {viaje.monedaBase || 'COP'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="mt-5 pt-4 border-t border-[#1C2436] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {onCompartirViaje && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompartirViaje(viaje);
                          }}
                          title="Compartir bitácora con amigos"
                          className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#00FF85]" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditViaje(viaje);
                        }}
                        title="Editar información del viaje"
                        className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteViaje(viaje);
                        }}
                        title="Eliminar bitácora de viaje"
                        className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectViaje(viaje.id);
                      }}
                      className="px-3 py-1.5 bg-[#151B27] text-[#00FF85] border border-[#00FF85]/40 hover:bg-[#00FF85] hover:text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer group-hover:bg-[#00FF85] group-hover:text-[#080A0F]"
                    >
                      <span>Ver Detalle</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ViajesView;
