import React, { useState } from 'react';
import { RefreshCw, Database, CloudUpload, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../../../components/Modal';

export function SyncCleanModal({ isOpen, onClose, onConfirmSync }) {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      await onConfirmSync();
      onClose();
    } catch {
      // Error manejado en hook con sonner toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title="Sincronizar y Limpiar Caché Local"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Cabecera Informativa con Alerta */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
          <div className="p-2 rounded-lg bg-[#00E5FF]/20 shrink-0">
            <RefreshCw className="w-5 h-5 text-[#00E5FF]" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider m-0 text-[#00E5FF]">
              Sincronización con la Base de Datos
            </h4>
            <p className="text-[11px] text-[#CBD5E1] mt-1 m-0 leading-relaxed">
              Esta acción tomará los datos registrados localmente en este dispositivo, los enviará a la base de datos en la nube y purgará la memoria temporal offline.
            </p>
          </div>
        </div>

        {/* Pasos que se ejecutarán */}
        <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2.5 text-xs text-[#CBD5E1]">
          <div className="flex items-start gap-2.5">
            <CloudUpload className="w-4 h-4 text-[#00FF85] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F1F5F9]">1. Subida a la Base de Datos:</span>
              <p className="text-[11px] text-[#8492A6] m-0">
                Se enviarán todos los viajes, itinerarios y gastos creados offline hacia Supabase.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Trash2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F1F5F9]">2. Purgado de Caché Local:</span>
              <p className="text-[11px] text-[#8492A6] m-0">
                Se limpiará la memoria del navegador para eliminar posibles datos corruptos o duplicados.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Database className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F1F5F9]">3. Recarga Oficial en Tiempo Real:</span>
              <p className="text-[11px] text-[#8492A6] m-0">
                Se descargará el estado actualizado desde el servidor para que tu PC y celular estén sincronizados.
              </p>
            </div>
          </div>
        </div>

        {/* Nota preventiva */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0E121B] border border-[#1C2436] text-[11px] text-[#8492A6]">
          <AlertCircle className="w-3.5 h-3.5 text-[#00FF85] shrink-0" />
          <span>Asegúrate de contar con conexión a internet antes de iniciar.</span>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#151B27] hover:bg-[#1E2738] border border-[#1C2436] text-[#CBD5E1] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSync}
            className="px-4 py-2 rounded-lg bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#00FF85]/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Sincronizando...' : 'Sincronizar y Limpiar'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SyncCleanModal;
