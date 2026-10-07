import React, { useState, useEffect, useMemo } from 'react';
import {
  Plane,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Globe2,
  Share2,
  ArrowLeft,
  Sparkles,
  Navigation,
  Wallet,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Coins,
  ArrowRightLeft,
  Building,
  Utensils,
  Camera,
  Layers,
  Info
} from 'lucide-react';
import WorldMapAmCharts from '../../../components/WorldMapAmCharts';
import MiniFlag from '../../../components/MiniFlag';
import ThemeToggle from '../../../components/ThemeToggle';
import WatermarkIcon from '../../../components/WatermarkIcon';
import CompartirViajeModal from './CompartirViajeModal';
import { cleanCountryText, fixAccents, extractVisitedCountries, getCountryFlag } from '../../../utils/countries';
import { extractFlightTrajectories } from '../../../utils/geoCoordinates';
import { formatCurrencyDisplay, CURRENCY_MAP } from '../../../utils/currencies';
import { apiRequest } from '../../../services/api';

const EVENT_TYPE_ICONS = {
  vuelo: Plane,
  hotel: Building,
  alojamiento: Building,
  atraccion: Camera,
  actividad: Camera,
  tour: Camera,
  comida: Utensils,
  restaurante: Utensils,
  transporte: Navigation,
  otro: MapPin
};

