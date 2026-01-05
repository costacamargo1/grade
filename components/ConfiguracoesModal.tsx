// components/ConfiguracoesModal.tsx
"use client";

import { X, Trash2, Palette, Type } from 'lucide-react';
import { CompanyConfig } from '../lib/types';

interface ConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyConfigs: CompanyConfig[];
  setCompanyConfigs: React.Dispatch<React.SetStateAction<CompanyConfig[]>>;
}

const ConfiguracoesModal: React.FC<ConfiguracoesModalProps> = ({ isOpen, onClose, companyConfigs, setCompanyConfigs }) => {
  if (!isOpen) return null;

  const handleAddCompany = () => {
    setCompanyConfigs([...companyConfigs, { name: '', color: '#e0e0e0', fontColor: '#000000' }]);
  };

  const handleCompanyChange = (index: number, field: keyof CompanyConfig, value: string) => {
    const newConfigs = [...companyConfigs];
    const config = newConfigs[index];
    (config[field] as any) = value;
    setCompanyConfigs(newConfigs);
  };

  const handleRemoveCompany = (index: number) => {
    setCompanyConfigs(companyConfigs.filter((_, i) => i !== index));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <Palette size={24} className="text-blue-500"/>
            Cores por Empresa
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {companyConfigs.map((config, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 p-2 border rounded-lg hover:border-blue-400 transition-all">
              <input
                type="text"
                placeholder="Nome da Empresa"
                value={config.name}
                onChange={(e) => handleCompanyChange(index, 'name', e.target.value)}
                className="grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition uppercase text-black"
              />
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-700">Fundo</span>
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => handleCompanyChange(index, 'color', e.target.value)}
                  className="w-10 h-10 p-0 border-none rounded-md cursor-pointer"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-700">Fonte</span>
                 <input
                  type="color"
                  value={config.fontColor}
                  onChange={(e) => handleCompanyChange(index, 'fontColor', e.target.value)}
                  className="w-10 h-10 p-0 border-none rounded-md cursor-pointer"
                />
              </div>
              <button onClick={() => handleRemoveCompany(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
           {companyConfigs.length === 0 && (
            <div className="text-center py-8 text-slate-700">
              <p>Nenhuma empresa configurada.</p>
              <p className="text-sm">Clique em "Adicionar Empresa" para começar.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-xl">
           <button
            onClick={handleAddCompany}
            className="font-semibold bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Adicionar Empresa
          </button>
          <button
            onClick={onClose}
            className="font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesModal;
