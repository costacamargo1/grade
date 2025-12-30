// components/Resultados.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Resultado } from '../lib/types';
import { PlusCircle, Trash2, Edit, Save, Search, ChevronDown, ChevronUp, Settings, Award, Frown } from 'lucide-react';
import ConfiguracoesModal from './ConfiguracoesModal';
import { getContrastColor } from '../lib/formatters';

interface CompanyConfig {
  name: string;
  color: string;
}

interface ResultadosProps {
  resultados: Resultado[];
  setResultados: React.Dispatch<React.SetStateAction<Resultado[]>>;
}

type SortConfig = {
  key: keyof Resultado;
  direction: 'ascending' | 'descending';
} | null;

const formatCurrency = (value: number | string) => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(number);
};
  
const formatQuantity = (value: number | string) => {
    const number = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('pt-BR').format(number);
};

const Resultados: React.FC<ResultadosProps> = ({ resultados, setResultados }) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyConfigs, setCompanyConfigs] = useState<CompanyConfig[]>([]);

  useEffect(() => {
    try {
      const storedConfigs = window.localStorage.getItem('companyConfigs');
      if (storedConfigs) {
        setCompanyConfigs(JSON.parse(storedConfigs));
      }
    } catch (error) {
      console.error("Failed to parse company configs from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('companyConfigs', JSON.stringify(companyConfigs));
    } catch (error) {
      console.error("Failed to save company configs to localStorage", error);
    }
  }, [companyConfigs]);

  const handleAddRow = () => {
    const newId = Date.now().toString();
    const newRow: Resultado = {
        id: newId,
        empresa: '',
        produto: '',
        webCotacao: '',
        quantidade: '',
        minimoCotacao: '',
        nossoPreco: '',
        precoConcorrente: '',
        concorrente: '',
        orgao: '',
        pregao: '',
        data: new Date().toISOString().split('T')[0],
        status: 'neutro',
    };
    setResultados([newRow, ...resultados]);
    setEditingRowId(newId);
  };

  const handleInputChange = (id: string, field: keyof Omit<Resultado, 'id'>, value: string | number) => {
    setResultados(resultados.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleStatusChange = (id: string, status: 'ganho' | 'perdido' | 'neutro') => {
    setResultados(resultados.map(row => {
      if (row.id === id) {
        return { ...row, status: row.status === status ? 'neutro' : status };
      }
      return row;
    }));
  };

  const handleDeleteRow = (id: string) => {
    setResultados(resultados.filter(row => row.id !== id));
  };
  
  const filteredResultados = useMemo(() => {
    return resultados.filter(res => {
      const search = searchTerm.toLowerCase();
      return Object.values(res).some(value => 
        String(value).toLowerCase().includes(search)
      );
    });
  }, [resultados, searchTerm]);

  const sortedResultados = useMemo(() => {
    let sortableItems = [...filteredResultados];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
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
  }, [filteredResultados, sortConfig]);

  const requestSort = (key: keyof Resultado) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getRowStyling = (status: Resultado['status']) => {
    switch (status) {
      case 'ganho':
        return 'bg-green-100';
      case 'perdido':
        return 'bg-red-100';
      default:
        return 'hover:bg-slate-50';
    }
  };

  const getCompanyStyle = (companyName: string) => {
    const config = companyConfigs.find(c => c.name.toLowerCase() === companyName.toLowerCase());
    if (!config || !config.name) return {};
    
    return {
      backgroundColor: config.color,
      color: getContrastColor(config.color),
    };
  };

  const renderCell = (row: Resultado, field: keyof Omit<Resultado, 'id' | 'actions' | 'status'>) => {
    const isEditing = editingRowId === row.id;
    const value = row[field];

    if (isEditing) {
      const isNumeric = ['quantidade', 'minimoCotacao', 'nossoPreco', 'precoConcorrente'].includes(field);
      return (
        <input
          type={isNumeric ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(row.id, field, e.target.value)}
          className="w-full px-2 py-1 border rounded-md bg-slate-50"
          step={isNumeric ? "0.0001" : undefined}
        />
      );
    }
    
    let formattedValue: any = value;
    if (field === 'quantidade') formattedValue = formatQuantity(value);
    if (['minimoCotacao', 'nossoPreco', 'precoConcorrente'].includes(field)) formattedValue = formatCurrency(value);
    if (field === 'data' && typeof value === 'string') formattedValue = new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    
    const isPriceBold = (row.status === 'ganho' && field === 'nossoPreco') || (row.status === 'perdido' && field === 'precoConcorrente');
    
    if (field === 'empresa') {
        const style = getCompanyStyle(value as string);
        return <span style={style} className="w-full block font-bold px-2 py-1 rounded-sm">{formattedValue}</span>;
    }

    return <span className={`w-full block px-2 py-1 ${isPriceBold ? 'font-bold' : ''}`}>{formattedValue}</span>;
  };

  const tableHeaders: { key: keyof Resultado | 'actions', label: string }[] = [
    { key: "status", label: "Status" },
    { key: "empresa", label: "EMPRESA" },
    { key: "produto", label: "PRODUTO" },
    { key: "webCotacao", label: "WEB/COTAÇÃO" },
    { key: "quantidade", label: "QTD." },
    { key: "minimoCotacao", label: "MÍNIMO/COTAÇÃO (R$)" },
    { key: "nossoPreco", label: "NOSSO PREÇO (R$)" },
    { key: "precoConcorrente", label: "PREÇO CONCORRENTE (R$)" },
    { key: "concorrente", label: "CONCORRENTE" },
    { key: "orgao", label: "ÓRGÃO" },
    { key: "pregao", label: "PREGÃO" },
    { key: "data", label: "DATA" },
    { key: "actions", label: "AÇÕES" },
  ];
  const fieldMapping: (keyof Omit<Resultado, 'id' | 'actions' | 'status'>)[] = tableHeaders.map(h => h.key).filter(k => !['actions', 'status'].includes(k as string)) as any;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full h-full flex flex-col">
      <ConfiguracoesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} companyConfigs={companyConfigs} setCompanyConfigs={setCompanyConfigs} />
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Resultados</h2>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar em tudo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg"
            >
                <Settings size={18} />
                Configurações
            </button>
            <button
            onClick={handleAddRow}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg"
            >
            <PlusCircle size={18} />
            Adicionar
            </button>
        </div>
      </div>
      <div className="overflow-auto flex-grow">
        <table className="w-full bg-white border-2 border-slate-200 rounded-lg">
          <thead className="bg-slate-800 text-white select-none sticky top-0 z-10">
            <tr>
              {tableHeaders.map(({ key, label }) => (
                <th 
                  key={key} 
                  className="px-4 py-3 text-sm font-semibold uppercase text-left whitespace-nowrap"
                  onClick={() => key !== 'actions' && requestSort(key as keyof Resultado)}
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    {label}
                    {key !== 'actions' && sortConfig?.key === key && (
                      sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {sortedResultados.map((row) => (
              <tr key={row.id} className={`border-b border-slate-200 transition-colors ${getRowStyling(row.status)}`}>
                <td className="px-1 py-1 text-sm">
                  <div className="flex items-center gap-1">
                      <button onClick={() => handleStatusChange(row.id, 'ganho')} className={`p-2 rounded-full ${row.status === 'ganho' ? 'bg-green-500 text-white' : 'text-green-500 hover:bg-green-200'}`}>
                          <Award size={18} />
                      </button>
                      <button onClick={() => handleStatusChange(row.id, 'perdido')} className={`p-2 rounded-full ${row.status === 'perdido' ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-200'}`}>
                          <Frown size={18} />
                      </button>
                  </div>
                </td>
                {fieldMapping.map(field => <td key={field} className="px-1 py-1 text-sm truncate">{renderCell(row, field)}</td>)}
                <td className="px-1 py-1 text-sm">
                  <div className="flex items-center gap-2">
                    {editingRowId === row.id ? (
                      <button onClick={() => setEditingRowId(null)} className="p-2 text-green-600 hover:text-green-800 transition-colors">
                        <Save size={18} />
                      </button>
                    ) : (
                      <button onClick={() => setEditingRowId(row.id)} className="p-2 text-blue-600 hover:text-blue-800 transition-colors">
                        <Edit size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteRow(row.id)} className="p-2 text-red-600 hover:text-red-800 transition-colors">
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

export default Resultados;