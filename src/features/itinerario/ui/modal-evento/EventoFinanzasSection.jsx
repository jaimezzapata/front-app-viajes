import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { CurrencySelector } from '../../../../components/CurrencySelector';

const TC_PRESETS = ['Visa', 'Mastercard', 'Nubank', 'Amex', 'Débito', 'Efectivo'];

export function EventoFinanzasSection({
  moneda,
  setMoneda,
  costo,
  setCosto,
  activeViaje,
  tipo,
  tipoTrayecto,
  tarjetaCredito,
  setTarjetaCredito,
  descontarPresupuesto,
  setDescontarPresupuesto,
  pagadoAdelantado,
  setPagadoAdelantado
}) {
  const isRoundTripFlight = tipo === 'vuelo' && tipoTrayecto === 'round-trip';

  return (
    <div className="p-3 rounded-lg bg-[#151B27] border border-[#1C2436] space-y-3">
      <CurrencySelector
        value={moneda}
        onChange={setMoneda}
        viaje={activeViaje}
        label={isRoundTripFlight ? 'Moneda del Boleto Round-Trip' : 'Moneda del Evento'}
      />

      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          {isRoundTripFlight
            ? 'Costo Total del Tiquete Round-Trip (Ida y Vuelta)'
            : 'Costo (Opcional)'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8492A6] text-xs font-bold">
            $
          </span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder={tipo === 'vuelo' ? 'Ej. 1200' : '0.00'}
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg pl-7 pr-3 py-2 text-sm text-[#F1F5F9] focus:outline-none font-semibold"
          />
        </div>
        {isRoundTripFlight && (
          <span className="text-[10px] text-[#8492A6] mt-1 block">
            ✓ Se registrará en tus gastos para no duplicar el cobro en el presupuesto.
          </span>
        )}
      </div>

      {/* Tarjeta de Crédito (TC) / Medio de Pago */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold text-[#8492A6] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#00E5FF]" />
            Tarjeta de Crédito (TC) / Medio de Pago
          </label>
          {tarjetaCredito && (
            <button
              type="button"
              onClick={() => setTarjetaCredito('')}
              className="text-[10px] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
        <input
          type="text"
          list="tc-presets-evento"
          placeholder="Ej. Visa Bancolombia, Mastercard Nubank, Amex, Efectivo..."
          value={tarjetaCredito}
          onChange={(e) => setTarjetaCredito(e.target.value)}
          className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-1.5 text-xs text-[#F1F5F9] focus:outline-none placeholder-[#8492A6]"
        />
        <datalist id="tc-presets-evento">
          <option value="Visa Bancolombia" />
          <option value="Mastercard Bancolombia" />
          <option value="Mastercard Nubank" />
          <option value="American Express" />
          <option value="Scotiabank Colpatria" />
          <option value="Tarjeta Débito" />
          <option value="Efectivo" />
        </datalist>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[10px] text-[#8492A6]">Sugerencias:</span>
          {TC_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTarjetaCredito(preset)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                tarjetaCredito.toLowerCase().includes(preset.toLowerCase())
                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold'
                  : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Configuración de Presupuesto y Pago Anticipado */}
      <div className="pt-3 border-t border-[#1C2436] space-y-2.5">
        <span className="text-[11px] font-bold text-[#8492A6] uppercase tracking-wider block flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-[#00E5FF]" />
          Control de Presupuesto y Pago
        </span>

        {/* Opción 1: Descontar del presupuesto */}
        <label className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0E121B]/60 border border-[#1C2436] hover:border-[#00FF85]/40 transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            checked={descontarPresupuesto}
            onChange={(e) => setDescontarPresupuesto(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#1C2436] accent-[#00FF85]"
          />
          <div className="flex-1 text-xs">
            <span className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
              Descontar del presupuesto de viaje
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                descontarPresupuesto
                  ? 'text-[#00FF85] bg-[#00FF85]/10 border-[#00FF85]/30'
                  : 'text-[#8492A6] bg-[#151B27] border-[#1C2436]'
              }`}>
                {descontarPresupuesto ? 'Activo' : 'No computa'}
              </span>
            </span>
            <p className="text-[11px] text-[#8492A6] mt-0.5 leading-snug">
              {descontarPresupuesto
                ? 'Se restará del saldo disponible del viaje y computará en la categoría correspondiente.'
                : 'No afectará tu presupuesto personal disponible (útil para compras de terceros, regalos o presupuesto fuera de bolsa).'}
            </p>
          </div>
        </label>

        {/* Opción 2: Pagado antes del viaje */}
        <label className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0E121B]/60 border border-[#1C2436] hover:border-[#FFE500]/40 transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            checked={pagadoAdelantado}
            onChange={(e) => setPagadoAdelantado(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-[#1C2436] accent-[#FFE500]"
          />
          <div className="flex-1 text-xs">
            <span className="font-bold text-[#F1F5F9] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#FFE500]" />
              Comprado antes del viaje (Costo por adelantado)
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                pagadoAdelantado
                  ? 'text-[#FFE500] bg-[#FFE500]/10 border-[#FFE500]/30'
                  : 'text-[#8492A6] bg-[#151B27] border-[#1C2436]'
              }`}>
                {pagadoAdelantado ? 'Pre-viaje' : 'En ruta'}
              </span>
            </span>
            <p className="text-[11px] text-[#8492A6] mt-0.5 leading-snug">
              {pagadoAdelantado
                ? 'Costo previo al viaje (costo hundido). Queda registrado en gastos y balance, pero no requerirá efectivo o cobro durante la estancia.'
                : 'Gasto que pagarás durante el viaje en ruta con tu dinero diario.'}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

export default EventoFinanzasSection;

