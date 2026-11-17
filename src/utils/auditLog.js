import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AUDIT_STORAGE_KEY = 'app_viajes_audit_log_v1';
const MAX_AUDIT_ENTRIES = 2000;

export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAuditEvent({
  modulo = 'general',
  accion = 'crear',
  titulo = '',
  detalle = '',
  usuario = null,
  viajeId = null,
  viajeTitulo = null,
  montoCOP = null,
  montoOriginal = null,
  monedaOriginal = null,
  fechaReferencia = null
}) {
  try {
    const current = getAuditLogs();
    const entry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      modulo,
      accion,
      titulo: titulo || `${modulo} - ${accion}`,
      detalle: detalle || '',
      usuarioNombre: usuario?.nombre || 'Usuario',
      usuarioEmail: usuario?.email || '',
      viajeId: viajeId || null,
      viajeTitulo: viajeTitulo || null,
      montoCOP: montoCOP !== null && montoCOP !== undefined ? Math.round(Number(montoCOP) || 0) : null,
      montoOriginal: montoOriginal !== null && montoOriginal !== undefined ? Number(montoOriginal) || 0 : null,
      monedaOriginal: monedaOriginal || null,
      fechaReferencia: fechaReferencia || null
    };
    const next = [entry, ...current].slice(0, MAX_AUDIT_ENTRIES);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(next));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-viajes-audit-updated'));
    }
    return entry;
  } catch {
    return null;
  }
}

export function clearAuditLogs() {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-viajes-audit-updated'));
    }
  } catch {}
}

export function formatAuditDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function exportAuditLogsPdf(logs = [], filterSummary = '') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(14, 18, 27);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setTextColor(0, 229, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('HISTORIAL DE AUDITORIA Y MOVIMIENTOS DE LA APP', 14, 11);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const subtitle = `Generado: ${new Date().toLocaleString('es-CO')}  •  Registros: ${logs.length}${
    filterSummary ? `  •  Filtros: ${filterSummary}` : ''
  }`;
  doc.text(subtitle, 14, 18);

  const body = logs.map((l) => [
    formatAuditDateTime(l.timestamp),
    (l.modulo || '').toUpperCase(),
    (l.accion || '').toUpperCase(),
    l.titulo || '-',
    l.detalle || '-',
    l.viajeTitulo || '-',
    l.fechaReferencia ? String(l.fechaReferencia).split('T')[0] : '-',
    l.montoCOP !== null ? `$ ${Math.round(l.montoCOP).toLocaleString('es-CO')} COP` : '-',
    l.usuarioEmail || l.usuarioNombre || '-'
  ]);

  autoTable(doc, {
    startY: 28,
    head: [[
      'Fecha / Hora Registro',
      'Módulo',
      'Acción',
      'Movimiento',
      'Detalle',
      'Viaje',
      'Fecha Compra / Ref.',
      'Valor (COP)',
      'Usuario'
    ]],
    body,
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [21, 27, 39], textColor: [0, 255, 133], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`Historial_Auditoria_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportAuditLogsExcel(logs = [], filterSummary = '') {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Historial Auditoria');

  ws.addRow(['HISTORIAL DE AUDITORÍA Y MOVIMIENTOS DE LA APLICACIÓN']);
  ws.addRow([`Generado: ${new Date().toLocaleString('es-CO')} | Registros: ${logs.length}${filterSummary ? ` | Filtros: ${filterSummary}` : ''}`]);
  ws.addRow([]);

  const headerRow = ws.addRow([
    'Fecha y Hora de Registro',
    'Módulo',
    'Acción',
    'Movimiento',
    'Detalle',
    'Viaje',
    'Fecha Compra / Referencia',
    'Monto Original',
    'Moneda',
    'Valor COP',
    'Usuario'
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FF00FF85' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF151B27' } };
  });

  logs.forEach((l) => {
    ws.addRow([
      formatAuditDateTime(l.timestamp),
      (l.modulo || '').toUpperCase(),
      (l.accion || '').toUpperCase(),
      l.titulo || '-',
      l.detalle || '-',
      l.viajeTitulo || '-',
      l.fechaReferencia ? String(l.fechaReferencia).split('T')[0] : '-',
      l.montoOriginal !== null ? l.montoOriginal : '',
      l.monedaOriginal || '',
      l.montoCOP !== null ? Math.round(l.montoCOP) : '',
      l.usuarioEmail || l.usuarioNombre || '-'
    ]);
  });

  ws.columns.forEach((col) => {
    col.width = 20;
  });
  ws.getColumn(4).width = 34;
  ws.getColumn(5).width = 42;

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Historial_Auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAuditLogsCsv(logs = []) {
  const headers = [
    'FechaHoraRegistro',
    'Modulo',
    'Accion',
    'Movimiento',
    'Detalle',
    'Viaje',
    'FechaCompraReferencia',
    'MontoOriginal',
    'Moneda',
    'ValorCOP',
    'Usuario'
  ];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = logs.map((l) =>
    [
      formatAuditDateTime(l.timestamp),
      l.modulo,
      l.accion,
      l.titulo,
      l.detalle,
      l.viajeTitulo || '-',
      l.fechaReferencia ? String(l.fechaReferencia).split('T')[0] : '-',
      l.montoOriginal ?? '',
      l.monedaOriginal || '',
      l.montoCOP ?? '',
      l.usuarioEmail || l.usuarioNombre || '-'
    ]
      .map(esc)
      .join(',')
  );

  const csv = '\uFEFF' + [headers.map(esc).join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Historial_Auditoria_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
