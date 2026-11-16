/**
 * Checklist completo predefinido para el viaje "Japón 2.0"
 * (Colombia -> España -> Abu Dabi -> Corea -> Japón -> Corea -> Abu Dabi -> Madrid -> Colombia)
 * y utilidades para parsear e inicializar checklists por viaje.
 */

export const JAPON_2_0_CHECKLIST = [
  {
    id: 'sec-colombia-salida',
    titulo: '🇨🇴 Antes de salir de Colombia',
    etapa: 'Preparación y Salida',
    pais: '🇨🇴 Colombia',
    items: [
      { id: 'item-co-1', texto: 'Pasaporte colombiano vigente.', completado: false },
      { id: 'item-co-2', texto: 'Revisar fecha de vencimiento del pasaporte.', completado: false },
      { id: 'item-co-3', texto: 'Vacuna fiebre amarilla.', completado: false },
      { id: 'item-co-4', texto: 'Certificado Internacional de Vacunación contra Fiebre Amarilla.', completado: false },
      { id: 'item-co-5', texto: 'Seguro médico internacional.', completado: false },
      { id: 'item-co-6', texto: 'Reservas de hoteles.', completado: false },
      { id: 'item-co-7', texto: 'Tiquetes completos.', completado: false },
      { id: 'item-co-8', texto: 'Prueba de fondos/medios económicos.', completado: false },
      { id: 'item-co-9', texto: 'Copias digitales de pasaporte y reservas.', completado: false }
    ]
  },
  {
    id: 'sec-espana-dic',
    titulo: '🇪🇸 España — diciembre',
    etapa: 'Tramo 1 • Europa',
    pais: '🇪🇸 España',
    items: [
      { id: 'item-es-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-es-2', texto: 'ETIAS — comprobar apertura y solicitarlo antes del viaje si ya está operativo.', completado: false, importante: true },
      { id: 'item-es-3', texto: 'Reserva de hotel.', completado: false },
      { id: 'item-es-4', texto: 'Billete España → Corea.', completado: false },
      { id: 'item-es-5', texto: 'Seguro.', completado: false },
      { id: 'item-es-6', texto: 'Comprobar que no excedas 90/180 días Schengen.', completado: false }
    ]
  },
  {
    id: 'sec-abudabi-escala',
    titulo: '🇦🇪 Abu Dabi — escala 2 h',
    etapa: 'Conexión Internacional',
    pais: '🇦🇪 Emiratos Árabes Unidos',
    items: [
      { id: 'item-ae-esc-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-ae-esc-2', texto: 'Billete de continuación.', completado: false },
      { id: 'item-ae-esc-3', texto: 'No salir del área de tránsito.', completado: false },
      { id: 'item-ae-esc-4', texto: 'No visa previa para la escala.', completado: false },
      { id: 'item-ae-esc-5', texto: 'Certificado de fiebre amarilla recomendado como parte de la documentación general.', completado: false }
    ]
  },
  {
    id: 'sec-corea-dic',
    titulo: '🇰🇷 Corea — diciembre',
    etapa: 'Tramo 2 • Asia',
    pais: '🇰🇷 Corea del Sur',
    items: [
      { id: 'item-kr-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-kr-2', texto: 'Sin visa turística.', completado: false },
      { id: 'item-kr-3', texto: 'K-ETA: exenta durante 2026 según la medida vigente.', completado: false },
      { id: 'item-kr-4', texto: 'Arrival Card si corresponde / sin K-ETA.', completado: false },
      { id: 'item-kr-5', texto: 'Reserva de hotel.', completado: false },
      { id: 'item-kr-6', texto: 'Billete Corea → Japón.', completado: false }
    ]
  },
  {
    id: 'sec-japon-dic-ene',
    titulo: '🇯🇵 Japón — diciembre/enero',
    etapa: 'Tramo 3 • Asia',
    pais: '🇯🇵 Japón',
    items: [
      { id: 'item-jp-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-jp-2', texto: 'Sin visa turística para estancia corta.', completado: false },
      { id: 'item-jp-3', texto: 'Visit Japan Web.', completado: false, importante: true },
      { id: 'item-jp-4', texto: 'Reserva/alojamiento.', completado: false },
      { id: 'item-jp-5', texto: 'Billete Japón → Corea.', completado: false },
      { id: 'item-jp-6', texto: 'Seguro médico.', completado: false },
      { id: 'item-jp-7', texto: 'Declaración aduanera.', completado: false }
    ]
  },
  {
    id: 'sec-corea-ene-2027',
    titulo: '🇰🇷 Corea — 9 enero 2027',
    etapa: 'Tramo 4 • Regreso desde Japón',
    pais: '🇰🇷 Corea del Sur',
    items: [
      { id: 'item-kr2-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-kr2-2', texto: 'Sin visa turística.', completado: false },
      { id: 'item-kr2-3', texto: '⚠️ Confirmar K-ETA para 2027.', completado: false, importante: true },
      { id: 'item-kr2-4', texto: 'Reserva hotel.', completado: false },
      { id: 'item-kr2-5', texto: 'Billete Corea → Abu Dabi.', completado: false }
    ]
  },
  {
    id: 'sec-abudabi-2dias',
    titulo: '🇦🇪 Abu Dabi — 2 días',
    etapa: 'Tramo 5 • Stopover Emiratos',
    pais: '🇦🇪 Emiratos Árabes Unidos',
    items: [
      { id: 'item-ae2-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-ae2-2', texto: 'No visa previa para colombianos por turismo.', completado: false },
      { id: 'item-ae2-3', texto: 'Reserva de hotel.', completado: false },
      { id: 'item-ae2-4', texto: 'Billete Abu Dabi → Madrid.', completado: false },
      { id: 'item-ae2-5', texto: 'Certificado de fiebre amarilla.', completado: false },
      { id: 'item-ae2-6', texto: 'Seguro médico.', completado: false }
    ]
  },
  {
    id: 'sec-madrid-colombia',
    titulo: '🇪🇸 Madrid → 🇨🇴 Colombia',
    etapa: 'Tramo Final • Regreso a Casa',
    pais: '🇪🇸 España / 🇨🇴 Colombia',
    items: [
      { id: 'item-ret-1', texto: 'Pasaporte.', completado: false },
      { id: 'item-ret-2', texto: 'Billete de regreso a Colombia.', completado: false }
    ]
  }
];

