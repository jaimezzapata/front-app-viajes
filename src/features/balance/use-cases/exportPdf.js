import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * exportTripPdf: Genera el reporte formal de gastos y bitácora del viaje
 * utilizando jsPDF y jspdf-autotable en el frontend (100% Offline).
 */
export function exportTripPdf({ viaje, balance, gastos = [], eventos = [] }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Estilo y cabecera minimalista (paleta oscura/tecnológica)
  doc.setFillColor(7, 9, 14); // #07090E
  doc.rect(0, 0, 210, 35, 'F');

  // Título
  doc.setTextColor(0, 255, 133); // #00FF85 (Neón Verde)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BITÁCORA DE VIAJE - REPORTE EJECUTIVO', 14, 16);

  // Subtítulo con destino y fechas
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const destinoText = `${viaje?.titulo || 'Mi Viaje'} (${viaje?.destino || 'Destino'})`;
  doc.text(destinoText, 14, 25);

  const fechaText = `Generado: ${new Date().toLocaleDateString()} | Moneda Base: ${viaje?.monedaBase || 'COP'}`;
  doc.setTextColor(132, 146, 166);
  doc.setFontSize(9);
  doc.text(fechaText, 14, 30);

  // Resumen Financiero (KPIs)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMEN FINANCIERO Y PRESUPUESTO', 14, 45);

  const kpiData = [
    ['Presupuesto Total (COP)', `$ ${Number(balance?.presupuestoTotalCOP || 0).toLocaleString()}`],
    ['Total Gastado (COP)', `$ ${Number(balance?.totalGastadoCOP || 0).toLocaleString()}`],
    ['Total Gastado (USD ref)', `$ ${Number(balance?.totalGastadoUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
    ['Pagado por Adelantado (Costos Hundidos)', `$ ${Number(balance?.pagadoAdelantadoCOP || 0).toLocaleString()}`],
    ['Dinero Requerido en Ruta', `$ ${Number(balance?.dineroRequeridoEnRutaCOP || 0).toLocaleString()}`],
    ['Balance Disponible', `$ ${Number(balance?.balanceDisponibleCOP || 0).toLocaleString()}`],
    ['Porcentaje Consumido', `${balance?.porcentajeConsumido || 0}% (${(balance?.semaforoGlobal || 'verde').toUpperCase()})`]
  ];

  autoTable(doc, {
    startY: 48,
    head: [['Concepto', 'Valor']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [15, 20, 28], textColor: [0, 229, 255] },
    styles: { fontSize: 9, cellPadding: 2.5 }
  });

  // Semáforo por categorías
  if (balance?.semaforoCategorias && balance.semaforoCategorias.length > 0) {
    const nextY = doc.lastAutoTable.finalY + 10;
    doc.text('2. CONSUMO POR CATEGORÍA (SEMÁFORO)', 14, nextY);

    const semaforoRows = balance.semaforoCategorias.map(c => [
      c.categoria.toUpperCase(),
      `$ ${Number(c.limiteCOP || 0).toLocaleString()}`,
      `$ ${Number(c.consumidoCOP || 0).toLocaleString()}`,
      `${c.porcentaje}%`,
      c.color.toUpperCase()
    ]);

    autoTable(doc, {
      startY: nextY + 3,
      head: [['Categoría', 'Límite COP', 'Consumido COP', 'Consumo %', 'Estado Semáforo']],
      body: semaforoRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 20, 28], textColor: [255, 229, 0] },
      styles: { fontSize: 8.5, cellPadding: 2 }
    });
  }

  // Desglose de Gastos
  if (gastos.length > 0) {
    const nextY = doc.lastAutoTable.finalY + 10;
    // Si no cabe en la página, saltar
    if (nextY > 230) doc.addPage();

    const startGastosY = nextY > 230 ? 20 : nextY;
    doc.text('3. DESGLOSE DETALLADO DE GASTOS', 14, startGastosY);

    const getTasaDisplay = (g) => {
      const curr = (g.monedaOriginal || 'COP').toUpperCase();
      if (curr === 'COP') return '1:1 (COP)';
      const rate = g.tasaCambioFecha || (g.montoOriginal > 0 && g.montoCOP > 0 ? (g.montoCOP / g.montoOriginal) : null);
      if (!rate) return '1:1';
      const decimals = (curr === 'JPY' || curr === 'KRW') ? 4 : 2;
      return `1 ${curr} = $${Number(rate).toFixed(decimals)}`;
    };

    const gastosRows = gastos.map(g => [
      new Date(g.fechaGasto).toLocaleDateString(),
      g.concepto,
      g.categoria,
      `${g.montoOriginal} ${g.monedaOriginal}`,
      getTasaDisplay(g),
      `$ ${Number(g.montoCOP).toLocaleString()}`,
      g.pagadoAdelantado ? 'Adelantado' : (g.noComputar ? 'Terceros' : 'En Ruta')
    ]);

    autoTable(doc, {
      startY: startGastosY + 3,
      head: [['Fecha', 'Concepto', 'Categoría', 'Monto Orig.', 'Tasa Aplicada', 'Equiv. COP', 'Tipo']],
      body: gastosRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 20, 28], textColor: [0, 255, 133] },
      styles: { fontSize: 7.5, cellPadding: 2 }
    });
  }

  // Descargar archivo PDF
  const filename = `Reporte_${(viaje?.destino || 'Viaje').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
