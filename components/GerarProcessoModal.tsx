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
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-100 rounded-2xl shadow-lg w-full max-w-md m-4 animate-in fade-in-90 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-3">
            <CheckCircle size={24} className="text-green-500"/>
            Processo Gerado
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="pt-2 pb-8 px-6 text-center">
          <p className="text-slate-600 text-base mb-4">A grade foi salva e um novo processo foi criado com o número abaixo.</p>
          <div className="bg-slate-200/80 rounded-xl p-4 inline-block shadow-inner">
            <p className="text-blue-600 font-bold text-3xl tracking-wider">{numeroGrade}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end items-center">
          <button
            onClick={onClose}
            className="font-bold text-slate-600 bg-slate-100 py-3 px-6 rounded-xl shadow-md hover:shadow-inner active:scale-95 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerarProcessoModal;
