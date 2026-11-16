import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../../components/Modal';
import { CurrencySelector, LiveCurrencyConversions } from '../../../components/CurrencySelector';
import { getExactExchangeRate, convertCurrency, formatCurrencyDisplay } from '../../../utils/currencies';
import { getViajeCategoriasConfig } from '../../../utils/balance';
import { TrendingUp, ShieldCheck, CreditCard, Users, User } from 'lucide-react';

export function NuevoGastoModal({
  isOpen,
  onClose,
  onSaveGasto,
  onUpdateGasto,
  gastoAEditar = null,
  monedaDefault = 'COP',
  activeViaje = null
}) {
  const isEditing = Boolean(gastoAEditar);
  const todayStr = new Date().toISOString().split('T')[0];
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('comida');
  const [fechaGasto, setFechaGasto] = useState(todayStr);
  const [tarjetaCredito, setTarjetaCredito] = useState('');
  const [montoOriginal, setMontoOriginal] = useState('');
  const [monedaOriginal, setMonedaOriginal] = useState(monedaDefault);
  const [usarTasaManual, setUsarTasaManual] = useState(false);
  const [tasaManual, setTasaManual] = useState('');
  const [pagadoAdelantado, setPagadoAdelantado] = useState(false);
  const [noComputar, setNoComputar] = useState(false);
  const [esIngreso, setEsIngreso] = useState(false);
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [modoCostoPersonas, setModoCostoPersonas] = useState('total');
  const [computarSoloMiParte, setComputarSoloMiParte] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableCategorias = useMemo(() => {
    const cfg = getViajeCategoriasConfig(activeViaje);
    const baseLabels = {
      comida: '🍽️ Comida / Bebida',
      transporte: '✈️ Transporte / Vuelos',
      alojamiento: '🏨 Alojamiento / Hoteles',
      actividades: '🎟️ Actividades / Tours',
      compras: '🛍️ Compras',
      impuestos: '🪪 Impuestos / Permisos (K-ETA, ETIAS, Visas)',
      otros: '📌 Otros'
    };
    const list = cfg.map((c) => ({
      value: c.categoria,
      label:
        baseLabels[c.categoria] ||
        c.categoria.charAt(0).toUpperCase() + c.categoria.slice(1)
    }));
    if (!list.some((item) => item.value === 'impuestos')) {
      list.splice(Math.max(0, list.length - 1), 0, {
        value: 'impuestos',
        label: baseLabels.impuestos
      });
    }
    return list;
  }, [activeViaje]);

  // Sincronizar datos al abrir (creación o edición)
  useEffect(() => {
    if (!isOpen) return;

    if (gastoAEditar) {
      const initCurr = (gastoAEditar.monedaOriginal || activeViaje?.monedaLocal || monedaDefault || 'COP').toUpperCase();
      const initPax = Math.max(1, Math.round(Number(gastoAEditar.cantidadPersonas) || 1));
      const initModo = gastoAEditar.modoCostoPersonas || 'total';
      const initSoloMiParte = gastoAEditar.computarSoloMiParte !== undefined
        ? Boolean(gastoAEditar.computarSoloMiParte)
        : true;

      setConcepto(gastoAEditar.concepto || '');
      setCategoria((gastoAEditar.categoria || 'otros').toLowerCase());
      setTarjetaCredito(gastoAEditar.tarjetaCredito || '');
      setMonedaOriginal(initCurr);
      setCantidadPersonas(initPax);
      setModoCostoPersonas(initModo);
      setComputarSoloMiParte(initSoloMiParte);

      if (initPax > 1 && initModo === 'por_persona' && gastoAEditar.costoPorPersona) {
        setMontoOriginal(String(gastoAEditar.costoPorPersona));
      } else {
        const totalVal = gastoAEditar.costoTotal ?? gastoAEditar.montoOriginal;
        setMontoOriginal(totalVal !== undefined && totalVal !== null ? String(totalVal) : '');
      }

      if (gastoAEditar.fechaGasto) {
        try {
          setFechaGasto(new Date(gastoAEditar.fechaGasto).toISOString().split('T')[0]);
        } catch {
          setFechaGasto(new Date().toISOString().split('T')[0]);
        }
      } else {
        setFechaGasto(new Date().toISOString().split('T')[0]);
      }

      setPagadoAdelantado(Boolean(gastoAEditar.pagadoAdelantado));
      setNoComputar(Boolean(gastoAEditar.noComputar));
      setEsIngreso(Boolean(gastoAEditar.esIngreso));

      const defaultRate = getExactExchangeRate(initCurr, 'COP');
      if (gastoAEditar.tasaCambioFecha && Number(gastoAEditar.tasaCambioFecha) > 0) {
        setTasaManual(String(gastoAEditar.tasaCambioFecha));
        setUsarTasaManual(Math.abs(Number(gastoAEditar.tasaCambioFecha) - defaultRate) > 0.01);
      } else {
        setTasaManual(String(defaultRate));
        setUsarTasaManual(false);
      }
      setErrorMsg('');
    } else {
      const initialCurr = activeViaje?.monedaLocal || monedaDefault || 'COP';
      setMonedaOriginal(initialCurr);
      setConcepto('');
      setCategoria('comida');
      setTarjetaCredito('');
      setMontoOriginal('');
      setCantidadPersonas(1);
      setModoCostoPersonas('total');
      setComputarSoloMiParte(true);
      setPagadoAdelantado(false);
      setNoComputar(false);
      setEsIngreso(false);
      setErrorMsg('');
      setFechaGasto(new Date().toISOString().split('T')[0]);
      setUsarTasaManual(false);
      const rate = getExactExchangeRate((initialCurr || 'COP').toUpperCase(), 'COP');
      setTasaManual(String(rate));
    }
  }, [isOpen, gastoAEditar, activeViaje, monedaDefault]);

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

  const isAlojamiento = (categoria || '').toLowerCase() === 'alojamiento';
  const paxCount = Math.max(1, Math.round(Number(cantidadPersonas) || 1));
  const calculatedTotalOrig = isAlojamiento
    ? numMonto
    : (paxCount > 1 && modoCostoPersonas === 'por_persona'
      ? Number((numMonto * paxCount).toFixed(2))
      : numMonto);
  const calculatedPerPersonOrig = isAlojamiento
    ? numMonto
    : (paxCount > 1
      ? (modoCostoPersonas === 'por_persona' ? numMonto : Number((numMonto / paxCount).toFixed(2)))
      : numMonto);

  const previewMontoCOP = currentCode === 'COP'
    ? calculatedTotalOrig
    : Math.round(calculatedTotalOrig * appliedRate);

  const previewPorPersonaCOP = isAlojamiento
    ? previewMontoCOP
    : (paxCount > 1
      ? Math.round(previewMontoCOP / paxCount)
      : previewMontoCOP);

  const previewMontoUSD = convertCurrency(calculatedTotalOrig, currentCode, 'USD');

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

      const gastoPayload = {
        concepto: concepto.trim(),
        categoria,
        tarjetaCredito: tarjetaCredito.trim() || null,
        montoOriginal: calculatedTotalOrig,
        monedaOriginal: currentCode,
        tasaCambioFecha: appliedRate, // Congelar tasa exacta (1 unidad extranjera = X COP)
        montoCOP: finalMontoCOP, // Valor calculado en COP al instante
        montoUSD: finalMontoUSD,
        cantidadPersonas: paxCount,
        modoCostoPersonas,
        costoTotal: calculatedTotalOrig,
        costoPorPersona: calculatedPerPersonOrig,
        computarSoloMiParte,
        pagadoAdelantado,
        noComputar,
        esIngreso,
        fechaGasto: selectedDate.toISOString()
      };

      if (isEditing && onUpdateGasto) {
        await onUpdateGasto(gastoAEditar.id, gastoPayload);
      } else {
        await onSaveGasto(gastoPayload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Gasto / Consumo' : 'Registrar Consumo / Gasto'}
    >
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
              placeholder={
                categoria === 'impuestos'
                  ? 'Ej. Permiso K-ETA Corea, Solicitud ETIAS Europa, Tasa aeroportuaria...'
                  : 'Ej. Ramen en Shinjuku, Tiquete tren, Hotel...'
              }
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
              {availableCategorias.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
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

        {/* Tarjeta de Crédito (TC) / Medio de Pago */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-[#8492A6] uppercase tracking-wider flex items-center gap-1.5">
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
            list="tc-presets-gasto"
            placeholder="Ej. Visa Bancolombia, Mastercard Nubank, Amex, Efectivo..."
            value={tarjetaCredito}
            onChange={(e) => setTarjetaCredito(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none placeholder-[#8492A6]"
          />
          <datalist id="tc-presets-gasto">
            <option value="Visa Bancolombia" />
            <option value="Mastercard Bancolombia" />
            <option value="Mastercard Nubank" />
            <option value="American Express" />
            <option value="Scotiabank Colpatria" />
            <option value="Tarjeta Débito" />
            <option value="Efectivo" />
          </datalist>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[10px] text-[#8492A6]">Sugerencias rápidas:</span>
            {['Visa', 'Mastercard', 'Nubank', 'Amex', 'Débito', 'Efectivo'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTarjetaCredito(preset)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
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

        {/* Selector de Cantidad de Personas (1, 2, 3 personas) */}
        <div className="p-2.5 rounded-lg bg-[#151B27] border border-[#1C2436] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
              {categoria === 'transporte'
                ? '¿Para cuántas personas es el vuelo / transporte?'
                : '¿Para cuántas personas es este gasto?'}
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
              {paxCount === 1 ? 'Individual (1 persona)' : `Para ${paxCount} personas`}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {[
              { count: 1, label: '1 Persona', sub: 'Individual' },
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
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#F1F5F9]'
                      : 'bg-[#0E121B] border-[#1C2436] text-[#8492A6] hover:text-[#F1F5F9]'
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
            <div className="p-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] flex flex-col justify-center">
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

        {/* Selector Dinámico de Moneda de la Ruta */}
        <CurrencySelector
          value={monedaOriginal}
          onChange={(newCurr) => setMonedaOriginal(newCurr)}
          viaje={activeViaje}
          label="Moneda en que se realiza el gasto"
        />

        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <label className="block text-xs font-semibold text-[#8492A6] uppercase tracking-wider">
              {paxCount > 1
                ? (modoCostoPersonas === 'por_persona'
                    ? `Valor por Persona en ${monedaOriginal} *`
                    : `Monto Total Pagado (${paxCount} personas) en ${monedaOriginal} *`)
                : `Monto en ${monedaOriginal} *`}
            </label>

            {paxCount > 1 && (
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
          <input
            type="number"
            step="any"
            required
            placeholder={currentCode === 'COP' || currentCode === 'KRW' || currentCode === 'JPY' ? "Ej. 45000" : "Ej. 25.50"}
            value={montoOriginal}
            onChange={(e) => setMontoOriginal(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2.5 text-base font-bold text-[#F1F5F9] focus:outline-none"
          />

          {paxCount > 1 && numMonto > 0 && (
            <div className="mt-2.5 p-3 rounded-xl bg-[#0E121B] border border-[#00E5FF]/40 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#151B27] border border-[#1C2436]">
                  <span className="text-[10px] font-semibold text-[#8492A6] uppercase block">
                    💳 Todo lo Gastado / TC ({paxCount} pers.)
                  </span>
                  <span className="text-sm font-black text-[#FFE500] block mt-0.5">
                    {formatCurrencyDisplay(calculatedTotalOrig, currentCode, true)}
                  </span>
                  <span className="text-[10px] text-[#8492A6] font-mono">
                    ≈ $ {previewMontoCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[#151B27] border border-[#00FF85]/30">
                  <span className="text-[10px] font-semibold text-[#00FF85] uppercase block">
                    👤 Valor por Persona (1 cupo)
                  </span>
                  <span className="text-sm font-black text-[#00FF85] block mt-0.5">
                    {formatCurrencyDisplay(calculatedPerPersonOrig, currentCode, true)}
                  </span>
                  <span className="text-[10px] text-[#8492A6] font-mono">
                    ≈ $ {previewPorPersonaCOP.toLocaleString('es-CO')} COP c/u
                  </span>
                </div>
              </div>
            </div>
          )}
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
              <strong>Fuera de Presupuesto / Terceros</strong> (No computar en el presupuesto operativo del viaje)
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
          {loading
            ? 'Guardando cambios...'
            : isEditing
            ? 'Guardar Cambios del Gasto'
            : 'Registrar Transacción'}
        </button>
      </form>
    </Modal>
  );
}

export default NuevoGastoModal;
