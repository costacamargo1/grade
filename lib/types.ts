// lib/types.ts

export interface ItemGrade {
  id: string;
  numeroItem: number;
  precoDoDia: number;
  melhorPreco: number;
  precoFinal: number;
  medicamento: string;
  marca: string;
  quantidade: number;
  valorEstimado: number;
  precoInicial: number;
  cotacao: number;
  primeiroColocado: { empresa: string; marca: string; valor: number };
  segundoColocado: { empresa: string; marca: string; valor: number };
  terceiroColocado: { empresa: string; marca: string; valor: number };
  mapa: string;
}

export interface HeaderData {
  edital: string;
  orgao: string;
  dataAbertura: string;
  empresa: string;
  portalInput: string;
  uasgInput: string;
  judicialInput: string;
  modoDisputa: string;
  logoInput: string;
}