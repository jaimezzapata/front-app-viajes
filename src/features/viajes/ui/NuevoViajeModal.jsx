import React, { useState, useEffect } from 'react';
import { Plane, Calendar, DollarSign, MapPin, Plus, Trash2, GitCommit, ArrowRight, Compass } from 'lucide-react';
import Modal from '../../../components/Modal';
import CountryInput from '../../../components/CountryInput';
import AirportCityInput from '../../../components/AirportCityInput';
import { CurrencySelector, LiveCurrencyConversions } from '../../../components/CurrencySelector';
import { detectCountry, fixAccents } from '../../../utils/countries';
import { getCurrencyForCountry } from '../../../utils/currencies';
import { formatWithMiniFlag } from '../../../services/geoApiService';

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
    const curr = getCurrencyForCountry(newDestino);
    if (curr && curr.code) {
      setMonedaLocal(curr.code);
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

      // Si cambia el destino, sugerir moneda oficial automáticamente
      if (field === 'destino') {
        const curr = getCurrencyForCountry(value);
        if (curr && curr.code) {
          setMonedaLocal(curr.code);
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
        titulo: fixAccents(titulo.trim()),
        tipoViaje,
        descripcion: descripcion.trim() ? fixAccents(descripcion.trim()) : undefined,
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
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nuevo-viaje-form"
            disabled={loading}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center justify-center gap-1.5 min-w-0"
          >
            {loading ? (
              <span className="truncate">Guardando...</span>
            ) : (
              <>
                <Plane className="w-3.5 h-3.5 fill-[#080A0F] shrink-0" />
                <span className="truncate">{isEditing ? 'Guardar Cambios' : 'Crear Viaje'}</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form id="nuevo-viaje-form" onSubmit={handleSubmit} className="space-y-4 pb-1">
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
          {/* COLUMNA 1: Ruta, Destinos y Datos Principales */}
          <div className="space-y-3.5 min-w-0">
            {/* SELECTOR: Control Segmentado Compacto (Mobile First) */}
            <div>
              <label className="block text-[11px] font-bold text-[#8492A6] mb-1.5 uppercase tracking-wider">
                Tipo de Viaje *
              </label>
              <div className="bg-[#0A0D14] p-1 rounded-xl border border-[#1C2436] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setTipoViaje('unico')}
              className={`py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
                tipoViaje === 'unico'
                  ? 'bg-[#151B27] text-[#00E5FF] font-bold border border-[#00E5FF]/40 shadow-sm'
                  : 'text-[#8492A6] hover:text-[#F1F5F9] font-medium border border-transparent'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${tipoViaje === 'unico' ? 'bg-[#00E5FF]' : 'bg-[#8492A6]'}`} />
              <span className="text-xs uppercase tracking-wider truncate">📍 Único Destino</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoViaje('multidestino')}
              className={`py-2 px-2.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
                tipoViaje === 'multidestino'
                  ? 'bg-[#151B27] text-[#00FF85] font-bold border border-[#00FF85]/40 shadow-sm'
                  : 'text-[#8492A6] hover:text-[#F1F5F9] font-medium border border-transparent'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${tipoViaje === 'multidestino' ? 'bg-[#00FF85]' : 'bg-[#8492A6]'}`} />
              <span className="text-xs uppercase tracking-wider truncate">🗺️ Multidestino</span>
            </button>
          </div>
        </div>

        {/* Micro-banner informativo compacto */}
        <div
          className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
            tipoViaje === 'multidestino'
              ? 'bg-[#00FF85]/10 border border-[#00FF85]/30 text-[#00FF85]'
              : 'bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]'
          }`}
        >
          <span className="text-sm shrink-0">{tipoViaje === 'multidestino' ? '🌍' : '✈️'}</span>
          <p className="m-0 text-[11px] leading-tight text-[#CBD5E1]">
            {tipoViaje === 'multidestino'
              ? 'Múltiples destinos enlazados de forma continua en el Mapa Mundi.'
              : 'Configura origen, escalas y destino. Se trazarán arcos aéreos en el Mapa Mundi.'}
          </p>
        </div>

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
            onChange={(e) => setTitulo(fixAccents(e.target.value))}
            className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-base sm:text-sm text-[#F1F5F9] focus:outline-none min-h-[42px]"
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
                label="Destino Principal (País)"
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

          </div>
          {/* FIN COLUMNA 1 */}

          {/* COLUMNA 2: Tiempos, Divisas y Presupuesto */}
          <div className="space-y-3.5 min-w-0">
            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00E5FF]" />
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-2.5 py-2 text-base sm:text-sm text-[#F1F5F9] focus:outline-none min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00FF85]" />
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  required
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-2.5 py-2 text-base sm:text-sm text-[#F1F5F9] focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            {/* Presupuesto y Divisa */}
            <div className="space-y-3 p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436]">
              <CurrencySelector
                value={monedaLocal}
                onChange={(selectedCurr) => setMonedaLocal(selectedCurr)}
                label="Moneda Local Principal"
                viaje={{
                  destino,
                  origen,
                  escalas,
                  tipoViaje,
                  destinosMultidestino,
                  monedaLocal,
                  monedaBase: 'COP'
                }}
              />

              <div>
                <label className="block text-[11px] font-bold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#FFE500]" />
                  Presupuesto Total Estimado (en COP)
                </label>
                <input
                  type="number"
                  placeholder="Ej. 15000000"
                  value={presupuestoTotal}
                  onChange={(e) => setPresupuestoTotal(e.target.value)}
                  className="w-full bg-[#0E121B] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-base sm:text-sm font-bold text-[#F1F5F9] focus:outline-none min-h-[42px]"
                />
              </div>

              <LiveCurrencyConversions
                amount={presupuestoTotal}
                currency="COP"
                title="Presupuesto equivalente en las demás monedas del viaje"
              />
            </div>
          </div>
          {/* FIN COLUMNA 2 */}
        </div>
        {/* FIN GRID 2 COLUMNAS */}
      </form>
    </Modal>
  );
}

export default NuevoViajeModal;
