import React from 'react';
import {
  Plane,
  RefreshCw,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  CornerDownRight
} from 'lucide-react';
import AirportCityInput from '../../../../components/AirportCityInput';
import CountryInput from '../../../../components/CountryInput';

export function VueloTramoSection({
  isEditing,
  tipo,
  tipoTrayecto,
  setTipoTrayecto,
  // Outbound
  aeropuertoOrigen,
  ciudadOrigen,
  paisOrigen,
  aeropuertoDestino,
  ciudadDestino,
  paisDestino,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  tieneConexion,
  setTieneConexion,
  aeropuertoConexion,
  setAeropuertoConexion,
  ciudadConexion,
  setCiudadConexion,
  paisConexion,
  setPaisConexion,
  horasEscala,
  escalaMayor24h,
  setEscalaMayor24h,
  handleOutboundOriginChange,
  handleOutboundDestChange,
  handleHorasEscalaChange,
  // Return
  handleSwapReturnLocations,
  aeropuertoOrigenRegreso,
  setAeropuertoOrigenRegreso,
  ciudadOrigenRegreso,
  setCiudadOrigenRegreso,
  paisOrigenRegreso,
  setPaisOrigenRegreso,
  aeropuertoDestinoRegreso,
  setAeropuertoDestinoRegreso,
  ciudadDestinoRegreso,
  setCiudadDestinoRegreso,
  paisDestinoRegreso,
  setPaisDestinoRegreso,
  fechaInicioRegreso,
  setFechaInicioRegreso,
  fechaFinRegreso,
  setFechaFinRegreso,
  tieneConexionRegreso,
  setTieneConexionRegreso,
  aeropuertoConexionRegreso,
  setAeropuertoConexionRegreso,
  ciudadConexionRegreso,
  setCiudadConexionRegreso,
  paisConexionRegreso,
  setPaisConexionRegreso,
  horasEscalaRegreso,
  escalaMayor24hRegreso,
  setEscalaMayor24hRegreso
}) {
  return (
    <div className="space-y-3.5">
      {/* Selector Round-Trip vs One-Way para vuelos */}
      {tipo === 'vuelo' && (
        <div className="p-1.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2">
          <span className="text-[10px] font-bold text-[#8492A6] uppercase tracking-wider block px-1">
            Modalidad de Trayecto Aéreo
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoTrayecto('round-trip')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                tipoTrayecto === 'round-trip'
                  ? 'bg-[#00E5FF] text-[#080A0F] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'bg-[#151B27] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Round-Trip (Ida y Vuelta)</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoTrayecto('one-way')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                tipoTrayecto === 'one-way'
                  ? 'bg-[#00E5FF] text-[#080A0F] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'bg-[#151B27] text-[#8492A6] border-[#1C2436] hover:text-[#F1F5F9]'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>One-Way (Solo Ida)</span>
            </button>
          </div>
        </div>
      )}

      {/* Tramo 1: Salida / Ida */}
      <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#1C2436] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/30">
              <Plane className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-[#00FF85] uppercase tracking-wider">
              {tipoTrayecto === 'round-trip' && !isEditing ? 'Tramo 1: Vuelo de Salida (Ida 🛫)' : 'Ruta Aérea (Origen y Destino)'}
            </span>
          </div>
          <span className="text-[10px] text-[#8492A6] font-semibold">
            {aeropuertoOrigen || ciudadOrigen || 'Origen'} ➔ {aeropuertoDestino || ciudadDestino || 'Destino'}
          </span>
        </div>

        {/* Origen */}
        <div>
          <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00FF85]" /> Origen de Salida
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <AirportCityInput
              type="airport"
              placeholder="Aeropuerto (Ej. MDE)"
              value={aeropuertoOrigen}
              onChange={(val) => handleOutboundOriginChange(undefined, undefined, val)}
              onSelectAirportOrCity={(item) => {
                handleOutboundOriginChange(item.city || ciudadOrigen, item.countryWithFlag || paisOrigen, item.iata);
              }}
            />
            <input
              type="text"
              placeholder="Ciudad (Ej. Medellín)"
              value={ciudadOrigen}
              onChange={(e) => handleOutboundOriginChange(e.target.value, undefined, undefined)}
              className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
            />
            <CountryInput
              value={paisOrigen}
              onChange={(val) => handleOutboundOriginChange(undefined, val, undefined)}
              placeholder="País (Ej. Colombia)"
            />
          </div>
        </div>

        {/* Destino */}
        <div className="pt-2 border-t border-[#1C2436]">
          <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Destino de Llegada
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <AirportCityInput
              type="airport"
              placeholder="Aeropuerto (Ej. MAD)"
              value={aeropuertoDestino}
              onChange={(val) => handleOutboundDestChange(undefined, undefined, val)}
              onSelectAirportOrCity={(item) => {
                handleOutboundDestChange(item.city || ciudadDestino, item.countryWithFlag || paisDestino, item.iata);
              }}
            />
            <input
              type="text"
              placeholder="Ciudad (Ej. Madrid)"
              value={ciudadDestino}
              onChange={(e) => handleOutboundDestChange(e.target.value, undefined, undefined)}
              className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
            />
            <CountryInput
              value={paisDestino}
              onChange={(val) => handleOutboundDestChange(undefined, val, undefined)}
              placeholder="País (Ej. España)"
            />
          </div>
        </div>

        {/* Horarios Tramo 1 */}
        <div className="pt-2 border-t border-[#1C2436] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00FF85]" /> Salida de Ida *
            </label>
            <input
              type="datetime-local"
              required
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Llegada Estimada (Opcional)
            </label>
            <input
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
            />
          </div>
        </div>

        {/* Escala Tramo 1 */}
        <div className="pt-2 border-t border-[#1C2436]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tieneConexion}
              onChange={(e) => setTieneConexion(e.target.checked)}
              className="w-4 h-4 rounded border-[#1C2436] accent-[#FFE500]"
            />
            <span className="text-xs text-[#F1F5F9] font-medium flex items-center gap-1">
              <CornerDownRight className="w-3.5 h-3.5 text-[#FFE500]" />
              ¿Tiene escala o conexión en este tramo?
            </span>
          </label>

          {tieneConexion && (
            <div className="mt-2.5 p-3 rounded-lg bg-[#151B27] border border-[#FFE500]/30 space-y-2.5">
              <span className="text-[10px] font-bold text-[#FFE500] uppercase tracking-wider block">
                Aeropuerto y Lugar de Escala
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <AirportCityInput
                  type="airport"
                  placeholder="Aeropuerto escala (Ej. BOG / MIA)"
                  value={aeropuertoConexion}
                  onChange={setAeropuertoConexion}
                  onSelectAirportOrCity={(item) => {
                    setAeropuertoConexion(item.iata);
                    if (item.city && !ciudadConexion) setCiudadConexion(item.city);
                    if (item.countryWithFlag && !paisConexion) setPaisConexion(item.countryWithFlag);
                  }}
                />
                <input
                  type="text"
                  placeholder="Ciudad conexión (Ej. Bogotá)"
                  value={ciudadConexion}
                  onChange={(e) => setCiudadConexion(e.target.value)}
                  className="bg-[#0E121B] border border-[#1C2436] focus:border-[#FFE500] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                />
                <CountryInput
                  value={paisConexion}
                  onChange={setPaisConexion}
                  placeholder="País conexión"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-36">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Horas escala (ej. 3)"
                    value={horasEscala}
                    onChange={(e) => handleHorasEscalaChange(e.target.value, false)}
                    className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#FFE500] rounded px-2 py-1 text-xs text-[#F1F5F9]"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-[11px] text-[#8492A6] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={escalaMayor24h}
                    onChange={(e) => setEscalaMayor24h(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#00FF85]"
                  />
                  <span>Stopover (+24h)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tramo 2: Retorno / Regreso (Para Vuelos Round-Trip en creación) */}
      {tipo === 'vuelo' && tipoTrayecto === 'round-trip' && !isEditing && (
        <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#00E5FF]/40 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-[#1C2436] pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                <RefreshCw className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
                Tramo 2: Vuelo de Retorno (Regreso 🛬)
              </span>
            </div>
            <button
              type="button"
              onClick={handleSwapReturnLocations}
              className="text-[10px] font-bold text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
              title="Restaurar trayecto invertido exacto (Destino ➔ Origen)"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Restaurar Inverso</span>
            </button>
          </div>

          {/* Origen de Regreso */}
          <div>
            <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Salida de Retorno
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <AirportCityInput
                type="airport"
                placeholder="Aeropuerto (Ej. MAD)"
                value={aeropuertoOrigenRegreso || aeropuertoDestino}
                onChange={setAeropuertoOrigenRegreso}
                onSelectAirportOrCity={(item) => {
                  setAeropuertoOrigenRegreso(item.iata);
                  if (item.city) setCiudadOrigenRegreso(item.city);
                  if (item.countryWithFlag) setPaisOrigenRegreso(item.countryWithFlag);
                }}
              />
              <input
                type="text"
                placeholder="Ciudad salida retorno"
                value={ciudadOrigenRegreso || ciudadDestino}
                onChange={(e) => setCiudadOrigenRegreso(e.target.value)}
                className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
              />
              <CountryInput
                value={paisOrigenRegreso || paisDestino}
                onChange={setPaisOrigenRegreso}
                placeholder="País retorno"
              />
            </div>
          </div>

          {/* Destino de Regreso */}
          <div className="pt-2 border-t border-[#1C2436]">
            <span className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wide block mb-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00FF85]" /> Destino Final de Retorno
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <AirportCityInput
                type="airport"
                placeholder="Aeropuerto llegada (Ej. MDE)"
                value={aeropuertoDestinoRegreso || aeropuertoOrigen}
                onChange={setAeropuertoDestinoRegreso}
                onSelectAirportOrCity={(item) => {
                  setAeropuertoDestinoRegreso(item.iata);
                  if (item.city) setCiudadDestinoRegreso(item.city);
                  if (item.countryWithFlag) setPaisDestinoRegreso(item.countryWithFlag);
                }}
              />
              <input
                type="text"
                placeholder="Ciudad llegada retorno"
                value={ciudadDestinoRegreso || ciudadOrigen}
                onChange={(e) => setCiudadDestinoRegreso(e.target.value)}
                className="bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
              />
              <CountryInput
                value={paisDestinoRegreso || paisOrigen}
                onChange={setPaisDestinoRegreso}
                placeholder="País llegada retorno"
              />
            </div>
          </div>

          {/* Horarios de Regreso */}
          <div className="pt-2 border-t border-[#1C2436] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Salida de Retorno *
              </label>
              <input
                type="datetime-local"
                required
                value={fechaInicioRegreso}
                onChange={(e) => setFechaInicioRegreso(e.target.value)}
                className="w-full bg-[#151B27] border border-[#00E5FF]/40 focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FFE500]" /> Llegada de Retorno (Opcional)
              </label>
              <input
                type="datetime-local"
                value={fechaFinRegreso}
                onChange={(e) => setFechaFinRegreso(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00E5FF] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
              />
            </div>
          </div>

          {/* Escala Tramo de Regreso */}
          <div className="pt-2 border-t border-[#1C2436]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tieneConexionRegreso}
                onChange={(e) => setTieneConexionRegreso(e.target.checked)}
                className="w-4 h-4 rounded border-[#1C2436] accent-[#00E5FF]"
              />
              <span className="text-xs text-[#F1F5F9] font-medium flex items-center gap-1">
                <CornerDownRight className="w-3.5 h-3.5 text-[#00E5FF]" />
                ¿El vuelo de regreso tiene escala o conexión?
              </span>
            </label>

            {tieneConexionRegreso && (
              <div className="mt-2.5 p-3 rounded-lg bg-[#151B27] border border-[#00E5FF]/30 space-y-2.5">
                <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider block">
                  Aeropuerto y Lugar de Escala (Regreso)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <AirportCityInput
                    type="airport"
                    placeholder="Aeropuerto escala"
                    value={aeropuertoConexionRegreso}
                    onChange={setAeropuertoConexionRegreso}
                    onSelectAirportOrCity={(item) => {
                      setAeropuertoConexionRegreso(item.iata);
                      if (item.city) setCiudadConexionRegreso(item.city);
                      if (item.countryWithFlag) setPaisConexionRegreso(item.countryWithFlag);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Ciudad conexión regreso"
                    value={ciudadConexionRegreso}
                    onChange={(e) => setCiudadConexionRegreso(e.target.value)}
                    className="bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                  />
                  <CountryInput
                    value={paisConexionRegreso}
                    onChange={setPaisConexionRegreso}
                    placeholder="País conexión"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-36">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Horas escala (ej. 3)"
                      value={horasEscalaRegreso}
                      onChange={(e) => handleHorasEscalaChange(e.target.value, true)}
                      className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00E5FF] rounded px-2 py-1 text-xs text-[#F1F5F9]"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-[#8492A6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={escalaMayor24hRegreso}
                      onChange={(e) => setEscalaMayor24hRegreso(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#00FF85]"
                    />
                    <span>Stopover (+24h)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VueloTramoSection;

