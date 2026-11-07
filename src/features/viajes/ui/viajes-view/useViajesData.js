import { useState, useMemo, useEffect } from 'react';
import { extractVisitedCountries } from '../../../../utils/countries';
import { extractFlightTrajectories } from '../../../../utils/geoCoordinates';
import { calculateTripBalance } from '../../../../utils/balance';

export function useViajesData({
  viajes = [],
  activeViajeId = null,
  eventos = [],
  gastos = [],
  documentos = [],
  balance = null,
  onSelectViaje
}) {
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'en_curso' | 'proximos' | 'finalizados'
  const [isGlobalMapModalOpen, setIsGlobalMapModalOpen] = useState(false);
  const [isTripMapModalOpen, setIsTripMapModalOpen] = useState(false);

  useEffect(() => {
    if (activeViajeId === null && selectedViajeId !== null) {
      setSelectedViajeId(null);
    }
  }, [activeViajeId]);

  const allEventsList = useMemo(() => {
    const list = [...(eventos || [])];
    if (typeof localStorage !== 'undefined') {
      viajes.forEach((v) => {
        if (v.id !== activeViajeId) {
          try {
            const raw = localStorage.getItem(`app_viajes_eventos_${v.id}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                list.push(...parsed);
              }
            }
          } catch {}
        }
      });
    }
    return list;
  }, [eventos, viajes, activeViajeId]);

  const globalVisitedCountries = useMemo(() => {
    const allVisited = extractVisitedCountries(allEventsList, viajes);
    const result = new Map();

    allVisited.forEach((info, code) => {
      result.set(code, {
        ...info,
        isPending: false
      });
    });

    return result;
  }, [allEventsList, viajes]);

  const currentViaje = useMemo(() => {
    if (!selectedViajeId) return null;
    return viajes.find((v) => v.id === selectedViajeId) || null;
  }, [viajes, selectedViajeId]);

  useEffect(() => {
    if (selectedViajeId && !currentViaje) {
      setSelectedViajeId(null);
    }
  }, [selectedViajeId, currentViaje]);

  const tripEvents = useMemo(() => {
    if (!selectedViajeId) return [];
    if (selectedViajeId === activeViajeId && Array.isArray(eventos) && eventos.length > 0) {
      return eventos;
    }
    try {
      const raw = localStorage.getItem(`app_viajes_eventos_${selectedViajeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [selectedViajeId, activeViajeId, eventos]);

  const tripFlights = useMemo(() => {
    if (!currentViaje) return [];
    return extractFlightTrajectories(tripEvents, [currentViaje]);
  }, [tripEvents, currentViaje]);

  const tripVisitedCountries = useMemo(() => {
    if (!currentViaje) return new Map();
    return extractVisitedCountries(tripEvents, [currentViaje]);
  }, [tripEvents, currentViaje]);

  const tripGastos = useMemo(() => {
    if (!selectedViajeId) return [];
    if (selectedViajeId === activeViajeId && Array.isArray(gastos) && gastos.length > 0) {
      return gastos;
    }
    try {
      const raw = localStorage.getItem(`app_viajes_gastos_${selectedViajeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [selectedViajeId, activeViajeId, gastos]);

  const tripDocs = useMemo(() => {
    if (!selectedViajeId) return [];
    if (selectedViajeId === activeViajeId && Array.isArray(documentos) && documentos.length > 0) {
      return documentos;
    }
    try {
      const raw = localStorage.getItem(`app_viajes_docs_${selectedViajeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [selectedViajeId, activeViajeId, documentos]);

  const tripMetrics = useMemo(() => {
    if (selectedViajeId === activeViajeId && balance) {
      return balance;
    }
    return calculateTripBalance(currentViaje, tripGastos);
  }, [selectedViajeId, activeViajeId, balance, currentViaje, tripGastos]);

  const getViajeStatus = (viaje) => {
    if (!viaje || !viaje.fechaInicio || !viaje.fechaFin) {
      return { id: 'proximos', label: 'Planificado', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]' };
    }
    const now = new Date();
    const start = new Date(viaje.fechaInicio);
    const end = new Date(viaje.fechaFin);

    if (now >= start && now <= end) {
      return { id: 'en_curso', label: 'En curso', color: 'text-[#00FF85]', bg: 'bg-[#00FF85]/10', border: 'border-[#00FF85]' };
    }
    if (now < start) {
      return { id: 'proximos', label: 'Próximo', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]' };
    }
    return { id: 'finalizados', label: 'Finalizado', color: 'text-[#8492A6]', bg: 'bg-[#151B27]', border: 'border-[#1C2436]' };
  };

  const filteredViajes = useMemo(() => {
    return viajes.filter((v) => {
      const matchSearch =
        v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.destino.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'todos') return true;
      const status = getViajeStatus(v);
      return status.id === filterStatus;
    });
  }, [viajes, searchTerm, filterStatus]);

  const handleSelectViaje = (viajeId) => {
    setSelectedViajeId(viajeId);
    if (onSelectViaje) {
      onSelectViaje(viajeId);
    }
  };

  const handleBackToOverview = () => {
    setSelectedViajeId(null);
  };

  return {
    selectedViajeId,
    setSelectedViajeId,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    isGlobalMapModalOpen,
    setIsGlobalMapModalOpen,
    isTripMapModalOpen,
    setIsTripMapModalOpen,
    allEventsList,
    globalVisitedCountries,
    currentViaje,
    tripEvents,
    tripFlights,
    tripVisitedCountries,
    tripGastos,
    tripDocs,
    tripMetrics,
    getViajeStatus,
    filteredViajes,
    handleSelectViaje,
    handleBackToOverview
  };
}

export default useViajesData;

