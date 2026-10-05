import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-full sm:${maxWidth} bg-[#0E121B] border-0 sm:border border-[#1C2436] rounded-none sm:rounded-2xl shadow-2xl flex flex-col min-w-0 h-full sm:h-auto max-h-full sm:max-h-[88vh] overflow-hidden animate-in fade-in duration-200`}
      >
        {/* Header del modal con safe-area top en mobile */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1C2436] shrink-0 bg-[#0A0D14] pt-[calc(0.875rem+env(safe-area-inset-top,0px))] sm:pt-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#00FF85] shrink-0 sm:hidden" />
            <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0 tracking-tight truncate pr-2">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-1.5 rounded-lg text-[#8492A6] hover:text-[#F1F5F9] hover:bg-[#151B27] transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Contenido scrolleable fluido con touch-action optimizado */}
        <div
          className="p-4 sm:p-5 overflow-y-auto overflow-x-hidden min-w-0 flex-1 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {children}
        </div>

        {/* Footer fijo (botones de acción siempre a la vista en mobile y desktop) */}
        {footer && (
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-[#1C2436] bg-[#0A0D14] shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
