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
  // Campos Originais
  edital: string;
  orgao: string;
  dataAbertura: string;
  numeroGrade: string;
  dataEdicao: string;
  empresa: string;
  portalInput: string;
  uasgInput: string;
  judicialInput: string;
  modoDisputa: string;
  webCotacao: string;
  logoInput: string;
  
  // Status de Acompanhamento (Texto)
  cadastro: string;
  conferencia: string;
  disputa: string;
  proposta: string;

  // --- NOVOS CAMPOS (Header Planilha) ---
  
  // Datas de Acompanhamento
  dataCadastro?: string;
  dataConferencia?: string;
  dataDisputa?: string;
  dataPropostaReajustada?: string;

  // Regras do Pregão (Box Amarelo)
  localEnvio?: string; // 'PORTAL' | 'EMAIL' | 'FISICO'
  prazoEnvio?: string;
  cortaNoEstimado?: string; // 'SIM' | 'NAO'
  disputaPorValor?: string; // 'UNITARIO' | 'GLOBAL' | 'LOTE'
  casasDecimais?: string;
  amostra?: string; // 'SIM' | 'NAO'

  // Rodapé
  observacoes?: string;
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
  observacoes?: string;
  status: 'ganho' | 'perdido' | 'neutro';
}

export interface Produto {
  id: string;
  fabricante: string;
  descricao: string;
  unidade: string;
  valorInicial: string;
  codeuro: string;
  apresentacaoSugerida: string;
  obs: string;
  cap: boolean;
  conv8702: boolean;
  conv16294: boolean;
  conv14001: boolean;
}

export interface CompanyConfig {
  name: string;
  color: string;
    fontColor?: string;
  }
  
  export interface Processo {
    id: string;
    headerData: HeaderData;
    itens: ItemGrade[];
  }
  
