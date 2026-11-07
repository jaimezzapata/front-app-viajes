import React from 'react';

export function EventoNotasSection({ notas, setNotas }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
        Notas / Anotaciones Adicionales
      </label>
      <textarea
        rows={2}
        placeholder="Ej. Tiquete con equipaje en bodega, reserva en Booking #12345..."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none resize-none"
      />
    </div>
  );
}

export default EventoNotasSection;

