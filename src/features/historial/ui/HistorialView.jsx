import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  FileDown,
  FileSpreadsheet,
  Download,
  Search,
  LogIn,
  LogOut,
  PlusCircle,
  Edit2,
  Trash2,
  TrendingUp,
  RotateCcw,
  Calendar,
  User,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import WatermarkIcon from '../../../components/WatermarkIcon';
import {
  getAuditLogs,
  clearAuditLogs,
  formatAuditDateTime,
  exportAuditLogsPdf,
  exportAuditLogsExcel,
  exportAuditLogsCsv
} from '../../../utils/auditLog';

const ACCION_STYLE = {
  login: { label: 'Inicio Sesión', Icon: LogIn, badge: 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]' },
  logout: { label: 'Cierre Sesión', Icon: LogOut, badge: 'bg-[#8492A6]/15 border-[#8492A6]/40 text-[#8492A6]' },
  crear: { label: 'Creación', Icon: PlusCircle, badge: 'bg-[#00FF85]/15 border-[#00FF85]/40 text-[#00FF85]' },
  editar: { label: 'Edición', Icon: Edit2, badge: 'bg-[#FFE500]/15 border-[#FFE500]/40 text-[#FFE500]' },
  eliminar: { label: 'Eliminación', Icon: Trash2, badge: 'bg-[#FF2E55]/15 border-[#FF2E55]/40 text-[#FF2E55]' },
  inyectar: { label: 'Inyección', Icon: TrendingUp, badge: 'bg-[#B55FE6]/15 border-[#B55FE6]/40 text-[#B55FE6]' }
};

