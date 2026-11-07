import React from 'react';
import { Compass, Plus, Trash2 } from 'lucide-react';
import CountryInput from '../../../../components/CountryInput';
import AirportCityInput from '../../../../components/AirportCityInput';

export function ViajeRutaStep({
  tipoViaje,
  setTipoViaje,
  titulo,
  setTitulo,
  origen,
  setOrigen,
  destino,
  handleDestinoChange,
  destinosMultidestino,
  handleAddDestino,
  handleRemoveDestino,
  handleUpdateDestinoItem
}) {
  return (
    <div className="space-y-4">
      {/* Selector de Tipo de Viaje */}
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider">
          Tipo de Viaje *
        </label>
        <div className="bg-[#0A0D14] p-1 rounded-xl border border-[#1C2436] grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setTipoViaje('unico')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tipoViaje === 'unico'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-[#8492A6] hover:text-[#F1F5F9] border border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${tipoViaje === 'unico' ? 'bg-[#00E5FF]' : 'bg-[#8492A6]'}`} />
            📍 ÚNICO DESTINO
          </button>

          <button
            type="button"
            onClick={() => setTipoViaje('multidestino')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tipoViaje === 'multidestino'
                ? 'bg-[#00FF85]/15 text-[#00FF85] border border-[#00FF85]/40 shadow-sm'
                : 'text-[#8492A6] hover:text-[#F1F5F9] border border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${tipoViaje === 'multidestino' ? 'bg-[#00FF85]' : 'bg-[#8492A6]'}`} />
            🗺️ MULTIDESTINO
          </button>
        </div>
      </div>

      {/* Nombre del Viaje */}
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
          Nombre de la Bitácora / Viaje *
        </label>
        <input
          type="text"
          required
          placeholder="Ej. Vacaciones en Brasil 2026 o Eurotrip Primavera"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none placeholder:text-[#8492A6]/40"
        />
      </div>

      {/* Punto de Partida (Origen) */}
      <div>
        <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
          Punto de Partida (Origen del Viaje)
        </label>
        <AirportCityInput
          type="both"
          placeholder="Aeropuerto o ciudad de salida (Ej. MDE, Bogotá o Medellín)..."
          value={origen}
          onChange={setOrigen}
          onSelectAirportOrCity={(item) => {
            const label = item.iata
              ? `${item.flagEmoji} ${item.city} (${item.iata})`
              : `${item.flagEmoji} ${item.city}`;
            setOrigen(label);
          }}
        />
      </div>

      {/* Destino Único */}
      {tipoViaje === 'unico' && (
        <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436]">
          <CountryInput
            label="Destino Principal (País)"
            required
            placeholder="Ej. Brasil, México, Japón o España"
            value={destino}
            onChange={handleDestinoChange}
          />
        </div>
      )}

      {/* Destinos Multidestino */}
      {tipoViaje === 'multidestino' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0E121B] border border-[#00FF85]/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#00FF85] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Destinos de la Ruta
            </span>
            <button
              type="button"
              onClick={handleAddDestino}
              className="text-[11px] font-bold text-[#00FF85] hover:text-[#00FF85]/80 bg-[#00FF85]/10 border border-[#00FF85]/30 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Añadir Destino</span>
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {destinosMultidestino.map((item, idx) => (
              <div key={item.id} className="p-3 rounded-lg bg-[#151B27] border border-[#1C2436] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#00E5FF]">Destino #{idx + 1}</span>
                  {destinosMultidestino.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDestino(idx)}
                      className="text-[#FF2E55] hover:opacity-80 p-1 cursor-pointer"
                      title="Eliminar tramo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <CountryInput
                    label="País de Destino"
                    required
                    placeholder="Ej. Japón, Corea o Brasil"
                    value={item.destino}
                    onChange={(val) => handleUpdateDestinoItem(idx, 'destino', val)}
                  />
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
                      Ciudad Específica (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Kioto, Seúl o Río"
                      value={item.ciudad || ''}
                      onChange={(e) => handleUpdateDestinoItem(idx, 'ciudad', e.target.value)}
                      className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ViajeRutaStep;

