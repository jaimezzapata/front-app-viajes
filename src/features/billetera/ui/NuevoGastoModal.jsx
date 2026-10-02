import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import { CurrencySelector, LiveCurrencyConversions } from '../../../components/CurrencySelector';

export function NuevoGastoModal({ isOpen, onClose, onSaveGasto, monedaDefault = 'COP' }) {
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('comida');
  const [montoOriginal, setMontoOriginal] = useState('');
  const [monedaOriginal, setMonedaOriginal] = useState(monedaDefault);
  const [pagadoAdelantado, setPagadoAdelantado] = useState(false);
  const [noComputar, setNoComputar] = useState(false);
  const [esIngreso, setEsIngreso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar monedaDefault al abrir modal
  React.useEffect(() => {
    if (isOpen) {
      setMonedaOriginal(monedaDefault || 'COP');
      setErrorMsg('');
    }
  }, [isOpen, monedaDefault]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concepto.trim() || !montoOriginal || Number(montoOriginal) <= 0) {
      setErrorMsg('Por favor ingresa un concepto y un monto mayor a 0');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await onSaveGasto({
        concepto: concepto.trim(),
        categoria,
        montoOriginal: Number(montoOriginal),
        monedaOriginal: monedaOriginal.toUpperCase(),
        pagadoAdelantado,
        noComputar,
        esIngreso,
        fechaGasto: new Date().toISOString()
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
            placeholder="Ej. Cena en Gangnam, Metro Tokio, Pasaje Abu Dhabi..."
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
        </div>

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

        {/* Selector de Moneda del Viaje */}
        <CurrencySelector
          value={monedaOriginal}
          onChange={(newCurr) => setMonedaOriginal(newCurr)}
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
            placeholder={monedaOriginal === 'COP' || monedaOriginal === 'KRW' || monedaOriginal === 'JPY' ? "Ej. 45000" : "Ej. 25.50"}
            value={montoOriginal}
            onChange={(e) => setMontoOriginal(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2.5 text-base font-bold text-[#F1F5F9] focus:outline-none"
          />
        </div>

        {/* Conversión automática en tiempo real a las otras monedas del viaje */}
        <LiveCurrencyConversions
          amount={montoOriginal}
          currency={monedaOriginal}
          title="Conversión instantánea a las otras monedas del viaje"
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
          {loading ? 'Guardando...' : 'Registrar Transacción'}
        </button>
      </form>
    </Modal>
  );
}

export default NuevoGastoModal;
