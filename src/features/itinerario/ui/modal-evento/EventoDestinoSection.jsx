import React from 'react';
import { MapPin } from 'lucide-react';
import MiniFlag from '../../../../components/MiniFlag';
import CountryInput from '../../../../components/CountryInput';
import { cleanCountryText } from '../../../../utils/countries';

export function EventoDestinoSection({
  availableDestinations = [],
  ciudadDestino,
  setCiudadDestino,
  paisDestino,
  setPaisDestino,
  ubicacion,
  setUbicacion
}) {
  return (
    <div className="p-3 sm:p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-3">
      <div className="flex items-center justify-between border-b border-[#1C2436] pb-2">
        <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
          Destino (País y Ciudad)
        </span>
        <span className="text-[10px] text-[#8492A6]">
          Para separar en el itinerario
        </span>
      </div>

      {/* Accesos rápidos de los destinos configurados en el viaje */}
      {availableDestinations.length > 0 && (
        <div>
          <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block mb-1">
            Destinos del viaje (Asignar con 1 clic):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableDestinations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  if (d.ciudad) setCiudadDestino(d.ciudad);
                  if (d.destino) setPaisDestino(d.destino);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#151B27] hover:bg-[#1E2738] border border-[#1C2436] hover:border-[#00E5FF] text-xs text-[#F1F5F9] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <MiniFlag country={d.destino} className="w-3.5 h-2.5" />
                <span>{d.ciudad ? `${d.ciudad}, ${cleanCountryText(d.destino)}` : cleanCountryText(d.destino)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campos de Ciudad y País */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Ciudad
          </label>
          <input
            type="text"
            placeholder="Ej. Madrid, Tokio, París"
            value={ciudadDestino}
            onChange={(e) => setCiudadDestino(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            País
          </label>
          <CountryInput
            value={paisDestino}
            onChange={(val) => setPaisDestino(val)}
            placeholder="Ej. España, Japón, Francia"
          />
        </div>
      </div>

      {/* Ubicación / Dirección específica */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          Dirección / Lugar específico (Opcional)
        </label>
        <input
          type="text"
          placeholder="Ej. Gran Vía 84, Hotel Riu Plaza, Barrio Shinjuku"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none"
        />
      </div>
    </div>
  );
}

export default EventoDestinoSection;

