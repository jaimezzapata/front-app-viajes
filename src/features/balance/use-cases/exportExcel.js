import ExcelJS from 'exceljs';

/**
 * exportTripExcel: Genera una hoja de cálculo profesional (.xlsx) con diseño premium,
 * formato numérico contable, colores y desglose detallado de bitácora y finanzas.
 */
export async function exportTripExcel({ viaje, balance, gastos = [], eventos = [] }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bitácora de Viajes App';
  workbook.lastModifiedBy = 'Bitácora de Viajes App';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Paleta de colores corporativa (Diseño Oscuro / Ejecutivo)
  const HEADER_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0E121B' } // #0E121B
  };
  const SUBHEADER_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF151B27' } // #151B27
  };
  const HIGHLIGHT_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF00FF85' } // #00FF85 (Verde Neón)
  };
  const CYAN_TEXT = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF00E5FF' } };
  const WHITE_TEXT = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFF1F5F9' } };
  const MUTED_TEXT = { name: 'Arial', size: 9, color: { argb: 'FF8492A6' } };
  const THIN_BORDER = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  };

  // =========================================================================
  // HOJA 1: RESUMEN FINANCIERO Y PRESUPUESTO
  // =========================================================================
  const wsBalance = workbook.addWorksheet('📊 Resumen Financiero', {
    views: [{ showGridLines: true }]
  });

  // Título del Viaje
  wsBalance.mergeCells('A1:E1');
  const titleCell = wsBalance.getCell('A1');
  titleCell.value = `BITÁCORA DE VIAJE - REPORTE EJECUTIVO: ${(viaje?.titulo || 'Mi Viaje').toUpperCase()}`;
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF00FF85' } };
  titleCell.fill = HEADER_FILL;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsBalance.getRow(1).height = 30;

  // Subtítulo con metadatos
  wsBalance.mergeCells('A2:E2');
  const subCell = wsBalance.getCell('A2');
  subCell.value = `Destino: ${viaje?.destino || 'Varios'} | Fechas: ${viaje?.fechaInicio ? new Date(viaje.fechaInicio).toLocaleDateString() : ''} - ${viaje?.fechaFin ? new Date(viaje.fechaFin).toLocaleDateString() : ''} | Moneda Base: ${viaje?.monedaBase || 'COP'}`;
  subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFCBD5E1' } };
  subCell.fill = SUBHEADER_FILL;
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsBalance.getRow(2).height = 20;

  // Espacio
  wsBalance.addRow([]);

  // Sección 1: Indicadores Financieros Clave (KPIs)
  wsBalance.mergeCells('A4:C4');
  const kpiHeader = wsBalance.getCell('A4');
  kpiHeader.value = '1. INDICADORES FINANCIEROS CLAVE (KPIs)';
  kpiHeader.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF00E5FF' } };
  kpiHeader.fill = HEADER_FILL;

  const kpis = [
    ['Presupuesto Total Estimado (COP)', Number(balance?.presupuestoTotalCOP || 0), '$#,##0'],
    ['Total Gastado Real (COP)', Number(balance?.totalGastadoCOP || 0), '$#,##0'],
    ['Total Gastado de Referencia (USD)', Number(balance?.totalGastadoUSD || 0), '$#,##0.00'],
    ['Costos Hundidos (Pagado por Adelantado)', Number(balance?.pagadoAdelantadoCOP || 0), '$#,##0'],
    ['Dinero Requerido en Ruta (Efectivo / Tarjetas)', Number(balance?.dineroRequeridoEnRutaCOP || 0), '$#,##0'],
    ['Balance Disponible Restante (COP)', Number(balance?.balanceDisponibleCOP || 0), '$#,##0'],
    ['Porcentaje de Presupuesto Consumido', (Number(balance?.porcentajeConsumido || 0)) / 100, '0.0%']
  ];

  kpis.forEach(([concepto, valor, format], i) => {
    const row = wsBalance.addRow([concepto, valor]);
    row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
    row.getCell(1).border = THIN_BORDER;
    row.getCell(2).font = { name: 'Arial', size: 10, bold: true };
    row.getCell(2).numFmt = format;
    row.getCell(2).border = THIN_BORDER;
    row.getCell(2).alignment = { horizontal: 'right' };
    if (i % 2 === 0) {
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    }
  });

  // Espacio
  wsBalance.addRow([]);

  // Sección 2: Semáforo de Consumo por Categoría
  if (balance?.semaforoCategorias && balance.semaforoCategorias.length > 0) {
    const semRowStart = wsBalance.lastRow.number + 1;
    wsBalance.mergeCells(`A${semRowStart}:E${semRowStart}`);
    const semHeader = wsBalance.getCell(`A${semRowStart}`);
    semHeader.value = '2. CONTROL DE PRESUPUESTO POR CATEGORÍA (SEMÁFORO)';
    semHeader.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFE500' } };
    semHeader.fill = HEADER_FILL;

    const headersRow = wsBalance.addRow(['Categoría', 'Límite Presupuestado (COP)', 'Consumido Real (COP)', '% Consumido', 'Estado Semáforo']);
    headersRow.font = WHITE_TEXT;
    headersRow.fill = SUBHEADER_FILL;
    headersRow.alignment = { vertical: 'middle', horizontal: 'center' };

    balance.semaforoCategorias.forEach(c => {
      const row = wsBalance.addRow([
        c.categoria.toUpperCase(),
        Number(c.limiteCOP || 0),
        Number(c.consumidoCOP || 0),
        (Number(c.porcentaje || 0)) / 100,
        c.color.toUpperCase()
      ]);
      row.getCell(1).font = { name: 'Arial', size: 10, bold: true };
      row.getCell(2).numFmt = '$#,##0';
      row.getCell(3).numFmt = '$#,##0';
      row.getCell(4).numFmt = '0.0%';
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(5).font = { name: 'Arial', size: 10, bold: true };

      // Color visual para el semáforo
      if (c.color === 'rojo') {
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE2E2' } };
        row.getCell(5).font = { color: { argb: 'FFDC2626' }, bold: true };
      } else if (c.color === 'amarillo') {
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } };
        row.getCell(5).font = { color: { argb: 'FFCA8A04' }, bold: true };
      } else {
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        row.getCell(5).font = { color: { argb: 'FF16A34A' }, bold: true };
      }

      for (let col = 1; col <= 5; col++) {
        row.getCell(col).border = THIN_BORDER;
      }
    });
  }

  // Autoajuste de anchos para la Hoja 1
  wsBalance.getColumn(1).width = 46;
  wsBalance.getColumn(2).width = 28;
  wsBalance.getColumn(3).width = 26;
  wsBalance.getColumn(4).width = 18;
  wsBalance.getColumn(5).width = 20;

  // =========================================================================
  // HOJA 2: DESGLOSE DETALLADO DE GASTOS Y TRANSACCIONES
  // =========================================================================
  const wsGastos = workbook.addWorksheet('💳 Desglose de Gastos', {
    views: [{ showGridLines: true }]
  });

  // Cabecera de la hoja de gastos
  wsGastos.mergeCells('A1:H1');
  const gTitle = wsGastos.getCell('A1');
  gTitle.value = `BITÁCORA CONTABLE - GASTOS DETALLADOS (${gastos.length} TRANSACCIONES)`;
  gTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF00FF85' } };
  gTitle.fill = HEADER_FILL;
  gTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsGastos.getRow(1).height = 26;

  // Cabecera de Columnas
  const gastosHeaders = [
    'Fecha de Gasto',
    'Concepto / Descripción',
    'Categoría',
    'Monto Original',
    'Moneda',
    'Tasa de Cambio Aplicada',
    'Equivalente en COP',
    'Tipo de Transacción'
  ];

  const gHeadRow = wsGastos.addRow(gastosHeaders);
  gHeadRow.font = CYAN_TEXT;
  gHeadRow.fill = SUBHEADER_FILL;
  gHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
  gHeadRow.height = 22;

  // Filas de Gastos
  gastos.forEach((g, idx) => {
    const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
    const rate = g.tasaCambioFecha || (g.montoOriginal > 0 && g.montoCOP > 0 ? (g.montoCOP / g.montoOriginal) : null);
    const tasaStr = origCurr === 'COP'
      ? '1:1 (Moneda Base)'
      : (rate ? `1 ${origCurr} = $${Number(rate).toLocaleString('es-CO', { minimumFractionDigits: origCurr === 'JPY' || origCurr === 'KRW' ? 4 : 2, maximumFractionDigits: 4 })} COP` : 'N/A');

    const tipoStr = g.pagadoAdelantado
      ? 'Costo Hundido (Adelantado)'
      : (g.noComputar ? 'Encargo (Terceros)' : (g.esIngreso ? 'Reembolso / Tax-Free' : 'Consumo en Ruta'));

    const row = wsGastos.addRow([
      g.fechaGasto ? new Date(g.fechaGasto).toLocaleDateString() : '',
      g.concepto,
      g.categoria ? g.categoria.toUpperCase() : 'OTROS',
      Number(g.montoOriginal || 0),
      origCurr,
      tasaStr,
      Number(g.montoCOP || 0),
      tipoStr
    ]);

    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(4).alignment = { horizontal: 'right' };
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(6).alignment = { horizontal: 'center' };
    row.getCell(7).numFmt = '$#,##0';
    row.getCell(7).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    row.getCell(7).alignment = { horizontal: 'right' };
    row.getCell(8).alignment = { horizontal: 'center' };

    // Cebrado suave
    if (idx % 2 === 1) {
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    }

    for (let c = 1; c <= 8; c++) {
      row.getCell(c).border = THIN_BORDER;
    }
  });

  // Fila de Total de Gastos
  if (gastos.length > 0) {
    const totalRow = wsGastos.addRow([
      'TOTAL GENERAL',
      `Total ${gastos.length} registros`,
      '',
      '',
      '',
      '',
      { formula: `SUM(G3:G${wsGastos.lastRow.number})` },
      ''
    ]);
    totalRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF00FF85' } };
    totalRow.fill = HEADER_FILL;
    totalRow.getCell(7).numFmt = '$#,##0';
    totalRow.getCell(7).alignment = { horizontal: 'right' };
    totalRow.height = 24;
  }

  // Anchos automáticos de la Hoja de Gastos
  wsGastos.getColumn(1).width = 16;
  wsGastos.getColumn(2).width = 40;
  wsGastos.getColumn(3).width = 18;
  wsGastos.getColumn(4).width = 18;
  wsGastos.getColumn(5).width = 12;
  wsGastos.getColumn(6).width = 30;
  wsGastos.getColumn(7).width = 24;
  wsGastos.getColumn(8).width = 28;

  // =========================================================================
  // HOJA 3: ITINERARIO Y LOGÍSTICA DE VIAJE
  // =========================================================================
  if (eventos && eventos.length > 0) {
    const wsItin = workbook.addWorksheet('🗓️ Itinerario y Logística', {
      views: [{ showGridLines: true }]
    });

    wsItin.mergeCells('A1:G1');
    const iTitle = wsItin.getCell('A1');
    iTitle.value = `CRONOGRAMA Y LOGÍSTICA DEL VIAJE (${eventos.length} ACTIVIDADES)`;
    iTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF00E5FF' } };
    iTitle.fill = HEADER_FILL;
    iTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    wsItin.getRow(1).height = 26;

    const itinHeaders = [
      'Fecha / Hora Inicio',
      'Actividad / Título',
      'Tipo de Evento',
      'Ubicación / Trayecto',
      'Origen ➔ Destino',
      'Costo Asociado',
      'Notas / Observaciones'
    ];

    const iHeadRow = wsItin.addRow(itinHeaders);
    iHeadRow.font = WHITE_TEXT;
    iHeadRow.fill = SUBHEADER_FILL;
    iHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
    iHeadRow.height = 22;

    eventos.forEach((ev, idx) => {
      const rutaStr = ev.ciudadOrigen || ev.ciudadDestino
        ? `${ev.aeropuertoOrigen || ev.ciudadOrigen || ''} ➔ ${ev.aeropuertoDestino || ev.ciudadDestino || ''}`
        : '-';

      const costoStr = ev.costo && Number(ev.costo) > 0
        ? `${Number(ev.costo).toLocaleString()} ${ev.moneda || 'COP'}`
        : 'Incluido / Gratis';

      const row = wsItin.addRow([
        ev.fechaInicio ? new Date(ev.fechaInicio).toLocaleString() : '',
        ev.titulo,
        (ev.tipo || '').toUpperCase(),
        ev.ubicacion || '-',
        rutaStr,
        costoStr,
        ev.notas || ''
      ]);

      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).font = { name: 'Arial', size: 10, bold: true };
      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'right' };

      if (idx % 2 === 1) {
        for (let c = 1; c <= 7; c++) {
          row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      }

      for (let c = 1; c <= 7; c++) {
        row.getCell(c).border = THIN_BORDER;
      }
    });

    wsItin.getColumn(1).width = 22;
    wsItin.getColumn(2).width = 38;
    wsItin.getColumn(3).width = 16;
    wsItin.getColumn(4).width = 32;
    wsItin.getColumn(5).width = 24;
    wsItin.getColumn(6).width = 20;
    wsItin.getColumn(7).width = 40;
  }

  // Generar buffer y descargar archivo en el navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const filename = `Reporte_${(viaje?.destino || 'Viaje').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
