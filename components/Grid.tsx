"use client";
import { Trash2, Plus, ArrowUpDown, GripVertical, Save, Upload, Download, X } from "lucide-react";
import React, { useRef, useState } from "react";
import type { ItemGrade, Resultado, HeaderData, Produto } from "../lib/types";
import { buscarProdutoPorCodigo, processarItem } from "../lib/processor";
import { exportGradeItensToExcel } from "../lib/exportService";
import { importGradeItensFromExcel } from "../lib/importService";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  formatCurrencyForInput,
  handleCurrencyInputChange,
  parseCurrency,
  formatCurrencyForDisplay,
} from "../lib/currencyUtils";

interface GridProps {
  itens: ItemGrade[];
  setItens: React.Dispatch<React.SetStateAction<ItemGrade[]>>;
  resultados: Resultado[];
  setResultados: React.Dispatch<React.SetStateAction<Resultado[]>>;
  headerData: HeaderData;
  produtos: Produto[];
}

const DraggableRow = ({ item, index, ...props }: { item: ItemGrade, index: number, [key: string]: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getDisplayValue = (field: keyof ItemGrade, isColocado = false, colocadoField: keyof ItemGrade | null = null) => {
      const editing = props.editingField;
      if (isColocado) {
        if (editing && editing.id === item.id && editing.field === `${String(colocadoField)}.valor`) {
          return editing.value;
        }
        const colocadoItem = item[colocadoField as keyof ItemGrade] as { valor: number };
        return formatCurrencyForDisplay(colocadoItem.valor);
      }

      if (editing && editing.id === item.id && editing.field === field) {
        return editing.value;
      }
      return formatCurrencyForDisplay(item[field] as number);
    }


    return (
        <tr ref={setNodeRef} style={style} {...attributes} className="h-[165px] odd:bg-white even:bg-slate-50/70 hover:bg-blue-50 transition-colors group print:bg-white">
            <td className="p-1 border-r border-slate-200 print:border-black text-center relative">
                <span {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 cursor-grab touch-none print:hidden">
                    <GripVertical size={14} />
                </span>
                <input
                    type="number"
                    className="w-full text-center bg-transparent outline-none focus:bg-white font-bold print:text-black"
                    value={item.numeroItem ?? ""}
                    onChange={(e) =>
                        props.handleUpdate(
                            item.id,
                            "numeroItem",
                            e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                    }
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                  type="text"
                  className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                  value={getDisplayValue("precoDoDia")}
                  onFocus={() => props.handleCurrencyFocus(item.id, "precoDoDia")}
                  onChange={(e) => props.handleCurrencyChange(e.target.value)}
                  onBlur={props.handleCurrencyBlur}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                  type="text"
                  className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                  value={getDisplayValue("melhorPreco")}
                  onFocus={() => props.handleCurrencyFocus(item.id, "melhorPreco")}
                  onChange={(e) => props.handleCurrencyChange(e.target.value)}
                  onBlur={props.handleCurrencyBlur}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                  type="text"
                  className="w-full text-center bg-transparent outline-none focus:bg-white font-bold print:text-black"
                  value={getDisplayValue("precoFinal")}
                  onFocus={() => props.handleCurrencyFocus(item.id, "precoFinal")}
                  onChange={(e) => props.handleCurrencyChange(e.target.value)}
                  onBlur={props.handleCurrencyBlur}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <textarea
                className="w-full px-2 bg-transparent outline-none focus:bg-white font-bold text-slate-700 print:text-black text-center"
                placeholder="DIGITE PRODUTO, FABRICANTE OU CÓDIGO"
                value={item.medicamento}
                onChange={(e) =>
                    props.handleUpdate(item.id, "medicamento", e.target.value)
                }
                onBlur={(e) => props.handleSmartBlur(item.id, e.target.value)}
                rows={4}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                type="text"
                className="w-full text-center bg-transparent outline-none focus:bg-white uppercase print:text-black"
                placeholder="MARCA"
                value={item.marca}
                onChange={(e) =>
                    props.handleUpdate(item.id, "marca", e.target.value)
                }
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                type="text"
                className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                placeholder="0"
                value={props.formatQuantity(item.quantidade)}
                onChange={(e) =>
                    props.handleQuantityChange(item.id, e.target.value)
                }
                size={props.formatQuantity(item.quantidade).length || 1}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                  type="text"
                  className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                  placeholder="R$ 0,0000"
                  value={getDisplayValue("valorEstimado")}
                  onFocus={() => props.handleCurrencyFocus(item.id, "valorEstimado")}
                  onChange={(e) => props.handleCurrencyChange(e.target.value)}
                  onBlur={props.handleCurrencyBlur}
                />
            </td>
            <td className="p-1 border-r border-orange-300 print:border-black bg-orange-100/50 print:bg-white">
                <input
                  type="text"
                  className="w-full text-center bg-transparent outline-none focus:bg-white font-bold text-slate-900 print:text-black"
                  placeholder="R$ 0,0000"
                  value={getDisplayValue("precoInicial")}
                  onFocus={() => props.handleCurrencyFocus(item.id, "precoInicial")}
                  onChange={(e) => props.handleCurrencyChange(e.target.value)}
                  onBlur={props.handleCurrencyBlur}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                  type="text"
                  className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                  placeholder="R$ 0,0000"
                  value={getDisplayValue("cotacao")}
                  onFocus={() => props.handleCurrencyFocus(item.id, "cotacao")}
                  onChange={(e) => props.handleCurrencyChange(e.target.value)}
                  onBlur={props.handleCurrencyBlur}
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <div className="flex flex-col gap-1">
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase print:text-black"
                    placeholder="EMPRESA"
                    value={item.primeiroColocado.empresa}
                    onChange={(e) =>
                    props.handleColocadoChange(
                        item.id,
                        "primeiroColocado",
                        "empresa",
                        e.target.value
                    )
                    }
                />
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase print:text-black"
                    placeholder="MARCA"
                    value={item.primeiroColocado.marca}
                    onChange={(e) =>
                    props.handleColocadoChange(
                        item.id,
                        "primeiroColocado",
                        "marca",
                        e.target.value
                    )
                    }
                />
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] print:text-black"
                    placeholder="R$ 0,0000"
                    value={getDisplayValue("primeiroColocado", true, "primeiroColocado")}
                    onFocus={() => props.handleColocadoCurrencyFocus(item.id, "primeiroColocado")}
                    onChange={(e) => props.handleCurrencyChange(e.target.value)}
                    onBlur={props.handleCurrencyBlur}
                />
                </div>
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <div className="flex flex-col gap-1">
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase print:text-black"
                    placeholder="EMPRESA"
                    value={item.segundoColocado.empresa}
                    onChange={(e) =>
                    props.handleColocadoChange(
                        item.id,
                        "segundoColocado",
                        "empresa",
                        e.target.value
                    )
                    }
                />
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase print:text-black"
                    placeholder="MARCA"
                    value={item.segundoColocado.marca}
                    onChange={(e) =>
                    props.handleColocadoChange(
                        item.id,
                        "segundoColocado",
                        "marca",
                        e.target.value
                    )
                    }
                />
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] print:text-black"
                    placeholder="R$ 0,0000"
                    value={getDisplayValue("segundoColocado", true, "segundoColocado")}
                    onFocus={() => props.handleColocadoCurrencyFocus(item.id, "segundoColocado")}
                    onChange={(e) => props.handleCurrencyChange(e.target.value)}
                    onBlur={props.handleCurrencyBlur}
                />
                </div>
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <div className="flex flex-col gap-1">
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase print:text-black"
                    placeholder="EMPRESA"
                    value={item.terceiroColocado.empresa}
                    onChange={(e) =>
                    props.handleColocadoChange(
                        item.id,
                        "terceiroColocado",
                        "empresa",
                        e.target.value
                    )
                    }
                />
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase print:text-black"
                    placeholder="MARCA"
                    value={item.terceiroColocado.marca}
                    onChange={(e) =>
                    props.handleColocadoChange(
                        item.id,
                        "terceiroColocado",
                        "marca",
                        e.target.value
                    )
                    }
                />
                <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] print:text-black"
                    placeholder="R$ 0,0000"
                    value={getDisplayValue("terceiroColocado", true, "terceiroColocado")}
                    onFocus={() => props.handleColocadoCurrencyFocus(item.id, "terceiroColocado")}
                    onChange={(e) => props.handleCurrencyChange(e.target.value)}
                    onBlur={props.handleCurrencyBlur}
                />
                </div>
            </td>
            <td className="p-1">
                <div className="flex items-center gap-1">
                    <input
                    type="text"
                    className="w-full text-center bg-transparent outline-none focus:bg-white uppercase print:text-black"
                    value={item.mapa}
                    onChange={(e) =>
                        props.handleUpdate(item.id, "mapa", e.target.value)
                    }
                    />
                    <button
                        onClick={() => props.handleSaveToResultados(item)}
                        className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 print:hidden"
                    >
                        SALVAR
                    </button>
                </div>
            </td>
            <td className="p-1 text-center">
                <button
                onClick={() => props.handleDelete(item.id)}
                className="text-slate-300 hover:text-red-500 print:hidden"
                >
                <Trash2 size={12} />
                </button>
            </td>
        </tr>
    );
};

