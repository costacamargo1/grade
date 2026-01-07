// components/GerarProcessoModal.tsx
"use client";

import { X, CheckCircle } from 'lucide-react';

interface GerarProcessoModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroGrade: string;
}

const GerarProcessoModal: React.FC<GerarProcessoModalProps> = ({ isOpen, onClose, numeroGrade }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <CheckCircle size={24} className="text-green-500"/>
            Sucesso!
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-slate-700 text-lg mb-2">Grade salva com sucesso! Novo processo gerado.</p>
          <p className="text-slate-900 font-bold text-2xl">Nº DE GRADE: {numeroGrade}</p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center rounded-b-xl">
          <button
            onClick={onClose}
            className="font-semibold bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerarProcessoModal;
