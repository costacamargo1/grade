// src/app/page.tsx
"use client";
import { useState } from 'react';
// IMPORTANTE: Se você NÃO tiver a pasta src, mude o import abaixo para '../lib/processor'
import { processProductLine, ProcessedProduct } from '@/lib/processor';
import { ArrowRight, Check } from 'lucide-react';

export default function Home() {
  const [inputData, setInputData] = useState("");
  const [results, setResults] = useState<ProcessedProduct[]>([]);

  const handleProcess = () => {
    const lines = inputData.split('\n');
    const processed = lines.map((line, index) => processProductLine(line, index));
    setResults(processed.filter(p => p.raw.trim() !== ""));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Grade Licitação Web</h1>
            <p className="text-slate-500">Costa Camargo - Conversor Inteligente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Lado Esquerdo: Entrada */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Entrada (Cole do Edital ou Excel)</h2>
            <textarea
              className="w-full h-[500px] p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-900"
              placeholder="Ex: INSULINA EURO&#10;DIPIRONA MEDLEY&#10;ASPIRINA BAYER"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
            <button
              onClick={handleProcess}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Processar Dados <ArrowRight size={20} />
            </button>
          </div>

          {/* Lado Direito: Saída Processada */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Resultado Formatado</h2>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                {results.length} itens detectados
              </span>
            </div>
            
            <div className="flex-1 overflow-auto h-[500px] border border-slate-100 rounded-lg bg-slate-50 p-2">
              {results.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  O resultado aparecerá aqui...
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded border border-slate-200 flex justify-between items-center group hover:border-blue-300 transition">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.product}</p>
                        <p className={`text-xs ${item.manufacturer === 'NÃO IDENTIFICADO' ? 'text-red-500 font-bold' : 'text-green-600 font-semibold'}`}>
                          {item.manufacturer}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition">
                         <Check size={16} className="text-green-500" />
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