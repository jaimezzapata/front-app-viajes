import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  FileJson,
  Plane,
  Sparkles,
  ShieldCheck,
  Eye
} from 'lucide-react';
import Modal from '../../../components/Modal';
import MiniFlag from '../../../components/MiniFlag';
import { cleanCountryText, fixAccents } from '../../../utils/countries';
import { toast } from 'sonner';

export function CompartirViajeModal({
  isOpen,
  onClose,
  viaje,
  eventos = [],
  gastos = [],
  onOpenPreview
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!viaje) return null;

  // Construir URL pública para compartir
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Empaquetar snapshot compacto para soporte offline o viaje local
  let shareParam = `share=${viaje.id}`;
  if (viaje.id?.startsWith('viaje-local-') || !navigator.onLine) {
    try {
      const bundle = {
        viaje,
        eventos: eventos.slice(0, 30),
        gastos: gastos.slice(0, 50)
      };
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(bundle)))));
      shareParam = `shareData=${encoded}`;
    } catch {
      shareParam = `share=${viaje.id}`;
    }
  }

  const shareUrl = `${origin}${pathname}?${shareParam}`;

  const cleanDestino = cleanCountryText(viaje.destino);
  const tituloViaje = fixAccents(viaje.titulo || 'Mi Viaje');

  // Mensaje preformateado para WhatsApp y redes
  const whatsappText = `✈️ ¡Hola! Te comparto mi bitácora y ruta de viaje a ${cleanDestino} (${new Date(viaje.fechaInicio).toLocaleDateString()} - ${new Date(viaje.fechaFin).toLocaleDateString()}):
🗺️ Puedes ver el mapa mundi con los trayectos de vuelo, el itinerario detallado y los gastos aquí:
${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  // QR Code interactivo con paleta neón oscura
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=00FF85&bgcolor=0E121B&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('¡Enlace de viaje copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('No se pudo copiar automáticamente. Puedes seleccionarlo manualmente.');
    }
  };

  const handleDownloadJson = () => {
    try {
      const exportData = {
        app: 'Bitácora de Viajes',
        version: '1.0',
        fechaExportacion: new Date().toISOString(),
        viaje,
        itinerario: eventos,
        gastos
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitacora-${viaje.titulo.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Resumen de viaje descargado en formato JSON.');
    } catch {
      toast.error('Error al generar archivo descargable.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir Bitácora de Viaje"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          >
            Cerrar
          </button>

          {onOpenPreview && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPreview(viaje);
              }}
              className="px-4 py-2 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Vista Pública</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Tarjeta de Resumen del Viaje a Compartir */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0A0D14] border border-[#1C2436] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#151B27] border border-[#1C2436] flex items-center justify-center shrink-0 text-[#00FF85]">
              <Plane className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{tituloViaje}</h4>
              <p className="text-xs text-[#8492A6] m-0 mt-0.5 flex items-center gap-1.5 truncate">
                <MiniFlag country={viaje.destino} className="w-4 h-3 shrink-0" />
                <span className="text-[#00E5FF] font-semibold truncate">{cleanDestino}</span>
                <span>•</span>
                <span>{new Date(viaje.fechaInicio).toLocaleDateString()} - {new Date(viaje.fechaFin).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30 shrink-0">
            Público
          </span>
        </div>

        {/* Micro-banner de explicación */}
        <div className="p-3 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/20 text-xs text-[#CBD5E1] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#00FF85] shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed text-[11px] sm:text-xs">
            Cualquier persona con este enlace podrá ver el <strong>mapa interactivo con los países visitados y trayectos de vuelo</strong>, el <strong>itinerario completo</strong> y el <strong>resumen de gastos</strong> sin necesidad de registrarse ni iniciar sesión.
          </p>
        </div>

        {/* Campo Enlace Copiable */}
        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            Enlace para compartir
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-[#151B27] border border-[#1C2436] rounded-xl px-3 py-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="w-full bg-transparent text-xs text-[#F1F5F9] focus:outline-none font-mono truncate select-all"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-[#00FF85] text-[#080A0F] shadow-md shadow-[#00FF85]/20'
                  : 'bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#080A0F]'
              }`}
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Canales Directos de Compartir (WhatsApp, QR y JSON) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Compartir WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-all cursor-pointer text-center no-underline"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </a>

          {/* Toggle Código QR */}
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showQr
                ? 'bg-[#00FF85]/20 border-[#00FF85] text-[#00FF85]'
                : 'bg-[#151B27] border-[#1C2436] hover:border-[#00FF85]/40 text-[#8492A6] hover:text-[#F1F5F9]'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>{showQr ? 'Ocultar QR' : 'Código QR'}</span>
          </button>

          {/* Descargar JSON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:border-[#FFE500]/40 text-[#8492A6] hover:text-[#FFE500] text-xs font-bold transition-all cursor-pointer"
            title="Descargar copia del viaje en JSON"
          >
            <FileJson className="w-4 h-4 shrink-0" />
            <span>Exportar JSON</span>
          </button>
        </div>

        {/* Sección Desplegable: Código QR */}
        {showQr && (
          <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#1C2436] flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-[#8492A6] mb-3">
              Escanea con la cámara de tu smartphone para abrir la bitácora:
            </p>
            <div className="p-3 bg-[#0E121B] rounded-2xl border border-[#00FF85]/30 shadow-xl shadow-[#00FF85]/10">
              <img
                src={qrCodeUrl}
                alt="Código QR de Viaje"
                className="w-44 h-44 rounded-lg block"
                loading="lazy"
              />
            </div>
            <span className="text-[10px] text-[#00E5FF] mt-2 font-mono break-all max-w-xs">
              {shareUrl}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CompartirViajeModal;