export function SharedViajeView({ shareId, shareDataRaw, onExit, onGoToApp }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viaje, setViaje] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [activeTab, setActiveTab] = useState('itinerario'); // 'itinerario' | 'gastos' | 'documentos'
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Cargar datos del viaje compartido
  useEffect(() => {
    let isMounted = true;

    async function loadSharedData() {
      setLoading(true);
      setError(null);

      // Opción A: Deserializar snapshot directo desde URL
      if (shareDataRaw) {
        try {
          const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(shareDataRaw))));
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.viaje) {
            if (isMounted) {
              setViaje(parsed.viaje);
              setEventos(parsed.eventos || parsed.itinerario || []);
              setGastos(parsed.gastos || []);
              setDocumentos(parsed.documentos || []);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('[SharedView] Error parseando shareData:', err);
        }
      }

      // Opción B: Cargar desde API o LocalStorage por ID
      if (shareId) {
        // 1. Intentar API
        try {
          const res = await apiRequest(`/viajes/${shareId}`);
          const data = res?.data || res;
          if (data && isMounted) {
            setViaje(data);
            setEventos(data.itinerarios || data.eventos || []);
            setGastos(data.gastos || []);
            setDocumentos(data.documentos || []);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('[SharedView] No se pudo cargar de la API remota, buscando en almacenamiento local:', apiErr.message);
        }

        // 2. Fallback de almacenamiento local (si se abre en el mismo navegador o offline)
        try {
          const directShared = localStorage.getItem(`app_viajes_shared_${shareId}`);
          if (directShared) {
            const parsed = JSON.parse(directShared);
            if (parsed && parsed.viaje && isMounted) {
              setViaje(parsed.viaje);
              setEventos(parsed.eventos || parsed.itinerario || []);
              setGastos(parsed.gastos || []);
              setDocumentos(parsed.documentos || []);
              setLoading(false);
              return;
            }
          }

          const savedViajes = localStorage.getItem('app_viajes_lista');
          if (savedViajes) {
            const list = JSON.parse(savedViajes);
            const found = list.find((v) => v.id === shareId);
            if (found && isMounted) {
              setViaje(found);

              const savedEv = localStorage.getItem(`app_viajes_eventos_${shareId}`);
              if (savedEv) setEventos(JSON.parse(savedEv) || []);

              const savedGastos = localStorage.getItem(`app_viajes_gastos_${shareId}`);
              if (savedGastos) setGastos(JSON.parse(savedGastos) || []);

              const savedDocs = localStorage.getItem(`app_viajes_docs_${shareId}`);
              if (savedDocs) setDocumentos(JSON.parse(savedDocs) || []);

              setLoading(false);
              return;
            }
          }
        } catch (localErr) {
          console.warn('[SharedView] Error leyendo almacenamiento local:', localErr);
        }
      }

      if (isMounted) {
        setError('No se pudo encontrar la bitácora de este viaje o el enlace ha caducado.');
        setLoading(false);
      }
    }

    loadSharedData();

    return () => {
      isMounted = false;
    };
  }, [shareId, shareDataRaw]);

  // Extraer países visitados a partir de los vuelos del viaje
  const visitedCountries = useMemo(() => {
    if (!viaje) return new Map();
    return extractVisitedCountries(eventos, [viaje]);
  }, [viaje, eventos]);

  // Extraer trayectos aéreos para trazarlos en amCharts
  const flightRoutes = useMemo(() => {
    if (!viaje) return [];
    return extractFlightTrajectories(eventos, [viaje]);
  }, [viaje, eventos]);

  // Cálculo de totales financieros y estado
  const { totalGastadoCOP, totalGastadoUSD, diffDays, status } = useMemo(() => {
    if (!viaje) return { totalGastadoCOP: 0, totalGastadoUSD: 0, diffDays: 0, status: null };

    let cop = 0;
    let usd = 0;
    gastos.forEach((g) => {
      if (!g.noComputar) {
        cop += Number(g.montoCOP) || 0;
        usd += Number(g.montoUSD) || 0;
      }
    });

    const start = new Date(viaje.fechaInicio);
    const end = new Date(viaje.fechaFin);
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    const now = new Date();
    let st = { id: 'finalizado', label: 'Finalizado', color: 'text-[#8492A6]', bg: 'bg-[#151B27]', border: 'border-[#1C2436]' };
    if (now >= start && now <= end) {
      st = { id: 'en_curso', label: 'En Curso', color: 'text-[#00FF85]', bg: 'bg-[#00FF85]/10', border: 'border-[#00FF85]' };
    } else if (now < start) {
      st = { id: 'proximo', label: 'Próximo', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]' };
    }

    return {
      totalGastadoCOP: Math.round(cop),
      totalGastadoUSD: Math.round(usd),
      diffDays: days,
      status: st
    };
  }, [viaje, gastos]);

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

  const cleanDestino = cleanCountryText(viaje.destino);
  const tituloViaje = fixAccents(viaje.titulo);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F1F5F9] font-sans flex flex-col w-full max-w-full overflow-x-hidden">
      {/* 1. BARRA SUPERIOR DE CABECERA PÚBLICA */}
      <header className="bg-[#0E121B] border-b border-[#1C2436] px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-40 w-full max-w-full overflow-hidden backdrop-blur-md">
        <div className="max-w-[1700px] w-full mx-auto flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85] shrink-0">
              <Globe2 className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-[#F1F5F9] uppercase truncate">
                  BITÁCORA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30 shrink-0">
                  Viaje Compartido
                </span>
              </div>
              <p className="text-[10px] text-[#8492A6] m-0 truncate">
                Vista pública interactiva en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle size="sm" />

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Compartir este viaje"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            <button
              onClick={onGoToApp || onExit}
              className="px-3 sm:px-4 py-1.5 rounded-lg bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plane className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Crear Mi Bitácora</span>
              <span className="sm:hidden">App</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL FLUIDO */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-[1700px] w-full mx-auto min-w-0 overflow-x-hidden space-y-4 sm:space-y-6">
        {/* HERO CARD DE RESUMEN DEL VIAJE */}
        <div className="relative p-4 sm:p-6 rounded-2xl bg-[#0E121B] border border-[#1C2436] shadow-xl overflow-hidden">
          <WatermarkIcon icon={Globe2} className="w-80 h-80 -bottom-10 -right-10 pointer-events-none" opacity="opacity-[0.03]" color="text-[#00E5FF]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Badges superiores */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${status.bg} ${status.color} ${status.border}`}>
                  {status.label}
                </span>

                {viaje.tipoViaje === 'multidestino' ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                    🗺️ Ruta Multidestino
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                    📍 Destino Único
                  </span>
                )}

                <span className="text-[11px] text-[#8492A6] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B55FE6]" />
                  <span>{diffDays} {diffDays === 1 ? 'Día' : 'Días de aventura'}</span>
                </span>
              </div>

              {/* Título Principal y Destino */}
              <h1 className="text-xl sm:text-3xl font-black text-[#F1F5F9] m-0 tracking-tight leading-tight">
                {tituloViaje}
              </h1>

              {/* Ruta o Destinos */}
              <div className="flex items-center gap-2 mt-2 flex-wrap text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-1.5 bg-[#151B27] px-3 py-1.5 rounded-lg border border-[#1C2436] text-[#CBD5E1]">
                  <MiniFlag country={viaje.destino} className="w-5 h-3.5 shrink-0" />
                  <span className="truncate">{cleanDestino}</span>
                </div>

                {viaje.origen && (
                  <span className="text-xs text-[#8492A6] flex items-center gap-1">
                    <span>Partida desde:</span>
                    <strong className="text-[#00FF85]">{cleanCountryText(viaje.origen)}</strong>
                  </span>
                )}

                {viaje.escalas && (
                  <span className="text-xs text-[#8492A6] flex items-center gap-1">
                    <span>• Escalas:</span>
                    <strong className="text-[#FFE500]">{cleanCountryText(viaje.escalas)}</strong>
                  </span>
                )}
              </div>

              {/* Fechas */}
              <p className="text-xs text-[#8492A6] mt-2 m-0 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>
                  Del {new Date(viaje.fechaInicio).toLocaleDateString()} al {new Date(viaje.fechaFin).toLocaleDateString()}
                </span>
              </p>

              {viaje.descripcion && (
                <p className="text-xs text-[#8492A6] mt-2.5 max-w-3xl leading-relaxed m-0 bg-[#0A0D14]/80 p-2.5 rounded-lg border border-[#1C2436]/50">
                  {fixAccents(viaje.descripcion)}
                </p>
              )}
            </div>

            {/* Tarjeta rápida de Presupuesto del Viaje */}
            <div className="bg-[#0A0D14] border border-[#1C2436] rounded-xl p-3.5 sm:p-4 shrink-0 flex flex-col justify-center min-w-[220px]">
              <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
                Presupuesto Total
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#FFE500] m-0 mt-0.5">
                ${(Number(viaje.presupuestoTotal) || 0).toLocaleString('es-CO')}
                <span className="text-xs font-semibold text-[#8492A6] ml-1">{viaje.monedaBase || 'COP'}</span>
              </p>

              {totalGastadoCOP > 0 && (
                <div className="mt-2 pt-2 border-t border-[#1C2436] flex items-center justify-between text-xs">
                  <span className="text-[#8492A6]">Registrado:</span>
                  <span className="font-bold text-[#00FF85]">
                    ${totalGastadoCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MÉTRICAS CLAVE (GRID 4x) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
              Países Explorados
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#00FF85]">
                {visitedCountries.size}
              </span>
              <span className="text-xs text-[#8492A6]">en el mapa</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm overflow-hidden truncate">
              {Array.from(visitedCountries.values()).map((c) => (
                <span key={c.code} title={c.es}>
                  {c.flag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
              Trayectos Aéreos
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#00E5FF]">
                {flightRoutes.length}
              </span>
              <span className="text-xs text-[#8492A6]">vuelos enlazados</span>
            </div>
            <span className="text-[10px] text-[#00E5FF] mt-1 block">
              {flightRoutes.length === 0 ? 'Sin vuelos registrados' : 'Animación de vuelo activa'}
            </span>
          </div>

          <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
              Eventos & Planes
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#B55FE6]">
                {eventos.length}
              </span>
              <span className="text-xs text-[#8492A6]">actividades</span>
            </div>
            <span className="text-[10px] text-[#8492A6] mt-1 block truncate">
              Itinerario agendado
            </span>
          </div>

          <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
            <span className="text-[10px] uppercase font-bold text-[#8492A6] tracking-wider block">
              Gastos Registrados
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#FFE500]">
                {gastos.length}
              </span>
              <span className="text-xs text-[#8492A6]">compras/servicios</span>
            </div>
            <span className="text-[10px] text-[#FFE500] mt-1 block truncate">
              {gastos.length > 0 ? `≈ $${totalGastadoUSD} USD total` : 'Sin gastos aún'}
            </span>
          </div>
        </div>

        {/* MAPA MUNDI CON amCharts 5 */}
        <section className="relative z-10 w-full max-w-full overflow-hidden">
          <WorldMapAmCharts
            visitedCountries={visitedCountries}
            flightRoutes={flightRoutes}
            onSelectCountry={() => {}}
          />
        </section>

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

          {/* TAB 1: ITINERARIO */}
          {activeTab === 'itinerario' && (
            <div className="space-y-3">
              {eventos.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center">
                  <Calendar className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-[#F1F5F9] m-0">No hay eventos ni vuelos registrados en este viaje aún</p>
                  <p className="text-xs text-[#8492A6] mt-1">El itinerario cronológico se actualizará en cuanto se agreguen actividades.</p>
                </div>
              ) : (
                <div className="relative pl-5 sm:pl-7 border-l-2 border-[#1C2436] ml-2 sm:ml-4 space-y-4">
                  {eventos.map((ev) => {
                    const isVuelo = ev.tipo?.toLowerCase() === 'vuelo';
                    const Icon = EVENT_TYPE_ICONS[ev.tipo?.toLowerCase()] || MapPin;
                    const startDate = new Date(ev.fechaInicio || ev.fecha || Date.now());

                    return (
                      <div key={ev.id || Math.random()} className="relative">
                        {/* Nodo en la línea de tiempo */}
                        <div
                          className="absolute -left-[27px] sm:-left-[35px] top-3.5 w-3.5 h-3.5 rounded-full bg-[#080A0F] border-2 flex items-center justify-center"
                          style={{ borderColor: isVuelo ? '#00E5FF' : '#00FF85' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isVuelo ? '#00E5FF' : '#00FF85' }}
                          />
                        </div>

                        {/* Card del Evento */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF]/40 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00E5FF] shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">
                                    {fixAccents(ev.titulo)}
                                  </h4>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#151B27] text-[#00E5FF] border border-[#1C2436]">
                                    {ev.tipo || 'Actividad'}
                                  </span>
                                </div>

                                <p className="text-xs text-[#8492A6] m-0 mt-0.5 flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-[#8492A6]" />
                                  <span>{startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                              </div>
                            </div>

                            {ev.costo !== undefined && ev.costo > 0 && (
                              <div className="text-left sm:text-right shrink-0">
                                <span className="text-xs font-bold text-[#00FF85]">
                                  {formatCurrencyDisplay(ev.costo, ev.moneda || 'COP', true)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Detalles logísticos para vuelos */}
                          {isVuelo && (ev.ciudadOrigen || ev.ciudadDestino || ev.aeropuertoOrigen || ev.aeropuertoDestino) && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-[#151B27]/60 border border-[#1C2436] flex items-center gap-2 text-xs flex-wrap">
                              <span className="text-[#00FF85] font-semibold">
                                {ev.aeropuertoOrigen || ev.ciudadOrigen || 'Origen'}
                              </span>
                              <span className="text-[#8492A6]">➔</span>
                              {ev.tieneConexion && (
                                <>
                                  <span className="text-[#FFE500] font-semibold">
                                    Escala: {ev.aeropuertoConexion || ev.ciudadConexion || 'Conexión'}
                                  </span>
                                  <span className="text-[#8492A6]">➔</span>
                                </>
                              )}
                              <span className="text-[#00E5FF] font-semibold">
                                {ev.aeropuertoDestino || ev.ciudadDestino || 'Destino'}
                              </span>
                            </div>
                          )}

                          {ev.notas && (
                            <p className="mt-2 text-xs text-[#8492A6] bg-[#0A0D14] p-2 rounded border border-[#1C2436]/40 m-0">
                              {ev.notas}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GASTOS & MONEDAS */}
          {activeTab === 'gastos' && (
            <div className="space-y-3">
              {gastos.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center">
                  <Wallet className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-[#F1F5F9] m-0">No hay gastos reportados en este viaje</p>
                  <p className="text-xs text-[#8492A6] mt-1">Las compras, pagos y reservaciones se mostrarán aquí.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {gastos.map((g) => {
                    const currMeta = CURRENCY_MAP[(g.monedaOriginal || 'COP').toUpperCase()] || {};
                    return (
                      <div
                        key={g.id || Math.random()}
                        className="p-3.5 sm:p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00FF85]/30 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85] shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{g.concepto}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#8492A6]">
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#151B27] border border-[#1C2436]">
                                {g.categoria}
                              </span>
                              <span>•</span>
                              <span>{new Date(g.fechaGasto).toLocaleDateString()}</span>
                              <span className="text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 flex items-center gap-1">
                                <span>{currMeta.flag || '💱'}</span>
                                <span>{g.monedaOriginal}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1C2436]">
                          <p className="text-base font-extrabold text-[#F1F5F9] m-0">
                            {formatCurrencyDisplay(g.montoOriginal, g.monedaOriginal, true)}
                          </p>
                          <p className="text-xs font-semibold text-[#00FF85] m-0 mt-0.5">
                            ≈ $ {Math.round(g.montoCOP || 0).toLocaleString()} COP
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTOS & RESERVAS */}
          {activeTab === 'documentos' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {documentos.map((doc) => (
                  <div
                    key={doc.id || Math.random()}
                    className="p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#B55FE6]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B55FE6]/10 text-[#B55FE6] border border-[#B55FE6]/20">
                        {doc.tipo || 'Archivo'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{doc.titulo}</h4>
                    {doc.notas && <p className="text-xs text-[#8492A6] m-0">{doc.notas}</p>}
                  </div>
                ))}
              </div>
            </div>
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
