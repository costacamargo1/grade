"use client";

import { useState, useMemo } from 'react';
import { Processo, HeaderData, ItemGrade } from '../lib/types';
import { Edit, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';

type Tab = 'grade' | 'orgaos' | 'resultados' | 'processos';

interface ProcessosProps {
  processos: Processo[];
  setProcessos: React.Dispatch<React.SetStateAction<Processo[]>>;
  setHeaderData: (data: HeaderData) => void;
  setItens: (itens: ItemGrade[]) => void;
  setActiveTab: (tab: Tab) => void;
}

const getUfFromOrgao = (orgao: string): string => {
    if (!orgao) return '';
    const parts = orgao.split('/');
    if (parts.length > 1) {
        const uf = parts[parts.length - 1].trim();
        if (uf.length === 2 && uf === uf.toUpperCase()) {
            return uf;
        }
    }
    return '';
};

const getOrgaoName = (orgao: string): string => {
    if (!orgao) return '';
    const parts = orgao.split('/');
    if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].trim();
        if (lastPart.length === 2 && lastPart.toUpperCase() === lastPart) {
            return parts.slice(0, -1).join('/').trim();
        }
    }
    return orgao;
};

type SortConfig = {
  key: keyof HeaderData | 'uf';
  direction: 'ascending' | 'descending';
} | null;

const Processos: React.FC<ProcessosProps> = ({ processos, setProcessos, setHeaderData, setItens, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      setProcessos(processos.filter(p => p.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    const processo = processos.find(p => p.id === id);
    if (processo) {
      setHeaderData(processo.headerData);
      setItens(processo.itens);
      setActiveTab('grade');
    }
  };

  const filteredProcessos = useMemo(() => {
    return processos.filter(processo => {
      const search = searchTerm.toLowerCase();
      return (
        processo.headerData.numeroGrade.toLowerCase().includes(search) ||
        processo.headerData.edital.toLowerCase().includes(search) ||
        processo.headerData.orgao.toLowerCase().includes(search) ||
        processo.headerData.empresa.toLowerCase().includes(search)
      );
    });
  }, [processos, searchTerm]);

  const sortedProcessos = useMemo(() => {
    let sortableItems = [...filteredProcessos];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let aVal, bVal;

        if (key === 'uf') {
            aVal = getUfFromOrgao(a.headerData.orgao);
            bVal = getUfFromOrgao(b.headerData.orgao);
        } else {
            aVal = a.headerData[key as keyof HeaderData];
            bVal = b.headerData[key as keyof HeaderData];
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProcessos, sortConfig]);

  const requestSort = (key: keyof HeaderData | 'uf') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const headers = [
    { key: 'numeroGrade', label: 'Nº GRADE' },
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'edital', label: 'EDITAL' },
    { key: 'orgao', label: 'ÓRGÃO' },
    { key: 'uf', label: 'UF' },
    { key: 'dataAbertura', label: 'DATA DE ABERTURA' },
    { key: 'dataEdicao', label: 'DATA DE EDIÇÃO' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Processos Salvos</h2>
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por Nº Grade, Edital, Órgão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-black"
          />
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full bg-white border-2 border-slate-200 rounded-lg">
          <thead className="bg-slate-800 text-white select-none">
            <tr>
              {headers.map(({ key, label }) => (
                <th 
                  key={key}
                  className="px-4 py-3 text-sm font-semibold uppercase text-left"
                  onClick={() => requestSort(key as keyof HeaderData | 'uf')}
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    {label}
                    {sortConfig?.key === key && (
                      sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-sm font-semibold uppercase text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {sortedProcessos.map((processo) => (
              <tr key={processo.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-2 text-sm">{processo.headerData.numeroGrade}</td>
                <td className="px-4 py-2 text-sm">{processo.headerData.empresa}</td>
                <td className="px-4 py-2 text-sm">{processo.headerData.edital}</td>
                <td className="px-4 py-2 text-sm">{getOrgaoName(processo.headerData.orgao)}</td>
                <td className="px-4 py-2 text-sm">{getUfFromOrgao(processo.headerData.orgao)}</td>
                <td className="px-4 py-2 text-sm">{processo.headerData.dataAbertura}</td>
                <td className="px-4 py-2 text-sm">{processo.headerData.dataEdicao}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(processo.id)} className="p-2 text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(processo.id)} className="p-2 text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Processos;
