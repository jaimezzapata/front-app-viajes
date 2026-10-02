import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-[2px]">
      <div
        className={`w-full ${maxWidth} bg-[#0E121B] border border-[#1C2436] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in duration-200`}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2436] shrink-0">
          <h3 className="text-base font-bold text-[#F1F5F9] m-0 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8492A6] hover:text-[#F1F5F9] hover:bg-[#151B27] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
