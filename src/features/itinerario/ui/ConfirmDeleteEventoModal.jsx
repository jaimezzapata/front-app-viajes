import React, { useState } from 'react';
import { AlertTriangle, Trash2, Clock, Plane, Calendar, X } from 'lucide-react';
import Modal from '../../../components/Modal';
import MiniFlag from '../../../components/MiniFlag';

export function ConfirmDeleteEventoModal({ isOpen, onClose, evento, onConfirmDelete }) {
  const [loading, setLoading] = useState(false);

  if (!evento) return null;

  const isVuelo = (evento.tipo || '').toLowerCase() === 'vuelo';

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirmDelete(evento.id);
      onClose();
    } catch {
      // Error manejado en hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isVuelo ? 'Eliminar Vuelo' : 'Eliminar Evento'}
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
              {isVuelo ? '¿Eliminar este trayecto aéreo?' : '¿Eliminar este evento del itinerario?'}
            </h4>
            <p className="text-[11px] text-[#CBD5E1] mt-1 m-0 leading-relaxed">
              Esta acción quitará el evento de la línea de tiempo y de las rutas de vuelo en el mapa.
            </p>
          </div>
        </div>

        {/* Resumen del evento/vuelo */}
        <div className="p-4 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E121B] border border-[#1C2436] flex items-center justify-center shrink-0 text-[#00E5FF]">
              <Plane className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 inline-block mb-1">
                {evento.tipo || 'Evento'}
              </span>
              <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">
                {evento.titulo}
              </h4>
            </div>
          </div>

          {/* Si es vuelo con logística de ruta */}
          {(evento.ciudadOrigen || evento.ciudadDestino || evento.aeropuertoOrigen || evento.aeropuertoDestino) && (
            <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1C2436] text-xs space-y-1">
              <div className="flex items-center justify-between text-[#8492A6]">
                <span className="flex items-center gap-1.5 text-[#00FF85] font-semibold">
                  <MiniFlag country={evento.paisOrigen} className="w-4 h-2.5" />
                  <span>{evento.ciudadOrigen || 'Origen'} {evento.aeropuertoOrigen ? `(${evento.aeropuertoOrigen})` : ''}</span>
                </span>
                <span className="text-[#00E5FF] font-black">➔</span>
                <span className="flex items-center gap-1.5 text-[#00E5FF] font-semibold">
                  <MiniFlag country={evento.paisDestino} className="w-4 h-2.5" />
                  <span>{evento.ciudadDestino || 'Destino'} {evento.aeropuertoDestino ? `(${evento.aeropuertoDestino})` : ''}</span>
                </span>
              </div>
            </div>
          )}

          {/* Horario */}
          {evento.fechaInicio && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#8492A6] pt-1 border-t border-[#1C2436]">
              <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>
                {new Date(evento.fechaInicio).toLocaleDateString()} • {new Date(evento.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] text-xs font-semibold text-[#CBD5E1] hover:text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#FF2E55] hover:opacity-90 text-[#F1F5F9] text-xs font-bold uppercase tracking-wider transition-opacity cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#FF2E55]/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Eliminar Vuelo</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteEventoModal;
