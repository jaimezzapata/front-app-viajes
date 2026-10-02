import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Tag,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Coins,
  RefreshCw
} from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import {
  CURRENCY_MAP,
  formatCurrencyDisplay,
  getOtherCurrenciesConversions,
  syncLiveCurrencyRates,
  getLiveRatesInfo
} from '../../../utils/currencies';
import { cleanCountryText } from '../../../utils/countries';

export function BilleteraView({
  activeViaje,
  gastos = [],
  onAddGasto,
  onOpenNuevoViaje,
  monedaBase = 'COP'
}) {
  const [expandedGastoId, setExpandedGastoId] = useState(null);
  const [showAllConversionsGlobal, setShowAllConversionsGlobal] = useState(false);
  const [ratesInfo, setRatesInfo] = useState(getLiveRatesInfo());
  const [syncingRates, setSyncingRates] = useState(false);

  React.useEffect(() => {
    syncLiveCurrencyRates().then(setRatesInfo);
    const handleUpdate = (e) => {
      if (e.detail) setRatesInfo(e.detail);
    };
    window.addEventListener('currency-rates-updated', handleUpdate);
    return () => window.removeEventListener('currency-rates-updated', handleUpdate);
  }, []);

  const handleSyncRates = async () => {
    setSyncingRates(true);
    try {
      const updated = await syncLiveCurrencyRates();
      setRatesInfo(updated);
    } finally {
      setSyncingRates(false);
    }
  };
  if (!activeViaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={Wallet} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#00FF85]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#00FF85] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">Billetera</h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <Wallet className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">No hay viajes registrados</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Para registrar gastos en multidivisa y costos en ruta, primero debes crear un viaje en la base de datos.
          </p>
          {onOpenNuevoViaje && (
            <button
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
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
      {/* Marca de agua sólida */}
      <WatermarkIcon icon={Wallet} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#00FF85]" />

      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00FF85] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Billetera
            </h2>
            {activeViaje?.destino && (
              <span className="text-xs sm:text-sm font-semibold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/20 px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-md">
                {cleanCountryText(activeViaje.destino)}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-[#8492A6] m-0">
            Registro ágil en <strong>COP, EUR, KRW, JPY, AED</strong> con conversión automática instantánea.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Botón sincronizar tasas de la API */}
          <button
            onClick={handleSyncRates}
            disabled={syncingRates}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85]/40 text-[#8492A6] hover:text-[#00FF85] transition-all cursor-pointer"
            title="Sincronizar tipos de cambio en tiempo real desde la API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingRates ? 'animate-spin text-[#00FF85]' : 'text-[#00FF85]'}`} />
            <span>{syncingRates ? 'Actualizando API...' : 'Tasas API en Vivo'}</span>
          </button>

          {gastos.length > 0 && (
            <button
              onClick={() => setShowAllConversionsGlobal(!showAllConversionsGlobal)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showAllConversionsGlobal
                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                  : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
              title="Mostrar u ocultar conversiones de todas las monedas del viaje"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{showAllConversionsGlobal ? 'Ocultar Multidivisas' : 'Ver Todas las Divisas'}</span>
            </button>
          )}

          <button
            onClick={onAddGasto}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Registrar Gasto
          </button>
        </div>
      </div>

      {/* Lista de Transacciones */}
      {gastos.length === 0 ? (
        <div className="p-10 rounded-xl bg-[#0E121B] border border-[#1C2436] text-center relative z-10">
          <Wallet className="w-10 h-10 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold text-[#F1F5F9]">No hay gastos registrados aún</p>
          <p className="text-xs text-[#8492A6] mt-1">Usa el botón para añadir consumos en cualquiera de las monedas de tu viaje.</p>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {gastos.map((g) => {
            const isIngreso = g.esIngreso;
            const isAdelantado = g.pagadoAdelantado;
            const isTerceros = g.noComputar;
            const currMeta = CURRENCY_MAP[(g.monedaOriginal || 'COP').toUpperCase()] || {};
            const isExpanded = showAllConversionsGlobal || expandedGastoId === g.id;
            const otherConversions = getOtherCurrenciesConversions(g.montoOriginal, g.monedaOriginal);

            return (
              <div
                key={g.id}
                className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85]/30 transition-all overflow-hidden flex flex-col gap-3"
              >
                <WatermarkIcon icon={Tag} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.02]" color="text-[#00FF85]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isIngreso
                          ? 'bg-[#00FF85]/10 border-[#00FF85] text-[#00FF85]'
                          : 'bg-[#151B27] border-[#1C2436] text-[#F1F5F9]'
                      }`}
                    >
                      {isIngreso ? (
                        <ArrowDownLeft className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{g.concepto}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8492A6] bg-[#151B27] px-1.5 py-0.5 rounded border border-[#1C2436]">
                          {g.categoria}
                        </span>
                        <span className="text-[11px] text-[#8492A6] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8492A6]" />
                          {new Date(g.fechaGasto).toLocaleDateString()}
                        </span>
                        {/* Indicador de divisa original */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                          <span>{currMeta.flag || '💱'}</span>
                          <span>{g.monedaOriginal}</span>
                        </span>
                      </div>

                      {/* Chips de reglas de negocio especiales (RF 3.2) */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {isAdelantado && (
                          <span className="text-[10px] font-bold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/30 px-1.5 py-0.2 rounded">
                            Costo Hundido (Adelantado)
                          </span>
                        )}
                        {isTerceros && (
                          <span className="text-[10px] font-bold text-[#B55FE6] bg-[#B55FE6]/10 border border-[#B55FE6]/30 px-1.5 py-0.2 rounded">
                            Encargo (No Computa)
                          </span>
                        )}
                        {isIngreso && (
                          <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/30 px-1.5 py-0.2 rounded">
                            Reembolso / Tax-Free
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resumen Monetario y Botón de Conversión */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1C2436]">
                    <div>
                      {/* Moneda Original Registrada */}
                      <p className="text-base font-extrabold text-[#F1F5F9] m-0 text-left sm:text-right">
                        {isIngreso ? '+' : ''}{formatCurrencyDisplay(g.montoOriginal, g.monedaOriginal, true)}
                      </p>
                      {/* Equivalencia en Pesos Colombianos */}
                      <p className="text-xs font-semibold text-[#00FF85] m-0 mt-0.5 text-left sm:text-right">
                        ≈ $ {Math.round(g.montoCOP || 0).toLocaleString()} COP
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedGastoId(expandedGastoId === g.id ? null : g.id)}
                      className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#00E5FF] hover:underline cursor-pointer bg-[#151B27] px-2 py-1 rounded border border-[#1C2436]"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>{isExpanded ? 'Ocultar divisas' : 'Ver otras monedas'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Panel expandible con las otras monedas del viaje */}
                {isExpanded && (
                  <div className="p-2.5 rounded-lg bg-[#151B27]/90 border border-[#1C2436] space-y-1.5 relative z-10 animate-in fade-in duration-200">
                    <span className="text-[10px] font-semibold text-[#8492A6] uppercase tracking-wider block">
                      Equivalencia en las monedas de tu viaje:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {otherConversions.map((conv) => (
                        <div
                          key={conv.code}
                          className="p-1.5 rounded bg-[#0E121B] border border-[#1C2436] flex flex-col"
                        >
                          <span className="text-[10px] text-[#8492A6] flex items-center gap-1">
                            <span>{conv.flag}</span>
                            <span className="font-bold text-[#F1F5F9]">{conv.code}</span>
                          </span>
                          <span className="text-xs font-bold text-[#00FF85] mt-0.5 truncate">
                            {conv.shortDisplay}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) en Móvil (Thumb-zone RF 2 & REGLAS 1.5) */}
      <button
        onClick={onAddGasto}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#00FF85] text-[#080A0F] flex items-center justify-center shadow-xl active:scale-95 transition-transform border-2 border-[#080A0F]"
        title="Registrar Gasto Rápido"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </button>
    </div>
  );
}

export default BilleteraView;
