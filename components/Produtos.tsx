"use client";

import { useMemo, useRef, useState, type ChangeEvent, useEffect } from "react";
import {
  FileDown,
  FileUp,
  Plus,
  Trash2,
  X,
  Save,
  Edit,
  ChevronUp,
  ChevronDown,
  TextSearch,
} from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [columnSize, setColumnSize] = useState<"compact" | "normal" | "wide">("wide");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null);
  const [descricaoPreview, setDescricaoPreview] = useState<string | null>(null);
  const [descricaoWidth, setDescricaoWidth] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const cellPadding = useMemo(() => {
    if (columnSize === "compact") return "px-2 py-1";
    if (columnSize === "normal") return "px-3 py-2";
    return "px-3 py-3";
  }, [columnSize]);

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
        alert("Ocorreu um erro ao importar os produtos. Verifique o console para mais detalhes.");
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

  const getObsText = (produto: Produto) => {
    const hasConv = produto.conv8702 || produto.conv16294 || produto.conv14001;
    if (produto.cap && hasConv) return "PMVG 0%";
    if (produto.cap) return "PMVG DESTINO";
    if (hasConv) return "PF 0%";
    return "";
  };

  const handleNewProdutoChange = (field: keyof Produto, value: string | boolean) => {
    setNewProduto((current) => ({ ...current, [field]: value }));
  };

  const filteredProdutos = useMemo(() => {
    const search = searchTerm.toUpperCase();
    if (!search) return produtos;
    return produtos.filter((produto) => {
      const values = [
        produto.fabricante,
        produto.descricao,
        produto.unidade,
        produto.valorInicial,
        produto.codeuro,
        produto.apresentacaoSugerida,
        getObsText(produto),
        produto.cap ? "SIM" : "NAO",
        produto.conv8702 ? "SIM" : "NAO",
        produto.conv16294 ? "SIM" : "NAO",
        produto.conv14001 ? "SIM" : "NAO",
      ];
      return values.some((value) => String(value).toUpperCase().includes(search));
    });
  }, [produtos, searchTerm]);

  const sortedProdutos = useMemo(() => {
    let sortableItems = [...filteredProdutos];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const getValue = (produto: Produto) => {
          switch (sortConfig.key) {
            case "obs":
              return getObsText(produto);
            case "cap":
              return produto.cap ? 1 : 0;
            case "conv8702":
              return produto.conv8702 ? 1 : 0;
            case "conv16294":
              return produto.conv16294 ? 1 : 0;
            case "conv14001":
              return produto.conv14001 ? 1 : 0;
            default:
              return (produto as any)[sortConfig.key] ?? "";
          }
        };
        const aVal = getValue(a);
        const bVal = getValue(b);
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return sortConfig.direction === "ascending" ? 1 : -1;
        if (bVal === null || bVal === undefined) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProdutos, sortConfig]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 0) return 1;
    return Math.ceil(sortedProdutos.length / itemsPerPage);
  }, [sortedProdutos, itemsPerPage]);

  const paginatedProdutos = useMemo(() => {
    if (itemsPerPage === 0) {
      return sortedProdutos;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProdutos.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProdutos, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const cycleColumnSize = () => {
    setColumnSize((current) => {
      if (current === "compact") return "normal";
      if (current === "normal") return "wide";
      return "compact";
    });
  };

  const getColumnClass = (key: string) => {
    const sizes = {
      compact: {
        fabricante: "w-32",
        descricao: "w-48",
        unidade: "w-20",
        valorInicial: "w-24",
        codeuro: "w-20",
        apresentacaoSugerida: "w-40",
        obs: "w-24",
        cap: "w-20",
        conv8702: "w-20",
        conv16294: "w-20",
        conv14001: "w-20",
      },
      normal: {
        fabricante: "w-48",
        descricao: "min-w-[260px]",
        unidade: "w-28",
        valorInicial: "w-40",
        codeuro: "w-32",
        apresentacaoSugerida: "w-64",
        obs: "w-32",
        cap: "w-28",
        conv8702: "w-28",
        conv16294: "w-28",
        conv14001: "w-28",
      },
      wide: {
        fabricante: "w-48",
        descricao: "min-w-[440px]",
        unidade: "w-32",
        valorInicial: "w-36",
        codeuro: "w-28",
        apresentacaoSugerida: "w-80",
        obs: "w-40",
        cap: "w-24",
        conv8702: "w-24",
        conv16294: "w-24",
        conv14001: "w-24",
      },
    };
    return sizes[columnSize][key as keyof typeof sizes.normal] || "";
  };

  const handleDescricaoResizeStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = descricaoWidth ?? 440;
    const minWidth = 260;
    const maxWidth = 800;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
      setDescricaoWidth(nextWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="bg-slate-100 px-3 sm:px-4 lg:px-5 py-4 min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".xlsx, .xls"
      />
      <div className="bg-white rounded-2xl shadow-md print:border-black overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-3 border-b border-slate-200">
<div className="flex flex-col">
  <h1 className="text-2xl font-bold text-slate-800">Gestão de Produtos</h1>
  <span className="text-sm text-slate-500 mt-0.5">
    {produtos.length} produtos cadastrados
  </span>
</div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <TextSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
              />
            </div>
            <button
              onClick={cycleColumnSize}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 text-sm rounded-md transition-colors border border-slate-200 flex items-center gap-2 w-full justify-center md:w-auto"
            >
              Ajustar colunas
            </button>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setNewProduto(createEmptyProduto());
                  setEditingId(null);
                  setShowAddModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 text-sm rounded-md transition-colors shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 justify-center flex-1"
              >
                <Plus size={16} />
                Adicionar
              </button>
              <button
                onClick={handleImportClick}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-2.5 text-sm rounded-md transition-colors border border-slate-200 flex items-center gap-2 justify-center"
                title="Importar"
              >
                <FileUp size={16} />
              </button>
              <button
                onClick={() => exportProdutosToExcel(produtos)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold p-2.5 text-sm rounded-md transition-colors border border-slate-200 flex items-center gap-2 justify-center"
                title="Exportar"
              >
                <FileDown size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1500px]">
            <thead className="text-white bg-slate-800 uppercase font-bold tracking-tighter leading-tight print:bg-black print:text-white">
              <tr>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("fabricante")}`}
                  onClick={() => requestSort("fabricante")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    FABRICANTE
                    {sortConfig?.key === "fabricante" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center relative ${getColumnClass("descricao")}`}
                  onClick={() => requestSort("descricao")}
                  style={descricaoWidth ? { width: `${descricaoWidth}px` } : undefined}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    DESCRICAO
                    {sortConfig?.key === "descricao" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                  <div
                    onMouseDown={handleDescricaoResizeStart}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    title="Arraste para ajustar a largura"
                  />
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("unidade")}`}
                  onClick={() => requestSort("unidade")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    UNIDADE
                    {sortConfig?.key === "unidade" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("valorInicial")}`}
                  onClick={() => requestSort("valorInicial")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    VALOR<br />INICIAL
                    {sortConfig?.key === "valorInicial" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("codeuro")}`}
                  onClick={() => requestSort("codeuro")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    CODEURO
                    {sortConfig?.key === "codeuro" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("apresentacaoSugerida")}`}
                  onClick={() => requestSort("apresentacaoSugerida")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    APRESENTACAO SUGERIDA
                    {sortConfig?.key === "apresentacaoSugerida" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("obs")}`}
                  onClick={() => requestSort("obs")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    OBS
                    {sortConfig?.key === "obs" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("cap")}`}
                  onClick={() => requestSort("cap")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    CAP<br />21,53%
                    {sortConfig?.key === "cap" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("conv8702")}`}
                  onClick={() => requestSort("conv8702")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    CONV.<br />87/02
                    {sortConfig?.key === "conv8702" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 border-r border-gray-600 text-center ${getColumnClass("conv16294")}`}
                  onClick={() => requestSort("conv16294")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    CONV.<br />162/94
                    {sortConfig?.key === "conv16294" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th
                  className={`p-2 text-center ${getColumnClass("conv14001")}`}
                  onClick={() => requestSort("conv14001")}
                >
                  <span className="flex items-center justify-center gap-1 cursor-pointer">
                    CONV.<br />140/01
                    {sortConfig?.key === "conv14001" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      ))}
                  </span>
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800 font-medium print:text-black">
              {paginatedProdutos.map((produto) => {
                const obsConfig = getObsConfig(produto);
                return (
                  <tr
                    key={produto.id}
                    className="odd:bg-white even:bg-slate-50/70 hover:bg-slate-100/50 transition-colors group print:bg-white"
                  >
                    <td className={`px-3 py-3 border-r border-slate-200 print:border-black ${getColumnClass("fabricante")}`}>
                      <span className="w-full text-center block uppercase print:text-black">
                        {produto.fabricante}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3 border-r border-slate-200 print:border-black ${getColumnClass("descricao")}`}
                      style={descricaoWidth ? { width: `${descricaoWidth}px` } : undefined}
                    >
                      <span
                        className="w-full text-center block print:text-black"
                        style={
                          columnSize === "wide"
                            ? {
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }
                            : undefined
                        }
                        onClick={() => {
                          if (produto.descricao) {
                            setDescricaoPreview(produto.descricao);
                          }
                        }}
                        title={produto.descricao}
                      >
                        {produto.descricao}
                      </span>
                    </td>
                    <td className={`px-2 py-1.5 border-r border-slate-200 print:border-black ${getColumnClass("unidade")}`}>
                      <span className="w-full text-center block uppercase print:text-black">
                        {produto.unidade}
                      </span>
                    </td>
                    <td className={`px-2 py-1.5 border-r border-slate-200 print:border-black ${getColumnClass("valorInicial")}`}>
                      <span className="w-full text-center block print:text-black">
                        {produto.valorInicial}
                      </span>
                    </td>
                    <td className={`px-2 py-1.5 border-r border-slate-200 print:border-black ${getColumnClass("codeuro")}`}>
                      <span className="w-full text-center block uppercase print:text-black">
                        {produto.codeuro}
                      </span>
                    </td>
                    <td className={`px-2 py-1.5 border-r border-slate-200 print:border-black ${getColumnClass("apresentacaoSugerida")}`}>
                      <span className="w-full text-center block print:text-black">
                        {produto.apresentacaoSugerida}
                      </span>
                    </td>
                    <td
                      className={`px-2 py-1.5 border-r border-slate-200 print:border-black text-center font-bold ${getColumnClass("obs")}`}
                      style={{ backgroundColor: obsConfig.bg, color: obsConfig.color }}
                    >
                      {obsConfig.text}
                    </td>
                    <td
                      className={`px-2 py-1.5 border-r border-slate-200 print:border-black text-center ${getColumnClass("cap")}`}
                      style={{
                        backgroundColor: produto.cap ? "#92D050" : "transparent",
                        color: "#000000",
                      }}
                    >
                      <span className="w-full font-bold">{produto.cap ? "SIM" : "NAO"}</span>
                    </td>
                    <td
                      className={`px-2 py-1.5 border-r border-slate-200 print:border-black text-center ${getColumnClass("conv8702")}`}
                      style={{
                        backgroundColor: produto.conv8702 ? "#00B0F0" : "transparent",
                        color: "#000000",
                      }}
                    >
                      <span className="w-full font-bold">{produto.conv8702 ? "SIM" : "NAO"}</span>
                    </td>
                    <td
                      className={`px-2 py-1.5 border-r border-slate-200 print:border-black text-center ${getColumnClass("conv16294")}`}
                      style={{
                        backgroundColor: produto.conv16294 ? "#FFC000" : "transparent",
                        color: "#000000",
                      }}
                    >
                      <span className="w-full font-bold">{produto.conv16294 ? "SIM" : "NAO"}</span>
                    </td>
                    <td
                      className={`px-2 py-1.5 border-r border-slate-200 print:border-black text-center ${getColumnClass("conv14001")}`}
                      style={{
                        backgroundColor: produto.conv14001 ? "#C662C6" : "transparent",
                        color: "#000000",
                      }}
                    >
                      <span className="w-full font-bold">{produto.conv14001 ? "SIM" : "NAO"}</span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => handleEditProduto(produto)}
                        className="text-slate-400 hover:text-blue-600 print:hidden p-2 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="text-slate-400 hover:text-red-600 print:hidden p-2 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedProdutos.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-400 text-sm">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center p-4 border-t border-slate-200 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="font-semibold">Linhas por pagina:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={0}>Todos</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Pagina {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Proxima
              </button>
            </div>
          </div>
        </div>
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
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition"
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
                  onChange={(e) => handleNewProdutoChange("fabricante", e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Descricao Detalhada
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500"
                  value={newProduto.descricao}
                  onChange={(e) => handleNewProdutoChange("descricao", e.target.value)}
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
                    onChange={(e) => handleNewProdutoChange("unidade", e.target.value)}
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
                    onChange={(e) => handleNewProdutoChange("valorInicial", e.target.value)}
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
                    onChange={(e) => handleNewProdutoChange("codeuro", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Apresentacao Sugerida
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500"
                    value={newProduto.apresentacaoSugerida}
                    onChange={(e) =>
                      handleNewProdutoChange("apresentacaoSugerida", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.cap}
                    onChange={(e) => handleNewProdutoChange("cap", e.target.checked)}
                    className="w-4 h-4 accent-[#92D050]"
                  />
                  CAP 21,53%
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.conv8702}
                    onChange={(e) => handleNewProdutoChange("conv8702", e.target.checked)}
                    className="w-4 h-4 accent-[#00B0F0]"
                  />
                  Conv. 87/02
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.conv16294}
                    onChange={(e) => handleNewProdutoChange("conv16294", e.target.checked)}
                    className="w-4 h-4 accent-[#FFC000]"
                  />
                  Conv. 162/94
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newProduto.conv14001}
                    onChange={(e) => handleNewProdutoChange("conv14001", e.target.checked)}
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
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduto}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <Save size={16} /> {editingId ? "Salvar Alteracoes" : "Salvar Produto"}
              </button>
            </div>
          </div>
        </div>
      )}
      {descricaoPreview !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Descricao Completa</h3>
              <button
                onClick={() => setDescricaoPreview(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-sm text-slate-700 whitespace-pre-wrap break-words">
              {descricaoPreview}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDescricaoPreview(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
