import React from 'react';

export function EventoTipoBasicoSection({ tipo, onTipoChange, titulo, onTituloChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          Tipo de Evento *
        </label>
        <select
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none cursor-pointer"
        >
          <option value="vuelo">✈️ Vuelo</option>
          <option value="transporte">🚆 Transporte / Tren / Bus</option>
          <option value="hotel">🏨 Hotel / Alojamiento</option>
          <option value="atraccion">📍 Atracción / Paseo</option>
          <option value="comida">🍴 Comida / Restaurante</option>
          <option value="otro">📌 Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          Título / Referencia {tipo === 'vuelo' ? '(Opcional)' : '*'}
        </label>
        <input
          type="text"
          required={tipo !== 'vuelo'}
          placeholder={
            tipo === 'vuelo'
              ? 'Ej. Avianca AV010 / Latam'
              : 'Ej. Visita al Templo Senso-ji'
          }
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
        />
      </div>
    </div>
  );
}

export default EventoTipoBasicoSection;

