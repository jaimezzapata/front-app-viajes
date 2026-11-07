import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function SharedViajeDocsTab({ documentos = [] }) {
  if (documentos.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {documentos.map((doc) => (
          <div
            key={doc.id || Math.random()}
            className="p-4 rounded-xl bg-[#0E121B] border border-[#1C2436] space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B55FE6]" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B55FE6]/10 text-[#B55FE6] border border-[#B55FE6]/20">
                {doc.tipo || 'Archivo'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#F1F5F9] m-0 truncate">{doc.titulo}</h4>
            {doc.notas && <p className="text-xs text-[#8492A6] m-0">{doc.notas}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SharedViajeDocsTab;

