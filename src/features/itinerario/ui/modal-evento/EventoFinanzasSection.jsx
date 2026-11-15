import React from 'react';
import { CreditCard, Wallet, Users, User } from 'lucide-react';
import { CurrencySelector } from '../../../../components/CurrencySelector';
import { formatCurrencyDisplay, convertCurrency } from '../../../../utils/currencies';

const TC_PRESETS = ['Visa', 'Mastercard', 'Nubank', 'Amex', 'Rappi', 'Débito', 'Efectivo'];

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
  cantidadPersonas = 1,
  setCantidadPersonas,
  modoCostoPersonas = 'total',
  setModoCostoPersonas,
  computarSoloMiParte = true,
  setComputarSoloMiParte,
  descontarPresupuesto,
  setDescontarPresupuesto,
  pagadoAdelantado,
  setPagadoAdelantado
}) {
  const isRoundTripFlight = tipo === 'vuelo' && tipoTrayecto === 'round-trip';
  const paxCount = Math.max(1, Math.round(Number(cantidadPersonas) || 1));
  const rawCosto = Number(costo) || 0;
  const currCode = (moneda || 'COP').toUpperCase();

  const calculatedTotal = paxCount > 1 && modoCostoPersonas === 'por_persona'
    ? Number((rawCosto * paxCount).toFixed(2))
    : rawCosto;
  const calculatedPerPerson = paxCount > 1
    ? (modoCostoPersonas === 'por_persona' ? rawCosto : Number((rawCosto / paxCount).toFixed(2)))
    : rawCosto;
  const calculatedCompanions = Math.max(0, Number((calculatedTotal - calculatedPerPerson).toFixed(2)));

  const totalCOP = currCode === 'COP' ? calculatedTotal : convertCurrency(calculatedTotal, currCode, 'COP');
  const perPersonCOP = currCode === 'COP' ? calculatedPerPerson : convertCurrency(calculatedPerPerson, currCode, 'COP');

  return (
    <div className="p-3 rounded-lg bg-[#151B27] border border-[#1C2436] space-y-3">
      {/* Selector de Cantidad de Personas (1, 2, 3 personas) */}
      {setCantidadPersonas && (
        <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1C2436] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
              {tipo === 'vuelo' || tipo === 'transporte'
                ? '¿Para cuántas personas es el vuelo / transporte?'
                : '¿Para cuántas personas es esta compra?'}
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
              {paxCount === 1 ? 'Individual (1 persona)' : `Compra para ${paxCount} personas`}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {[
              { count: 1, label: '1 Persona', sub: 'Solo yo' },
              { count: 2, label: '2 Personas', sub: 'Pareja / Dúo' },
              { count: 3, label: '3 Personas', sub: 'Grupo x3' }
            ].map((opt) => {
              const active = paxCount === opt.count;
              return (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setCantidadPersonas(opt.count)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#F1F5F9] shadow-xs'
                      : 'bg-[#151B27] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9] hover:border-[#00E5FF]/40'
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1">
                    {opt.count === 1 ? (
                      <User className={`w-3.5 h-3.5 ${active ? 'text-[#00E5FF]' : 'text-[#8492A6]'}`} />
                    ) : (
                      <Users className={`w-3.5 h-3.5 ${active ? 'text-[#00E5FF]' : 'text-[#8492A6]'}`} />
                    )}
                    <span className={active ? 'text-[#00E5FF]' : ''}>{opt.label}</span>
                  </span>
                  <span className="text-[10px] text-[#8492A6] mt-0.5">{opt.sub}</span>
                </button>
              );
            })}

            {/* Input para otra cantidad (4+) */}
            <div className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] flex flex-col justify-center">
              <span className="text-[9px] font-semibold text-[#8492A6] uppercase px-1">Otra cant.</span>
              <input
                type="number"
                min="1"
                max="30"
                value={paxCount}
                onChange={(e) => setCantidadPersonas(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-transparent text-xs font-bold text-[#F1F5F9] px-1 py-0.5 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <CurrencySelector
        value={moneda}
        onChange={setMoneda}
        viaje={activeViaje}
        label={isRoundTripFlight ? 'Moneda del Boleto Round-Trip' : 'Moneda del Evento'}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <label className="block text-xs font-semibold text-[#8492A6] uppercase tracking-wider">
            {paxCount > 1
              ? (modoCostoPersonas === 'por_persona'
                  ? `Valor por Persona (1 cupo) en ${currCode}`
                  : `Total Pagado / Cobrado en TC (${paxCount} personas)`)
              : (isRoundTripFlight
                  ? 'Costo Total del Tiquete Round-Trip (Ida y Vuelta)'
                  : 'Costo (Opcional)')}
          </label>

          {paxCount > 1 && setModoCostoPersonas && (
            <div className="inline-flex rounded-lg bg-[#0E121B] p-0.5 border border-[#1C2436]">
              <button
                type="button"
                onClick={() => setModoCostoPersonas('total')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                  modoCostoPersonas === 'total'
                    ? 'bg-[#00E5FF] text-[#080A0F]'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                Ingresé Total ({paxCount} pers.)
              </button>
              <button
                type="button"
                onClick={() => setModoCostoPersonas('por_persona')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                  modoCostoPersonas === 'por_persona'
                    ? 'bg-[#00FF85] text-[#080A0F]'
                    : 'text-[#8492A6] hover:text-[#F1F5F9]'
                }`}
              >
                Ingresé Valor x Persona
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8492A6] text-xs font-bold">
            $
          </span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder={tipo === 'vuelo' ? 'Ej. 1200000' : '0.00'}
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

        {/* Desglose Automático cuando se compra para 2 o más personas */}
        {paxCount > 1 && rawCosto > 0 && (
          <div className="mt-2.5 p-3 rounded-xl bg-[#0E121B] border border-[#00E5FF]/40 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#00E5FF] border-b border-[#1C2436] pb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Desglose: Compra para {paxCount} Personas
              </span>
              <span className="text-[10px] text-[#00FF85]">Cálculo Automático</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-[#151B27] border border-[#1C2436]">
                <span className="text-[10px] font-semibold text-[#8492A6] uppercase block">
                  💳 Todo lo Gastado / TC ({paxCount} pers.)
                </span>
                <span className="text-sm font-black text-[#FFE500] block mt-0.5">
                  {formatCurrencyDisplay(calculatedTotal, currCode, true)}
                </span>
                {currCode !== 'COP' && (
                  <span className="text-[10px] text-[#8492A6] font-mono">
                    ≈ $ {Math.round(totalCOP).toLocaleString()} COP
                  </span>
                )}
              </div>

              <div className="p-2 rounded-lg bg-[#151B27] border border-[#00FF85]/30">
                <span className="text-[10px] font-semibold text-[#00FF85] uppercase block">
                  👤 Valor por Persona (1 cupo)
                </span>
                <span className="text-sm font-black text-[#00FF85] block mt-0.5">
                  {formatCurrencyDisplay(calculatedPerPerson, currCode, true)}
                </span>
                {currCode !== 'COP' && (
                  <span className="text-[10px] text-[#8492A6] font-mono">
                    ≈ $ {Math.round(perPersonCOP).toLocaleString()} COP c/u
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8492A6] px-1">
              <span>
                Parte de acompañante{paxCount - 1 > 1 ? 's' : ''} ({paxCount - 1} {paxCount - 1 === 1 ? 'persona' : 'personas'}):
              </span>
              <strong className="text-[#CBD5E1] font-mono">
                {formatCurrencyDisplay(calculatedCompanions, currCode, true)}
              </strong>
            </div>

            {setComputarSoloMiParte && descontarPresupuesto && (
              <div className="pt-2 border-t border-[#1C2436] flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#8492A6] uppercase">
                  ¿Cómo descontar de tu presupuesto personal?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setComputarSoloMiParte(true)}
                    className={`p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                      computarSoloMiParte
                        ? 'bg-[#00FF85]/15 border-[#00FF85] text-[#F1F5F9] font-bold'
                        : 'bg-[#151B27] border-[#1C2436] text-[#8492A6]'
                    }`}
                  >
                    <span className="block text-[#00FF85]">✓ Solo mi parte (1 persona)</span>
                    <span className="text-[10px] text-[#8492A6] font-normal">
                      Descuenta {formatCurrencyDisplay(calculatedPerPerson, currCode, false)} del ppto y registra {formatCurrencyDisplay(calculatedTotal, currCode, false)} en total TC.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setComputarSoloMiParte(false)}
                    className={`p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                      !computarSoloMiParte
                        ? 'bg-[#FFE500]/15 border-[#FFE500] text-[#F1F5F9] font-bold'
                        : 'bg-[#151B27] border-[#1C2436] text-[#8492A6]'
                    }`}
                  >
                    <span className="block text-[#FFE500]">Descontar todo ({paxCount} personas)</span>
                    <span className="text-[10px] text-[#8492A6] font-normal">
                      Descuenta los {formatCurrencyDisplay(calculatedTotal, currCode, false)} completos de tu presupuesto.
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
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

