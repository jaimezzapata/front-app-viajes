import React from 'react';
import { Filter, X } from 'lucide-react';

export function BalanceSemaforoCard({
  balance,
  displayBalance,
  hasActiveFilters,
  selectedCategoria = 'todos',
  onSelectCategoria
}) {
  // Cuando hay una categoría seleccionada, usamos las categorías completas de `balance`
  // para que el usuario siga viendo todas las barras y pueda cambiar o quitar el filtro con un clic.
  const categoriasList =
    selectedCategoria !== 'todos' && balance?.semaforoCategorias
      ? balance.semaforoCategorias
      : displayBalance?.semaforoCategorias || [];

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-[#1C2436] mb-6 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider m-0 flex items-center gap-2">
            <span>Semáforo de Presupuesto por Categoría</span>
          </h3>
          <span className="text-[10px] text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 flex items-center gap-1">
            <Filter className="w-2.5 h-2.5" />
            Haz clic en una categoría para filtrar gastos
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] text-[#FFE500] font-semibold bg-[#FFE500]/10 px-2 py-0.5 rounded border border-[#FFE500]/20">
              Calculado sobre selección
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedCategoria !== 'todos' && onSelectCategoria && (
            <button
              type="button"
              onClick={() => onSelectCategoria('todos')}
              className="text-[11px] font-bold text-[#FF2E55] bg-[#FF2E55]/10 hover:bg-[#FF2E55]/20 border border-[#FF2E55]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 uppercase tracking-wider"
            >
              <X className="w-3 h-3" />
              <span>Ver todas ({selectedCategoria})</span>
            </button>
          )}
          <span className="text-xs text-[#8492A6]">
            Consumido: <strong className="text-[#F1F5F9]">{displayBalance?.porcentajeConsumido || 0}%</strong>
          </span>
        </div>
      </div>

      {categoriasList.length > 0 ? (
        <div className="space-y-2.5">
          {categoriasList.map((cat) => {
            const isSelected = selectedCategoria?.toLowerCase() === cat.categoria?.toLowerCase();
            const isDimmed = selectedCategoria !== 'todos' && !isSelected;
            const barColor =
              cat.color === 'rojo'
                ? 'bg-[#FF2E55]'
                : cat.color === 'amarillo'
                ? 'bg-[#FFE500]'
                : 'bg-[#00FF85]';

            return (
              <button
                key={cat.categoria}
                type="button"
                onClick={() => onSelectCategoria && onSelectCategoria(cat.categoria)}
                title={
                  isSelected
                    ? `Quitar filtro de ${cat.categoria}`
                    : `Filtrar gastos de la categoría ${cat.categoria}`
                }
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5 block ${
                  isSelected
                    ? 'bg-[#151B27] border-[#00E5FF] ring-1 ring-[#00E5FF]/40 shadow-sm'
                    : isDimmed
                    ? 'bg-[#0A0D14]/60 border-[#1C2436]/60 opacity-55 hover:opacity-90 hover:border-[#1C2436]'
                    : 'bg-[#111622]/60 border-[#1C2436]/70 hover:bg-[#151B27] hover:border-[#00E5FF]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#00E5FF]' : 'text-[#F1F5F9]'
                      }`}
                    >
                      {cat.categoria}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                        Filtro activo • Clic para quitar
                      </span>
                    )}
                  </div>
                  <span className="text-[#8492A6]">
                    <strong className="text-[#F1F5F9]">$ {Math.round(cat.consumidoCOP).toLocaleString()}</strong>
                    {cat.limiteCOP > 0 && ` / $ ${Math.round(cat.limiteCOP).toLocaleString()}`}
                    <span
                      className={`ml-2 font-bold ${
                        cat.color === 'rojo'
                          ? 'text-[#FF2E55]'
                          : cat.color === 'amarillo'
                          ? 'text-[#FFE500]'
                          : 'text-[#00FF85]'
                      }`}
                    >
                      ({cat.porcentaje}%)
                    </span>
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[#151B27] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(cat.porcentaje || 0, 100)}%` }}
                  />
                </div>
              </button>
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

