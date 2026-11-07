import React from 'react';
import { Wallet, Tag } from 'lucide-react';
import { formatCurrencyDisplay, CURRENCY_MAP } from '../../../../utils/currencies';

export function SharedViajeGastosTab({ gastos = [] }) {
  if (gastos.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-xl bg-[#0E121B] border border-dashed border-[#1C2436] text-center">
        <Wallet className="w-10 h-10 text-[#8492A6] mx-auto mb-2 opacity-40" />
        <p className="text-sm font-semibold text-[#F1F5F9] m-0">No hay gastos reportados en este viaje</p>
        <p className="text-xs text-[#8492A6] mt-1">Las compras, pagos y reservaciones se mostrarán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {gastos.map((g) => {
        const currMeta = CURRENCY_MAP[(g.monedaOriginal || 'COP').toUpperCase()] || {};
        return (
          <div
            key={g.id || Math.random()}
            className="p-3.5 sm:p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00FF85]/30 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#151B27] border border-[#1C2436] flex items-center justify-center text-[#00FF85] shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{g.concepto}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#8492A6]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#151B27] border border-[#1C2436]">
                    {g.categoria}
                  </span>
                  <span>•</span>
                  <span>{new Date(g.fechaGasto).toLocaleDateString()}</span>
                  <span className="text-[11px] font-semibold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 flex items-center gap-1">
                    <span>{currMeta.flag || '💱'}</span>
                    <span>{g.monedaOriginal}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#1C2436]">
              <p className="text-base font-extrabold text-[#F1F5F9] m-0">
                {formatCurrencyDisplay(g.montoOriginal, g.monedaOriginal, true)}
              </p>
              <p className="text-xs font-semibold text-[#00FF85] m-0 mt-0.5">
                ≈ $ {Math.round(g.montoCOP || 0).toLocaleString()} COP
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SharedViajeGastosTab;

