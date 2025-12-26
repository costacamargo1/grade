// components/Header.tsx
"use client";
import { useState, useEffect } from "react";
import { Building2, Calendar, Search, Globe, Gavel, FileText, Hash, Plus, X, Save } from "lucide-react";
import { logoMap, LISTA_PORTAIS, LISTA_MODOS, Orgao } from "../lib/data";
import { formatarEdital, formatarDataInteligente } from "../lib/formatters";
import { buscarOrgao, buscarOrgaoPorUasg } from "../lib/orgaoService";
import DropdownModoDisputa from "./DropdownModoDisputa";
import { resolverModoDisputa, processarAcaoJudicial, processarPortal } from "../lib/processor";
import { HeaderData } from "../lib/types";

// In a real app, this would be persisted, maybe in localStorage or a backend
const orgaosCadastrados: Orgao[] = [];

interface HeaderProps {
    headerData: HeaderData;
    setHeaderData: (data: HeaderData) => void;
}

export default function Header({ headerData, setHeaderData }: HeaderProps) {
  // --- LOCAL COMPONENT STATE (MODAL) ---
  const [showModalOrgao, setShowModalOrgao] = useState(false);
  const [novoOrgaoNome, setNovoOrgaoNome] = useState("");
  const [novoOrgaoUasg, setNovoOrgaoUasg] = useState("");
  const [novoOrgaoPortal, setNovoOrgaoPortal] = useState("");
  
  // --- DERIVED STATE ---
  const empresa = logoMap.get(headerData.logoInput.toUpperCase()) || "UNIQUE";

  // --- HANDLERS THAT UPDATE PARENT STATE ---
  const updateHeader = (field: keyof HeaderData, value: any) => {
    setHeaderData({ ...headerData, [field]: value });
  };
  
  const handleBlurEdital = () => {
    const formattedEdital = formatarEdital(headerData.edital);
    let newPortal = headerData.portalInput;

    const cleanInput = headerData.edital.trim().replace("EDITAL:", "").trim();
    if (cleanInput.startsWith('9') && cleanInput.length === 5 && /^\d+$/.test(cleanInput)) {
        newPortal = "COMPRASNET";
    }
    setHeaderData({ ...headerData, edital: formattedEdital, portalInput: newPortal });
  };

  const handleBlurData = () => {
    updateHeader("dataAbertura", formatarDataInteligente(headerData.dataAbertura));
  };

  const handleOrgaoBlur = () => {
      const result = buscarOrgao(headerData.orgao);
      let updates: Partial<HeaderData> = { orgao: result.textoFinal };
      if (result.orgaoEncontrado) {
          updates.portalInput = result.orgaoEncontrado.portal;
          updates.uasgInput = result.orgaoEncontrado.uasg;
      }
      setHeaderData({ ...headerData, ...updates });
  };

  const handleUasgBlur = () => {
      const orgaoEncontrado = buscarOrgaoPorUasg(headerData.uasgInput);
      if (orgaoEncontrado) {
          setHeaderData({
              ...headerData,
              orgao: orgaoEncontrado.nome,
              portalInput: orgaoEncontrado.portal,
          });
      }
  };

  const handlePortalBlur = () => {
      const processed = processarPortal(headerData.portalInput);
      updateHeader("portalInput", processed);
  };
  
  const handleModoDisputaBlur = () => {
    const resolved = resolverModoDisputa(headerData.modoDisputa);
    updateHeader("modoDisputa", resolved);
  };
  
  // --- LOCAL MODAL LOGIC ---
  const handleSalvarNovoOrgao = () => {
    if (!novoOrgaoNome) return alert("O nome do órgão é obrigatório!");
    
    const novoOrgao: Orgao = {
      nome: novoOrgaoNome.toUpperCase(),
      uasg: novoOrgaoUasg,
      portal: novoOrgaoPortal
    };
    orgaosCadastrados.push(novoOrgao); 

    setHeaderData({
      ...headerData,
      orgao: novoOrgao.nome,
      uasgInput: novoOrgao.uasg,
      portalInput: novoOrgao.portal,
    });
    
    setNovoOrgaoNome("");
    setNovoOrgaoUasg("");
    setNovoOrgaoPortal("");
    setShowModalOrgao(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md relative z-10">
        <div className="flex flex-col xl:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-2 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Edital</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="000/2025" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    value={headerData.edital}
                    onChange={(e) => updateHeader("edital", e.target.value)}
                    onBlur={handleBlurEdital}
                  />
                </div>
              </div>
              
              <div className="md:col-span-7 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Órgão Licitante</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Building2 size={14} className="absolute left-3 top-3 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Busque pelo nome ou abreviação..." 
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 uppercase"
                      value={headerData.orgao}
                      onChange={(e) => updateHeader("orgao", e.target.value)}
                      onBlur={handleOrgaoBlur}
                    />
                    <Search size={14} className="absolute right-3 top-3 text-slate-300" />
                  </div>
                  <button 
                    onClick={() => setShowModalOrgao(true)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl border border-blue-200 transition-colors"
                    title="Cadastrar Novo Órgão"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="md:col-span-3 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Abertura</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Use atalhos (H, A, T+dias)" 
                    className="w-full pl-9 pr-3 py-2.5 bg-yellow-50/50 border border-yellow-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-300 uppercase"
                    value={headerData.dataAbertura}
                    onChange={(e) => updateHeader("dataAbertura", e.target.value)}
                    onBlur={handleBlurData}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 border-dashed">
              
              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Portal</label>
                 <div className="flex items-center">
                    <Globe size={14} className="absolute left-0 text-slate-300" />
                    <input 
                      list="portais-list"
                      type="text" 
                      placeholder="Use atalhos (C, CP...)" 
                      className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                      value={headerData.portalInput}
                      onChange={(e) => updateHeader("portalInput", e.target.value)}
                      onBlur={handlePortalBlur}
                    />
                    <datalist id="portais-list">
                      {LISTA_PORTAIS.map(p => <option key={p} value={p} />)}
                    </datalist>
                 </div>
              </div>

              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ID / UASG</label>
                 <div className="flex items-center">
                    <Hash size={14} className="absolute left-0 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Busca órgão por UASG" 
                      className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal" 
                      value={headerData.uasgInput}
                      onChange={(e) => updateHeader("uasgInput", e.target.value)}
                      onBlur={handleUasgBlur}
                    />
                 </div>
              </div>

              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ação Judicial</label>
                 <div className="flex items-center">
                    <Gavel size={14} className="absolute left-0 text-red-300" />
                    <select
                       className="w-full pl-5 py-1 bg-transparent border-none text-xs font-bold text-red-500 focus:ring-0 cursor-pointer uppercase appearance-none"
                       value={headerData.judicialInput}
                       onChange={(e) => updateHeader("judicialInput", processarAcaoJudicial(e.target.value))}
                    >
                       <option value="NÃO">NÃO</option>
                       <option value="SIM">SIM</option>
                       <option value="PARCIAL">PARCIAL</option>
                    </select>
                 </div>
              </div>

              <div className="relative group">
                <DropdownModoDisputa 
                  value={headerData.modoDisputa}
                  onChange={(value) => updateHeader("modoDisputa", value)}
                  onBlur={handleModoDisputaBlur}
                />
              </div>
            </div>
          </div>

          <div className="w-full xl:w-64 flex flex-col items-center justify-between border-t xl:border-t-0 xl:border-l border-slate-100 pl-0 xl:pl-8 pt-6 xl:pt-0 relative">
                <div className="w-full text-center">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Empresa</label>
                    <input 
                        type="text"
                        placeholder="NSA, COSTA, UNIQUE..."
                        className="w-full text-center p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                        value={headerData.logoInput}
                        onChange={(e) => updateHeader("logoInput", e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Use atalhos (N, C, U, 1, 2, 3)</p>
                </div>

                <div className="transform scale-90 transition-all duration-500 h-24 flex items-center justify-center">
                {empresa === "UNIQUE" && (
                    <div className="text-center">
                        <h1 className="text-4xl font-extralight tracking-[0.2em] text-slate-800">
                        uni<span className="font-bold text-orange-500">Q</span>ue
                        </h1>
                        <p className="text-[9px] text-slate-400 mt-1 tracking-[0.4em] uppercase border-t border-slate-100 pt-2 mx-4">medicamentos</p>
                    </div>
                )}
                {empresa === "COSTA" && (
                    <div className="text-center border-2 border-blue-900 px-6 py-3">
                        <h1 className="text-lg font-black text-blue-900 tracking-tighter leading-none">
                        COSTA<br/>CAMARGO
                        </h1>
                    </div>
                )}
                {empresa === "NSA" && (
                    <div className="text-center">
                        <h1 className="text-5xl font-black italic text-green-700 tracking-tighter">
                        NSA
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 -mt-1 tracking-wider">DISTRIBUIDORA</p>
                    </div>
                )}
                </div>
            </div>

        </div>
      </div>

      {showModalOrgao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><Building2 size={18} className="text-blue-500" />Cadastrar Novo Órgão</h3>
              <button onClick={() => setShowModalOrgao(false)} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Órgão *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                  placeholder="EX: PREFEITURA DE VILA VELHA"
                  value={novoOrgaoNome}
                  onChange={(e) => setNovoOrgaoNome(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / UASG</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Opcional" value={novoOrgaoUasg} onChange={(e) => setNovoOrgaoUasg(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Padrão</label>
                    <input list="modal-portais-list" type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 uppercase" placeholder="Opcional" value={novoOrgaoPortal} onChange={(e) => setNovoOrgaoPortal(e.target.value)} />
                    <datalist id="modal-portais-list">
                      {LISTA_PORTAIS.map(p => <option key={p} value={p} />)}
                    </datalist>
                 </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModalOrgao(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
              <button onClick={handleSalvarNovoOrgao} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 shadow-sm hover:shadow"><Save size={16} /> Salvar Órgão</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

