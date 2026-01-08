"use client";
import { useState, useRef } from 'react';
import { ItemGrade, HeaderData, Orgao, Resultado, Processo, Produto } from '../lib/types';
import Header from '../components/Header';
import Grid from '../components/Grid';
import Orgaos from '../components/Orgaos';
import Resultados from '../components/Resultados';
import Processos from '../components/Processos';
import Produtos from '../components/Produtos';
import Proposta from '../components/Proposta';
import { Download, Printer, Save, FilePlus } from 'lucide-react';
import { exportToExcel } from '../lib/exportService';
import DropdownEmpresa from '../components/DropdownEmpresa';
import BentoMenu from '../components/BentoMenu';
import GerarProcessoModal from '../components/GerarProcessoModal';
import { AnimatePresence, motion } from 'framer-motion';

type Tab = 'grade' | 'proposta' | 'orgaos' | 'resultados' | 'processos' | 'produtos';

export default function Home() {
  const [itens, setItens] = useState<ItemGrade[]>([]);
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isGerarProcessoModalOpen, setIsGerarProcessoModalOpen] = useState(false);
  const [generatedGrade, setGeneratedGrade] = useState('');
  const [headerData, setHeaderData] = useState<HeaderData>({
    edital: "",
    orgao: "",
    dataAbertura: "",
    numeroGrade: "",
    dataEdicao: "",
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
    dataCadastro: "",
    dataConferencia: "",
    dataDisputa: "",
    dataPropostaReajustada: "",
    localEnvio: "PORTAL",
    prazoEnvio: "",
    cortaNoEstimado: "NAO",
    disputaPorValor: "UNITARIO",
    casasDecimais: "2",
    amostra: "NAO",
    observacoes: "",
  });
  const [activeTab, setActiveTab] = useState<Tab>('grade');
  const printableComponentRef = useRef(null);

  const handleExport = () => {
    exportToExcel(headerData, itens);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNovaGrade = () => {
    if (window.confirm('Tem certeza que deseja criar uma nova grade? As informações não salvas serão perdidas.')) {
      setHeaderData({
        edital: "",
        orgao: "",
        dataAbertura: "",
        numeroGrade: "",
        dataEdicao: "",
        empresa: headerData.empresa, // Manter a empresa selecionada
        portalInput: "",
        uasgInput: "",
        judicialInput: "NÃO",
        modoDisputa: "",
        webCotacao: "",
        logoInput: headerData.empresa, // Manter a empresa selecionada
        cadastro: "",
        conferencia: "",
        disputa: "",
        proposta: "",
        dataCadastro: "",
        dataConferencia: "",
        dataDisputa: "",
        dataPropostaReajustada: "",
        localEnvio: "PORTAL",
        prazoEnvio: "",
        cortaNoEstimado: "NAO",
        disputaPorValor: "UNITARIO",
        casasDecimais: "2",
        amostra: "NAO",
        observacoes: "",
      });
      setItens([]);
    }
  };

  const handleGerarProcesso = () => {
    const isEditing = headerData.numeroGrade && headerData.numeroGrade !== "";

    if (isEditing) {
        const dataEdicao = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const updatedHeaderData = {
            ...headerData,
            dataEdicao: dataEdicao,
        };

        const updatedProcessos = processos.map(p => {
            if (p.headerData.numeroGrade === headerData.numeroGrade) {
                return {
                    ...p, // preserve original id
                    headerData: updatedHeaderData,
                    itens: itens, // update itens
                };
            }
            return p;
        });

        setHeaderData(updatedHeaderData);
        setProcessos(updatedProcessos);
        setGeneratedGrade(headerData.numeroGrade);
        setIsGerarProcessoModalOpen(true);

    } else {
        // We are creating a new one - original logic
        const existingGrades = processos.map(p => parseInt(p.headerData.numeroGrade, 10)).filter(n => !isNaN(n));
        const maxGrade = existingGrades.length > 0 ? Math.max(...existingGrades) : 0;
        const newGrade = maxGrade + 1;

        if (newGrade > 999999) {
          alert("Limite de grades atingido!");
          return;
        }

        const newNumeroGrade = String(newGrade);
        const dataEdicao = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const newHeaderData = {
          ...headerData,
          numeroGrade: newNumeroGrade,
          dataEdicao: dataEdicao,
        };

        const newProcesso: Processo = {
          id: Date.now().toString(),
          headerData: newHeaderData,
          itens: itens,
        };

        setHeaderData(newHeaderData);
        setProcessos([...processos, newProcesso]);
        setGeneratedGrade(newNumeroGrade);
        setIsGerarProcessoModalOpen(true);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'grade':
        return <Grid itens={itens} setItens={setItens} resultados={resultados} setResultados={setResultados} headerData={headerData} produtos={produtos} />;
      case 'orgaos':
        return <Orgaos orgaos={orgaos} setOrgaos={setOrgaos} />;
      case 'resultados':
        return <Resultados resultados={resultados} setResultados={setResultados} />;
      case 'processos':
        return <Processos processos={processos} setProcessos={setProcessos} setHeaderData={setHeaderData} setItens={setItens} setActiveTab={setActiveTab} />;
      case 'produtos':
        return <Produtos produtos={produtos} setProdutos={setProdutos} />;
      case 'proposta':
        return <Proposta empresa={headerData.empresa} produtos={produtos} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 font-sans pb-20 print:bg-white">
      
      {/* Faixa Superior (Estilo App) */}
      <div className="bg-slate-900 h-2 w-full fixed top-0 left-0 z-50 print:hidden"></div>

      <div className={activeTab === 'resultados' ? 'w-full p-4 lg:p-6 space-y-6 mt-2 print:p-0 print:m-0' : 'max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6 mt-2 print:p-0 print:m-0 print:max-w-full'}>
        
        {/* Abas de Navegação e Botão de Exportação */}
        <div className="flex justify-between items-start print:hidden">
            <BentoMenu activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Container for DropdownEmpresa and Export Button */}
            <div className="flex items-center gap-4">
                {/* Botões de Ação 2x2 com Cores Suaves */}
                {activeTab === 'grade' && (
                  <div className="flex items-center gap-4">
                    <DropdownEmpresa
                        value={headerData.empresa}
                        onChange={(newValue) => setHeaderData({ ...headerData, empresa: newValue, logoInput: newValue })}
                        onBlur={() => setHeaderData({ ...headerData, empresa: headerData.empresa, logoInput: headerData.empresa })}
                    />
                    <div className="flex gap-2">
                      {/* Coluna 1 */}
                      <div className="flex flex-col gap-1.5">
                        <button
                            onClick={handleNovaGrade}
                            className="group flex items-center gap-1.5 rounded-md py-1 px-2.5 text-xs font-semibold transition-colors bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                            <FilePlus size={14} className="text-yellow-700" />
                            <span>Nova Grade</span>
                        </button>
                        <button
                            onClick={handleGerarProcesso}
                            className="group flex items-center gap-1.5 rounded-md py-1 px-2.5 text-xs font-semibold transition-colors bg-purple-100 text-purple-800 hover:bg-purple-200"
                        >
                            <Save size={14} className="text-purple-700" />
                            <span>Gerar Processo</span>
                        </button>
                      </div>
                      {/* Coluna 2 */}
                      <div className="flex flex-col gap-1.5">
                        <button
                            onClick={handleExport}
                            className="group flex items-center gap-1.5 rounded-md py-1 px-2.5 text-xs font-semibold transition-colors bg-green-100 text-green-800 hover:bg-green-200"
                        >
                            <Download size={14} className="text-green-700" />
                            <span>Exportar</span>
                        </button>
                        <button
                          onClick={handlePrint}
                          className="group flex items-center gap-1.5 rounded-md py-1 px-2.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          <Printer size={14} className="text-blue-700" />
                          <span>Imprimir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        </div>

        <div ref={printableComponentRef} className="space-y-6">
            {/* 1. O CABEÇALHO INTELIGENTE */}
            {activeTab === 'grade' && (
              <div className={activeTab !== 'grade' ? 'print:hidden' : ''}>
                  <Header headerData={headerData} setHeaderData={setHeaderData} orgaos={orgaos} setOrgaos={setOrgaos} />
              </div>
            )}

            {/* 2. CONTEÚDO DINÂMICO (GRADE OU ÓRGÃOS) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
        </div>

      </div>
      <GerarProcessoModal 
        isOpen={isGerarProcessoModalOpen}
        onClose={() => setIsGerarProcessoModalOpen(false)}
        numeroGrade={generatedGrade}
      />
    </main>
  );
}
