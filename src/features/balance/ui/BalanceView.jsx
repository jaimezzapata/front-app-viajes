import React from 'react';
import {
  PieChart,
  FileDown,
  TrendingDown,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Coins,
  ArrowRightLeft
} from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import { exportTripPdf } from '../use-cases/exportPdf';
import {
  TRIP_CURRENCIES,
  convertCurrency,
  formatCurrencyDisplay
} from '../../../utils/currencies';
import { cleanCountryText } from '../../../utils/countries';

export function BalanceView({ viaje, onOpenNuevoViaje, balance, gastos = [], eventos = [] }) {
  const handleExport = () => {
    if (!viaje) return;
    exportTripPdf({ viaje, balance, gastos, eventos });
  };

  const semaforoColorClass = {
    verde: 'bg-[#00FF85] text-[#00FF85] border-[#00FF85]',
    amarillo: 'bg-[#FFE500] text-[#FFE500] border-[#FFE500]',
    rojo: 'bg-[#FF2E55] text-[#FF2E55] border-[#FF2E55]'
  };

  if (!viaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={PieChart} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#FFE500]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#FFE500] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">Balance & Dashboard</h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <PieChart className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">No hay viajes registrados</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Para ver el balance presupuestario, distribución de costos y semáforos de gasto, primero crea un viaje en la base de datos.
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
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8 w-full max-w-full overflow-hidden">
      {/* Marca de agua sólida */}
      <WatermarkIcon icon={PieChart} className="w-80 h-80 top-4 right-2 pointer-events-none" opacity="opacity-[0.03]" color="text-[#FFE500]" />

      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FFE500] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Balance & Finanzas
            </h2>
            {viaje?.destino && (
              <span className="text-xs sm:text-sm font-semibold text-[#FFE500] bg-[#FFE500]/10 border border-[#FFE500]/20 px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-md">
                {cleanCountryText(viaje.destino)}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-[#8492A6] m-0">Análisis presupuestario, costos hundidos y semáforo de consumo.</p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFE500] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4" strokeWidth={2.5} />
          Exportar PDF
        </button>
      </div>

      {/* Tarjetas de KPIs Principales (Grid 2x2 en móvil) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 relative z-10">
        {/* Presupuesto Total */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={Banknote} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00E5FF]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">Presupuesto Asignado</p>
          <p className="text-xl font-bold text-[#F1F5F9] mt-1 m-0">
            $ {Math.round(balance?.presupuestoTotalCOP || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#00E5FF] font-medium">{balance?.monedaBase || 'COP'}</span>
        </div>

        {/* Total Gastado Computable */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={TrendingDown} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#00FF85]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">Total Consumido</p>
          <p className="text-xl font-bold text-[#00FF85] mt-1 m-0">
            $ {Math.round(balance?.totalGastadoCOP || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">~${Number(balance?.totalGastadoUSD || 0).toFixed(2)} USD</span>
        </div>

        {/* Dinero Requerido en Ruta (RF 3.2: excluye costos hundidos) */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={CreditCard} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#FFE500]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">Dinero Requerido en Ruta</p>
          <p className="text-xl font-bold text-[#FFE500] mt-1 m-0">
            $ {Math.round(balance?.dineroRequeridoEnRutaCOP || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">Efectivo / Tarjetas durante el viaje</span>
        </div>

        {/* Costos Hundidos (Pagados por adelantado) */}
        <div className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] overflow-hidden">
          <WatermarkIcon icon={ShieldCheck} className="w-24 h-24 -bottom-4 -right-4" opacity="opacity-[0.03]" color="text-[#B55FE6]" />
          <p className="text-[11px] font-semibold text-[#8492A6] uppercase tracking-wider m-0">Costos Hundidos (Adelantados)</p>
          <p className="text-xl font-bold text-[#B55FE6] mt-1 m-0">
            $ {Math.round(balance?.pagadoAdelantadoCOP || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#8492A6] font-medium">Vuelos / Hoteles pre-pagados</span>
        </div>
      </div>

      {/* Multidivisa: Consumo Total en todas las monedas del viaje */}
      <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#00E5FF]" />
            <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider m-0">
              Total Consumido en las Monedas de tu Viaje
            </h3>
          </div>
          <span className="text-[11px] text-[#8492A6]">
            Base Calculada: <strong>$ {Math.round(balance?.totalGastadoCOP || 0).toLocaleString()} COP</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TRIP_CURRENCIES.map((curr) => {
            const amountInCurr = convertCurrency(balance?.totalGastadoCOP || 0, 'COP', curr.code);
            return (
              <div
                key={curr.code}
                className="p-2.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85]/30 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-[#8492A6] mb-1">
                  <span className="flex items-center gap-1 font-bold text-[#F1F5F9]">
                    <span>{curr.flag}</span>
                    <span>{curr.code}</span>
                  </span>
                  <span className="text-[9px] text-[#8492A6]">{curr.symbol}</span>
                </div>
                <p className="text-sm font-extrabold text-[#00FF85] m-0 truncate">
                  {formatCurrencyDisplay(amountInCurr, curr.code, false)}
                </p>
                <span className="text-[9px] text-[#8492A6] block truncate mt-0.5">
                  {curr.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Semáforo de Presupuesto por Categoría (RF 3.2) */}
      <div className="p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider m-0">
            Semáforo de Presupuesto por Categoría
          </h3>
          <span className="text-xs text-[#8492A6]">
            Total Consumido: <strong className="text-[#F1F5F9]">{balance?.porcentajeConsumido || 0}%</strong>
          </span>
        </div>

        {balance?.semaforoCategorias && balance.semaforoCategorias.length > 0 ? (
          <div className="space-y-4">
            {balance.semaforoCategorias.map((cat) => {
              const colorInfo = semaforoColorClass[cat.color] || semaforoColorClass.verde;
              const barColor = cat.color === 'rojo' ? 'bg-[#FF2E55]' : (cat.color === 'amarillo' ? 'bg-[#FFE500]' : 'bg-[#00FF85]');

              return (
                <div key={cat.categoria} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#F1F5F9]">{cat.categoria}</span>
                    <span className="text-[#8492A6]">
                      <strong className="text-[#F1F5F9]">$ {Math.round(cat.consumidoCOP).toLocaleString()}</strong>
                      {cat.limiteCOP > 0 && ` / $ ${Math.round(cat.limiteCOP).toLocaleString()}`}
                      <span className={`ml-2 font-bold ${
                        cat.color === 'rojo' ? 'text-[#FF2E55]' : (cat.color === 'amarillo' ? 'text-[#FFE500]' : 'text-[#00FF85]')
                      }`}>
                        ({cat.porcentaje}%)
                      </span>
                    </span>
                  </div>

                  {/* Barra de progreso sólida (sin gradiente) */}
                  <div className="h-2 rounded-full bg-[#151B27] overflow-hidden">
                    <div
                      className={`h-full ${barColor}`}
                      style={{ width: `${Math.min(cat.porcentaje || 0, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#8492A6] m-0">No hay categorías configuradas aún.</p>
        )}
      </div>
    </div>
  );
}

export default BalanceView;
