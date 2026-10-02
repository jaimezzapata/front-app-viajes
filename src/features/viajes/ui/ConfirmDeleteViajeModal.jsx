import React, { useState } from 'react';
import { AlertTriangle, Trash2, Calendar, DollarSign, X } from 'lucide-react';
import Modal from '../../../components/Modal';
import { getCountryFlag } from '../../../utils/countries';

export function ConfirmDeleteViajeModal({ isOpen, onClose, viaje, onConfirmDelete }) {
  const [loading, setLoading] = useState(false);

  if (!viaje) return null;

  const flag = getCountryFlag(viaje.destino);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirmDelete(viaje.id);
      onClose();
    } catch {
      // Error manejado en hook con toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Bitácora de Viaje"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Cabecera de Advertencia */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FF2E55]/10 border border-[#FF2E55]/30 text-[#FF2E55]">
          <div className="p-2 rounded-lg bg-[#FF2E55]/20 shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#FF2E55]" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider m-0 text-[#FF2E55]">
              ¿Estás seguro de eliminar este viaje?
            </h4>
            <p className="text-[11px] text-[#CBD5E1] mt-1 m-0 leading-relaxed">
              Esta acción eliminará de forma irreversible la bitácora y todos sus vuelos, itinerarios, gastos y documentos asociados.
            </p>
          </div>
        </div>

        {/* Resumen del viaje a eliminar */}
        <div className="p-4 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">{flag}</span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">
                {viaje.titulo}
              </h4>
              <p className="text-xs text-[#00E5FF] font-medium m-0">
                {viaje.destino}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2436] text-[11px] text-[#8492A6]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>
                {new Date(viaje.fechaInicio).toLocaleDateString()} - {new Date(viaje.fechaFin).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <DollarSign className="w-3.5 h-3.5 text-[#FFE500]" />
              <span className="text-[#FFE500] font-semibold">
                ${(Number(viaje.presupuestoTotal) || 0).toLocaleString()} {viaje.monedaBase || 'COP'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#151B27] hover:bg-[#1E2738] border border-[#1C2436] text-[#CBD5E1] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-[#FF2E55] hover:bg-[#FF2E55]/90 text-white text-xs font-bold uppercase tracking-wider transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#FF2E55]/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Eliminando...' : 'Sí, Eliminar Viaje'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteViajeModal;
