import React, { useState, useMemo } from 'react';
import {
  Eye,
  Plane,
  Building,
  Utensils,
  Camera,
  ShoppingBag,
  Tag,
  CreditCard,
  Calendar,
  AlertCircle,
  Settings2
} from 'lucide-react';
import Modal from '../../../../components/Modal';
import MiniFlag from '../../../../components/MiniFlag';
import { cleanCountryText } from '../../../../utils/countries';
import { formatCurrencyDisplay } from '../../../../utils/currencies';

const CATEGORIA_ICONS = {
  transporte: Plane,
  vuelo: Plane,
  alojamiento: Building,
  hotel: Building,
  comida: Utensils,
  actividades: Camera,
  tour: Camera,
  compras: ShoppingBag,
  otros: Tag
};

export function BalanceSemaforoCard({
  displayBalance,
  hasActiveFilters,
  gastos = [],
  onOpenConfigPresupuesto
}) {
  const [modalCategoria, setModalCategoria] = useState(null);

  const categoriasList = displayBalance?.semaforoCategorias || [];

  const activeCategoryData = useMemo(() => {
    if (!modalCategoria) return null;
    return (
      categoriasList.find(
        (c) => c.categoria?.toLowerCase() === modalCategoria.toLowerCase()
      ) || { categoria: modalCategoria, consumidoCOP: 0, limiteCOP: 0, porcentaje: 0, color: 'verde' }
    );
  }, [modalCategoria, categoriasList]);

  const categoryGastos = useMemo(() => {
    if (!modalCategoria) return [];
    const target = modalCategoria.toLowerCase();
    return (gastos || []).filter((g) => {
      const cat = (g.categoria || 'otros').toLowerCase();
      return cat === target;
    });
  }, [modalCategoria, gastos]);

  const categoryTotals = useMemo(() => {
    let cop = 0;
    let usd = 0;
    categoryGastos.forEach((g) => {
      cop += Number(g.montoCOP) || 0;
      usd += Number(g.montoUSD) || 0;
    });
    return { cop, usd };
  }, [categoryGastos]);

  return (
    <>
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider m-0 flex items-center gap-2">
              <span>Semáforo de Presupuesto por Categoría</span>
            </h3>
            <span className="text-[10px] text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 flex items-center gap-1">
              <Eye className="w-2.5 h-2.5" />
              Haz clic en una categoría para ver sus gastos
            </span>
            {hasActiveFilters && (
              <span className="text-[10px] text-[#FFE500] font-semibold bg-[#FFE500]/10 px-2 py-0.5 rounded border border-[#FFE500]/20">
                Calculado sobre selección
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onOpenConfigPresupuesto && (
              <button
                type="button"
                onClick={onOpenConfigPresupuesto}
                className="text-[11px] font-bold text-[#00FF85] bg-[#00FF85]/10 hover:bg-[#00FF85]/20 border border-[#00FF85]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                title="Modificar presupuesto total, porcentajes por categoría o agregar categorías"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Configurar % y Categorías</span>
              </button>
            )}
            <span className="text-xs text-[#8492A6]">
              Consumido: <strong className="text-[#F1F5F9]">{displayBalance?.porcentajeConsumido || 0}%</strong>
            </span>
          </div>
        </div>

        {categoriasList.length > 0 ? (
          <div className="space-y-2.5">
            {categoriasList.map((cat) => {
              const Icon = CATEGORIA_ICONS[cat.categoria?.toLowerCase()] || Tag;
              const barColor =
                cat.color === 'rojo'
                  ? 'bg-[#FF2E55]'
                  : cat.color === 'amarillo'
                  ? 'bg-[#FFE500]'
                  : 'bg-[#00FF85]';

              return (
                <button
                  key={cat.categoria}
                  type="button"
                  onClick={() => setModalCategoria(cat.categoria)}
                  title={`Ver gastos de ${cat.categoria} en ventana modal`}
                  className="w-full text-left p-2.5 rounded-xl border bg-[#111622]/60 border-[#1C2436]/70 hover:bg-[#151B27] hover:border-[#00E5FF]/60 transition-all cursor-pointer space-y-1.5 block group"
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                      <span className="font-bold uppercase tracking-wider text-[#F1F5F9] group-hover:text-[#00E5FF] transition-colors">
                        {cat.categoria}
                      </span>
                      {cat.porcentajeAsignado !== undefined && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#151B27] border border-[#1C2436] text-[#8492A6]">
                          {cat.porcentajeAsignado}% del ppto
                        </span>
                      )}
                      <span className="text-[10px] text-[#8492A6] group-hover:text-[#00E5FF] transition-colors hidden sm:inline">
                        • Ver detalle
                      </span>
                    </div>
                    <span className="text-[#8492A6]">
                      <strong className="text-[#F1F5F9]">$ {Math.round(cat.consumidoCOP).toLocaleString()}</strong>
                      {cat.limiteCOP > 0 && ` / $ ${Math.round(cat.limiteCOP).toLocaleString()}`}
                      <span
                        className={`ml-2 font-bold ${
                          cat.color === 'rojo'
                            ? 'text-[#FF2E55]'
                            : cat.color === 'amarillo'
                            ? 'text-[#FFE500]'
                            : 'text-[#00FF85]'
                        }`}
                      >
                        ({cat.porcentaje}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#151B27] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(cat.porcentaje || 0, 100)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#8492A6] m-0">No hay categorías configuradas aún.</p>
        )}
      </div>

      {/* Modal de Gastos por Categoría */}
      <Modal
        isOpen={Boolean(modalCategoria)}
        onClose={() => setModalCategoria(null)}
        title={`Gastos de Categoría: ${(modalCategoria || '').toUpperCase()}`}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-[#8492A6]">
              Total en <strong className="text-[#F1F5F9] uppercase">{modalCategoria}</strong>:{' '}
              <strong className="text-[#00FF85] font-mono">
                $ {Math.round(categoryTotals.cop).toLocaleString()} COP
              </strong>{' '}
              <span className="font-mono">(~${categoryTotals.usd.toFixed(2)} USD)</span>
            </div>
            <button
              type="button"
              onClick={() => setModalCategoria(null)}
              className="px-4 py-2 rounded-lg bg-[#151B27] hover:bg-[#1E2738] border border-[#1C2436] text-[#F1F5F9] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Resumen superior de la categoría */}
          {activeCategoryData && (
            <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const ModalIcon = CATEGORIA_ICONS[modalCategoria?.toLowerCase()] || Tag;
                  return (
                    <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
                      <ModalIcon className="w-5 h-5" />
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#F1F5F9] m-0">
                      {modalCategoria}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0E121B] border border-[#1C2436] text-[#00E5FF] font-bold">
                      {categoryGastos.length} {categoryGastos.length === 1 ? 'registro' : 'registros'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8492A6] m-0 mt-0.5">
                    Representa el <strong className="text-[#F1F5F9]">{activeCategoryData.porcentaje}%</strong> del consumo total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/30 px-2.5 py-1 rounded-lg font-mono">
                  $ {Math.round(categoryTotals.cop).toLocaleString()} COP
                </span>
                <span className="text-xs font-bold text-[#8492A6] bg-[#0E121B] border border-[#1C2436] px-2.5 py-1 rounded-lg font-mono">
                  ~${categoryTotals.usd.toFixed(2)} USD
                </span>
              </div>
            </div>
          )}

          {/* Lista / Tabla de gastos de la categoría */}
          {categoryGastos.length === 0 ? (
            <div className="p-8 text-center bg-[#151B27]/40 rounded-xl border border-dashed border-[#1C2436]">
              <AlertCircle className="w-8 h-8 text-[#8492A6] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#F1F5F9] m-0">
                No hay gastos registrados en {(modalCategoria || '').toUpperCase()}
              </p>
              <p className="text-xs text-[#8492A6] mt-1 m-0">
                Aún no se han registrado pagos asociados a esta categoría.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Tabla Desktop */}
              <table className="w-full text-left text-xs border-collapse hidden sm:table">
                <thead>
                  <tr className="border-b border-[#1C2436] text-[11px] font-bold uppercase tracking-wider text-[#8492A6] bg-[#151B27]/60">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Concepto / Comercio</th>
                    <th className="py-2.5 px-3">TC / Medio</th>
                    <th className="py-2.5 px-3">Destino</th>
                    <th className="py-2.5 px-3">Modalidad</th>
                    <th className="py-2.5 px-3 text-right">Monto Original</th>
                    <th className="py-2.5 px-3 text-right">Subtotal COP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2436]/60">
                  {categoryGastos.map((g) => {
                    const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
                    const dateStr = g.fechaGasto
                      ? new Date(g.fechaGasto).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '-';

                    return (
                      <tr key={g.id} className="hover:bg-[#151B27]/50 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#8492A6] font-medium">
                          {dateStr}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#F1F5F9] max-w-xs truncate" title={g.concepto}>
                          {g.concepto || 'Sin concepto'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {g.tarjetaCredito ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                              <CreditCard className="w-3 h-3 text-[#00E5FF] shrink-0" />
                              <span className="max-w-[120px] truncate">{g.tarjetaCredito}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#8492A6] italic">Efectivo / Sin TC</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1]">
                            <MiniFlag country={g.countryName} code={g.countryCode} className="w-3.5 h-2.5" />
                            <span className="font-medium">
                              {g.cityName
                                ? `${g.cityName}${g.countryName ? `, ${cleanCountryText(g.countryName)}` : ''}`
                                : cleanCountryText(g.countryName)}
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 flex-wrap">
                            {g.pagadoAdelantado ? (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#B55FE6]/15 border border-[#B55FE6]/30 text-[#B55FE6]">
                                Pre-Viaje
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#00FF85]/15 border border-[#00FF85]/30 text-[#00FF85]">
                                En Ruta
                              </span>
                            )}
                            {g.noComputar && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF2E55]/15 border border-[#FF2E55]/30 text-[#FF2E55]">
                                Terceros
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-xs text-[#8492A6]">
                          {formatCurrencyDisplay(g.montoOriginal, origCurr, false)}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-[#00FF85] font-mono text-xs">
                          $ {Math.round(g.montoCOP || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Tarjetas Mobile */}
              <div className="sm:hidden space-y-2.5">
                {categoryGastos.map((g) => {
                  const origCurr = (g.monedaOriginal || 'COP').toUpperCase();
                  const dateStr = g.fechaGasto
                    ? new Date(g.fechaGasto).toLocaleDateString([], { day: 'numeric', month: 'short' })
                    : '-';

                  return (
                    <div key={g.id} className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#F1F5F9] m-0 truncate">{g.concepto || 'Sin concepto'}</p>
                          <p className="text-[10px] text-[#8492A6] m-0 mt-0.5 flex items-center gap-1 flex-wrap">
                            <Calendar className="w-3 h-3 text-[#8492A6]" />
                            <span>{dateStr}</span>
                            <span>•</span>
                            <MiniFlag country={g.countryName} code={g.countryCode} className="w-3 h-2" />
                            <span>
                              {g.cityName
                                ? `${g.cityName}${g.countryName ? `, ${cleanCountryText(g.countryName)}` : ''}`
                                : cleanCountryText(g.countryName)}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-[#00FF85] m-0 font-mono">
                            $ {Math.round(g.montoCOP || 0).toLocaleString()}
                          </p>
                          {origCurr !== 'COP' && (
                            <span className="text-[10px] text-[#8492A6] block font-mono">
                              {formatCurrencyDisplay(g.montoOriginal, origCurr, false)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#1C2436]/60 pt-2 text-[10px] flex-wrap gap-1.5">
                        <div>
                          {g.tarjetaCredito ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
                              <CreditCard className="w-2.5 h-2.5 text-[#00E5FF]" />
                              <span className="max-w-[110px] truncate">{g.tarjetaCredito}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8492A6] italic">Efectivo / Sin TC</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {g.pagadoAdelantado ? (
                            <span className="px-1.5 py-0.5 rounded bg-[#B55FE6]/15 text-[#B55FE6] font-bold uppercase text-[9px]">
                              Pre-Viaje
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-[#00FF85]/15 text-[#00FF85] font-bold uppercase text-[9px]">
                              En Ruta
                            </span>
                          )}
                          {g.noComputar && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FF2E55]/15 text-[#FF2E55] font-bold uppercase text-[9px]">
                              Terceros
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default BalanceSemaforoCard;

