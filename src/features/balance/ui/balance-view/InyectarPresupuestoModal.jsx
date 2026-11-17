import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Trash2,
  Calendar,
  TrendingUp,
  DollarSign,
  Wallet,
  Sparkles,
  Check
} from 'lucide-react';
import Modal from '../../../../components/Modal';
import { convertCurrency } from '../../../../utils/currencies';
import { getViajeCategoriasConfig } from '../../../../utils/balance';

const QUICK_AMOUNTS = [500000, 1000000, 2000000, 5000000];

export function InyectarPresupuestoModal({
  isOpen,
  onClose,
  viaje,
  onUpdateViaje
}) {
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMonto('');
      setConcepto('');
      setFecha(new Date().toISOString().split('T')[0]);
      setErrorMsg('');
    }
  }, [isOpen, viaje?.id]);

  const inyecciones = useMemo(
    () => (Array.isArray(viaje?.inyeccionesPresupuesto) ? viaje.inyeccionesPresupuesto : []),
    [viaje?.inyeccionesPresupuesto]
  );

  const presupuestoTotalActual = Number(viaje?.presupuestoTotal) || 0;
  const totalInyectadoActual = useMemo(
    () => inyecciones.reduce((acc, it) => acc + Math.max(0, Number(it?.monto) || 0), 0),
    [inyecciones]
  );
  const presupuestoBaseActual = Math.max(0, presupuestoTotalActual - totalInyectadoActual);

  const montoNum = Math.max(0, Number(monto) || 0);
  const equivUSD = useMemo(() => convertCurrency(montoNum, 'COP', 'USD'), [montoNum]);
  const nuevoTotalPreview = presupuestoTotalActual + montoNum;

  const persistBudgetChange = async (nextPresupuestoTotal, nextInyecciones) => {
    if (!viaje || !onUpdateViaje) return;
    const config = getViajeCategoriasConfig(viaje);
    const categoriasPayload = config.map((c) => {
      const pct = Number(c.porcentaje) || 0;
      return {
        categoria: c.categoria,
        porcentaje: pct,
        limite: Math.round(nextPresupuestoTotal * (pct / 100))
      };
    });

    await onUpdateViaje(viaje.id, {
      presupuestoTotal: nextPresupuestoTotal,
      inyeccionesPresupuesto: nextInyecciones,
      categoriasPresupuesto: categoriasPayload,
      presupuestosPorCategoria: categoriasPayload
    });
  };

  const handleInject = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (montoNum <= 0) {
      setErrorMsg('Ingresa un monto mayor a 0 para inyectar al presupuesto.');
      return;
    }

    setLoading(true);
    try {
      const newInjection = {
        id: `inj-${Date.now()}`,
        monto: Math.round(montoNum),
        concepto: concepto.trim() || 'Inyección adicional de presupuesto',
        fecha: fecha || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      const nextInyecciones = [newInjection, ...inyecciones];
      const nextTotal = Math.round(presupuestoTotalActual + montoNum);

      await persistBudgetChange(nextTotal, nextInyecciones);
      setMonto('');
      setConcepto('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar la inyección de presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInjection = async (injId) => {
    const target = inyecciones.find((i) => i.id === injId);
    if (!target) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const nextInyecciones = inyecciones.filter((i) => i.id !== injId);
      const nextTotal = Math.max(0, Math.round(presupuestoTotalActual - (Number(target.monto) || 0)));
      await persistBudgetChange(nextTotal, nextInyecciones);
    } catch (err) {
      setErrorMsg(err.message || 'Error al eliminar la inyección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inyectar Presupuesto Adicional"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-bold uppercase tracking-wider text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FF2E55]/10 border border-[#FF2E55]/30 text-xs text-[#FF2E55] font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Discriminación en 3 Bloques: Base + Inyectado = Total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-[#151B27] border border-[#1C2436]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] block">
              Presupuesto Base
            </span>
            <p className="text-base font-black font-mono text-[#F1F5F9] m-0 mt-1">
              $ {Math.round(presupuestoBaseActual).toLocaleString('es-CO')}
            </p>
            <span className="text-[10px] text-[#8492A6]">Asignación inicial</span>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#B55FE6]/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B55FE6] block">
              + Total Inyectado ({inyecciones.length})
            </span>
            <p className="text-base font-black font-mono text-[#B55FE6] m-0 mt-1">
              + $ {Math.round(totalInyectadoActual).toLocaleString('es-CO')}
            </p>
            <span className="text-[10px] text-[#8492A6]">Aportes adicionales</span>
          </div>

          <div className="p-3 rounded-xl bg-[#151B27] border border-[#00FF85]/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF85] block">
              = Presupuesto Vigente
            </span>
            <p className="text-base font-black font-mono text-[#00FF85] m-0 mt-1">
              $ {Math.round(nuevoTotalPreview).toLocaleString('es-CO')}
            </p>
            <span className="text-[10px] text-[#8492A6]">
              {montoNum > 0
                ? `Incluye +$${Math.round(montoNum).toLocaleString('es-CO')} nuevos`
                : 'Total actual disponible'}
            </span>
          </div>
        </div>

        {/* Formulario para Nueva Inyección */}
        <form onSubmit={handleInject} className="p-4 rounded-xl bg-[#151B27] border border-[#B55FE6]/35 space-y-3.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B55FE6] flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              Registrar Nueva Inyección de Presupuesto
            </span>
            {montoNum > 0 && (
              <span className="text-[11px] font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/25 px-2 py-0.5 rounded">
                ≈ +${equivUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                Monto a Inyectar (COP)
              </label>
              <div className="flex items-center bg-[#0E121B] border border-[#1C2436] focus-within:border-[#B55FE6] rounded-xl px-3 py-2">
                <DollarSign className="w-4 h-4 text-[#B55FE6] mr-1 shrink-0" />
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej. 2000000"
                  className="w-full bg-transparent text-base font-black text-[#F1F5F9] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
                Fecha de Inyección
              </label>
              <div className="flex items-center bg-[#0E121B] border border-[#1C2436] focus-within:border-[#B55FE6] rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-[#8492A6] mr-2 shrink-0" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-[#F1F5F9] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botones rápidos de monto */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8492A6] mr-1">
              Rápido:
            </span>
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setMonto(String(montoNum + q))}
                className="px-2 py-1 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#B55FE6] text-[11px] font-mono font-bold text-[#CBD5E1] hover:text-[#B55FE6] transition-colors cursor-pointer"
              >
                +${(q / 1000000 >= 1 ? `${q / 1000000}M` : `${q / 1000}k`)}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8492A6] mb-1">
              Concepto / Origen del Aporte
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej. Aporte extra, Prima, Ahorro adicional, Bono..."
              className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#B55FE6] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] placeholder-[#8492A6] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || montoNum <= 0}
            className="w-full py-2.5 rounded-xl bg-[#B55FE6] hover:opacity-90 disabled:opacity-45 text-white text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {loading
                ? 'Aplicando inyección...'
                : montoNum > 0
                ? `Inyectar +$ ${Math.round(montoNum).toLocaleString('es-CO')} COP`
                : 'Inyectar al Presupuesto'}
            </span>
          </button>
        </form>

        {/* Historial Discriminado de Inyecciones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] m-0 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00FF85]" />
              <span>Historial Discriminado de Inyecciones</span>
            </h4>
            <span className="text-[11px] text-[#8492A6] font-mono">
              {inyecciones.length} {inyecciones.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {inyecciones.length === 0 ? (
            <div className="p-5 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center">
              <Wallet className="w-7 h-7 text-[#8492A6] mx-auto mb-1.5 opacity-40" />
              <p className="text-xs font-semibold text-[#F1F5F9] m-0">
                Aún no se han registrado inyecciones adicionales
              </p>
              <p className="text-[11px] text-[#8492A6] m-0 mt-0.5">
                Cada aporte adicional quedará discriminado aquí y se reflejará en la torta del Balance.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {inyecciones.map((inj) => (
                <div
                  key={inj.id}
                  className="p-3 rounded-xl bg-[#0E121B] border border-[#1C2436] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#F1F5F9] m-0 truncate">
                      {inj.concepto || 'Inyección de presupuesto'}
                    </p>
                    <span className="text-[10px] text-[#8492A6] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {inj.fecha || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-[#B55FE6]">
                      + $ {Math.round(Number(inj.monto) || 0).toLocaleString('es-CO')}
                    </span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDeleteInjection(inj.id)}
                      className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer disabled:opacity-40"
                      title="Revertir / Eliminar esta inyección"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default InyectarPresupuestoModal;
