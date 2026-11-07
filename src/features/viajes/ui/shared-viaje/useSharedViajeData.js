import { useState, useEffect, useMemo } from 'react';
import { extractVisitedCountries } from '../../../../utils/countries';
import { extractFlightTrajectories } from '../../../../utils/geoCoordinates';
import { calculateTripBalance } from '../../../../utils/balance';
import { parseEventoMeta, parseViajeMeta } from '../../../../utils/meta';
import { apiRequest } from '../../../../services/api';
import { groupEventosByCountryCity } from '../../../../utils/itinerarioGrouping';

export function useSharedViajeData({ shareId, shareDataRaw }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viaje, setViaje] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [activeTab, setActiveTab] = useState('itinerario');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSharedData() {
      setLoading(true);
      setError(null);

      // Opción A: Deserializar snapshot directo desde URL
      if (shareDataRaw) {
        try {
          const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(shareDataRaw))));
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.viaje) {
            if (isMounted) {
              setViaje(parseViajeMeta(parsed.viaje));
              setEventos((parsed.eventos || parsed.itinerario || []).map(parseEventoMeta));
              setGastos(parsed.gastos || []);
              setDocumentos(parsed.documentos || []);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('[SharedView] Error parseando shareData:', err);
        }
      }

      // Opción B: Cargar desde API o LocalStorage por ID
      if (shareId) {
        try {
          const res = await apiRequest(`/viajes/${shareId}`);
          const data = res?.data || res;
          if (data && isMounted) {
            setViaje(parseViajeMeta(data));
            setEventos((data.itinerarios || data.eventos || []).map(parseEventoMeta));
            setGastos(data.gastos || []);
            setDocumentos(data.documentos || []);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('[SharedView] No se pudo cargar de la API remota, buscando en almacenamiento local:', apiErr.message);
        }

        try {
          const directShared = localStorage.getItem(`app_viajes_shared_${shareId}`);
          if (directShared) {
            const parsed = JSON.parse(directShared);
            if (parsed && parsed.viaje && isMounted) {
              setViaje(parseViajeMeta(parsed.viaje));
              setEventos((parsed.eventos || parsed.itinerario || []).map(parseEventoMeta));
              setGastos(parsed.gastos || []);
              setDocumentos(parsed.documentos || []);
              setLoading(false);
              return;
            }
          }

          const savedViajes = localStorage.getItem('app_viajes_lista');
          if (savedViajes) {
            const list = JSON.parse(savedViajes);
            const found = list.find((v) => v.id === shareId);
            if (found && isMounted) {
              setViaje(parseViajeMeta(found));

              const savedEv = localStorage.getItem(`app_viajes_eventos_${shareId}`);
              if (savedEv) setEventos((JSON.parse(savedEv) || []).map(parseEventoMeta));

              const savedGastos = localStorage.getItem(`app_viajes_gastos_${shareId}`);
              if (savedGastos) setGastos(JSON.parse(savedGastos) || []);

              const savedDocs = localStorage.getItem(`app_viajes_docs_${shareId}`);
              if (savedDocs) setDocumentos(JSON.parse(savedDocs) || []);

              setLoading(false);
              return;
            }
          }
        } catch (localErr) {
          console.warn('[SharedView] Error leyendo almacenamiento local:', localErr);
        }
      }

      if (isMounted) {
        setError('No se pudo encontrar la bitácora de este viaje o el enlace ha caducado.');
        setLoading(false);
      }
    }

    loadSharedData();

    return () => {
      isMounted = false;
    };
  }, [shareId, shareDataRaw]);

  const visitedCountries = useMemo(() => {
    if (!viaje) return new Map();
    return extractVisitedCountries(eventos, [viaje]);
  }, [viaje, eventos]);

  const flightRoutes = useMemo(() => {
    if (!viaje) return [];
    return extractFlightTrajectories(eventos, [viaje]);
  }, [viaje, eventos]);

  const groupedSharedSections = useMemo(() => {
    const sorted = [...eventos].sort((a, b) => new Date(a.fechaInicio || a.fecha || 0) - new Date(b.fechaInicio || b.fecha || 0));
    return groupEventosByCountryCity(sorted, viaje);
  }, [eventos, viaje]);

  const { totalGastadoCOP, totalGastadoUSD, diffDays, status } = useMemo(() => {
    if (!viaje) return { totalGastadoCOP: 0, totalGastadoUSD: 0, diffDays: 0, status: null };

    const tripBalance = calculateTripBalance(viaje, gastos);

    const start = new Date(viaje.fechaInicio);
    const end = new Date(viaje.fechaFin);
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    const now = new Date();
    let st = { id: 'finalizado', label: 'Finalizado', color: 'text-[#8492A6]', bg: 'bg-[#151B27]', border: 'border-[#1C2436]' };
    if (now >= start && now <= end) {
      st = { id: 'en_curso', label: 'En Curso', color: 'text-[#00FF85]', bg: 'bg-[#00FF85]/10', border: 'border-[#00FF85]' };
    } else if (now < start) {
      st = { id: 'proximo', label: 'Próximo', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]' };
    }

    return {
      totalGastadoCOP: Math.round(tripBalance.totalGastadoCOP),
      totalGastadoUSD: Math.round(tripBalance.totalGastadoUSD),
      diffDays: days,
      status: st
    };
  }, [viaje, gastos]);

  return {
    loading,
    error,
    viaje,
    eventos,
    gastos,
    documentos,
    activeTab,
    setActiveTab,
    isShareModalOpen,
    setIsShareModalOpen,
    isMapModalOpen,
    setIsMapModalOpen,
    visitedCountries,
    flightRoutes,
    groupedSharedSections,
    totalGastadoCOP,
    totalGastadoUSD,
    diffDays,
    status
  };
}

export default useSharedViajeData;

