"use client";
import { useState } from 'react';
import { processProductLine, ItemGrade } from '../lib/processor';
import Header from '../components/Header';
import Grid from '../components/Grid';
import { ArrowRight, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function Home() {
  // Dados de entrada (Texto bruto)
  const [inputData, setInputData] = useState("");
  // Dados processados (A Grade)
  const [itens, setItens] = useState<ItemGrade[]>([]);
  // Controle visual (Esconder/Mostrar área de colar)
  const [showImport, setShowImport] = useState(true);

  const handleProcess = () => {
    if (!inputData.trim()) {
      return;
    }

    const lines = inputData.split('\n');
    
    // Mapeia o texto bruto para o formato completo da Grade
    const novosItens: ItemGrade[] = lines
      .filter(line => line.trim() !== "") // Ignora linhas vazias
      .map((line, index) => {
        // Usa o nosso "Motor" para limpar o texto e achar o fabricante
        const processed = processProductLine(line, index);
        
        return {
          id: Date.now().toString() + "-" + index, // ID único
          numeroItem: index + 1,
          
          // Mapeando para os novos campos
          precoDoDia: 0,
          melhorPreco: 0,
          precoFinal: 0,

          medicamento: processed.formatted, // Usamos o texto já limpo aqui
          marca: processed.manufacturer !== "NÃO IDENTIFICADO" ? processed.manufacturer : "GENÉRICO",
          quantidade: 0,
          
          valorEstimado: 0,
          precoInicial: 0,
          cotacao: 0,
          primeiroColocado: { empresa: "", marca: "", valor: 0 },
          segundoColocado: { empresa: "", marca: "", valor: 0 },
          terceiroColocado: { empresa: "", marca: "", valor: 0 },
          mapa: ""
        };
      });

    setItens(novosItens);
    setShowImport(false); // Esconde a caixa de texto automaticamente para focar na grade
  };

  return (
    <main className="min-h-screen bg-slate-100 font-sans pb-20">
      
      {/* Faixa Superior (Estilo App) */}
      <div className="bg-slate-900 h-2 w-full fixed top-0 left-0 z-50"></div>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6 mt-2">
        
        {/* 1. O CABEÇALHO INTELIGENTE */}
        <Header />

        {/* 2. ÁREA DE IMPORTAÇÃO (Colapsável) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Barra de Título da Importação */}
          <div 
            className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
            onClick={() => setShowImport(!showImport)}
          >
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wide">
              <FileText size={16} className="text-blue-500" />
              Importar Dados do Edital
            </div>
            {showImport ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>

          {/* Área de Colar (Só aparece se showImport for true) */}
          {showImport && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-top-2">
              <div className="lg:col-span-9">
                <textarea
                  className="w-full h-32 p-4 border border-slate-300 rounded-xl bg-slate-50 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-slate-800 transition-all"
                  placeholder="Cole aqui a lista de itens (Ex: ITEM 1 - DIPIRONA EMS...)"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                />
              </div>
              <div className="lg:col-span-3 flex flex-col justify-end">
                <button
                  onClick={handleProcess}
                  className="w-full h-full max-h-32 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-xl transition flex flex-col items-center justify-center gap-2 uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <ArrowRight size={24} className="text-green-400" />
                  Gerar Grade
                </button>
              </div>
            </div>
          )}
        </div>

{/* 3. A GRADE EDITÁVEL (O Coração do Sistema) */}
        {/* Removida a condição para a tabela aparecer sempre e permitir adicionar manual */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Grid itens={itens} setItens={setItens} />
        </div>

      </div>
    </main>
  );
}