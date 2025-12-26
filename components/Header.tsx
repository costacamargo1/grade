"use client";
import { useState, useEffect, useRef } from "react";
import { Building2, Calendar, Search, ChevronDown, Globe, Gavel, FileText, Hash, Plus, X, Save } from "lucide-react";
import { PORTAIS_MAP, LISTA_PORTAIS, MODO_DISPUTA_MAP, LISTA_MODOS } from "../lib/constants";
import { formatarEdital, formatarDataInteligente } from "../lib/formatters";
import { saveOrgao, findOrgaoByNome } from "../lib/orgaoService";

export default function Header() {
  // --- ESTADOS GERAIS ---
  const [edital, setEdital] = useState("");
  const [orgao, setOrgao] = useState("");
  const [dataAbertura, setDataAbertura] = useState("");
  const [empresa, setEmpresa] = useState("UNIQUE");
  const [portalInput, setPortalInput] = useState("");
  const [uasgInput, setUasgInput] = useState("");
  const [judicialInput, setJudicialInput] = useState("NÃO");

  // --- ESTADOS MODAL DE CADASTRO ---
  const [showModalOrgao, setShowModalOrgao] = useState(false);
  const [novoOrgaoNome, setNovoOrgaoNome] = useState("");
  const [novoOrgaoUasg, setNovoOrgaoUasg] = useState("");
  const [novoOrgaoPortal, setNovoOrgaoPortal] = useState("");

  // --- LÓGICA MODO DISPUTA ---
  const [modoDisputa, setModoDisputa] = useState("");
  const [showModoList, setShowModoList] = useState(false);
  const modoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modoRef.current && !modoRef.current.contains(event.target as Node)) {
        setShowModoList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS DE FORMATAÇÃO E ATALHOS ---
  
  const handleBlurEdital = () => setEdital(formatarEdital(edital));
  const handleBlurData = () => setDataAbertura(formatarDataInteligente(dataAbertura));

  const handleBlurPortal = () => {
    const codigo = portalInput.toUpperCase().trim();
    if (PORTAIS_MAP[codigo]) setPortalInput(PORTAIS_MAP[codigo]);
  };

  const handleBlurModo = () => {
    const codigo = modoDisputa.toUpperCase().trim();
    if (MODO_DISPUTA_MAP[codigo]) {
      setModoDisputa(MODO_DISPUTA_MAP[codigo]);
    }
  };

  // --- LÓGICA DE ÓRGÃOS ---

  const handleBuscarOrgao = () => {
    // Tenta achar no banco local
    const encontrado = findOrgaoByNome(orgao);
    if (encontrado) {
      setOrgao(encontrado.nome); // Ajusta o nome para o oficial
      if (encontrado.uasg) setUasgInput(encontrado.uasg);
      if (encontrado.portal) setPortalInput(encontrado.portal);
    }
  };

  const handleSalvarNovoOrgao = () => {
    if (!novoOrgaoNome) return alert("O nome do órgão é obrigatório!");
    
    saveOrgao({
      nome: novoOrgaoNome.toUpperCase(),
      uasg: novoOrgaoUasg,
      portal: novoOrgaoPortal
    });

    // Já preenche no formulário principal
    setOrgao(novoOrgaoNome.toUpperCase());
    setUasgInput(novoOrgaoUasg);
    setPortalInput(novoOrgaoPortal);
    
    // Limpa e fecha modal
    setNovoOrgaoNome("");
    setNovoOrgaoUasg("");
    setNovoOrgaoPortal("");
    setShowModalOrgao(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md relative z-10">
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* LADO ESQUERDO: FORMULÁRIO */}
          <div className="flex-1 space-y-6">
            
            {/* LINHA 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Edital */}
              <div className="md:col-span-2 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Edital</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="000/2025" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    value={edital}
                    onChange={(e) => setEdital(e.target.value)}
                    onBlur={handleBlurEdital}
                    onKeyDown={(e) => e.key === 'Enter' && handleBlurEdital()}
                  />
                </div>
              </div>
              
              {/* Órgão + Botão Buscar + Botão Adicionar */}
              <div className="md:col-span-7 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Órgão Licitante</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Building2 size={14} className="absolute left-3 top-3 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Busque pelo nome..." 
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 uppercase"
                      value={orgao}
                      onChange={(e) => setOrgao(e.target.value)}
                      onBlur={handleBuscarOrgao} // Busca ao sair do campo
                    />
                    <Search size={14} className="absolute right-3 top-3 text-slate-300" />
                  </div>
                  
                  {/* Botão Adicionar Novo */}
                  <button 
                    onClick={() => setShowModalOrgao(true)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl border border-blue-200 transition-colors"
                    title="Cadastrar Novo Órgão"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Abertura */}
              <div className="md:col-span-3 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Abertura</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="DD/MM - HH:mm" 
                    className="w-full pl-9 pr-3 py-2.5 bg-yellow-50/50 border border-yellow-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-300 uppercase"
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    onBlur={handleBlurData}
                    onKeyDown={(e) => e.key === 'Enter' && handleBlurData()}
                  />
                </div>
              </div>
            </div>

            {/* LINHA 2 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 border-dashed">
              
              {/* Portal */}
              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Portal</label>
                 <div className="flex items-center">
                    <Globe size={14} className="absolute left-0 text-slate-300" />
                    <input 
                      list="portais-list"
                      type="text" 
                      placeholder="Selecione..." 
                      className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                      value={portalInput}
                      onChange={(e) => setPortalInput(e.target.value)}
                      onBlur={handleBlurPortal}
                    />
                    <datalist id="portais-list">
                      {LISTA_PORTAIS.map(p => <option key={p} value={p} />)}
                    </datalist>
                 </div>
              </div>

              {/* ID/UASG */}
              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ID / UASG</label>
                 <div className="flex items-center">
                    <Hash size={14} className="absolute left-0 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Código" 
                      className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal" 
                      value={uasgInput}
                      onChange={(e) => setUasgInput(e.target.value)}
                    />
                 </div>
              </div>

              {/* Judicial */}
              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ação Judicial</label>
                 <div className="flex items-center">
                    <Gavel size={14} className="absolute left-0 text-red-300" />
                    <select
                       className="w-full pl-5 py-1 bg-transparent border-none text-xs font-bold text-red-500 focus:ring-0 cursor-pointer uppercase appearance-none"
                       value={judicialInput}
                       onChange={(e) => setJudicialInput(e.target.value)}
                    >
                       <option value="NÃO">NÃO</option>
                       <option value="SIM">SIM</option>
                       <option value="PARCIAL">PARCIAL</option>
                    </select>
                 </div>
              </div>

              {/* MODO DE DISPUTA */}
              <div className="relative group" ref={modoRef}>
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Modo de Disputa</label>
                 <div className="flex items-center relative">
                    <input 
                      type="text" 
                      placeholder="Selecione..." 
                      className="w-full py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                      value={modoDisputa}
                      onFocus={() => setShowModoList(true)}
                      onClick={() => setShowModoList(true)}
                      onChange={(e) => {
                        setModoDisputa(e.target.value);
                        setShowModoList(true);
                      }}
                      onBlur={handleBlurModo}
                    />
                    <ChevronDown size={12} className="text-slate-400 absolute right-0 pointer-events-none" />
                 </div>

                 {showModoList && (
                   <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl z-50 overflow-hidden">
                     {LISTA_MODOS
                       .filter(opt => opt.toLowerCase().includes(modoDisputa.toLowerCase()))
                       .map((opcao) => (
                         <div 
                           key={opcao}
                           className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                           onMouseDown={() => { // MouseDown dispara antes do Blur
                             setModoDisputa(opcao);
                             setShowModoList(false);
                           }}
                         >
                           {opcao}
                         </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: LOGO */}
          <div className="w-full xl:w-64 flex flex-col items-center justify-center border-t xl:border-t-0 xl:border-l border-slate-100 pl-0 xl:pl-8 pt-6 xl:pt-0 relative">
            <select 
              className="absolute top-0 right-0 text-[9px] text-slate-300 border border-slate-100 rounded opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            >
              <option value="UNIQUE">UNIQUE</option>
              <option value="COSTA">COSTA</option>
              <option value="NSA">NSA</option>
            </select>

            <div className="transform scale-90 transition-all duration-500">
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

      {/* --- MODAL DE CADASTRO DE ÓRGÃO --- */}
      {showModalOrgao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Building2 size={18} className="text-blue-500" />
                Cadastrar Novo Órgão
              </h3>
              <button onClick={() => setShowModalOrgao(false)} className="text-slate-400 hover:text-red-500 transition">
                <X size={20} />
              </button>
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
                    <input 
                      type="text" 
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                      placeholder="Opcional"
                      value={novoOrgaoUasg}
                      onChange={(e) => setNovoOrgaoUasg(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Padrão</label>
                    <input 
                      list="modal-portais-list"
                      type="text" 
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 uppercase"
                      placeholder="Opcional"
                      value={novoOrgaoPortal}
                      onChange={(e) => setNovoOrgaoPortal(e.target.value)}
                    />
                    <datalist id="modal-portais-list">
                      {LISTA_PORTAIS.map(p => <option key={p} value={p} />)}
                    </datalist>
                 </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModalOrgao(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSalvarNovoOrgao}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Save size={16} /> Salvar Órgão
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}