export default function Grid({ itens, setItens, resultados, setResultados, headerData, produtos }: GridProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ItemGrade;
    direction: "ascending" | "descending";
  } | null>(null);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingField, setEditingField] = useState<{ id: string; field: string; value: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- NEW CURRENCY MASK LOGIC ---

const handleCurrencyFocus = (id: string, field: keyof ItemGrade) => {
  const item = itens.find(it => it.id === id);
  if (!item) return;

  const currentValue = item[field] as number;

  setEditingField({
    id,
    field: field as string,
    value: currentValue === 0 ? "" : formatCurrencyForInput(currentValue)
  });
};

const handleColocadoCurrencyFocus = (id: string, colocadoField: keyof ItemGrade) => {
  const item = itens.find(it => it.id === id);
  if (!item) return;

  const currentItem = item[colocadoField] as { valor: number };
  const currentValue = currentItem.valor;

  setEditingField({
    id,
    field: `${String(colocadoField)}.valor`,
    value: currentValue === 0 ? "" : formatCurrencyForInput(currentValue)
  });
};

  const handleCurrencyChange = (value: string) => {
    if (editingField) {
      setEditingField({
        ...editingField,
        value: handleCurrencyInputChange(value),
      });
    }
  };

  const handleCurrencyBlur = () => {
    if (editingField) {
      const { id, field, value } = editingField;
      const numericValue = parseCurrency(value);

      if (field.includes('.')) { // Handle "primeiroColocado.valor"
        const [colocado, subField] = field.split('.');
        handleColocadoChange(id, colocado as keyof ItemGrade, subField as "valor", numericValue);
      } else {
        handleUpdate(id, field as keyof ItemGrade, numericValue);
      }
      setEditingField(null);
    }
  };


  // Formata Quantidade com ponto (1.000)
  const formatQuantity = (value: number | undefined) => {
    if (!value) return "";
    return value.toLocaleString("pt-BR");
  };

  // Lógica de digitação de quantidade
  const handleQuantityChange = (id: string, valorInput: string) => {
    // Remove pontos e não-números
    const apenasNumeros = valorInput.replace(/\D/g, "");
    handleUpdate(id, "quantidade", Number(apenasNumeros));
  };

  // -------------------------------------

  const handleUpdate = (id: string, campo: keyof ItemGrade, valor: any) => {
    setItens(
      itens.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  const handleMultiUpdate = (id: string, updates: Partial<ItemGrade>) => {
    setItens(
      itens.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleColocadoChange = (
    id: string,
    colocado: keyof ItemGrade,
    campo: "empresa" | "marca" | "valor",
    valor: any
  ) => {
    setItens(
      itens.map((item) => {
        if (item.id === id) {
          const currentItem = item[colocado] as {
            empresa: string;
            marca: string;
            valor: number;
          };
          return {
            ...item,
            [colocado]: {
              ...currentItem,
              [campo]: valor,
            },
          };
        }
        return item;
      })
    );
  };

  const handleAddRow = () => {
    const novoItem: ItemGrade = {
      id: Date.now().toString(),
      numeroItem: itens.length + 1,
      precoDoDia: 0,
      melhorPreco: 0,
      precoFinal: 0,
      medicamento: "",
      marca: "",
      quantidade: 0,
      valorEstimado: 0,
      precoInicial: 0,
      cotacao: 0,
      primeiroColocado: { empresa: "", marca: "", valor: 0 },
      segundoColocado: { empresa: "", marca: "", valor: 0 },
      terceiroColocado: { empresa: "", marca: "", valor: 0 },
      mapa: "",
    };
    setItens([...itens, novoItem]);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedItens = await importGradeItensFromExcel(file);
      if (importedItens.length === 0) return;

      const newItens: ItemGrade[] = importedItens.map((importedItem, index) => {
        const novoItem: ItemGrade = {
          id: `${Date.now()}-${index}`,
          numeroItem: importedItem.numeroItem,
          precoDoDia: 0,
          melhorPreco: 0,
          precoFinal: 0,
          medicamento: importedItem.medicamento,
          marca: importedItem.marca || "",
          quantidade: importedItem.quantidade || 0,
          valorEstimado: 0,
          precoInicial: 0,
          cotacao: 0,
          primeiroColocado: { empresa: "", marca: "", valor: 0 },
          segundoColocado: { empresa: "", marca: "", valor: 0 },
          terceiroColocado: { empresa: "", marca: "", valor: 0 },
          mapa: "",
        };

        const textoLimpo = importedItem.medicamento.trim();
        if (textoLimpo) {
          const produtoEncontrado = produtos.find(
            (produto) =>
              produto.codeuro &&
              produto.codeuro.trim().toUpperCase() === textoLimpo.toUpperCase()
          );
          if (produtoEncontrado) {
            if (produtoEncontrado.apresentacaoSugerida) {
              novoItem.medicamento = produtoEncontrado.apresentacaoSugerida;
            }
            if (!novoItem.marca && produtoEncontrado.descricao) {
              const match = produtoEncontrado.descricao.match(/MARCA:\s*([^\/]+)/i);
              if (match && match[1]) {
                novoItem.marca = match[1].trim();
              }
            }
            if (produtoEncontrado.valorInicial) {
              const normalized = produtoEncontrado.valorInicial
                .replace(/[^0-9,.\-]/g, "")
                .replace(",", ".");
              const parsed = parseFloat(normalized);
              if (!Number.isNaN(parsed)) {
                novoItem.precoInicial = parsed;
              }
            }
          }
        }

        return novoItem;
      });

      setItens((current) => [...newItens, ...current]);
    } catch (error) {
      console.error("Erro ao importar itens da grade:", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = (id: string) => {
    setItens(itens.filter((i) => i.id !== id));
  };

  const handleSort = (key: keyof ItemGrade) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedItens = [...itens].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setItens(sortedItens);
  };

  const handleSmartBlur = (id: string, textoAtual: string) => {
    if (!textoAtual) return;

    const textoLimpo = textoAtual.trim();
    if (!textoLimpo) return;

    // Feature 1: Lookup by CODEURO (from "Produtos" tab)
    const produtoEncontrado = produtos.find(
      (produto) =>
        produto.codeuro &&
        produto.codeuro.trim().toUpperCase() === textoLimpo.toUpperCase()
    );
    if (produtoEncontrado) {
      const updates: Partial<ItemGrade> = {};
      if (produtoEncontrado.apresentacaoSugerida) {
        updates.medicamento = produtoEncontrado.apresentacaoSugerida;
      }
      if (produtoEncontrado.descricao) {
        const match = produtoEncontrado.descricao.match(/MARCA:\s*([^\/]+)/i);
        if (match && match[1]) {
          updates.marca = match[1].trim();
        }
      }
      if (produtoEncontrado.valorInicial) {
        const normalized = produtoEncontrado.valorInicial
          .replace(/[^0-9,.\-]/g, "")
          .replace(",", ".");
        const parsed = parseFloat(normalized);
        if (!Number.isNaN(parsed)) {
          updates.precoInicial = parsed;
        }
      }
      if (Object.keys(updates).length > 0) {
        handleMultiUpdate(id, updates);
      }
      return; // Stop processing
    }

    // Feature 2: Lookup by code (from 'APRESENTACOES')
    if (/^\d+$/.test(textoLimpo)) {
      const produtoEncontradoLegacy = buscarProdutoPorCodigo(textoLimpo);
      if (produtoEncontradoLegacy) {
        handleMultiUpdate(id, {
          medicamento: produtoEncontradoLegacy.nomeProduto,
          marca: produtoEncontradoLegacy.marca,
          valorEstimado: parseFloat(produtoEncontradoLegacy.valor) || 0,
        });
        return; // Stop processing
      }
    }

    // Feature 3: Manufacturer parsing (from 'F14:F184' logic)
    const processado = processarItem(textoLimpo);
    if (processado) {
      const updates: Partial<ItemGrade> = {
        medicamento: processado.textoFinal,
      };
      handleMultiUpdate(id, updates);
    }
  };

  const handleSaveToResultados = (item: ItemGrade) => {
    const ourCompanies = ['COSTA', 'UNIQUE', 'NSA'];
    let primeiroColocadoEmpresa = item.primeiroColocado.empresa.toUpperCase().trim();
    if (primeiroColocadoEmpresa === 'COSTA CAMARGO') {
        primeiroColocadoEmpresa = 'COSTA';
    }

    const isWinner = ourCompanies.includes(primeiroColocadoEmpresa);
    
    let status: 'ganho' | 'perdido' | 'neutro' = 'perdido';
    let nossoPreco: number | string = item.precoFinal; // default
    let empresaResultado = headerData.empresa;
    let precoConcorrente: number | string = '';
    let concorrente = '';
    let marcaConcorrente = '';

    if (isWinner) {
        status = 'ganho';
        nossoPreco = item.primeiroColocado.valor;
        empresaResultado = primeiroColocadoEmpresa;
        
        // Competitor is 2nd place
        precoConcorrente = item.segundoColocado.valor;
        concorrente = item.segundoColocado.empresa;
        marcaConcorrente = item.segundoColocado.marca;

    } else { // We lost
        status = 'perdido';
        let userCompany = headerData.empresa.toUpperCase();
        if (userCompany === 'COSTA CAMARGO') userCompany = 'COSTA';

        if (item.segundoColocado.empresa.toUpperCase().trim().includes(userCompany)) {
            nossoPreco = item.segundoColocado.valor;
        } else if (item.terceiroColocado.empresa.toUpperCase().trim().includes(userCompany)) {
            nossoPreco = item.terceiroColocado.valor;
        }
        
        // The winner is the competitor
        precoConcorrente = item.primeiroColocado.valor;
        concorrente = item.primeiroColocado.empresa;
        marcaConcorrente = item.primeiroColocado.marca;
    }
    
    const datePart = headerData.dataAbertura.split(' - ')[0]; // Get "DD/MM/YYYY"
    const [day, month, year] = datePart.split('/');
    const isoDate = `${year}-${month}-${day}`; // "YYYY-MM-DD"
    
    const newResultado: Resultado = {
      id: Date.now().toString(),
      produto: `${item.medicamento} (${item.marca})`,
      quantidade: item.quantidade,
      orgao: headerData.orgao.split('/')[0].trim(),
      pregao: headerData.edital,
      data: isoDate,
      uf: headerData.orgao.includes('/') ? headerData.orgao.split('/').pop()!.trim() : '',
      status: status,
      empresa: empresaResultado,
      nossoPreco: nossoPreco,
      precoConcorrente: precoConcorrente,
      concorrente: concorrente,
      marca: marcaConcorrente,
      webCotacao: headerData.webCotacao,
      minimoCotacao: '',
    };

    setResultados([newResultado, ...resultados]);
  };
  
  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setItens((items: ItemGrade[]) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-300 print:border-black overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".xlsx, .xls"
      />
      <div className="flex justify-end p-2 print:hidden">
        <button
          onClick={() => setShowImportExportModal(true)}
          className="group flex items-center gap-2 rounded-md py-2 px-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          IMPORTAR / EXPORTAR
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pl-8 print:pl-0">
          <table className="w-full text-xs text-left border-collapse min-w-[1300px]">
            <thead className="text-white bg-slate-800 uppercase font-bold tracking-tighter leading-tight print:bg-black print:text-white">
              <tr>
                <th className="p-2 border-r border-gray-600 w-20 text-center">
                  <button
                    className="flex items-center justify-center w-full gap-1"
                    onClick={() => handleSort("numeroItem")}
                  >
                    Item
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="p-2 border-r border-gray-600 w-20 text-center">
                  Preço
                  <br />
                  do Dia
                </th>
                <th className="p-2 border-r border-gray-600 w-20 text-center">
                  Melhor
                  <br />
                  Preço
                </th>
                <th className="p-2 border-r border-gray-600 w-20 text-center">
                  Preço
                  <br />
                  Final
                </th>
                <th className="p-2 border-r border-gray-600 min-w-[250px] text-center">
                  Medicamento
                </th>
                <th className="p-2 border-r border-gray-600 w-24 text-center">
                  Marca
                </th>
                <th className="p-2 border-r border-gray-600 text-center">
                  Qtd
                </th>
                <th className="p-2 border-r border-gray-600 w-24 text-center">
                  Estimado
                  <br />
                  (R$)
                </th>
                <th className="p-2 border-r border-gray-600 w-24 text-center text-white bg-black-200 print:bg-black">
                  Preço
                  <br />
                  Inicial (R$)
                </th>
                <th className="p-2 border-r border-gray-600 w-20 text-center">
                  Cotação
                  <br />
                  (R$)
                </th>
                <th className="p-2 border-r border-gray-600 w-32 text-center">
                  1º Colocado
                </th>
                <th className="p-2 border-r border-gray-600 w-32 text-center">
                  2º Colocado
                </th>
                <th className="p-2 border-r border-gray-600 w-32 text-center">
                  3º Colocado
                </th>
                <th className="p-2 w-16 text-center">Mapa</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <SortableContext items={itens} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-slate-200 print:divide-black text-slate-800 font-medium print:text-black">
                  {itens.map((item, index) => (
                    <DraggableRow 
                                            key={item.id} 
                                            item={item} 
                                            index={index}
                                            editingField={editingField}
                                            handleUpdate={handleUpdate}
                                            handleDelete={handleDelete}
                                            handleSmartBlur={handleSmartBlur}
                                            formatQuantity={formatQuantity}
                                            handleQuantityChange={handleQuantityChange}
                                            handleColocadoChange={handleColocadoChange}
                                            handleSaveToResultados={handleSaveToResultados}
                                            handleCurrencyFocus={handleCurrencyFocus}
                                            handleColocadoCurrencyFocus={handleColocadoCurrencyFocus}
                                            handleCurrencyChange={handleCurrencyChange}
                                            handleCurrencyBlur={handleCurrencyBlur}
                                            />                  ))}
                </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>

      <button
        onClick={handleAddRow}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 border-t border-slate-200 text-slate-700 font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 print:hidden"
      >
        <Plus size={16} /> Adicionar Item
      </button>
      {showImportExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Importar / Exportar</h3>
              <button
                onClick={() => setShowImportExportModal(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <button
                onClick={handleImportClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload size={16} />
                Importar
              </button>
              <button
                onClick={() => exportGradeItensToExcel(itens)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
