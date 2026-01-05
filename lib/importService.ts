// lib/importService.ts
import * as XLSX from 'xlsx';
import { Resultado, Orgao, Produto } from './types';

const orgaoHeaderMapping: { [key: string]: keyof Orgao } = {
  'NOME DO ÓRGÃO': 'nome',
  'ÓRGÃO': 'nome',
  'NOME': 'nome',
  'UASG': 'uasg',
  'PORTAL': 'portal',
};

export const importOrgaosFromExcel = (file: File): Promise<Orgao[]> => {
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
        const mappedHeaders: (keyof Orgao | null)[] = headerRow.map((h: string) => orgaoHeaderMapping[h.toUpperCase()] || null);
        
        const importedOrgaos: Orgao[] = [];

        for (let i = 1; i < json.length; i++) {
          const rowData = json[i];
          if (!rowData || rowData.length === 0 || !rowData[0]) {
            continue; // Skip empty rows
          }

          const newOrgao: Partial<Orgao> = {};

          mappedHeaders.forEach((key, index) => {
            if (key) {
              const value = rowData[index];
              (newOrgao as any)[key] = value !== undefined && value !== null ? String(value) : '';
            }
          });

          // Fallback if headers are not found, assume order: NOME, UASG, PORTAL
          if (mappedHeaders.every(h => h === null)) {
            newOrgao.nome = String(rowData[0] || '');
            newOrgao.uasg = String(rowData[1] || '');
            newOrgao.portal = String(rowData[2] || '');
          }
          
          if (newOrgao.nome) { // Only add if it has a name
            importedOrgaos.push({
              nome: newOrgao.nome || '',
              uasg: newOrgao.uasg || '',
              portal: newOrgao.portal || '',
            });
          }
        }

        resolve(importedOrgaos);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const produtoHeaderMapping: { [key: string]: keyof Produto } = {
  'FABRICANTE': 'fabricante',
  'DESCRIÇÃO': 'descricao',
  'DESCRICAO': 'descricao',
  'UNIDADE': 'unidade',
  'VALOR INICIAL': 'valorInicial',
  'CODEURO': 'codeuro',
  'APRESENTAÇÃO SUGERIDA': 'apresentacaoSugerida',
  'APRESENTACAO SUGERIDA': 'apresentacaoSugerida',
  'OBS': 'obs',
  'CAP 21,53%': 'cap',
  'CONV. 87/02': 'conv8702',
  'CONV. 162/94': 'conv16294',
  'CONV. 140/01': 'conv14001',
};

export const importProdutosFromExcel = (file: File): Promise<Produto[]> => {
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
        const mappedHeaders: (keyof Produto | null)[] = headerRow.map((h: string) => produtoHeaderMapping[String(h).toUpperCase()] || null);

        const importedProdutos: Produto[] = [];
        const parseBool = (value: any): boolean => {
          if (value === undefined || value === null) return false;
          const normalized = String(value).trim().toUpperCase();
          return normalized === 'SIM' || normalized === 'S' || normalized === '1' || normalized === 'TRUE';
        };

        for (let i = 1; i < json.length; i++) {
          const rowData = json[i];
          if (!rowData || rowData.length === 0) {
            continue;
          }

          const newProduto: Partial<Produto> = {
            id: `${Date.now()}-${i}`,
            obs: '',
            cap: false,
            conv8702: false,
            conv16294: false,
            conv14001: false,
          };

          mappedHeaders.forEach((key, index) => {
            if (key) {
              const value = rowData[index];
              if (key === 'cap' || key === 'conv8702' || key === 'conv16294' || key === 'conv14001') {
                (newProduto as any)[key] = parseBool(value);
              } else {
                (newProduto as any)[key] = value !== undefined && value !== null ? String(value) : '';
              }
            }
          });

          if (mappedHeaders.every(h => h === null)) {
            newProduto.fabricante = String(rowData[0] || '');
            newProduto.descricao = String(rowData[1] || '');
            newProduto.unidade = String(rowData[2] || '');
            newProduto.valorInicial = String(rowData[3] || '');
            newProduto.codeuro = String(rowData[4] || '');
            newProduto.apresentacaoSugerida = String(rowData[5] || '');
            newProduto.obs = String(rowData[6] || '');
            newProduto.cap = parseBool(rowData[7]);
            newProduto.conv8702 = parseBool(rowData[8]);
            newProduto.conv16294 = parseBool(rowData[9]);
            newProduto.conv14001 = parseBool(rowData[10]);
          }

          if (
            newProduto.fabricante ||
            newProduto.descricao ||
            newProduto.unidade ||
            newProduto.valorInicial ||
            newProduto.codeuro ||
            newProduto.apresentacaoSugerida
          ) {
            importedProdutos.push({
              id: newProduto.id || `${Date.now()}-${i}`,
              fabricante: newProduto.fabricante || '',
              descricao: newProduto.descricao || '',
              unidade: newProduto.unidade || '',
              valorInicial: newProduto.valorInicial || '',
              codeuro: newProduto.codeuro || '',
              apresentacaoSugerida: newProduto.apresentacaoSugerida || '',
              obs: newProduto.obs || '',
              cap: Boolean(newProduto.cap),
              conv8702: Boolean(newProduto.conv8702),
              conv16294: Boolean(newProduto.conv16294),
              conv14001: Boolean(newProduto.conv14001),
            });
          }
        }

        resolve(importedProdutos);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const headerMapping: { [key: string]: keyof Resultado } = {
  'EMPRESA': 'empresa',
  'PRODUTO': 'produto',
  'WEB / COTAÇÃO': 'webCotacao',
  'WEB/COTAÇÃO': 'webCotacao',
  'WEB OU COTAÇÃO': 'webCotacao',
  'QTD.': 'quantidade',
  'MÍNIMO / COTAÇÃO (R$)': 'minimoCotacao',
  'MÍNIMO/COTAÇÃO (R$)': 'minimoCotacao',
  'MÍNIMO OU COTAÇÃO (R$)': 'minimoCotacao',
  'NOSSO PREÇO (R$)': 'nossoPreco',
  'PREÇO CONCORRENTE (R$)': 'precoConcorrente',
  'CONCORRENTE': 'concorrente',
  'MARCA': 'marca',
  'ÓRGÃO': 'orgao',
  'UF': 'uf',
  'PREGÃO': 'pregao',
  'DATA': 'data',
  'OBSERVAÇÕES': 'observacoes',
  'STATUS': 'status',
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
                  (newResultado as any)[key] = isNaN(parsed) ? '' : parsed;
                }
              } else if (key === 'data') {
                (newResultado as any)[key] = parseDate(value);
              } else if (key === 'status') {
                const lowerCaseValue = String(value).toLowerCase();
                if (lowerCaseValue === 'ganho' || lowerCaseValue === 'perdido' || lowerCaseValue === 'neutro') {
                    newResultado.status = lowerCaseValue as 'ganho' | 'perdido' | 'neutro';
                }
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

interface GradeImportItem {
  numeroItem?: number;
  medicamento: string;
  marca?: string;
  quantidade?: number;
}

const gradeHeaderMapping: { [key: string]: keyof GradeImportItem } = {
  'ITEM': 'numeroItem',
  'MEDICAMENTO': 'medicamento',
  'MARCA': 'marca',
  'QUANTIDADE': 'quantidade',
  'QTD': 'quantidade',
  'QTD.': 'quantidade',
};

export const importGradeItensFromExcel = (file: File): Promise<GradeImportItem[]> => {
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
        const mappedHeaders: (keyof GradeImportItem | null)[] = headerRow.map((h: string) => gradeHeaderMapping[String(h).toUpperCase()] || null);
        
        const importedItens: GradeImportItem[] = [];

        const parseNumber = (value: any): number | undefined => {
          if (value === undefined || value === null || value === '') return undefined;
          if (typeof value === 'number') return value;
          const normalized = String(value).replace(/\./g, '').replace(',', '.');
          const parsed = parseFloat(normalized);
          return Number.isNaN(parsed) ? undefined : parsed;
        };

        for (let i = 1; i < json.length; i++) {
          const rowData = json[i];
          if (!rowData || rowData.length === 0) {
            continue;
          }

          const newItem: Partial<GradeImportItem> = {};

          mappedHeaders.forEach((key, index) => {
            if (!key) return;
            const value = rowData[index];
            if (key === 'numeroItem' || key === 'quantidade') {
              (newItem as any)[key] = parseNumber(value);
            } else {
              (newItem as any)[key] = value !== undefined && value !== null ? String(value) : '';
            }
          });

          if (mappedHeaders.every(h => h === null)) {
            newItem.numeroItem = parseNumber(rowData[0]);
            newItem.medicamento = rowData[1] ? String(rowData[1]) : '';
            newItem.marca = rowData[2] ? String(rowData[2]) : '';
            newItem.quantidade = parseNumber(rowData[3]);
          }

          if (newItem.medicamento) {
            importedItens.push({
              numeroItem: newItem.numeroItem,
              medicamento: newItem.medicamento,
              marca: newItem.marca || '',
              quantidade: newItem.quantidade,
            });
          }
        }

        resolve(importedItens);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
