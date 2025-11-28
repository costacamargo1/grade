"use client";
import { Trash2, Plus } from "lucide-react";
import { ItemGrade, processProductLine } from "../lib/processor";

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

  const handleAddRow = () => {
    const novoItem: ItemGrade = {
      id: Date.now().toString(),
      numeroItem: itens.length + 1,
      precoDoDia: 0,
      melhorPreco: 0,
      precoFinal: 0,
      medicamento: "",
      marca: "GENÉRICO",
      quantidade: 0,
      valorEstimado: 0,
      precoInicial: 0,
      cotacao: 0,
      primeiroColocado: "",
      segundoColocado: "",
      terceiroColocado: "",
      mapa: ""
    };
    setItens([...itens, novoItem]);
  };

  const handleDelete = (id: string) => {
    setItens(itens.filter(i => i.id !== id));
  };

  const handleUpdate = (id: string, campo: keyof ItemGrade, valor: any) => {
    setItens(itens.map(item => 
      item.id === id ? { ...item, [campo]: valor } : item
    ));
  };

  const handleSmartBlur = (id: string, textoAtual: string) => {
    if (!textoAtual) return;
    const processado = processProductLine(textoAtual, 0);
    handleUpdate(id, "medicamento", processado.formatted);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
      
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] text-left border-collapse min-w-[1300px]">
          
          <thead className="text-white bg-black uppercase font-bold tracking-tighter leading-tight">
            <tr>
              {/* ITEM EDITÁVEL */}
              <th className="p-2 border-r border-gray-700 w-12 text-center">Item</th>
              
              <th className="p-2 border-r border-gray-700 w-20 text-center">Preço<br/>do Dia</th>
              <th className="p-2 border-r border-gray-700 w-20 text-center">Melhor<br/>Preço</th>
              <th className="p-2 border-r border-gray-700 w-20 text-center">Preço<br/>Final</th>
              <th className="p-2 border-r border-gray-700 min-w-[250px] text-center">Medicamento</th>
              <th className="p-2 border-r border-gray-700 w-24 text-center">Marca</th>
              
              {/* QUANTIDADE COM PONTO */}
              <th className="p-2 border-r border-gray-700 w-16 text-center">Qtd</th>
              
              {/* ESTIMADO R$ */}
              <th className="p-2 border-r border-gray-700 w-24 text-center">Estimado<br/>(R$)</th>
              
              {/* PREÇO INICIAL R$ */}
              <th className="p-2 border-r border-gray-700 w-24 text-center text-black bg-orange-200">Preço<br/>Inicial (R$)</th>
              
              {/* COTAÇÃO R$ */}
              <th className="p-2 border-r border-gray-700 w-20 text-center">Cotação<br/>(R$)</th>
              
              <th className="p-2 border-r border-gray-700 w-32 text-center">1º Colocado</th>
              <th className="p-2 border-r border-gray-700 w-32 text-center">2º Colocado</th>
              <th className="p-2 border-r border-gray-700 w-32 text-center">3º Colocado</th>
              <th className="p-2 w-16 text-center">Mapa</th>
              <th className="w-8"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {itens.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50 transition-colors group">
                
                {/* 1. Item (AGORA EDITÁVEL) */}
                <td className="p-1 border-r border-slate-200 text-center">
                   <input 
                     type="number" 
                     className="w-full text-center bg-transparent outline-none focus:bg-white font-bold"
                     value={item.numeroItem}
                     onChange={(e) => handleUpdate(item.id, "numeroItem", Number(e.target.value))}
                   />
                </td>

                {/* 2. Preço do Dia */}
                <td className="p-1 border-r border-slate-200">
                  <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white" 
                    value={item.precoDoDia || ""} onChange={(e) => handleUpdate(item.id, "precoDoDia", e.target.value)} />
                </td>

                {/* 3. Melhor Preço */}
                <td className="p-1 border-r border-slate-200">
                  <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white" 
                    value={item.melhorPreco || ""} onChange={(e) => handleUpdate(item.id, "melhorPreco", e.target.value)} />
                </td>

                {/* 4. Preço Final */}
                <td className="p-1 border-r border-slate-200">
                  <input type="number" className="w-full text-center bg-transparent outline-none focus:bg-white font-bold" 
                    value={item.precoFinal || ""} onChange={(e) => handleUpdate(item.id, "precoFinal", e.target.value)} />
                </td>

                {/* 5. MEDICAMENTO */}
                <td className="p-1 border-r border-slate-200">
                  <input 
                    type="text" 
                    className="w-full px-2 bg-transparent outline-none focus:bg-white uppercase font-bold text-slate-700"
                    placeholder="DIGITE O PRODUTO..."
                    value={item.medicamento} 
                    onChange={(e) => handleUpdate(item.id, "medicamento", e.target.value)}
                    onBlur={(e) => handleSmartBlur(item.id, e.target.value)}
                  />
                </td>

                {/* 6. Marca */}
                <td className="p-1 border-r border-slate-200">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white uppercase" 
                    value={item.marca} onChange={(e) => handleUpdate(item.id, "marca", e.target.value)} />
                </td>

                {/* 7. Qtd (MÁSCARA 1.000) */}
                <td className="p-1 border-r border-slate-200">
                  <input 
                    type="text" 
                    className="w-full text-center bg-transparent outline-none focus:bg-white" 
                    placeholder="0"
                    value={formatQuantity(item.quantidade)} 
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)} 
                  />
                </td>

                {/* 8. Estimado (R$) */}
                <td className="p-1 border-r border-slate-200">
                  <input 
                    type="text" 
                    className="w-full text-center bg-transparent outline-none focus:bg-white" 
                    value={formatCurrency(item.valorEstimado)}
                    onChange={(e) => handleCurrencyChange(item.id, "valorEstimado", e.target.value)}
                  />
                </td>

                {/* 9. PREÇO INICIAL (R$) */}
                <td className="p-1 border-r border-orange-300 bg-orange-100/50">
                  <input 
                    type="text" 
                    className="w-full text-center bg-transparent outline-none focus:bg-white font-bold text-slate-900" 
                    value={formatCurrency(item.precoInicial)}
                    onChange={(e) => handleCurrencyChange(item.id, "precoInicial", e.target.value)}
                  />
                </td>

                {/* 10. Cotação (R$) */}
                <td className="p-1 border-r border-slate-200">
                  <input 
                    type="text" 
                    className="w-full text-center bg-transparent outline-none focus:bg-white" 
                    value={formatCurrency(item.cotacao)}
                    onChange={(e) => handleCurrencyChange(item.id, "cotacao", e.target.value)}
                  />
                </td>

                {/* 11, 12, 13, 14... Resto igual */}
                <td className="p-1 border-r border-slate-200">
                  <textarea rows={2} className="w-full text-center bg-transparent outline-none focus:bg-white resize-none text-[9px] uppercase leading-tight pt-1" 
                    value={item.primeiroColocado} onChange={(e) => handleUpdate(item.id, "primeiroColocado", e.target.value)} placeholder="EMPRESA&#10;R$ 0,00"></textarea>
                </td>
                <td className="p-1 border-r border-slate-200">
                  <textarea rows={2} className="w-full text-center bg-transparent outline-none focus:bg-white resize-none text-[9px] uppercase leading-tight pt-1" 
                    value={item.segundoColocado} onChange={(e) => handleUpdate(item.id, "segundoColocado", e.target.value)} placeholder="EMPRESA&#10;R$ 0,00"></textarea>
                </td>
                <td className="p-1 border-r border-slate-200">
                  <textarea rows={2} className="w-full text-center bg-transparent outline-none focus:bg-white resize-none text-[9px] uppercase leading-tight pt-1" 
                    value={item.terceiroColocado} onChange={(e) => handleUpdate(item.id, "terceiroColocado", e.target.value)} placeholder="EMPRESA&#10;R$ 0,00"></textarea>
                </td>
                <td className="p-1">
                  <input type="text" className="w-full text-center bg-transparent outline-none focus:bg-white uppercase" 
                    value={item.mapa} onChange={(e) => handleUpdate(item.id, "mapa", e.target.value)} />
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