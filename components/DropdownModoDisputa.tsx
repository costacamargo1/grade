// components/DropdownModoDisputa.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { LISTA_MODOS } from '../lib/data';
import { resolverModoDisputa } from '../lib/processor';

interface DropdownModoDisputaProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export default function DropdownModoDisputa({ value, onChange, onBlur }: DropdownModoDisputaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (modo: string) => {
    onChange(modo);
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
    <div className="relative w-38 -ml-16" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 print:text-black uppercase mb-1 block">Modo de Disputa</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Use atalhos (N, A, AF)"
          className="w-full py-1 bg-transparent border-b border-slate-200 print:border-black focus:border-blue-500 text-xs font-bold text-slate-700 print:text-black focus:outline-none pr-8 placeholder:font-normal placeholder:text-slate-400 print-border-b"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-600 print:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronsUpDown size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-slate-200 animate-in fade-in-0 zoom-in-95 print:hidden">
          <ul className="py-1">
            {LISTA_MODOS.map((modo) => (
              <li
                key={modo}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                onClick={() => handleSelect(modo)}
              >
                {modo}
                {resolverModoDisputa(value) === modo && <Check size={16} className="text-blue-600" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
