import React from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  Share2,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import MiniFlag from '../../../../components/MiniFlag';
import { cleanCountryText, fixAccents } from '../../../../utils/countries';

export function ViajeCardItem({
  viaje,
  status,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onShare
}) {
  const startDate = new Date(viaje.fechaInicio);
  const endDate = new Date(viaje.fechaFin);
  const diffDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)));

  return (
    <div
      onClick={() => onSelect(viaje.id)}
      className={`bg-[#0E121B] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-[#00E5FF] hover:shadow-lg hover:shadow-[#00E5FF]/5 group relative cursor-pointer ${
        isActive ? 'border-[#00FF85]' : 'border-[#1C2436]'
      }`}
    >
      {/* Encabezado del Card */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <div className="w-8 h-6 bg-[#151B27] border border-[#1C2436] rounded flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <MiniFlag country={viaje.destino} className="w-6 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#CBD5E1] bg-[#151B27] px-2.5 py-1 rounded-full border border-[#1C2436] truncate max-w-[150px]">
              {cleanCountryText(viaje.destino)}
            </span>
            {viaje.tipoViaje === 'multidestino' && (
              <span className="text-[10px] font-bold text-[#00FF85] bg-[#00FF85]/15 border border-[#00FF85]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Multidestino
              </span>
            )}
          </div>

          {/* Badge de Estado */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${status.bg} ${status.color} ${status.border}`}
          >
            {status.label}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#F1F5F9] m-0 group-hover:text-[#00E5FF] transition-colors">
          {fixAccents(viaje.titulo)}
        </h3>
        {viaje.descripcion && (
          <p className="text-xs text-[#8492A6] mt-1 line-clamp-2 m-0">
            {fixAccents(viaje.descripcion)}
          </p>
        )}

        {/* Metadatos (Origen, Fechas, Duración, Presupuesto) */}
        <div className="mt-4 pt-4 border-t border-[#1C2436] space-y-2 text-xs">
          {viaje.origen && (
            <div className="flex items-center justify-between text-[#8492A6]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
                Origen
              </span>
              <span className="text-[#F1F5F9] font-medium truncate max-w-[170px]">
                {cleanCountryText(viaje.origen)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[#8492A6]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              Fechas
            </span>
            <span className="text-[#F1F5F9] font-medium">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#8492A6]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B55FE6]" />
              Duración
            </span>
            <span className="text-[#F1F5F9] font-medium">
              {diffDays} {diffDays === 1 ? 'día' : 'días'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#8492A6]">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#FFE500]" />
              Presupuesto
            </span>
            <span className="text-[#FFE500] font-bold">
              ${(Number(viaje.presupuestoTotal) || 0).toLocaleString('es-CO')} {viaje.monedaBase || 'COP'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="mt-5 pt-4 border-t border-[#1C2436] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(viaje);
              }}
              title="Compartir bitácora con amigos"
              className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00FF85] text-[#8492A6] hover:text-[#00FF85] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00FF85]" />
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(viaje);
              }}
              title="Editar información del viaje"
              className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#00E5FF] text-[#CBD5E1] hover:text-[#00E5FF] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(viaje);
              }}
              title="Eliminar bitácora de viaje"
              className="p-1.5 rounded-lg bg-[#151B27] border border-[#1C2436] hover:border-[#FF2E55] text-[#8492A6] hover:text-[#FF2E55] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(viaje.id);
          }}
          className="px-3 py-1.5 bg-[#151B27] text-[#00FF85] border border-[#00FF85]/40 hover:bg-[#00FF85] hover:text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer group-hover:bg-[#00FF85] group-hover:text-[#080A0F]"
        >
          <span>Ver Detalle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default ViajeCardItem;

