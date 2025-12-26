// components/Orgaos.tsx
import { useState } from 'react';
import { Orgao } from '../lib/types';
import { Building2, Globe, Hash, Trash2, Edit, X, Save } from 'lucide-react';

interface OrgaosProps {
  orgaos: Orgao[];
  setOrgaos: (orgaos: Orgao[]) => void;
}

export default function Orgaos({ orgaos, setOrgaos }: OrgaosProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrgao, setEditingOrgao] = useState<Orgao | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDelete = (index: number) => {
    const newOrgaos = [...orgaos];
    newOrgaos.splice(index, 1);
    setOrgaos(newOrgaos);
  };

  const handleEdit = (orgao: Orgao, index: number) => {
    setEditingOrgao({ ...orgao });
    setEditingIndex(index);
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (editingOrgao && editingIndex !== null) {
      const newOrgaos = [...orgaos];
      newOrgaos[editingIndex] = editingOrgao;
      setOrgaos(newOrgaos);
      setShowEditModal(false);
      setEditingOrgao(null);
      setEditingIndex(null);
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Building2 size={24} className="text-blue-500"/>
          Gestão de Órgãos
        </h2>
        <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{orgaos.length} órgãos cadastrados</span>
      </div>

      {orgaos.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <Building2 size={48} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-600">Nenhum órgão cadastrado</h3>
          <p className="text-slate-400 mt-1">Use o botão "+" no cabeçalho para adicionar um novo órgão.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="border-b-2 border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Nome do Órgão</th>
                <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">UASG</th>
                <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Portal</th>
                <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgaos.map((orgao, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Building2 size={16} className="text-slate-500" />
                      </div>
                      <span>{orgao.nome}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <Hash size={14} /> 
                       {orgao.uasg || <span className="text-slate-300 italic">N/A</span>}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Globe size={14} />
                      {orgao.portal || <span className="text-slate-300 italic">N/A</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(orgao, index)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(index)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition">
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / UASG</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500" placeholder="Opcional" value={editingOrgao.uasg} onChange={(e) => setEditingOrgao({ ...editingOrgao, uasg: e.target.value })} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Padrão</label>
                    <input list="modal-portais-list" type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase" placeholder="Opcional" value={editingOrgao.portal} onChange={(e) => setEditingOrgao({ ...editingOrgao, portal: e.target.value })} />
                 </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 shadow-sm hover:shadow"><Save size={16} /> Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
