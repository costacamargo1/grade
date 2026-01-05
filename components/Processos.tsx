"use client";

import { useState, useMemo } from 'react';
import { Processo, HeaderData, ItemGrade, AgendaRow } from '../lib/types';
import { Edit, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { exportAgendaToExcel } from '../lib/exportService';

type Tab = 'grade' | 'orgaos' | 'resultados' | 'processos' | 'produtos';
type SortKey = keyof HeaderData | 'uf' | 'horaAbertura';
type SortConfig = { key: SortKey; direction: 'ascending' | 'descending' } | null;

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

const parseDateString = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4}).*(\d{2}):(\d{2})/);
    if (parts) {
        const [, day, month, year, hour, minute] = parts;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
    }
    const dateParts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if(dateParts) {
        const [, day, month, year] = dateParts;
        return new Date(`${year}-${month}-${day}`);
    }
    return null;
}

const getTimeFromDataAbertura = (dataAbertura: string): string => {
    if (!dataAbertura) return '';
    const match = dataAbertura.match(/(\d{2}):(\d{2})/);
    if (!match) return '';
    return `${match[1]}:${match[2]}`;
};

const getTimeMinutes = (dataAbertura: string): number | null => {
    const match = dataAbertura.match(/(\d{2}):(\d{2})/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
};

const getDatePartFromDataAbertura = (dataAbertura: string): Date | null => {
    if (!dataAbertura) return null;
    const match = dataAbertura.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

const getNextBusinessDay = (baseDate = new Date()): Date => {
    const next = new Date(baseDate);
    next.setDate(next.getDate() + 1);
    while (isWeekend(next)) {
        next.setDate(next.getDate() + 1);
    }
    return next;
};

const toInputDateValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseInputDateValue = (value: string): Date | null => {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
};

const formatDatePt = (date: Date): string => (
    date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
);

const escapeHtml = (value: string): string => (
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
);

const Processos: React.FC<ProcessosProps> = ({ processos, setProcessos, setHeaderData, setItens, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [agendaStart, setAgendaStart] = useState('');
  const [agendaEnd, setAgendaEnd] = useState('');

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
        } else if (key === 'dataAbertura' || key === 'dataEdicao') {
            aVal = parseDateString(a.headerData[key] || '');
            bVal = parseDateString(b.headerData[key] || '');
        } else if (key === 'horaAbertura') {
            aVal = getTimeMinutes(a.headerData.dataAbertura || '');
            bVal = getTimeMinutes(b.headerData.dataAbertura || '');
        } else if (key === 'numeroGrade') {
            aVal = parseInt(a.headerData.numeroGrade, 10) || 0;
            bVal = parseInt(b.headerData.numeroGrade, 10) || 0;
        } else {
            aVal = a.headerData[key as keyof HeaderData];
            bVal = b.headerData[key as keyof HeaderData];
        }

        if (aVal === null || aVal === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bVal === null || bVal === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;

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

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const openAgendaModal = () => {
    const nextBusinessDay = getNextBusinessDay();
    const defaultValue = toInputDateValue(nextBusinessDay);
    setAgendaStart(defaultValue);
    setAgendaEnd(defaultValue);
    setAgendaModalOpen(true);
  };

  const agendaPeriodLabel = useMemo(() => {
    const start = parseInputDateValue(agendaStart);
    const end = parseInputDateValue(agendaEnd);
    if (!start || !end) return '';
    const startLabel = formatDatePt(start);
    const endLabel = formatDatePt(end);
    return `${startLabel} ate ${endLabel}`;
  }, [agendaStart, agendaEnd]);

  const agendaRows = useMemo<AgendaRow[]>(() => {
    const start = parseInputDateValue(agendaStart);
    const end = parseInputDateValue(agendaEnd);
    if (!start || !end) return [];
    const startTime = Math.min(start.getTime(), end.getTime());
    const endTime = Math.max(start.getTime(), end.getTime());

    return processos
      .map((processo) => {
        const dateObj = getDatePartFromDataAbertura(processo.headerData.dataAbertura || '');
        if (!dateObj) return null;
        if (isWeekend(dateObj)) return null;
        const timeValue = dateObj.getTime();
        if (timeValue < startTime || timeValue > endTime) return null;
        return {
          empresa: processo.headerData.empresa || '',
          edital: processo.headerData.edital || '',
          orgao: getOrgaoName(processo.headerData.orgao || ''),
          uf: getUfFromOrgao(processo.headerData.orgao || ''),
          data: formatDatePt(dateObj),
          hora: getTimeFromDataAbertura(processo.headerData.dataAbertura || ''),
          portal: processo.headerData.portalInput || '',
          codigoGrade: processo.headerData.numeroGrade || '',
        };
      })
      .filter((row): row is AgendaRow => row !== null)
      .sort((a, b) => {
        const dateA = getDatePartFromDataAbertura(a.data) || new Date(0);
        const dateB = getDatePartFromDataAbertura(b.data) || new Date(0);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        const timeA = getTimeMinutes(a.hora) ?? 0;
        const timeB = getTimeMinutes(b.hora) ?? 0;
        return timeA - timeB;
      });
  }, [agendaStart, agendaEnd, processos]);

  const handleExportAgenda = () => {
    if (!agendaRows.length) {
      alert('Nenhum processo encontrado para o periodo selecionado.');
      return;
    }
    exportAgendaToExcel(agendaRows, `${agendaStart}_${agendaEnd}`);
  };

  const handlePrintAgenda = () => {
    if (!agendaRows.length) {
      alert('Nenhum processo encontrado para o periodo selecionado.');
      return;
    }
    const reportWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!reportWindow) return;

    const rowsHtml = agendaRows
      .map((row) => (
        `<tr>
          <td>${escapeHtml(row.empresa)}</td>
          <td>${escapeHtml(row.edital)}</td>
          <td>${escapeHtml(row.orgao)}</td>
          <td>${escapeHtml(row.uf)}</td>
          <td>${escapeHtml(row.data)}</td>
          <td>${escapeHtml(row.hora)}</td>
          <td>${escapeHtml(row.portal)}</td>
          <td>${escapeHtml(row.codigoGrade)}</td>
        </tr>`
      ))
      .join('');

    reportWindow.document.write(`<!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Agenda</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
          h1 { font-size: 18px; margin: 0 0 6px; }
          p { margin: 0 0 16px; font-size: 12px; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
          th { background: #111827; color: #ffffff; font-weight: 600; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <h1>Agenda de Processos</h1>
        <p>Periodo: ${escapeHtml(agendaPeriodLabel)}</p>
        <table>
          <thead>
            <tr>
              <th>EMPRESA</th>
              <th>EDITAL</th>
              <th>ORGAO</th>
              <th>UF</th>
              <th>DATA</th>
              <th>HORA</th>
              <th>PORTAL</th>
              <th>CODIGO DA GRADE</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>`);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
    reportWindow.close();
  };
  
  const headers = [
    { key: 'numeroGrade', label: 'Nº GRADE' },
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'edital', label: 'EDITAL' },
    { key: 'orgao', label: 'ÓRGÃO' },
    { key: 'uf', label: 'UF' },
    { key: 'dataAbertura', label: 'DATA DE ABERTURA' },
    { key: 'horaAbertura', label: 'HORA DE ABERTURA' },
    { key: 'dataEdicao', label: 'DATA DE EDIÇÃO' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Processos Salvos</h2>
        <div className="flex items-center gap-3 w-2/3 justify-end">
          <button
            onClick={openAgendaModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition shadow-sm"
          >
            Gerar Agenda
          </button>
          <div className="relative w-2/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por N Grade, Edital, Orgao..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-black"
            />
          </div>
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
                  onClick={() => requestSort(key as SortKey)}
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
                <td className="px-4 py-2 text-sm">{getTimeFromDataAbertura(processo.headerData.dataAbertura)}</td>
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
      {agendaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Agenda de Processos</h3>
                <p className="text-xs text-slate-500">Periodo: {agendaPeriodLabel}</p>
              </div>
              <button
                onClick={() => setAgendaModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition text-sm font-semibold"
              >
                Fechar
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data inicial</label>
                  <input
                    type="date"
                    value={agendaStart}
                    onChange={(e) => setAgendaStart(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data final</label>
                  <input
                    type="date"
                    value={agendaEnd}
                    onChange={(e) => setAgendaEnd(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportAgenda}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition shadow-sm"
                  >
                    Exportar Excel
                  </button>
                  <button
                    onClick={handlePrintAgenda}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition shadow-sm"
                  >
                    Imprimir / PDF
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[60vh] border border-slate-200 rounded-lg">
                <table className="w-full bg-white">
                  <thead className="bg-slate-800 text-white text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">EMPRESA</th>
                      <th className="px-3 py-2 text-left">EDITAL</th>
                      <th className="px-3 py-2 text-left">ORGAO</th>
                      <th className="px-3 py-2 text-left">UF</th>
                      <th className="px-3 py-2 text-left">DATA</th>
                      <th className="px-3 py-2 text-left">HORA</th>
                      <th className="px-3 py-2 text-left">PORTAL</th>
                      <th className="px-3 py-2 text-left">CODIGO DA GRADE</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 text-sm">
                    {agendaRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                          Nenhum processo encontrado para o periodo selecionado.
                        </td>
                      </tr>
                    ) : (
                      agendaRows.map((row, index) => (
                        <tr key={`${row.codigoGrade}-${index}`} className="border-b border-slate-200">
                          <td className="px-3 py-2">{row.empresa}</td>
                          <td className="px-3 py-2">{row.edital}</td>
                          <td className="px-3 py-2">{row.orgao}</td>
                          <td className="px-3 py-2">{row.uf}</td>
                          <td className="px-3 py-2">{row.data}</td>
                          <td className="px-3 py-2">{row.hora}</td>
                          <td className="px-3 py-2">{row.portal}</td>
                          <td className="px-3 py-2">{row.codigoGrade}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500">
                Observacao: processos com abertura em sabado ou domingo sao ignorados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processos;


















