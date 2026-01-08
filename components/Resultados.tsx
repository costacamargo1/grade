"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Resultado, CompanyConfig } from '../lib/types';
import { PlusCircle, Trash2, Edit, Save, Search, ChevronDown, ChevronUp, Settings, Trophy, FileDown, FileUp, X, Calendar, TextSearch } from 'lucide-react';
import ConfiguracoesModal from './ConfiguracoesModal';
import { getContrastColor } from '../lib/formatters';
import { exportResultadosToExcel } from '../lib/exportService';
import { importResultadosFromExcel } from '../lib/importService';

interface ResultadosProps {
  resultados: Resultado[];
  setResultados: React.Dispatch<React.SetStateAction<Resultado[]>>;
}

type SortConfig = {
  key: keyof Resultado;
  direction: 'ascending' | 'descending';
} | null;

const formatCurrency = (value: number | string) => {
    if (value === null || value === undefined || value === '') return '';
    const sanitizedValue = typeof value === 'string' ? value.replace(',', '.') : value;
    const number = typeof sanitizedValue === 'string' ? parseFloat(sanitizedValue) : sanitizedValue;
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(number);
};
  
const formatQuantity = (value: number | string) => {
    if (value === null || value === undefined || value === '') return '';
    const sanitizedValue = typeof value === 'string' ? value.replace(',', '.') : value;
    const number = typeof sanitizedValue === 'string' ? parseInt(sanitizedValue, 10) : sanitizedValue;
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('pt-BR').format(number);
};

