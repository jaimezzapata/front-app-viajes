import React from 'react';

export function BalanceSemaforoCard({ displayBalance, hasActiveFilters }) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider m-0 flex items-center gap-2">
          <span>Semáforo de Presupuesto por Categoría</span>
          {hasActiveFilters && (
            <span className="text-[10px] text-[#FFE500] font-semibold bg-[#FFE500]/10 px-2 py-0.5 rounded border border-[#FFE500]/20">
              Calculado sobre selección
            </span>
          )}
        </h3>
        <span className="text-xs text-[#8492A6]">
          Consumido: <strong className="text-[#F1F5F9]">{displayBalance?.porcentajeConsumido || 0}%</strong>
        </span>
      </div>

      {displayBalance?.semaforoCategorias && displayBalance.semaforoCategorias.length > 0 ? (
        <div className="space-y-4">
          {displayBalance.semaforoCategorias.map((cat) => {
            const barColor = cat.color === 'rojo' ? 'bg-[#FF2E55]' : (cat.color === 'amarillo' ? 'bg-[#FFE500]' : 'bg-[#00FF85]');

            return (
              <div key={cat.categoria} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#F1F5F9]">{cat.categoria}</span>
                  <span className="text-[#8492A6]">
                    <strong className="text-[#F1F5F9]">$ {Math.round(cat.consumidoCOP).toLocaleString()}</strong>
                    {cat.limiteCOP > 0 && ` / $ ${Math.round(cat.limiteCOP).toLocaleString()}`}
                    <span className={`ml-2 font-bold ${
                      cat.color === 'rojo' ? 'text-[#FF2E55]' : (cat.color === 'amarillo' ? 'text-[#FFE500]' : 'text-[#00FF85]')
                    }`}>
                      ({cat.porcentaje}%)
                    </span>
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#151B27] overflow-hidden">
                  <div
                    className={`h-full ${barColor}`}
                    style={{ width: `${Math.min(cat.porcentaje || 0, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[#8492A6] m-0">No hay categorías configuradas aún.</p>
      )}
    </div>
  );
}

export default BalanceSemaforoCard;

