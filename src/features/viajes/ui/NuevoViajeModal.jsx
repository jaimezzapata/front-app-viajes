import React from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import Modal from '../../../components/Modal';
import useNuevoViajeForm from './modal-viaje/useNuevoViajeForm';
import ViajeStepperNav from './modal-viaje/ViajeStepperNav';
import ViajeEditTabsNav from './modal-viaje/ViajeEditTabsNav';
import ViajeRutaStep from './modal-viaje/ViajeRutaStep';
import ViajeFechasStep from './modal-viaje/ViajeFechasStep';
import ViajePresupuestoStep from './modal-viaje/ViajePresupuestoStep';

export function NuevoViajeModal(props) {
  const { isOpen, onClose } = props;
  const form = useNuevoViajeForm(props);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={form.isEditing ? 'Editar Configuración del Viaje' : 'Configurar Nuevo Viaje'}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-2.5 w-full">
          {/* MODO EDICIÓN: Guardado directo */}
          {form.isEditing ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#8492A6] hover:text-[#F1F5F9] transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={form.handlers.handleSubmit}
                disabled={form.loading}
                className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center gap-1.5 ml-auto"
              >
                {form.loading ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* MODO CREACIÓN: Asistente paso a paso */
            <>
              {form.step === 1 ? (
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
                    form.setErrorMsg('');
                    form.setStep(prev => prev - 1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#151B27] border border-[#1C2436] hover:bg-[#1E2738] text-xs font-semibold text-[#CBD5E1] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              {form.step < 3 ? (
                <button
                  type="button"
                  onClick={form.step === 1 ? form.handlers.handleNextFromStep1 : form.handlers.handleNextFromStep2}
                  className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center gap-1.5"
                >
                  <span>{form.step === 1 ? 'Siguiente: Fechas' : 'Siguiente: Presupuesto'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={form.handlers.handleSubmit}
                  disabled={form.loading}
                  className="px-5 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00FF85]/90 text-[#080A0F] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#00FF85]/10 flex items-center gap-1.5"
                >
                  {form.loading ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Crear Viaje</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      }
    >
      <div className="space-y-5 pb-1">
        {/* Navegación Superior: Tabs de edición libre o Stepper de 3 pasos */}
        {form.isEditing ? (
          <ViajeEditTabsNav editTab={form.editTab} setEditTab={form.setEditTab} />
        ) : (
          <ViajeStepperNav step={form.step} setStep={form.setStep} />
        )}

        {/* Mensaje de error si existe */}
        {form.errorMsg && (
          <div className="p-3 rounded-xl bg-[#FF2E55]/10 border border-[#FF2E55]/30 text-xs text-[#FF2E55] font-semibold animate-in fade-in duration-150">
            {form.errorMsg}
          </div>
        )}

        {/* Formularios por paso o por pestaña */}
        {form.isEditing ? (
          <div className="space-y-6">
            {(form.editTab === 'todo' || form.editTab === 'ruta') && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#00FF85] uppercase tracking-wider block">
                  📍 Ruta y Destinos
                </span>
                <ViajeRutaStep
                  tipoViaje={form.tipoViaje}
                  setTipoViaje={form.setTipoViaje}
                  titulo={form.titulo}
                  setTitulo={form.setTitulo}
                  origen={form.origen}
                  setOrigen={form.setOrigen}
                  destino={form.destino}
                  handleDestinoChange={form.handlers.handleDestinoChange}
                  destinosMultidestino={form.destinosMultidestino}
                  handleAddDestino={form.handlers.handleAddDestino}
                  handleRemoveDestino={form.handlers.handleRemoveDestino}
                  handleUpdateDestinoItem={form.handlers.handleUpdateDestinoItem}
                />
              </div>
            )}

            {(form.editTab === 'todo' || form.editTab === 'fechas') && (
              <div className="space-y-2 pt-2 border-t border-[#1C2436]/50">
                <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider block">
                  📅 Fechas y Descripción
                </span>
                <ViajeFechasStep
                  fechaInicio={form.fechaInicio}
                  setFechaInicio={form.setFechaInicio}
                  fechaFin={form.fechaFin}
                  setFechaFin={form.setFechaFin}
                  duracionDias={form.duracionDias}
                  descripcion={form.descripcion}
                  setDescripcion={form.setDescripcion}
                />
              </div>
            )}

            {(form.editTab === 'todo' || form.editTab === 'presupuesto') && (
              <div className="space-y-2 pt-2 border-t border-[#1C2436]/50">
                <span className="text-xs font-bold text-[#FFE500] uppercase tracking-wider block">
                  💰 Presupuesto y Divisa
                </span>
                <ViajePresupuestoStep
                  monedaLocal={form.monedaLocal}
                  setMonedaLocal={form.setMonedaLocal}
                  presupuestoTotal={form.presupuestoTotal}
                  setPresupuestoTotal={form.setPresupuestoTotal}
                  destino={form.destino}
                  origen={form.origen}
                  tipoViaje={form.tipoViaje}
                  destinosMultidestino={form.destinosMultidestino}
                  fechaInicio={form.fechaInicio}
                  fechaFin={form.fechaFin}
                  duracionDias={form.duracionDias}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            {form.step === 1 && (
              <ViajeRutaStep
                tipoViaje={form.tipoViaje}
                setTipoViaje={form.setTipoViaje}
                titulo={form.titulo}
                setTitulo={form.setTitulo}
                origen={form.origen}
                setOrigen={form.setOrigen}
                destino={form.destino}
                handleDestinoChange={form.handlers.handleDestinoChange}
                destinosMultidestino={form.destinosMultidestino}
                handleAddDestino={form.handlers.handleAddDestino}
                handleRemoveDestino={form.handlers.handleRemoveDestino}
                handleUpdateDestinoItem={form.handlers.handleUpdateDestinoItem}
              />
            )}

            {form.step === 2 && (
              <ViajeFechasStep
                fechaInicio={form.fechaInicio}
                setFechaInicio={form.setFechaInicio}
                fechaFin={form.fechaFin}
                setFechaFin={form.setFechaFin}
                duracionDias={form.duracionDias}
                descripcion={form.descripcion}
                setDescripcion={form.setDescripcion}
              />
            )}

            {form.step === 3 && (
              <ViajePresupuestoStep
                monedaLocal={form.monedaLocal}
                setMonedaLocal={form.setMonedaLocal}
                presupuestoTotal={form.presupuestoTotal}
                setPresupuestoTotal={form.setPresupuestoTotal}
                destino={form.destino}
                origen={form.origen}
                tipoViaje={form.tipoViaje}
                destinosMultidestino={form.destinosMultidestino}
                fechaInicio={form.fechaInicio}
                fechaFin={form.fechaFin}
                duracionDias={form.duracionDias}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default NuevoViajeModal;
