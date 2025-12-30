// lib/importService.ts
import * as XLSX from 'xlsx';
import { Resultado } from './types';

const headerMapping: { [key: string]: keyof Resultado } = {
  'EMPRESA': 'empresa',
  'PRODUTO': 'produto',
  'WEB / COTAÇÃO': 'webCotacao',
  'QTD.': 'quantidade',
  'MÍNIMO / COTAÇÃO (R$)': 'minimoCotacao',
  'NOSSO PREÇO (R$)': 'nossoPreco',
  'PREÇO CONCORRENTE (R$)': 'precoConcorrente',
  'CONCORRENTE': 'concorrente',
  'MARCA': 'marca',
  'ÓRGÃO': 'orgao',
  'UF': 'uf',
  'PREGÃO': 'pregao',
  'DATA': 'data',
};

const parseDate = (excelDate: any): string => {
    if (typeof excelDate === 'number') {
        const date = XLSX.SSF.parse_date_code(excelDate);
        return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
    }
    if (typeof excelDate === 'string') {
        // try to parse strings like DD/MM/YYYY
        const parts = excelDate.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month - 1, day).toISOString().split('T')[0];
            }
        }
        // if it's already in YYYY-MM-DD, just return it
        if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
            return excelDate;
        }
    }
    // fallback to today if unparseable
    return new Date().toISOString().split('T')[0];
};

export const importResultadosFromExcel = (file: File): Promise<Resultado[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("File data is empty."));
          return;
        }
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length < 2) {
            resolve([]);
            return;
        }

        const headerRow = json[0];
        const mappedHeaders: (keyof Resultado | null)[] = headerRow.map((h: string) => headerMapping[h.toUpperCase()] || null);
        
        const importedResultados: Resultado[] = [];

        for (let i = 1; i < json.length; i++) {
          const rowData = json[i];
          const newResultado: Partial<Resultado> = {
            id: Date.now().toString() + i,
            status: 'neutro',
          };

          mappedHeaders.forEach((key, index) => {
            if (key) {
              let value = rowData[index];
              if (key === 'nossoPreco' || key === 'precoConcorrente' || key === 'quantidade' || key === 'minimoCotacao') {
                if (value === undefined || value === null || value === '') {
                  (newResultado as any)[key] = '';
                } else {
                  const sanitizedValue = typeof value === 'string' ? value.replace(',', '.') : String(value);
                  const parsed = parseFloat(sanitizedValue);
                  (newResultado as any)[key] = isNaN(parsed) ? value : parsed;
                }
              } else if (key === 'data') {
                (newResultado as any)[key] = parseDate(value);
              } else {
                (newResultado as any)[key] = value !== undefined ? value : '';
              }
            }
          });
          
          importedResultados.push(newResultado as Resultado);
        }

        resolve(importedResultados);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
