import React from 'react';
import { Check } from 'lucide-react';

export function ViajeStepperNav({ step, setStep }) {
  return (
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

      <div className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${step > 1 ? 'bg-[#00FF85]/60' : 'bg-[#1C2436]'}`} />

      {/* Paso 2: Fechas */}
      <button
        type="button"
        onClick={() => setStep(2)}
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
            Fechas de Viaje
          </span>
        </div>
      </button>

      <div className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${step > 2 ? 'bg-[#00FF85]/60' : 'bg-[#1C2436]'}`} />

      {/* Paso 3: Presupuesto */}
      <button
        type="button"
        onClick={() => setStep(3)}
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
  );
}

export default ViajeStepperNav;