export function HistorialView({ activeViaje }) {
  const [logs, setLogs] = useState(() => getAuditLogs());
  const [searchText, setSearchText] = useState('');
  const [selectedModulo, setSelectedModulo] = useState('todos');
  const [selectedAccion, setSelectedAccion] = useState('todas');
  const [onlyActiveViaje, setOnlyActiveViaje] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    const syncLogs = () => setLogs(getAuditLogs());
    window.addEventListener('app-viajes-audit-updated', syncLogs);
    window.addEventListener('storage', syncLogs);
    return () => {
      window.removeEventListener('app-viajes-audit-updated', syncLogs);
      window.removeEventListener('storage', syncLogs);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return logs.filter((l) => {
      if (selectedModulo !== 'todos' && l.modulo !== selectedModulo) return false;
      if (selectedAccion !== 'todas' && l.accion !== selectedAccion) return false;
      if (onlyActiveViaje && activeViaje?.id && l.viajeId !== activeViaje.id) return false;

      if (fechaDesde) {
        const d = l.timestamp ? new Date(l.timestamp).setHours(0, 0, 0, 0) : 0;
        const fd = new Date(fechaDesde).setHours(0, 0, 0, 0);
        if (d < fd) return false;
      }
      if (fechaHasta) {
        const d = l.timestamp ? new Date(l.timestamp).setHours(23, 59, 59, 999) : 0;
        const fh = new Date(fechaHasta).setHours(23, 59, 59, 999);
        if (d > fh) return false;
      }

      if (q) {
        const hay = `${l.titulo || ''} ${l.detalle || ''} ${l.viajeTitulo || ''} ${l.usuarioNombre || ''} ${l.usuarioEmail || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, selectedModulo, selectedAccion, onlyActiveViaje, activeViaje?.id, fechaDesde, fechaHasta, searchText]);

  const stats = useMemo(() => {
    return {
      total: filteredLogs.length,
      sesiones: filteredLogs.filter((l) => l.modulo === 'sesion').length,
      compras: filteredLogs.filter((l) => l.modulo === 'billetera' && l.accion === 'crear').length,
      cambios: filteredLogs.filter((l) => l.accion === 'editar' || l.accion === 'eliminar').length
    };
  }, [filteredLogs]);

  const filterSummary = useMemo(() => {
    const parts = [];
    if (selectedModulo !== 'todos') parts.push(`Módulo: ${selectedModulo}`);
    if (selectedAccion !== 'todas') parts.push(`Acción: ${selectedAccion}`);
    if (onlyActiveViaje && activeViaje?.titulo) parts.push(`Viaje: ${activeViaje.titulo}`);
    if (fechaDesde || fechaHasta) parts.push(`Fechas: ${fechaDesde || '*'} a ${fechaHasta || '*'}`);
    if (searchText.trim()) parts.push(`"${searchText.trim()}"`);
    return parts.join(' • ');
  }, [selectedModulo, selectedAccion, onlyActiveViaje, activeViaje?.titulo, fechaDesde, fechaHasta, searchText]);

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedModulo('todos');
    setSelectedAccion('todas');
    setOnlyActiveViaje(false);
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleDownloadPdf = () => {
    exportAuditLogsPdf(filteredLogs, filterSummary);
    toast.success('Reporte PDF de auditoría descargado');
  };

  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      await exportAuditLogsExcel(filteredLogs, filterSummary);
      toast.success('Libro Excel de auditoría descargado');
    } catch (err) {
      toast.error('Error al generar Excel: ' + (err.message || ''));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleDownloadCsv = () => {
    exportAuditLogsCsv(filteredLogs);
    toast.success('Archivo CSV de auditoría descargado');
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 space-y-4 w-full max-w-full overflow-hidden">
      <WatermarkIcon icon={History} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#B55FE6]" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B55FE6] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Historial & Auditoría de Movimientos
            </h2>
          </div>
          <p className="text-xs text-[#8492A6] m-0">
            Registro automático de inicios de sesión, compras, creaciones, ediciones, eliminaciones e inyecciones de presupuesto.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={filteredLogs.length === 0}
            className="px-3 py-2 rounded-xl bg-[#FFE500] hover:opacity-90 disabled:opacity-45 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" strokeWidth={2.5} />
            <span>PDF ({filteredLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={exportingExcel || filteredLogs.length === 0}
            className="px-3 py-2 rounded-xl bg-[#00FF85] hover:opacity-90 disabled:opacity-45 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={2.5} />
            <span>{exportingExcel ? 'Generando...' : 'Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={filteredLogs.length === 0}
            className="px-3 py-2 rounded-xl bg-[#151B27] border border-[#00E5FF]/40 hover:border-[#00E5FF] disabled:opacity-45 text-[#00E5FF] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPIs Compactos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
        <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
            Total Eventos
          </span>
          <span className="text-lg font-black font-mono text-[#F1F5F9]">{stats.total}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
            Compras Registradas
          </span>
          <span className="text-lg font-black font-mono text-[#00FF85]">{stats.compras}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
            Sesiones
          </span>
          <span className="text-lg font-black font-mono text-[#00E5FF]">{stats.sesiones}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
            Ediciones / Borrados
          </span>
          <span className="text-lg font-black font-mono text-[#FFE500]">{stats.cambios}</span>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436] relative z-10 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-[#8492A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar movimiento, concepto, compra, usuario..."
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#8492A6] focus:outline-none"
            />
          </div>

          <select
            value={selectedModulo}
            onChange={(e) => setSelectedModulo(e.target.value)}
            className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
          >
            <option value="todos">Todos los Módulos</option>
            <option value="sesion">Sesión (Login / Logout)</option>
            <option value="billetera">Billetera / Compras</option>
            <option value="itinerario">Itinerario / Vuelos</option>
            <option value="presupuesto">Presupuesto / Inyecciones</option>
            <option value="viajes">Viajes</option>
            <option value="checklist">Checklist</option>
          </select>

          <select
            value={selectedAccion}
            onChange={(e) => setSelectedAccion(e.target.value)}
            className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] cursor-pointer"
          >
            <option value="todas">Todas las Acciones</option>
            <option value="crear">Creación / Compra</option>
            <option value="editar">Edición</option>
            <option value="eliminar">Eliminación</option>
            <option value="inyectar">Inyección Ppto</option>
            <option value="login">Inicio de Sesión</option>
            <option value="logout">Cierre de Sesión</option>
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] rounded-lg px-2 py-1.5 text-[11px] text-[#F1F5F9]"
              title="Desde"
            />
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] rounded-lg px-2 py-1.5 text-[11px] text-[#F1F5F9]"
              title="Hasta"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {activeViaje && (
              <label className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyActiveViaje}
                  onChange={(e) => setOnlyActiveViaje(e.target.checked)}
                  className="rounded border-[#1C2436] bg-[#151B27]"
                />
                <span>Solo viaje activo ({activeViaje.titulo})</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filterSummary && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1 rounded-lg bg-[#151B27] border border-[#1C2436] text-[11px] font-bold text-[#00E5FF] cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar filtros</span>
              </button>
            )}
            {logs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearAuditLogs();
                  toast.info('Historial de auditoría limpiado');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FF2E55]/10 border border-[#FF2E55]/30 text-[11px] font-bold text-[#FF2E55] cursor-pointer"
              >
                Limpiar historial
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista / Tabla de Auditoría */}
      {filteredLogs.length === 0 ? (
        <div className="p-10 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <History className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-[#F1F5F9] m-0">
            No hay movimientos registrados con los filtros actuales
          </p>
          <p className="text-xs text-[#8492A6] m-0 mt-1">
            Cada inicio de sesión, compra, edición o eliminación que realices quedará registrada aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {/* Tarjetas Móviles (< md) */}
          <div className="md:hidden space-y-2.5">
            {filteredLogs.map((log) => {
              const cfg = ACCION_STYLE[log.accion] || ACCION_STYLE.crear;
              const ActionIcon = cfg.Icon;
              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cfg.badge}`}>
                        <ActionIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#CBD5E1]">
                        {log.modulo}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#00E5FF] shrink-0">
                      {formatAuditDateTime(log.timestamp)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#F1F5F9] m-0">{log.titulo}</p>
                    {(log.detalle || log.viajeTitulo) && (
                      <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                        {log.viajeTitulo ? `[${log.viajeTitulo}] ` : ''}
                        {log.detalle}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#1C2436]/60 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                    <div className="flex items-center gap-2 text-[#8492A6]">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.usuarioEmail || log.usuarioNombre || '-'}
                      </span>
                      {log.fechaReferencia && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {String(log.fechaReferencia).split('T')[0]}
                        </span>
                      )}
                    </div>
                    {log.montoCOP !== null && log.montoCOP !== undefined && (
                      <span className="font-mono font-bold text-[#00FF85]">
                        $ {Math.round(log.montoCOP).toLocaleString('es-CO')} COP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabla Desktop (>= md) */}
          <div className="hidden md:block rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C2436] bg-[#151B27] text-[10px] font-bold uppercase tracking-wider text-[#8492A6]">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Módulo</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Movimiento / Detalle</th>
                  <th className="py-2.5 px-3">Fecha Compra / Ref.</th>
                  <th className="py-2.5 px-3 text-right">Valor (COP)</th>
                  <th className="py-2.5 px-3">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2436]/60">
                {filteredLogs.map((log) => {
                  const cfg = ACCION_STYLE[log.accion] || ACCION_STYLE.crear;
                  const ActionIcon = cfg.Icon;
                  return (
                    <tr key={log.id} className="hover:bg-[#151B27]/60 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#00E5FF]">
                        {formatAuditDateTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#CBD5E1]">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cfg.badge}`}>
                          <ActionIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-md">
                        <p className="font-bold text-[#F1F5F9] m-0">{log.titulo}</p>
                        {(log.detalle || log.viajeTitulo) && (
                          <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                            {log.viajeTitulo ? `[${log.viajeTitulo}] ` : ''}
                            {log.detalle}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#8492A6]">
                        {log.fechaReferencia ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {String(log.fechaReferencia).split('T')[0]}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-[#00FF85]">
                        {log.montoCOP !== null && log.montoCOP !== undefined
                          ? `$ ${Math.round(log.montoCOP).toLocaleString('es-CO')}`
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-[#8492A6]">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.usuarioEmail || log.usuarioNombre || '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialView;
