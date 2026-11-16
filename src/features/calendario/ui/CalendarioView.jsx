import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plane,
  Building,
  Camera,
  Utensils,
  ShoppingBag,
  ShieldCheck,
  Tag,
  Wallet,
  Clock,
  MapPin,
  CreditCard,
  Users,
  Plus,
  Edit2,
  Search,
  Columns,
  Grid3X3,
  Compass,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import MiniFlag from '../../../components/MiniFlag';
import Modal from '../../../components/Modal';
import { cleanCountryText } from '../../../utils/countries';
import { formatCurrencyDisplay } from '../../../utils/currencies';
import { buildChronologicalMasterList } from '../../reportes/use-cases/cronogramaReportUtils';

const WEEKDAYS_MON = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function toLocalDateKey(input) {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDateKey(key) {
  if (!key || typeof key !== 'string') return null;
  const parts = key.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getMondayOfWeek(dateObj) {
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const day = d.getDay(); // 0=Dom .. 6=Sab
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatCompactCOP(amount) {
  const n = Math.round(Number(amount) || 0);
  if (n <= 0) return '';
  if (n >= 1000000) {
    return `$${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 1000) {
    return `$${Math.round(n / 1000)}k`;
  }
  return `$${n}`;
}

function getItemVisualStyle(item) {
  const tipo = (item.tipo || item.categoria || '').toLowerCase();
  if (tipo === 'vuelo') {
    return {
      Icon: Plane,
      pillClass: 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]',
      dotColor: '#00E5FF',
      badgeLabel: 'Vuelo'
    };
  }
  if (tipo === 'hotel' || tipo === 'alojamiento') {
    return {
      Icon: Building,
      pillClass: 'bg-[#FFE500]/15 border-[#FFE500]/40 text-[#FFE500]',
      dotColor: '#FFE500',
      badgeLabel: 'Alojamiento'
    };
  }
  if (tipo === 'atraccion' || tipo === 'actividades' || tipo === 'tour') {
    return {
      Icon: Camera,
      pillClass: 'bg-[#B55FE6]/15 border-[#B55FE6]/40 text-[#B55FE6]',
      dotColor: '#B55FE6',
      badgeLabel: 'Actividad'
    };
  }
  if (tipo === 'impuestos' || tipo === 'permisos') {
    return {
      Icon: ShieldCheck,
      pillClass: 'bg-[#FF9F43]/15 border-[#FF9F43]/40 text-[#FF9F43]',
      dotColor: '#FF9F43',
      badgeLabel: 'Permiso'
    };
  }
  if (tipo === 'comida') {
    return {
      Icon: Utensils,
      pillClass: 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]',
      dotColor: '#00FF85',
      badgeLabel: 'Comida'
    };
  }
  if (tipo === 'compras') {
    return {
      Icon: ShoppingBag,
      pillClass: 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]',
      dotColor: '#00FF85',
      badgeLabel: 'Compras'
    };
  }
  if (item.sourceType === 'gasto_billetera') {
    return {
      Icon: Wallet,
      pillClass: 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]',
      dotColor: '#00FF85',
      badgeLabel: 'Gasto'
    };
  }
  return {
    Icon: Tag,
    pillClass: 'bg-[#151B27] border-[#2B3750] text-[#CBD5E1]',
    dotColor: '#94A3B8',
    badgeLabel: 'Evento'
  };
}

export function CalendarioView({
  viaje,
  eventos = [],
  gastos = [],
  onOpenNuevoViaje,
  onAddEvento,
  onEditEvento,
  onAddGasto,
  onEditGasto
}) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilter = categoryFilter !== 'todas' || Boolean(searchText.trim());

  // Inicializar mes y día seleccionado al inicio del viaje (o fecha actual)
  const initialFocusDate = useMemo(() => {
    if (viaje?.fechaInicio) {
      const d = new Date(viaje.fechaInicio);
      if (!isNaN(d.getTime())) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, [viaje?.id, viaje?.fechaInicio]);

  const [cursorDate, setCursorDate] = useState(initialFocusDate);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toLocalDateKey(initialFocusDate));
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const handleOpenDayDetail = (key) => {
    setSelectedDateKey(key);
    setIsDayModalOpen(true);
  };

  useEffect(() => {
    setCursorDate(initialFocusDate);
    setSelectedDateKey(toLocalDateKey(initialFocusDate));
  }, [initialFocusDate]);

  // Rango del viaje en local date keys
  const tripRange = useMemo(() => {
    if (!viaje?.fechaInicio || !viaje?.fechaFin) return { start: null, end: null, startKey: null, endKey: null };
    const s = new Date(viaje.fechaInicio);
    const e = new Date(viaje.fechaFin);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return { start: null, end: null, startKey: null, endKey: null };
    const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    return {
      start,
      end,
      startKey: toLocalDateKey(start),
      endKey: toLocalDateKey(end)
    };
  }, [viaje?.fechaInicio, viaje?.fechaFin]);

  // Construir eventos unificados desde la fuente única de verdad
  const masterItems = useMemo(() => {
    if (!viaje) return [];
    return buildChronologicalMasterList({ viaje, eventos, gastos });
  }, [viaje, eventos, gastos]);

  // Filtrar items según selector de categoría y búsqueda
  const filteredMasterItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return masterItems.filter((it) => {
      const tipo = (it.tipo || it.categoria || '').toLowerCase();
      if (categoryFilter !== 'todas') {
        if (categoryFilter === 'vuelo' && tipo !== 'vuelo' && tipo !== 'transporte') return false;
        if (categoryFilter === 'hotel' && tipo !== 'hotel' && tipo !== 'alojamiento') return false;
        if (categoryFilter === 'actividades' && tipo !== 'atraccion' && tipo !== 'actividades' && tipo !== 'tour') return false;
        if (categoryFilter === 'comida_compras' && tipo !== 'comida' && tipo !== 'compras' && tipo !== 'otros') return false;
        if (categoryFilter === 'impuestos' && tipo !== 'impuestos' && tipo !== 'permisos') return false;
        if (categoryFilter === 'billetera' && it.sourceType !== 'gasto_billetera') return false;
      }
      if (q) {
        const haystack = `${it.titulo || ''} ${it.cityName || ''} ${it.countryName || ''} ${it.lugarDetalle || ''} ${it.notas || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [masterItems, categoryFilter, searchText]);

  // Agrupar items por dateKey local (incluyendo badge de Check-out para alojamientos multi-día)
  const itemsByDateKey = useMemo(() => {
    const map = new Map();
    const pushToDay = (key, entry) => {
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    };

    filteredMasterItems.forEach((it) => {
      const startKey = toLocalDateKey(it.fechaInicio) || (it.dateKey !== 'sin-fecha' ? it.dateKey : null);
      if (!startKey) return;

      pushToDay(startKey, { ...it, isCheckoutMarker: false });

      // Si es hotel / alojamiento con fechaFin en otro día, agregar marcador de Check-out ese día
      const tipoLower = (it.tipo || it.categoria || '').toLowerCase();
      if ((tipoLower === 'hotel' || tipoLower === 'alojamiento') && it.fechaFin) {
        const endKey = toLocalDateKey(it.fechaFin);
        if (endKey && endKey !== startKey) {
          pushToDay(endKey, {
            ...it,
            id: `${it.id}-checkout`,
            isCheckoutMarker: true,
            titulo: `Check-out: ${it.titulo}`,
            horaDisplay: new Date(it.fechaFin).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          });
        }
      }
    });

    // Ordenar cronológicamente dentro de cada día
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      map.set(k, list);
    }

    return map;
  }, [filteredMasterItems]);

  // Meses relevantes para navegación rápida (meses con viaje o registros)
  const quickMonths = useMemo(() => {
    const monthsMap = new Map();
    const registerMonth = (d) => {
      if (!d || isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          key,
          year: d.getFullYear(),
          month: d.getMonth(),
          label: `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
        });
      }
    };

    if (tripRange.start) registerMonth(tripRange.start);
    if (tripRange.end) registerMonth(tripRange.end);
    masterItems.forEach((it) => {
      if (it.fechaInicio) registerMonth(new Date(it.fechaInicio));
    });

    return Array.from(monthsMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [tripRange, masterItems]);

  // Calcular las 42 celdas (6 semanas x 7 días) de la grilla mensual
  const monthGridDays = useMemo(() => {
    const year = cursorDate.getFullYear();
    const month = cursorDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = getMondayOfWeek(firstOfMonth);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const key = toLocalDateKey(d);
      const inCurrentMonth = d.getMonth() === month;

      let tripDayNum = null;
      if (tripRange.start && tripRange.end && d >= tripRange.start && d <= tripRange.end) {
        tripDayNum = Math.round((d - tripRange.start) / (1000 * 60 * 60 * 24)) + 1;
      }

      days.push({
        date: d,
        key,
        dayNum: d.getDate(),
        inCurrentMonth,
        tripDayNum,
        items: itemsByDateKey.get(key) || []
      });
    }
    return days;
  }, [cursorDate, tripRange, itemsByDateKey]);

  // Calcular los 7 días de la semana actual (para Vista Semanal)
  const weekGridDays = useMemo(() => {
    const base = parseLocalDateKey(selectedDateKey) || cursorDate;
    const monday = getMondayOfWeek(base);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = toLocalDateKey(d);
      let tripDayNum = null;
      if (tripRange.start && tripRange.end && d >= tripRange.start && d <= tripRange.end) {
        tripDayNum = Math.round((d - tripRange.start) / (1000 * 60 * 60 * 24)) + 1;
      }
      days.push({
        date: d,
        key,
        dayNum: d.getDate(),
        weekdayName: WEEKDAYS_MON[i],
        monthShort: MONTH_SHORT[d.getMonth()],
        tripDayNum,
        items: itemsByDateKey.get(key) || []
      });
    }
    return days;
  }, [selectedDateKey, cursorDate, tripRange, itemsByDateKey]);

  const todayKey = toLocalDateKey(new Date());

  // Información del día seleccionado para el panel lateral
  const selectedDayInfo = useMemo(() => {
    const d = parseLocalDateKey(selectedDateKey) || cursorDate;
    const items = itemsByDateKey.get(selectedDateKey) || [];
    let tripDayLabel = 'Fuera de fechas del viaje';
    if (tripRange.start && tripRange.end) {
      if (d < tripRange.start) {
        const diff = Math.round((tripRange.start - d) / (1000 * 60 * 60 * 24));
        tripDayLabel = `Pre-Viaje (${diff} ${diff === 1 ? 'día' : 'días'} antes)`;
      } else if (d > tripRange.end) {
        const diff = Math.round((d - tripRange.end) / (1000 * 60 * 60 * 24));
        tripDayLabel = `Post-Viaje (+${diff}d)`;
      } else {
        const dayNum = Math.round((d - tripRange.start) / (1000 * 60 * 60 * 24)) + 1;
        tripDayLabel = `Día ${dayNum} del Viaje`;
      }
    }

    const totalDiaCOP = items.reduce(
      (acc, it) => acc + (!it.isCheckoutMarker ? Number(it.montoTotalCOP || 0) : 0),
      0
    );

    const formattedDate = d.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      date: d,
      formattedDate: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1),
      tripDayLabel,
      items,
      totalDiaCOP
    };
  }, [selectedDateKey, cursorDate, itemsByDateKey, tripRange]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCursorDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      const base = parseLocalDateKey(selectedDateKey) || cursorDate;
      const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() - 7);
      setSelectedDateKey(toLocalDateKey(next));
      setCursorDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCursorDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      const base = parseLocalDateKey(selectedDateKey) || cursorDate;
      const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 7);
      setSelectedDateKey(toLocalDateKey(next));
      setCursorDate(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const handleGoToTripStart = () => {
    setCursorDate(initialFocusDate);
    setSelectedDateKey(toLocalDateKey(initialFocusDate));
  };

  const handleGoToToday = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setCursorDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(toLocalDateKey(today));
  };

  if (!viaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={CalendarDays} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#00E5FF] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">Calendario del Viaje</h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <CalendarDays className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">No hay viajes seleccionados</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Crea o selecciona un viaje para visualizar sus vuelos, alojamientos, actividades y gastos en la cuadrícula del calendario.
          </p>
          {onOpenNuevoViaje && (
            <button
              type="button"
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Primer Viaje
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 w-full max-w-full overflow-hidden">
      <WatermarkIcon icon={CalendarDays} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#00E5FF]" />

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
            <h2 className="text-base sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0 truncate">
              Calendario del Viaje
            </h2>
            {viaje?.destino && (
              <span className="hidden sm:inline-block text-xs font-semibold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-md truncate max-w-xs">
                {cleanCountryText(viaje.destino)}
              </span>
            )}
          </div>

          {/* Switch Mes / Semana compacto en móvil */}
          <div className="inline-flex sm:hidden rounded-lg bg-[#0E121B] border border-[#1C2436] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-[#00E5FF] text-[#080A0F]' : 'text-[#8492A6]'
              }`}
            >
              Mes
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                viewMode === 'week' ? 'bg-[#00E5FF] text-[#080A0F]' : 'text-[#8492A6]'
              }`}
            >
              Sem
            </button>
          </div>
        </div>

        {/* Acciones rápidas + Switch Vista Mes / Semana (Desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="hidden sm:inline-flex rounded-lg bg-[#0E121B] border border-[#1C2436] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'month' ? 'bg-[#00E5FF] text-[#080A0F]' : 'text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'week' ? 'bg-[#00E5FF] text-[#080A0F]' : 'text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>
          </div>

          {onAddEvento && (
            <button
              type="button"
              onClick={onAddEvento}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#00FF85] text-[#080A0F] font-bold text-[11px] sm:text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Actividad</span>
            </button>
          )}
          {onAddGasto && (
            <button
              type="button"
              onClick={onAddGasto}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FFE500] text-[#FFE500] font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Gasto</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra Compacta de Navegación + Botón de Filtros Colapsable */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-3 relative z-10 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 sm:p-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#F1F5F9] transition-colors cursor-pointer"
                title={viewMode === 'month' ? 'Mes anterior' : 'Semana anterior'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 sm:p-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#F1F5F9] transition-colors cursor-pointer"
                title={viewMode === 'month' ? 'Mes siguiente' : 'Semana siguiente'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm sm:text-lg font-extrabold text-[#F1F5F9] m-0 px-0.5 sm:px-1">
              {viewMode === 'month'
                ? `${MONTH_NAMES[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
                : `${weekGridDays[0]?.dayNum} ${weekGridDays[0]?.monthShort} – ${weekGridDays[6]?.dayNum} ${weekGridDays[6]?.monthShort}`}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleGoToTripStart}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-[#00E5FF]/20 transition-colors cursor-pointer flex items-center gap-1"
              title="Ir al primer día del viaje"
            >
              <Compass className="w-3 h-3" />
              <span>Inicio</span>
            </button>

            <button
              type="button"
              onClick={handleGoToToday}
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                showFilters || hasActiveFilter
                  ? 'bg-[#FFE500]/15 border-[#FFE500]/40 text-[#FFE500]'
                  : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Filtros</span>
              {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />}
            </button>
          </div>
        </div>

        {/* Panel Colapsable de Filtros, Búsqueda y Saltos de Mes */}
        {showFilters && (
          <div className="pt-2.5 border-t border-[#1C2436] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar actividad, vuelo, ciudad..."
                  className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#8492A6] focus:outline-none"
                />
              </div>

              {quickMonths.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6]">
                    Meses:
                  </span>
                  {quickMonths.map((qm) => {
                    const isCurrent =
                      cursorDate.getFullYear() === qm.year && cursorDate.getMonth() === qm.month;
                    return (
                      <button
                        key={qm.key}
                        type="button"
                        onClick={() => setCursorDate(new Date(qm.year, qm.month, 1))}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer border ${
                          isCurrent
                            ? 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]'
                            : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9]'
                        }`}
                      >
                        {qm.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'todas', label: 'Todo' },
                { id: 'vuelo', label: 'Vuelos' },
                { id: 'hotel', label: 'Hospedaje' },
                { id: 'actividades', label: 'Actividades' },
                { id: 'comida_compras', label: 'Comida / Compras' },
                { id: 'impuestos', label: 'Permisos' },
                { id: 'billetera', label: 'Billetera' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    categoryFilter === f.id
                      ? 'bg-[#00E5FF] text-[#080A0F] border-[#00E5FF]'
                      : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grilla Principal del Calendario (Ancho completo tipo Google / Microsoft Calendar) */}
      <div className="relative z-10">
        <div className="rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          {viewMode === 'month' ? (
            <>
              {/* Cabecera Días de la Semana */}
              <div className="grid grid-cols-7 border-b border-[#1C2436] bg-[#151B27]">
                {WEEKDAYS_MON.map((day) => (
                  <div
                    key={day}
                    className="py-2 px-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#8492A6]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Celdas 6x7 del Mes */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#1C2436]">
                {monthGridDays.map((cell) => {
                  const isSelected = cell.key === selectedDateKey;
                  const isToday = cell.key === todayKey;
                  const isTripDay = cell.tripDayNum !== null;
                  const visibleItems = cell.items.slice(0, 3);
                  const hiddenCount = Math.max(0, cell.items.length - visibleItems.length);
                  const dayTotalCOP = cell.items.reduce(
                    (sum, it) => sum + (!it.isCheckoutMarker ? Number(it.montoTotalCOP || 0) : 0),
                    0
                  );

                  return (
                    <div
                      key={cell.key}
                      onClick={() => handleOpenDayDetail(cell.key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenDayDetail(cell.key);
                        }
                      }}
                      className={`min-h-[76px] sm:min-h-[130px] p-1 sm:p-2 flex flex-col justify-between transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#00E5FF]/10 ring-2 ring-inset ring-[#00E5FF]'
                          : isTripDay
                          ? 'bg-[#00FF85]/[0.03] hover:bg-[#151B27]'
                          : cell.inCurrentMonth
                          ? 'bg-[#0E121B] hover:bg-[#151B27]/70'
                          : 'bg-[#0B0E15] opacity-55 hover:opacity-85'
                      }`}
                    >
                      {/* Fila superior: Número de día + Badge Día X del viaje */}
                      <div>
                        <div className="flex items-center justify-between gap-0.5 mb-1">
                          <span
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0 ${
                              isToday
                                ? 'bg-[#00E5FF] text-[#080A0F]'
                                : isSelected
                                ? 'bg-[#F1F5F9] text-[#080A0F]'
                                : cell.inCurrentMonth
                                ? 'text-[#F1F5F9]'
                                : 'text-[#8492A6]'
                            }`}
                          >
                            {cell.dayNum}
                          </span>

                          {isTripDay && (
                            <>
                              <span className="sm:hidden text-[8px] font-extrabold text-[#00FF85] leading-none">
                                D{cell.tripDayNum}
                              </span>
                              <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30 truncate">
                                Día {cell.tripDayNum}
                              </span>
                            </>
                          )}
                        </div>

                        {/* MÓVIL: Íconos limpios por tipo (sin texto truncado) */}
                        {cell.items.length > 0 && (
                          <div className="flex sm:hidden flex-wrap items-center gap-0.5 mt-0.5">
                            {cell.items.slice(0, 4).map((it) => {
                              const style = getItemVisualStyle(it);
                              const PillIcon = it.isCheckoutMarker ? LogOut : style.Icon;
                              return (
                                <span
                                  key={it.id}
                                  className={`w-4 h-4 rounded flex items-center justify-center border ${style.pillClass}`}
                                >
                                  <PillIcon className="w-2.5 h-2.5" />
                                </span>
                              );
                            })}
                            {cell.items.length > 4 && (
                              <span className="text-[8px] font-bold text-[#00E5FF] leading-none ml-0.5">
                                +{cell.items.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* DESKTOP: Pills completos estilo Google Calendar */}
                        <div className="hidden sm:block space-y-1">
                          {visibleItems.map((it) => {
                            const style = getItemVisualStyle(it);
                            const PillIcon = it.isCheckoutMarker ? LogOut : style.Icon;
                            return (
                              <div
                                key={it.id}
                                title={`${it.horaDisplay ? it.horaDisplay + ' • ' : ''}${it.titulo}`}
                                className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 truncate ${style.pillClass}`}
                              >
                                <PillIcon className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">
                                  {it.horaDisplay && it.horaDisplay !== 'En el día' && it.horaDisplay !== '--:--'
                                    ? `${it.horaDisplay.split(' ')[0]} `
                                    : ''}
                                  {it.titulo}
                                </span>
                              </div>
                            );
                          })}

                          {hiddenCount > 0 && (
                            <div className="text-[10px] font-bold text-[#00E5FF] px-1">
                              +{hiddenCount} más
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total gastado en el día (compacto en móvil, completo en desktop) */}
                      {dayTotalCOP > 0 && (
                        <div className="pt-0.5 mt-1 border-t border-[#1C2436]/50 text-[8px] sm:text-[9px] font-mono font-bold text-[#8492A6] text-right">
                          <span className="sm:hidden">{formatCompactCOP(dayTotalCOP)}</span>
                          <span className="hidden sm:inline">$ {Math.round(dayTotalCOP).toLocaleString('es-CO')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* VISTA SEMANAL: 7 Columnas lado a lado */
            <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-[#1C2436]">
              {weekGridDays.map((day) => {
                const isSelected = day.key === selectedDateKey;
                const isToday = day.key === todayKey;
                const dayTotalCOP = day.items.reduce(
                  (sum, it) => sum + (!it.isCheckoutMarker ? Number(it.montoTotalCOP || 0) : 0),
                  0
                );

                return (
                  <div
                    key={day.key}
                    onClick={() => handleOpenDayDetail(day.key)}
                    className={`min-h-[280px] flex flex-col justify-between p-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#00E5FF]/10'
                        : day.tripDayNum
                        ? 'bg-[#00FF85]/[0.03] hover:bg-[#151B27]'
                        : 'bg-[#0E121B] hover:bg-[#151B27]/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#1C2436] pb-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
                            {day.weekdayName}
                          </span>
                          <span
                            className={`text-sm font-extrabold ${
                              isToday ? 'text-[#00E5FF]' : 'text-[#F1F5F9]'
                            }`}
                          >
                            {day.dayNum} {day.monthShort}
                          </span>
                        </div>
                        {day.tripDayNum && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/30">
                            Día {day.tripDayNum}
                          </span>
                        )}
                      </div>

                      {day.items.length === 0 ? (
                        <p className="text-[10px] text-[#8492A6]/60 italic m-0 py-4 text-center">
                          Sin registros
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {day.items.map((it) => {
                            const style = getItemVisualStyle(it);
                            const ItemIcon = it.isCheckoutMarker ? LogOut : style.Icon;
                            return (
                              <div
                                key={it.id}
                                className={`p-2 rounded-lg border text-[11px] space-y-1 ${style.pillClass}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="flex items-center gap-1 font-bold truncate">
                                    <ItemIcon className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{it.titulo}</span>
                                  </span>
                                </div>
                                <div className="text-[10px] opacity-85 flex items-center justify-between gap-1 font-mono">
                                  <span>{it.horaDisplay}</span>
                                  {!it.isCheckoutMarker && it.montoTotalCOP > 0 && (
                                    <span>$ {Math.round(it.montoTotalCOP).toLocaleString('es-CO')}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {dayTotalCOP > 0 && (
                      <div className="pt-2 mt-2 border-t border-[#1C2436] text-[10px] font-mono font-bold text-[#00FF85] text-right">
                        Total: $ {Math.round(dayTotalCOP).toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle del Día Seleccionado */}
      <Modal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        title={`Detalle del Día: ${selectedDayInfo.formattedDate}`}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-between gap-2.5 flex-wrap w-full">
            <div className="flex items-center gap-2">
              {onAddEvento && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDayModalOpen(false);
                    onAddEvento();
                  }}
                  className="px-3 py-2 rounded-lg bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Actividad</span>
                </button>
              )}
              {onAddGasto && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDayModalOpen(false);
                    onAddGasto();
                  }}
                  className="px-3 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FFE500] text-[#FFE500] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Gasto</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsDayModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#151B27] hover:bg-[#1E2738] border border-[#1C2436] text-[#F1F5F9] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ml-auto"
            >
              Cerrar
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                {selectedDayInfo.tripDayLabel}
              </span>
              <span className="text-xs text-[#8492A6]">
                <strong className="text-[#F1F5F9]">{selectedDayInfo.items.length}</strong>{' '}
                {selectedDayInfo.items.length === 1 ? 'registro en el día' : 'registros en el día'}
              </span>
            </div>
            {selectedDayInfo.totalDiaCOP > 0 && (
              <div className="text-xs font-mono">
                <span className="text-[#8492A6]">Total del día: </span>
                <strong className="text-[#00FF85] text-sm">
                  $ {Math.round(selectedDayInfo.totalDiaCOP).toLocaleString('es-CO')} COP
                </strong>
              </div>
            )}
          </div>

          {selectedDayInfo.items.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#151B27]/50 border border-dashed border-[#1C2436] text-center space-y-2.5">
              <CalendarDays className="w-10 h-10 text-[#8492A6] mx-auto opacity-40" />
              <p className="text-sm font-semibold text-[#F1F5F9] m-0">
                No hay actividades ni gastos para este día
              </p>
              <p className="text-xs text-[#8492A6] m-0">
                Usa los botones inferiores para registrar una actividad o un gasto en este viaje.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
              {selectedDayInfo.items.map((it) => {
                const style = getItemVisualStyle(it);
                const ItemIcon = it.isCheckoutMarker ? LogOut : style.Icon;
                const canEdit = !it.isCheckoutMarker && (
                  (it.rawEvento && onEditEvento) || (it.rawGasto && onEditGasto)
                );

                return (
                  <div
                    key={it.id}
                    className="p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF]/50 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${style.pillClass}`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${style.pillClass}`}>
                              {it.isCheckoutMarker ? 'Check-out' : style.badgeLabel}
                            </span>
                            {it.noComputar && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/30 text-[#FF2E55]">
                                Fuera de Ppto
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 mt-1 break-words">
                            {it.titulo}
                          </h4>
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDayModalOpen(false);
                            if (it.rawEvento && onEditEvento) onEditEvento(it.rawEvento);
                            else if (it.rawGasto && onEditGasto) onEditGasto(it.rawGasto);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                          title="Editar registro"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      )}
                    </div>

                    {/* Metadatos: Hora, Duración, Ciudad/País, Lugar */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8492A6]">
                      <span className="inline-flex items-center gap-1 font-mono text-[#00E5FF]">
                        <Clock className="w-3 h-3" />
                        {it.horaDisplay}
                        {it.duracionDisplay && it.duracionDisplay !== '-' && !it.isCheckoutMarker
                          ? ` (${it.duracionDisplay})`
                          : ''}
                      </span>

                      {(it.cityName && it.cityName !== '-') || it.countryName ? (
                        <span className="inline-flex items-center gap-1">
                          <MiniFlag country={it.countryName} code={it.countryCode} className="w-3.5 h-2.5" />
                          <span>
                            {it.cityName && it.cityName !== '-'
                              ? `${it.cityName}, ${it.countryName}`
                              : it.countryName}
                          </span>
                        </span>
                      ) : null}

                      {it.lugarDetalle && it.lugarDetalle !== '-' && (
                        <span className="inline-flex items-center gap-1 truncate max-w-full">
                          <MapPin className="w-3 h-3 shrink-0 text-[#00FF85]" />
                          <span className="truncate">{it.lugarDetalle}</span>
                        </span>
                      )}
                    </div>

                    {/* Costo y Medio de Pago */}
                    {!it.isCheckoutMarker && it.montoTotalCOP > 0 && (
                      <div className="pt-2 border-t border-[#1C2436] flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8492A6]">
                            <Users className="w-3 h-3" />
                            {it.cantidadPersonas}p
                          </span>
                          {it.tarjetaCredito && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
                              <CreditCard className="w-2.5 h-2.5" />
                              {it.tarjetaCredito}
                            </span>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-[#00FF85]">
                            $ {Math.round(it.montoTotalCOP).toLocaleString('es-CO')} COP
                          </span>
                          {it.monedaOriginal && it.monedaOriginal !== 'COP' && it.montoOriginalTotal > 0 && (
                            <span className="block text-[10px] text-[#8492A6]">
                              {formatCurrencyDisplay(it.montoOriginalTotal, it.monedaOriginal, false)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {it.notas && !it.isCheckoutMarker && (
                      <p className="text-[11px] text-[#8492A6] m-0 italic bg-[#0E121B] px-2.5 py-1.5 rounded-lg border border-[#1C2436]/60">
                        {it.notas}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default CalendarioView;