export function isJapon2Viaje(viaje) {
  if (!viaje) return false;
  if (viaje.id === '5ca03ae6-5712-4851-8864-73f60d114fb1') return true;
  const titulo = (viaje.titulo || '').toLowerCase();
  const destino = (viaje.destino || '').toLowerCase();
  return (
    titulo.includes('japón 2.0') ||
    titulo.includes('japon 2.0') ||
    (destino.includes('corea') && destino.includes('jap') && (destino.includes('emiratos') || destino.includes('abu')))
  );
}

export function getDefaultChecklistForViaje(viaje) {
  if (!viaje) return [];
  if (Array.isArray(viaje.checklist) && viaje.checklist.length > 0) {
    return viaje.checklist;
  }
  if (isJapon2Viaje(viaje)) {
    return JSON.parse(JSON.stringify(JAPON_2_0_CHECKLIST));
  }
  return [];
}

export function getChecklistStats(checklist = []) {
  const sections = Array.isArray(checklist) ? checklist : [];
  let totalItems = 0;
  let completedItems = 0;

  sections.forEach((sec) => {
    const items = Array.isArray(sec.items) ? sec.items : [];
    totalItems += items.length;
    completedItems += items.filter((i) => Boolean(i.completado)).length;
  });

  const pendingItems = Math.max(0, totalItems - completedItems);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    totalSections: sections.length,
    totalItems,
    completedItems,
    pendingItems,
    progressPercent
  };
}

/**
 * Parsea texto libre con encabezados (con banderas o títulos) e ítems
 * para convertirlo automáticamente en secciones de checklist.
 */
export function parseRawTextToChecklist(rawText = '') {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sections = [];
  let currentSection = null;

  const flagRegex = /^([\u{1F1E6}-\u{1F1FF}]{2}|#[#\s]*| etapa |tramo )/iu;

  lines.forEach((line, idx) => {
    const startsWithFlag = /^[\u{1F1E6}-\u{1F1FF}]{2}/u.test(line);
    const isHeaderLike =
      startsWithFlag ||
      (!line.endsWith('.') &&
        (line.includes('—') || line.includes('->') || line.includes('→') || line.startsWith('Antes de')));

    if (isHeaderLike && !line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*') && !line.startsWith('⚠️')) {
      currentSection = {
        id: `sec-import-${Date.now()}-${idx}`,
        titulo: line.replace(/^[-•*#]+\s*/, ''),
        etapa: `Etapa ${sections.length + 1}`,
        items: []
      };
      sections.push(currentSection);
    } else {
      if (!currentSection) {
        currentSection = {
          id: `sec-import-${Date.now()}-0`,
          titulo: '📋 General / Preparativos',
          etapa: 'General',
          items: []
        };
        sections.push(currentSection);
      }
      const cleanItemText = line.replace(/^[-•*☐☑✓✔]+\s*/, '').trim();
      if (cleanItemText) {
        currentSection.items.push({
          id: `item-import-${Date.now()}-${idx}`,
          texto: cleanItemText,
          completado: false,
          importante: cleanItemText.includes('⚠️') || cleanItemText.toLowerCase().includes('etias')
        });
      }
    }
  });

  return sections.filter((s) => s.items.length > 0 || s.titulo);
}

