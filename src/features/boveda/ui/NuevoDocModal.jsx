import React, { useState } from 'react';
import Modal from '../../../components/Modal';

export function NuevoDocModal({ isOpen, onClose, onSaveDocumento }) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('reserva');
  const [archivoUrl, setArchivoUrl] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !archivoUrl.trim()) {
      setErrorMsg('Por favor completa el título y el enlace o código del documento');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await onSaveDocumento({
        titulo: titulo.trim(),
        tipo,
        archivoUrl: archivoUrl.trim(),
        tamanoBytes: 150000, // 150KB referencial
        notas: notas.trim() || undefined
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Documento a la Bóveda">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Título del Documento *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Boleto de Avión Bogotá - Tokio"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#B55FE6] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Tipo de Documento *
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#B55FE6] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none cursor-pointer"
          >
            <option value="reserva">Confirmación / Reserva de Hotel o Vuelo</option>
            <option value="qr">Código QR de Entrada / Embarque</option>
            <option value="pasaporte">Pasaporte / Visa / Seguro Médico</option>
            <option value="recibo">Recibo / Factura</option>
            <option value="otro">Otro Documento</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Enlace, Referencia o URL del Archivo *
          </label>
          <input
            type="text"
            required
            placeholder="https://... o código de reserva #3948"
            value={archivoUrl}
            onChange={(e) => setArchivoUrl(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#B55FE6] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
          <span className="text-[10px] text-[#8492A6] mt-0.5 block">
            Límite de compresión máximo: 2MB (RF 3.3).
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Notas adicionales
          </label>
          <textarea
            rows={2}
            placeholder="Ej. Asiento 14A, Terminal 2"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#B55FE6] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#B55FE6] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity mt-4 cursor-pointer"
        >
          {loading ? 'Guardando...' : 'Guardar en Bóveda'}
        </button>
      </form>
    </Modal>
  );
}

export default NuevoDocModal;
