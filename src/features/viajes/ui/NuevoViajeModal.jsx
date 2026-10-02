import React, { useState, useEffect } from 'react';
import { Plane, Calendar, DollarSign, MapPin, Plus, Trash2, GitCommit, ArrowRight, Compass } from 'lucide-react';
import Modal from '../../../components/Modal';
import CountryInput from '../../../components/CountryInput';
import AirportCityInput from '../../../components/AirportCityInput';
import { CurrencySelector, LiveCurrencyConversions } from '../../../components/CurrencySelector';
import { detectCountry } from '../../../utils/countries';
import { formatWithMiniFlag } from '../../../services/geoApiService';

const CURRENCY_BY_COUNTRY = {
  JP: 'JPY',
  US: 'USD',
  ES: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  DE: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  GB: 'GBP',
  CO: 'COP',
  MX: 'MXN',
  AR: 'ARS',
  BR: 'BRL',
  CL: 'CLP',
  PE: 'PEN',
  PA: 'USD',
  EC: 'USD',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  TR: 'TRY',
  AE: 'AED',
  KR: 'KRW',
  CN: 'CNY',
  TH: 'THB'
};

export function NuevoViajeModal({ isOpen, onClose, onSaveViaje, viajeAEditar, onUpdateViaje }) {
  const isEditing = Boolean(viajeAEditar);

  // Modo: 'unico' | 'multidestino'
  const [tipoViaje, setTipoViaje] = useState('unico');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [escalas, setEscalas] = useState('');

  // Lista dinámica de paradas para multidestino
  const [destinosMultidestino, setDestinosMultidestino] = useState([
    { id: '1', destino: '', ciudad: '', tieneEscala: false, escala: '', horasEscala: '', escalaMayor24h: false },
    { id: '2', destino: '', ciudad: '', tieneEscala: false, escala: '', horasEscala: '', escalaMayor24h: false }
  ]);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuestoTotal, setPresupuestoTotal] = useState('');
  const [monedaLocal, setMonedaLocal] = useState('USD');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar datos al abrir en modo edición
  useEffect(() => {
    if (viajeAEditar) {
      setTipoViaje(viajeAEditar.tipoViaje || 'unico');
      setTitulo(viajeAEditar.titulo || '');
      setDescripcion(viajeAEditar.descripcion || '');
      setOrigen(viajeAEditar.origen || '');
      setDestino(viajeAEditar.destino || '');
      setEscalas(viajeAEditar.escalas || '');

      if (Array.isArray(viajeAEditar.destinosMultidestino) && viajeAEditar.destinosMultidestino.length > 0) {
        setDestinosMultidestino(viajeAEditar.destinosMultidestino);
      } else {
        setDestinosMultidestino([
          { id: '1', destino: viajeAEditar.destino || '', ciudad: '', tieneEscala: Boolean(viajeAEditar.escalas), escala: viajeAEditar.escalas || '', horasEscala: '', escalaMayor24h: false },
          { id: '2', destino: '', ciudad: '', tieneEscala: false, escala: '', horasEscala: '', escalaMayor24h: false }
        ]);
      }

      setFechaInicio(viajeAEditar.fechaInicio ? viajeAEditar.fechaInicio.split('T')[0] : '');
      setFechaFin(viajeAEditar.fechaFin ? viajeAEditar.fechaFin.split('T')[0] : '');
      setPresupuestoTotal(viajeAEditar.presupuestoTotal !== undefined ? String(viajeAEditar.presupuestoTotal) : '');
      setMonedaLocal(viajeAEditar.monedaLocal || 'USD');
    } else {
      setTipoViaje('unico');
      setTitulo('');
      setDescripcion('');
      setOrigen('');
      setDestino('');
      setEscalas('');
      setDestinosMultidestino([
        { id: '1', destino: '', ciudad: '', tieneEscala: false, escala: '', horasEscala: '', escalaMayor24h: false },
        { id: '2', destino: '', ciudad: '', tieneEscala: false, escala: '', horasEscala: '', escalaMayor24h: false }
      ]);
      setFechaInicio('');
      setFechaFin('');
      setPresupuestoTotal('');
      setMonedaLocal('USD');
    }
    setErrorMsg('');
  }, [viajeAEditar, isOpen]);

  const handleDestinoChange = (newDestino) => {
    setDestino(newDestino);
    const country = detectCountry(newDestino);
    if (country && CURRENCY_BY_COUNTRY[country.code]) {
      setMonedaLocal(CURRENCY_BY_COUNTRY[country.code]);
    }
  };

  // Manejo de la lista dinámica de destinos para multidestino
  const handleAddDestino = () => {
    setDestinosMultidestino(prev => [
      ...prev,
      { id: String(Date.now()), destino: '', ciudad: '', tieneEscala: false, escala: '', horasEscala: '', escalaMayor24h: false }
    ]);
  };

  const handleRemoveDestino = (index) => {
    if (destinosMultidestino.length <= 1) return;
    setDestinosMultidestino(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateDestinoItem = (index, field, value) => {
    setDestinosMultidestino(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Si cambia el destino, sugerir moneda
      if (field === 'destino') {
        const country = detectCountry(value);
        if (country && CURRENCY_BY_COUNTRY[country.code]) {
          setMonedaLocal(CURRENCY_BY_COUNTRY[country.code]);
        }
      }

      // Si cambian las horas de escala, deducir escalaMayor24h
      if (field === 'horasEscala') {
        const num = Number(value);
        if (!isNaN(num) && num >= 24) {
          updated[index].escalaMayor24h = true;
        } else if (!isNaN(num) && num < 24) {
          updated[index].escalaMayor24h = false;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !fechaInicio || !fechaFin) {
      setErrorMsg('Por favor completa todos los campos obligatorios');
      return;
    }

    if (tipoViaje === 'unico' && !destino.trim()) {
      setErrorMsg('Por favor indica el destino principal');
      return;
    }

    if (tipoViaje === 'multidestino') {
      const filledStops = destinosMultidestino.filter(d => d.destino && d.destino.trim());
      if (filledStops.length === 0) {
        setErrorMsg('Por favor indica al menos un destino en la ruta multidestino');
        return;
      }
    }

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setErrorMsg('La fecha de fin no puede ser anterior a la de inicio');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      let finalDestino = '';
      let cleanDestinosList = [];

      if (tipoViaje === 'multidestino') {
        cleanDestinosList = destinosMultidestino
          .filter(d => d.destino && d.destino.trim())
          .map(d => ({
            ...d,
            destino: formatWithMiniFlag(d.destino.trim()),
            ciudad: d.ciudad ? d.ciudad.trim() : undefined,
            escala: d.tieneEscala && d.escala ? formatWithMiniFlag(d.escala.trim()) : undefined,
            horasEscala: d.tieneEscala && d.horasEscala ? Number(d.horasEscala) : undefined,
            escalaMayor24h: d.tieneEscala ? Boolean(d.escalaMayor24h || (d.horasEscala && Number(d.horasEscala) >= 24)) : false
          }));

        finalDestino = cleanDestinosList.map(d => d.destino).join(' ➔ ');
      } else {
        finalDestino = formatWithMiniFlag(destino.trim());
      }

      const formattedOrigen = origen.trim() ? formatWithMiniFlag(origen.trim()) : undefined;

      const payload = {
        titulo: titulo.trim(),
        tipoViaje,
        descripcion: descripcion.trim() || undefined,
        origen: formattedOrigen,
        destino: finalDestino,
        escalas: tipoViaje === 'unico' && escalas.trim() ? formatWithMiniFlag(escalas.trim()) : undefined,
        destinosMultidestino: tipoViaje === 'multidestino' ? cleanDestinosList : undefined,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString(),
        presupuestoTotal: presupuestoTotal ? Number(presupuestoTotal) : 0,
        monedaBase: viajeAEditar?.monedaBase || 'COP',
        monedaReferencia: viajeAEditar?.monedaReferencia || 'USD',
        monedaLocal: monedaLocal.toUpperCase()
      };

      if (isEditing && onUpdateViaje) {
        await onUpdateViaje(viajeAEditar.id, payload);
      } else {
        await onSaveViaje(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Configuración del Viaje' : 'Configurar Nuevo Viaje'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 rounded bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* SELECTOR: Único Destino vs Multidestino */}
        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1.5 uppercase tracking-wider">
            Tipo de Viaje *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoViaje('unico')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                tipoViaje === 'unico'
                  ? 'bg-[#151B27] border-[#00E5FF] text-[#F1F5F9] shadow-md shadow-[#00E5FF]/10'
                  : 'bg-[#0E121B] border-[#1C2436] text-[#8492A6] hover:border-[#1C2436]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tipoViaje === 'unico' ? 'bg-[#00E5FF]' : 'bg-[#8492A6]'}`} />
                <span className="font-bold text-xs uppercase tracking-wider text-[#F1F5F9]">
                  📍 Único Destino
                </span>
              </div>
              <p className="text-[11px] text-[#8492A6] m-0">
                Viaje con un destino principal y conexiones directas.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTipoViaje('multidestino')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                tipoViaje === 'multidestino'
                  ? 'bg-[#151B27] border-[#00FF85] text-[#F1F5F9] shadow-md shadow-[#00FF85]/10'
                  : 'bg-[#0E121B] border-[#1C2436] text-[#8492A6] hover:border-[#1C2436]/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tipoViaje === 'multidestino' ? 'bg-[#00FF85]' : 'bg-[#8492A6]'}`} />
                <span className="font-bold text-xs uppercase tracking-wider text-[#F1F5F9]">
                  🗺️ Multidestino
                </span>
              </div>
              <p className="text-[11px] text-[#8492A6] m-0">
                Ruta con múltiples destinos (se resaltan en el mapa mundi).
              </p>
            </button>
          </div>
        </div>

        {/* Banner Informativo dinámico según regla de negocio */}
        {tipoViaje === 'multidestino' ? (
          <div className="p-3 rounded-lg bg-[#00FF85]/10 border border-[#00FF85]/30 text-xs space-y-1">
            <p className="font-bold text-[#00FF85] m-0 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <span>🌍</span> Regla de Multidestino Activa
            </p>
            <p className="m-0 text-[#CBD5E1] text-[11px] leading-relaxed">
              Todos los destinos agregados a esta ruta se considerarán <strong className="text-[#00FF85]">países visitados</strong> y se iluminarán y resaltarán en el Mapa Mundi, trazando la trayectoria aérea animada continua del avión.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#151B27] border border-[#00E5FF]/30 text-xs space-y-1">
            <p className="font-bold text-[#00E5FF] m-0 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <span>✈️</span> Modo Único Destino
            </p>
            <p className="m-0 text-[#8492A6] text-[11px] leading-relaxed">
              Configura tu origen, destino y escalas. El país se registrará en el mapa mundi cuando registres tus vuelos en el itinerario (las escalas contarán solo si el cambio de vuelo supera las 24 horas).
            </p>
          </div>
        )}

        {/* Nombre del Viaje */}
        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
            Nombre del Viaje *
          </label>
          <input
            type="text"
            required
            placeholder={tipoViaje === 'multidestino' ? "Ej. Tour Europa & Asia 2026" : "Ej. Viaje a Japón 2026"}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
          />
        </div>

        {/* Origen del Viaje */}
        <div>
          <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
            Origen del Viaje (Punto de Partida)
          </label>
          <AirportCityInput
            type="both"
            placeholder="Ej. BOG / Bogotá, Colombia..."
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

        {/* SECCIÓN A: SI ES ÚNICO DESTINO */}
        {tipoViaje === 'unico' && (
          <div className="space-y-3 p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436]">
            <div>
              <CountryInput
                label="Destino Principal (País) *"
                required
                placeholder="Ej. Japón, Francia o España"
                value={destino}
                onChange={handleDestinoChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                Conexión / Escala del Vuelo (Opcional)
              </label>
              <AirportCityInput
                type="both"
                placeholder="Aeropuerto o ciudad de escala (Ej. MIA o Miami)..."
                value={escalas}
                onChange={setEscalas}
                onSelectAirportOrCity={(item) => {
                  const label = item.iata
                    ? `${item.flagEmoji} ${item.city} (${item.iata})`
                    : `${item.flagEmoji} ${item.city}`;
                  setEscalas(label);
                }}
              />
              <p className="text-[10px] text-[#8492A6] mt-1 m-0">
                Se trazará el arco aéreo: Origen ➔ Conexión ➔ Destino.
              </p>
            </div>
          </div>
        )}

        {/* SECCIÓN B: SI ES MULTIDESTINO */}
        {tipoViaje === 'multidestino' && (
          <div className="space-y-3 p-3.5 rounded-xl bg-[#0E121B] border border-[#00FF85]/30">
            <div className="flex items-center justify-between border-b border-[#1C2436] pb-2">
              <span className="text-xs font-bold text-[#00FF85] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#00FF85]" />
                Destinos de la Ruta Multidestino ({destinosMultidestino.length})
              </span>
              <button
                type="button"
                onClick={handleAddDestino}
                className="px-2.5 py-1 rounded-lg bg-[#00FF85]/10 hover:bg-[#00FF85]/20 border border-[#00FF85]/40 text-[#00FF85] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Destino
              </button>
            </div>

            <div className="space-y-3">
              {destinosMultidestino.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-lg bg-[#151B27] border border-[#1C2436] space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      Destino {idx + 1}
                    </span>

                    {destinosMultidestino.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDestino(idx)}
                        className="text-[#8492A6] hover:text-[#FF2E55] p-1 rounded transition-colors cursor-pointer"
                        title="Eliminar este destino"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CountryInput
                      label="País de Destino *"
                      required
                      placeholder="Ej. Japón, España, etc."
                      value={item.destino}
                      onChange={(val) => handleUpdateDestinoItem(idx, 'destino', val)}
                    />
                    <div>
                      <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
                        Ciudad (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Tokio, Madrid..."
                        value={item.ciudad || ''}
                        onChange={(e) => handleUpdateDestinoItem(idx, 'ciudad', e.target.value)}
                        className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Toggle Escala previa antes de este destino */}
                  <div className="pt-1.5 border-t border-[#1C2436]/60">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#CBD5E1]">
                      <input
                        type="checkbox"
                        checked={item.tieneEscala}
                        onChange={(e) => handleUpdateDestinoItem(idx, 'tieneEscala', e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-[#1C2436] accent-[#FFE500]"
                      />
                      <span className="flex items-center gap-1 font-medium">
                        <GitCommit className="w-3 h-3 text-[#FFE500]" />
                        ¿Tiene escala antes de llegar a este destino?
                      </span>
                    </label>

                    {item.tieneEscala && (
                      <div className="mt-2 p-2 rounded bg-[#0E121B] border border-[#FFE500]/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#FFE500] uppercase tracking-wider mb-1">
                            Lugar de Escala (Aeropuerto / Ciudad)
                          </label>
                          <AirportCityInput
                            type="both"
                            placeholder="Ej. LAX o Los Ángeles..."
                            value={item.escala || ''}
                            onChange={(val) => handleUpdateDestinoItem(idx, 'escala', val)}
                            onSelectAirportOrCity={(selected) => {
                              const label = selected.iata
                                ? `${selected.flagEmoji} ${selected.city} (${selected.iata})`
                                : `${selected.flagEmoji} ${selected.city}`;
                              handleUpdateDestinoItem(idx, 'escala', label);
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#8492A6] uppercase tracking-wider mb-1">
                            Horas de Escala
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ej. 12 (tránsito) o 28 (>24h)"
                            value={item.horasEscala || ''}
                            onChange={(e) => handleUpdateDestinoItem(idx, 'horasEscala', e.target.value)}
                            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#FFE500] rounded px-2.5 py-1.5 text-xs text-[#F1F5F9] focus:outline-none"
                          />
                          <span className="text-[9px] text-[#8492A6] block mt-0.5">
                            {Number(item.horasEscala) >= 24 ? '🌍 ≥24h (Cuenta como visitado)' : '⏱️ <24h (Tránsito)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Fecha Inicio *
            </label>
            <input
              type="date"
              required
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Fecha Fin *
            </label>
            <input
              type="date"
              required
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none"
            />
          </div>
        </div>

        {/* Presupuesto y Divisa */}
        <div className="space-y-3 p-3 rounded-lg bg-[#151B27] border border-[#1C2436]">
          <CurrencySelector
            value={monedaLocal}
            onChange={(selectedCurr) => setMonedaLocal(selectedCurr)}
            label="Moneda Local Principal"
          />

          <div>
            <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
              Presupuesto Total del Viaje (en COP)
            </label>
            <input
              type="number"
              placeholder="Ej. 15000000"
              value={presupuestoTotal}
              onChange={(e) => setPresupuestoTotal(e.target.value)}
              className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-sm font-bold text-[#F1F5F9] focus:outline-none"
            />
          </div>

          <LiveCurrencyConversions
            amount={presupuestoTotal}
            currency="COP"
            title="Presupuesto equivalente en las demás monedas del viaje"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#00FF85] text-[#080A0F] font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity mt-4 cursor-pointer"
        >
          {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Viaje')}
        </button>
      </form>
    </Modal>
  );
}

export default NuevoViajeModal;
