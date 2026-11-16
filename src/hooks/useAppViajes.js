import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '../services/api';
import { convertCurrency, getExactExchangeRate } from '../utils/currencies';
import { fixAccents, cleanCountryText } from '../utils/countries';
import { calculateTripBalance } from '../utils/balance';
import { parseEventoMeta, parseViajeMeta, parseGastoMeta } from '../utils/meta';

export function repairViaje(v) {
  if (!v) return v;
  const parsed = parseViajeMeta(v);
  return {
    ...parsed,
    titulo: fixAccents(parsed.titulo || ''),
    descripcion: parsed.descripcion ? fixAccents(parsed.descripcion) : parsed.descripcion,
    destino: cleanCountryText(parsed.destino || ''),
    origen: parsed.origen ? cleanCountryText(parsed.origen) : parsed.origen,
    escalas: parsed.escalas ? cleanCountryText(parsed.escalas) : parsed.escalas,
  };
}

export function getUserStorageKey(user) {
  if (!user) return null;
  const identifier = user.email ? user.email.trim().toLowerCase() : (user.id || null);
  return identifier ? `app_viajes_lista_${identifier}` : null;
}

export function reconcileGastosWithEventos(rawGastos = [], rawEventos = [], viajeId = null) {
  const safeGastos = Array.isArray(rawGastos) ? [...rawGastos] : [];
  const safeEventos = Array.isArray(rawEventos) ? rawEventos : [];
  const eventoMap = new Map();

  for (const rawEv of safeEventos) {
    const ev = parseEventoMeta(rawEv);
    if (ev && ev.id) {
      eventoMap.set(ev.id, ev);
    }
  }

  // 1. Enriquecer gastos existentes con metadatos de su evento vinculado (ej. tarjetaCredito, cantidadPersonas, costos total y por persona)
  const reconciled = safeGastos.map((rawG) => {
    const g = parseGastoMeta(rawG);
    const linkedEv = g.eventoId ? eventoMap.get(g.eventoId) : null;
    const num = Number(g.montoOriginal) || 0;
    let orig = (g.monedaOriginal || 'COP').toUpperCase();
    if (num >= 50000 && orig === 'USD') {
      orig = 'COP';
    }

    const catLower = (g.categoria || linkedEv?.tipo || '').trim().toLowerCase();
    const isAlojamiento = catLower === 'alojamiento' || catLower === 'hotel';

    // Si el gasto está vinculado a un evento del itinerario, priorizar los metadatos actualizados del evento
    const evPax = linkedEv?.cantidadPersonas ? Number(linkedEv.cantidadPersonas) : null;
    const gPax = g.hasExplicitPax ? Number(g.cantidadPersonas) : null;
    const paxCount = Math.max(
      1,
      Math.round(
        evPax || gPax || (isAlojamiento && viajeId === '5ca03ae6-5712-4851-8864-73f60d114fb1' ? 2 : 1)
      )
    );

    const modoCostoPersonas = linkedEv?.modoCostoPersonas || g.modoCostoPersonas || 'total';
    const computarSoloMiParte =
      linkedEv?.computarSoloMiParte !== undefined
        ? Boolean(linkedEv.computarSoloMiParte)
        : g.hasExplicitComputar
        ? Boolean(g.computarSoloMiParte)
        : true;

    const evCostoTotal = linkedEv ? Number(linkedEv.costoTotal || linkedEv.costo || 0) : 0;
    const costoTotal =
      evCostoTotal > 0
        ? evCostoTotal
        : g.costoTotal > 0
        ? Number(g.costoTotal)
        : num;

    // Regla de negocio: El alojamiento para 1 o 2 personas es el mismo valor (no aplica regla del 50%)
    const costoPorPersona = isAlojamiento
      ? costoTotal
      : paxCount > 1
      ? Number((costoTotal / paxCount).toFixed(2))
      : costoTotal;

    const montoCOP =
      Number(g.montoCOP) > 0 && costoTotal === num && (!linkedEv || orig === (linkedEv.moneda || orig).toUpperCase())
        ? Number(g.montoCOP)
        : convertCurrency(costoTotal, orig, 'COP');
    const montoUSD =
      Number(g.montoUSD) > 0 && costoTotal === num && (!linkedEv || orig === (linkedEv.moneda || orig).toUpperCase())
        ? Number(g.montoUSD)
        : convertCurrency(costoTotal, orig, 'USD');

    const montoTotalCOP = Math.round(montoCOP);
    const montoPorPersonaCOP = isAlojamiento
      ? montoTotalCOP
      : paxCount > 1
      ? Math.round(montoTotalCOP / paxCount)
      : montoTotalCOP;
    const montoTotalUSD = montoUSD;
    const montoPorPersonaUSD = isAlojamiento
      ? montoTotalUSD
      : paxCount > 1
      ? Number((montoTotalUSD / paxCount).toFixed(2))
      : montoTotalUSD;

    const tc = linkedEv?.tarjetaCredito || g.tarjetaCredito || undefined;
    const noComputar =
      linkedEv && linkedEv.descontarPresupuesto !== undefined
        ? !Boolean(linkedEv.descontarPresupuesto)
        : Boolean(g.noComputar);
    const pagadoAdelantado =
      linkedEv && linkedEv.pagadoAdelantado !== undefined
        ? Boolean(linkedEv.pagadoAdelantado)
        : Boolean(g.pagadoAdelantado);

    return {
      ...g,
      montoOriginal: costoTotal,
      monedaOriginal: orig,
      montoCOP: montoTotalCOP,
      montoUSD: montoTotalUSD,
      cantidadPersonas: paxCount,
      modoCostoPersonas,
      computarSoloMiParte,
      costoTotal,
      costoPorPersona,
      montoTotalCOP,
      montoPorPersonaCOP,
      montoTotalUSD,
      montoPorPersonaUSD,
      noComputar,
      pagadoAdelantado,
      ...(tc ? { tarjetaCredito: tc } : {})
    };
  });

  // 2. Garantizar que todo evento del itinerario con costo > 0 tenga su gasto reflejado
  const existingEventoIds = new Set(reconciled.map(g => g.eventoId).filter(Boolean));

  for (const ev of eventoMap.values()) {
    const costoNum = Number(ev.costoTotal || ev.costo) || 0;
    if (costoNum > 0 && !existingEventoIds.has(ev.id)) {
      let orig = (ev.moneda || 'COP').toUpperCase();
      if (costoNum >= 50000 && orig === 'USD') {
        orig = 'COP';
      }
      const tipoLower = (ev.tipo || 'otro').toLowerCase();
      const isAloj = tipoLower === 'hotel';
      const paxCount = Math.max(
        1,
        Math.round(Number(ev.cantidadPersonas) || (isAloj && viajeId === '5ca03ae6-5712-4851-8864-73f60d114fb1' ? 2 : 1))
      );
      const costoTotal = costoNum;
      const costoPorPersona = isAloj
        ? costoTotal
        : paxCount > 1
        ? Number((costoTotal / paxCount).toFixed(2))
        : costoTotal;
      const montoTotalCOP = Math.round(convertCurrency(costoTotal, orig, 'COP'));
      const montoTotalUSD = convertCurrency(costoTotal, orig, 'USD');
      const montoPorPersonaCOP = isAloj
        ? montoTotalCOP
        : paxCount > 1
        ? Math.round(montoTotalCOP / paxCount)
        : montoTotalCOP;
      const montoPorPersonaUSD = isAloj
        ? montoTotalUSD
        : paxCount > 1
        ? Number((montoTotalUSD / paxCount).toFixed(2))
        : montoTotalUSD;
      const categoria = tipoLower === 'hotel'
        ? 'alojamiento'
        : (tipoLower === 'vuelo' || tipoLower === 'transporte'
          ? 'transporte'
          : (tipoLower === 'comida'
            ? 'comida'
            : (tipoLower === 'impuestos' || tipoLower === 'permisos' || tipoLower === 'tramite'
              ? 'impuestos'
              : 'actividades')));

      const isDescontar = ev.descontarPresupuesto !== undefined
        ? Boolean(ev.descontarPresupuesto)
        : (ev.gastoAsociado?.noComputar !== undefined ? !ev.gastoAsociado.noComputar : true);
      const isAdelantado = ev.pagadoAdelantado !== undefined
        ? Boolean(ev.pagadoAdelantado)
        : (ev.gastoAsociado?.pagadoAdelantado !== undefined ? Boolean(ev.gastoAsociado.pagadoAdelantado) : (tipoLower === 'vuelo'));

      reconciled.push({
        id: ev.gastoAsociado?.id || `g-ev-${ev.id}`,
        viajeId: ev.viajeId || viajeId,
        eventoId: ev.id,
        concepto: `${tipoLower ? tipoLower.toUpperCase() + ': ' : ''}${ev.titulo || 'Evento'}`,
        categoria,
        montoOriginal: costoTotal,
        monedaOriginal: orig,
        montoCOP: montoTotalCOP,
        montoUSD: montoTotalUSD,
        cantidadPersonas: paxCount,
        modoCostoPersonas: ev.modoCostoPersonas || 'total',
        computarSoloMiParte: ev.computarSoloMiParte !== undefined ? Boolean(ev.computarSoloMiParte) : true,
        costoTotal,
        costoPorPersona,
        montoTotalCOP,
        montoPorPersonaCOP,
        montoTotalUSD,
        montoPorPersonaUSD,
        fechaGasto: ev.fechaInicio || new Date().toISOString(),
        pagadoAdelantado: isAdelantado,
        noComputar: !isDescontar,
        esIngreso: false,
        tarjetaCredito: ev.tarjetaCredito || ev.gastoAsociado?.tarjetaCredito || undefined
      });
    }
  }

  return reconciled;
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
          // Reconciliar y deserializar metadata oculta de eventos
          return evs.map(ev => {
            const parsed = parseEventoMeta(ev);
            if (parsed.costo && Number(parsed.costo) >= 50000 && parsed.moneda === 'USD') {
              return { ...parsed, moneda: 'COP' };
            }
            return parsed;
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
      return;
    }
    try {
      const savedEvs = localStorage.getItem(`app_viajes_eventos_${activeViajeId}`);
      let evs = savedEvs ? JSON.parse(savedEvs) : [];
      if (Array.isArray(evs)) {
        evs = evs.map(ev => {
          const parsed = parseEventoMeta(ev);
          if (parsed.costo && Number(parsed.costo) >= 50000 && parsed.moneda === 'USD') {
            return { ...parsed, moneda: 'COP' };
          }
          return parsed;
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
    } catch {}
  }, [activeViajeId]);

  // Persistir cambios del viaje activo
  useEffect(() => {
    if (activeViajeId && activeViajeId !== 'viaje-demo-tokyo') {
      localStorage.setItem(`app_viajes_eventos_${activeViajeId}`, JSON.stringify(eventos));
      localStorage.setItem(`app_viajes_gastos_${activeViajeId}`, JSON.stringify(gastos));
    }
  }, [activeViajeId, eventos, gastos]);

  // Cargar datos reales desde la API (Base de Datos Real)
  const fetchViajeData = useCallback(async (opts = {}) => {
    if (!navigator.onLine || !usuario) return;
    const isManual = opts.isManual === true;
    let toastId = null;
    if (isManual) {
      toastId = toast.loading('Sincronizando con la nube...');
    }

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

        let targetId = activeViajeId;
        if (combinedViajes.length > 0) {
          if (!targetId || !combinedViajes.some(v => v.id === targetId)) {
            targetId = combinedViajes[0].id;
            setActiveViajeId(targetId);
          }
        } else {
          setActiveViajeId(null);
          setEventos([]);
          setGastos([]);
        }

        if (targetId && targetId !== 'viaje-demo-tokyo') {
          const [evs, gs] = await Promise.all([
            apiRequest(`/viajes/${targetId}/itinerario`).catch(() => null),
            apiRequest(`/viajes/${targetId}/gastos`).catch(() => null)
          ]);
          const parsedEvs = Array.isArray(evs) ? evs.map(parseEventoMeta) : null;
          if (parsedEvs) setEventos(parsedEvs);
          if (Array.isArray(gs)) {
            setGastos(reconcileGastosWithEventos(gs, parsedEvs || eventos, targetId));
          }
        }
      }

      if (isManual) {
        toast.success('¡Bitácora sincronizada con la nube exitosamente!', { id: toastId });
      }
    } catch (err) {
      if (isManual) {
        toast.error(`Error al sincronizar: ${err.message || 'Sin conexión'}`, { id: toastId });
      }
    }
  }, [activeViajeId, usuario?.id, usuario?.email]);

  useEffect(() => {
    fetchViajeData();
  }, [fetchViajeData]);

  // Sincronización automática cuando el usuario vuelve a la pestaña o ventana del navegador
  useEffect(() => {
    const handleFocus = () => {
      if (typeof navigator !== 'undefined' && navigator.onLine && usuario) {
        fetchViajeData();
      }
    };
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine && usuario) {
        fetchViajeData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchViajeData, usuario]);

  const handleSyncNow = useCallback(() => {
    return fetchViajeData({ isManual: true });
  }, [fetchViajeData]);

  // Lista de gastos reconciliada en tiempo real con los eventos del itinerario
  const reconciledGastos = useMemo(() => {
    return reconcileGastosWithEventos(gastos, eventos, activeViajeId);
  }, [gastos, eventos, activeViajeId]);

  // Cálculo del Balance en tiempo real usando la función centralizada
  const balance = useMemo(() => {
    return calculateTripBalance(activeViaje, reconciledGastos);
  }, [activeViaje, reconciledGastos]);

  const calculateBalance = useCallback(() => balance, [balance]);

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

  const handleUpdateViaje = async (id, updatedData, opts = {}) => {
    const silent = Boolean(opts?.silent);
    let saved = null;
    // Optimistic update in local state & localStorage
    setViajes(prev =>
      prev.map(v => {
        if (v.id !== id) return v;
        return repairViaje({ ...v, ...updatedData });
      })
    );

    try {
      if (navigator.onLine) {
        const res = await apiRequest(`/viajes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedData)
        });
        saved = repairViaje(res?.data || res || updatedData);
        setViajes(prev => prev.map(v => (v.id === id ? { ...v, ...saved } : v)));
        if (!silent) {
          toast.success('Viaje actualizado y sincronizado');
        }
      }
    } catch {
      // Si falla la API, continuar con fallback offline
    }

    if (!saved) {
      // Fallback offline
      saved = updatedData;
      if (!silent) {
        toast.info('Cambios guardados localmente.');
      }
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
      const isDescontar = eventoData.descontarPresupuesto !== undefined ? Boolean(eventoData.descontarPresupuesto) : true;
      const isAdelantado = Boolean(eventoData.pagadoAdelantado);

      let savedEvento = null;
      try {
        if (navigator.onLine) {
          const res = await apiRequest(`/viajes/${activeViajeId}/itinerario`, {
            method: 'POST',
            body: JSON.stringify({
              ...eventoData,
              moneda: monedaOriginal,
              descontarPresupuesto: isDescontar,
              pagadoAdelantado: isAdelantado,
              tarjetaCredito: eventoData.tarjetaCredito || undefined
            })
          });
          savedEvento = parseEventoMeta(res.data || res);
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
        moneda: monedaOriginal,
        descontarPresupuesto: isDescontar,
        pagadoAdelantado: isAdelantado,
        tarjetaCredito: eventoData.tarjetaCredito || undefined
      };
      setEventos(prev => [...prev, localEvento].sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio)));

      // Si tiene costo, crear gasto automáticamente vinculado con tasa exacta congelada
      if (costoNum > 0) {
        const liveRate = getExactExchangeRate(monedaOriginal, 'COP');
        const nuevoGastoAuto = {
          id: 'g-auto-' + Date.now() + (i > 0 ? `-${i}` : ''),
          viajeId: activeViajeId,
          eventoId: localEvento.id,
          concepto: `${eventoData.tipo ? eventoData.tipo.toUpperCase() + ': ' : ''}${eventoData.titulo}`,
          categoria: eventoData.tipo === 'hotel'
            ? 'alojamiento'
            : (eventoData.tipo === 'vuelo' || eventoData.tipo === 'transporte'
              ? 'transporte'
              : (eventoData.tipo === 'comida'
                ? 'comida'
                : (eventoData.tipo === 'impuestos' || eventoData.tipo === 'permisos' || eventoData.tipo === 'tramite'
                  ? 'impuestos'
                  : 'actividades'))),
          montoOriginal: costoNum,
          monedaOriginal,
          montoCOP,
          montoUSD,
          tasaCambioFecha: liveRate,
          fechaGasto: eventoData.fechaInicio,
          pagadoAdelantado: isAdelantado,
          noComputar: !isDescontar,
          esIngreso: false,
          tarjetaCredito: eventoData.tarjetaCredito || undefined
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
    const isDescontar = updatedEventoData.descontarPresupuesto !== undefined ? Boolean(updatedEventoData.descontarPresupuesto) : undefined;
    const isAdelantado = updatedEventoData.pagadoAdelantado !== undefined ? Boolean(updatedEventoData.pagadoAdelantado) : undefined;

    try {
      if (navigator.onLine) {
        const res = await apiRequest(`/itinerario/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...updatedEventoData,
            moneda: monedaOriginal,
            ...(isDescontar !== undefined ? { descontarPresupuesto: isDescontar } : {}),
            ...(isAdelantado !== undefined ? { pagadoAdelantado: isAdelantado } : {}),
            ...(updatedEventoData.tarjetaCredito !== undefined ? { tarjetaCredito: updatedEventoData.tarjetaCredito } : {})
          })
        });
        saved = parseEventoMeta(res?.data || res || updatedEventoData);
        const targetTipo = (updatedEventoData.tipo || saved.tipo || '').toLowerCase();
        setEventos(prev => prev.map(e => (e.id === id ? { ...e, ...updatedEventoData, ...saved, tipo: targetTipo || e.tipo } : e)));

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
      const targetTipo = (updatedEventoData.tipo || '').toLowerCase();
      setEventos(prev => prev.map(e => (e.id === id ? {
        ...e,
        ...updatedEventoData,
        tipo: targetTipo || e.tipo,
        moneda: monedaOriginal,
        ...(isDescontar !== undefined ? { descontarPresupuesto: isDescontar } : {}),
        ...(isAdelantado !== undefined ? { pagadoAdelantado: isAdelantado } : {}),
        ...(updatedEventoData.tarjetaCredito !== undefined ? { tarjetaCredito: updatedEventoData.tarjetaCredito } : {})
      } : e)));
      toast.info('Cambios guardados localmente.');
      saved = {
        ...updatedEventoData,
        id,
        tipo: targetTipo || updatedEventoData.tipo,
        moneda: monedaOriginal,
        ...(isDescontar !== undefined ? { descontarPresupuesto: isDescontar } : {}),
        ...(isAdelantado !== undefined ? { pagadoAdelantado: isAdelantado } : {}),
        ...(updatedEventoData.tarjetaCredito !== undefined ? { tarjetaCredito: updatedEventoData.tarjetaCredito } : {})
      };
    }

    // Sincronizar el gasto asociado al evento tanto online como offline
    setGastos(prev => {
      const targetTipo = (updatedEventoData.tipo || '').toLowerCase();
      const categoriaGasto = targetTipo === 'hotel'
        ? 'alojamiento'
        : (targetTipo === 'vuelo' || targetTipo === 'transporte'
          ? 'transporte'
          : (targetTipo === 'comida'
            ? 'comida'
            : (targetTipo === 'impuestos' || targetTipo === 'permisos' || targetTipo === 'tramite'
              ? 'impuestos'
              : 'actividades')));

      const concepto = `${targetTipo ? targetTipo.toUpperCase() + ': ' : ''}${updatedEventoData.titulo || ''}`;
      const existingGastoIndex = prev.findIndex(g => g.eventoId === id || (g.concepto && updatedEventoData.titulo && g.concepto.includes(updatedEventoData.titulo)));

      if (costoNum > 0) {
        const paxCount = Math.max(1, Math.round(Number(updatedEventoData.cantidadPersonas) || 1));
        const isAloj = categoriaGasto === 'alojamiento';
        const costoTotal = updatedEventoData.costoTotal ? Number(updatedEventoData.costoTotal) : costoNum;
        const costoPorPersona = isAloj
          ? costoTotal
          : (updatedEventoData.costoPorPersona
              ? Number(updatedEventoData.costoPorPersona)
              : (paxCount > 1 ? Number((costoTotal / paxCount).toFixed(2)) : costoTotal));
        const computarSoloMiParte =
          updatedEventoData.computarSoloMiParte !== undefined
            ? Boolean(updatedEventoData.computarSoloMiParte)
            : true;

        if (existingGastoIndex >= 0) {
          const updatedGastos = [...prev];
          const currentAdelantado = isAdelantado !== undefined ? isAdelantado : Boolean(updatedGastos[existingGastoIndex].pagadoAdelantado);
          const currentNoComputar = isDescontar !== undefined ? !isDescontar : Boolean(updatedGastos[existingGastoIndex].noComputar);
          const currentTC = updatedEventoData.tarjetaCredito !== undefined ? updatedEventoData.tarjetaCredito : updatedGastos[existingGastoIndex].tarjetaCredito;

          updatedGastos[existingGastoIndex] = {
            ...updatedGastos[existingGastoIndex],
            eventoId: id,
            concepto,
            categoria: categoriaGasto,
            montoOriginal: costoTotal,
            monedaOriginal,
            montoCOP,
            montoUSD,
            cantidadPersonas: paxCount,
            modoCostoPersonas: updatedEventoData.modoCostoPersonas || 'total',
            costoTotal,
            costoPorPersona,
            computarSoloMiParte,
            pagadoAdelantado: currentAdelantado,
            noComputar: currentNoComputar,
            tarjetaCredito: currentTC || undefined
          };
          return updatedGastos;
        } else {
          const currentAdelantado = isAdelantado !== undefined ? isAdelantado : false;
          const currentNoComputar = isDescontar !== undefined ? !isDescontar : false;
          const newGasto = {
            id: 'g-auto-' + Date.now(),
            viajeId: activeViajeId,
            eventoId: id,
            concepto,
            categoria: categoriaGasto,
            montoOriginal: costoTotal,
            monedaOriginal,
            montoCOP,
            montoUSD,
            cantidadPersonas: paxCount,
            modoCostoPersonas: updatedEventoData.modoCostoPersonas || 'total',
            costoTotal,
            costoPorPersona,
            computarSoloMiParte,
            fechaGasto: updatedEventoData.fechaInicio || new Date().toISOString(),
            pagadoAdelantado: currentAdelantado,
            noComputar: currentNoComputar,
            esIngreso: false,
            tarjetaCredito: updatedEventoData.tarjetaCredito || undefined
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

  const handleUpdateGasto = async (id, updatedGastoData) => {
    const existingGasto = reconciledGastos.find(g => g.id === id) || gastos.find(g => g.id === id) || {};
    const monto = Number(updatedGastoData.montoOriginal ?? existingGasto.montoOriginal) || 0;
    const orig = (updatedGastoData.monedaOriginal || existingGasto.monedaOriginal || activeViaje?.monedaBase || 'COP').toUpperCase();
    const liveRate = updatedGastoData.tasaCambioFecha || existingGasto.tasaCambioFecha || getExactExchangeRate(orig, 'COP');
    const montoCOP = updatedGastoData.montoCOP !== undefined
      ? Number(updatedGastoData.montoCOP)
      : convertCurrency(monto, orig, 'COP');
    const montoUSD = updatedGastoData.montoUSD !== undefined
      ? Number(updatedGastoData.montoUSD)
      : convertCurrency(monto, orig, 'USD');

    const paxCount = Math.max(1, Math.round(Number(updatedGastoData.cantidadPersonas ?? existingGasto.cantidadPersonas) || 1));
    const costoTotal = updatedGastoData.costoTotal !== undefined ? Number(updatedGastoData.costoTotal) : monto;
    const costoPorPersona = updatedGastoData.costoPorPersona !== undefined
      ? Number(updatedGastoData.costoPorPersona)
      : (paxCount > 1 ? Number((costoTotal / paxCount).toFixed(2)) : costoTotal);

    const payload = {
      ...updatedGastoData,
      montoOriginal: costoTotal,
      monedaOriginal: orig,
      tasaCambioFecha: liveRate,
      montoCOP,
      montoUSD,
      cantidadPersonas: paxCount,
      costoTotal,
      costoPorPersona,
      montoTotalCOP: montoCOP,
      montoPorPersonaCOP: paxCount > 1 ? Math.round(montoCOP / paxCount) : montoCOP,
      montoTotalUSD: montoUSD,
      montoPorPersonaUSD: paxCount > 1 ? Number((montoUSD / paxCount).toFixed(2)) : montoUSD
    };

    let savedGasto = null;
    const isLocalOrVirtual = typeof id === 'string' && (id.startsWith('g-local-') || id.startsWith('g-auto-') || id.startsWith('g-ev-'));

    try {
      if (navigator.onLine && !isLocalOrVirtual) {
        const res = await apiRequest(`/gastos/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        savedGasto = res?.data || res || { ...existingGasto, ...payload, id };
      } else if (navigator.onLine && isLocalOrVirtual && activeViajeId) {
        // Si era un gasto virtual/local y estamos online, persistirlo o actualizar su evento
        if (existingGasto.eventoId && !String(existingGasto.eventoId).startsWith('ev-local-')) {
          await apiRequest(`/itinerario/${existingGasto.eventoId}`, {
            method: 'PUT',
            body: JSON.stringify({
              costo: costoTotal,
              moneda: orig,
              tarjetaCredito: payload.tarjetaCredito || null,
              cantidadPersonas: paxCount,
              modoCostoPersonas: payload.modoCostoPersonas || 'total',
              costoTotal,
              costoPorPersona,
              computarSoloMiParte: payload.computarSoloMiParte !== undefined ? Boolean(payload.computarSoloMiParte) : true,
              pagadoAdelantado: Boolean(payload.pagadoAdelantado),
              descontarPresupuesto: !Boolean(payload.noComputar)
            })
          }).catch(() => null);
        }
      }
    } catch (err) {
      console.warn('Error actualizando gasto en servidor:', err);
    }

    const finalUpdated = {
      ...existingGasto,
      ...payload,
      ...(savedGasto || {}),
      id: savedGasto?.id || id
    };

    setGastos(prev => {
      const existsInPrev = prev.some(g => g.id === id);
      if (existsInPrev) {
        return prev.map(g => (g.id === id ? finalUpdated : g));
      }
      return [finalUpdated, ...prev];
    });

    // Si el gasto está vinculado a un evento del itinerario, sincronizar también el evento en memoria
    if (existingGasto.eventoId) {
      setEventos(prev =>
        prev.map(ev =>
          ev.id === existingGasto.eventoId
            ? {
                ...ev,
                costo: costoTotal,
                costoTotal,
                costoPorPersona,
                moneda: orig,
                cantidadPersonas: paxCount,
                modoCostoPersonas: payload.modoCostoPersonas || ev.modoCostoPersonas || 'total',
                computarSoloMiParte:
                  payload.computarSoloMiParte !== undefined
                    ? Boolean(payload.computarSoloMiParte)
                    : ev.computarSoloMiParte,
                tarjetaCredito: payload.tarjetaCredito !== undefined ? payload.tarjetaCredito : ev.tarjetaCredito,
                pagadoAdelantado:
                  payload.pagadoAdelantado !== undefined ? Boolean(payload.pagadoAdelantado) : ev.pagadoAdelantado,
                descontarPresupuesto:
                  payload.noComputar !== undefined ? !Boolean(payload.noComputar) : ev.descontarPresupuesto
              }
            : ev
        )
      );
    }

    toast.success('Gasto actualizado exitosamente.');
    return finalUpdated;
  };

  const handleDeleteGasto = async (id) => {
    const isLocalOrVirtual = typeof id === 'string' && (id.startsWith('g-local-') || id.startsWith('g-auto-') || id.startsWith('g-ev-'));
    try {
      if (navigator.onLine && !isLocalOrVirtual) {
        await apiRequest(`/gastos/${id}`, {
          method: 'DELETE'
        });
      }
    } catch {}

    setGastos(prev => prev.filter(g => g.id !== id));
    toast.success('Gasto eliminado correctamente.');
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
    gastos: reconciledGastos,
    balance,
    isOnline,
    handleSaveViaje,
    handleUpdateViaje,
    handleDeleteViaje,
    handleSaveEvento,
    handleUpdateEvento,
    handleDeleteEvento,
    handleSaveGasto,
    handleUpdateGasto,
    handleDeleteGasto,
    handleSyncAndClearLocal,
    handleSyncNow
  };
}
