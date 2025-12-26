// lib/processor.ts

import { portalMap, fabricantes, abreviacoes, bancoApresentacoes, MODO_DISPUTA_MAP, LISTA_MODOS } from './data';

// --- PORTAL PROCESSING ---
export function processarPortal(valor: string): string {
    const textoLimpo = valor.toUpperCase().trim().replace("PORTAL:", "").trim();
    return portalMap.get(textoLimpo) || textoLimpo;
}

/**
 * Resolves a shortcut or text to a canonical "Modo de Disputa" value.
 * @param valor The user input string.
 * @returns The canonical mode string (e.g., "Normal", "Aberto") or the original value if not found.
 */
export function resolverModoDisputa(valor: string): string {
    const textoLimpo = valor.toUpperCase().trim();

    // Check if it's a known shortcut
    if (MODO_DISPUTA_MAP.has(textoLimpo)) {
        return MODO_DISPUTA_MAP.get(textoLimpo)!;
    }
    
    // Check if it's already a valid full mode name
    const modoEncontrado = LISTA_MODOS.find(m => m.toUpperCase() === textoLimpo);
    if (modoEncontrado) {
        return modoEncontrado;
    }

    // Return original value if no match
    return valor;
}


// --- MODO DISPUTA PROCESSING ---
export function processarModoDisputa(valor: string): string {
    const textoLimpo = valor.toUpperCase().trim();
    const checkboxes = {
        normal: "(   ) NORMAL",
        aberto: "(   ) ABERTO",
        abertoFechado: "(   ) ABERTO E FECHADO",
    };

    switch (textoLimpo) {
        case "N":
            return checkboxes.normal.replace("(   )", "( X )");
        case "A":
            return checkboxes.aberto.replace("(   )", "( X )");
        case "AF":
            return checkboxes.abertoFechado.replace("(   )", "( X )");
        case "FA":
            return "( X ) FECHADO/ABERTO";
        default:
            // If the user types something custom, or it's already formatted
            if (valor.includes("( X )") || valor.length > 5) {
                return valor;
            }
            return `${checkboxes.normal}         ${checkboxes.aberto}               ${checkboxes.abertoFechado}`;
    }
}

// --- AÇÃO JUDICIAL PROCESSING ---
export function processarAcaoJudicial(valor: string): string {
    const textoLimpo = valor.toUpperCase().trim().replace("AÇÃO JUDICIAL:", "").trim();
    switch (textoLimpo) {
        case "S":
            return "SIM";
        case "N":
            return "NÃO";
        case "P":
            return "PARCIAL";
        default:
            return textoLimpo;
    }
}


// --- ITEM (PRODUTO) PROCESSING ---

interface ResultadoProcessamentoItem {
    textoFinal: string;
    fabricanteEncontrado: string;
    boldRanges: { start: number, length: number }[];
}

const todosOsFabricantes = new Set([...fabricantes, ...Array.from(abreviacoes.values())].map(f => f.toUpperCase()));

export function processarItem(textoOriginal: string): ResultadoProcessamentoItem | null {
    if (!textoOriginal || textoOriginal.trim() === "") return null;

    let texto = textoOriginal.trim().toUpperCase();

    // 1. Replace abbreviations
    for (const [abbr, fab] of abreviacoes.entries()) {
        const regex = new RegExp(`${abbr}`, 'g');
        texto = texto.replace(regex, fab);
    }
    
    // Special case for ACHÉ
    texto = texto.replace(/\bACHE\b/g, "ACHÉ");

    // 2. Find the first manufacturer in the string
    let posPrimeiroFab = -1;
    let fabEncontrado = "";

    for (const fab of todosOsFabricantes) {
        const currentPos = texto.indexOf(fab);
        if (currentPos !== -1 && (posPrimeiroFab === -1 || currentPos < posPrimeiroFab)) {
            posPrimeiroFab = currentPos;
            fabEncontrado = fab;
        }
    }

    // 3. Format with " - " separator
    let textoFinal: string;
    if (posPrimeiroFab !== -1) {
        let parteProduto = texto.substring(0, posPrimeiroFab).replace(/[- ]+$/, "");
        const parteFab = texto.substring(posPrimeiroFab);
        textoFinal = `${parteProduto} - ${parteFab}`;
    } else {
        textoFinal = texto;
    }

    // 4. Identify ranges to be bold
    const boldRanges: { start: number, length: number }[] = [];
    for (const fab of todosOsFabricantes) {
        let startIndex = 0;
        while (startIndex < textoFinal.length) {
            const pos = textoFinal.indexOf(fab, startIndex);
            if (pos === -1) break;

            // Check for whole word match
            const charAntes = pos > 0 ? textoFinal[pos - 1] : " ";
            const charDepois = pos + fab.length < textoFinal.length ? textoFinal[pos + fab.length] : " ";
            const nonWordChars = " ,.;:-()[]{}?/\\";

            if (nonWordChars.includes(charAntes) && nonWordChars.includes(charDepois)) {
                boldRanges.push({ start: pos, length: fab.length });
            }
            startIndex = pos + fab.length;
        }
    }

    return {
        textoFinal,
        fabricanteEncontrado: fabEncontrado,
        boldRanges
    };
}


/**
 * Finds a product by its code in the 'Apresentações' mock database.
 */
export function buscarProdutoPorCodigo(codigo: string) {
    if (!codigo || !/^\\d+$/.test(codigo)) {
        return null;
    }
    const produto = bancoApresentacoes.find(p => p.codigo === codigo);
    if (!produto) {
        return null;
    }

    // Extract brand from 'descCompleta'
    let marca = "N/A";
    const match = produto.descCompleta.match(/MARCA:\s*([^\/]+)/i);
    if (match && match[1]) {
        marca = match[1].trim();
    }

    return {
        nomeProduto: produto.nomeProduto,
        valor: produto.descricao,
        marca: marca,
    };
}