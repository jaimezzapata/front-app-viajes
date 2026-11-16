import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { enrichGastoWithLocation } from '../../../utils/balance';

/**
 * exportTripPdf: Genera el reporte formal de gastos y bitácora del viaje
 * utilizando jsPDF y jspdf-autotable en el frontend (100% Offline).
 */
export function exportTripPdf({ viaje, balance, gastos = [], eventos = [], filterTitle = '' }) {
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
  doc.text('BITÁCORA DE VIAJE - REPORTE FINANCIERO', 14, 15);

  // Subtítulo con destino y fechas
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  const destinoText = `${viaje?.titulo || 'Mi Viaje'} (${viaje?.destino || 'Destino'})`;
  doc.text(destinoText, 14, 23);

  const fechaText = `Generado: ${new Date().toLocaleDateString()} | Moneda Base: ${viaje?.monedaBase || 'COP'}${filterTitle ? ` | Filtro: ${filterTitle}` : ''}`;
  doc.setTextColor(132, 146, 166);
  doc.setFontSize(8.5);
  doc.text(fechaText, 14, 29);

  // Resumen Financiero (KPIs)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMEN FINANCIERO Y PRESUPUESTO', 14, 45);

  const kpiData = [
    ['Presupuesto Asignado (Sin tiquetes principales)', `$ ${Number(balance?.presupuestoTotalCOP || 0).toLocaleString('es-CO')} COP`],
    ['1. Consumido EN PRESUPUESTO — Por Persona (1 Cupo)', `$ ${Number(balance?.totalGastadoCOP || 0).toLocaleString('es-CO')} COP`],
    ['1b. Total Facturado TC EN PRESUPUESTO (Todos los cupos)', `$ ${Number(balance?.totalDesembolsadoCOP || balance?.totalGastadoCOP || 0).toLocaleString('es-CO')} COP`],
    ['1c. Cupos Adicionales / Acompañantes (En Presupuesto)', `$ ${Number(balance?.gastoAcompanantesCOP || 0).toLocaleString('es-CO')} COP`],
    ['2. FUERA DE PRESUPUESTO (Tiquetes Salida y Llegada)', `$ ${Number(balance?.totalFueraPresupuestoCOP || 0).toLocaleString('es-CO')} COP (Excluido del presupuesto)`],
    ['3. Gran Total Acumulado (En Presupuesto + Tiquetes)', `$ ${Number((balance?.totalDesembolsadoCOP || 0) + (balance?.totalFueraPresupuestoCOP || 0)).toLocaleString('es-CO')} COP`],
    ['Pagado Pre-Viaje (En Presupuesto - 1 Persona)', `$ ${Number(balance?.pagadoAdelantadoCOP || 0).toLocaleString('es-CO')} COP`],
    ['Dinero Requerido en Ruta (En Presupuesto)', `$ ${Number(balance?.dineroRequeridoEnRutaCOP || 0).toLocaleString('es-CO')} COP`],
    ['Saldo Disponible del Presupuesto', `$ ${Number(balance?.balanceDisponibleCOP || 0).toLocaleString('es-CO')} COP (${balance?.porcentajeConsumido || 0}%)`]
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
    if (nextY > 230) doc.addPage();

    const startGastosY = nextY > 230 ? 20 : nextY;
    doc.text(`3. DESGLOSE DETALLADO DE PAGOS (${gastos.length} REGISTROS)`, 14, startGastosY);

    const getTasaDisplay = (g) => {
      const curr = (g.monedaOriginal || 'COP').toUpperCase();
      if (curr === 'COP') return '1:1 (COP)';
      const rate = g.tasaCambioFecha || (g.montoOriginal > 0 && g.montoCOP > 0 ? (g.montoCOP / g.montoOriginal) : null);
      if (!rate) return '1:1';
      const decimals = (curr === 'JPY' || curr === 'KRW') ? 4 : 2;
      return `1 ${curr} = $${Number(rate).toFixed(decimals)}`;
    };

    const enriched = gastos.map(g => enrichGastoWithLocation(g, eventos, viaje));

    const gastosRows = enriched.map(g => [
      new Date(g.fechaGasto).toLocaleDateString(),
      g.concepto,
      g.categoria,
      g.cityName ? `${g.cityName}${g.countryName ? `, ${g.countryName}` : ''}` : (g.countryName || '-'),
      g.tarjetaCredito || 'Efectivo',
      `${g.cantidadPersonas || 1}p`,
      `$ ${Number(g.montoTotalCOP || g.montoCOP || 0).toLocaleString('es-CO')}`,
      `$ ${Number(g.montoPorPersonaCOP || g.montoCOP || 0).toLocaleString('es-CO')}`,
      g.noComputar ? 'NO (Fuera Ppto)' : 'SÍ (En Ppto)'
    ]);

    autoTable(doc, {
      startY: startGastosY + 3,
      head: [['Fecha', 'Concepto', 'Categoría', 'Ciudad / País', 'TC / Medio', 'Pers.', 'Total TC COP', 'Por Persona COP', '¿En Presupuesto?']],
      body: gastosRows,
      theme: 'striped',
      headStyles: { fillColor: [15, 20, 28], textColor: [0, 255, 133] },
      styles: { fontSize: 6.8, cellPadding: 1.8 }
    });
  }

  // Descargar archivo PDF
  const filename = `Reporte_${(viaje?.destino || 'Viaje').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
