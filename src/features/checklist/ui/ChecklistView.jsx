import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  AlertTriangle,
  Sparkles,
  FileText,
  CheckCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';
import WatermarkIcon from '../../../components/WatermarkIcon';
import Modal from '../../../components/Modal';
import MiniFlag from '../../../components/MiniFlag';
import { cleanCountryText, fixAccents } from '../../../utils/countries';
import {
  JAPON_2_0_CHECKLIST,
  getDefaultChecklistForViaje,
  getChecklistStats,
  parseRawTextToChecklist,
  isJapon2Viaje
} from '../../../utils/checklistDefault';

export function ChecklistView({ activeViaje, onUpdateViaje, onOpenNuevoViaje }) {
  const [sections, setSections] = useState(() => getDefaultChecklistForViaje(activeViaje));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('todos'); // todos | pendientes | completados | importantes
  const [selectedSectionId, setSelectedSectionId] = useState('todas');
  const [collapsedSections, setCollapsedSections] = useState({});

  // Estados de edición inline de etapas e ítems
  const [newItemInputs, setNewItemInputs] = useState({});
  const [editingItem, setEditingItem] = useState(null); // { sectionId, itemId, texto }
  const [editingSection, setEditingSection] = useState(null); // { sectionId, titulo, etapa }

  // Modal para agregar nueva etapa
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionEtapa, setNewSectionEtapa] = useState('');

  // Modal para importar checklist desde texto
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const [importReplaceMode, setImportReplaceMode] = useState(false);

  // Sincronizar cuando cambie el viaje activo
  useEffect(() => {
    const resolved = getDefaultChecklistForViaje(activeViaje);
    setSections(resolved);
    setSelectedSectionId('todas');
    // Si es Japón 2.0 y el viaje aún no tenía el checklist persistido en su objeto, guardarlo silenciosamente
    if (
      activeViaje?.id &&
      (!Array.isArray(activeViaje.checklist) || activeViaje.checklist.length === 0) &&
      resolved.length > 0 &&
      onUpdateViaje
    ) {
      onUpdateViaje(activeViaje.id, { checklist: resolved }, { silent: true });
    }
  }, [activeViaje?.id]);

  // Actualizar si llegan cambios externos del mismo viaje
  useEffect(() => {
    if (Array.isArray(activeViaje?.checklist) && activeViaje.checklist.length > 0) {
      setSections(activeViaje.checklist);
    }
  }, [activeViaje?.checklist]);

  const persistChecklist = (nextSections, notifyMessage = null) => {
    setSections(nextSections);
    if (activeViaje?.id && onUpdateViaje) {
      onUpdateViaje(activeViaje.id, { checklist: nextSections }, { silent: true });
    }
    if (notifyMessage) {
      toast.success(notifyMessage);
    }
  };

  const stats = useMemo(() => getChecklistStats(sections), [sections]);

  const importantCount = useMemo(() => {
    let count = 0;
    sections.forEach((sec) => {
      (sec.items || []).forEach((it) => {
        if (it.importante || String(it.texto || '').includes('⚠️')) count += 1;
      });
    });
    return count;
  }, [sections]);

  // Alternar estado completado de un ítem
  const handleToggleItem = (sectionId, itemId) => {
    const next = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        items: (sec.items || []).map((it) =>
          it.id === itemId ? { ...it, completado: !it.completado } : it
        )
      };
    });
    persistChecklist(next);
  };

  // Alternar marca de importante (⚠️)
  const handleToggleImportant = (sectionId, itemId) => {
    const next = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        items: (sec.items || []).map((it) =>
          it.id === itemId ? { ...it, importante: !it.importante } : it
        )
      };
    });
    persistChecklist(next);
  };

  // Agregar ítem a una sección
  const handleAddItem = (sectionId) => {
    const raw = (newItemInputs[sectionId] || '').trim();
    if (!raw) return;

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      texto: raw,
      completado: false,
      importante: raw.includes('⚠️')
    };

    const next = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        items: [...(sec.items || []), newItem]
      };
    });

    setNewItemInputs((prev) => ({ ...prev, [sectionId]: '' }));
    persistChecklist(next, 'Requisito agregado al checklist');
  };

  // Guardar edición de un ítem
  const handleSaveEditItem = () => {
    if (!editingItem || !editingItem.texto.trim()) return;
    const next = sections.map((sec) => {
      if (sec.id !== editingItem.sectionId) return sec;
      return {
        ...sec,
        items: (sec.items || []).map((it) =>
          it.id === editingItem.itemId
            ? { ...it, texto: editingItem.texto.trim() }
            : it
        )
      };
    });
    setEditingItem(null);
    persistChecklist(next, 'Requisito actualizado');
  };

  // Eliminar un ítem
  const handleDeleteItem = (sectionId, itemId) => {
    const next = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        items: (sec.items || []).filter((it) => it.id !== itemId)
      };
    });
    persistChecklist(next, 'Requisito eliminado');
  };

  // Marcar o desmarcar todos los ítems de una etapa
  const handleToggleAllInSection = (sectionId, markCompleted) => {
    const next = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        items: (sec.items || []).map((it) => ({ ...it, completado: markCompleted }))
      };
    });
    persistChecklist(
      next,
      markCompleted ? 'Etapa marcada como completada' : 'Etapa reiniciada'
    );
  };

  // Guardar edición de título de etapa
  const handleSaveEditSection = () => {
    if (!editingSection || !editingSection.titulo.trim()) return;
    const next = sections.map((sec) =>
      sec.id === editingSection.sectionId
        ? {
            ...sec,
            titulo: editingSection.titulo.trim(),
            etapa: editingSection.etapa?.trim() || sec.etapa
          }
        : sec
    );
    setEditingSection(null);
    persistChecklist(next, 'Etapa actualizada');
  };

  // Eliminar etapa completa
  const handleDeleteSection = (sectionId) => {
    const next = sections.filter((sec) => sec.id !== sectionId);
    if (selectedSectionId === sectionId) setSelectedSectionId('todas');
    persistChecklist(next, 'Etapa eliminada del checklist');
  };

  // Crear nueva etapa
  const handleCreateSection = (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    const nueva = {
      id: `sec-${Date.now()}`,
      titulo: newSectionTitle.trim(),
      etapa: newSectionEtapa.trim() || `Etapa ${sections.length + 1}`,
      items: []
    };
    const next = [...sections, nueva];
    setNewSectionTitle('');
    setNewSectionEtapa('');
    setIsAddSectionOpen(false);
    persistChecklist(next, 'Nueva etapa agregada al checklist');
  };

  // Importar desde texto libre
  const handleImportText = (e) => {
    e.preventDefault();
    const parsed = parseRawTextToChecklist(rawImportText);
    if (parsed.length === 0) {
      toast.error('Escribe o pega al menos una línea para importar.');
      return;
    }
    const next = importReplaceMode ? parsed : [...sections, ...parsed];
    setRawImportText('');
    setIsImportModalOpen(false);
    persistChecklist(
      next,
      `Se importaron ${parsed.length} ${parsed.length === 1 ? 'etapa' : 'etapas'} al checklist`
    );
  };

  // Cargar / Restaurar checklist de Japón 2.0
  const handleLoadJaponTemplate = () => {
    const copy = JSON.parse(JSON.stringify(JAPON_2_0_CHECKLIST));
    persistChecklist(copy, 'Checklist completo cargado exitosamente');
  };

  // Filtrado de secciones e ítems
  const filteredSections = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return sections
      .filter((sec) => selectedSectionId === 'todas' || sec.id === selectedSectionId)
      .map((sec) => {
        const sectionTitleMatch =
          !q ||
          (sec.titulo || '').toLowerCase().includes(q) ||
          (sec.etapa || '').toLowerCase().includes(q);

        const filteredItems = (sec.items || []).filter((item) => {
          const isImp = Boolean(item.importante) || String(item.texto || '').includes('⚠️');
          if (filterMode === 'pendientes' && item.completado) return false;
          if (filterMode === 'completados' && !item.completado) return false;
          if (filterMode === 'importantes' && !isImp) return false;

          if (!q) return true;
          if (sectionTitleMatch) return true;
          return (item.texto || '').toLowerCase().includes(q);
        });

        return {
          ...sec,
          filteredItems,
          totalSectionItems: (sec.items || []).length,
          completedSectionItems: (sec.items || []).filter((i) => i.completado).length
        };
      })
      .filter((sec) => {
        if (!q && filterMode === 'todos') return true;
        return sec.filteredItems.length > 0;
      });
  }, [sections, selectedSectionId, filterMode, searchTerm]);

  if (!activeViaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={CheckSquare} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#B55FE6]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#B55FE6] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">Checklist de Viaje</h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <CheckSquare className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">Selecciona o crea un viaje</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Cada viaje tiene su propio checklist personalizado por país, escala y documentos obligatorios.
          </p>
          {onOpenNuevoViaje && (
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Viaje
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 space-y-5 w-full max-w-full overflow-hidden">
      <WatermarkIcon icon={CheckSquare} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#B55FE6]" />

      {/* 1. CABECERA PRINCIPAL Y ACCIONES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B55FE6] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Checklist de Viaje
            </h2>
            <span className="text-xs font-bold text-[#B55FE6] bg-[#B55FE6]/10 border border-[#B55FE6]/30 px-2.5 py-0.5 rounded-md">
              {fixAccents(activeViaje.titulo)}
            </span>
          </div>
          <p className="text-xs text-[#8492A6] m-0">
            Control práctico de documentos, visados, escalas, vacunas y reservas para cada tramo de la ruta.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddSectionOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#00FF85] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Nueva Etapa / País</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            title="Pegar un listado en texto para convertirlo en checklist"
          >
            <FileText className="w-4 h-4" />
            <span>Pegar / Importar Lista</span>
          </button>

          {(sections.length === 0 || isJapon2Viaje(activeViaje)) && (
            <button
              type="button"
              onClick={handleLoadJaponTemplate}
              className="px-3 py-2 rounded-xl bg-[#151B27] border border-[#B55FE6]/40 hover:border-[#B55FE6] text-[#B55FE6] hover:bg-[#B55FE6]/10 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              title="Cargar o restablecer el checklist completo de la ruta Colombia -> España -> Abu Dabi -> Corea -> Japón"
            >
              <Sparkles className="w-4 h-4" />
              <span>{sections.length === 0 ? 'Cargar Checklist Ruta' : 'Restaurar Original'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TARJETA DE PROGRESO GENERAL Y KPIS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-[#1C2436] relative z-10 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Progreso Total
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#00FF85] font-mono">
                {stats.progressPercent}%
              </span>
              <span className="text-xs text-[#8492A6]">
                ({stats.completedItems}/{stats.totalItems})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Etapas / Destinos
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#00E5FF] font-mono block mt-1">
              {stats.totalSections}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Pendientes por Listo
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#FFE500] font-mono block mt-1">
              {stats.pendingItems}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Puntos Críticos (⚠️)
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#B55FE6] font-mono block mt-1">
              {importantCount}
            </span>
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#CBD5E1] font-semibold">
              Estado de preparación para <strong className="text-[#00E5FF]">{cleanCountryText(activeViaje.destino)}</strong>
            </span>
            <span className="font-mono font-bold text-[#00FF85]">
              {stats.completedItems} completados • {stats.pendingItems} pendientes
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#151B27] overflow-hidden border border-[#1C2436]">
            <div
              className="h-full bg-gradient-to-r from-[#00E5FF] via-[#00FF85] to-[#B55FE6] transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. BARRA DE BÚSQUEDA, FILTROS DE ESTADO Y NAVEGACIÓN POR ETAPAS */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#0E121B] border border-[#1C2436] relative z-10 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8492A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar documento, requisito, país o vacuna (ej. Pasaporte, K-ETA, Fiebre amarilla)..."
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl pl-10 pr-8 py-2 text-xs text-[#F1F5F9] focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botones de filtro */}
          <div className="flex items-center gap-1 bg-[#151B27] p-1 rounded-xl border border-[#1C2436] overflow-x-auto">
            {[
              { id: 'todos', label: `Todos (${stats.totalItems})` },
              { id: 'pendientes', label: `Pendientes (${stats.pendingItems})` },
              { id: 'completados', label: `Listos (${stats.completedItems})` },
              { id: 'importantes', label: `⚠️ Críticos (${importantCount})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  filterMode === f.id
                    ? 'bg-[#0E121B] text-[#00FF85] border border-[#00FF85]/40'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Píldoras de Etapas / Países */}
        {sections.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#1C2436]/70">
            <button
              type="button"
              onClick={() => setSelectedSectionId('todas')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                selectedSectionId === 'todas'
                  ? 'bg-[#B55FE6]/20 text-[#B55FE6] border border-[#B55FE6]/50'
                  : 'bg-[#151B27] text-[#8492A6] border border-[#1C2436] hover:text-[#F1F5F9]'
              }`}
            >
              Todas las Etapas ({sections.length})
            </button>
            {sections.map((sec) => {
              const done = (sec.items || []).filter((i) => i.completado).length;
              const tot = (sec.items || []).length;
              const isAllDone = tot > 0 && done === tot;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() =>
                    setSelectedSectionId(selectedSectionId === sec.id ? 'todas' : sec.id)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedSectionId === sec.id
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50'
                      : isAllDone
                      ? 'bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30'
                      : 'bg-[#151B27] text-[#CBD5E1] border border-[#1C2436] hover:border-[#2B3750]'
                  }`}
                >
                  <MiniFlag country={sec.pais || sec.titulo} className="w-3.5 h-2.5 shrink-0" />
                  <span>{cleanCountryText(sec.titulo)}</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({done}/{tot})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. LISTADO DE ETAPAS DEL CHECKLIST */}
      {filteredSections.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <CheckSquare className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
          <p className="text-sm font-bold text-[#F1F5F9] m-0">
            {sections.length === 0
              ? 'Este viaje aún no tiene etapas en su checklist'
              : 'No hay requisitos que coincidan con el filtro actual'}
          </p>
          <p className="text-xs text-[#8492A6] mt-1 m-0">
            {sections.length === 0
              ? 'Agrega una nueva etapa por país o pega tu lista completa en texto.'
              : 'Prueba cambiando el filtro a "Todos" o limpiando la búsqueda.'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {sections.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  + Crear Primera Etapa
                </button>
                <button
                  type="button"
                  onClick={handleLoadJaponTemplate}
                  className="px-3.5 py-2 rounded-xl bg-[#151B27] border border-[#B55FE6]/40 text-[#B55FE6] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cargar Plantilla Ruta Completa
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFilterMode('todos');
                  setSearchTerm('');
                  setSelectedSectionId('todas');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#FFE500] text-[#080A0F] font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Ver Todos los Requisitos
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
          {filteredSections.map((sec, secIndex) => {
            const isCollapsed = Boolean(collapsedSections[sec.id]);
            const pct =
              sec.totalSectionItems > 0
                ? Math.round((sec.completedSectionItems / sec.totalSectionItems) * 100)
                : 0;
            const isAllCompleted =
              sec.totalSectionItems > 0 && sec.completedSectionItems === sec.totalSectionItems;

            return (
              <div
                key={sec.id}
                className={`rounded-2xl bg-[#0E121B] border transition-all flex flex-col justify-between overflow-hidden ${
                  isAllCompleted
                    ? 'border-[#00FF85]/40 shadow-[0_0_20px_rgba(0,255,133,0.04)]'
                    : 'border-[#1C2436]'
                }`}
              >
                <div>
                  {/* Cabecera de la Etapa */}
                  <div className="p-4 bg-[#151B27] border-b border-[#1C2436]">
                    {editingSection?.sectionId === sec.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingSection.titulo}
                          onChange={(e) =>
                            setEditingSection((prev) => ({ ...prev, titulo: e.target.value }))
                          }
                          placeholder="Título de la etapa (ej. 🇯🇵 Japón — diciembre/enero)"
                          className="w-full bg-[#0E121B] border border-[#00E5FF] rounded-lg px-3 py-1.5 text-xs font-bold text-[#F1F5F9] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingSection.etapa || ''}
                            onChange={(e) =>
                              setEditingSection((prev) => ({ ...prev, etapa: e.target.value }))
                            }
                            placeholder="Subtítulo o tramo (opcional)"
                            className="flex-1 bg-[#0E121B] border border-[#1C2436] rounded-lg px-3 py-1 text-xs text-[#CBD5E1] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditSection}
                            className="px-2.5 py-1 rounded-lg bg-[#00FF85] text-[#080A0F] font-bold text-xs cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSection(null)}
                            className="p-1 rounded-lg bg-[#151B27] text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#151B27] border border-[#1C2436] flex items-center justify-center shrink-0 mt-0.5">
                            <MiniFlag
                              country={sec.pais || sec.titulo}
                              className="w-5 h-3.5"
                              fallbackIcon={<Flag className="w-4 h-4 text-[#00E5FF]" />}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#151B27] border border-[#1C2436] text-[#00E5FF]">
                                {sec.etapa || `Etapa ${secIndex + 1}`}
                              </span>
                              {isAllCompleted && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#00FF85]/15 border border-[#00FF85]/40 text-[#00FF85]">
                                  ✓ Completado
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm sm:text-base font-extrabold text-[#F1F5F9] m-0 mt-1 leading-snug">
                              {sec.titulo}
                            </h3>
                          </div>
                        </div>

                        {/* Acciones de etapa */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleAllInSection(sec.id, !isAllCompleted)}
                            title={
                              isAllCompleted
                                ? 'Desmarcar todos los requisitos de esta etapa'
                                : 'Marcar todos los requisitos de esta etapa como listos'
                            }
                            className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer"
                          >
                            {isAllCompleted ? (
                              <RotateCcw className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingSection({
                                sectionId: sec.id,
                                titulo: sec.titulo,
                                etapa: sec.etapa || ''
                              })
                            }
                            title="Editar nombre de etapa"
                            className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#8492A6] hover:text-[#00E5FF] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec.id)}
                            title="Eliminar esta etapa"
                            className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsedSections((prev) => ({
                                ...prev,
                                [sec.id]: !prev[sec.id]
                              }))
                            }
                            title={isCollapsed ? 'Expandir etapa' : 'Contraer etapa'}
                            className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer"
                          >
                            {isCollapsed ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronUp className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Barra de progreso de la etapa */}
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 rounded-full bg-[#080A0F] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isAllCompleted ? 'bg-[#00FF85]' : 'bg-[#00E5FF]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#CBD5E1] shrink-0">
                        {sec.completedSectionItems}/{sec.totalSectionItems} ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Lista de ítems de la etapa */}
                  {!isCollapsed && (
                    <div className="divide-y divide-[#1C2436]/60">
                      {sec.filteredItems.map((item) => {
                        const isImp =
                          Boolean(item.importante) || String(item.texto || '').includes('⚠️');
                        const isEditingThis =
                          editingItem?.sectionId === sec.id && editingItem?.itemId === item.id;

                        if (isEditingThis) {
                          return (
                            <div key={item.id} className="p-3 bg-[#151B27]/80 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingItem.texto}
                                onChange={(e) =>
                                  setEditingItem((prev) => ({ ...prev, texto: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditItem();
                                  if (e.key === 'Escape') setEditingItem(null);
                                }}
                                autoFocus
                                className="flex-1 bg-[#0E121B] border border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleSaveEditItem}
                                className="p-1.5 rounded-lg bg-[#00FF85] text-[#080A0F] cursor-pointer"
                                title="Guardar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="p-1.5 rounded-lg bg-[#0E121B] text-[#8492A6] cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={item.id}
                            className={`px-3.5 py-2.5 flex items-start justify-between gap-2.5 transition-colors group ${
                              item.completado
                                ? 'bg-[#151B27]/40'
                                : isImp
                                ? 'bg-[#FFE500]/[0.06] hover:bg-[#FFE500]/[0.12]'
                                : 'hover:bg-[#151B27]/60'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleItem(sec.id, item.id)}
                              className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer bg-transparent border-0 p-0"
                            >
                              <span className="mt-0.5 shrink-0">
                                {item.completado ? (
                                  <CheckSquare className="w-4 h-4 text-[#00FF85]" strokeWidth={2.5} />
                                ) : (
                                  <Square
                                    className={`w-4 h-4 ${
                                      isImp
                                        ? 'text-[#FFE500]'
                                        : 'text-[#8492A6] group-hover:text-[#00E5FF]'
                                    }`}
                                  />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span
                                  className={`text-xs sm:text-[13px] leading-relaxed block break-words ${
                                    item.completado
                                      ? 'line-through text-[#8492A6]'
                                      : isImp
                                      ? 'font-bold text-[#FFE500]'
                                      : 'font-medium text-[#F1F5F9]'
                                  }`}
                                >
                                  {item.texto}
                                </span>
                                {isImp && !item.completado && (
                                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#FFE500]/15 border border-[#FFE500]/40 text-[#FFE500]">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Verificar con atención
                                  </span>
                                )}
                              </div>
                            </button>

                            {/* Botones de acción por ítem */}
                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleImportant(sec.id, item.id)}
                                title={
                                  isImp
                                    ? 'Quitar marca de punto crítico'
                                    : 'Marcar como punto crítico / importante (⚠️)'
                                }
                                className={`p-1 rounded hover:bg-[#1C2436] cursor-pointer ${
                                  isImp ? 'text-[#FFE500]' : 'text-[#8492A6] hover:text-[#FFE500]'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingItem({
                                    sectionId: sec.id,
                                    itemId: item.id,
                                    texto: item.texto
                                  })
                                }
                                title="Editar requisito"
                                className="p-1 rounded text-[#8492A6] hover:text-[#00E5FF] hover:bg-[#1C2436] cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(sec.id, item.id)}
                                title="Eliminar requisito"
                                className="p-1 rounded text-[#8492A6] hover:text-[#FF2E55] hover:bg-[#1C2436] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Input rápido para agregar nuevo ítem a esta etapa */}
                {!isCollapsed && (
                  <div className="p-3 bg-[#151B27] border-t border-[#1C2436] flex items-center gap-2">
                    <input
                      type="text"
                      value={newItemInputs[sec.id] || ''}
                      onChange={(e) =>
                        setNewItemInputs((prev) => ({ ...prev, [sec.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(sec.id);
                        }
                      }}
                      placeholder="Agregar requisito a esta etapa..."
                      className="flex-1 bg-[#0E121B] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-1.5 text-xs text-[#F1F5F9] focus:outline-none placeholder-[#8492A6]/60"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem(sec.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#151B27] hover:bg-[#00FF85] text-[#00FF85] hover:text-[#080A0F] border border-[#00FF85]/30 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Agregar Nueva Etapa / País */}
      <Modal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        title="Nueva Etapa / País del Checklist"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSection} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
              Título de la Etapa o País *
            </label>
            <input
              type="text"
              required
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Ej: 🇯🇵 Japón — diciembre/enero o 🧳 Equipaje de Mano"
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
              Subtítulo / Tramo (Opcional)
            </label>
            <input
              type="text"
              value={newSectionEtapa}
              onChange={(e) => setNewSectionEtapa(e.target.value)}
              placeholder="Ej: Tramo 3 • Asia / Escala 2 h"
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddSectionOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#151B27] border border-[#1C2436] text-xs font-bold text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00FF85] text-[#080A0F] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Crear Etapa
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Pegar / Importar Checklist desde Texto */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Pegar / Importar Checklist en Formato Práctico"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleImportText} className="space-y-4">
          <p className="text-xs text-[#8492A6] m-0">
            Pega cualquier listado con encabezados por país/etapa (ej. <code className="text-[#00E5FF]">🇨🇴 Antes de salir de Colombia</code>) seguido de sus requisitos en cada línea. Se creará automáticamente cada bloque interactivo.
          </p>

          <textarea
            rows={10}
            value={rawImportText}
            onChange={(e) => setRawImportText(e.target.value)}
            placeholder={`🇨🇴 Antes de salir de Colombia\nPasaporte colombiano vigente.\nVacuna fiebre amarilla.\n\n🇪🇸 España — diciembre\nPasaporte.\nETIAS...`}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-xl p-3.5 text-xs text-[#F1F5F9] font-mono focus:outline-none"
          />

          <label className="flex items-center gap-2 text-xs text-[#CBD5E1] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={importReplaceMode}
              onChange={(e) => setImportReplaceMode(e.target.checked)}
              className="rounded border-[#1C2436] bg-[#151B27] text-[#00FF85]"
            />
            <span>Reemplazar el checklist actual por el texto importado (si no se marca, se agregará al final)</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#151B27] border border-[#1C2436] text-xs font-bold text-[#8492A6] hover:text-[#F1F5F9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#080A0F] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Importar Checklist
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ChecklistView;

