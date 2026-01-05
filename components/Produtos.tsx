"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileDown, FileUp, Plus, Trash2, X, Save, Edit } from "lucide-react";
import { Produto } from "../lib/types";
import { importProdutosFromExcel } from "../lib/importService";
import { exportProdutosToExcel } from "../lib/exportService";

interface ProdutosProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
}

const createEmptyProduto = (): Produto => ({
  id: Date.now().toString(),
  fabricante: "",
  descricao: "",
  unidade: "",
  valorInicial: "",
  codeuro: "",
  apresentacaoSugerida: "",
  obs: "",
  cap: false,
  conv8702: false,
  conv16294: false,
  conv14001: false,
});

export default function Produtos({ produtos, setProdutos }: ProdutosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduto, setNewProduto] = useState<Produto>(createEmptyProduto());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveProduto = () => {
    if (editingId) {
      setProdutos((current) =>
        current.map((produto) =>
          produto.id === editingId ? { ...newProduto, id: editingId } : produto
        )
      );
    } else {
      setProdutos((current) => [newProduto, ...current]);
    }
    setShowAddModal(false);
    setNewProduto(createEmptyProduto());
    setEditingId(null);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedProdutos = await importProdutosFromExcel(file);
        setProdutos((current) => [...importedProdutos, ...current]);
      } catch (error) {
        console.error("Erro ao importar produtos:", error);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleDelete = (id: string) => {
    setProdutos((current) => current.filter((produto) => produto.id !== id));
  };

  const handleUpdate = (id: string, field: keyof Produto, value: string) => {
    setProdutos((current) =>
      current.map((produto) =>
        produto.id === id ? { ...produto, [field]: value } : produto
      )
    );
  };

  const handleEditProduto = (produto: Produto) => {
    setNewProduto({ ...produto });
    setEditingId(produto.id);
    setShowAddModal(true);
  };

  const getObsConfig = (produto: Produto) => {
    const hasConv = produto.conv8702 || produto.conv16294 || produto.conv14001;
    if (produto.cap && hasConv) {
      return { text: "PMVG 0%", bg: "#ff0000", color: "#ffffff" };
    }
    if (produto.cap) {
      return { text: "PMVG DESTINO", bg: "#ff0000", color: "#ffffff" };
    }
    if (hasConv) {
      return { text: "PF 0%", bg: "#FFC000", color: "#000000" };
    }
    return { text: "", bg: "transparent", color: "#000000" };
  };

  const handleNewProdutoChange = (field: keyof Produto, value: string | boolean) => {
    setNewProduto((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-300 print:border-black overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".xlsx, .xls"
      />
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-3 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Produtos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNewProduto(createEmptyProduto());
              setEditingId(null);
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            Adicionar
          </button>
          <button
            onClick={handleImportClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg"
          >
            <FileUp size={18} />
            Importar
          </button>
          <button
            onClick={() => exportProdutosToExcel(produtos)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg"
          >
            <FileDown size={18} />
            Exportar
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1500px]">
          <thead className="text-white bg-slate-800 uppercase font-bold tracking-tighter leading-tight print:bg-black print:text-white">
            <tr>
              <th className="p-2 border-r border-gray-600 w-48 text-center">
                FABRICANTE
              </th>
              <th className="p-2 border-r border-gray-600 min-w-[260px] text-center">
                DESCRIÇÃO
              </th>
              <th className="p-2 border-r border-gray-600 w-28 text-center">
                UNIDADE
              </th>
              <th className="p-2 border-r border-gray-600 w-40 text-center">
                VALOR INICIAL
              </th>
              <th className="p-2 border-r border-gray-600 w-32 text-center">
                CODEURO
              </th>
              <th className="p-2 border-r border-gray-600 w-64 text-center">
                APRESENTAÇÃO SUGERIDA
              </th>
              <th className="p-2 border-r border-gray-600 w-32 text-center">
                OBS
              </th>
              <th className="p-2 border-r border-gray-600 w-28 text-center">
                CAP 21,53%
              </th>
              <th className="p-2 border-r border-gray-600 w-28 text-center">
                CONV. 87/02
              </th>
              <th className="p-2 border-r border-gray-600 w-28 text-center">
                CONV. 162/94
              </th>
              <th className="p-2 w-28 text-center">CONV. 140/01</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800 font-medium print:text-black">
            {produtos.map((produto) => (
              (() => {
                const obsConfig = getObsConfig(produto);
                return (
              <tr
                key={produto.id}
                className="odd:bg-white even:bg-slate-50/70 hover:bg-blue-50 transition-colors group print:bg-white"
              >
                <td className="p-1 border-r border-slate-200 print:border-black">
                  <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white uppercase print:text-black"
                    value={produto.fabricante}
                    onChange={(e) =>
                      handleUpdate(produto.id, "fabricante", e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r border-slate-200 print:border-black">
                  <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                    value={produto.descricao}
                    onChange={(e) =>
                      handleUpdate(produto.id, "descricao", e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r border-slate-200 print:border-black">
                  <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white uppercase print:text-black"
                    value={produto.unidade}
                    onChange={(e) =>
                      handleUpdate(produto.id, "unidade", e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r border-slate-200 print:border-black">
                  <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                    value={produto.valorInicial}
                    onChange={(e) =>
                      handleUpdate(produto.id, "valorInicial", e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r border-slate-200 print:border-black">
                  <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white uppercase print:text-black"
                    value={produto.codeuro}
                    onChange={(e) =>
                      handleUpdate(produto.id, "codeuro", e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r border-slate-200 print:border-black">
                  <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                    value={produto.apresentacaoSugerida}
                    onChange={(e) =>
                      handleUpdate(
                        produto.id,
                        "apresentacaoSugerida",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td
                  className="p-1 border-r border-slate-200 print:border-black text-center font-bold"
                  style={{ backgroundColor: obsConfig.bg, color: obsConfig.color }}
                >
                  {obsConfig.text}
                </td>
                <td
                  className="p-1 border-r border-slate-200 print:border-black text-center"
                  style={{
                    backgroundColor: produto.cap ? "#92D050" : "transparent",
                    color: "#000000",
                  }}
                >
                  <span className="w-full font-bold">
                    {produto.cap ? "SIM" : "NAO"}
                  </span>
                </td>
                <td
                  className="p-1 border-r border-slate-200 print:border-black text-center"
                  style={{
                    backgroundColor: produto.conv8702 ? "#00B0F0" : "transparent",
                    color: "#000000",
                  }}
                >
                  <span className="w-full font-bold">
                    {produto.conv8702 ? "SIM" : "NAO"}
                  </span>
                </td>
                <td
                  className="p-1 border-r border-slate-200 print:border-black text-center"
                  style={{
                    backgroundColor: produto.conv16294 ? "#FFC000" : "transparent",
                    color: "#000000",
                  }}
                >
                  <span className="w-full font-bold">
                    {produto.conv16294 ? "SIM" : "NAO"}
                  </span>
                </td>
                <td
                  className="p-1 border-r border-slate-200 print:border-black text-center"
                  style={{
                    backgroundColor: produto.conv14001 ? "#C662C6" : "transparent",
                    color: "#000000",
                  }}
                >
                  <span className="w-full font-bold">
                    {produto.conv14001 ? "SIM" : "NAO"}
                  </span>
                </td>
                <td className="p-1 text-center">
                  <button
                    onClick={() => handleEditProduto(produto)}
                    className="text-slate-300 hover:text-blue-500 print:hidden mr-2"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(produto.id)}
                    className="text-slate-300 hover:text-red-500 print:hidden"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
                );
              })()
            ))}
            {produtos.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="p-8 text-center text-slate-400 text-sm"
                >
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Plus size={18} className="text-blue-500" />
                {editingId ? "Editar Produto" : "Adicionar Produto"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Fabricante
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-semibold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                  value={newProduto.fabricante}
                  onChange={(e) =>
                    handleNewProdutoChange("fabricante", e.target.value)
                  }
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Descrição Detalhada
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500"
                  value={newProduto.descricao}
                  onChange={(e) =>
                    handleNewProdutoChange("descricao", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase"
                    value={newProduto.unidade}
                    onChange={(e) =>
                      handleNewProdutoChange("unidade", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Valor Inicial
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500"
                    value={newProduto.valorInicial}
                    onChange={(e) =>
                      handleNewProdutoChange("valorInicial", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Codeuro.
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase"
                    value={newProduto.codeuro}
                    onChange={(e) =>
                      handleNewProdutoChange("codeuro", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Apresentação Sugerida
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500"
                    value={newProduto.apresentacaoSugerida}
                    onChange={(e) =>
                      handleNewProdutoChange(
                        "apresentacaoSugerida",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.cap}
                    onChange={(e) =>
                      handleNewProdutoChange("cap", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#92D050]"
                  />
                  CAP 21,53%
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.conv8702}
                    onChange={(e) =>
                      handleNewProdutoChange("conv8702", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#00B0F0]"
                  />
                  Conv. 87/02
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.conv16294}
                    onChange={(e) =>
                      handleNewProdutoChange("conv16294", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#FFC000]"
                  />
                  Conv. 162/94
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.conv14001}
                    onChange={(e) =>
                      handleNewProdutoChange("conv14001", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#C662C6]"
                  />
                  Conv. 140/01
                </label>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduto}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Save size={16} /> {editingId ? "Salvar Alteracoes" : "Salvar Produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
