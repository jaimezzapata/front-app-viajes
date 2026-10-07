import React, { useState, useEffect } from 'react';
import {
  Plane,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  GitCommit,
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  Coins,
  Sparkles
} from 'lucide-react';
import Modal from '../../../components/Modal';
import CountryInput from '../../../components/CountryInput';
import AirportCityInput from '../../../components/AirportCityInput';
import { CurrencySelector } from '../../../components/CurrencySelector';
import { detectCountry, fixAccents, cleanCountryText } from '../../../utils/countries';
import { getCurrencyForCountry } from '../../../utils/currencies';
import { formatWithMiniFlag } from '../../../services/geoApiService';

export function NuevoViajeModal({ isOpen, onClose, onSaveViaje, viajeAEditar, onUpdateViaje }) {
  const isEditing = Boolean(viajeAEditar);

  // Estado del asistente por pasos: 1 = Ruta, 2 = Fechas, 3 = Presupuesto
  const [step, setStep] = useState(1);

  // Campos del formulario
  const [tipoViaje, setTipoViaje] = useState('unico'); // 'unico' | 'multidestino'
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [escalas, setEscalas] = useState('');
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

  // Cargar datos al abrir modal
  useEffect(() => {
    if (viajeAEditar) {
      setStep(1);
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
      setStep(1);
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

  // Si cambia el destino en modo único, sugerir moneda oficial y sugerir título si está vacío
  const handleDestinoChange = (newDestino) => {
    setDestino(newDestino);
    const curr = getCurrencyForCountry(newDestino);
    if (curr && curr.code) {
      setMonedaLocal(curr.code);
    }
    if (!titulo.trim() && newDestino.trim()) {
      setTitulo(`Viaje a ${cleanCountryText(newDestino.trim())}`);
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

      if (field === 'destino') {
        const curr = getCurrencyForCountry(value);
        if (curr && curr.code) {
          setMonedaLocal(curr.code);
        }
      }

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

  // Validación de pasos
  const validateStep1 = () => {
    setErrorMsg('');
    if (!titulo.trim()) {
      setErrorMsg('Por favor ingresa un nombre para identificar tu viaje.');
      return false;
    }
    if (tipoViaje === 'unico' && !destino.trim()) {
      setErrorMsg('Por favor selecciona el país de destino principal.');
      return false;
    }
    if (tipoViaje === 'multidestino') {
      const filledStops = destinosMultidestino.filter(d => d.destino && d.destino.trim());
      if (filledStops.length === 0) {
        setErrorMsg('Por favor indica al menos un destino en la ruta multidestino.');
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMsg('');
    if (!fechaInicio || !fechaFin) {
      setErrorMsg('Por favor selecciona las fechas de inicio y finalización del viaje.');
      return false;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setErrorMsg('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  // Cálculo de duración en días
  const duracionDias = React.useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0;
    const diff = new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
    if (diff < 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [fechaInicio, fechaFin]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateStep1() || !validateStep2()) {
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
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-2.5 w-full">
          {step === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setStep(prev => prev - 1);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#CBD5E1] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={step === 1 ? handleNextFromStep1 : handleNextFromStep2}
              className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center gap-1.5"
            >
              <span>{step === 1 ? 'Siguiente: Fechas' : 'Siguiente: Presupuesto'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center gap-1.5"
            >
              {loading ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Viaje'}</span>
                </>
              )}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-5 pb-1">
        {/* BARRA DE PROGRESO DEL ASISTENTE (3 PASOS) */}
        <div className="flex items-center justify-between px-1">
          {/* Paso 1: Ruta */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 1
                  ? 'bg-[#00FF85] text-[#080A0F] ring-4 ring-[#00FF85]/20'
                  : step > 1
                  ? 'bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/40'
                  : 'bg-[#151B27] text-[#8492A6] border border-[#1C2436]'
              }`}
            >
              {step > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <div className="hidden sm:block">
              <span className={`text-[11px] font-bold block ${step === 1 ? 'text-[#00FF85]' : 'text-[#8492A6]'}`}>
                Paso 1
              </span>
              <span className={`text-xs font-semibold block ${step === 1 ? 'text-[#F1F5F9]' : 'text-[#8492A6]'}`}>
                Ruta & Destino
              </span>
            </div>
          </button>

          <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 2 ? 'bg-[#00FF85]' : 'bg-[#1C2436]'}`} />

          {/* Paso 2: Fechas */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-[#00FF85] text-[#080A0F] ring-4 ring-[#00FF85]/20'
                  : step > 2
                  ? 'bg-[#00FF85]/20 text-[#00FF85] border border-[#00FF85]/40'
                  : 'bg-[#151B27] text-[#8492A6] border border-[#1C2436]'
              }`}
            >
              {step > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <div className="hidden sm:block">
              <span className={`text-[11px] font-bold block ${step === 2 ? 'text-[#00FF85]' : 'text-[#8492A6]'}`}>
                Paso 2
              </span>
              <span className={`text-xs font-semibold block ${step === 2 ? 'text-[#F1F5F9]' : 'text-[#8492A6]'}`}>
                Fechas
              </span>
            </div>
          </button>

          <div className={`flex-1 h-0.5 mx-3 transition-colors ${step >= 3 ? 'bg-[#00FF85]' : 'bg-[#1C2436]'}`} />

          {/* Paso 3: Presupuesto */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setStep(3);
            }}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 3
                  ? 'bg-[#00FF85] text-[#080A0F] ring-4 ring-[#00FF85]/20'
                  : 'bg-[#151B27] text-[#8492A6] border border-[#1C2436]'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block">
              <span className={`text-[11px] font-bold block ${step === 3 ? 'text-[#00FF85]' : 'text-[#8492A6]'}`}>
                Paso 3
              </span>
              <span className={`text-xs font-semibold block ${step === 3 ? 'text-[#F1F5F9]' : 'text-[#8492A6]'}`}>
                Presupuesto & Divisa
              </span>
            </div>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FF2E55]/10 border border-[#FF2E55] text-[#FF2E55] text-xs font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 1: ORIGEN, DESTINO Y TIPO DE VIAJE                        */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
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

            {/* SECCIÓN SI ES ÚNICO DESTINO */}
            {tipoViaje === 'unico' && (
              <div className="space-y-3.5 p-3.5 rounded-xl bg-[#0E121B] border border-[#1C2436]">
                <div>
                  <CountryInput
                    label="Destino Principal (País)"
                    required
                    placeholder="Ej. Brasil, México, Japón o España"
                    value={destino}
                    onChange={handleDestinoChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                    Conexión o Escala del Vuelo (Opcional)
                  </label>
                  <AirportCityInput
                    type="both"
                    placeholder="Aeropuerto o ciudad de escala (Ej. MIA o Panamá)..."
                    value={escalas}
                    onChange={setEscalas}
                    onSelectAirportOrCity={(item) => {
                      const label = item.iata
                        ? `${item.flagEmoji} ${item.city} (${item.iata})`
                        : `${item.flagEmoji} ${item.city}`;
                      setEscalas(label);
                    }}
                  />
                </div>
              </div>
            )}

            {/* SECCIÓN SI ES MULTIDESTINO */}
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
        )}

        {/* ============================================================== */}
        {/* PASO 2: FECHAS DEL VIAJE Y DESCRIPCIÓN                         */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Fecha de Inicio *
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
                <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00FF85]" />
                  Fecha de Fin *
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

            {/* Tarjeta de Resumen de Duración */}
            {duracionDias > 0 && (
              <div className="p-3 rounded-xl bg-[#00FF85]/10 border border-[#00FF85]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00FF85]" />
                  <span className="text-xs font-bold text-[#F1F5F9]">
                    Duración calculada:
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[#00FF85]">
                  {duracionDias} {duracionDias === 1 ? 'día' : 'días'} de viaje
                </span>
              </div>
            )}

            {/* Descripción / Notas del viaje */}
            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider">
                Descripción o Notas de la Aventura (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Recorrido por playas paradisíacas, templos históricos y gastronomía local..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none resize-none placeholder:text-[#8492A6]/40"
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASO 3: DIVISA LOCAL Y PRESUPUESTO                            */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Selector Dinámico de Moneda de la Ruta */}
            <div className="p-3.5 rounded-xl bg-[#151B27] border border-[#1C2436] space-y-2">
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
              <p className="text-[10px] text-[#8492A6] m-0">
                Detectada automáticamente según los países de tu ruta. Puedes cambiarla o seleccionar otra si lo requieres.
              </p>
            </div>

            {/* Presupuesto Estimado */}
            <div>
              <label className="block text-xs font-semibold text-[#8492A6] mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#FFE500]" />
                Presupuesto Total Estimado (en COP)
              </label>
              <input
                type="number"
                placeholder="Ej. 15000000"
                value={presupuestoTotal}
                onChange={(e) => setPresupuestoTotal(e.target.value)}
                className="w-full bg-[#151B27] border border-[#1C2436] focus:border-[#00FF85] rounded-lg px-3 py-2.5 text-base font-bold text-[#F1F5F9] focus:outline-none placeholder:text-[#8492A6]/40"
              />
              <span className="text-[10px] text-[#8492A6] block mt-1">
                Puedes dejarlo en blanco o editarlo en cualquier momento desde el Dashboard.
              </span>
            </div>

            {/* Resumen Final de Confirmación */}
            <div className="p-3.5 rounded-xl bg-[#0E121B] border border-[#00FF85]/20 space-y-2">
              <span className="text-xs font-bold text-[#00FF85] uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Resumen de tu Configuración
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1C2436]">
                <div>
                  <span className="text-[#8492A6] block text-[10px] uppercase">Bitácora</span>
                  <span className="font-bold text-[#F1F5F9] truncate block">{titulo || 'Sin título'}</span>
                </div>
                <div>
                  <span className="text-[#8492A6] block text-[10px] uppercase">Destino</span>
                  <span className="font-bold text-[#00E5FF] truncate block">
                    {tipoViaje === 'unico' ? (destino || 'Por definir') : 'Multidestino'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8492A6] block text-[10px] uppercase">Fechas</span>
                  <span className="font-medium text-[#CBD5E1] block">
                    {fechaInicio || '---'} al {fechaFin || '---'} ({duracionDias} días)
                  </span>
                </div>
                <div>
                  <span className="text-[#8492A6] block text-[10px] uppercase">Moneda & Presupuesto</span>
                  <span className="font-bold text-[#00FF85] block">
                    {monedaLocal} • {presupuestoTotal ? `$ ${Number(presupuestoTotal).toLocaleString('es-CO')} COP` : 'Sin asignar'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default NuevoViajeModal;
