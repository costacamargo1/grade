// lib/constants.ts

export const PORTAIS_MAP: Record<string, string> = {
  "C": "COMPRASNET",
  "CP": "PORTAL DE COMPRAS PÚBLICAS",
  "LN": "LICITANET",
  "LD": "LICITAR.DIGITAL",
  "RJ": "COMPRAS RJ",
  "BBM": "BBMNET",
  "BLL": "BLL COMPRAS",
  "BNC": "BNC COMPRAS",
  "SC": "COMPRAS SC",
  "RS": "COMPRAS RS",
  "BR": "COMPRAS BR",
  "BB": "BANCO DO BRASIL",
  "MG": "COMPRAS MG",
  "MT": "COMPRAS MT",
  "MS": "COMPRAS MS",
  "CAMPO": "COMPRAS CAMPO GRANDE",
  "AM": "COMPRAS AM",
  "GO": "SISLOG GO",
  "PN": "PUBLINEXO",
  "AP": "SIGA AP"
};

export const LISTA_PORTAIS = [
  "COMPRASNET", "PORTAL DE COMPRAS PÚBLICAS", "LICITANET", "LICITAR.DIGITAL",
  "COMPRAS RJ", "BBMNET", "BLL COMPRAS", "BNC COMPRAS", "COMPRAS SC",
  "COMPRAS RS", "COMPRAS BR", "BANCO DO BRASIL", "COMPRAS MG", "COMPRAS MT", 
  "COMPRAS MS", "COMPRAS CAMPO GRANDE", "COMPRAS AM", "SISLOG GO", "PUBLINEXO", "SIGA AP", "OUTROS"
];

// NOVOS MAPEAMENTOS
export const MODO_DISPUTA_MAP: Record<string, string> = {
  "N": "Normal",
  "A": "Aberto",
  "AF": "Aberto e Fechado",
  "FA": "Fechado e Aberto"
};

export const LISTA_MODOS = ["Normal", "Aberto", "Aberto e Fechado", "Fechado e Aberto", "Dispensa"];

export const ACAO_JUDICIAL_MAP: Record<string, string> = {
  "S": "SIM",
  "N": "NÃO",
  "P": "PARCIAL"
};