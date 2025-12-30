// lib/types.ts

export interface ItemGrade {
  id: string;
  numeroItem: number | undefined;
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
  webCotacao: string;
  logoInput: string;
  cadastro: string;
  conferencia: string;
  disputa: string;
  proposta: string;
}

export interface Orgao {
  nome: string;
  uasg: string;
  portal: string;
}

export interface Resultado {
  id: string;
  empresa: string;
  produto: string;
  webCotacao: string;
  quantidade: number | string;
  minimoCotacao: number | string;
  nossoPreco: number | string;
  precoConcorrente: number | string;
  concorrente: string;
  marca: string;
  orgao: string;
  uf: string;
  pregao: string;
  data: string;
  status: 'ganho' | 'perdido' | 'neutro';
}

export interface CompanyConfig {
  name: string;
  color: string;
  fontColor?: string;
}
