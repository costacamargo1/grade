// components/DropdownEmpresa.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

// Placeholder list of companies
const LISTA_EMPRESAS = ["UNIQUE", "COSTA", "NSA"];

interface DropdownEmpresaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export default function DropdownEmpresa({ value, onChange, onBlur }: DropdownEmpresaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (empresa: string) => {
    onChange(empresa);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
            onBlur(); // Trigger the blur logic when closing
            setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur]);

  return (
    <div className="relative w-full max-w-[200px]" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Empresa</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Selecione a empresa"
          className="w-full py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-700 focus:outline-none pr-8 placeholder:font-normal placeholder:text-slate-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronsUpDown size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white shadow-lg rounded-md border border-slate-200 animate-in fade-in-0 zoom-in-95">
          <ul className="py-1">
            {LISTA_EMPRESAS.map((empresa) => (
              <li
                key={empresa}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                onClick={() => handleSelect(empresa)}
              >
                {empresa}
                {value === empresa && <Check size={16} className="text-blue-600" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
