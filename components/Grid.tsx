"use client";
import { Trash2, Plus, ArrowUpDown, GripVertical, Save } from "lucide-react";
import React, { useState } from "react";
import type { ItemGrade, Resultado, HeaderData } from "../lib/types";
import { buscarProdutoPorCodigo, processarItem } from "../lib/processor";
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

interface GridProps {
  itens: ItemGrade[];
  setItens: React.Dispatch<React.SetStateAction<ItemGrade[]>>;
  resultados: Resultado[];
  setResultados: React.Dispatch<React.SetStateAction<Resultado[]>>;
  headerData: HeaderData;
}

const DraggableRow = ({ item, index, ...props }: { item: ItemGrade, index: number, [key: string]: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr ref={setNodeRef} style={style} {...attributes} className="h-[170px] odd:bg-white even:bg-slate-50/70 hover:bg-blue-50 transition-colors group print:bg-white">
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
                type="number"
                className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                value={item.precoDoDia || ""}
                onChange={(e) =>
                    props.handleUpdate(item.id, "precoDoDia", e.target.value)
                }
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                type="number"
                className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                value={item.melhorPreco || ""}
                onChange={(e) =>
                    props.handleUpdate(item.id, "melhorPreco", e.target.value)
                }
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                type="number"
                className="w-full text-center bg-transparent outline-none focus:bg-white font-bold print:text-black"
                value={item.precoFinal || ""}
                onChange={(e) =>
                    props.handleUpdate(item.id, "precoFinal", e.target.value)
                }
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                type="text"
                className="w-full px-2 bg-transparent outline-none focus:bg-white uppercase font-bold text-slate-700 print:text-black text-center"
                placeholder="DIGITE PRODUTO, FABRICANTE OU CÓDIGO"
                value={item.medicamento}
                onChange={(e) =>
                    props.handleUpdate(item.id, "medicamento", e.target.value)
                }
                onBlur={(e) => props.handleSmartBlur(item.id, e.target.value)}
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
                value={props.formatCurrency(item.valorEstimado)}
                onChange={(e) =>
                    props.handleCurrencyChange(
                    item.id,
                    "valorEstimado",
                    e.target.value
                    )
                }
                />
            </td>
            <td className="p-1 border-r border-orange-300 print:border-black bg-orange-100/50 print:bg-white">
                <input
                type="text"
                className="w-full text-center bg-transparent outline-none focus:bg-white font-bold text-slate-900 print:text-black"
                value={props.formatCurrency(item.precoInicial)}
                onChange={(e) =>
                    props.handleCurrencyChange(
                    item.id,
                    "precoInicial",
                    e.target.value
                    )
                }
                />
            </td>
            <td className="p-1 border-r border-slate-200 print:border-black">
                <input
                type="text"
                className="w-full text-center bg-transparent outline-none focus:bg-white print:text-black"
                value={props.formatCurrency(item.cotacao)}
                onChange={(e) =>
                    props.handleCurrencyChange(item.id, "cotacao", e.target.value)
                }
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
                    placeholder="R$ 0,00"
                    value={props.formatCurrency(item.primeiroColocado.valor)}
                    onChange={(e) =>
                    props.handleColocadoCurrencyChange(
                        item.id,
                        "primeiroColocado",
                        e.target.value
                    )
                    }
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
                    placeholder="R$ 0,00"
                    value={props.formatCurrency(item.segundoColocado.valor)}
                    onChange={(e) =>
                    props.handleColocadoCurrencyChange(
                        item.id,
                        "segundoColocado",
                        e.target.value
                    )
                    }
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
                    placeholder="R$ 0,00"
                    value={props.formatCurrency(item.terceiroColocado.valor)}
                    onChange={(e) =>
                    props.handleColocadoCurrencyChange(
                        item.id,
                        "terceiroColocado",
                        e.target.value
                    )
                    }
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
                        className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold print:hidden"
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

export default function Grid({ itens, setItens, resultados, setResultados, headerData }: GridProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ItemGrade;
    direction: "ascending" | "descending";
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- FUNÇÕES AUXILIARES DE MÁSCARA ---

  // Formata valor numérico para Moeda BRL (R$ 1.000,00)
  const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null || value === 0) return "";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
};

  // Lógica de digitação de dinheiro (Máscara)
  const handleCurrencyChange = (
  id: string,
  campo: keyof ItemGrade,
  valorInput: string
) => {
  const apenasNumeros = valorInput.replace(/\D/g, "");

  const valorFinal = apenasNumeros
    ? Number(apenasNumeros) / 10000
    : 0;

  handleUpdate(id, campo, valorFinal);
};

  const handleColocadoCurrencyChange = (
  id: string,
  colocado: keyof ItemGrade,
  valorInput: string
) => {
  const apenasNumeros = valorInput.replace(/\D/g, "");

  const valorFinal = apenasNumeros
    ? Number(apenasNumeros) / 10000
    : 0;

  handleColocadoChange(id, colocado, "valor", valorFinal);
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

    // Feature 1: Lookup by code (from 'APRESENTACOES')
    if (/^\d+$/.test(textoLimpo)) {
      const produtoEncontrado = buscarProdutoPorCodigo(textoLimpo);
      if (produtoEncontrado) {
        handleMultiUpdate(id, {
          medicamento: produtoEncontrado.nomeProduto,
          marca: produtoEncontrado.marca,
          valorEstimado: parseFloat(produtoEncontrado.valor) || 0,
        });
        return; // Stop processing
      }
    }

    // Feature 2: Manufacturer parsing (from 'F14:F184' logic)
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
                      handleUpdate={handleUpdate}
                      handleDelete={handleDelete}
                      handleSmartBlur={handleSmartBlur}
                      formatQuantity={formatQuantity}
                      formatCurrency={formatCurrency}
                      handleCurrencyChange={handleCurrencyChange}
                      handleQuantityChange={handleQuantityChange}
                      handleColocadoChange={handleColocadoChange}
                      handleColocadoCurrencyChange={handleColocadoCurrencyChange}
                      handleSaveToResultados={handleSaveToResultados}
                      />
                  ))}
                </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>

      <button
        onClick={handleAddRow}
        className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors print:hidden"
      >
        <Plus size={16} /> Adicionar Item
      </button>
    </div>
  );
}