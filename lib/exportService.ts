// lib/exportService.ts
import * as XLSX from 'xlsx';
import { ItemGrade, HeaderData, Resultado, Orgao } from './types';

export const exportOrgaosToExcel = (orgaos: Orgao[]) => {
    // 1. Map data to desired column headers
    const dataToExport = orgaos.map(o => ({
        "NOME DO ÓRGÃO": o.nome,
        "UASG": o.uasg,
        "PORTAL": o.portal,
    }));

    // 2. Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Auto-fit columns
    const objectMaxLength: any[] = [];
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for(let C = range.s.c; C <= range.e.c; ++C) {
        let max = 0;
        const headerCell = ws[XLSX.utils.encode_cell({c:C, r:0})];
        const header = headerCell ? headerCell.v : ""; // Get header
        max = header.length; // Start with header length

        for(let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if(ws[cell_ref] && ws[cell_ref].v) {
                const length = ws[cell_ref].v.toString().length;
                if(length > max) {
                    max = length;
                }
            }
        }
        objectMaxLength.push({wch: max + 2}); // +2 for padding
    }
    ws['!cols'] = objectMaxLength;

    // 4. Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Órgãos");

    // 5. Trigger download
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `ORGAOS-${today}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
// ... (rest of the file)
export const exportResultadosToExcel = (resultados: Resultado[]) => {
    // 1. Map data to desired column headers and format
    const dataToExport = resultados.map(r => ({
        "EMPRESA": r.empresa,
        "PRODUTO": r.produto,
        "WEB OU COTAÇÃO": r.webCotacao,
        "QTD.": r.quantidade,
        "MÍNIMO OU COTAÇÃO (R$)": r.minimoCotacao,
        "NOSSO PREÇO (R$)": r.nossoPreco,
        "PREÇO CONCORRENTE (R$)": r.precoConcorrente,
        "CONCORRENTE": r.concorrente,
        "MARCA": r.marca,
        "ÓRGÃO": r.orgao,
        "PREGÃO": r.pregao,
        "DATA": new Date(r.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        "OBSERVAÇÕES": r.observacoes,
        "STATUS": r.status,
    }));

    // 2. Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Auto-fit columns
    const objectMaxLength: any[] = [];
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for(let C = range.s.c; C <= range.e.c; ++C) {
        let max = 0;
        const header = ws[XLSX.utils.encode_cell({c:C, r:0})].v; // Get header
        max = header.length; // Start with header length

        for(let R = range.s.r + 1; R <= range.e.r; ++R) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if(ws[cell_ref] && ws[cell_ref].v) {
                const length = ws[cell_ref].v.toString().length;
                if(length > max) {
                    max = length;
                }
            }
        }
        objectMaxLength.push({wch: max + 2}); // +2 for padding
    }
    ws['!cols'] = objectMaxLength;

    // 4. Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");

    // 5. Trigger download
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `RESULTADOS-${today}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

import { processarItem } from './processor';

// Helper to safely get the manufacturer from the item description
const getFabricante = (medicamento: string): string => {
    if (!medicamento) return "";
    const result = processarItem(medicamento);
    return result?.fabricanteEncontrado || "";
};

export const exportToExcel = (headerData: HeaderData, itens: ItemGrade[]) => {
    // 1. Generate RESUMO data
    const resumoData = itens
        .filter(item => item.medicamento) // Only include items with a name
        .map(item => {
            const posHifen = item.medicamento.indexOf(" - ");
            const nomeProduto = posHifen > 0 ? item.medicamento.substring(0, posHifen).trim() : item.medicamento.trim();
            const quantidade = item.quantidade.toLocaleString('pt-BR');
            return {
                "ITENS PARA PREGÃO": `${nomeProduto} - ${quantidade} UND`
            };
        });

    // 2. Generate CAD data
    const cadData = itens
        .filter(item => item.medicamento || item.marca || item.valorEstimado)
        .map(item => ({
            "NUMERO DO ITEM": item.numeroItem,
            "FABRICANTE": getFabricante(item.medicamento),
            "MARCA": item.marca,
            // Format value as a string to preserve decimals, as in VBA
            "VALOR": item.valorEstimado.toFixed(4).replace('.', ',')
        }));
    
    // 3. Create worksheets
    const wsResumo = XLSX.utils.json_to_sheet(resumoData);
    const wsCAD = XLSX.utils.json_to_sheet(cadData);

    // Auto-fit columns
    const fitCols = (ws: XLSX.WorkSheet) => {
        const objectMaxLength: any[] = [];
        const range = XLSX.utils.decode_range(ws['!ref']!);
        for(let C = range.s.c; C <= range.e.c; ++C) {
            let max = 0;
            for(let R = range.s.r; R <= range.e.r; ++R) {
                const cell_address = {c:C, r:R};
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if(ws[cell_ref]) {
                    const length = ws[cell_ref].v.toString().length;
                    if(length > max) {
                        max = length;
                    }
                }
            }
            objectMaxLength.push({wch: max + 2}); // +2 for a little padding
        }
        ws['!cols'] = objectMaxLength;
    };
    
    fitCols(wsResumo);
    fitCols(wsCAD);

    // Set CAD "VALOR" column as Text format
    const cadRange = XLSX.utils.decode_range(wsCAD['!ref']!);
    for (let R = cadRange.s.r + 1; R <= cadRange.e.r; ++R) { // Start from row 2 (index 1)
        const cellRef = XLSX.utils.encode_cell({ r: R, c: 3 }); // Column D is index 3
        if (wsCAD[cellRef]) {
            wsCAD[cellRef].t = 's'; // 's' for string type
        }
    }


    // 4. Create workbook and append sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsResumo, "RESUMO");
    XLSX.utils.book_append_sheet(wb, wsCAD, "CAD");

    // 5. Trigger download
    const editalFileName = headerData.edital.replace(/[\W_]+/g,"-") || "pregao";
    const orgaoFileName = headerData.orgao.split('/')[0].trim() || "orgao";
    const fileName = `GRADE-${editalFileName}-${orgaoFileName}.xlsx`;

    XLSX.writeFile(wb, fileName);
};
