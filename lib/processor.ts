// src/lib/processor.ts

// Configuração dos Fabricantes e Abreviações
const CONFIG = {
  abbreviations: {
    "EURO": "EUROFARMA",
    "EE": "EUROFARMA",
    "BOEH": "BOEHRINGER",
    "TAK": "TAKEDA",
    "ACHE": "ACHÉ"
  },
  manufacturers: [
    "ABBOTT", "ABBVIE", "ABL", "ACCORD", "ACHÉ", "ADIUM", "AIRELA", "ALCON",
    "ALLERGAN", "ASPEN", "ASTELLAS", "BELFAR", "BIOMM", "BLANVER", "BLAU",
    "BOEHRINGER", "CAMBER", "CELLERA", "CHIESI", "CIMED", "CITOPHARMA", "EMS",
    "EUROFARMA", "FARMARIN", "FERRING", "GEOLAB", "GSK", "HYPERA",
    "HYPOFARMA", "LEO PHARMA", "LUNDBECK", "MYLAN", "NATCOFARMA", "NATIVITA",
    "NATULAB", "NOVARTIS", "NUNESFARMA", "PHARMASCIENCE", "PRATI", "RANBAXY",
    "SANTISA", "SERVIER", "SHIRE", "SUNPHARMA", "TAKEDA", "UNICHEM", "UNITED MEDICAL",
    "VALEANT", "VOLPHARMA", "ZODIAC", "ZYDUS", "KEDRION", "PHARLAB", "FARMACE",
    "VASCONCELOS", "BRAINFARMA", "MAXI CONFORT", "INJEX", "BE CARE", "BECARE", "WILTEX",
    "GOODCAME"
  ]
};

// Interface do retorno para tipagem forte
export interface ProcessedProduct {
  id: string; 
  raw: string;
  product: string;
  manufacturer: string;
  formatted: string;
}

export function processProductLine(inputText: string, index: number): ProcessedProduct {
  if (!inputText) return { id: index.toString(), raw: "", product: "", manufacturer: "", formatted: "" };

  let processedText = inputText.toUpperCase().trim();

  // 1. Expandir Abreviações
  Object.entries(CONFIG.abbreviations).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    processedText = processedText.replace(regex, full);
  });

  // 2. Identificar Fabricante
  let manufacturer = "";
  let productOnly = processedText;

  // Ordena fabricantes por tamanho para evitar falsos positivos
  const sortedManufacturers = [...CONFIG.manufacturers].sort((a, b) => b.length - a.length);

  // Verifica se já tem hífen
  if (processedText.includes(" - ")) {
    const parts = processedText.split(" - ");
    productOnly = parts[0].trim();
    manufacturer = parts[1].trim();
  } else {
    // Busca na lista
    for (const fab of sortedManufacturers) {
      if (processedText.includes(fab)) {
        manufacturer = fab;
        productOnly = processedText.replace(fab, "").trim();
        break; 
      }
    }
  }

  // Limpeza final
  productOnly = productOnly.replace(/\s+-\s*$/, "").trim();
  
  return {
    id: index.toString(),
    raw: inputText,
    product: productOnly,
    manufacturer: manufacturer || "NÃO IDENTIFICADO",
    formatted: `${productOnly} - ${manufacturer || "NÃO IDENTIFICADO"}`
  };
}