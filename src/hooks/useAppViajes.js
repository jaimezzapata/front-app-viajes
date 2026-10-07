import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';
import { convertCurrency, getExactExchangeRate } from '../utils/currencies';
import { fixAccents, cleanCountryText } from '../utils/countries';

export function repairViaje(v) {
  if (!v) return v;
  return {
    ...v,
    titulo: fixAccents(v.titulo || ''),
    descripcion: v.descripcion ? fixAccents(v.descripcion) : v.descripcion,
    destino: cleanCountryText(v.destino || ''),
    origen: v.origen ? cleanCountryText(v.origen) : v.origen,
    escalas: v.escalas ? cleanCountryText(v.escalas) : v.escalas,
  };
}

export function getUserStorageKey(user) {
  if (!user) return null;
  const identifier = user.email ? user.email.trim().toLowerCase() : (user.id || null);
  return identifier ? `app_viajes_lista_${identifier}` : null;
}

export function useAppViajes(usuario) {
  // Inicializar exclusivamente con datos reales guardados localmente para este usuario
  const [viajes, setViajes] = useState(() => {
    try {
      const key = getUserStorageKey(usuario);
      if (!key) return [];
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(v => v.id && v.id !== 'viaje-demo-tokyo').map(repairViaje);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeViajeId, setActiveViajeId] = useState(null);

  const activeViaje = viajes.find(v => v.id === activeViajeId) || viajes[0] || null;

  const [eventos, setEventos] = useState(() => {
    try {
      if (!activeViajeId || activeViajeId === 'viaje-demo-tokyo') return [];
      const saved = localStorage.getItem(`app_viajes_eventos_${activeViajeId}`);
      if (saved) {
        let evs = JSON.parse(saved);
        if (Array.isArray(evs)) {
          // Reconciliar eventos donde un valor en pesos colombianos (>=50.000) fue erróneamente guardado en USD
          return evs.map(ev => {
            if (ev.costo && Number(ev.costo) >= 50000 && ev.moneda === 'USD') {
              return { ...ev, moneda: 'COP' };
            }
            return ev;
          });
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [gastos, setGastos] = useState(() => {
    try {
      if (!activeViajeId || activeViajeId === 'viaje-demo-tokyo') return [];
      const saved = localStorage.getItem(`app_viajes_gastos_${activeViajeId}`);
      if (saved) {
        let gs = JSON.parse(saved);
        if (Array.isArray(gs)) {
          // Reconciliar gastos: corregir valores grandes (>=50.000) ingresados en COP pero marcados erróneamente como USD
          return gs.map(g => {
            const num = Number(g.montoOriginal) || 0;
            let orig = (g.monedaOriginal || 'COP').toUpperCase();
            if (num >= 50000 && orig === 'USD') {
              orig = 'COP';
            }
            const montoCOP = convertCurrency(num, orig, 'COP');
            const montoUSD = convertCurrency(num, orig, 'USD');
            return {
              ...g,
              monedaOriginal: orig,
              montoCOP,
              montoUSD
            };
          });
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [documentos, setDocumentos] = useState(() => {
    try {
      if (!activeViajeId || activeViajeId === 'viaje-demo-tokyo') return [];
      const saved = localStorage.getItem(`app_viajes_docs_${activeViajeId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Limpieza inicial forzada de residuos mock/demo de localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('app_viajes_eventos_viaje-demo-tokyo');
      localStorage.removeItem('app_viajes_gastos_viaje-demo-tokyo');
      localStorage.removeItem('app_viajes_docs_viaje-demo-tokyo');
    } catch {}
  }, []);

  // Sincronizar estado local al cambiar de usuario (evita ver viajes de otros usuarios)
  useEffect(() => {
    if (!usuario) {
      setViajes([]);
      setActiveViajeId(null);
      setEventos([]);
      setGastos([]);
      setDocumentos([]);
      return;
    }

    const key = getUserStorageKey(usuario);
    if (!key) return;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const userTrips = parsed.filter(v => v.id && v.id !== 'viaje-demo-tokyo').map(repairViaje);
          setViajes(userTrips);
          return;
        }
      }

      // Si no hay viajes guardados bajo la clave del usuario pero existe una lista heredada anterior
      const legacy = localStorage.getItem('app_viajes_lista');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          const owned = parsedLegacy.filter(v => !v.usuarioId || v.usuarioId === usuario.id);
          if (owned.length > 0) {
            const repaired = owned.map(repairViaje);
            setViajes(repaired);
            localStorage.setItem(key, JSON.stringify(repaired));
            return;
          }
        }
      }
      setViajes([]);
    } catch {
      setViajes([]);
    }
  }, [usuario?.id, usuario?.email]);

  // Monitorear estado de red con Sonner Toasts (REGLAS 1.2)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión reestablecida. Modo Online activo.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sin conexión. Modo Offline activo. Los datos se guardan localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronizar persistencia local estrictamente por usuario
  useEffect(() => {
    const key = getUserStorageKey(usuario);
    if (key) {
      localStorage.setItem(key, JSON.stringify(viajes));
    }
  }, [viajes, usuario]);

  // Cargar datos locales al cambiar de viaje activo y auto-reconciliar
  useEffect(() => {
    if (!activeViajeId || activeViajeId === 'viaje-demo-tokyo') {
      setEventos([]);
      setGastos([]);
      setDocumentos([]);
      return;
    }
    try {
      const savedEvs = localStorage.getItem(`app_viajes_eventos_${activeViajeId}`);
      let evs = savedEvs ? JSON.parse(savedEvs) : [];
      if (Array.isArray(evs)) {
        evs = evs.map(ev => {
          if (ev.costo && Number(ev.costo) >= 50000 && ev.moneda === 'USD') {
            return { ...ev, moneda: 'COP' };
          }
          return ev;
        });
      }
      setEventos(evs);

      const savedGs = localStorage.getItem(`app_viajes_gastos_${activeViajeId}`);
      let gs = savedGs ? JSON.parse(savedGs) : [];
      if (Array.isArray(gs)) {
        gs = gs.map(g => {
          const num = Number(g.montoOriginal) || 0;
          let orig = (g.monedaOriginal || 'COP').toUpperCase();
          if (num >= 50000 && orig === 'USD') {
            orig = 'COP';
          }
          const montoCOP = convertCurrency(num, orig, 'COP');
          const montoUSD = convertCurrency(num, orig, 'USD');
          return {
            ...g,
            monedaOriginal: orig,
            montoCOP,
            montoUSD
          };
        });
      }
      setGastos(gs);

      const savedDocs = localStorage.getItem(`app_viajes_docs_${activeViajeId}`);
      setDocumentos(savedDocs ? JSON.parse(savedDocs) : []);
    } catch {}
  }, [activeViajeId]);

  // Persistir cambios del viaje activo
  useEffect(() => {
    if (activeViajeId && activeViajeId !== 'viaje-demo-tokyo') {
      localStorage.setItem(`app_viajes_eventos_${activeViajeId}`, JSON.stringify(eventos));
      localStorage.setItem(`app_viajes_gastos_${activeViajeId}`, JSON.stringify(gastos));
      localStorage.setItem(`app_viajes_docs_${activeViajeId}`, JSON.stringify(documentos));
    }
  }, [activeViajeId, eventos, gastos, documentos]);

  // Cargar datos reales desde la API (Base de Datos Real)
  const fetchViajeData = useCallback(async () => {
    if (!navigator.onLine || !usuario) return;

    try {
      const storageKey = getUserStorageKey(usuario);

      // 1. Sincronizar automáticamente hacia el servidor cualquier viaje local creado offline para este usuario
      try {
        const rawLocalList = storageKey ? localStorage.getItem(storageKey) : null;
        const localSavedList = rawLocalList ? JSON.parse(rawLocalList) : [];
        const pendingLocalViajes = Array.isArray(localSavedList)
          ? localSavedList.filter(v => typeof v.id === 'string' && v.id.startsWith('viaje-local-'))
          : [];

        const validUid = (usuario?.id && typeof usuario.id === 'string' && !usuario.id.startsWith('offline-')) ? usuario.id : null;

        for (const localV of pendingLocalViajes) {
          const oldId = localV.id;
          const { id: _, ...viajePayload } = localV;
          const res = await apiRequest('/viajes', {
            method: 'POST',
            body: JSON.stringify({
              ...viajePayload,
              usuarioId: validUid,
              usuarioEmail: usuario.email || null
            })
          });
          const createdViaje = repairViaje(res?.data || res);

          // Subir itinerario local asociado si existe
          const localEvs = JSON.parse(localStorage.getItem(`app_viajes_eventos_${oldId}`) || '[]');
          for (const ev of localEvs) {
            const { id: _, ...evPayload } = ev;
            await apiRequest(`/viajes/${createdViaje.id}/itinerario`, {
              method: 'POST',
              body: JSON.stringify(evPayload)
            }).catch(() => null);
          }

          // Subir gastos locales asociados si existen
          const localGs = JSON.parse(localStorage.getItem(`app_viajes_gastos_${oldId}`) || '[]');
          for (const g of localGs) {
            const { id: _, ...gPayload } = g;
            await apiRequest(`/viajes/${createdViaje.id}/gastos`, {
              method: 'POST',
              body: JSON.stringify(gPayload)
            }).catch(() => null);
          }

          // Limpiar llaves temporales del viaje local
          localStorage.removeItem(`app_viajes_eventos_${oldId}`);
          localStorage.removeItem(`app_viajes_gastos_${oldId}`);
          localStorage.removeItem(`app_viajes_docs_${oldId}`);
        }
      } catch (syncErr) {
        console.warn('Error sincronizando viajes offline:', syncErr);
      }

      // 2. Obtener la lista oficial exclusivamente para este usuario desde la base de datos
      const queryParams = [];
      if (usuario.id && typeof usuario.id === 'string' && !usuario.id.startsWith('offline-')) {
        queryParams.push(`usuarioId=${encodeURIComponent(usuario.id)}`);
      }
      if (usuario.email) {
        queryParams.push(`email=${encodeURIComponent(usuario.email.trim().toLowerCase())}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const dataViajes = await apiRequest(`/viajes${queryString}`);

      if (Array.isArray(dataViajes)) {
        const cleanViajes = dataViajes
          .filter(v => v.id && v.id !== 'viaje-demo-tokyo')
          .map(repairViaje);

        // Preservar cualquier viaje local pendiente que no haya terminado de subir
        const rawCurrent = storageKey ? localStorage.getItem(storageKey) : null;
        const currentLocal = rawCurrent ? JSON.parse(rawCurrent) : [];
        const stillPending = Array.isArray(currentLocal)
          ? currentLocal.filter(v => typeof v.id === 'string' && v.id.startsWith('viaje-local-'))
          : [];

        const combinedViajes = [...stillPending, ...cleanViajes.filter(cv => !stillPending.some(sp => sp.id === cv.id))];

        setViajes(combinedViajes);
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(combinedViajes));
        }

        if (combinedViajes.length > 0) {
          if (activeViajeId && !combinedViajes.some(v => v.id === activeViajeId)) {
            setActiveViajeId(null);
          }
        } else {
          setActiveViajeId(null);
          setEventos([]);
          setGastos([]);
          setDocumentos([]);
        }
      }

      if (activeViajeId && activeViajeId !== 'viaje-demo-tokyo') {
        const evs = await apiRequest(`/viajes/${activeViajeId}/itinerario`);
        if (Array.isArray(evs)) setEventos(evs);

        const gs = await apiRequest(`/viajes/${activeViajeId}/gastos`);
        if (Array.isArray(gs)) setGastos(gs);

        const docs = await apiRequest(`/viajes/${activeViajeId}/boveda`);
        if (Array.isArray(docs)) setDocumentos(docs);
      }
    } catch {
      // Usar datos offline en IndexedDB / localStorage
    }
  }, [activeViajeId, usuario?.id, usuario?.email]);

  useEffect(() => {
    fetchViajeData();
  }, [fetchViajeData]);

  // Cálculo del Balance en tiempo real
  const calculateBalance = useCallback(() => {
    if (!activeViaje) {
      return {
        presupuestoTotalCOP: 0,
        totalGastadoCOP: 0,
        totalGastadoUSD: 0,
        pagadoAdelantadoCOP: 0,
        dineroRequeridoEnRutaCOP: 0,
        comprasTercerosCOP: 0,
        ingresosReembolsosCOP: 0,
        balanceDisponibleCOP: 0,
        porcentajeConsumido: 0,
        semaforoGlobal: 'verde',
        semaforoCategorias: [],
        monedaBase: 'COP'
      };
    }

    const presupuestoTotalCOP = activeViaje?.presupuestoTotal || 0;
    let totalGastadoCOP = 0;
    let totalGastadoUSD = 0;
    let pagadoAdelantadoCOP = 0;
    let enRutaCOP = 0;
    let comprasTercerosCOP = 0;
    let ingresosCOP = 0;

    const categoriasMap = {
      transporte: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.3 },
      alojamiento: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.35 },
      comida: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.15 },
      actividades: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.1 },
      compras: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.05 },
      otros: { gastoCOP: 0, gastoUSD: 0, limiteCOP: presupuestoTotalCOP * 0.05 }
    };

    for (const g of gastos) {
      if (g.noComputar) {
        comprasTercerosCOP += g.montoCOP;
        continue;
      }
      if (g.esIngreso) {
        ingresosCOP += g.montoCOP;
        totalGastadoCOP -= g.montoCOP;
        totalGastadoUSD -= g.montoUSD;
        continue;
      }

      totalGastadoCOP += g.montoCOP;
      totalGastadoUSD += g.montoUSD;

      if (g.pagadoAdelantado) {
        pagadoAdelantadoCOP += g.montoCOP;
      } else {
        enRutaCOP += g.montoCOP;
      }

      const cat = g.categoria?.toLowerCase() || 'otros';
      if (categoriasMap[cat]) {
        categoriasMap[cat].gastoCOP += g.montoCOP;
        categoriasMap[cat].gastoUSD += g.montoUSD;
      }
    }

    const semaforoCategorias = Object.entries(categoriasMap).map(([key, val]) => {
      const porcentaje = val.limiteCOP > 0 ? (val.gastoCOP / val.limiteCOP) * 100 : 0;
      let color = 'verde';
      if (porcentaje >= 100) color = 'rojo';
      else if (porcentaje >= 75) color = 'amarillo';

      return {
        categoria: key,
        limiteCOP: val.limiteCOP,
        consumidoCOP: val.gastoCOP,
        consumidoUSD: val.gastoUSD,
        porcentaje: Number(porcentaje.toFixed(1)),
        color
      };
    });

    const porcentajeConsumido = presupuestoTotalCOP > 0 ? (totalGastadoCOP / presupuestoTotalCOP) * 100 : 0;
    let semaforoGlobal = 'verde';
    if (porcentajeConsumido >= 100) semaforoGlobal = 'rojo';
    else if (porcentajeConsumido >= 75) semaforoGlobal = 'amarillo';

    return {
      presupuestoTotalCOP,
      totalGastadoCOP,
      totalGastadoUSD,
      pagadoAdelantadoCOP,
      dineroRequeridoEnRutaCOP: enRutaCOP,
      comprasTercerosCOP,
      ingresosReembolsosCOP: ingresosCOP,
      balanceDisponibleCOP: presupuestoTotalCOP - totalGastadoCOP,
      porcentajeConsumido: Number(porcentajeConsumido.toFixed(1)),
      semaforoGlobal,
      semaforoCategorias,
      monedaBase: activeViaje?.monedaBase || 'COP'
    };
  }, [activeViaje, gastos]);

  const balance = calculateBalance();

  // Acciones
  const handleSaveViaje = async (nuevoViajeData) => {
    let savedViaje = null;

    try {
      if (navigator.onLine) {
        const validUid = (usuario?.id && typeof usuario.id === 'string' && !usuario.id.startsWith('offline-')) ? usuario.id : null;
        const res = await apiRequest('/viajes', {
          method: 'POST',
          body: JSON.stringify({
            ...nuevoViajeData,
            usuarioId: validUid,
            usuarioEmail: usuario?.email || null
          })
        });
        savedViaje = repairViaje(res?.data || res);
        setViajes(prev => {
          const updated = [savedViaje, ...prev.filter(v => v.id !== savedViaje.id)];
          const key = getUserStorageKey(usuario);
          if (key) localStorage.setItem(key, JSON.stringify(updated));
          return updated;
        });
        setActiveViajeId(savedViaje.id);
        toast.success('Viaje configurado y sincronizado con éxito');
      }
    } catch (saveErr) {
      console.warn('Error guardando viaje en servidor:', saveErr);
    }

    if (!savedViaje) {
      // Fallback offline
      savedViaje = repairViaje({
        ...nuevoViajeData,
        id: 'viaje-local-' + Date.now(),
        usuarioId: usuario?.id,
        usuarioEmail: usuario?.email
      });
      setViajes(prev => {
        const updated = [savedViaje, ...prev.filter(v => v.id !== savedViaje.id)];
        const key = getUserStorageKey(usuario);
        if (key) localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });
      setActiveViajeId(savedViaje.id);
      toast.info('Configuración guardada localmente (Modo Offline).');
    }

    return savedViaje;
  };

  const handleUpdateViaje = async (id, updatedData) => {
    let saved = null;
    const sanitizedUpdate = repairViaje(updatedData);
    try {
      if (navigator.onLine) {
        const res = await apiRequest(`/viajes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(sanitizedUpdate)
        });
        saved = repairViaje(res?.data || res || sanitizedUpdate);
        setViajes(prev => prev.map(v => (v.id === id ? { ...v, ...saved } : v)));
        toast.success('Viaje actualizado y sincronizado');
      }
    } catch {
      // Si falla la API, continuar con fallback offline
    }

    if (!saved) {
      // Fallback offline
      saved = sanitizedUpdate;
      setViajes(prev => prev.map(v => (v.id === id ? { ...v, ...sanitizedUpdate } : v)));
      toast.info('Cambios guardados localmente.');
    }

    return saved;
  };

  const handleDeleteViaje = async (id) => {
    try {
      if (navigator.onLine) {
        await apiRequest(`/viajes/${id}`, {
          method: 'DELETE'
        });
      }
    } catch {
      // Si es un viaje local o falla la API, continuar con borrado local
    }

    setViajes(prev => {
      const filtered = prev.filter(v => v.id !== id);
      if (activeViajeId === id) {
        const nextActive = filtered[0]?.id || null;
        setActiveViajeId(nextActive);
        if (!nextActive) {
          setEventos([]);
          setGastos([]);
          setDocumentos([]);
        }
      }
      return filtered;
    });

    localStorage.removeItem(`app_viajes_eventos_${id}`);
    localStorage.removeItem(`app_viajes_gastos_${id}`);
    localStorage.removeItem(`app_viajes_docs_${id}`);

    toast.success('Viaje eliminado correctamente.');
  };

  const handleSaveEvento = async (eventoDataOrList) => {
    if (!activeViajeId) {
      toast.error('Debes seleccionar o crear un viaje en la base de datos primero.');
      return null;
    }

    const items = Array.isArray(eventoDataOrList) ? eventoDataOrList : [eventoDataOrList];
    const savedResults = [];

    for (let i = 0; i < items.length; i++) {
      const eventoData = items[i];
      const monedaOriginal = (eventoData.moneda || activeViaje?.monedaBase || 'COP').toUpperCase();
      const costoNum = (eventoData.costo && Number(eventoData.costo) > 0) ? Number(eventoData.costo) : 0;
      const montoCOP = costoNum > 0 ? convertCurrency(costoNum, monedaOriginal, 'COP') : 0;
      const montoUSD = costoNum > 0 ? convertCurrency(costoNum, monedaOriginal, 'USD') : 0;

      let savedEvento = null;
      try {
        if (navigator.onLine) {
          const res = await apiRequest(`/viajes/${activeViajeId}/itinerario`, {
            method: 'POST',
            body: JSON.stringify({ ...eventoData, moneda: monedaOriginal })
          });
          savedEvento = res.data || res;
          setEventos(prev => [...prev, savedEvento].sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio)));

          if (res.gastoAsociado) {
            setGastos(prev => [res.gastoAsociado, ...prev.filter(g => g.id !== res.gastoAsociado.id)]);
          } else if (costoNum > 0) {
            try {
              const gs = await apiRequest(`/viajes/${activeViajeId}/gastos`);
              if (Array.isArray(gs)) setGastos(gs);
            } catch {}
          }

          savedResults.push(savedEvento);
          continue;
        }
      } catch {}

      // Fallback offline
      const startDate = new Date(eventoData.fechaInicio);
      const endDate = eventoData.fechaFin ? new Date(eventoData.fechaFin) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      const localEvento = {
        ...eventoData,
        id: 'ev-local-' + Date.now() + (i > 0 ? `-${i}` : ''),
        viajeId: activeViajeId,
        fechaFin: endDate.toISOString(),
        moneda: monedaOriginal
      };
      setEventos(prev => [...prev, localEvento].sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio)));

      // Si tiene costo, crear gasto automáticamente vinculado
      if (costoNum > 0) {
        const nuevoGastoAuto = {
          id: 'g-auto-' + Date.now() + (i > 0 ? `-${i}` : ''),
          viajeId: activeViajeId,
          eventoId: localEvento.id,
          concepto: `${eventoData.tipo ? eventoData.tipo.toUpperCase() + ': ' : ''}${eventoData.titulo}`,
          categoria: eventoData.tipo === 'hotel' ? 'alojamiento' : (eventoData.tipo === 'vuelo' || eventoData.tipo === 'transporte' ? 'transporte' : 'actividades'),
          montoOriginal: costoNum,
          monedaOriginal,
          montoCOP,
          montoUSD,
          fechaGasto: eventoData.fechaInicio,
          pagadoAdelantado: false,
          noComputar: false,
          esIngreso: false
        };
        setGastos(prev => [nuevoGastoAuto, ...prev]);
      }

      savedResults.push(localEvento);
    }

    if (items.length > 1) {
      toast.success(`Vuelo Round-Trip agendado con éxito (${items.length} tramos organizados en la bitácora).`);
    } else {
      toast.success('Evento agendado exitosamente.');
    }

    return Array.isArray(eventoDataOrList) ? savedResults : savedResults[0];
  };

  const handleUpdateEvento = async (id, updatedEventoData) => {
    let saved = null;
    const monedaOriginal = (updatedEventoData.moneda || activeViaje?.monedaBase || 'COP').toUpperCase();
    const costoNum = (updatedEventoData.costo !== undefined && updatedEventoData.costo !== null && Number(updatedEventoData.costo) > 0)
      ? Number(updatedEventoData.costo)
      : 0;
    const montoCOP = costoNum > 0 ? convertCurrency(costoNum, monedaOriginal, 'COP') : 0;
    const montoUSD = costoNum > 0 ? convertCurrency(costoNum, monedaOriginal, 'USD') : 0;

    try {
      if (navigator.onLine) {
        const res = await apiRequest(`/itinerario/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...updatedEventoData, moneda: monedaOriginal })
        });
        saved = res?.data || res || updatedEventoData;
        setEventos(prev => prev.map(e => (e.id === id ? { ...e, ...saved } : e)));

        try {
          const gs = await apiRequest(`/viajes/${activeViajeId}/gastos`);
          if (Array.isArray(gs)) setGastos(gs);
        } catch {}

        toast.success('Vuelo / Evento actualizado exitosamente.');
      }
    } catch {
      // Fallback offline
    }

    if (!saved) {
      setEventos(prev => prev.map(e => (e.id === id ? { ...e, ...updatedEventoData, moneda: monedaOriginal } : e)));
      toast.info('Cambios guardados localmente.');
      saved = { ...updatedEventoData, id, moneda: monedaOriginal };
    }

    // Sincronizar el gasto asociado al evento tanto online como offline
    setGastos(prev => {
      const concepto = `${updatedEventoData.tipo ? updatedEventoData.tipo.toUpperCase() + ': ' : ''}${updatedEventoData.titulo || ''}`;
      const existingGastoIndex = prev.findIndex(g => g.eventoId === id || (g.concepto && updatedEventoData.titulo && g.concepto.includes(updatedEventoData.titulo)));

      if (costoNum > 0) {
        if (existingGastoIndex >= 0) {
          const updatedGastos = [...prev];
          updatedGastos[existingGastoIndex] = {
            ...updatedGastos[existingGastoIndex],
            eventoId: id,
            concepto,
            categoria: updatedEventoData.tipo === 'hotel' ? 'alojamiento' : (updatedEventoData.tipo === 'vuelo' || updatedEventoData.tipo === 'transporte' ? 'transporte' : 'actividades'),
            montoOriginal: costoNum,
            monedaOriginal,
            montoCOP,
            montoUSD
          };
          return updatedGastos;
        } else {
          const newGasto = {
            id: 'g-auto-' + Date.now(),
            viajeId: activeViajeId,
            eventoId: id,
            concepto,
            categoria: updatedEventoData.tipo === 'hotel' ? 'alojamiento' : (updatedEventoData.tipo === 'vuelo' || updatedEventoData.tipo === 'transporte' ? 'transporte' : 'actividades'),
            montoOriginal: costoNum,
            monedaOriginal,
            montoCOP,
            montoUSD,
            fechaGasto: updatedEventoData.fechaInicio || new Date().toISOString(),
            pagadoAdelantado: false,
            noComputar: false,
            esIngreso: false
          };
          return [newGasto, ...prev];
        }
      } else if (existingGastoIndex >= 0) {
        return prev.filter((_, idx) => idx !== existingGastoIndex);
      }
      return prev;
    });

    return saved;
  };

  const handleDeleteEvento = async (id) => {
    try {
      if (navigator.onLine) {
        await apiRequest(`/itinerario/${id}`, {
          method: 'DELETE'
        });
      }
    } catch {
      // Borrado en modo local / offline
    }

    setEventos(prev => prev.filter(e => e.id !== id));
    setGastos(prev => prev.filter(g => g.eventoId !== id));
    toast.success('Vuelo / Evento eliminado del itinerario.');
  };

  const handleSaveGasto = async (gastoData) => {
    if (!activeViajeId) {
      toast.error('Debes seleccionar o crear un viaje en la base de datos primero.');
      return null;
    }

    const monto = Number(gastoData.montoOriginal) || 0;
    const orig = (gastoData.monedaOriginal || activeViaje?.monedaBase || 'COP').toUpperCase();
    const liveRate = gastoData.tasaCambioFecha || getExactExchangeRate(orig, 'COP');
    const montoCOP = gastoData.montoCOP !== undefined ? Number(gastoData.montoCOP) : convertCurrency(monto, orig, 'COP');
    const montoUSD = gastoData.montoUSD !== undefined ? Number(gastoData.montoUSD) : convertCurrency(monto, orig, 'USD');

    const payload = {
      ...gastoData,
      montoOriginal: monto,
      monedaOriginal: orig,
      tasaCambioFecha: liveRate,
      montoCOP,
      montoUSD
    };

    try {
      if (navigator.onLine) {
        const res = await apiRequest(`/viajes/${activeViajeId}/gastos`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const savedGasto = res?.data || res || payload;
        setGastos(prev => [savedGasto, ...prev.filter(g => g.id !== savedGasto.id)]);
        toast.success('Gasto registrado con éxito (tasa congelada al instante de la compra).');
        return savedGasto;
      }
    } catch (err) {
      console.warn('Error guardando gasto en servidor:', err);
    }

    // Fallback offline con conversión exacta congelada
    const localGasto = {
      ...payload,
      id: 'g-local-' + Date.now(),
      viajeId: activeViajeId
    };
    setGastos(prev => [localGasto, ...prev.filter(g => g.id !== localGasto.id)]);
    toast.info('Guardado localmente. Pendiente de sincronización.');
    return localGasto;
  };

  const handleSaveDocumento = async (docData) => {
    if (!activeViajeId) {
      toast.error('Debes seleccionar o crear un viaje en la base de datos primero.');
      return null;
    }
    try {
      if (navigator.onLine) {
        const res = await apiRequest(`/viajes/${activeViajeId}/boveda`, {
          method: 'POST',
          body: JSON.stringify(docData)
        });
        setDocumentos(prev => [res, ...prev]);
        toast.success('Documento guardado en bóveda.');
        return res;
      }
    } catch {}

    const localDoc = {
      ...docData,
      id: 'doc-local-' + Date.now(),
      viajeId: activeViajeId,
      createdAt: new Date().toISOString()
    };
    setDocumentos(prev => [localDoc, ...prev]);
    toast.info('Documento guardado localmente.');
    return localDoc;
  };

  const handleSyncAndClearLocal = async () => {
    if (!navigator.onLine) {
      toast.error('Se requiere conexión a internet para sincronizar con la base de datos.');
      throw new Error('Sin conexión a internet');
    }

    const toastId = toast.loading('Sincronizando datos con la base de datos...');

    try {
      // 1. Sincronizar hacia el servidor cualquier viaje local creado offline previamente
      const storageKey = getUserStorageKey(usuario);
      const rawLocalList = storageKey ? localStorage.getItem(storageKey) : localStorage.getItem('app_viajes_lista');
      const localSavedList = rawLocalList ? JSON.parse(rawLocalList) : [];
      const pendingLocalViajes = Array.isArray(localSavedList)
        ? localSavedList.filter(v => typeof v.id === 'string' && v.id.startsWith('viaje-local-'))
        : [];

      for (const localV of pendingLocalViajes) {
        const oldId = localV.id;
        const { id: _, ...viajePayload } = localV;
        const res = await apiRequest('/viajes', {
          method: 'POST',
          body: JSON.stringify({
            ...viajePayload,
            usuarioId: usuario?.id,
            usuarioEmail: usuario?.email || null
          })
        });
        const createdViaje = repairViaje(res?.data || res);

        // Subir itinerario local
        const localEvs = JSON.parse(localStorage.getItem(`app_viajes_eventos_${oldId}`) || '[]');
        for (const ev of localEvs) {
          const { id: _, ...evPayload } = ev;
          await apiRequest(`/viajes/${createdViaje.id}/itinerario`, {
            method: 'POST',
            body: JSON.stringify(evPayload)
          }).catch(() => null);
        }

        // Subir gastos locales
        const localGs = JSON.parse(localStorage.getItem(`app_viajes_gastos_${oldId}`) || '[]');
        for (const g of localGs) {
          const { id: _, ...gPayload } = g;
          await apiRequest(`/viajes/${createdViaje.id}/gastos`, {
            method: 'POST',
            body: JSON.stringify(gPayload)
          }).catch(() => null);
        }

        // Subir documentos locales
        const localDocs = JSON.parse(localStorage.getItem(`app_viajes_docs_${oldId}`) || '[]');
        for (const doc of localDocs) {
          const { id: _, ...docPayload } = doc;
          await apiRequest(`/viajes/${createdViaje.id}/boveda`, {
            method: 'POST',
            body: JSON.stringify(docPayload)
          }).catch(() => null);
        }
      }

      // 2. Limpiar llaves de datos locales de viajes en localStorage (preservando sesión de usuario)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k === 'app_viajes_lista' ||
            k.startsWith('app_viajes_lista_') ||
            k.startsWith('app_viajes_eventos_') ||
            k.startsWith('app_viajes_gastos_') ||
            k.startsWith('app_viajes_docs_') ||
            k.startsWith('app_viajes_shared_'))
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // 3. Forzar descarga limpia desde la base de datos real
      await fetchViajeData();

      toast.success('¡Datos sincronizados con éxito y memoria local limpia!', { id: toastId });
      return true;
    } catch (err) {
      toast.error(`Error al sincronizar: ${err.message || 'Error de red'}`, { id: toastId });
      throw err;
    }
  };

  return {
    viajes,
    activeViaje,
    activeViajeId,
    setActiveViajeId,
    eventos,
    gastos,
    documentos,
    balance,
    isOnline,
    handleSaveViaje,
    handleUpdateViaje,
    handleDeleteViaje,
    handleSaveEvento,
    handleUpdateEvento,
    handleDeleteEvento,
    handleSaveGasto,
    handleSaveDocumento,
    handleSyncAndClearLocal
  };
}
