// components/GradeForm.tsx
'use client';

import { useState } from 'react';
import { Orgao, logoMap } from '../lib/data';
import { formatarEdital, formatarDataInteligente } from '../lib/formatters';
import { buscarOrgao, buscarOrgaoPorUasg } from '../lib/orgaoService';
import { processarPortal, processarModoDisputa, processarAcaoJudicial } from '../lib/processor';

// Helper component for styled input fields
const InputField = ({ label, value, onChange, onBlur, prefix, statusColor = 'black' }: {
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
    prefix?: string,
    statusColor?: 'black' | 'red',
}) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500">
            {prefix && <span className={`font-bold pr-2`} style={{ color: statusColor }}>{prefix}</span>}
            <input
                type="text"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className="w-full py-1 focus:outline-none"
            />
        </div>
    </div>
);


export default function GradeForm() {
    // State for all the fields, similar to the Excel cells
    const [edital, setEdital] = useState('');
    const [orgao, setOrgao] = useState('');
    const [portal, setPortal] = useState('');
    const [uasg, setUasg] = useState('');
    const [abertura, setAbertura] = useState('');
    const [modoDisputa, setModoDisputa] = useState('');
    const [acaoJudicial, setAcaoJudicial] = useState('');
    const [logo, setLogo] = useState('');
    const [selectedLogo, setSelectedLogo] = useState('/vercel.svg');

    // Handlers that apply the business logic on blur (when user leaves the field)
    const handleEditalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const formatted = formatarEdital(e.target.value);
        setEdital(formatted);
    };

    const handleAberturaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const formatted = formatarDataInteligente(e.target.value);
        setAbertura(formatted);
    };
    
    const handleOrgaoBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const result = buscarOrgao(e.target.value);
        setOrgao(result.textoFinal);
        if (result.orgaoEncontrado) {
            setPortal(result.orgaoEncontrado.portal);
            setUasg(result.orgaoEncontrado.uasg);
        }
    };

    const handleUasgBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const orgaoEncontrado = buscarOrgaoPorUasg(e.target.value);
        if (orgaoEncontrado) {
            setOrgao(orgaoEncontrado.nome);
            setPortal(orgaoEncontrado.portal);
            setUasg(orgaoEncontrado.uasg);
        }
    };
    
    const handlePortalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace("PORTAL:", "").trim();
        const processed = processarPortal(rawValue);
        setPortal(processed);
    };

    const handleModoDisputaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const processed = processarModoDisputa(e.target.value);
        setModoDisputa(processed);
    };
    
    const handleAcaoJudicialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const processed = processarAcaoJudicial(e.target.value);
        setAcaoJudicial(processed);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value.toUpperCase();
        setLogo(key);
        if (logoMap.has(key)) {
            // In a real scenario, you'd have images like /logos/LogoNSA.png
            // For now, we'll just use placeholders.
            const logoName = logoMap.get(key);
            // This is a placeholder path.
            // You should have files like public/LogoCOSTA.svg, public/LogoNSA.svg etc.
            setSelectedLogo(`/${logoName}.svg`); 
        } else {
            setSelectedLogo('/window.svg'); // Default/error logo
        }
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-white shadow-lg rounded-lg max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">

                {/* Row 1 */}
                <div className="md:col-span-2">
                    <InputField label="Edital" value={edital} onChange={(e) => setEdital(e.target.value)} onBlur={handleEditalBlur} prefix="EDITAL:" statusColor={edital ? 'black' : 'red'} />
                </div>
                <div className="md:col-span-2">
                    <InputField label="Órgão" value={orgao} onChange={(e) => setOrgao(e.target.value)} onBlur={handleOrgaoBlur} prefix="ÓRGÃO:" statusColor={orgao ? 'black' : 'red'} />
                </div>

                {/* Row 2 */}
                <div className="md:col-span-2">
                     <InputField label="Portal" value={portal} onChange={(e) => setPortal(e.target.value)} onBlur={handlePortalChange} prefix="PORTAL:" statusColor={portal ? 'black' : 'red'} />
                </div>
                <div>
                     <InputField label="ID ou UASG" value={uasg} onChange={(e) => setUasg(e.target.value)} onBlur={handleUasgBlur} prefix="ID OU UASG:" />
                </div>
                 <div>
                    <InputField label="Ação Judicial" value={acaoJudicial} onChange={handleAcaoJudicialChange} prefix="AÇÃO JUDICIAL:" statusColor={acaoJudicial ? 'black' : 'red'} />
                </div>

                {/* Row 3 */}
                <div className="md:col-span-2">
                     <InputField label="Abertura" value={abertura} onChange={(e) => setAbertura(e.target.value)} onBlur={handleAberturaBlur} prefix="ABERTURA:" statusColor={abertura ? 'black' : 'red'} />
                </div>
                 <div className="md:col-span-2">
                    <InputField label="Modo de Disputa" value={modoDisputa} onChange={handleModoDisputaChange} />
                </div>


                {/* Logo Area */}
                <div className="md:col-span-4 grid grid-cols-3 gap-6 mt-4">
                    <div className="col-span-1">
                        <InputField label="Logo" value={logo} onChange={handleLogoChange} />
                         <p className="text-xs text-gray-400 mt-1">Digite NSA, COSTA, ou UNIQUE (ou iniciais/números)</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center bg-gray-100 rounded-md p-4">
                        <img src={selectedLogo} alt="Selected Logo" className="h-24 object-contain" />
                    </div>
                </div>
            </div>
        </div>
    );
}
