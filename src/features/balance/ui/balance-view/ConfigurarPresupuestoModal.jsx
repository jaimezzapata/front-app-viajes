import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Percent,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  Tag,
  AlertTriangle
} from 'lucide-react';
import Modal from '../../../../components/Modal';
import {
  DEFAULT_CATEGORIAS_PRESUPUESTO,
  getViajeCategoriasConfig
} from '../../../../utils/balance';
import { convertCurrency } from '../../../../utils/currencies';

export function ConfigurarPresupuestoModal({
  isOpen,
  onClose,
  viaje,
  onUpdateViaje
}) {
  const [presupuestoTotal, setPresupuestoTotal] = useState('0');
  const [categorias, setCategorias] = useState([]);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [nuevaCatPorcentaje, setNuevaCatPorcentaje] = useState('5');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && viaje) {
      setPresupuestoTotal(String(Number(viaje.presupuestoTotal) || 0));
      const config = getViajeCategoriasConfig(viaje);
      setCategorias(
        config.map((c) => ({
          categoria: c.categoria,
          porcentaje: Number(c.porcentaje) || 0
        }))
      );
      setNuevaCatNombre('');
      setNuevaCatPorcentaje('5');
      setErrorMsg('');
    }
  }, [isOpen, viaje]);

  const numPresupuestoTotal = Math.max(0, Number(presupuestoTotal) || 0);
  const equivUSD = useMemo(
    () => convertCurrency(numPresupuestoTotal, 'COP', 'USD'),
    [numPresupuestoTotal]
  );

  const sumaPorcentajes = useMemo(() => {
    const sum = categorias.reduce((acc, c) => acc + (Number(c.porcentaje) || 0), 0);
    return Number(sum.toFixed(1));
  }, [categorias]);

  const handlePorcentajeChange = (index, newPctStr) => {
    const val = Math.max(0, Number(newPctStr) || 0);
    setCategorias((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, porcentaje: val } : item))
    );
  };

  const handleMontoCategoriaChange = (index, newMontoStr) => {
    const monto = Math.max(0, Number(newMontoStr) || 0);
    if (numPresupuestoTotal <= 0) return;
    const pct = Number(((monto / numPresupuestoTotal) * 100).toFixed(1));
    setCategorias((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, porcentaje: pct } : item))
    );
  };

  const handleAddCategoria = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const cleanName = nuevaCatNombre.trim().toLowerCase();
    if (!cleanName) {
      setErrorMsg('Ingresa un nombre para la nueva categoría.');
      return;
    }
    if (categorias.some((c) => c.categoria.toLowerCase() === cleanName)) {
      setErrorMsg(`La categoría "${cleanName}" ya existe en la lista.`);
      return;
    }

    const pct = Math.max(0, Number(nuevaCatPorcentaje) || 0);
    setCategorias((prev) => [...prev, { categoria: cleanName, porcentaje: pct }]);
    setNuevaCatNombre('');
    setNuevaCatPorcentaje('5');
  };

  const handleRemoveCategoria = (index) => {
    if (categorias.length <= 1) {
      setErrorMsg('Debe existir al menos una categoría de presupuesto.');
      return;
    }
    setCategorias((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleNormalize100 = () => {
    if (categorias.length === 0) return;
    if (sumaPorcentajes <= 0) {
      const equalPct = Number((100 / categorias.length).toFixed(1));
      setCategorias((prev) => prev.map((c) => ({ ...c, porcentaje: equalPct })));
      return;
    }
    const factor = 100 / sumaPorcentajes;
    let running = 0;
    const adjusted = categorias.map((c, idx) => {
      if (idx === categorias.length - 1) {
        return {
          ...c,
          porcentaje: Number(Math.max(0, 100 - running).toFixed(1))
        };
      }
      const nextPct = Number((c.porcentaje * factor).toFixed(1));
      running += nextPct;
      return { ...c, porcentaje: nextPct };
    });
    setCategorias(adjusted);
  };

  const handleResetDefaults = () => {
    setCategorias(
      DEFAULT_CATEGORIAS_PRESUPUESTO.map((c) => ({
        categoria: c.categoria,
        porcentaje: c.porcentaje
      }))
    );
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!viaje || !onUpdateViaje) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const categoriasPayload = categorias.map((c) => {
        const pct = Number(c.porcentaje) || 0;
        const limite = Math.round(numPresupuestoTotal * (pct / 100));
        return {
          categoria: c.categoria.trim().toLowerCase(),
          porcentaje: pct,
          limite
        };
      });

      await onUpdateViaje(viaje.id, {
        presupuestoTotal: numPresupuestoTotal,
        categoriasPresupuesto: categoriasPayload,
        presupuestosPorCategoria: categoriasPayload
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al actualizar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Presupuesto y Categorías"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{loading ? 'Guardando...' : 'Guardar Presupuesto'}</span>
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

        {/* 1. Presupuesto Total del Viaje */}
        <div className="p-4 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-bold text-[#FFE500] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#FFE500]" />
              Presupuesto Total del Viaje (en COP)
            </label>
            <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-md font-semibold">
              ≈ ${equivUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
            </span>
          </div>

          <input
            type="number"
            min="0"
            step="any"
            value={presupuestoTotal}
            onChange={(e) => setPresupuestoTotal(e.target.value)}
            placeholder="Ej. 25000000"
            className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#FFE500] rounded-xl px-3.5 py-2.5 text-lg font-black text-[#F1F5F9] font-mono focus:outline-none"
          />
          <p className="text-[11px] text-[#8492A6] m-0">
            Al modificar el monto total, los topes en pesos de cada categoría se recalculan automáticamente según su porcentaje.
          </p>
        </div>

        {/* 2. Indicador de Distribución de Porcentajes */}
        <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9]">
                Distribución por Categoría
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  Math.abs(sumaPorcentajes - 100) < 0.2
                    ? 'bg-[#00FF85]/15 text-[#00FF85] border-[#00FF85]/30'
                    : sumaPorcentajes > 100
                    ? 'bg-[#FF2E55]/15 text-[#FF2E55] border-[#FF2E55]/30'
                    : 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/30'
                }`}
              >
                Total: {sumaPorcentajes}%
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {Math.abs(sumaPorcentajes - 100) >= 0.2 && (
                <button
                  type="button"
                  onClick={handleNormalize100}
                  className="text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Ajustar proporcionalmente todas las categorías para que sumen exactamente 100%"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ajustar al 100%</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] font-semibold text-[#8492A6] hover:text-[#F1F5F9] bg-[#151B27] border border-[#1C2436] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Volver a las 6 categorías y porcentajes originales"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Por defecto</span>
              </button>
            </div>
          </div>

          {Math.abs(sumaPorcentajes - 100) >= 0.2 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#FFE500]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {sumaPorcentajes > 100
                  ? `La suma de categorías supera el 100% por ${(sumaPorcentajes - 100).toFixed(1)}%.`
                  : `Falta asignar el ${(100 - sumaPorcentajes).toFixed(1)}% del presupuesto total.`}
              </span>
            </div>
          )}

          {/* Lista editable de categorías */}
          <div className="space-y-2 pt-1">
            {categorias.map((item, idx) => {
              const montoCOP = Math.round(numPresupuestoTotal * ((Number(item.porcentaje) || 0) / 100));

              return (
                <div
                  key={item.categoria}
                  className="p-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="p-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] text-[#00E5FF] shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] block truncate">
                        {item.categoria}
                      </span>
                      <span className="text-[11px] text-[#00FF85] font-mono font-semibold">
                        $ {montoCOP.toLocaleString()} COP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Input de Porcentaje (%) */}
                    <div className="flex items-center bg-[#0E121B] border border-[#1C2436] focus-within:border-[#00E5FF] rounded-lg px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.porcentaje}
                        onChange={(e) => handlePorcentajeChange(idx, e.target.value)}
                        className="w-14 bg-transparent text-right text-xs font-bold text-[#F1F5F9] font-mono focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#00E5FF] ml-1">%</span>
                    </div>

                    {/* Input de Monto Límite en COP */}
                    <div className="flex items-center bg-[#0E121B] border border-[#1C2436] focus-within:border-[#00FF85] rounded-lg px-2 py-1">
                      <span className="text-[11px] text-[#8492A6] mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={montoCOP}
                        onChange={(e) => handleMontoCategoriaChange(idx, e.target.value)}
                        className="w-24 sm:w-28 bg-transparent text-right text-xs font-bold text-[#00FF85] font-mono focus:outline-none"
                        title="Monto límite en COP para esta categoría"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCategoria(idx)}
                      title={`Eliminar categoría ${item.categoria}`}
                      className="p-1.5 rounded-lg bg-[#0E121B] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Agregar Nueva Categoría Personalizada */}
        <div className="p-3.5 rounded-xl bg-[#151B27] border border-dashed border-[#00E5FF]/40 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00E5FF] flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Agregar Nueva Categoría de Presupuesto
          </span>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Ej. Seguros, Visas, Conectividad, Regalos..."
              value={nuevaCatNombre}
              onChange={(e) => setNuevaCatNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategoria(e);
              }}
              className="flex-1 bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] placeholder-[#8492A6] focus:outline-none"
            />

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#0E121B] border border-[#1C2436] focus-within:border-[#00E5FF] rounded-lg px-2.5 py-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={nuevaCatPorcentaje}
                  onChange={(e) => setNuevaCatPorcentaje(e.target.value)}
                  className="w-12 bg-transparent text-right text-xs font-bold text-[#F1F5F9] font-mono focus:outline-none"
                />
                <span className="text-xs font-bold text-[#00E5FF] ml-1">%</span>
              </div>

              <button
                type="button"
                onClick={handleAddCategoria}
                className="px-3.5 py-2 rounded-lg bg-[#00E5FF] hover:opacity-90 text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ConfigurarPresupuestoModal;

