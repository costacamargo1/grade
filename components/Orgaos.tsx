// components/Orgaos.tsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { Orgao, Processo } from '../lib/types';
import { ufs } from '../lib/data';
import { Building2, Globe, Hash, Trash2, Edit, X, Save, Upload, Download, FilePlus, Search } from 'lucide-react';
import { importOrgaosFromExcel } from '../lib/importService';
import { exportOrgaosToExcel } from '../lib/exportService';

interface OrgaosProps {
  orgaos: Orgao[];
  setOrgaos: (orgaos: Orgao[] | ((current: Orgao[]) => Orgao[])) => void;
  processos?: Processo[];
}

const sanitizeUf = (value: string): string => (
  value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2)
);

const splitNomeUf = (nome: string): { base: string; uf: string } => {
  if (!nome) return { base: '', uf: '' };
  const parts = nome.split('/');
  if (parts.length < 2) return { base: nome.trim(), uf: '' };
  const possibleUf = parts[parts.length - 1].trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(possibleUf)) {
    return { base: parts.slice(0, -1).join('/').trim(), uf: possibleUf };
  }
  return { base: nome.trim(), uf: '' };
};

const normalizeOrgao = (orgao: Orgao): Orgao => {
  const parsed = splitNomeUf(orgao.nome);
  const uf = sanitizeUf(orgao.uf || '') || parsed.uf;
  const base = parsed.base || orgao.nome.trim();
  const nomeFinal = base ? `${base.toUpperCase()}${uf ? ` / ${uf}` : ''}` : '';
  const portal = orgao.portal ? orgao.portal.toUpperCase() : '';
  return { ...orgao, nome: nomeFinal, uf, portal };
};

