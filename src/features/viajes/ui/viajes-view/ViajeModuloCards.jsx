import React from 'react';
import {
  Calendar,
  Wallet,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react';

export function ViajeModuloCards({
  currentViaje,
  tripEvents = [],
  tripGastos = [],
  tripMetrics,
  onOpenBitacora,
  onSelectTab,
  onAddEvento,
  onAddGasto
}) {
  return (
    <section className="relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* 1. Módulo Itinerario & Vuelos */}
        <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#00FF85] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-center text-[#00FF85] group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/10 px-2 py-0.5 rounded">
                {tripEvents.length} {tripEvents.length === 1 ? 'actividad' : 'actividades'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#00FF85] transition-colors">
              Itinerario & Vuelos
            </h4>
            <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
              Vuelos, escalas y agenda diaria
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-between gap-1.5">
            {onAddEvento && (
              <button
                type="button"
                onClick={() => onAddEvento()}
                className="text-[11px] font-semibold text-[#00FF85] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Registrar
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenBitacora(currentViaje.id)}
              className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#00FF85] cursor-pointer flex items-center gap-1 ml-auto"
            >
              <span>Abrir</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 2. Módulo Billetera & Gastos */}
        <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#00E5FF] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded">
                {tripGastos.length} {tripGastos.length === 1 ? 'comprobante' : 'comprobantes'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#00E5FF] transition-colors">
              Billetera & Gastos
            </h4>
            <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
              Control de pagos y divisas
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-between gap-1.5">
            {onAddGasto && (
              <button
                type="button"
                onClick={() => onAddGasto()}
                className="text-[11px] font-semibold text-[#00E5FF] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Registrar
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('billetera')}
              className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#00E5FF] cursor-pointer flex items-center gap-1 ml-auto"
            >
              <span>Abrir</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3. Módulo Balance Financiero */}
        <div className="bg-[#0E121B] border border-[#1C2436] hover:border-[#FFE500] rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-[#FFE500] group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tripMetrics.isOverBudget ? 'text-[#FF2E55] bg-[#FF2E55]/10' : 'text-[#FFE500] bg-[#FFE500]/10'}`}>
                {tripMetrics.porcentajePresupuesto}% gastado
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[#F1F5F9] m-0 group-hover:text-[#FFE500] transition-colors">
              Balance Financiero
            </h4>
            <p className="text-[11px] text-[#8492A6] mt-0.5 m-0 line-clamp-1">
              Presupuesto vs ejecución
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-end">
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('balance')}
              className="text-[11px] font-bold text-[#CBD5E1] hover:text-[#FFE500] cursor-pointer flex items-center gap-1"
            >
              <span>Ver Balance</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ViajeModuloCards;

