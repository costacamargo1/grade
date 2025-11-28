"use client";
import { useState } from 'react';
import { processProductLine, ProcessedProduct } from '../lib/processor';
import Header from '../components/Header'; // <--- Importando a peça nova
import { ArrowRight, Check, Copy } from 'lucide-react';

export default function Home() {
  const [inputData, setInputData] = useState("");
  const [results, setResults] = useState<ProcessedProduct[]>([]);

  const handleProcess = () => {
    const lines = inputData.split('\n');
    const processed = lines.map((line, index) => processProductLine(line, index));
    setResults(processed.filter(p => p.raw.trim() !== ""));
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Título simples acima do sistema */}
        <div className="flex justify-between items-end">
            <h1 className="text-xl font-bold text-slate-400">Sistema Web de Licitações</h1>
            <span className="text-xs text-slate-400">Versão 1.0 (Beta)</span>
        </div>

        {/* --- AQUI ENTRA O SEU CABEÇALHO NOVO --- */}
        <Header />

        {/* Área de Trabalho (Inputs e Grids) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lado Esquerdo: Entrada */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-300">
            <h2 className="text-sm font-bold mb-2 text-slate-600 uppercase tracking-wide">Cole os Itens do Edital</h2>
            <textarea
              className="w-full h-[400px] p-4 border border-slate-300 rounded bg-slate-50 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-800"
              placeholder="Ex: ITEM 1 - INSULINA EUROFARMA..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
            <button
              onClick={handleProcess}
              className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2 uppercase text-sm"
            >
              Processar Grade <ArrowRight size={16} />
            </button>
          </div>

          {/* Lado Direito: Saída Processada */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-300 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Grade Processada</h2>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                {results.length} ITENS
              </span>
            </div>
            
            <div className="flex-1 overflow-auto h-[400px] border border-slate-200 rounded bg-white relative">
              {/* Cabeçalho da Tabela Fake */}
              <div className="sticky top-0 bg-slate-100 border-b border-slate-300 flex text-[10px] font-bold text-slate-600 p-2">
                 <div className="flex-1">DESCRIÇÃO</div>
                 <div className="w-32">FABRICANTE</div>
              </div>

              {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Copy size={32} />
                  <span className="text-xs">Aguardando dados...</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {results.map((item) => (
                    <div key={item.id} className="p-2 flex items-center hover:bg-blue-50 transition text-xs group">
                      <div className="flex-1 font-medium text-slate-700 pr-2">
                        {item.product}
                      </div>
                      <div className={`w-32 font-bold ${item.manufacturer === 'NÃO IDENTIFICADO' ? 'text-red-500' : 'text-green-600'}`}>
                        {item.manufacturer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}