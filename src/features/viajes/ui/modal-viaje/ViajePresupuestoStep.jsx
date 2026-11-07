import React from 'react';
import { DollarSign, Check } from 'lucide-react';
import { CurrencySelector } from '../../../../components/CurrencySelector';
import { cleanCountryText } from '../../../../utils/countries';

export function ViajePresupuestoStep({
  monedaLocal,
  setMonedaLocal,
  presupuestoTotal,
  setPresupuestoTotal,
  destino,
  origen,
  tipoViaje,
  destinosMultidestino,
  fechaInicio,
  fechaFin,
  duracionDias
}) {
  return (
    <div className="space-y-4">
      {/* Selector Dinámico de Moneda de la Ruta */}
      <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
        <CurrencySelector
          value={monedaLocal}
          onChange={(selectedCurr) => setMonedaLocal(selectedCurr)}
          label="Moneda Local Principal"
          viaje={{
            destino,
            origen,
            tipoViaje,
            destinosMultidestino,
            monedaLocal,
            monedaBase: 'COP'
          }}
        />
        <p className="text-[10px] text-[#8492A6] m-0">
          Asignada automáticamente según el país de destino. Puedes cambiarla o seleccionar otra divisa cuando lo requieras.
        </p>
      </div>

      {/* Presupuesto Estimado */}
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-[#FFE500]" />
          Presupuesto Total Estimado (en COP)
        </label>
        <input
          type="number"
          placeholder="Ej. 15000000"
          value={presupuestoTotal}
          onChange={(e) => setPresupuestoTotal(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2.5 text-base font-bold text-[#F1F5F9] focus:outline-none placeholder:text-[#8492A6]/40"
        />
        <span className="text-[10px] text-[#8492A6] block mt-1">
          Puedes dejarlo en blanco o editarlo en cualquier momento desde el Dashboard.
        </span>
      </div>

      {/* Mini Resumen de Configuración */}
      <div className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2 text-xs">
        <span className="font-bold text-[#00FF85] uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
          <Check className="w-3.5 h-3.5" />
          Resumen de Configuración
        </span>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1C2436]">
          <div>
            <span className="text-[#8492A6] block text-[10px] uppercase">Ruta</span>
            <span className="font-bold text-[#F1F5F9] truncate block">
              {origen ? `${cleanCountryText(origen)} ➔ ` : ''}
              {tipoViaje === 'unico' ? (destino ? cleanCountryText(destino) : 'Sin destino') : 'Multidestino'}
            </span>
          </div>
          <div>
            <span className="text-[#8492A6] block text-[10px] uppercase">Fechas</span>
            <span className="font-medium text-[#CBD5E1] block">
              {fechaInicio || '---'} al {fechaFin || '---'} {duracionDias ? `(${duracionDias}d)` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViajePresupuestoStep;

