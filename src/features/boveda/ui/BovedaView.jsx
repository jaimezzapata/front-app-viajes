import React from 'react';
import {
  ShieldCheck,
  Plus,
  QrCode,
  FileText,
  FileBadge,
  CreditCard,
  Download,
  ExternalLink
} from 'lucide-react';
import WatermarkIcon from '../../../components/WatermarkIcon';
import { cleanCountryText } from '../../../utils/countries';

const DOC_ICONS = {
  qr: QrCode,
  reserva: FileBadge,
  pasaporte: FileText,
  recibo: CreditCard,
  otro: ShieldCheck
};

export function BovedaView({
  activeViaje,
  documentos = [],
  onAddDocumento,
  onOpenNuevoViaje
}) {
  if (!activeViaje) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
        <WatermarkIcon icon={ShieldCheck} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#B55FE6]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="w-2.5 h-2.5 bg-[#B55FE6] rounded-sm" />
          <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] m-0 uppercase">Bóveda de Documentos</h2>
        </div>
        <div className="p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center relative z-10">
          <ShieldCheck className="w-12 h-12 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[#F1F5F9] m-0">No hay viajes registrados</h3>
          <p className="text-xs text-[#8492A6] mt-1 max-w-sm mx-auto">
            Para almacenar documentos de viaje, reservas y pasaportes offline, primero debes crear un viaje en la base de datos.
          </p>
          {onOpenNuevoViaje && (
            <button
              onClick={onOpenNuevoViaje}
              className="mt-4 px-4 py-2 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              + Crear Primer Viaje
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] pb-24 md:pb-8">
      {/* Marca de agua sólida */}
      <WatermarkIcon icon={ShieldCheck} className="w-80 h-80 top-4 right-2" opacity="opacity-[0.03]" color="text-[#B55FE6]" />

      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B55FE6] shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F1F5F9] m-0">
              Bóveda de Documentos
            </h2>
            {activeViaje?.destino && (
              <span className="text-xs sm:text-sm font-semibold text-[#B55FE6] bg-[#B55FE6]/10 border border-[#B55FE6]/20 px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-md">
                {cleanCountryText(activeViaje.destino)}
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-[#8492A6] m-0">
            Almacenamiento seguro offline de reservas, códigos QR y pasaportes (máx 2MB).
          </p>
        </div>

        <button
          onClick={onAddDocumento}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#B55FE6] text-[#080A0F] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Subir Documento
        </button>
      </div>

      {/* Cuadrícula de Documentos */}
      {documentos.length === 0 ? (
        <div className="p-10 rounded-xl bg-[#0E121B] border border-[#1C2436] text-center relative z-10">
          <ShieldCheck className="w-10 h-10 text-[#8492A6] mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold text-[#F1F5F9]">La bóveda está vacía</p>
          <p className="text-xs text-[#8492A6] mt-1">Guarda copias de tus reservas o códigos QR para consultarlos sin internet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {documentos.map((doc) => {
            const Icon = DOC_ICONS[doc.tipo?.toLowerCase()] || ShieldCheck;

            return (
              <div
                key={doc.id}
                className="relative p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] hover:border-[#B55FE6]/40 transition-colors overflow-hidden flex flex-col justify-between"
              >
                <WatermarkIcon icon={Icon} className="w-32 h-32 -bottom-6 -right-6" opacity="opacity-[0.03]" color="text-[#B55FE6]" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="p-2 rounded-lg bg-[#151B27] border border-[#1C2436] text-[#B55FE6]">
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B55FE6] bg-[#B55FE6]/10 px-2 py-0.5 rounded border border-[#B55FE6]/20">
                      {doc.tipo || 'Archivo'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#F1F5F9] m-0 mb-1 line-clamp-1">{doc.titulo}</h4>

                  {doc.tamanoBytes && (
                    <p className="text-[11px] text-[#8492A6] m-0 mb-2">
                      Tamaño: {(doc.tamanoBytes / 1024).toFixed(0)} KB • Disponible Offline
                    </p>
                  )}

                  {doc.notas && (
                    <p className="text-xs text-[#8492A6] bg-[#151B27] p-2 rounded border border-[#1C2436] m-0 mb-3 line-clamp-2">
                      {doc.notas}
                    </p>
                  )}
                </div>

                {/* Acciones del documento */}
                <div className="pt-3 border-t border-[#1C2436] flex items-center justify-between text-xs relative z-10">
                  <span className="text-[10px] text-[#8492A6]">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>

                  {doc.archivoUrl && (
                    <a
                      href={doc.archivoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#00E5FF] hover:underline font-semibold text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BovedaView;
