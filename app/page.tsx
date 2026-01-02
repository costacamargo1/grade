"use client";
import { useState, useRef } from 'react';
import { ItemGrade, HeaderData, Orgao, Resultado } from '../lib/types';
import Header from '../components/Header';
import Grid from '../components/Grid';
import Orgaos from '../components/Orgaos';
import Resultados from '../components/Resultados';
import { Download, Printer } from 'lucide-react';
import { exportToExcel } from '../lib/exportService';
import DropdownEmpresa from '../components/DropdownEmpresa';

type Tab = 'grade' | 'orgaos' | 'resultados';

export default function Home() {
  const [itens, setItens] = useState<ItemGrade[]>([]);
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [headerData, setHeaderData] = useState<HeaderData>({
    edital: "",
    orgao: "",
    dataAbertura: "",
    empresa: "UNIQUE",
    portalInput: "",
    uasgInput: "",
    judicialInput: "NÃO",
    modoDisputa: "",
    webCotacao: "",
    logoInput: "UNIQUE",
    cadastro: "",
    conferencia: "",
    disputa: "",
    proposta: "",
  });
  const [activeTab, setActiveTab] = useState<Tab>('grade');
  const printableComponentRef = useRef(null);

  const handleExport = () => {
    exportToExcel(headerData, itens);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'grade':
        return <Grid itens={itens} setItens={setItens} resultados={resultados} setResultados={setResultados} headerData={headerData} />;
      case 'orgaos':
        return <Orgaos orgaos={orgaos} setOrgaos={setOrgaos} />;
      case 'resultados':
        return <Resultados resultados={resultados} setResultados={setResultados} />;
      default:
        return null;
    }
  };
  
  const tabButtonClasses = (tabName: Tab) => 
    `py-2 px-6 font-bold rounded-lg transition-colors duration-300 ${
      activeTab === tabName 
        ? 'bg-slate-800 text-white shadow-md' 
        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
    }`;

  return (
    <main className="min-h-screen bg-slate-100 font-sans pb-20 print:bg-white">
      
      {/* Faixa Superior (Estilo App) */}
      <div className="bg-slate-900 h-2 w-full fixed top-0 left-0 z-50 print:hidden"></div>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6 mt-2 print:p-0 print:m-0 print:max-w-full">
        
        {/* Abas de Navegação e Botão de Exportação */}
        <div className="flex justify-between items-center print:hidden">
            {/* Abas */}
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('grade')} className={tabButtonClasses('grade')}>
                    GRADE
                </button>
                <button onClick={() => setActiveTab('orgaos')} className={tabButtonClasses('orgaos')}>
                    ÓRGÃOS
                </button>
                <button onClick={() => setActiveTab('resultados')} className={tabButtonClasses('resultados')}>
                    RESULTADOS
                </button>
            </div>

            {/* Container for DropdownEmpresa and Export Button */}
            <div className="flex items-center gap-4">
                <DropdownEmpresa
                    value={headerData.empresa}
                    onChange={(newValue) => setHeaderData({ ...headerData, empresa: newValue, logoInput: newValue })}
                    onBlur={() => setHeaderData({ ...headerData, empresa: headerData.empresa, logoInput: headerData.empresa })}
                />

                {/* Botão de Exportação (condicional) */}
                {activeTab === 'grade' && (
                    <>
                        <button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Download size={18} />
                            Exportar para Excel
                        </button>
                        <button
                          onClick={handlePrint}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Printer size={18} />
                          Imprimir / PDF
                        </button>
                    </>
                )}
            </div>
        </div>

        <div ref={printableComponentRef} className="space-y-6">
            {/* 1. O CABEÇALHO INTELIGENTE */}
            {activeTab !== 'resultados' && (
              <div className={activeTab !== 'grade' ? 'print:hidden' : ''}>
                  <Header headerData={headerData} setHeaderData={setHeaderData} orgaos={orgaos} setOrgaos={setOrgaos} />
              </div>
            )}

            {/* 2. CONTEÚDO DINÂMICO (GRADE OU ÓRGÃOS) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderContent()}
            </div>
        </div>

      </div>
    </main>
  );
}