export default function Orgaos({ orgaos, setOrgaos, processos = [] }: OrgaosProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrgao, setEditingOrgao] = useState<Orgao | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newOrgao, setNewOrgao] = useState<Orgao>({ nome: '', uasg: '', portal: '', uf: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrgaos(orgaos => orgaos.map(normalizeOrgao));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOrgaos]);

  const participationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (processos) {
      processos.forEach(processo => {
        const orgaoNameFromProcess = processo.headerData.orgao;
        if (orgaoNameFromProcess) {
            const { base, uf } = splitNomeUf(orgaoNameFromProcess);
            const key = `${base.toUpperCase()}|${uf.toUpperCase()}`;
            counts.set(key, (counts.get(key) || 0) + 1);
        }
      });
    }
    return counts;
  }, [processos]);

  const handleDelete = (orgaoToDelete: Orgao) => {
    setOrgaos(currentOrgaos => currentOrgaos.filter(o => o.nome !== orgaoToDelete.nome));
  };

  const handleEdit = (orgaoToEdit: Orgao) => {
    const originalIndex = orgaos.findIndex(o => o.nome === orgaoToEdit.nome);
    if (originalIndex !== -1) {
      setEditingOrgao(normalizeOrgao({ ...orgaoToEdit }));
      setEditingIndex(originalIndex);
      setShowEditModal(true);
    }
  };

  const handleSave = () => {
    if (editingOrgao && editingIndex !== null) {
      const newOrgaos = [...orgaos];
      newOrgaos[editingIndex] = normalizeOrgao(editingOrgao);
      setOrgaos(newOrgaos);
      setShowEditModal(false);
      setEditingOrgao(null);
      setEditingIndex(null);
    }
  };

  const handleSaveNewOrgao = () => {
    if (newOrgao.nome) { // Basic validation: at least a name is required
      const normalized = normalizeOrgao(newOrgao);
      setOrgaos(currentOrgaos => [...currentOrgaos, normalized]);
      setShowAddModal(false);
      setNewOrgao({ nome: '', uasg: '', portal: '', uf: '' }); // Reset for next time
    } else {
      alert("O nome do órgão é obrigatório.");
    }
  };

  const filteredOrgaos = orgaos.filter(orgao =>
    (orgao.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (orgao.uasg?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (orgao.portal?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalPages = rowsPerPage > 0 ? Math.ceil(filteredOrgaos.length / rowsPerPage) : 1;
  const paginatedOrgaos = rowsPerPage > 0 ? filteredOrgaos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : filteredOrgaos;
  
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const handleExport = () => {
    exportOrgaosToExcel(orgaos);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedOrgaos = await importOrgaosFromExcel(file);
        setOrgaos(currentOrgaos => {
          const existingNames = new Set(currentOrgaos.map(o => o.nome.toUpperCase()));
          const newOrgaos = importedOrgaos.filter(io => !existingNames.has(io.nome.toUpperCase()));
          return [...currentOrgaos, ...newOrgaos];
        });
        alert(`${importedOrgaos.length} órgãos importados com sucesso!`);
      } catch (error) {
        console.error("Erro ao importar órgãos:", error);
        alert("Ocorreu um erro ao importar o arquivo. Verifique o console para mais detalhes.");
      } finally {
        // Reset file input
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };
  
  return (
    <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport}
        className="hidden" 
        accept=".xlsx, .xls"
      />
      
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="grow">
              <h1 className="text-3xl font-bold text-slate-800">Gestão de Órgãos</h1>
              <p className="text-sm text-slate-500 mt-1">{orgaos.length} órgãos cadastrados</p>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 text-sm rounded-md transition-colors shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2"
              >
                <FilePlus size={16} />
                <span>Novo Órgão</span>
              </button>
              <button
                onClick={handleImportClick}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 text-sm rounded-md transition-colors border border-slate-200 flex items-center gap-2"
              >
                <Upload size={16} />
                <span>Importar</span>
              </button>
              <button
                onClick={handleExport}
                disabled={orgaos.length === 0}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 text-sm rounded-md transition-colors border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                <span>Exportar</span>
              </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar órgãos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full sm:w-80 text-slate-900"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="text-sm text-slate-600">Linhas por página:</label>
            <select
              id="rows-per-page"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={0}>Todos</option>
            </select>
          </div>
        </div>

        {filteredOrgaos.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
            <Building2 size={48} className="mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-600">
              {searchTerm ? 'Nenhum órgão encontrado' : 'Nenhum órgão cadastrado'}
            </h3>
            <p className="text-slate-400 mt-1.5">
              {searchTerm ? 'Tente ajustar sua busca.' : 'Clique em "Novo Órgão" ou "Importar" para começar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="select-none">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Órgão</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">UF</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">UASG</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Portal</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Participações</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedOrgaos.map((orgao) => {
                  const { base, uf } = splitNomeUf(orgao.nome);
                  const key = `${base.toUpperCase()}|${uf.toUpperCase()}`;
                  const count = participationCounts.get(key) || 0;

                  return (
                  <tr key={orgao.nome} className="hover:bg-slate-50/70 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-lg">
                          <Building2 size={18} className="text-slate-500" />
                        </div>
                        <span className="font-semibold text-sm text-slate-800">{base}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-slate-600 font-medium">{uf}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                         <Hash size={14} /> 
                         {orgao.uasg || <span className="text-slate-400 italic">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Globe size={14} />
                        {orgao.portal ? orgao.portal.toUpperCase() : <span className="text-slate-400 italic">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-slate-600 font-medium">
                        {count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(orgao)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                              <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(orgao)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 size={16} />
                          </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredOrgaos.length > 0 && (
          <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
            <div className="text-sm text-slate-500">
              Mostrando <span className="font-semibold">{paginatedOrgaos.length}</span> de <span className="font-semibold">{filteredOrgaos.length}</span> órgãos
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-semibold border bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-600 px-2">
                  Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-semibold border bg-white hover:bg-slate-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add New Orgao Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><FilePlus size={18} className="text-green-500" />Cadastrar Novo Órgão</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Órgão *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-semibold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                  placeholder="EX: PREFEITURA DE VILA VELHA"
                  value={newOrgao.nome}
                  onChange={(e) => setNewOrgao({ ...newOrgao, nome: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UF</label>
                    <input list="modal-ufs-list" maxLength={2} type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase" placeholder="" value={newOrgao.uf || ""} onChange={(e) => setNewOrgao({ ...newOrgao, uf: e.target.value.toUpperCase() })} />
                    <datalist id="modal-ufs-list">
                      {ufs.map((uf) => <option key={uf} value={uf} />)}
                    </datalist>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / UASG</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500" placeholder="" value={newOrgao.uasg} onChange={(e) => setNewOrgao({ ...newOrgao, uasg: e.target.value })} />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Padrão</label>
                    <input list="modal-portais-list" type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase" placeholder="" value={newOrgao.portal} onChange={(e) => setNewOrgao({ ...newOrgao, portal: e.target.value.toUpperCase() })} />
                 </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancelar</button>
              <button onClick={handleSaveNewOrgao} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"><Save size={16} /> Salvar Órgão</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingOrgao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><Edit size={18} className="text-blue-500" />Editar Órgão</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Órgão *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-semibold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                  placeholder="EX: PREFEITURA DE VILA VELHA"
                  value={editingOrgao.nome}
                  onChange={(e) => setEditingOrgao({ ...editingOrgao, nome: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / UASG</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500" placeholder="" value={editingOrgao.uasg} onChange={(e) => setEditingOrgao({ ...editingOrgao, uasg: e.target.value })} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UF</label>
                    <input list="modal-ufs-list" maxLength={2} type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase" placeholder="" value={editingOrgao.uf || ""} onChange={(e) => setEditingOrgao({ ...editingOrgao, uf: e.target.value.toUpperCase() })} />
                    <datalist id="modal-ufs-list">
                      {ufs.map((uf) => <option key={uf} value={uf} />)}
                    </datalist>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Padrão</label>
                    <input list="modal-portais-list" type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase" placeholder="" value={editingOrgao.portal} onChange={(e) => setEditingOrgao({ ...editingOrgao, portal: e.target.value.toUpperCase() })} />
                 </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"><Save size={16} /> Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






