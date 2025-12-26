"use client";
import { useState } from 'react';
import { ItemGrade, HeaderData } from '../lib/types';
import Header from '../components/Header';
import Grid from '../components/Grid';
import { Download } from 'lucide-react';
import { exportToExcel } from '../lib/exportService';


export default function Home() {
  const [itens, setItens] = useState<ItemGrade[]>([]);
  const [headerData, setHeaderData] = useState<HeaderData>({
    edital: "",
    orgao: "",
    dataAbertura: "",
    empresa: "UNIQUE",
    portalInput: "",
    uasgInput: "",
    judicialInput: "NÃO",
    modoDisputa: "",
    logoInput: "UNIQUE",
  });

  const handleExport = () => {
    exportToExcel(headerData, itens);
  };

  return (
    <main className="min-h-screen bg-slate-100 font-sans pb-20">
      
      {/* Faixa Superior (Estilo App) */}
      <div className="bg-slate-900 h-2 w-full fixed top-0 left-0 z-50"></div>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6 mt-2">
        
        {/* 1. O CABEÇALHO INTELIGENTE */}
        <Header headerData={headerData} setHeaderData={setHeaderData} />

        {/* Botão de Exportação */}
        <div className="flex justify-end">
            <button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                <Download size={18} />
                Exportar para Excel
            </button>
        </div>

        {/* 2. A GRADE EDITÁVEL (O Coração do Sistema) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Grid itens={itens} setItens={setItens} />
        </div>

      </div>
    </main>
  );
}