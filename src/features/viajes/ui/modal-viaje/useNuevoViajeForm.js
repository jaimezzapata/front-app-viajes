import { useState, useEffect, useMemo } from 'react';
import { fixAccents, cleanCountryText } from '../../../../utils/countries';
import { getCurrencyForCountry } from '../../../../utils/currencies';
import { formatWithMiniFlag } from '../../../../services/geoApiService';

export function useNuevoViajeForm({
  isOpen,
  onClose,
  onSaveViaje,
  viajeAEditar,
  onUpdateViaje
}) {
  const isEditing = Boolean(viajeAEditar);

  // En modo creación: pasos 1 (Ruta), 2 (Fechas), 3 (Presupuesto)
  const [step, setStep] = useState(1);

  // En modo edición: pestaña activa ('todo' | 'ruta' | 'fechas' | 'presupuesto')
  const [editTab, setEditTab] = useState('todo');

  const [tipoViaje, setTipoViaje] = useState('unico'); // 'unico' | 'multidestino'
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [destinosMultidestino, setDestinosMultidestino] = useState([
    { id: '1', destino: '', ciudad: '' },
    { id: '2', destino: '', ciudad: '' }
  ]);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuestoTotal, setPresupuestoTotal] = useState('');
  const [monedaLocal, setMonedaLocal] = useState('USD');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viajeAEditar) {
      setStep(1);
      setEditTab('todo');
      setTipoViaje(viajeAEditar.tipoViaje || 'unico');
      setTitulo(viajeAEditar.titulo || '');
      setDescripcion(viajeAEditar.descripcion || '');
      setOrigen(viajeAEditar.origen || '');
      setDestino(viajeAEditar.destino || '');

      if (Array.isArray(viajeAEditar.destinosMultidestino) && viajeAEditar.destinosMultidestino.length > 0) {
        setDestinosMultidestino(
          viajeAEditar.destinosMultidestino.map((d, idx) => ({
            id: d.id || String(idx + 1),
            destino: d.destino || '',
            ciudad: d.ciudad || ''
          }))
        );
      } else {
        setDestinosMultidestino([
          { id: '1', destino: viajeAEditar.destino || '', ciudad: '' },
          { id: '2', destino: '', ciudad: '' }
        ]);
      }

      setFechaInicio(viajeAEditar.fechaInicio ? viajeAEditar.fechaInicio.split('T')[0] : '');
      setFechaFin(viajeAEditar.fechaFin ? viajeAEditar.fechaFin.split('T')[0] : '');
      setPresupuestoTotal(viajeAEditar.presupuestoTotal !== undefined ? String(viajeAEditar.presupuestoTotal) : '');
      setMonedaLocal(viajeAEditar.monedaLocal || 'USD');
    } else {
      setStep(1);
      setEditTab('todo');
      setTipoViaje('unico');
      setTitulo('');
      setDescripcion('');
      setOrigen('');
      setDestino('');
      setDestinosMultidestino([
        { id: '1', destino: '', ciudad: '' },
        { id: '2', destino: '', ciudad: '' }
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
    if (!titulo.trim() && newDestino.trim()) {
      setTitulo(`Viaje a ${cleanCountryText(newDestino.trim())}`);
    }
  };

  const handleAddDestino = () => {
    setDestinosMultidestino(prev => [
      ...prev,
      { id: String(Date.now()), destino: '', ciudad: '' }
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
      return updated;
    });
  };

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
    if (validateStep1()) setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) setStep(3);
  };

  const duracionDias = useMemo(() => {
    if (!fechaInicio || !fechaFin) return 0;
    const diff = new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
    if (diff < 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [fechaInicio, fechaFin]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateStep1()) {
      if (isEditing) setEditTab('ruta');
      return;
    }

    if (!validateStep2()) {
      if (isEditing) setEditTab('fechas');
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
            id: d.id,
            destino: formatWithMiniFlag(d.destino.trim()),
            ciudad: d.ciudad ? d.ciudad.trim() : undefined
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

  return {
    isEditing,
    step,
    setStep,
    editTab,
    setEditTab,
    tipoViaje,
    setTipoViaje,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    origen,
    setOrigen,
    destino,
    setDestino,
    destinosMultidestino,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    presupuestoTotal,
    setPresupuestoTotal,
    monedaLocal,
    setMonedaLocal,
    errorMsg,
    setErrorMsg,
    loading,
    duracionDias,
    handlers: {
      handleDestinoChange,
      handleAddDestino,
      handleRemoveDestino,
      handleUpdateDestinoItem,
      handleNextFromStep1,
      handleNextFromStep2,
      handleSubmit
    }
  };
}

export default useNuevoViajeForm;

