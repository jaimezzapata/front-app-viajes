import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { CurrencySelector, LiveCurrencyConversions } from '../../../components/CurrencySelector';
import { getExactExchangeRate, convertCurrency, formatCurrencyDisplay } from '../../../utils/currencies';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export function NuevoGastoModal({
  isOpen,
  onClose,
  onSaveGasto,
  monedaDefault = 'COP',
  activeViaje = null
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('comida');
  const [fechaGasto, setFechaGasto] = useState(todayStr);
  const [montoOriginal, setMontoOriginal] = useState('');
  const [monedaOriginal, setMonedaOriginal] = useState(monedaDefault);
  const [usarTasaManual, setUsarTasaManual] = useState(false);
  const [tasaManual, setTasaManual] = useState('');
  const [pagadoAdelantado, setPagadoAdelantado] = useState(false);
  const [noComputar, setNoComputar] = useState(false);
  const [esIngreso, setEsIngreso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar moneda inicial según la moneda local del viaje
  useEffect(() => {
    if (isOpen) {
      const initialCurr = activeViaje?.monedaLocal || monedaDefault || 'COP';
      setMonedaOriginal(initialCurr);
      setConcepto('');
      setMontoOriginal('');
      setErrorMsg('');
      setFechaGasto(new Date().toISOString().split('T')[0]);
      setUsarTasaManual(false);
      const rate = getExactExchangeRate((initialCurr || 'COP').toUpperCase(), 'COP');
      setTasaManual(String(rate));
    }
  }, [isOpen, activeViaje, monedaDefault]);

  const numMonto = Number(montoOriginal) || 0;
  const currentCode = (monedaOriginal || 'COP').toUpperCase();
  const exactRateToCOP = getExactExchangeRate(currentCode, 'COP');

  // Actualizar tasa manual sugerida cuando cambia la divisa
  useEffect(() => {
    if (!usarTasaManual) {
      setTasaManual(String(exactRateToCOP));
    }
  }, [currentCode, exactRateToCOP, usarTasaManual]);

  const appliedRate = (usarTasaManual && Number(tasaManual) > 0)
    ? Number(tasaManual)
    : exactRateToCOP;

  const previewMontoCOP = currentCode === 'COP'
    ? numMonto
    : Math.round(numMonto * appliedRate);

  const previewMontoUSD = convertCurrency(numMonto, currentCode, 'USD');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concepto.trim() || !montoOriginal || Number(montoOriginal) <= 0) {
      setErrorMsg('Por favor ingresa un concepto y un monto mayor a 0');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // Capturar la tasa de cambio exacta y congelarla en el registro
      const finalMontoCOP = previewMontoCOP;
      const finalMontoUSD = previewMontoUSD;

      // Asegurar fecha válida (usando la fecha ingresada por el usuario con hora actual)
      const selectedDate = fechaGasto ? new Date(`${fechaGasto}T12:00:00.000Z`) : new Date();

      await onSaveGasto({
        concepto: concepto.trim(),
        categoria,
        montoOriginal: numMonto,
        monedaOriginal: currentCode,
        tasaCambioFecha: appliedRate, // Congelar tasa exacta (1 unidad extranjera = X COP)
        montoCOP: finalMontoCOP, // Valor calculado en COP al instante
        montoUSD: finalMontoUSD,
        pagadoAdelantado,
        noComputar,
        esIngreso,
        fechaGasto: selectedDate.toISOString()
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Consumo / Gasto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Concepto del Gasto *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Ramen en Shinjuku, Feijoada en Río, Tacos en CDMX..."
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Categoría *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none cursor-pointer"
            >
              <option value="comida">Comida / Bebida</option>
              <option value="transporte">Transporte</option>
              <option value="alojamiento">Alojamiento</option>
              <option value="actividades">Actividades / Tours</option>
              <option value="compras">Compras</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Fecha de la Compra *
            </label>
            <input
              type="date"
              required
              value={fechaGasto}
              onChange={(e) => setFechaGasto(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Selector Dinámico de Moneda de la Ruta */}
        <CurrencySelector
          value={monedaOriginal}
          onChange={(newCurr) => setMonedaOriginal(newCurr)}
          viaje={activeViaje}
          label="Moneda en que se realiza el gasto"
        />

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Monto en {monedaOriginal} *
          </label>
          <input
            type="number"
            step="any"
            required
            placeholder={currentCode === 'COP' || currentCode === 'KRW' || currentCode === 'JPY' ? "Ej. 45000" : "Ej. 25.50"}
            value={montoOriginal}
            onChange={(e) => setMontoOriginal(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2.5 text-base font-bold text-[#F1F5F9] focus:outline-none"
          />
        </div>

        {/* Panel de Conversión Instantánea con Tasa Congelada */}
        {numMonto > 0 && (
          <div className="p-3 rounded-lg bg-[#0E121B] border border-[#00FF85]/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#00FF85]">
                <TrendingUp className="w-4 h-4" />
                Cálculo Exacto en Pesos Colombianos (COP)
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                <ShieldCheck className="w-3 h-3 text-[#00E5FF]" />
                Tasa Congelada
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-[#1C2436]">
              <div>
                <p className="text-[11px] text-[#8492A6] m-0">Tasa de cambio capturada:</p>
                <p className="text-xs font-bold text-[#F1F5F9] m-0">
                  1 {currentCode} = ${appliedRate.toLocaleString('es-CO', { minimumFractionDigits: currentCode === 'JPY' || currentCode === 'KRW' ? 4 : 2, maximumFractionDigits: 4 })} COP
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-[#8492A6] m-0">Equivalente a guardar en COP:</p>
                <p className="text-base font-black text-[#00FF85] m-0">
                  ≈ $ {previewMontoCOP.toLocaleString('es-CO')} COP
                </p>
              </div>
            </div>

            {currentCode !== 'COP' && (
              <div className="pt-2 border-t border-[#1C2436]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#8492A6] hover:text-[#F1F5F9]">
                  <input
                    type="checkbox"
                    checked={usarTasaManual}
                    onChange={(e) => setUsarTasaManual(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#1C2436] accent-[#00E5FF]"
                  />
                  <span>Personalizar tasa de cambio (ej. casa de cambio o cajero físico)</span>
                </label>

                {usarTasaManual && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-[#8492A6]">1 {currentCode} =</span>
                    <input
                      type="number"
                      step="any"
                      value={tasaManual}
                      onChange={(e) => setTasaManual(e.target.value)}
                      placeholder="Valor en COP"
                      className="w-32 bg-[#151B27] border border-[#00E5FF] rounded px-2.5 py-1 text-xs text-[#F1F5F9] font-bold focus:outline-none"
                    />
                    <span className="text-xs text-[#8492A6]">COP</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conversión automática a las demás monedas de la ruta */}
        <LiveCurrencyConversions
          amount={montoOriginal}
          currency={monedaOriginal}
          viaje={activeViaje}
          title="Equivalencias en la ruta del viaje"
        />

        {/* Políticas de negocio (RF 3.2) */}
        <div className="space-y-2 pt-2 border-t border-[#1C2436]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pagadoAdelantado}
              onChange={(e) => setPagadoAdelantado(e.target.checked)}
              className="w-4 h-4 rounded border-[#1C2436] accent-[#FFE500]"
            />
            <span className="text-xs text-[#F1F5F9]">
              <strong>Pagado por adelantado</strong> (Costo hundido, descuenta del presupuesto pero no pide efectivo en ruta)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noComputar}
              onChange={(e) => setNoComputar(e.target.checked)}
              className="w-4 h-4 rounded border-[#1C2436] accent-[#B55FE6]"
            />
            <span className="text-xs text-[#F1F5F9]">
              <strong>Encargo / Terceros</strong> (No computar en mi presupuesto personal)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={esIngreso}
              onChange={(e) => setEsIngreso(e.target.checked)}
              className="w-4 h-4 rounded border-[#1C2436] accent-[#00FF85]"
            />
            <span className="text-xs text-[#F1F5F9]">
              <strong>Reembolso o Tax-Free</strong> (Reduce el balance de gastos)
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity mt-4 cursor-pointer"
        >
          {loading ? 'Guardando con tasa exacta...' : 'Registrar Transacción'}
        </button>
      </form>
    </Modal>
  );
}

export default NuevoGastoModal;
