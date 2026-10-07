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
  Sparkles
} from 'lucide-react';
import WorldMapAmCharts from '../../../components/WorldMapAmCharts';
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
  onCompartirViaje
}) {
  // Estado local para controlar si estamos en el Resumen Inicial (null) o en el Detalle de un Viaje
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'en_curso' | 'proximos' | 'finalizados'
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

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

  // Mapa de países para la vista global: ÚNICAMENTE países visitados/confirmados
  const globalVisitedCountries = useMemo(() => {
    const allVisited = extractVisitedCountries(allEventsList, viajes);
    const result = new Map();

    // 1. Filtrar los países que tienen visitas confirmadas (vuelos, hospedajes o estadías)
    allVisited.forEach((info, code) => {
      if (!info.isPending) {
        result.set(code, { ...info, isPending: false });
      }
    });

    // 2. Si no hay vuelos registrados aún en ninguna bitácora pero sí hay viajes registrados,
    // mostramos los destinos de los viajes para colorearlos en el mapa
    if (result.size === 0 && allVisited.size > 0) {
      allVisited.forEach((info, code) => {
        result.set(code, { ...info, isPending: false });
      });
    }

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
  // =========================================================================
  if (selectedViajeId && currentViaje) {
    const status = getViajeStatus(currentViaje);
    const startDate = new Date(currentViaje.fechaInicio);
    const endDate = new Date(currentViaje.fechaFin);
    const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

    return (
      <div className="space-y-6 relative pb-16">
        {/* Marcas de agua sutiles */}
        <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
        <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

        {/* Barra superior de Navegación: Volver a Mis Viajes + Información del Viaje */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToOverview}
              className="px-3.5 py-2 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] text-[#CBD5E1] hover:text-[#00FF85] transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver a Mis Viajes</span>
            </button>

            <div className="h-6 w-px bg-[#1C2436] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-6 bg-[#151B27] border border-[#1C2436] rounded flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                <MiniFlag country={currentViaje.destino} className="w-6 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#8492A6]">
                {cleanCountryText(currentViaje.destino)}
              </span>
            </div>
          </div>

          {/* Acciones de gestión del viaje */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onCompartirViaje && (
              <button
                type="button"
                onClick={() => onCompartirViaje(currentViaje)}
                title="Compartir bitácora con amigos"
                className="px-3 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <Share2 className="w-3.5 h-3.5 text-[#00FF85]" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            )}

            <button
              onClick={() => onEditViaje(currentViaje)}
              title="Editar viaje"
              className="px-3 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
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
              className="px-3 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Encabezado Principal del Viaje Seleccionado */}
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-2xl p-4 sm:p-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                  {status.label}
                </span>
                {currentViaje.tipoViaje === 'multidestino' && (
                  <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/15 border border-[#00FF85]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Multidestino
                  </span>
                )}
                <span className="text-xs text-[#8492A6] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B55FE6]" />
                  {diffDays} {diffDays === 1 ? 'día de aventura' : 'días de aventura'}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight m-0">
                {fixAccents(currentViaje.titulo)}
              </h1>
              {currentViaje.descripcion && (
                <p className="text-xs sm:text-sm text-[#8492A6] mt-1.5 m-0 max-w-3xl">
                  {fixAccents(currentViaje.descripcion)}
                </p>
              )}
            </div>

            {/* Resumen de Fechas y Origen/Destino */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-[#1C2436] gap-1">
              <span className="text-xs text-[#CBD5E1] font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00E5FF]" />
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
              <span className="text-xs text-[#8492A6]">
                {currentViaje.origen ? `${cleanCountryText(currentViaje.origen)} ➔ ` : ''}{cleanCountryText(currentViaje.destino)}
              </span>
            </div>
          </div>
        </div>

        {/* MAPAMUNDI ENFOCADO EN LA RUTA ESPECÍFICA DE ESTE VIAJE */}
        <section className="relative z-10 w-full max-w-full overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF] m-0 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              Ruta Aérea y Destinos del Viaje
            </h2>
            <span className="text-[11px] text-[#8492A6]">
              {tripFlights.length > 0 ? `${tripFlights.length} trayectos de vuelo` : 'Sin vuelos registrados aún'}
            </span>
          </div>

          <WorldMapAmCharts
            visitedCountries={tripVisitedCountries}
            flightRoutes={tripFlights}
            showFlights={true}
            multiColor={false}
          />
        </section>

        {/* DASHBOARD ANALÍTICO EXCLUSIVO DEL VIAJE SELECCIONADO */}
        <section className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F1F5F9] m-0 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00FF85]" />
                Métricas y Análisis Financiero del Viaje
              </h2>
              <p className="text-xs text-[#8492A6] mt-0.5 m-0">
                Control de presupuesto, gastos consolidados en COP/USD y estado financiero
              </p>
            </div>
          </div>

          {/* Tarjetas de Métricas del Viaje */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Presupuesto Total */}
            <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#FFE500]" />
                Presupuesto Total
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#FFE500] mt-1 m-0 truncate">
                ${tripMetrics.presupuesto.toLocaleString('es-CO')}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                Moneda Base: {tripMetrics.monedaBase}
              </span>
            </div>

            {/* Total Gastado en COP */}
            <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#00E5FF]" />
                Total Gastado (COP)
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#00E5FF] mt-1 m-0 truncate">
                ${tripMetrics.totalGastadoCOP.toLocaleString('es-CO')}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                {tripGastos.length} {tripGastos.length === 1 ? 'gasto registrado' : 'gastos registrados'}
              </span>
            </div>

            {/* Total Gastado en USD */}
            <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#B55FE6]" />
                Total Gastado (USD)
              </p>
              <p className="text-xl sm:text-2xl font-black text-[#B55FE6] mt-1 m-0 truncate">
                ${tripMetrics.totalGastadoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                Tasa de cambio exacta capturada
              </span>
            </div>

            {/* Saldo Disponible */}
            <div className={`bg-[#0E121B] border rounded-xl p-4 ${tripMetrics.isOverBudget ? 'border-[#FF2E55]' : 'border-[#1C2436]'}`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
                  Saldo Disponible
                </p>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${tripMetrics.isOverBudget ? 'text-[#FF2E55] bg-[#FF2E55]/10' : 'text-[#00FF85] bg-[#00FF85]/10'}`}>
                  {tripMetrics.porcentajePresupuesto}% consumido
                </span>
              </div>
              <p className={`text-xl sm:text-2xl font-black mt-1 m-0 truncate ${tripMetrics.isOverBudget ? 'text-[#FF2E55]' : 'text-[#00FF85]'}`}>
                ${tripMetrics.saldoRestante.toLocaleString('es-CO')}
              </p>
              <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
                {tripMetrics.isOverBudget ? '⚠️ Presupuesto excedido' : 'Dentro del presupuesto planeado'}
              </span>
            </div>
          </div>

          {/* Barra Visual de Ejecución del Presupuesto */}
          <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8492A6] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                Ejecución Presupuestal del Viaje
              </span>
              <span className="text-[#F1F5F9] font-bold">
                {tripMetrics.porcentajePresupuesto}% de ${tripMetrics.presupuesto.toLocaleString('es-CO')} {tripMetrics.monedaBase}
              </span>
            </div>
            <div className="w-full bg-[#151B27] h-2.5 rounded-full overflow-hidden border border-[#1C2436]">
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

          {/* Accesos Directos a los Módulos de Gestión de este Viaje */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8492A6] mb-3 m-0">
              Gestión Integral de esta Bitácora
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Módulo Itinerario */}
              <div
                onClick={() => onOpenBitacora(currentViaje.id)}
                className="bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] rounded-xl p-4 cursor-pointer transition-all hover:bg-[#151B27] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] mb-3 group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#00FF85] transition-colors">
                  Itinerario & Vuelos
                </h4>
                <p className="text-xs text-[#8492A6] mt-1 m-0">
                  {tripEvents.length} actividades y transportes
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#00FF85]">
                  <span>Abrir Itinerario</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Módulo Billetera */}
              <div
                onClick={() => {
                  if (onSelectTab) onSelectTab('billetera');
                }}
                className="bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF] rounded-xl p-4 cursor-pointer transition-all hover:bg-[#151B27] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] mb-3 group-hover:scale-105 transition-transform">
                  <Wallet className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#00E5FF] transition-colors">
                  Billetera & Gastos
                </h4>
                <p className="text-xs text-[#8492A6] mt-1 m-0">
                  {tripGastos.length} comprobantes y pagos
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#00E5FF]">
                  <span>Registrar Gastos</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Módulo Balance Financiero */}
              <div
                onClick={() => {
                  if (onSelectTab) onSelectTab('balance');
                }}
                className="bg-[#0E121B] border border-[#1C2436] hover:border-[#FFE500] rounded-xl p-4 cursor-pointer transition-all hover:bg-[#151B27] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-[#FFE500] mb-3 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#FFE500] transition-colors">
                  Balance Financiero
                </h4>
                <p className="text-xs text-[#8492A6] mt-1 m-0">
                  Tasas de cambio y balances
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#FFE500]">
                  <span>Ver Balance</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Módulo Bóveda de Documentos */}
              <div
                onClick={() => {
                  if (onSelectTab) onSelectTab('boveda');
                }}
                className="bg-[#0E121B] border border-[#1C2436] hover:border-[#B55FE6] rounded-xl p-4 cursor-pointer transition-all hover:bg-[#151B27] group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#B55FE6]/10 border border-[#B55FE6]/30 flex items-center justify-center text-[#B55FE6] mb-3 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#B55FE6] transition-colors">
                  Bóveda Digital
                </h4>
                <p className="text-xs text-[#8492A6] mt-1 m-0">
                  {tripDocs.length} pasaportes y boletos
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#B55FE6]">
                  <span>Abrir Bóveda</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: RESUMEN GENERAL LIMPIO Y MINIMALISTA (VISTA INICIAL TRAS LOGIN)
  // =========================================================================
  return (
    <div className="space-y-8 relative pb-16">
      {/* Marcas de agua sutiles de fondo */}
      <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
      <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

      {/* Cabecera Principal Limpia y Minimalista (Sin saturación de componentes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#F1F5F9] tracking-tight m-0">
            Bitácoras de Viaje
          </h1>
          <p className="text-xs text-[#8492A6] mt-1 m-0">
            Resumen global de destinos explorados en el mundo
          </p>
        </div>

        <button
          onClick={onOpenNuevoViaje}
          className="self-start sm:self-auto px-4 py-2 bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo Viaje
        </button>
      </div>

      {/* PROTAGONISTA 1: MAPAMUNDI GLOBAL
          Donde ÚNICAMENTE se pintan en diferentes colores los países que ya se han visitado,
          sin trayectos aéreos ni aviones cruzando el mapa. */}
      <section className="relative z-10 w-full max-w-full overflow-hidden">
        <WorldMapAmCharts
          visitedCountries={globalVisitedCountries}
          selectedCountryCode={selectedCountryCode}
          flightRoutes={[]} // Vista inicial limpia: sin vuelos en el mapa global
          showFlights={false} // Sin líneas de vuelo ni avión volando
          multiColor={true} // Países visitados coloreados cada uno en un tono armónico individual
          onSelectCountry={(code, info) => {
            setSelectedCountryCode(code);
            if (info && info.viajes && info.viajes[0]) {
              handleSelectViaje(info.viajes[0].id);
            }
          }}
        />
      </section>

      {/* PROTAGONISTA 2: LISTADO DE VIAJES REGISTRADOS
          Diseño limpio, espacioso y minimalista antes de entrar al detalle */}
      <section className="space-y-4 relative z-10 w-full max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9] m-0 uppercase tracking-wide flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#00E5FF]" />
              Viajes Registrados ({filteredViajes.length})
            </h2>
            <p className="text-xs text-[#8492A6] mt-0.5 m-0">
              Selecciona una bitácora para ver su ruta en el mapa y el detalle de sus métricas
            </p>
          </div>

          {/* Filtros de estado */}
          <div className="flex rounded-lg bg-[#0E121B] p-1 border border-[#1C2436] self-start sm:self-auto overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'en_curso', label: 'En Curso' },
              { id: 'proximos', label: 'Próximos' },
              { id: 'finalizados', label: 'Pasados' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 ${
                  filterStatus === f.id
                    ? 'bg-[#151B27] text-[#00FF85] border border-[#00FF85]/30'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Búsqueda Minimalista */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por destino, país o nombre del viaje..."
            className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F1F5F9] focus:outline-none placeholder-[#8492A6]/60"
          />
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