const Resultados: React.FC<ResultadosProps> = ({ resultados, setResultados }) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyConfigs, setCompanyConfigs] = useState<CompanyConfig[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [viewMode, setViewMode] = useState<'normal' | 'compacto' | 'supercompacto'>('compacto');

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

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
        marca: '',
        orgao: '',
        uf: '',
        pregao: '',
        data: new Date().toISOString().split('T')[0],
        observacoes: '',
        status: 'neutro',
    };
    setResultados([newRow, ...resultados]);
    setEditingRowId(newId);
  };

  const handleInputChange = (id: string, field: keyof Omit<Resultado, 'id'>, value: string | number) => {
    let processedValue: string | number = value;
    if (field === 'nossoPreco' || field === 'precoConcorrente' || field === 'quantidade' || field === 'minimoCotacao') {
        if (value === '') {
            processedValue = '';
        } else {
            const sanitizedValue = typeof value === 'string' ? value.replace(',', '.') : String(value);
            const parsed = parseFloat(sanitizedValue);
            processedValue = isNaN(parsed) ? '' : parsed;
        }
    } else if (typeof value === 'string') {
      processedValue = value.toUpperCase();
    }
    setResultados(resultados.map(row => row.id === id ? { ...row, [field]: processedValue } : row));
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedResultados = await importResultadosFromExcel(file);
        setResultados(prevResultados => [...importedResultados, ...prevResultados]);
      } catch (error) {
        console.error("Failed to import data from Excel file", error);
      }
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };
  
  const filteredResultados = useMemo(() => {
    return resultados.filter(res => {
      const search = searchTerm.toUpperCase();
      const isSearchMatch = search === '' || Object.values(res).some(value => 
        String(value).toUpperCase().includes(search)
      );
      
      const isDateMatch = !dateFilter || (res.data && res.data.startsWith(dateFilter));

      return isSearchMatch && isDateMatch;
    });
  }, [resultados, searchTerm, dateFilter]);

  const sortedResultados = useMemo(() => {
    let sortableItems = [...filteredResultados];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let aVal: any = a[key];
        let bVal: any = b[key];
        
        const numericKeys: (keyof Resultado)[] = ['quantidade', 'minimoCotacao', 'nossoPreco', 'precoConcorrente'];

        if (key === 'data') {
            aVal = aVal ? new Date(aVal) : null;
            bVal = bVal ? new Date(bVal) : null;
        } else if (numericKeys.includes(key)) {
            aVal = aVal === '' || aVal === null || aVal === undefined ? -Infinity : parseFloat(String(aVal).replace(',', '.'));
            bVal = bVal === '' || bVal === null || bVal === undefined ? -Infinity : parseFloat(String(bVal).replace(',', '.'));
        }

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined || (typeof aVal === 'number' && isNaN(aVal))) return 1;
        if (bVal === null || bVal === undefined || (typeof bVal === 'number' && isNaN(bVal))) return -1;
        
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

  const paginatedResultados = useMemo(() => {
    if (rowsPerPage === 0) {
      return sortedResultados;
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedResultados.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedResultados, currentPage, rowsPerPage]);

  const requestSort = (key: keyof Resultado) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  // Apply softer, pastel row backgrounds reminiscent of iOS lists.
  const getRowStyling = (status: Resultado['status']) => {
    switch (status) {
      case 'ganho':
        // light green tint similar to iOS success color
        return 'bg-green-100';
      case 'perdido':
        // light red tint similar to iOS error color
        return 'bg-red-100';
      default:
        // neutral rows get a very subtle hover to mirror iOS list behaviour
        return 'hover:bg-gray-100';
    }
  };

  const getCompanyStyle = (companyName: string) => {
    const config = companyConfigs.find(c => c.name.toUpperCase() === companyName.toUpperCase());
    if (!config || !config.name) return {};
    
    return {
      backgroundColor: config.color,
      color: config.fontColor || getContrastColor(config.color),
    };
  };

  const renderCell = (row: Resultado, field: keyof Omit<Resultado, 'id' | 'actions' | 'status'>) => {
    const isEditing = editingRowId === row.id;
    const value = row[field];
    const cellClass = viewMode === 'supercompacto' ? 'text-[10px]' : viewMode === 'compacto' ? 'text-xs' : 'text-sm';

    if (isEditing) {
      const isNumeric = ['quantidade', 'minimoCotacao', 'nossoPreco', 'precoConcorrente'].includes(field);
      return (
        <input
          type={isNumeric ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => handleInputChange(row.id, field, e.target.value)}
          // Inputs mimic iOS form fields: soft background, no border, rounded corners and no forced uppercase
          className={`w-full px-3 py-2 bg-gray-100 rounded-lg ${cellClass}`}
          step={isNumeric ? "0.0001" : undefined}
        />
      );
    }
    
    let formattedValue: any = value;
    if (field === 'quantidade') formattedValue = formatQuantity(value ?? '');
    if (['minimoCotacao', 'nossoPreco', 'precoConcorrente'].includes(field)) formattedValue = formatCurrency(value ?? '');
    if (field === 'data' && typeof value === 'string') formattedValue = new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    
    const isPriceBold = (row.status === 'ganho' && field === 'nossoPreco') || (row.status === 'perdido' && field === 'precoConcorrente');
    const isWinningOurPrice = row.status === 'ganho' && field === 'nossoPreco';
    
    if (field === 'empresa') {
        const style = getCompanyStyle(String(value ?? ''));
        return <span style={style} className={`w-full block font-medium px-3 py-2 rounded-md ${cellClass}`}>{String(formattedValue ?? '')}</span>;
    }

    return <span className={`text-center w-full block px-3 py-2 ${cellClass} ${isPriceBold ? 'font-semibold' : ''}  ${ isWinningOurPrice ? 'bg-green-200 text-green-900 rounded-md' : '' } ${row.status === 'perdido' && field === 'precoConcorrente' ? 'text-red-600' : 'text-gray-800'}`}>{formattedValue}</span>;
  };

  const tableHeaders: { key: keyof Resultado | 'actions', label: string | React.ReactNode }[] = [
    { key: "status", label: "Status" },
    { key: "empresa", label: "EMPRESA" },
    { key: "produto", label: "PRODUTO" },
    { key: "webCotacao", label: <div>WEB OU<br/>COTAÇÃO</div> },
    { key: "quantidade", label: "QTD." },
    { key: "minimoCotacao", label: <div>MÍNIMO OU<br/>COTAÇÃO (R$)</div> },
    { key: "nossoPreco", label: <div>NOSSO PREÇO<br/>(R$)</div> },
    { key: "precoConcorrente", label: <div>PREÇO<br/>CONCORRENTE (R$)</div> },
    { key: "concorrente", label: "CONCORRENTE" },
    { key: "marca", label: "MARCA" },
    { key: "orgao", label: "ÓRGÃO" },
    { key: "uf", label: "UF" },
    { key: "pregao", label: "PREGÃO" },
    { key: "data", label: "DATA" },
    { key: "observacoes", label: "OBSERVAÇÕES" },
    { key: "actions", label: "AÇÕES" },
  ];
  const fieldMapping: (keyof Omit<Resultado, 'id' | 'actions' | 'status'>)[] = tableHeaders.map(h => h.key).filter(k => !['actions', 'status'].includes(k as string)) as any;

  const totalPages = useMemo(() => {
    if (rowsPerPage === 0) return 1;
    return Math.ceil(sortedResultados.length / rowsPerPage);
  }, [sortedResultados, rowsPerPage]);

  const cellPadding = viewMode === 'supercompacto' ? 'px-0.5 py-0.5' : viewMode === 'compacto' ? 'px-1 py-1' : 'px-2 py-2';
  const headerPadding = viewMode === 'supercompacto' ? 'px-1 py-1 text-[10px]' : viewMode === 'compacto' ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm';

  return (
    // Root container uses a soft gray background, larger padding and rounded corners to mimic iOS card styling.
    <div className="bg-gray-100 p-6 rounded-3xl shadow-md w-full h-full flex flex-col resize overflow-auto">
      <ConfiguracoesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} companyConfigs={companyConfigs} setCompanyConfigs={setCompanyConfigs} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx, .xls"
      />
      <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-4 gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-800">Painel de Resultados</h1>
                  <span className="text-sm text-gray-500 mt-1">
                    {resultados.length} resultados inseridos
                  </span>
                </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search box styled like iOS search field with rounded pill and subtle background */}
          <div className="relative w-full sm:w-auto">
            <TextSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Buscar em tudo..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-64 pl-11 pr-4 py-3 rounded-full bg-gray-200 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Date picker styled similarly */}
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-auto pl-11 pr-4 py-3 rounded-full bg-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={handleImportClick}
                className="group flex items-center gap-2 rounded-full py-2 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                <FileUp size={18} />
                Importar
            </button>
            <button
                onClick={() => exportResultadosToExcel(sortedResultados)}
                className="group flex items-center gap-2 rounded-full py-2 px-4 text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
            >
                <FileDown size={18} />
                Exportar
            </button>
            <button
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center gap-2 rounded-full py-2 px-4 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                <Settings size={18} />
                Configurações
            </button>
            <button
            onClick={handleAddRow}
            className="group flex items-center gap-2 rounded-full py-2 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
            <PlusCircle size={18} />
            Adicionar
            </button>
        </div>
      </div>
      <div className="overflow-auto grow">
        <table className="w-full bg-white border-2 border-slate-200 rounded-lg">
          {/* Table header styled with a light grey background and dark text to match iOS lists */}
          <thead className="bg-gray-200 text-gray-700 select-none sticky top-0 z-10">
            <tr>
              {tableHeaders.map(({ key, label }) => (
                <th 
                  key={key as string}
                  className={`${headerPadding} font-medium text-center whitespace-nowrap`}
                  onClick={() => key !== 'actions' && requestSort(key as keyof Resultado)}
                >
                  <div className="flex items-center justify-center gap-2 cursor-pointer">
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
            {paginatedResultados.map((row) => (
              <tr key={row.id} className={`border-b border-slate-200 transition-colors ${getRowStyling(row.status)}`}>
                <td className={cellPadding}>
                  <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleStatusChange(row.id, 'ganho')} 
                        className={`p-2 rounded-full transition-colors ${row.status === 'ganho' ? 'bg-green-500 text-white' : 'bg-gray-200 text-green-600 hover:bg-green-100'}`}
                      >
                          <Trophy size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(row.id, 'perdido')} 
                        className={`p-2 rounded-full transition-colors ${row.status === 'perdido' ? 'bg-red-500 text-white' : 'bg-gray-200 text-red-600 hover:bg-red-100'}`}
                      >
                          <X size={18} />
                      </button>
                  </div>
                </td>
                {fieldMapping.map(field => <td key={field} className={`${cellPadding} truncate`}>{renderCell(row, field)}</td>)}
                <td className={cellPadding}>
                  <div className="flex items-center justify-center gap-2">
                    {editingRowId === row.id ? (
                      <button onClick={() => setEditingRowId(null)} className="p-2 rounded-full bg-gray-200 text-green-600 hover:bg-gray-300 transition-colors">
                        <Save size={18} />
                      </button>
                    ) : (
                      <button onClick={() => setEditingRowId(row.id)} className="p-2 rounded-full bg-gray-200 text-blue-600 hover:bg-gray-300 transition-colors">
                        <Edit size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteRow(row.id)} className="p-2 rounded-full bg-gray-200 text-red-600 hover:bg-gray-300 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center p-4 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode(v => v === 'normal' ? 'compacto' : v === 'compacto' ? 'supercompacto' : 'normal')} 
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {viewMode === 'normal' ? 'Visão Compacta' : viewMode === 'compacto' ? 'Visão Super Compacta' : 'Visão Normal'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="font-medium text-gray-700">Linhas por página:</label>
            <select
              id="itemsPerPage"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={0}>Todos</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Página {currentPage} de {totalPages > 0 ? totalPages : 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Resultados;