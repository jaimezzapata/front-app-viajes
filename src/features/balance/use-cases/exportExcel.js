import ExcelJS from 'exceljs';

/**
 * exportTripExcel: Genera un libro de cálculo profesional (.xlsx)
 * con diseño Ejecutivo Moderno (fondos oscuros elegantes #0F172A,
 * tarjetas KPI estilo dashboard, fórmulas nativas de Excel y desglose contable exhaustivo).
 */
export async function exportTripExcel({ viaje, balance, gastos = [], eventos = [] }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bitácora de Viajes App - Z-Suite';
  workbook.lastModifiedBy = 'Bitácora de Viajes App';
  workbook.created = new Date();
  workbook.modified = new Date();

  // =========================================================================
  // PALETA DE COLORES - DISEÑO EJECUTIVO MODERNO (#0F172A / SLATE / NEON)
  // =========================================================================
  const PALETTE = {
    darkHeader: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }, // #0F172A
    slateCard: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } },  // #1E293B
    cardHeader: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }, // #334155
    zebraLight: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }, // #F8FAFC
    highlightRow: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } },
    greenTag: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } },
    yellowTag: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } },
    redTag: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } },
  };

  const FONTS = {
    titleMain: { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF00FF85' } }, // Neon Green
    titleSub: { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FFCBD5E1' } },
    sectionHeader: { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF38BDF8' } }, // Sky Cyan
    tableHeader: { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFF8FAFC' } },
    kpiLabel: { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: 'FF94A3B8' } },
    kpiValueGreen: { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FF00FF85' } },
    kpiValueCyan: { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FF38BDF8' } },
    kpiValueWhite: { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFF8FAFC' } },
    kpiValueAmber: { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFBBF24' } },
    kpiSubtext: { name: 'Segoe UI', size: 8.5, color: { argb: 'FF94A3B8' } },
    boldText: { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF0F172A' } },
    regularText: { name: 'Segoe UI', size: 9.5, color: { argb: 'FF334155' } },
    mutedText: { name: 'Segoe UI', size: 8.5, color: { argb: 'FF64748B' } },
    totalLabel: { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF00FF85' } }
  };

  const BORDERS = {
    thinSlate: {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    },
    cardBorder: {
      top: { style: 'medium', color: { argb: 'FF475569' } },
      left: { style: 'medium', color: { argb: 'FF475569' } },
      bottom: { style: 'medium', color: { argb: 'FF475569' } },
      right: { style: 'medium', color: { argb: 'FF475569' } }
    },
    totalDouble: {
      top: { style: 'thin', color: { argb: 'FF475569' } },
      bottom: { style: 'double', color: { argb: 'FF00FF85' } },
      left: { style: 'thin', color: { argb: 'FF475569' } },
      right: { style: 'thin', color: { argb: 'FF475569' } }
    }
  };

  // Metadatos calculados de viaje
  const fechaInicio = viaje?.fechaInicio ? new Date(viaje.fechaInicio) : null;
  const fechaFin = viaje?.fechaFin ? new Date(viaje.fechaFin) : null;
  const diasTotales = (fechaInicio && fechaFin && fechaFin >= fechaInicio)
    ? Math.max(1, Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1)
    : 1;

  const monedaBase = (viaje?.monedaBase || 'COP').toUpperCase();
  const monedaRef = (viaje?.monedaReferencia || 'USD').toUpperCase();
  const monedaLocal = (viaje?.monedaLocal || 'USD').toUpperCase();
  const safeGastos = Array.isArray(gastos) ? gastos : [];
  const safeEventos = Array.isArray(eventos) ? eventos : [];

  // Filas en Hoja de Gastos (para fórmulas de suma y sumifs)
  const gastosStartRow = 4;
  const gastosEndRow = safeGastos.length > 0 ? (gastosStartRow + safeGastos.length - 1) : 4;

  // =========================================================================
  // HOJA 1: 📊 DASHBOARD EJECUTIVO & RESUMEN FINANCIERO
  // =========================================================================
  const wsDashboard = workbook.addWorksheet('📊 Dashboard Ejecutivo', {
    views: [{ showGridLines: true }]
  });

  // Anchos optimizados de columnas para el Dashboard (A a F)
  wsDashboard.getColumn(1).width = 28; // A: Categoría / Concepto
  wsDashboard.getColumn(2).width = 24; // B: Límite / Metadato
  wsDashboard.getColumn(3).width = 24; // C: Consumido / Gasto
  wsDashboard.getColumn(4).width = 22; // D: Saldo / Diferencia
  wsDashboard.getColumn(5).width = 18; // E: % Consumido
  wsDashboard.getColumn(6).width = 22; // F: Estado Semáforo

  // 1. BANNER PRINCIPAL DEL VIAJE
  wsDashboard.mergeCells('A1:F1');
  const mainTitle = wsDashboard.getCell('A1');
  mainTitle.value = `✈️ BITÁCORA DE VIAJE | REPORTE EJECUTIVO: ${(viaje?.titulo || 'Mi Viaje').toUpperCase()}`;
  mainTitle.font = FONTS.titleMain;
  mainTitle.fill = PALETTE.darkHeader;
  mainTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDashboard.getRow(1).height = 36;

  wsDashboard.mergeCells('A2:F2');
  const subTitle = wsDashboard.getCell('A2');
  const fechasStr = fechaInicio && fechaFin
    ? `${fechaInicio.toLocaleDateString('es-CO')} al ${fechaFin.toLocaleDateString('es-CO')}`
    : 'Fechas no definidas';
  subTitle.value = `Destino: ${viaje?.destino || 'Varios'}  •  Duración: ${diasTotales} días (${fechasStr})  •  Moneda Base: ${monedaBase}  •  Referencia: ${monedaRef}  •  Moneda Local: ${monedaLocal}`;
  subTitle.font = FONTS.titleSub;
  subTitle.fill = PALETTE.slateCard;
  subTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDashboard.getRow(2).height = 24;

  // Espacio fila 3
  wsDashboard.getRow(3).height = 12;

  // -------------------------------------------------------------------------
  // 2. TARJETAS KPI EJECUTIVAS (FILA 1: PRESUPUESTO, GASTO REAL, BALANCE)
  // -------------------------------------------------------------------------
  // Helper para dibujar una tarjeta KPI elegante de 2 columnas de ancho
  function renderKpiCard({ startCol, endCol, startRow, label, formulaVal, rawVal, numFmt, fontVal, subtext }) {
    const colA = startCol;
    const colB = endCol;

    // Fila 1: Encabezado de la Tarjeta (Label)
    wsDashboard.mergeCells(`${colA}${startRow}:${colB}${startRow}`);
    const lblCell = wsDashboard.getCell(`${colA}${startRow}`);
    lblCell.value = label;
    lblCell.font = FONTS.kpiLabel;
    lblCell.fill = PALETTE.cardHeader;
    lblCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Fila 2: Valor principal
    wsDashboard.mergeCells(`${colA}${startRow + 1}:${colB}${startRow + 1}`);
    const valCell = wsDashboard.getCell(`${colA}${startRow + 1}`);
    if (formulaVal) {
      valCell.value = { formula: formulaVal, result: rawVal };
    } else {
      valCell.value = rawVal;
    }
    valCell.numFmt = numFmt;
    valCell.font = fontVal;
    valCell.fill = PALETTE.slateCard;
    valCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Fila 3: Subtexto / Contexto
    wsDashboard.mergeCells(`${colA}${startRow + 2}:${colB}${startRow + 2}`);
    const subCell = wsDashboard.getCell(`${colA}${startRow + 2}`);
    if (typeof subtext === 'object' && subtext.formula) {
      subCell.value = subtext;
    } else {
      subCell.value = subtext;
    }
    subCell.font = FONTS.kpiSubtext;
    subCell.fill = PALETTE.slateCard;
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Bordes de la tarjeta
    for (let r = startRow; r <= startRow + 2; r++) {
      const cellA = wsDashboard.getCell(`${colA}${r}`);
      const cellB = wsDashboard.getCell(`${colB}${r}`);
      cellA.border = {
        top: r === startRow ? { style: 'medium', color: { argb: 'FF475569' } } : undefined,
        bottom: r === startRow + 2 ? { style: 'medium', color: { argb: 'FF475569' } } : undefined,
        left: { style: 'medium', color: { argb: 'FF475569' } }
      };
      cellB.border = {
        top: r === startRow ? { style: 'medium', color: { argb: 'FF475569' } } : undefined,
        bottom: r === startRow + 2 ? { style: 'medium', color: { argb: 'FF475569' } } : undefined,
        right: { style: 'medium', color: { argb: 'FF475569' } }
      };
    }
  }

  // Alturas para filas de KPIs Fila 1
  wsDashboard.getRow(4).height = 18;
  wsDashboard.getRow(5).height = 30;
  wsDashboard.getRow(6).height = 20;

  const presTotalCOP = Number(balance?.presupuestoTotalCOP || viaje?.presupuestoTotal || 0);
  const gastoRealCOP = Number(balance?.totalGastadoCOP || 0);
  const balDispCOP = Number(balance?.balanceDisponibleCOP || (presTotalCOP - gastoRealCOP));
  const promPresDiario = diasTotales > 0 ? Math.round(presTotalCOP / diasTotales) : 0;
  const promGastoDiario = diasTotales > 0 ? Math.round(gastoRealCOP / diasTotales) : 0;

  // Tarjeta 1: Presupuesto Total
  renderKpiCard({
    startCol: 'A', endCol: 'B', startRow: 4,
    label: '💰 PRESUPUESTO TOTAL ESTIMADO',
    rawVal: presTotalCOP,
    numFmt: '$#,##0',
    fontVal: FONTS.kpiValueCyan,
    subtext: `Promedio: $${promPresDiario.toLocaleString('es-CO')} / día (${diasTotales} días)`
  });

  // Tarjeta 2: Total Gastado Real (con fórmula apuntando a la hoja de Gastos)
  const formulaSumaGastos = safeGastos.length > 0
    ? `SUM('💳 Desglose de Gastos'!H${gastosStartRow}:H${gastosEndRow})`
    : '0';

  renderKpiCard({
    startCol: 'C', endCol: 'D', startRow: 4,
    label: '💳 TOTAL GASTADO REAL (COP)',
    formulaVal: formulaSumaGastos,
    rawVal: gastoRealCOP,
    numFmt: '$#,##0',
    fontVal: FONTS.kpiValueWhite,
    subtext: `Equivalente Ref: $${Number(balance?.totalGastadoUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${monedaRef}`
  });

  // Tarjeta 3: Balance Disponible (Fórmula: Presupuesto - Gastado)
  renderKpiCard({
    startCol: 'E', endCol: 'F', startRow: 4,
    label: '⚖️ BALANCE DISPONIBLE RESTANTE',
    formulaVal: 'A5-C5',
    rawVal: balDispCOP,
    numFmt: '$#,##0',
    fontVal: balDispCOP >= 0 ? FONTS.kpiValueGreen : { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFF2E55' } },
    subtext: { formula: 'IF(E5>=0, "🟢 Superávit Presupuestario", "🔴 Presupuesto Excedido")', result: balDispCOP >= 0 ? '🟢 Superávit Presupuestario' : '🔴 Presupuesto Excedido' }
  });

  // Espacio fila 7
  wsDashboard.getRow(7).height = 10;

  // -------------------------------------------------------------------------
  // 3. TARJETAS KPI EJECUTIVAS (FILA 2: % CONSUMIDO, COSTOS HUNDIDOS, EN RUTA)
  // -------------------------------------------------------------------------
  wsDashboard.getRow(8).height = 18;
  wsDashboard.getRow(9).height = 30;
  wsDashboard.getRow(10).height = 20;

  const pctConsumido = presTotalCOP > 0 ? (gastoRealCOP / presTotalCOP) : 0;
  const pagadoAdelantado = Number(balance?.pagadoAdelantadoCOP || 0);
  const dineroEnRuta = Number(balance?.dineroRequeridoEnRutaCOP || (gastoRealCOP - pagadoAdelantado));

  // Tarjeta 4: % Consumo de Presupuesto
  renderKpiCard({
    startCol: 'A', endCol: 'B', startRow: 8,
    label: '📊 CONSUMO DEL PRESUPUESTO',
    formulaVal: 'IF(A5>0, C5/A5, 0)',
    rawVal: pctConsumido,
    numFmt: '0.0%',
    fontVal: pctConsumido > 1 ? { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFF2E55' } } : FONTS.kpiValueCyan,
    subtext: { formula: 'IF(A9>1, "🔴 Sobregiro Crítico", IF(A9>0.8, "🟡 En Alerta Preventiva", "🟢 Consumo Bajo Control"))', result: pctConsumido > 1 ? '🔴 Sobregiro Crítico' : (pctConsumido > 0.8 ? '🟡 En Alerta' : '🟢 Consumo Bajo Control') }
  });

  // Tarjeta 5: Costos Hundidos (Pre-viaje)
  renderKpiCard({
    startCol: 'C', endCol: 'D', startRow: 8,
    label: '✈️ COSTOS HUNDIDOS (PAGADO PRE-VIAJE)',
    rawVal: pagadoAdelantado,
    numFmt: '$#,##0',
    fontVal: FONTS.kpiValueWhite,
    subtext: 'Vuelos y hoteles pagados con anterioridad'
  });

  // Tarjeta 6: Dinero en Ruta Requerido (Efectivo / Tarjeta en destino)
  renderKpiCard({
    startCol: 'E', endCol: 'F', startRow: 8,
    label: '💵 DINERO REQUERIDO EN RUTA',
    formulaVal: 'C5-C9',
    rawVal: dineroEnRuta,
    numFmt: '$#,##0',
    fontVal: FONTS.kpiValueAmber,
    subtext: `Ritmo diario real: $${promGastoDiario.toLocaleString('es-CO')} / día`
  });

  // Espacio fila 11
  wsDashboard.getRow(11).height = 14;

  // -------------------------------------------------------------------------
  // 4. SECCIÓN: SEMÁFORO DE CONTROL POR CATEGORÍA
  // -------------------------------------------------------------------------
  wsDashboard.mergeCells('A12:F12');
  const semTitle = wsDashboard.getCell('A12');
  semTitle.value = '🎯 CONTROL Y SEMÁFORO PRESUPUESTARIO POR CATEGORÍA';
  semTitle.font = FONTS.sectionHeader;
  semTitle.fill = PALETTE.darkHeader;
  semTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  wsDashboard.getRow(12).height = 26;

  // Cabecera de la tabla de categorías
  const catHeaders = [
    'CATEGORÍA',
    'LÍMITE PRESUPUESTADO (COP)',
    'CONSUMIDO REAL (COP)',
    'SALDO RESTANTE (COP)',
    '% CONSUMIDO',
    'ESTADO SEMÁFORO'
  ];
  const catHeadRow = wsDashboard.addRow(catHeaders);
  catHeadRow.font = FONTS.tableHeader;
  catHeadRow.fill = PALETTE.slateCard;
  catHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
  catHeadRow.height = 24;

  // Categorías base estandarizadas
  const defaultCategories = [
    { key: 'TRANSPORTE', label: '✈️ TRANSPORTE Y VUELOS', pctDef: 0.30 },
    { key: 'ALOJAMIENTO', label: '🏨 ALOJAMIENTO Y HOTELES', pctDef: 0.35 },
    { key: 'COMIDA', label: '🍔 ALIMENTACIÓN Y GASTRONOMÍA', pctDef: 0.15 },
    { key: 'ACTIVIDADES', label: '🎟️ ACTIVIDADES Y TOURS', pctDef: 0.10 },
    { key: 'COMPRAS', label: '🛍️ COMPRAS Y RECUERDOS', pctDef: 0.05 },
    { key: 'OTROS', label: '📦 OTROS Y SERVICIOS', pctDef: 0.05 }
  ];

  // Si hay semáforo personalizado en balance, lo aprovechamos
  const semaforoItems = (balance?.semaforoCategorias && balance.semaforoCategorias.length > 0)
    ? balance.semaforoCategorias.map(sc => {
        const catKey = (sc.categoria || 'OTROS').toUpperCase();
        const found = defaultCategories.find(d => d.key === catKey);
        return {
          key: catKey,
          label: found ? found.label : `🏷️ ${catKey}`,
          limiteCOP: Number(sc.limiteCOP || 0),
          consumidoCOP: Number(sc.consumidoCOP || 0)
        };
      })
    : defaultCategories.map(d => ({
        key: d.key,
        label: d.label,
        limiteCOP: Math.round(presTotalCOP * d.pctDef),
        consumidoCOP: 0
      }));

  const catStartRowNumber = wsDashboard.lastRow.number + 1;

  semaforoItems.forEach((c, idx) => {
    const currentRowNum = catStartRowNumber + idx;
    const formulaConsumido = safeGastos.length > 0
      ? `SUMIFS('💳 Desglose de Gastos'!$H$${gastosStartRow}:'💳 Desglose de Gastos'!$H$${gastosEndRow}, '💳 Desglose de Gastos'!$D$${gastosStartRow}:'💳 Desglose de Gastos'!$D$${gastosEndRow}, "${c.key}")`
      : '0';

    const formulaSaldo = `B${currentRowNum}-C${currentRowNum}`;
    const formulaPct = `IF(B${currentRowNum}>0, C${currentRowNum}/B${currentRowNum}, 0)`;
    const formulaEstado = `IF(E${currentRowNum}>1, "🔴 EXCEDIDO", IF(E${currentRowNum}>0.8, "🟡 EN ALERTA", "🟢 EN CONTROL"))`;

    const realConsumed = c.consumidoCOP || 0;
    const realPct = c.limiteCOP > 0 ? (realConsumed / c.limiteCOP) : 0;
    const realEstado = realPct > 1 ? '🔴 EXCEDIDO' : (realPct > 0.8 ? '🟡 EN ALERTA' : '🟢 EN CONTROL');

    const row = wsDashboard.addRow([
      c.label,
      c.limiteCOP,
      { formula: formulaConsumido, result: realConsumed },
      { formula: formulaSaldo, result: c.limiteCOP - realConsumed },
      { formula: formulaPct, result: realPct },
      { formula: formulaEstado, result: realEstado }
    ]);

    row.height = 22;
    row.getCell(1).font = FONTS.boldText;
    row.getCell(2).numFmt = '$#,##0';
    row.getCell(2).font = FONTS.regularText;
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(3).numFmt = '$#,##0';
    row.getCell(3).font = FONTS.boldText;
    row.getCell(3).alignment = { horizontal: 'right' };
    row.getCell(4).numFmt = '$#,##0';
    row.getCell(4).font = FONTS.regularText;
    row.getCell(4).alignment = { horizontal: 'right' };
    row.getCell(5).numFmt = '0.0%';
    row.getCell(5).alignment = { horizontal: 'center' };
    row.getCell(5).font = FONTS.boldText;
    row.getCell(6).alignment = { horizontal: 'center' };
    row.getCell(6).font = FONTS.boldText;

    // Colores visuales condicionales para la etiqueta del semáforo
    if (realPct > 1) {
      row.getCell(6).fill = PALETTE.redTag;
      row.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFDC2626' } };
    } else if (realPct > 0.8) {
      row.getCell(6).fill = PALETTE.yellowTag;
      row.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFCA8A04' } };
    } else {
      row.getCell(6).fill = PALETTE.greenTag;
      row.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF16A34A' } };
    }

    if (idx % 2 === 1) {
      for (let col = 1; col <= 5; col++) {
        row.getCell(col).fill = PALETTE.zebraLight;
      }
    }

    for (let col = 1; col <= 6; col++) {
      row.getCell(col).border = BORDERS.thinSlate;
    }
  });

  const catEndRowNumber = wsDashboard.lastRow.number;

  // Fila de Total de Categorías
  const totalCatRow = wsDashboard.addRow([
    'TOTAL PRESUPUESTO CATEGORIZADO',
    { formula: `SUM(B${catStartRowNumber}:B${catEndRowNumber})`, result: presTotalCOP },
    { formula: `SUM(C${catStartRowNumber}:C${catEndRowNumber})`, result: gastoRealCOP },
    { formula: `SUM(D${catStartRowNumber}:D${catEndRowNumber})`, result: presTotalCOP - gastoRealCOP },
    { formula: `IF(B${catEndRowNumber + 1}>0, C${catEndRowNumber + 1}/B${catEndRowNumber + 1}, 0)`, result: pctConsumido },
    { formula: `IF(E${catEndRowNumber + 1}>1, "🔴 EXCEDIDO", "🟢 EN CONTROL")`, result: pctConsumido > 1 ? '🔴 EXCEDIDO' : '🟢 EN CONTROL' }
  ]);
  totalCatRow.height = 26;
  totalCatRow.fill = PALETTE.darkHeader;
  totalCatRow.getCell(1).font = FONTS.totalLabel;
  totalCatRow.getCell(2).numFmt = '$#,##0';
  totalCatRow.getCell(2).font = FONTS.totalLabel;
  totalCatRow.getCell(2).alignment = { horizontal: 'right' };
  totalCatRow.getCell(3).numFmt = '$#,##0';
  totalCatRow.getCell(3).font = FONTS.totalLabel;
  totalCatRow.getCell(3).alignment = { horizontal: 'right' };
  totalCatRow.getCell(4).numFmt = '$#,##0';
  totalCatRow.getCell(4).font = FONTS.totalLabel;
  totalCatRow.getCell(4).alignment = { horizontal: 'right' };
  totalCatRow.getCell(5).numFmt = '0.0%';
  totalCatRow.getCell(5).font = FONTS.totalLabel;
  totalCatRow.getCell(5).alignment = { horizontal: 'center' };
  totalCatRow.getCell(6).alignment = { horizontal: 'center' };
  totalCatRow.getCell(6).font = FONTS.totalLabel;

  for (let col = 1; col <= 6; col++) {
    totalCatRow.getCell(col).border = BORDERS.totalDouble;
  }

  // -------------------------------------------------------------------------
  // 5. SECCIÓN: RESUMEN ANALÍTICO DE MONEDAS EXTRANJERAS UTILIZADAS
  // -------------------------------------------------------------------------
  // Agrupar gastos por moneda
  const monedasMap = {};
  safeGastos.forEach(g => {
    const cur = (g.monedaOriginal || monedaBase).toUpperCase();
    if (!monedasMap[cur]) {
      monedasMap[cur] = { moneda: cur, count: 0, totalOrig: 0, totalCOP: 0 };
    }
    monedasMap[cur].count += 1;
    monedasMap[cur].totalOrig += Number(g.montoOriginal || 0);
    monedasMap[cur].totalCOP += Number(g.montoCOP || 0);
  });

  const monedasList = Object.values(monedasMap);

  if (monedasList.length > 0) {
    wsDashboard.addRow([]); // Espacio
    const currTitleRowNumber = wsDashboard.lastRow.number + 1;
    wsDashboard.mergeCells(`A${currTitleRowNumber}:F${currTitleRowNumber}`);
    const currTitle = wsDashboard.getCell(`A${currTitleRowNumber}`);
    currTitle.value = '💱 DESGLOSE Y CONTROL DE DIVISAS UTILIZADAS EN RUTA';
    currTitle.font = FONTS.sectionHeader;
    currTitle.fill = PALETTE.darkHeader;
    currTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    wsDashboard.getRow(currTitleRowNumber).height = 24;

    const currHeaders = [
      'DIVISA / MONEDA',
      'CANTIDAD DE GASTOS',
      'TOTAL EN MONEDA ORIGINAL',
      'TASA DE CAMBIO PROMEDIO',
      'EQUIVALENTE TOTAL (COP)',
      'PARTICIPACIÓN %'
    ];
    const currHeadRow = wsDashboard.addRow(currHeaders);
    currHeadRow.font = FONTS.tableHeader;
    currHeadRow.fill = PALETTE.slateCard;
    currHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
    currHeadRow.height = 22;

    const currStartRowNumber = wsDashboard.lastRow.number + 1;

    monedasList.forEach((m, idx) => {
      const rowNum = currStartRowNumber + idx;
      const tasaPromedio = m.totalOrig > 0 ? (m.totalCOP / m.totalOrig) : 1;
      const pctShare = gastoRealCOP > 0 ? (m.totalCOP / gastoRealCOP) : 0;

      const row = wsDashboard.addRow([
        m.moneda,
        m.count,
        m.totalOrig,
        m.moneda === 'COP' ? '1:1 (Moneda Base)' : tasaPromedio,
        m.totalCOP,
        { formula: `E${rowNum}/C5`, result: pctShare }
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(1).font = FONTS.boldText;
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(2).font = FONTS.regularText;
      row.getCell(3).numFmt = m.moneda === 'JPY' || m.moneda === 'KRW' ? '#,##0' : '#,##0.00';
      row.getCell(3).alignment = { horizontal: 'right' };
      row.getCell(3).font = FONTS.regularText;

      if (m.moneda === 'COP') {
        row.getCell(4).alignment = { horizontal: 'center' };
        row.getCell(4).font = FONTS.mutedText;
      } else {
        row.getCell(4).numFmt = '$#,##0.00';
        row.getCell(4).alignment = { horizontal: 'right' };
        row.getCell(4).font = FONTS.regularText;
      }

      row.getCell(5).numFmt = '$#,##0';
      row.getCell(5).alignment = { horizontal: 'right' };
      row.getCell(5).font = FONTS.boldText;
      row.getCell(6).numFmt = '0.0%';
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(6).font = FONTS.boldText;

      if (idx % 2 === 1) {
        for (let col = 1; col <= 6; col++) {
          row.getCell(col).fill = PALETTE.zebraLight;
        }
      }

      for (let col = 1; col <= 6; col++) {
        row.getCell(col).border = BORDERS.thinSlate;
      }
    });
  }

  // =========================================================================
  // HOJA 2: 💳 DESGLOSE DE GASTOS Y TRANSACCIONES
  // =========================================================================
  const wsGastos = workbook.addWorksheet('💳 Desglose de Gastos', {
    views: [{ showGridLines: true }]
  });

  // Título de la Hoja de Gastos
  wsGastos.mergeCells('A1:K1');
  const gTitle = wsGastos.getCell('A1');
  gTitle.value = `BITÁCORA CONTABLE - REGISTRO DETALLADO DE TRANSACCIONES (${safeGastos.length} REGISTROS)`;
  gTitle.font = FONTS.titleMain;
  gTitle.fill = PALETTE.darkHeader;
  gTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsGastos.getRow(1).height = 32;

  // Subtítulo con instrucciones y filtros
  wsGastos.mergeCells('A2:K2');
  const gSub = wsGastos.getCell('A2');
  gSub.value = '💡 Tip: Puedes utilizar las flechas de filtro de cada columna para segmentar por Categoría, Divisa o Modalidad de pago.';
  gSub.font = FONTS.titleSub;
  gSub.fill = PALETTE.slateCard;
  gSub.alignment = { vertical: 'middle', horizontal: 'center' };
  wsGastos.getRow(2).height = 20;

  // Cabecera de columnas de gastos
  const gastosHeaders = [
    '#',
    'FECHA GASTO',
    'CONCEPTO / DESCRIPCIÓN',
    'CATEGORÍA',
    'MONTO ORIGINAL',
    'DIVISA',
    'TASA DE CAMBIO (COP)',
    'EQUIVALENTE (COP)',
    'REF. USD',
    'MODALIDAD / TIPO',
    'COMPUTABLE'
  ];

  const gHeadRow = wsGastos.addRow(gastosHeaders);
  gHeadRow.font = FONTS.tableHeader;
  gHeadRow.fill = PALETTE.cardHeader;
  gHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
  gHeadRow.height = 24;

  // Filas individuales de transacciones
  safeGastos.forEach((g, idx) => {
    const rowIdx = gastosStartRow + idx;
    const origCurr = (g.monedaOriginal || monedaBase).toUpperCase();
    const rate = Number(g.tasaCambioFecha) || (g.montoOriginal > 0 && g.montoCOP > 0 ? (g.montoCOP / g.montoOriginal) : 1);
    const montoOrig = Number(g.montoOriginal || 0);
    const montoCOP = Number(g.montoCOP || 0);
    const montoUSD = Number(g.montoUSD || 0);

    // Estandarización de categoría para que coincida con el SUMIFS del semáforo
    const rawCat = (g.categoria || 'OTROS').toUpperCase();
    const catClean = rawCat.includes('TRANS') || rawCat.includes('VUEL') ? 'TRANSPORTE'
      : rawCat.includes('ALOJ') || rawCat.includes('HOTEL') ? 'ALOJAMIENTO'
      : rawCat.includes('COMID') || rawCat.includes('ALIMENT') || rawCat.includes('REST') ? 'COMIDA'
      : rawCat.includes('ACTIV') || rawCat.includes('TOUR') || rawCat.includes('ENTRAD') ? 'ACTIVIDADES'
      : rawCat.includes('COMPR') || rawCat.includes('SHOP') ? 'COMPRAS'
      : 'OTROS';

    const tipoStr = g.pagadoAdelantado
      ? 'Costo Hundido (Adelantado)'
      : (g.noComputar ? 'Encargo (Terceros)' : (g.esIngreso ? 'Reembolso / Tax-Free' : 'Consumo en Ruta'));

    const computableStr = g.noComputar ? 'NO (Excluido)' : 'SÍ';

    // Fórmula para total en COP si no es moneda base: Monto Original * Tasa
    const formulaCOP = origCurr === 'COP'
      ? montoOrig
      : { formula: `E${rowIdx}*G${rowIdx}`, result: montoCOP };

    const row = wsGastos.addRow([
      idx + 1,
      g.fechaGasto ? new Date(g.fechaGasto).toLocaleDateString('es-CO') : '',
      g.concepto || 'Sin concepto',
      catClean,
      montoOrig,
      origCurr,
      rate,
      formulaCOP,
      montoUSD,
      tipoStr,
      computableStr
    ]);

    row.height = 20;
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(1).font = FONTS.mutedText;

    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(2).font = FONTS.regularText;

    row.getCell(3).font = FONTS.boldText;

    row.getCell(4).alignment = { horizontal: 'center' };
    row.getCell(4).font = FONTS.boldText;

    row.getCell(5).numFmt = origCurr === 'JPY' || origCurr === 'KRW' ? '#,##0' : '#,##0.00';
    row.getCell(5).alignment = { horizontal: 'right' };
    row.getCell(5).font = FONTS.regularText;

    row.getCell(6).alignment = { horizontal: 'center' };
    row.getCell(6).font = FONTS.boldText;

    row.getCell(7).numFmt = '$#,##0.00';
    row.getCell(7).alignment = { horizontal: 'right' };
    row.getCell(7).font = FONTS.regularText;

    row.getCell(8).numFmt = '$#,##0';
    row.getCell(8).alignment = { horizontal: 'right' };
    row.getCell(8).font = FONTS.boldText;

    row.getCell(9).numFmt = '$#,##0.00';
    row.getCell(9).alignment = { horizontal: 'right' };
    row.getCell(9).font = FONTS.mutedText;

    row.getCell(10).alignment = { horizontal: 'center' };
    row.getCell(10).font = FONTS.regularText;

    row.getCell(11).alignment = { horizontal: 'center' };
    row.getCell(11).font = g.noComputar ? { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFDC2626' } } : FONTS.regularText;

    // Alternancia de colores sutil (zebra)
    if (idx % 2 === 1) {
      for (let c = 1; c <= 11; c++) {
        row.getCell(c).fill = PALETTE.zebraLight;
      }
    }

    for (let c = 1; c <= 11; c++) {
      row.getCell(c).border = BORDERS.thinSlate;
    }
  });

  // Fila de TOTALES de Gastos con Fórmulas nativas
  if (safeGastos.length > 0) {
    const totalGastosRow = wsGastos.addRow([
      'TOTAL',
      `${safeGastos.length} transacciones`,
      '',
      '',
      '',
      '',
      'SUMA TOTAL:',
      { formula: `SUM(H${gastosStartRow}:H${gastosEndRow})`, result: gastoRealCOP },
      { formula: `SUM(I${gastosStartRow}:I${gastosEndRow})`, result: Number(balance?.totalGastadoUSD || 0) },
      '',
      ''
    ]);

    totalGastosRow.height = 26;
    totalGastosRow.fill = PALETTE.darkHeader;
    totalGastosRow.getCell(1).font = FONTS.totalLabel;
    totalGastosRow.getCell(1).alignment = { horizontal: 'center' };
    totalGastosRow.getCell(2).font = FONTS.titleSub;
    totalGastosRow.getCell(7).font = FONTS.totalLabel;
    totalGastosRow.getCell(7).alignment = { horizontal: 'right' };
    totalGastosRow.getCell(8).numFmt = '$#,##0';
    totalGastosRow.getCell(8).font = FONTS.totalLabel;
    totalGastosRow.getCell(8).alignment = { horizontal: 'right' };
    totalGastosRow.getCell(9).numFmt = '$#,##0.00';
    totalGastosRow.getCell(9).font = FONTS.totalLabel;
    totalGastosRow.getCell(9).alignment = { horizontal: 'right' };

    for (let c = 1; c <= 11; c++) {
      totalGastosRow.getCell(c).border = BORDERS.totalDouble;
    }
  }

  // Activar AutoFiltro nativo de Excel en la fila de cabeceras
  wsGastos.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: 11 }
  };

  // Anchos de columna optimizados para Hoja de Gastos
  wsGastos.getColumn(1).width = 6;   // #
  wsGastos.getColumn(2).width = 14;  // Fecha
  wsGastos.getColumn(3).width = 38;  // Concepto
  wsGastos.getColumn(4).width = 18;  // Categoría
  wsGastos.getColumn(5).width = 18;  // Monto Original
  wsGastos.getColumn(6).width = 10;  // Divisa
  wsGastos.getColumn(7).width = 22;  // Tasa de cambio
  wsGastos.getColumn(8).width = 24;  // Equivalente COP
  wsGastos.getColumn(9).width = 16;  // Ref USD
  wsGastos.getColumn(10).width = 26; // Modalidad
  wsGastos.getColumn(11).width = 16; // Computable

  // =========================================================================
  // HOJA 3: 🗓️ ITINERARIO Y LOGÍSTICA DE VIAJE
  // =========================================================================
  if (safeEventos.length > 0) {
    const wsItin = workbook.addWorksheet('🗓️ Itinerario y Logística', {
      views: [{ showGridLines: true }]
    });

    wsItin.mergeCells('A1:J1');
    const iTitle = wsItin.getCell('A1');
    iTitle.value = `CRONOGRAMA Y LOGÍSTICA DEL VIAJE (${safeEventos.length} ACTIVIDADES / EVENTOS)`;
    iTitle.font = FONTS.titleMain;
    iTitle.fill = PALETTE.darkHeader;
    iTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    wsItin.getRow(1).height = 32;

    const itinHeaders = [
      '#',
      'FECHA / HORA INICIO',
      'FECHA / HORA FIN',
      'ACTIVIDAD / EVENTO',
      'TIPO',
      'UBICACIÓN / CIUDAD',
      'ORIGEN ➔ DESTINO / RUTA',
      'COSTO ASOCIADO',
      'DIVISA',
      'NOTAS / OBSERVACIONES'
    ];

    const iHeadRow = wsItin.addRow(itinHeaders);
    iHeadRow.font = FONTS.tableHeader;
    iHeadRow.fill = PALETTE.cardHeader;
    iHeadRow.alignment = { vertical: 'middle', horizontal: 'center' };
    iHeadRow.height = 24;

    safeEventos.forEach((ev, idx) => {
      const rutaStr = (ev.ciudadOrigen || ev.aeropuertoOrigen || ev.ciudadDestino || ev.aeropuertoDestino)
        ? `${ev.aeropuertoOrigen || ev.ciudadOrigen || 'Origen'} ➔ ${ev.tieneConexion && ev.aeropuertoConexion ? `(Escala ${ev.aeropuertoConexion}) ➔ ` : ''}${ev.aeropuertoDestino || ev.ciudadDestino || 'Destino'}`
        : '-';

      const costoNum = Number(ev.costo) || 0;

      const row = wsItin.addRow([
        idx + 1,
        ev.fechaInicio ? new Date(ev.fechaInicio).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '',
        ev.fechaFin ? new Date(ev.fechaFin).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '',
        ev.titulo || 'Sin título',
        (ev.tipo || 'OTRO').toUpperCase(),
        ev.ubicacion || '-',
        rutaStr,
        costoNum,
        ev.moneda || monedaBase,
        ev.notas || ''
      ]);

      row.height = 20;
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(1).font = FONTS.mutedText;

      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(2).font = FONTS.regularText;

      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(3).font = FONTS.regularText;

      row.getCell(4).font = FONTS.boldText;

      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(5).font = FONTS.boldText;

      row.getCell(6).font = FONTS.regularText;
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(7).font = FONTS.regularText;

      row.getCell(8).numFmt = costoNum > 0 ? '$#,##0' : '@';
      row.getCell(8).alignment = { horizontal: 'right' };
      row.getCell(8).font = costoNum > 0 ? FONTS.boldText : FONTS.mutedText;

      row.getCell(9).alignment = { horizontal: 'center' };
      row.getCell(9).font = FONTS.boldText;

      row.getCell(10).font = FONTS.mutedText;

      if (idx % 2 === 1) {
        for (let c = 1; c <= 10; c++) {
          row.getCell(c).fill = PALETTE.zebraLight;
        }
      }

      for (let c = 1; c <= 10; c++) {
        row.getCell(c).border = BORDERS.thinSlate;
      }
    });

    // Activar AutoFiltro nativo en Itinerario
    wsItin.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: 10 }
    };

    // Anchos de columna Hoja Itinerario
    wsItin.getColumn(1).width = 6;   // #
    wsItin.getColumn(2).width = 20;  // Fecha Inicio
    wsItin.getColumn(3).width = 20;  // Fecha Fin
    wsItin.getColumn(4).width = 36;  // Actividad
    wsItin.getColumn(5).width = 16;  // Tipo
    wsItin.getColumn(6).width = 28;  // Ubicación
    wsItin.getColumn(7).width = 36;  // Ruta
    wsItin.getColumn(8).width = 18;  // Costo
    wsItin.getColumn(9).width = 10;  // Divisa
    wsItin.getColumn(10).width = 40; // Notas
  }

  // =========================================================================
  // GENERAR ARCHIVO Y DESCARGAR EN NAVEGADOR
  // =========================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const destinoSanitizado = (viaje?.destino || 'Viaje').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const fechaHoy = new Date().toISOString().split('T')[0];
  const filename = `Reporte_Ejecutivo_${destinoSanitizado}_${fechaHoy}.xlsx`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
