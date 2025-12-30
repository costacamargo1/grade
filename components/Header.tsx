// components/Header.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Building2, Calendar, Search, Globe, Gavel, FileText, Hash, Plus, X, Save, Clock } from "lucide-react";
import { logoMap, LISTA_PORTAIS, LISTA_MODOS, Orgao } from "../lib/data";
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
  
  // --- CALENDAR LOGIC ---
  const toggleCalendar = () => {
    // Parse date from input to set calendar correctly
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md relative z-20">
        <div className="flex flex-col xl:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-2 group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Edital</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="0000/202X" 
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
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Busque pelo nome ou abreviação" 
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 uppercase"
                      value={headerData.orgao}
                      onChange={(e) => updateHeader("orgao", e.target.value)}
                      onBlur={handleOrgaoBlur}
                    />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
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
                <div className="relative" ref={calendarRef}>
                  <input 
                    type="text" 
                    placeholder="Use atalhos (H, A, T+dias)" 
                    className="w-full pl-4 pr-8 py-2.5 bg-yellow-50/50 border border-yellow-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder:text-slate-400 uppercase"
                    value={headerData.dataAbertura}
                    onChange={(e) => updateHeader("dataAbertura", e.target.value)}
                    onBlur={handleBlurData}
                  />
                   <button type="button" onClick={toggleCalendar} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700">
                    <Calendar size={16} />
                  </button>
                  {showCalendar && (
                     <div className="absolute top-full right-0 mt-2 z-30 flex flex-col gap-2">
                       <CalendarComponent 
                          currentDate={calendarDate}
                          setCurrentDate={setCalendarDate}
                          onDateSelect={handleDateSelect}
                       />
                       <div className="p-2 bg-white rounded-lg shadow-lg border flex items-center justify-center gap-2">
                          <Clock size={16} className="text-slate-400"/>
                          <span className="text-sm font-bold text-slate-500">Hora:</span>
                          <input type="text" inputMode="numeric" maxLength={2} value={time.hour} onChange={e => handleTimeChange('hour', e.target.value)} onBlur={() => handleTimeBlur('hour')} className="w-12 p-1 text-center border rounded-md font-medium text-slate-700"/>
                          <span className="font-bold">:</span>
                          <input type="text" inputMode="numeric" maxLength={2} value={time.minute} onChange={e => handleTimeChange('minute', e.target.value)} onBlur={() => handleTimeBlur('minute')} className="w-12 p-1 text-center border rounded-md font-medium text-slate-700"/>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 border-dashed">
              
              <div className="relative group md:max-w-[180px]">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Portal</label>
                 <div className="flex items-center">
                    <Globe size={14} className="absolute left-0 text-slate-300" />
                    <input 
                      list="portais-list"
                      type="text" 
                      placeholder="" 
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

              <div className="relative group md:max-w-[180px]">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ID / UASG</label>
                 <div className="flex items-center">
                    <Hash size={14} className="absolute left-0 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Busca órgão por UASG" 
                      className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal" 
                      value={headerData.uasgInput}
                      onChange={handleUasgChange}
                    />
                 </div>
              </div>

              <div className="relative group md:max-w-[180px]">
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

              <div className="relative group md:max-w-[180px]">
                <DropdownModoDisputa 
                  value={headerData.modoDisputa}
                  onChange={(value) => updateHeader("modoDisputa", value)}
                  onBlur={handleModoDisputaBlur}
                />
              </div>
              
              <div className="relative group md:max-w-[180px]">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">WEB / COTAÇÃO</label>
                 <input
                   type="text"
                   placeholder="Número da web ou cotação"
                   className="w-full py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                   value={headerData.webCotacao}
                   onChange={(e) => updateHeader("webCotacao", e.target.value)}
                 />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cadastro</label>
                 <input
                  type="text"
                  className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                  value={headerData.cadastro}
                  onChange={(e) => updateHeader("cadastro", e.target.value)}
                 />
              </div>

              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Conferência</label>
                 <input
                  type="text"
                  className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                  value={headerData.conferencia}
                  onChange={(e) => updateHeader("conferencia", e.target.value)}
                 />
              </div>

              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Disputa</label>
                 <input
                  type="text"
                  className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                  value={headerData.disputa}
                  onChange={(e) => updateHeader("disputa", e.target.value)}
                 />
              </div>

              <div className="relative group">
                 <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Proposta</label>
                 <input
                  type="text"
                  className="w-full pl-5 py-1 bg-transparent border-b border-slate-200 focus:border-blue-500 text-xs font-bold text-slate-600 focus:outline-none placeholder:font-normal uppercase"
                  value={headerData.proposta}
                  onChange={(e) => updateHeader("proposta", e.target.value)}
                 />
              </div>
            </div>
          </div>

          <div className="w-full xl:w-64 flex flex-col items-center justify-between border-t xl:border-t-0 xl:border-l border-slate-100 pl-0 xl:pl-8 pt-6 xl:pt-0 relative">


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
