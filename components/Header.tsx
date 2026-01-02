// components/Header.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Building2, Calendar, Search, Globe, Gavel, FileText, Hash, 
  Plus, X, Save, Clock, CheckSquare, AlertCircle, Microscope, 
  DollarSign, ListOrdered, Mail, Send
} from "lucide-react";
import { logoMap, LISTA_PORTAIS, Orgao } from "../lib/data";
import { formatarEdital, formatarDataInteligente } from "../lib/formatters";
import { buscarOrgao, buscarOrgaoPorUasg } from "../lib/orgaoService";
import DropdownModoDisputa from "./DropdownModoDisputa";
import CalendarComponent from "./Calendar";
import { resolverModoDisputa, processarAcaoJudicial, processarPortal } from "../lib/processor";
import { HeaderData } from "../lib/types";

interface HeaderProps {
    headerData: HeaderData;
    setHeaderData: (data: HeaderData) => void;
    orgaos: Orgao[];
    setOrgaos: (orgaos: Orgao[] | ((orgaos: Orgao[]) => Orgao[])) => void;
}

export default function Header({ headerData, setHeaderData, orgaos, setOrgaos }: HeaderProps) {
  // --- LOCAL COMPONENT STATE ---
  const [showModalOrgao, setShowModalOrgao] = useState(false);
  const [novoOrgaoNome, setNovoOrgaoNome] = useState("");
  const [novoOrgaoUasg, setNovoOrgaoUasg] = useState("");
  const [novoOrgaoPortal, setNovoOrgaoPortal] = useState("");
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [time, setTime] = useState({ hour: '09', minute: '00' });
  const calendarRef = useRef<HTMLDivElement>(null);

  // --- DERIVED STATE ---
  const empresa = logoMap.get(headerData.empresa.toUpperCase()) || "UNIQUE";

  // --- HANDLERS ---
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
      const result = buscarOrgao(headerData.orgao, orgaos);
      let updates: Partial<HeaderData> = { orgao: result.textoFinal };
      if (result.orgaoEncontrado) {
          updates.portalInput = result.orgaoEncontrado.portal;
          updates.uasgInput = result.orgaoEncontrado.uasg;
      }
      setHeaderData({ ...headerData, ...updates });
  };

  const handleUasgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const uasg = e.target.value;
      updateHeader("uasgInput", uasg);
      const orgaoEncontrado = buscarOrgaoPorUasg(uasg, orgaos);
      if (orgaoEncontrado) {
          setHeaderData({
              ...headerData,
              uasgInput: uasg,
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
  
  // --- CALENDAR LOGIC (MANTIDA) ---
  const toggleCalendar = () => {
    const dateStr = headerData.dataAbertura.split(' - ')[0];
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        setCalendarDate(d);
      }
    }
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    updateHeader('dataAbertura', `${formattedDate} - ${time.hour}:${time.minute}h`);
    setShowCalendar(false);
  };

  const handleTimeChange = (part: 'hour' | 'minute', value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const newTime = { ...time, [part]: numericValue };
    setTime(newTime);

    const datePartMatch = headerData.dataAbertura.match(/^\d{2}\/\d{2}\/\d{4}/);
    const datePart = datePartMatch ? datePartMatch[0] : new Date().toLocaleDateString('pt-BR');
    
    const finalHour = newTime.hour;
    const finalMinute = newTime.minute;

    if (finalHour || finalMinute) {
      const displayHour = finalHour.padStart(2, '0');
      const displayMinute = finalMinute.padStart(2, '0');
      updateHeader('dataAbertura', `${datePart} - ${displayHour}:${displayMinute}h`);
    } else {
      updateHeader('dataAbertura', datePart);
    }
  };

  const handleTimeBlur = (part: 'hour' | 'minute') => {
    const value = time[part];
    if (value) {
      setTime({ ...time, [part]: value.padStart(2, '0') });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- LOCAL MODAL LOGIC ---
  const handleSalvarNovoOrgao = () => {
    if (!novoOrgaoNome) return alert("O nome do órgão é obrigatório!");
    
    const novoOrgao: Orgao = {
      nome: novoOrgaoNome.toUpperCase(),
      uasg: novoOrgaoUasg,
      portal: novoOrgaoPortal
    };
    
    setOrgaos((orgaos) => [...orgaos, novoOrgao]);

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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-all hover:shadow-md relative z-20">
        
        {/* PARTE 1: CABEÇALHO PRINCIPAL (Edital, Órgão, Data) */}
        <div className="flex flex-col xl:flex-row gap-6 mb-5">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* EDITAL */}
              <div className="md:col-span-2 group">
                <label className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider mb-1 block">Edital</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 print:hidden" />
                  <input 
                    type="text" 
                    placeholder="0000/202X" 
                    className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 print:border-black rounded-lg text-sm font-semibold text-slate-700 print:text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    value={headerData.edital}
                    onChange={(e) => updateHeader("edital", e.target.value)}
                    onBlur={handleBlurEdital}
                  />
                </div>
              </div>
              
              {/* ORGAO */}
              <div className="md:col-span-6 group">
                <label className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider mb-1 block">Órgão Licitante</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 print:hidden" />
                    <input 
                      type="text" 
                      placeholder="Busque pelo nome ou abreviação" 
                      className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 print:border-black rounded-lg text-sm font-semibold text-slate-700 print:text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 uppercase"
                      value={headerData.orgao}
                      onChange={(e) => updateHeader("orgao", e.target.value)}
                      onBlur={handleOrgaoBlur}
                    />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 print:hidden" />
                  </div>
                  <button 
                    onClick={() => setShowModalOrgao(true)}
                    className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors print:hidden"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* DATA ABERTURA */}
              <div className="md:col-span-2 group">
                <label className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider mb-1 block">Abertura</label>
                <div className="relative" ref={calendarRef}>
                  <input 
                    type="text" 
                    placeholder="dd/mm/aaaa - hh:mm" 
                    className="w-full pl-3 pr-7 py-2 bg-yellow-50/50 border border-yellow-200 print:border-black rounded-lg text-sm font-bold text-slate-700 print:text-black focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-400 uppercase"
                    value={headerData.dataAbertura}
                    onChange={(e) => updateHeader("dataAbertura", e.target.value)}
                    onBlur={handleBlurData}
                  />
                   <button type="button" onClick={toggleCalendar} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 print:hidden">
                    <Calendar size={14} />
                  </button>
                  {showCalendar && (
                     <div className="absolute top-full right-0 mt-2 z-30 flex flex-col gap-2 shadow-xl print:hidden">
                       <CalendarComponent 
                          currentDate={calendarDate}
                          setCurrentDate={setCalendarDate}
                          onDateSelect={handleDateSelect}
                       />
                       <div className="p-2 bg-white rounded-b-lg border-x border-b flex items-center justify-center gap-2">
                          <Clock size={16} className="text-slate-400"/>
                          <input type="text" maxLength={2} value={time.hour} onChange={e => handleTimeChange('hour', e.target.value)} onBlur={() => handleTimeBlur('hour')} className="w-10 p-1 text-center border rounded font-medium text-slate-700 text-sm"/>
                          <span className="font-bold">:</span>
                          <input type="text" maxLength={2} value={time.minute} onChange={e => handleTimeChange('minute', e.target.value)} onBlur={() => handleTimeBlur('minute')} className="w-10 p-1 text-center border rounded font-medium text-slate-700 text-sm"/>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PARTE 2: DADOS SECUNDÁRIOS (Portal, ID, Judicial, Web) */}
            <div className="grid grid-cols-2 md:grid-cols-15 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 print:border-black border-dashed items-end">
              
              <div className="relative group md:col-span-4">
                 <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase mb-0.5 block">Portal</label>
                 <div className="flex items-center">
                    <Globe size={12} className="absolute left-0 text-slate-300 print:text-black" />
                    <input 
                      list="portais-list"
                      type="text" 
                      className="w-full pl-4 py-0.5 bg-transparent border-b border-slate-200 print:border-black focus:border-blue-500 text-xs font-bold text-slate-600 print:text-black focus:outline-none uppercase"
                      value={headerData.portalInput}
                      onChange={(e) => updateHeader("portalInput", e.target.value)}
                      onBlur={handlePortalBlur}
                    />
                    <datalist id="portais-list">
                      {LISTA_PORTAIS.map(p => <option key={p} value={p} />)}
                    </datalist>
                 </div>
              </div>

              <div className="relative group md:col-span-2">
                 <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase mb-0.5 block">ID / UASG</label>
                 <div className="flex items-center">
                    <Hash size={12} className="absolute left-0 text-slate-300 print:text-black" />
                    <input 
                      type="text" 
                      className="w-full pl-4 py-0.5 bg-transparent border-b border-slate-200 print:border-black focus:border-blue-500 text-xs font-bold text-slate-600 print:text-black focus:outline-none" 
                      value={headerData.uasgInput}
                      onChange={handleUasgChange}
                    />
                 </div>
              </div>

              <div className="relative group md:col-span-2">
                 <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase mb-0.5 block">Judicial</label>
                 <div className="flex items-center">
                    <Gavel size={12} className="absolute left-0 text-red-300 print:text-black" />
                    <select
                       className="w-full pl-4 py-0.5 bg-transparent border-none text-xs font-bold text-red-500 print:text-black focus:ring-0 cursor-pointer uppercase appearance-none p-0"
                       value={headerData.judicialInput}
                       onChange={(e) => updateHeader("judicialInput", processarAcaoJudicial(e.target.value))}
                    >
                       <option value="NÃO">NÃO</option>
                       <option value="SIM">SIM</option>
                       <option value="PARCIAL">PARCIAL</option>
                    </select>
                 </div>
              </div>

              <div className="relative group md:col-span-2">
                <DropdownModoDisputa 
                  value={headerData.modoDisputa}
                  onChange={(value) => updateHeader("modoDisputa", value)}
                  onBlur={handleModoDisputaBlur}
                />
              </div>
              
              <div className="relative group md:col-span-2">
                 <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase mb-0.5 block">WEB / Cotação</label>
                 <input
                   type="text"
                   className="w-full py-0.5 bg-transparent border-b border-slate-200 print:border-black focus:border-blue-500 text-xs font-bold text-slate-600 print:text-black focus:outline-none uppercase"
                   value={headerData.webCotacao}
                   onChange={(e) => updateHeader("webCotacao", e.target.value)}
                 />
              </div>
            </div>
          </div>
            
            {/* LOGO DA EMPRESA (DIREITA) */}
            <div className="w-full xl:w-80 flex items-center justify-center border-l border-slate-100 print:border-black pl-4">
                <div className="transform scale-90">
                {empresa === "UNIQUE" && (
                    <div className="text-center">
                        <h1 className="text-3xl font-extralight tracking-[0.2em] text-slate-800 print:text-black">
                        uni<span className="font-bold text-orange-500 print:text-black">Q</span>ue
                        </h1>
                        <p className="text-[8px] text-slate-400 print:text-black mt-1 tracking-[0.4em] uppercase border-t border-slate-100 print:border-black pt-1 mx-2">medicamentos</p>
                    </div>
                )}
                {empresa === "COSTA" && (
                    <div className="text-center border-2 border-blue-900 print:border-black px-4 py-2">
                        <h1 className="text-base font-black text-blue-900 print:text-black tracking-tighter leading-none">
                        COSTA<br/>CAMARGO
                        </h1>
                    </div>
                )}
                {empresa === "NSA" && (
                    <div className="text-center">
                        <h1 className="text-4xl font-black italic text-green-700 print:text-black tracking-tighter">
                        NSA
                        </h1>
                        <p className="text-[9px] font-bold text-slate-400 print:text-black -mt-1 tracking-wider">DISTRIBUIDORA</p>
                    </div>
                )}
                </div>
            </div>
        </div>

        <hr className="border-slate-100 print:border-black mb-5" />

        {/* PARTE 3: ÁREA INFERIOR (TRACKING + DETALHES TÉCNICOS) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* COLUNA 1: RASTREAMENTO DE DATAS (Ocupa 5 colunas) */}
            <div className="xl:col-span-5 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ListOrdered size={12} className="print:text-black"/> Etapas do Processo
                </h4>
                
                {/* Linha Cadastro */}
                <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-3 text-[10px] font-bold text-slate-600 print:text-black uppercase text-right">Cadastro:</label>
                    <input 
                        type="text" placeholder="OBSERVAÇÃO" 
                        className="col-span-5 text-xs border-b border-slate-200 print:border-black focus:border-blue-500 bg-transparent py-0.5 outline-none text-slate-600 print:text-black uppercase"
                        value={headerData.cadastro} onChange={(e) => updateHeader("cadastro", e.target.value)}
                    />
                    <input 
                        type="text" placeholder="DATA" 
                        className="col-span-4 text-xs font-mono bg-slate-50 border border-slate-100 print:border-black rounded px-2 py-0.5 text-slate-600 print:text-black text-center"
                        value={headerData.dataCadastro || ''} onChange={(e) => updateHeader("dataCadastro", e.target.value)}
                    />
                </div>

                {/* Linha Conferência */}
                <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-3 text-[10px] font-bold text-slate-600 print:text-black uppercase text-right">Conferência:</label>
                    <input 
                        type="text" placeholder="STATUS" 
                        className="col-span-5 text-xs border-b border-slate-200 print:border-black focus:border-blue-500 bg-transparent py-0.5 outline-none text-slate-600 print:text-black uppercase"
                        value={headerData.conferencia} onChange={(e) => updateHeader("conferencia", e.target.value)}
                    />
                    <input 
                        type="text" placeholder="DATA" 
                        className="col-span-4 text-xs font-mono bg-slate-50 border border-slate-100 print:border-black rounded px-2 py-0.5 text-slate-600 print:text-black text-center"
                        value={headerData.dataConferencia || ''} onChange={(e) => updateHeader("dataConferencia", e.target.value)}
                    />
                </div>

                {/* Linha Disputa */}
                <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-3 text-[10px] font-bold text-slate-600 print:text-black uppercase text-right">Disputa:</label>
                    <input 
                        type="text" placeholder="RESULTADO" 
                        className="col-span-5 text-xs border-b border-slate-200 print:border-black focus:border-blue-500 bg-transparent py-0.5 outline-none text-slate-600 print:text-black uppercase"
                        value={headerData.disputa} onChange={(e) => updateHeader("disputa", e.target.value)}
                    />
                    <input 
                        type="text" placeholder="DATA" 
                        className="col-span-4 text-xs font-mono bg-slate-50 border border-slate-100 print:border-black rounded px-2 py-0.5 text-slate-600 print:text-black text-center"
                        value={headerData.dataDisputa || ''} onChange={(e) => updateHeader("dataDisputa", e.target.value)}
                    />
                </div>

                {/* Linha Proposta Reajustada */}
                <div className="grid grid-cols-12 items-center gap-2">
                    <label className="col-span-3 text-[10px] font-bold text-slate-600 print:text-black uppercase text-right">Reajustada:</label>
                    <input 
                        type="text" placeholder="DETALHES" 
                        className="col-span-5 text-xs border-b border-slate-200 print:border-black focus:border-blue-500 bg-transparent py-0.5 outline-none text-slate-600 print:text-black uppercase"
                        value={headerData.proposta} onChange={(e) => updateHeader("proposta", e.target.value)}
                    />
                    <input 
                        type="text" placeholder="DATA" 
                        className="col-span-4 text-xs font-mono bg-slate-50 border border-slate-100 print:border-black rounded px-2 py-0.5 text-slate-600 print:text-black text-center"
                        value={headerData.dataPropostaReajustada || ''} onChange={(e) => updateHeader("dataPropostaReajustada", e.target.value)}
                    />
                </div>
            </div>

            {/* COLUNA 2: REGRAS TÉCNICAS ("BOX AMARELO" ADAPTADO) (Ocupa 7 colunas) */}
            <div className="xl:col-span-7 bg-amber-50/60 rounded-xl border border-amber-100 print:border-black p-3 relative">
                <span className="absolute top-0 right-0 bg-amber-100 text-[9px] font-bold text-amber-700 print:text-black px-2 py-0.5 rounded-bl-lg rounded-tr-lg">REGRAS DO PREGÃO</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-1">
                    
                    {/* Seção de Envio */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 print:text-black uppercase flex items-center gap-1">
                            <Send size={10} className="print:text-black" /> Local de Envio
                        </label>
                        <div className="flex gap-2 text-xs">
                           {['PORTAL', 'EMAIL', 'FISICO'].map((tipo) => (
                               <label key={tipo} className="flex items-center gap-1 cursor-pointer hover:bg-amber-100/50 px-1 rounded transition">
                                   <input 
                                     type="radio" 
                                     name="localEnvio"
                                     className="accent-amber-500 w-3 h-3"
                                     checked={headerData.localEnvio === tipo}
                                     onChange={() => updateHeader("localEnvio", tipo)}
                                   />
                                   <span className="font-semibold text-slate-700 print:text-black">{tipo}</span>
                               </label>
                           ))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 print:text-black">PRAZO:</span>
                            <input 
                                type="text" 
                                placeholder="--/--/----" 
                                className="flex-1 bg-white border border-amber-200 print:border-black rounded px-2 py-0.5 text-xs text-slate-700 print:text-black focus:border-amber-400 outline-none font-mono"
                                value={headerData.prazoEnvio || ''}
                                onChange={(e) => updateHeader("prazoEnvio", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Seção de Regras de Valor */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase block mb-0.5">Corta Estimado?</label>
                            <select 
                                className="w-full bg-white border border-amber-200 print:border-black rounded px-1 py-1 text-xs font-bold text-slate-700 print:text-black outline-none"
                                value={headerData.cortaNoEstimado || 'NAO'}
                                onChange={(e) => updateHeader("cortaNoEstimado", e.target.value)}
                            >
                                <option value="NAO">NÃO</option>
                                <option value="SIM">SIM</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase block mb-0.5">Disputa Por valor</label>
                            <select 
                                className="w-full bg-white border border-amber-200 print:border-black rounded px-1 py-1 text-xs font-bold text-slate-700 print:text-black outline-none"
                                value={headerData.disputaPorValor || 'UNITARIO'}
                                onChange={(e) => updateHeader("disputaPorValor", e.target.value)}
                            >
                                <option value="UNITARIO">UNITÁRIO</option>
                                <option value="GLOBAL">GLOBAL</option>
                                <option value="LOTE">LOTE</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase block mb-0.5">Casas Decimais</label>
                            <div className="relative">
                                <DollarSign size={10} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 print:hidden"/>
                                <input 
                                    type="number" 
                                    className="w-full pl-5 bg-white border border-amber-200 rounded px-1 py-1 text-xs font-bold text-slate-700 print:text-black outline-none pr-14"
                                    value={headerData.casasDecimais || '2'}
                                    onChange={(e) => updateHeader("casasDecimais", e.target.value)}
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 print:text-black pointer-events-none">CASAS</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-slate-400 print:text-black uppercase block mb-0.5">Amostra?</label>
                            <div className={`flex items-center justify-between border rounded px-2 py-1 cursor-pointer transition-colors ${headerData.amostra === 'SIM' ? 'bg-red-50 border-red-200 print:border-black' : 'bg-white border-amber-200 print:border-black'}`}
                                 onClick={() => updateHeader("amostra", headerData.amostra === 'SIM' ? 'NAO' : 'SIM')}
                            >
                                <span className={`text-xs font-bold ${headerData.amostra === 'SIM' ? 'text-red-600 print:text-black' : 'text-slate-500 print:text-black'}`}>
                                    {headerData.amostra === 'SIM' ? 'SIM' : 'NÃO'}
                                </span>
                                <Microscope size={12} className={`${headerData.amostra === 'SIM' ? 'text-red-500' : 'text-slate-300'} print:text-black`}/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* PARTE 4: OBSERVAÇÕES (RODAPÉ) */}
        <div className="mt-4 pt-3 border-t border-slate-100 print:border-black">
            <label className="text-[10px] font-bold text-slate-400 print:text-black uppercase mb-1 flex items-center gap-2">
                <AlertCircle size={12} className="print:text-black" /> Observações
            </label>
            <textarea 
                className="w-full bg-slate-50 border border-slate-200 print:border-black rounded-lg p-3 text-xs text-slate-700 print:text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 min-h-[60px] resize-y placeholder:text-slate-300"
                placeholder="Campo de observações..."
                value={headerData.observacoes || ''}
                onChange={(e) => updateHeader("observacoes", e.target.value)}
            />
        </div>

      </div>

      {/* MODAL DE NOVO ÓRGÃO (MANTIDO IGUAL) */}
      {showModalOrgao && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 print:hidden">
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
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm font-semibold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase"
                  placeholder="EX: PREFEITURA DE VILA VELHA"
                  value={novoOrgaoNome}
                  onChange={(e) => setNovoOrgaoNome(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID / UASG</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500" placeholder="Opcional" value={novoOrgaoUasg} onChange={(e) => setNovoOrgaoUasg(e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portal Padrão</label>
                    <input list="modal-portais-list" type="text" className="w-full p-3 border border-slate-200 rounded-lg text-sm text-black outline-none focus:border-blue-500 uppercase" placeholder="Opcional" value={novoOrgaoPortal} onChange={(e) => setNovoOrgaoPortal(e.target.value)} />
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