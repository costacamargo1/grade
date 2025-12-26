// lib/data.ts

// Data extracted from the VBA code and Excel sheets for the Grade de Licitação project.

/**
 * Corresponds to the 'fabricantes' array in the VBA code.
 * Includes a corrected entry for 'ACHÉ'.
 */
export const fabricantes: string[] = [
    "ABBOTT", "ABBVIE", "ABL", "ACCORD", "ACHÉ", "ADIUM", "AIRELA", "ALCON",
    "ALLERGAN", "ASPEN", "ASTELLAS", "BELFAR", "BIOMM", "BLANVER", "BLAU",
    "BOEHRINGER", "CAMBER", "CELLERA", "CHIESI", "CIMED", "CITOPHARMA", "EMS",
    "EUROFARMA", "E.M.S", "FARMARIN", "FERRING", "GEOLAB", "GSK", "HYPERA",
    "HYPOFARMA", "LEO PHARMA", "LUNDBECK", "MYLAN", "NATCOFARMA", "NATIVITA",
    "NATULAB", "NOVARTIS", "NUNESFARMA", "PHARMASCIENCE", "PRATI", "RANBAXY",
    "SANTISA", "SERVIER", "SHIRE", "SUNPHARMA", "TAKEDA", "UNICHEM", "UNITED MEDICAL",
    "VALEANT", "VOLPHARMA", "ZODIAC", "ZYDUS", "KEDRION", "PHARLAB", "FARMACE",
    "VASCONCELOS", "BRAINFARMA", "MAXI CONFORT", "INJEX", "BE CARE", "BECARE", "WILTEX",
    "GOODCAME"
];

/**
 * Corresponds to the 'abreviacoes' dictionary in the VBA code.
 */
export const abreviacoes = new Map<string, string>([
    ["EURO", "EUROFARMA"],
    ["EE", "EUROFARMA"],
    ["BOEH", "BOEHRINGER"],
    ["TAK", "TAKEDA"],
]);

/**
 * Corresponds to the 'portalMap' dictionary in the VBA code.
 * Used for converting shortcuts (e.g., 'C') to full portal names.
 */
export const portalMap = new Map<string, string>([
    ["C", "COMPRASNET"],
    ["CP", "PORTAL DE COMPRAS PÚBLICAS"],
    ["LN", "LICITANET"],
    ["LD", "LICITAR.DIGITAL"],
    ["RJ", "COMPRAS RJ"],
    ["BBM", "BBMNET"],
    ["BLL", "BLL COMPRAS"],
    ["BNC", "BNC COMPRAS"],
    ["SC", "COMPRAS SC"],
    ["RS", "COMPRAS RS"],
    ["BR", "COMPRAS BR"],
    ["BB", "BANCO DO BRASIL"],
    ["MG", "COMPRAS MG"],
    ["MT", "COMPRAS MT"],
    ["MS", "COMPRAS MS"],
    ["CAMPO", "COMPRAS CAMPO GRANDE"],
    ["AM", "COMPRAS AM"],
    ["GO", "SISLOG GO"],
    ["PN", "PUBLINEXO"],
    ["AP", "SIGA AP"],
]);

/**
 * A list of portal names for UI dropdowns/datalists.
 */
export const LISTA_PORTAIS = [
  "COMPRASNET", "PORTAL DE COMPRAS PÚBLICAS", "LICITANET", "LICITAR.DIGITAL",
  "COMPRAS RJ", "BBMNET", "BLL COMPRAS", "BNC COMPRAS", "COMPRAS SC",
  "COMPRAS RS", "COMPRAS BR", "BANCO DO BRASIL", "COMPRAS MG", "COMPRAS MT", 
  "COMPRAS MS", "COMPRAS CAMPO GRANDE", "COMPRAS AM", "SISLOG GO", "PUBLINEXO", "SIGA AP", "OUTROS"
];


/**
 * Map for "Modo de Disputa" shortcuts.
 */
export const MODO_DISPUTA_MAP = new Map<string, string>([
  ["N", "Normal"],
  ["A", "Aberto"],
  ["AF", "Aberto e Fechado"],
  ["FA", "Fechado e Aberto"]
]);

/**
 * List of "Modo de Disputa" options for UI.
 */
export const LISTA_MODOS = ["Normal", "Aberto", "Aberto e Fechado", "Fechado e Aberto", "Dispensa"];

/**
 * Map for "Ação Judicial" shortcuts.
 */
export const ACAO_JUDICIAL_MAP = new Map<string, string>([
  ["S", "SIM"],
  ["N", "NÃO"],
  ["P", "PARCIAL"]
]);


/**
 * Mock data for the 'BANCO' sheet.
 * This would typically come from a database or API.
 */
export interface Orgao {
    nome: string;
    portal: string;
    uasg: string;
}

export const bancoOrgaos: Orgao[] = [
    { nome: "HOSPITAL UNIVERSITÁRIO POLYDORO ERNANI SÃO THIAGO / SC", portal: "COMPRASNET", uasg: "155024" },
    { nome: "SECRETARIA DE ESTADO DA SAUDE / DF", portal: "COMPRASNET", uasg: "926118" },
    { nome: "PREFEITURA MUNICIPAL DE VILA VELHA / ES", portal: "BLL COMPRAS", uasg: "986198" },
    { nome: "MINISTÉRIO DA SAÚDE", portal: "COMPRASNET", uasg: "250005" },
];

/**
 * Mock data for the 'APRESENTACOES' sheet.
 * This would typically come from a database or API.
 */
export interface Apresentacao {
    codigo: string;
    nomeProduto: string;
    descricao: string; // Equivalent to 'valor' in some contexts
    descCompleta: string; // Contains 'MARCA:'
}

export const bancoApresentacoes: Apresentacao[] = [
    {
        codigo: "101",
        nomeProduto: "INSULINA HUMANA 100UI/ML",
        descricao: "15.75",
        descCompleta: "DESC: INSULINA HUMANA / MARCA: NOVARTIS / APRES: FRASCO-AMPOLA"
    },
    {
        codigo: "202",
        nomeProduto: "PARACETAMOL 500MG",
        descricao: "0.50",
        descCompleta: "DESC: PARACETAMOL / MARCA: EMS / APRES: COMPRIMIDO"
    }
];

/**
 * List of Brazilian states (Unidades Federativas).
 */
export const ufs: string[] = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

/**
 * Map for logo selection, including shortcuts.
 */
export const logoMap = new Map<string, string>([
    // Full names
    ["NSA", "NSA"],
    ["COSTA", "COSTA"],
    ["UNIQUE", "UNIQUE"],
    // Initials
    ["N", "NSA"],
    ["C", "COSTA"],
    ["U", "UNIQUE"],
    ["Q", "UNIQUE"],
    // Numeric codes
    ["1", "COSTA"],
    ["2", "UNIQUE"],
    ["3", "NSA"],
]);

