import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const MAX_WIDTHS = {
  'max-w-sm': 'sm:max-w-sm',
  'max-w-md': 'sm:max-w-md',
  'max-w-lg': 'sm:max-w-lg',
  'max-w-xl': 'sm:max-w-xl',
  'max-w-2xl': 'sm:max-w-2xl',
  'max-w-3xl': 'sm:max-w-3xl',
  'max-w-4xl': 'sm:max-w-4xl',
  'max-w-5xl': 'sm:max-w-5xl',
  'max-w-6xl': 'sm:max-w-6xl',
};

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

  const resolvedMaxWidthClass = MAX_WIDTHS[maxWidth] || 'sm:max-w-md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto overflow-x-hidden w-full max-w-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-[calc(100vw-1rem)] ${resolvedMaxWidthClass} mx-auto my-auto bg-[#0E121B] border border-[#1C2436] rounded-2xl shadow-2xl flex flex-col min-w-0 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] md:max-h-[88vh] overflow-hidden animate-in fade-in duration-200`}
        style={{ boxSizing: 'border-box' }}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 border-b border-[#1C2436] shrink-0 bg-[#0A0D14] min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF85] shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] m-0 tracking-tight truncate">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8492A6] hover:text-[#F1F5F9] hover:bg-[#151B27] transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Contenido scrolleable fluido con touch-action optimizado */}
        <div
          className="p-3.5 sm:p-5 overflow-y-auto overflow-x-hidden min-w-0 flex-1 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {children}
        </div>

        {/* Footer fijo (botones de acción siempre a la vista en mobile y desktop) */}
        {footer && (
          <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 border-t border-[#1C2436] bg-[#0A0D14] shrink-0 min-w-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
