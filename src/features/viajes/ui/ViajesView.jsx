import React, { useState, useMemo } from 'react';
import {
  Globe2,
  Plus,
  Calendar,
  DollarSign,
  ArrowRight,
  Edit2,
  Trash2,
  Plane,
  Search,
  MapPin,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import WorldMapAmCharts from '../../../components/WorldMapAmCharts';
import WatermarkIcon from '../../../components/WatermarkIcon';
import MiniFlag from '../../../components/MiniFlag';
import { extractVisitedCountries, getCountryFlag, cleanCountryText } from '../../../utils/countries';
import { extractFlightTrajectories } from '../../../utils/geoCoordinates';

export function ViajesView({
  viajes = [],
  activeViajeId,
  eventos = [],
  onSelectViaje,
  onOpenNuevoViaje,
  onEditViaje,
  onDeleteViaje,
  onOpenBitacora
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'en_curso' | 'proximos' | 'finalizados'
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

  // Compilar todos los eventos de todos los viajes registrados
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

  // Extraer mapa de países visitados EXCLUSIVAMENTE a partir de los VUELOS registrados
  // REGLA: La configuración inicial del viaje NO se registra en el mapa; se consideran
  // los destinos de vuelos y escalas mayores a 24 horas (Stopovers).
  const visitedCountries = useMemo(() => {
    return extractVisitedCountries(allEventsList, viajes);
  }, [allEventsList, viajes]);

  // Extraer trayectos de vuelos (origen -> escalas -> destino) para pintar las líneas y marcadores
  const flightRoutes = useMemo(() => {
    return extractFlightTrajectories(allEventsList, viajes);
  }, [allEventsList, viajes]);

  // Calcular estado de cada viaje (en curso, próximo, finalizado)
  const getViajeStatus = (viaje) => {
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

  // Filtrado de viajes por búsqueda y estado
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

  // Métricas globales para los cards de resumen
  const totalPresupuesto = useMemo(() => {
    return viajes.reduce((acc, v) => acc + (Number(v.presupuestoTotal) || 0), 0);
  }, [viajes]);

  return (
    <div className="space-y-8 relative pb-16">
      {/* Marcas de agua sólidas de fondo */}
      <WatermarkIcon icon={Globe2} className="w-[500px] h-[500px] -top-20 -right-20" opacity="opacity-[0.02]" color="text-[#00E5FF]" />
      <WatermarkIcon icon={Compass} className="w-[450px] h-[450px] top-[600px] -left-20" opacity="opacity-[0.02]" color="text-[#00FF85]" />

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight m-0">
              Mis Bitácoras y Mapa Mundi
            </h1>
          </div>
          <p className="text-xs text-[#8492A6] mt-1 m-0">
            Explora tus destinos en el mapa interactivo y gestiona todas tus rutas de viaje
          </p>
        </div>

        <button
          onClick={onOpenNuevoViaje}
          className="self-start sm:self-auto px-3.5 py-2 bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo Viaje
        </button>
      </div>

      {/* Tarjetas de Estadísticas / Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 relative z-10">
        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-3 sm:p-4">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
            Total Bitácoras
          </p>
          <p className="text-xl sm:text-2xl font-black text-[#F1F5F9] mt-0.5 sm:mt-1 m-0">
            {viajes.length}
          </p>
          <span className="text-[10px] text-[#00E5FF] mt-0.5 inline-block">
            {viajes.length === 1 ? '1 viaje registrado' : `${viajes.length} viajes registrados`}
          </span>
        </div>

        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
            Países en el Mapa
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-[#00FF85] m-0">
              {visitedCountries.size}
            </p>
            <span className="text-xs text-[#8492A6]">/ 195</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm overflow-hidden truncate">
            {Array.from(visitedCountries.values()).map((c) => (
              <span key={c.code} title={c.es}>
                {c.flag}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
            Presupuesto Global
          </p>
          <p className="text-xl font-black text-[#FFE500] mt-1 m-0 truncate">
            ${totalPresupuesto.toLocaleString('es-CO')}
          </p>
          <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
            Moneda Base: COP
          </span>
        </div>

        <div className="bg-[#0E121B] border border-[#1C2436] rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8492A6] m-0">
            Cobertura Global
          </p>
          <p className="text-2xl font-black text-[#B55FE6] mt-1 m-0">
            {((visitedCountries.size / 195) * 100).toFixed(1)}%
          </p>
          <span className="text-[10px] text-[#8492A6] mt-0.5 inline-block">
            Mundo explorado
          </span>
        </div>
      </div>

      {/* SECCIÓN 1: MAPA MUNDI CON amCharts 5 */}
      <section className="relative z-10">
        <WorldMapAmCharts
          visitedCountries={visitedCountries}
          selectedCountryCode={selectedCountryCode}
          flightRoutes={flightRoutes}
          onSelectCountry={(code, info) => {
            setSelectedCountryCode(code);
            if (info && info.viajes && info.viajes[0]) {
              onSelectViaje(info.viajes[0].id);
            }
          }}
        />
      </section>

      {/* SECCIÓN 2: LISTADO / CARDS DE VIAJES */}
      <section className="space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9] m-0 uppercase tracking-wide flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#00E5FF]" />
              Listado de Viajes Realizados ({filteredViajes.length})
            </h2>
            <p className="text-xs text-[#8492A6] mt-0.5 m-0">
              Selecciona una tarjeta para ingresar a su itinerario, gastos y bóveda
            </p>
          </div>

          {/* Filtros de estado */}
          <div className="flex rounded-lg bg-[#0E121B] p-1 border border-[#1C2436] self-start sm:self-auto overflow-x-auto max-w-full">
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

        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por destino, país o nombre de viaje..."
            className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F1F5F9] focus:outline-none"
          />
        </div>

        {/* Grid de Cards de Viaje */}
        {filteredViajes.length === 0 ? (
          <div className="bg-[#0E121B] border border-dashed border-[#1C2436] rounded-2xl p-12 text-center">
            <Globe2 className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#F1F5F9] m-0">No se encontraron viajes</h3>
            <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No hay bitácoras que coincidan con los criterios de búsqueda.'
                : 'Crea tu primera bitácora de viaje para empezar a pintar el mapa del mundo.'}
            </p>
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Primer Viaje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredViajes.map((viaje) => {
              const status = getViajeStatus(viaje);
              const flag = getCountryFlag(viaje.destino);
              const isActive = activeViajeId === viaje.id;

              // Calcular duración en días
              const startDate = new Date(viaje.fechaInicio);
              const endDate = new Date(viaje.fechaFin);
              const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={viaje.id}
                  className={`bg-[#0E121B] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-[#00E5FF] group relative ${
                    isActive ? 'border-[#00FF85] shadow-lg shadow-[#00FF85]/5' : 'border-[#1C2436]'
                  }`}
                >
                  {/* Encabezado del Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <div className="w-8 h-6 bg-[#151B27] border border-[#1C2436] rounded flex items-center justify-center overflow-hidden shrink-0">
                          <MiniFlag country={viaje.destino} className="w-6 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#CBD5E1] bg-[#151B27] px-2.5 py-1 rounded-full border border-[#1C2436] truncate max-w-[160px]">
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
                      {viaje.titulo}
                    </h3>
                    {viaje.descripcion && (
                      <p className="text-xs text-[#8492A6] mt-1 line-clamp-2 m-0">
                        {viaje.descripcion}
                      </p>
                    )}

                    {/* Metadatos (Origen, Escalas, Fechas, Duración y Presupuesto) */}
                    <div className="mt-4 pt-4 border-t border-[#1C2436] space-y-2 text-xs">
                      {viaje.origen && (
                        <div className="flex items-center justify-between text-[#8492A6]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
                            Origen
                          </span>
                          <span className="text-[#F1F5F9] font-medium truncate max-w-[180px]">
                            {cleanCountryText(viaje.origen)}
                          </span>
                        </div>
                      )}

                      {viaje.escalas && (
                        <div className="flex items-center justify-between text-[#8492A6]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                            Escalas
                          </span>
                          <span className="text-[#FFE500] font-medium truncate max-w-[180px]">
                            {cleanCountryText(viaje.escalas)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[#8492A6]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                          Fechas
                        </span>
                        <span className="text-[#F1F5F9] font-medium">
                          {new Date(viaje.fechaInicio).toLocaleDateString()} - {new Date(viaje.fechaFin).toLocaleDateString()}
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

                      {/* Estado de Vuelos Registrados en el Itinerario */}
                      <div className="pt-2 border-t border-[#1C2436]/60 flex items-center justify-between">
                        <span className="text-[11px] text-[#8492A6] flex items-center gap-1">
                          <Plane className="w-3 h-3 text-[#00E5FF]" />
                          Vuelos en Bitácora:
                        </span>
                        {(() => {
                          const tripFlights = allEventsList.filter(
                            e => e.viajeId === viaje.id && ((e.tipo || '').toLowerCase() === 'vuelo' || e.ciudadDestino)
                          );
                          return tripFlights.length > 0 ? (
                            <span className="text-[11px] font-bold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded border border-[#00FF85]/20">
                              {tripFlights.length} {tripFlights.length === 1 ? 'vuelo registrado' : 'vuelos registrados'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8492A6] italic bg-[#151B27] px-2 py-0.5 rounded border border-[#1C2436]">
                              Sin vuelos aún (no en mapa)
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción (Abrir, Editar, Eliminar) */}
                  <div className="mt-5 pt-4 border-t border-[#1C2436] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditViaje(viaje);
                        }}
                        title="Editar información del viaje"
                        className="px-2.5 py-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteViaje(viaje);
                        }}
                        title="Eliminar bitácora de viaje"
                        className="px-2.5 py-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenBitacora(viaje.id)}
                      className={`px-3.5 py-2 font-bold text-xs uppercase tracking-wider rounded-lg transition-opacity flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#00FF85] text-[#080A0F] hover:opacity-90'
                          : 'bg-[#151B27] text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/10'
                      }`}
                    >
                      <span>Abrir</span>
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
