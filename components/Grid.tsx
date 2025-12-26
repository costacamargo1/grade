"use client";
import { Trash2, Plus } from "lucide-react";
import type { ItemGrade } from "../lib/types"; 
import { buscarProdutoPorCodigo, processarItem } from "../lib/processor";


interface GridProps {
  itens: ItemGrade[];
  setItens: (itens: ItemGrade[]) => void;
}

export default function Grid({ itens, setItens }: GridProps) {

  // --- FUNÇÕES AUXILIARES DE MÁSCARA ---

  // Formata valor numérico para Moeda BRL (R$ 1.000,00)
    const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Lógica de digitação de dinheiro (Máscara)
  const handleCurrencyChange = (id: string, campo: keyof ItemGrade, valorInput: string) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valorInput.replace(/\D/g, "");
    // Divide por 100 para considerar os centavos (Ex: 3300 -> 33.00)
    const valorFinal = Number(apenasNumeros) / 100;
    handleUpdate(id, campo, valorFinal);
  };

  const handleColocadoCurrencyChange = (id: string, colocado: keyof ItemGrade, valorInput: string) => {
    const apenasNumeros = valorInput.replace(/\D/g, "");
    const valorFinal = Number(apenasNumeros) / 100;
    handleColocadoChange(id, colocado, 'valor', valorFinal);
  };

  // Formata Quantidade com ponto (1.000)
  const formatQuantity = (value: number | undefined) => {
    if (!value) return "";
    return value.toLocaleString('pt-BR'); 
  };

  // Lógica de digitação de quantidade
  const handleQuantityChange = (id: string, valorInput: string) => {
    // Remove pontos e não-números
    const apenasNumeros = valorInput.replace(/\D/g, "");
    handleUpdate(id, "quantidade", Number(apenasNumeros));
  };

  // -------------------------------------

  const handleUpdate = (id: string, campo: keyof ItemGrade, valor: any) => {
    setItens(itens.map(item => 
      item.id === id ? { ...item, [campo]: valor } : item
    ));
  };

  const handleMultiUpdate = (id: string, updates: Partial<ItemGrade>) => {
    setItens(itens.map(item =>
        item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleColocadoChange = (id: string, colocado: keyof ItemGrade, campo: 'empresa' | 'marca' | 'valor', valor: any) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const currentItem = item[colocado] as { empresa: string; marca: string; valor: number };
        return {
          ...item,
          [colocado]: {
            ...currentItem,
            [campo]: valor
          }
        };
      }
      return item;
    }));
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
      mapa: ""
    };
    setItens([...itens, novoItem]);
  };

  const handleDelete = (id: string) => {
    setItens(itens.filter(i => i.id !== id));
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
            medicamento: processado.textoFinal
        };
        handleMultiUpdate(id, updates);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1300px]">
          
          <thead className="text-white bg-slate-800 uppercase font-bold tracking-tighter leading-tight">
            <tr>
              <th className="p-2 border-r border-gray-600 w-12 text-center">Item</th>
              <th className="p-2 border-r border-gray-600 w-20 text-center">Preço<br/>do Dia</th>
              <th className="p-2 border-r border-gray-600 w-20 text-center">Melhor<br/>Preço</th>
              <th className="p-2 border-r border-gray-600 w-20 text-center">Preço<br/>Final</th>
              <th className="p-2 border-r border-gray-600 min-w-[250px] text-center">Medicamento</th>
              <th className="p-2 border-r border-gray-600 w-24 text-center">Marca</th>
              <th className="p-2 border-r border-gray-600 w-16 text-center">Qtd</th>
              <th className="p-2 border-r border-gray-600 w-24 text-center">Estimado<br/>(R$)</th>
              <th className="p-2 border-r border-gray-600 w-24 text-center text-black bg-orange-200">Preço<br/>Inicial (R$)</th>
              <th className="p-2 border-r border-gray-600 w-20 text-center">Cotação<br/>(R$)</th>
              <th className="p-2 border-r border-gray-600 w-32 text-center">1º Colocado</th>
              <th className="p-2 border-r border-gray-600 w-32 text-center">2º Colocado</th>
              <th className="p-2 border-r border-gray-600 w-32 text-center">3º Colocado</th>
              <th className="p-2 w-16 text-center">Mapa</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {itens.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-slate-50/70 hover:bg-blue-50 transition-colors group"> 
               
                <td className="p-1 border-r border-slate-200 text-center">
                   <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white font-bold" value={item.numeroItem} onChange={(e) => handleUpdate(item.id, "numeroItem", Number(e.target.value))} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white" value={item.precoDoDia || ""} onChange={(e) => handleUpdate(item.id, "precoDoDia", e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white" value={item.melhorPreco || ""} onChange={(e) => handleUpdate(item.id, "melhorPreco", e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white font-bold" value={item.precoFinal || ""} onChange={(e) => handleUpdate(item.id, "precoFinal", e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input 
                    type="text" 
                    className="w-full px-2 bg-transparent outline-none focus:bg-white uppercase font-bold text-slate-700"
                    placeholder="DIGITE PRODUTO, FABRICANTE OU CÓDIGO"
                    value={item.medicamento} 
                    onChange={(e) => handleUpdate(item.id, "medicamento", e.target.value)}
                    onBlur={(e) => handleSmartBlur(item.id, e.target.value)}
                  />
                </td>
                <td className="p-1 border-r border-slate-200">                  
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white uppercase" placeholder="MARCA" value={item.marca} onChange={(e) => handleUpdate(item.id, "marca", e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white" placeholder="0" value={formatQuantity(item.quantidade)} onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white" value={formatCurrency(item.valorEstimado)} onChange={(e) => handleCurrencyChange(item.id, "valorEstimado", e.target.value)} />
                </td>
                <td className="p-1 border-r border-orange-300 bg-orange-100/50">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white font-bold text-slate-900" value={formatCurrency(item.precoInicial)} onChange={(e) => handleCurrencyChange(item.id, "precoInicial", e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white" value={formatCurrency(item.cotacao)} onChange={(e) => handleCurrencyChange(item.id, "cotacao", e.target.value)} />
                </td>
                <td className="p-1 border-r border-slate-200">
                  <div className="flex flex-col gap-1">
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase" placeholder="EMPRESA" value={item.primeiroColocado.empresa} onChange={(e) => handleColocadoChange(item.id, "primeiroColocado", "empresa", e.target.value)} />
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase" placeholder="MARCA" value={item.primeiroColocado.marca} onChange={(e) => handleColocadoChange(item.id, "primeiroColocado", "marca", e.target.value)} />
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px]" placeholder="R$ 0,00" value={formatCurrency(item.primeiroColocado.valor)} onChange={(e) => handleColocadoCurrencyChange(item.id, "primeiroColocado", e.target.value)} />
                  </div>
                </td>
                <td className="p-1 border-r border-slate-200">
                  <div className="flex flex-col gap-1">
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase" placeholder="EMPRESA" value={item.segundoColocado.empresa} onChange={(e) => handleColocadoChange(item.id, "segundoColocado", "empresa", e.target.value)} />
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase" placeholder="MARCA" value={item.segundoColocado.marca} onChange={(e) => handleColocadoChange(item.id, "segundoColocado", "marca", e.target.value)} />
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px]" placeholder="R$ 0,00" value={formatCurrency(item.segundoColocado.valor)} onChange={(e) => handleColocadoCurrencyChange(item.id, "segundoColocado", e.target.value)} />
                  </div>
                </td>
                <td className="p-1 border-r border-slate-200">
                  <div className="flex flex-col gap-1">
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase" placeholder="EMPRESA" value={item.terceiroColocado.empresa} onChange={(e) => handleColocadoChange(item.id, "terceiroColocado", "empresa", e.target.value)} />
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px] uppercase" placeholder="MARCA" value={item.terceiroColocado.marca} onChange={(e) => handleColocadoChange(item.id, "terceiroColocado", "marca", e.target.value)} />
                    <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white text-[10px]" placeholder="R$ 0,00" value={formatCurrency(item.terceiroColocado.valor)} onChange={(e) => handleColocadoCurrencyChange(item.id, "terceiroColocado", e.target.value)} />
                  </div>
                </td>
                <td className="p-1">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white uppercase" value={item.mapa} onChange={(e) => handleUpdate(item.id, "mapa", e.target.value)} />
                </td>
                <td className="p-1 text-center">
                  <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleAddRow}
        className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
      >
        <Plus size={16} /> Adicionar Item
      </button>
    </div>
  );
}
