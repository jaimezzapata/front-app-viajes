import React from 'react';
import { Check } from 'lucide-react';
import Modal from '../../../components/Modal';
import useEventoForm from './modal-evento/useEventoForm';
import EventoTipoBasicoSection from './modal-evento/EventoTipoBasicoSection';
import EventoDestinoSection from './modal-evento/EventoDestinoSection';
import VueloTramoSection from './modal-evento/VueloTramoSection';
import EventoHorariosSection from './modal-evento/EventoHorariosSection';
import EventoFinanzasSection from './modal-evento/EventoFinanzasSection';
import EventoNotasSection from './modal-evento/EventoNotasSection';

export function NuevoEventoModal(props) {
  const { isOpen, onClose, activeViaje } = props;
  const {
    isEditing,
    loading,
    errorMsg,
    isTrayecto,
    availableDestinations,
    formData,
    setters,
    handlers
  } = useEventoForm(props);

  const modalTitle = isEditing
    ? (formData.tipo === 'vuelo' ? 'Editar Vuelo' : 'Editar Evento')
    : (formData.tipo === 'vuelo' ? 'Agendar Vuelo' : 'Añadir Evento a la Bitácora');

  const modalMaxWidth = formData.tipo === 'vuelo' && formData.tipoTrayecto === 'round-trip' && !isEditing
    ? 'max-w-2xl'
    : 'max-w-lg';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth={modalMaxWidth}
    >
      <form onSubmit={handlers.handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-[#FF2E55]/10 border border-[#FF2E55]/30 text-xs text-[#FF2E55] flex items-center justify-between">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Tipo de Evento y Título */}
        <EventoTipoBasicoSection
          tipo={formData.tipo}
          onTipoChange={handlers.handleTipoChange}
          titulo={formData.titulo}
          onTituloChange={setters.setTitulo}
        />

        {/* 2. Destino y Ubicación para eventos terrestres / regulares */}
        {formData.tipo !== 'vuelo' && (
          <EventoDestinoSection
            availableDestinations={availableDestinations}
            ciudadDestino={formData.ciudadDestino}
            setCiudadDestino={setters.setCiudadDestino}
            paisDestino={formData.paisDestino}
            setPaisDestino={setters.setPaisDestino}
            ubicacion={formData.ubicacion}
            setUbicacion={setters.setUbicacion}
          />
        )}

        {/* 3. Logística de Vuelo (Salida / Ida y Regreso Round-Trip) */}
        {isTrayecto && (
          <VueloTramoSection
            isEditing={isEditing}
            tipo={formData.tipo}
            tipoTrayecto={formData.tipoTrayecto}
            setTipoTrayecto={setters.setTipoTrayecto}
            // Tramo 1 (Salida)
            aeropuertoOrigen={formData.aeropuertoOrigen}
            ciudadOrigen={formData.ciudadOrigen}
            paisOrigen={formData.paisOrigen}
            aeropuertoDestino={formData.aeropuertoDestino}
            ciudadDestino={formData.ciudadDestino}
            paisDestino={formData.paisDestino}
            fechaInicio={formData.fechaInicio}
            setFechaInicio={setters.setFechaInicio}
            fechaFin={formData.fechaFin}
            setFechaFin={setters.setFechaFin}
            tieneConexion={formData.tieneConexion}
            setTieneConexion={setters.setTieneConexion}
            aeropuertoConexion={formData.aeropuertoConexion}
            setAeropuertoConexion={setters.setAeropuertoConexion}
            ciudadConexion={formData.ciudadConexion}
            setCiudadConexion={setters.setCiudadConexion}
            paisConexion={formData.paisConexion}
            setPaisConexion={setters.setPaisConexion}
            horasEscala={formData.horasEscala}
            escalaMayor24h={formData.escalaMayor24h}
            setEscalaMayor24h={setters.setEscalaMayor24h}
            handleOutboundOriginChange={handlers.handleOutboundOriginChange}
            handleOutboundDestChange={handlers.handleOutboundDestChange}
            handleHorasEscalaChange={handlers.handleHorasEscalaChange}
            // Tramo 2 (Retorno)
            handleSwapReturnLocations={handlers.handleSwapReturnLocations}
            aeropuertoOrigenRegreso={formData.aeropuertoOrigenRegreso}
            setAeropuertoOrigenRegreso={setters.setAeropuertoOrigenRegreso}
            ciudadOrigenRegreso={formData.ciudadOrigenRegreso}
            setCiudadOrigenRegreso={setters.setCiudadOrigenRegreso}
            paisOrigenRegreso={formData.paisOrigenRegreso}
            setPaisOrigenRegreso={setters.setPaisOrigenRegreso}
            aeropuertoDestinoRegreso={formData.aeropuertoDestinoRegreso}
            setAeropuertoDestinoRegreso={setters.setAeropuertoDestinoRegreso}
            ciudadDestinoRegreso={formData.ciudadDestinoRegreso}
            setCiudadDestinoRegreso={setters.setCiudadDestinoRegreso}
            paisDestinoRegreso={formData.paisDestinoRegreso}
            setPaisDestinoRegreso={setters.setPaisDestinoRegreso}
            fechaInicioRegreso={formData.fechaInicioRegreso}
            setFechaInicioRegreso={setters.setFechaInicioRegreso}
            fechaFinRegreso={formData.fechaFinRegreso}
            setFechaFinRegreso={setters.setFechaFinRegreso}
            tieneConexionRegreso={formData.tieneConexionRegreso}
            setTieneConexionRegreso={setters.setTieneConexionRegreso}
            aeropuertoConexionRegreso={formData.aeropuertoConexionRegreso}
            setAeropuertoConexionRegreso={setters.setAeropuertoConexionRegreso}
            ciudadConexionRegreso={formData.ciudadConexionRegreso}
            setCiudadConexionRegreso={setters.setCiudadConexionRegreso}
            paisConexionRegreso={formData.paisConexionRegreso}
            setPaisConexionRegreso={setters.setPaisConexionRegreso}
            horasEscalaRegreso={formData.horasEscalaRegreso}
            escalaMayor24hRegreso={formData.escalaMayor24hRegreso}
            setEscalaMayor24hRegreso={setters.setEscalaMayor24hRegreso}
          />
        )}

        {/* 4. Horarios para Eventos Regulares (Hoteles, Paseos, etc.) */}
        {(!isTrayecto || formData.tipo !== 'vuelo') && (
          <EventoHorariosSection
            fechaInicio={formData.fechaInicio}
            setFechaInicio={setters.setFechaInicio}
            fechaFin={formData.fechaFin}
            setFechaFin={setters.setFechaFin}
          />
        )}

        {/* 5. Finanzas, Moneda, Costo y Tarjeta de Crédito */}
        <EventoFinanzasSection
          moneda={formData.moneda}
          setMoneda={setters.setMoneda}
          costo={formData.costo}
          setCosto={setters.setCosto}
          activeViaje={activeViaje}
          tipo={formData.tipo}
          tipoTrayecto={formData.tipoTrayecto}
          tarjetaCredito={formData.tarjetaCredito}
          setTarjetaCredito={setters.setTarjetaCredito}
          descontarPresupuesto={formData.descontarPresupuesto}
          setDescontarPresupuesto={setters.setDescontarPresupuesto}
          pagadoAdelantado={formData.pagadoAdelantado}
          setPagadoAdelantado={setters.setPagadoAdelantado}
        />

        {/* 6. Notas y Observaciones */}
        <EventoNotasSection
          notas={formData.notas}
          setNotas={setters.setNotas}
        />

        {/* 7. Botones de Acción */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C2436]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#00E5FF] hover:opacity-90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-opacity disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {loading ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                <span>
                  {isEditing
                    ? (formData.tipo === 'vuelo' ? 'Actualizar Vuelo' : 'Actualizar Evento')
                    : (formData.tipo === 'vuelo' && formData.tipoTrayecto === 'round-trip' ? 'Guardar Vuelo Round-Trip' : 'Guardar Evento')}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NuevoEventoModal;
