"use client";

import { useRef, type ChangeEvent } from "react";
import { FileDown, FileUp, Plus, Trash2 } from "lucide-react";
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
});

export default function Produtos({ produtos, setProdutos }: ProdutosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddRow = () => {
    setProdutos((current) => [...current, createEmptyProduto()]);
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
        <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
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
              <th className="p-2 w-64 text-center">APRESENTAÇÃO SUGERIDA</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800 font-medium print:text-black">
            {produtos.map((produto) => (
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
                <td className="p-1 text-center">
                  <button
                    onClick={() => handleDelete(produto.id)}
                    className="text-slate-300 hover:text-red-500 print:hidden"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-slate-400 text-sm"
                >
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddRow}
        className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors print:hidden"
      >
        <Plus size={16} /> Adicionar Produto
      </button>
    </div>
  );
}
