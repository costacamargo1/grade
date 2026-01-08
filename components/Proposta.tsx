"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Produto } from "../lib/types";
import { bancoApresentacoes } from "../lib/data";
import { formatarDataInteligente, removerAcentos } from "../lib/formatters";

type Empresa = "NSA" | "COSTA" | "UNIQUE";

interface PropostaProps {
  empresa?: Empresa;
  produtos?: Produto[];
}

interface PropostaHeader {
  orgao: string;
  estadoUf: string;
  pregao: string;
  processo: string;
  abertura: string;
  web: string;
  estadoFaturamento: string;
  validadeProposta: string;
  prazoPagamento: string;
  vigenciaAta: string;
  prazoEntrega: string;
  validadeObjeto: string;
  observacoes: string;
  cidadeData: string;
}

interface PropostaItem {
  id: string;
  item: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  fabricante: string;
  nomeComercial: string;
  marca: string;
  valorUnitarioComIcms: string;
  valorTotalComIcms: string;
  valorUnitarioSemIcms: string;
  valorTotalSemIcms: string;
  cap: boolean;
}

const COMPANY_CONFIG: Record<Empresa, {
  displayName: string;
  logoSrc: string;
  logoAlt: string;
  enderecoTopo?: string[];
  assinatura: string[];
  dadosEmpresa: { label: string; value: string }[];
  contatos: { label: string; value: string }[];
  bancos: { label: string; value: string }[];
  observacoesFixas: string[];
  declaracoesFixas: string[];
}> = {
  NSA: {
    displayName: "NSA DISTRIBUIDORA DE MEDICAMENTOS LTDA",
    logoSrc: "/nsa.png",
    logoAlt: "NSA Medicamentos",
    enderecoTopo: [],
    assinatura: [
      "NSA DISTRIBUIDORA DE MEDICAMENTOS LTDA",
      "Adelina Mello Fontana / Socia Administradora",
      "CPF 055.908.087-58",
    ],
    dadosEmpresa: [
      { label: "Nome da empresa", value: "NSA DISTRIBUIDORA DE MEDICAMENTOS LTDA" },
      { label: "CNPJ", value: "34.729.047/0001-02" },
      { label: "Inscr. Estadual", value: "083.959.58-9" },
      { label: "Endereco", value: "RUA DARCY DUARTE CARNEIRO - No 20 - Cobilandia - Vila Velha - ES" },
      { label: "CEP", value: "29.111-190" },
      { label: "Inscr. Municipal", value: "105178" },
    ],
    contatos: [
      { label: "Para fins de LICITACAO", value: "licitacao@nsamedicamentos.com.br" },
      { label: "Para fins de CONTRATOS", value: "contratos@nsamedicamentos.com.br" },
      { label: "Para fins de EMPENHO", value: "empenho@nsamedicamentos.com.br" },
      { label: "Para fins de NOTIFICACAO", value: "notificacao@nsamedicamentos.com.br" },
      { label: "Telefone licitacao", value: "(27) 3359-4714" },
      { label: "Telefone empenho", value: "(27) 3534-4715" },
    ],
    bancos: [
      { label: "Banco", value: "BANCO DO BRASIL" },
      { label: "Agencia", value: "9792-6" },
      { label: "Conta", value: "160390-6" },
    ],
    observacoesFixas: [
      "Declaramos sob as Penas da Lei, que cumpre plenamente os requisitos de habilitacao para o Presente processo licitatorio;",
      "Declaramos que em atendimento a legislacao vigente, a RDC No 135/2005, com as alteracoes da RDC No 260/2005, ambas revogadas pela RDC No 80/2006 e a PORTARIA 344, de 12 de maio de 1998, e suas posteriores, somos impossibilitados de efetuar a subdivisao da embalagem de um produto (FRACIONAMENTO);",
      "Declaramos que nos precos propostos encontram-se incluidos todos os tributos, encargos sociais, aplicacao do CAP (quando necessario), frete ate o destino, e quaisquer outros onus que porventura possam recair sobre o fornecimento do objeto da presente licitacao e que estou de acordo com todas as normas deste edital e seus anexos.",
      "Declaramos para os devidos fins que em cumprimento ao disposto no artigo 7o, inciso XXXIII, da Constituicao Federal, nao possui em seu quadro funcional menores de 18 (dezoito) anos de idade exercendo trabalho noturno, perigoso ou insalubre, ou menores de 16 (dezesseis) anos de idade exercendo qualquer trabalho, salvo na condicao de aprendiz, a partir das 14 (quatorze) anos de idade.",
    ],
    declaracoesFixas: [],
  },
  COSTA: {
    displayName: "COSTA CAMARGO COM. DE PROD. HOSP. LTDA",
    logoSrc: "/costa-camargo.png?v=2",
    logoAlt: "Costa Camargo",
    enderecoTopo: [
      "JUIZ ALEXANDRE MARTINS DE CASTRO FILHO, 8",
      "ITAPUA, Vila Velha, Espirito Santo",
      "CEP: 29.101-800",
    ],
    assinatura: [
      "Costa Camargo Comercio de Produtos Hospitalares Ltda",
      "Felippe David Mello Fontana",
      "RG: 1.722.479 - SSP ES",
      "CPF: 057.054.937-03",
    ],
    dadosEmpresa: [
      { label: "Fornecedor", value: "COSTA CAMARGO COM. DE PROD. HOSP. LTDA" },
      { label: "CNPJ", value: "36.325.157/0001-34" },
      { label: "Inscricao Estadual", value: "08152653" },
      { label: "Inscricao Municipal", value: "13403" },
      { label: "Responsavel Legal", value: "Felippe David Mello Fontana" },
      { label: "Estado Civil", value: "Casado" },
      { label: "RG", value: "1.722.479 - SSP-ES" },
      { label: "CPF", value: "057.054.937-03" },
      { label: "Telefone Geral", value: "(27) 3200-4746" },
    ],
    contatos: [
      { label: "E-mail licitacao", value: "licitacao@costacamargo.com.br" },
      { label: "E-mail atas/contratos", value: "licitacao12@costacamargo.com.br" },
      { label: "Telefones", value: "(27) 3320-2203 / (27) 3320-2227" },
      { label: "Empenhos", value: "empenho@costacamargo.com.br" },
      { label: "Notificacoes", value: "notificacao@costacamargo.com.br" },
    ],
    bancos: [
      { label: "Banco", value: "Banco do Brasil S.A." },
      { label: "Agencia", value: "3431-2" },
      { label: "Conta Corrente", value: "2057581" },
      { label: "Chave PIX", value: "36.325.157/0001-34" },
    ],
    observacoesFixas: [
      "A empresa somente processara os empenhos enviados para o endereco correto de correspondencia eletronia empenho@costacamargo.com.br. Eventual envio para endereco ou setor diverso do informado na presente proposta e de inteira responsabilidade do remetente, sendo que a empresa nao sera responsavel pelo atraso ou ausencia de resposta.",
      "A empresa esclarece que somente o setor de Empenho possui poderes para receber e processar os pedidos de empenho, sendo de inteira responsabilidade do Contratante realizar o pedido nos moldes da presente proposta, sob pena de responder pelos seus proprios atos.",
      "Por fim, a empresa nao se responsabiliza caso os empenhos sejam enviados para enderecos diversos ou incorretos.",
    ],
    declaracoesFixas: [
      "Conforme convenio 26/03, informamos que os precos contidos nessa proposta comercial estao deduzidos do ICMS e comprovados na nota fiscal de faturamento da venda.",
      "Conforme o CONVENIO ICMS 87/02, paragrafo 6o, o valor correspondente a isencao do ICMS devera ser deduzido do preco dos respectivos produtos, devendo o contribuinte demonstrar a deducao, expressamente, nas propostas do processo licitatorio e nos documentos fiscais.",
      "Nesta proposta estao incluidas eventuais vantagens e/ou abatimentos, impostos, transporte (carga e descarga) ate o destino, taxas e encargos sociais, obrigacoes trabalhistas, previdenciarias, fiscais e comerciais e outras quaisquer que incidam sobre a contratacao.",
      "Em virtude da legislacao vigente, a RDC No 135/2005, com as alteracoes da RDC No 260/2005, ambas revogadas pela RDC No 80/2006 e a PORTARIA 344, de 12 de Maio de 1998, e suas posteriores atualizacoes, somos impossibilitados de efetuar a subdivisao da embalagem de um produto (FRACIONAMENTO).",
      "Que nos precos propostos encontram-se incluidos todos os tributos, encargos sociais, aplicacao do CAP (quando necessario), frete ate o destino, e quaisquer outros onus que porventura possam recair sobre o fornecimento do objeto da presente licitacao e que estou de acordo com todas as normas deste edital e seus anexos.",
    ],
  },
  UNIQUE: {
    displayName: "UNIQUE DISTRIBUIDORA DE MEDICAMENTOS LTDA",
    logoSrc: "/unique.png",
    logoAlt: "Unique Medicamentos",
    enderecoTopo: [
      "AVENIDA OTAVIO BORIN, 18 - Cobilandia, Vila Velha - ES",
      "Telefone: (27) 3075-7385",
      "INSC. EST.: 083.146.74-1 | INSC. MUN.: 69254",
      "CNPJ: 23.864.942/0001-13",
    ],
    assinatura: [
      "Unique Distribuidora de Medicamentos Ltda",
    ],
    dadosEmpresa: [
      { label: "Banco", value: "BANCO DO BRASIL - Agencia: 3195-X - Conta Corrente: 29857-3" },
    ],
    contatos: [
      { label: "E-mail licitacao", value: "licitacao@uniquemedicamentos.com.br" },
      { label: "E-mail empenhos", value: "empenho@uniquemedicamentos.com.br" },
      { label: "E-mail notificacoes", value: "notificacao@uniquemedicamentos.com.br" },
      { label: "Telefone setor de licitacoes", value: "(27) 3075-7385" },
    ],
    bancos: [],
    observacoesFixas: [
      "A empresa esclarece que somente o setor de EMPENHO e NOTIFICACOES possuem poderes para receber e processar os pedidos de empenho/autorizacao de fornecimento ou notificacoes respectivamente, sendo de inteira responsabilidade do CONTRATANTE realizar o pedido nos moldes da presente proposta, sob pena de responder pelos seus proprios atos.",
      "Desta forma, a empresa nao se responsabiliza caso os empenhos ou as notificacoes sejam enviados para enderecos diversos ou incorretos.",
    ],
    declaracoesFixas: [
      "Conforme convenio 26/03, informamos que os precos contidos nessa proposta comercial estao deduzidos do ICMS e comprovados na nota fiscal de faturamento da venda.",
      "Conforme o CONVENIO ICMS 87/02, paragrafo 6o, o valor correspondente a isencao do ICMS devera ser deduzido do preco dos respectivos produtos, devendo o contribuinte demonstrar a deducao, expressamente, nas propostas do processo licitatorio e nos documentos fiscais.",
      "Nesta proposta estao incluidas eventuais vantagens e/ou abatimentos, impostos, transporte (carga e descarga) ate o destino, taxas e encargos sociais, obrigacoes trabalhistas, previdenciarias, fiscais e comerciais e outras quaisquer que incidam sobre a contratacao.",
      "Em virtude da legislacao vigente, a RDC No 135/2005, com as alteracoes da RDC No 260/2005, ambas revogadas pela RDC No 80/2006 e a PORTARIA 344, de 12 de Maio de 1998, e suas posteriores atualizacoes, somos impossibilitados de efetuar a subdivisao da embalagem de um produto (FRACIONAMENTO).",
      "Que nos precos propostos encontram-se incluidos todos os tributos, encargos sociais, aplicacao do CAP (quando necessario), frete ate o destino, e quaisquer outros onus que porventura possam recair sobre o fornecimento do objeto da presente licitacao e que estou de acordo com todas as normas deste edital e seus anexos.",
    ],
  },
};

const buildDefaultHeader = (): PropostaHeader => ({
  orgao: "",
  estadoUf: "",
  pregao: "",
  processo: "",
  abertura: "",
  web: "",
  estadoFaturamento: "ESPIRITO SANTO",
  validadeProposta: "",
  prazoPagamento: "",
  vigenciaAta: "",
  prazoEntrega: "",
  validadeObjeto: "",
  observacoes: "",
  cidadeData: "",
});

const buildDefaultItem = (): PropostaItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  item: "",
  descricao: "",
  unidade: "",
  quantidade: "",
  fabricante: "",
  nomeComercial: "",
  marca: "",
  valorUnitarioComIcms: "",
  valorTotalComIcms: "",
  valorUnitarioSemIcms: "",
  valorTotalSemIcms: "",
  cap: false,
});

const normalizeNumericInput = (value: string): string => value.replace(",", ".").replace(/[^0-9.]/g, "");

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const parsed = parseFloat(normalizeNumericInput(value));
  return Number.isNaN(parsed) ? null : parsed;
};

const formatMoney = (value: number | string): string => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = typeof value === "string" ? parseFloat(normalizeNumericInput(value)) : value;
  if (Number.isNaN(parsed)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(parsed);
};

const formatNumber = (value: number | string): string => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = typeof value === "string" ? parseFloat(normalizeNumericInput(value)) : value;
  if (Number.isNaN(parsed)) return "";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(parsed);
};

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

const identificarConvenio = (descricao: string): string => {
  const texto = descricao.toUpperCase();
  if (texto.includes("CONFAZ 87/02")) return "CONFAZ_87_02";
  if (texto.includes("CONV. 162/94") || texto.includes("CONV 162/94") || texto.includes("CONVENIO 162/94") || texto.includes("CONVENIO 162/94")) {
    return "CONV_162_94";
  }
  if (texto.includes("CONV. 140/01") || texto.includes("CONV 140/01") || texto.includes("CONVENIO 140/01") || texto.includes("CONVENIO 140/01")) {
    return "CONV_140_01";
  }
  if (texto.includes("CONV. 10/02") || texto.includes("CONV 10/02") || texto.includes("CONVENIO 10/02") || texto.includes("CONVENIO 10/02")) {
    return "CONV_10_02";
  }
  return "SEM_CONVENIO";
};

const calcularFatorICMS = (ufInput: string, marcaInput: string): number => {
  const uf = ufInput.toUpperCase().slice(0, 2);
  const marca = marcaInput.toUpperCase().trim();
  switch (uf) {
    case "AC": return 0.81;
    case "AL": return 0.81;
    case "AM": return 0.8;
    case "AP": return 0.82;
    case "BA": return 0.795;
    case "CE": return 0.8;
    case "DF": return 0.83;
    case "ES": return 0.83;
    case "GO": return 0.81;
    case "MA": return 0.77;
    case "MG": return marca === "GENERICO" ? 0.88 : 0.82;
    case "MS": return 0.83;
    case "MT": return 0.83;
    case "PA": return 0.81;
    case "PB": return 0.8;
    case "PE": return 0.795;
    case "PI": return 0.775;
    case "PR": return 0.805;
    case "RJ": return 0.78;
    case "RN": return 0.8;
    case "RO": return 0.805;
    case "RR": return 0.8;
    case "RS": return 0.83;
    case "SC": return 0.83;
    case "SE": return 0.81;
    case "SP": return marca === "GENERICO" ? 0.88 : 0.82;
    case "TO": return 0.8;
    default: return 0.82;
  }
};

const numeroParaExtenso = (valor: number): string => {
  const unidades = [
    "", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove",
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
  ];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  const processarNumeroSimples = (numero: number): string => {
    if (numero === 0) return "";
    let resultado = "";
    if (numero >= 100) {
      const centena = Math.floor(numero / 100);
      numero = numero % 100;
      resultado = centena === 1 && numero === 0 ? "cem" : centenas[centena];
      if (numero > 0) resultado += " e ";
    }
    if (numero > 0) {
      if (numero < 20) {
        resultado += unidades[numero];
      } else {
        const dezena = Math.floor(numero / 10);
        const unidade = numero % 10;
        resultado += dezenas[dezena] || String(numero);
        if (unidade > 0) resultado += ` e ${unidades[unidade]}`;
      }
    }
    return resultado;
  };

  let parteInteira = Math.floor(valor);
  const parteDecimal = Math.round((valor - parteInteira) * 100);
  let extenso = "";

  if (parteInteira === 0) {
    extenso = "zero";
  } else {
    if (parteInteira >= 1_000_000) {
      const milhoes = Math.floor(parteInteira / 1_000_000);
      parteInteira = parteInteira % 1_000_000;
      extenso = milhoes === 1 ? "um milhao" : `${processarNumeroSimples(milhoes)} milhoes`;
      if (parteInteira > 0) extenso += " e ";
    }
    if (parteInteira >= 1000) {
      const milhares = Math.floor(parteInteira / 1000);
      parteInteira = parteInteira % 1000;
      extenso += milhares === 1 ? "mil" : `${processarNumeroSimples(milhares)} mil`;
      if (parteInteira > 0) extenso += " e ";
    }
    if (parteInteira > 0) {
      extenso += processarNumeroSimples(parteInteira);
    }
  }

  if (parteDecimal > 0) {
    extenso += ` virgula ${processarNumeroSimples(parteDecimal)}`;
  }

  return extenso.trim();
};

const numeroParaExtensoMonetario = (valor: number): string => {
  const unidades = [
    "", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove",
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
  ];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  const processarNumeroSimples = (numero: number): string => {
    if (numero === 0) return "";
    let resultado = "";
    if (numero >= 100) {
      const centena = Math.floor(numero / 100);
      numero = numero % 100;
      resultado = centena === 1 && numero === 0 ? "cem" : centenas[centena];
      if (numero > 0) resultado += " e ";
    }
    if (numero > 0) {
      if (numero < 20) {
        resultado += unidades[numero];
      } else {
        const dezena = Math.floor(numero / 10);
        const unidade = numero % 10;
        resultado += dezenas[dezena] || String(numero);
        if (unidade > 0) resultado += ` e ${unidades[unidade]}`;
      }
    }
    return resultado;
  };

  let parteInteira = Math.floor(valor);
  let parteDecimal = Math.round((valor - parteInteira) * 100);
  if (parteDecimal > 99) parteDecimal = 99;

  let extenso = "";
  if (parteInteira === 0) {
    extenso = "zero";
  } else {
    if (parteInteira >= 1_000_000) {
      const milhoes = Math.floor(parteInteira / 1_000_000);
      parteInteira = parteInteira % 1_000_000;
      extenso = milhoes === 1 ? "um milhao" : `${processarNumeroSimples(milhoes)} milhoes`;
      if (parteInteira > 0) extenso += " e ";
    }
    if (parteInteira >= 1000) {
      const milhares = Math.floor(parteInteira / 1000);
      parteInteira = parteInteira % 1000;
      extenso += milhares === 1 ? "mil" : `${processarNumeroSimples(milhares)} mil`;
      if (parteInteira > 0) extenso += " e ";
    }
    if (parteInteira > 0) {
      extenso += processarNumeroSimples(parteInteira);
    }
  }

  extenso += parteInteira === 1 ? " real" : " reais";

  if (parteDecimal > 0) {
    extenso += ` e ${processarNumeroSimples(parteDecimal)} ${parteDecimal === 1 ? "centavo" : "centavos"}`;
  }

  return extenso.trim();
};

const getNomeEstado = (entrada: string): string => {
  const valor = entrada.trim().toUpperCase();
  if (!valor) return "ENTRADA INVALIDA";
  const entradaSemAcentos = removerAcentos(valor);
  const estados = [
    ["AC", "ACRE"],
    ["AL", "ALAGOAS"],
    ["AP", "AMAPA"],
    ["AM", "AMAZONAS"],
    ["BA", "BAHIA"],
    ["CE", "CEARA"],
    ["DF", "DISTRITO FEDERAL"],
    ["ES", "ESPIRITO SANTO"],
    ["GO", "GOIAS"],
    ["MA", "MARANHAO"],
    ["MT", "MATO GROSSO"],
    ["MS", "MATO GROSSO DO SUL"],
    ["MG", "MINAS GERAIS"],
    ["PA", "PARA"],
    ["PB", "PARAIBA"],
    ["PR", "PARANA"],
    ["PE", "PERNAMBUCO"],
    ["PI", "PIAUI"],
    ["RJ", "RIO DE JANEIRO"],
    ["RN", "RIO GRANDE DO NORTE"],
    ["RS", "RIO GRANDE DO SUL"],
    ["RO", "RONDONIA"],
    ["RR", "RORAIMA"],
    ["SC", "SANTA CATARINA"],
    ["SP", "SAO PAULO"],
    ["SE", "SERGIPE"],
    ["TO", "TOCANTINS"],
  ];

  for (const [sigla, nome] of estados) {
    if (valor === sigla) return `${nome} (${sigla})`;
  }

  for (const [sigla, nome] of estados) {
    if (entradaSemAcentos === removerAcentos(nome)) return `${nome} (${sigla})`;
  }

  const palavra = entradaSemAcentos;
  switch (palavra) {
    case "MINAS":
    case "GERAIS":
      return "MINAS GERAIS (MG)";
    case "DISTRITO":
    case "FEDERAL":
      return "DISTRITO FEDERAL (DF)";
    case "SANTA":
    case "CATARINA":
      return "SANTA CATARINA (SC)";
    case "PAULO":
    case "SAO":
    case "SAO PAULO":
      return "SAO PAULO (SP)";
    case "ESPIRITO":
    case "SANTO":
    case "ESPIRITO SANTO":
      return "ESPIRITO SANTO (ES)";
    case "RIO":
    case "JANEIRO":
      return "RIO DE JANEIRO (RJ)";
    case "NORTE":
    case "RN":
    case "RIO GRANDE NORTE":
      return "RIO GRANDE DO NORTE (RN)";
    case "SUL":
    case "RS":
    case "RIO GRANDE SUL":
    case "GRANDE SUL":
      return "RIO GRANDE DO SUL (RS)";
    case "MATO":
    case "GROSSO":
      if (palavra !== "MATO GROSSO DO SUL" && palavra !== "GROSSO SUL") {
        return "MATO GROSSO (MT)";
      }
      break;
    case "GROSSO SUL":
    case "MATO SUL":
      return "MATO GROSSO DO SUL (MS)";
    case "PARA":
      return "PARA (PA)";
    case "CEARA":
      return "CEARA (CE)";
    case "GOIAS":
      return "GOIAS (GO)";
    case "PIAUI":
      return "PIAUI (PI)";
    case "PARANA":
      return "PARANA (PR)";
    case "PARAIBA":
      return "PARAIBA (PB)";
    case "RONDONIA":
      return "RONDONIA (RO)";
    case "AMAPA":
      return "AMAPA (AP)";
    case "MARANHAO":
      return "MARANHAO (MA)";
    default:
      break;
  }

  for (const [sigla, nome] of estados) {
    const semAcento = removerAcentos(nome);
    if (semAcento.includes(entradaSemAcentos) || entradaSemAcentos.includes(semAcento)) {
      return `${nome} (${sigla})`;
    }
  }

  return "ESTADO NAO ENCONTRADO";
};

const formatNomeOrgao = (valorInput: string): string => {
  let valor = valorInput.toUpperCase().trim();
  if (!valor) return "";
  valor = valor.replace("PREF ", "PREFEITURA ").replace("HOSP ", "HOSPITAL ");
  if (valor.includes("PREFEITURA ") && !valor.includes(" DE ") && !valor.includes(" DA ") && !valor.includes(" DO ")) {
    const cidade = valor.replace("PREFEITURA ", "").trim();
    let prep = "DE";
    if (cidade.startsWith("SERRA") || cidade.startsWith("BAHIA") || cidade.startsWith("LAPA")) prep = "DA";
    if (cidade.startsWith("RIO") || cidade.startsWith("PORTO") || cidade.startsWith("RECIFE")) prep = "DO";
    valor = `PREFEITURA ${prep} ${cidade}`;
  }
  return valor;
};

const formatPrefixo = (value: string, prefixo: string): string => {
  let valorDigitado = value.trim();
  if (!valorDigitado) return prefixo;
  if (valorDigitado.startsWith(prefixo)) {
    valorDigitado = valorDigitado.slice(prefixo.length).trim();
  }
  const partes = valorDigitado.split("/");
  if (partes.length === 2) {
    const numeroPregao = partes[0].trim();
    const ano = partes[1].trim();
    if (/^\d+$/.test(numeroPregao) && /^\d+$/.test(ano)) {
      const anoNumerico = Number(ano);
      if (anoNumerico >= 2024 && anoNumerico <= 2030) {
        return `${prefixo}${numeroPregao.padStart(4, "0")}/${ano}`;
      }
    }
  }
  if (/^\d+$/.test(valorDigitado)) {
    if (valorDigitado.length >= 6) {
      const ano = valorDigitado.slice(-4);
      const numero = valorDigitado.slice(0, -4);
      const anoNum = Number(ano);
      if (anoNum >= 2024 && anoNum <= 2030) {
        return `${prefixo}${numero.padStart(4, "0")}/${ano}`;
      }
    } else {
      const anoAtual = new Date().getFullYear();
      return `${prefixo}${valorDigitado.padStart(4, "0")}/${anoAtual}`;
    }
  }
  return `${prefixo}${valorDigitado}`;
};

const formatDataAbertura = (value: string): string => {
  const cleaned = value.replace(/^ABERTURA:\s*/i, "").trim();
  if (!cleaned) return "Abertura:";
  const formatted = formatarDataInteligente(cleaned);
  return `Abertura: ${formatted || cleaned}`;
};

const formatValidadeProposta = (value: string): string => {
  const prefixo = "Validade da Proposta: ";
  const sufixo = " dias, a contar da data de sua apresentacao.";
  if (!value) return prefixo;
  if (/^\d+$/.test(value.trim())) {
    const numero = Number(value.trim());
    const extenso = numeroParaExtenso(numero);
    return `${prefixo}${numero} (${extenso})${sufixo}`;
  }
  window.alert("Digite apenas numeros para a validade da proposta.");
  return prefixo;
};

const formatPrazoPagamento = (value: string): string => {
  const prefixo = "Prazo de Pagamento: ";
  const sufixo = " dias.";
  if (!value) return `${prefixo}Conforme edital.`;
  if (/^\d+$/.test(value.trim())) {
    const numero = Number(value.trim());
    const extenso = numeroParaExtenso(numero);
    return `${prefixo}${numero} (${extenso})${sufixo}`;
  }
  return `${prefixo}Conforme edital.`;
};

const formatVigenciaAta = (value: string): string => {
  const prefixo = "Vigencia da Ata: ";
  const sufixo = " meses.";
  const numero = value.trim() ? Number(value.trim()) : 12;
  const extenso = numeroParaExtenso(numero);
  return `${prefixo}${numero} (${extenso})${sufixo}`;
};

const formatPrazoEntrega = (value: string): string => {
  const prefixo = "Prazo de Entrega: ";
  const sufixo = " do recebimento da Autorizacao de Fornecimento (AF) ou Nota de Empenho (NE).";
  const valor = value.trim().toLowerCase();
  if (!valor) return `${prefixo} dias corridos${sufixo}`;
  if (valor.includes("uteis") || valor.endsWith("u")) {
    const numeroTexto = valor.endsWith("u") ? valor.slice(0, -1) : valor.replace("uteis", "");
    const numero = Number(numeroTexto.trim());
    if (!Number.isNaN(numero)) {
      const extenso = numeroParaExtenso(numero);
      return `${prefixo}${numero} (${extenso}) dias uteis${sufixo}`;
    }
  }
  if (/^\d+$/.test(valor)) {
    const numero = Number(valor);
    const extenso = numeroParaExtenso(numero);
    return `${prefixo}${numero} (${extenso}) dias corridos${sufixo}`;
  }
  return `${prefixo} dias corridos${sufixo}`;
};

const formatValidadeObjeto = (value: string): string => {
  const prefixo = "Validade do Objeto: ";
  const valor = value.trim();
  if (!valor) return prefixo;
  if (valor.includes("%")) {
    const numeroTexto = valor.replace("%", "");
    const numero = Number(numeroTexto);
    if (numero >= 0 && numero <= 100) {
      const extenso = `${numeroParaExtenso(numero)} por cento`;
      return `${prefixo}${numero}% (${extenso}) de validade.`
    }
    window.alert("A porcentagem deve estar entre 0 e 100.");
    return prefixo;
  }
  if (valor.includes("/")) {
    const partes = valor.split("/");
    if (partes.length === 2 && /^\d+$/.test(partes[0]) && /^\d+$/.test(partes[1])) {
      const numerador = Number(partes[0]);
      const denominador = Number(partes[1]);
      if (denominador <= 0 || numerador < 0) {
        window.alert("A fracao deve conter valores positivos.");
        return prefixo;
      }
      let extenso = "";
      if (denominador === 2) extenso = `${numeroParaExtenso(numerador)} meios`;
      else if (denominador === 3) extenso = `${numeroParaExtenso(numerador)} tercos`;
      else if (denominador === 4) extenso = `${numeroParaExtenso(numerador)} quartos`;
      else extenso = `${numeroParaExtenso(numerador)} partes de ${numeroParaExtenso(denominador)}`;
      return `${prefixo}${valor} (${extenso}) de validade.`
    }
    window.alert("Fracao invalida. Use o formato X/Y (ex.: 1/2).");
    return prefixo;
  }
  if (/^\d+$/.test(valor)) {
    const numero = Number(valor);
    const extenso = numeroParaExtenso(numero);
    return `${prefixo}${numero} (${extenso}) meses de validade.`
  }
  window.alert("Entrada invalida. Digite um numero, uma porcentagem ou uma fracao.");
  return prefixo;
};

const formatDescricao = (valor: string): string => {
  const separador = "\n\n";
  let texto = valor;
  texto = texto.replace(" - (CONFAZ 87/02: SIM | CAP: SIM)", `${separador}* (CONFAZ 87/02: SIM | CAP: SIM)`);
  texto = texto.replace(" - (CONFAZ 87/02: SIM)", `${separador}* (CONFAZ 87/02: SIM)`);
  texto = texto.replace(" - (CONV. 162/94: SIM | CAP: SIM)", `${separador}* (CONV. 162/94: SIM | CAP: SIM)`);
  texto = texto.replace(" - (CONV. 162/94: SIM)", `${separador}* (CONV. 162/94: SIM)`);
  texto = texto.replace(" - (CAP: SIM)", `${separador}* (CAP: SIM)`);
  texto = texto.replace(" - (CONV. 140/01: SIM)", `${separador}* (CONV. 140/01: SIM)`);
  texto = texto.replace(" - (CONV. 140/01: SIM | CAP: SIM)", `${separador}* (CONV. 140/01: SIM | CAP: SIM)`);
  texto = texto.replace(" - (CONV. 10/02: SIM)", `${separador}* (CONV. 10/02: SIM)`);
  return texto;
};

const applyCapToDescricao = (descricao: string, cap: boolean): string => {
  const marcador = "CAP: SIM";
  const separador = "\n\n";
  const contem = descricao.includes(marcador);
  if (!cap && contem) {
    return descricao
      .split("\n")
      .map((linha) => linha.replace(` | ${marcador}`, "").replace(`${marcador} | `, "").replace(marcador, "").replace("* ()", "").trim())
      .filter((linha) => linha !== "")
      .join("\n");
  }
  if (cap && !contem) {
    if (descricao.includes("* (")) {
      const linhas = descricao.split("\n");
      for (let i = linhas.length - 1; i >= 0; i -= 1) {
        if (linhas[i].includes("* (")) {
          linhas[i] = linhas[i].replace(")", ` | ${marcador})`);
          return linhas.join("\n");
        }
      }
    }
    return `${descricao}${separador}* (${marcador})`;
  }
  return descricao;
};

const getDeclaracoesPorOrgao = (orgao: string, estadoUf: string): string[] => {
  const nomeOrgao = removerAcentos(orgao.toUpperCase());
  const estado = removerAcentos(estadoUf.toUpperCase());
  const declaracoes: string[] = [];

  const orgaoSesa = [
    "SESA",
    "SESA ES",
    "SECRETARIA DE ESTADO DA SAUDE",
    "SECRETARIA DE ESTADO DE SAUDE",
    "SECRETARIA DE ESTADO DA SAUDE DO ESPIRITO SANTO",
    "SECRETARIA DE ESTADO DE SAUDE DO ESPIRITO SANTO",
  ];
  const orgaoSeplag = [
    "SEPLAG",
    "SEPLAG MG",
    "SECRETARIA DE ESTADO DE PLANEJAMENTO E GESTAO",
    "SECRETARIA DE ESTADO DE PLANEJAMENTO E GESTAO - SEPLAG",
  ];

  if (orgaoSesa.includes(nomeOrgao) && (estado === "ESPIRITO SANTO (ES)" || estado === "ES")) {
    declaracoes.push("*Conforme convenio 26/03, informamos que os precos contidos nessa proposta comercial estao deduzidos do icms e comprovados na nota fiscal de faturamento da venda.");
  } else if (orgaoSeplag.includes(nomeOrgao) && (estado === "MINAS GERAIS (MG)" || estado === "MG")) {
    declaracoes.push("- Serao atendidas todas as condicoes comerciais estabelecidas no Anexo I Termo de Referencia, deste Edital de Pregao Eletronico;");
    declaracoes.push("- Esta proposta foi elaborada de forma independente;");
    declaracoes.push("- As informacoes disponibilizadas neste documento estao sujeitas ao previsto na Lei no 13.709, de 2018, Lei Geral de Protecao de Dados Pessoais (LGPD).");
  }

  return declaracoes;
};

export default function Proposta({ empresa = "UNIQUE", produtos = [] }: PropostaProps) {
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa>(empresa);
  const [header, setHeader] = useState<PropostaHeader>(buildDefaultHeader());
  const [itens, setItens] = useState<PropostaItem[]>([buildDefaultItem()]);

  const config = COMPANY_CONFIG[selectedEmpresa];

  const declaracoesOrgao = useMemo(
    () => getDeclaracoesPorOrgao(header.orgao, header.estadoUf),
    [header.orgao, header.estadoUf]
  );

  const totalProposta = useMemo(() => {
    return itens.reduce((acc, item) => {
      const valorJ = parseNumber(item.valorTotalSemIcms);
      const valorH = parseNumber(item.valorTotalComIcms);
      if (valorJ && valorJ > 0) return acc + valorJ;
      if (valorH && valorH > 0) return acc + valorH;
      return acc;
    }, 0);
  }, [itens]);

  const totalExtenso = totalProposta > 0
    ? `VALOR TOTAL DA PROPOSTA: ${numeroParaExtensoMonetario(totalProposta).toUpperCase()}`
    : "VALOR TOTAL DA PROPOSTA: ZERO REAIS";

  const updateHeader = (field: keyof PropostaHeader, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeaderBlur = (field: keyof PropostaHeader) => {
    setHeader((prev) => {
      switch (field) {
        case "pregao":
          return { ...prev, pregao: formatPrefixo(prev.pregao, "Pregao Eletronico No ") };
        case "processo":
          return { ...prev, processo: prev.processo ? `Processo No ${prev.processo.replace(/Processo No /i, "").trim()}` : "Processo No " };
        case "abertura":
          return { ...prev, abertura: formatDataAbertura(prev.abertura) };
        case "validadeProposta":
          return { ...prev, validadeProposta: formatValidadeProposta(prev.validadeProposta) };
        case "prazoPagamento":
          return { ...prev, prazoPagamento: formatPrazoPagamento(prev.prazoPagamento) };
        case "vigenciaAta":
          return { ...prev, vigenciaAta: formatVigenciaAta(prev.vigenciaAta) };
        case "prazoEntrega":
          return { ...prev, prazoEntrega: formatPrazoEntrega(prev.prazoEntrega) };
        case "validadeObjeto":
          return { ...prev, validadeObjeto: formatValidadeObjeto(prev.validadeObjeto) };
        case "orgao":
          return { ...prev, orgao: formatNomeOrgao(prev.orgao) };
        case "estadoUf":
          return { ...prev, estadoUf: getNomeEstado(prev.estadoUf) };
        default:
          return prev;
      }
    });
  };

  const applyRecalculo = (item: PropostaItem): PropostaItem => {
    const quantidade = parseNumber(item.quantidade) || 0;
    let valorG = parseNumber(item.valorUnitarioComIcms);
    let valorI = parseNumber(item.valorUnitarioSemIcms);
    const convenio = identificarConvenio(item.descricao);
    const uf = header.estadoUf || "SP";

    if ((convenio === "CONV_162_94" || convenio === "CONV_140_01" || convenio === "CONV_10_02") && valorI === null) {
      valorI = valorG;
      valorG = null;
    }

    if ((convenio === "CONFAZ_87_02" || convenio === "SEM_CONVENIO") && valorI !== null && valorI > 0) {
      const fator = calcularFatorICMS(uf, item.marca);
      valorG = round4(valorI / fator);
    }

    const totalComIcms = valorG !== null ? valorG * quantidade : null;
    const totalSemIcms = valorI !== null ? valorI * quantidade : null;

    return {
      ...item,
      valorUnitarioComIcms: valorG !== null ? String(valorG) : "",
      valorUnitarioSemIcms: valorI !== null ? String(valorI) : "",
      valorTotalComIcms: totalComIcms !== null ? String(totalComIcms) : "",
      valorTotalSemIcms: totalSemIcms !== null ? String(totalSemIcms) : "",
    };
  };

  const handleItemChange = (id: string, field: keyof PropostaItem, value: string | boolean) => {
    setItens((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value } as PropostaItem;
      if (field === "descricao" && typeof value === "string") {
        updated.descricao = formatDescricao(value);
      }
      if (field === "cap" && typeof value === "boolean") {
        updated.descricao = applyCapToDescricao(updated.descricao, value);
      }
      if (["quantidade", "valorUnitarioComIcms", "valorUnitarioSemIcms", "descricao", "marca"].includes(field)) {
        return applyRecalculo(updated);
      }
      return updated;
    }));
  };

  const handleDescricaoBlur = (id: string) => {
    setItens((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const texto = item.descricao.trim();
      if (!texto) return item;

      const codigoEncontrado = texto.match(/^\d+$/);
      if (codigoEncontrado) {
        const produto = produtos.find((p) => p.codeuro && p.codeuro.trim() === texto);
        if (produto) {
          const marcaMatch = produto.descricao.match(/MARCA:\s*([^\/]+)/i);
          const marca = marcaMatch?.[1]?.trim() || item.marca;
          return applyRecalculo({
            ...item,
            descricao: produto.apresentacaoSugerida || produto.descricao || item.descricao,
            fabricante: produto.fabricante || item.fabricante,
            marca,
            unidade: produto.unidade || item.unidade,
          });
        }
        const apresentacao = bancoApresentacoes.find((p) => p.codigo === texto);
        if (apresentacao) {
          const marcaMatch = apresentacao.descCompleta.match(/MARCA:\s*([^\/]+)/i);
          const marca = marcaMatch?.[1]?.trim() || item.marca;
          return applyRecalculo({
            ...item,
            descricao: apresentacao.descCompleta,
            fabricante: marca,
          });
        }
      }
      return applyRecalculo(item);
    }));
  };

  const addItem = () => setItens((prev) => [...prev, buildDefaultItem()]);

  const removeItem = (id: string) => setItens((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-6 lg:p-10 font-['Times_New_Roman'] text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-xl font-bold uppercase">Proposta Comercial</h1>
            <p className="text-sm text-slate-600">Layout dinamico por empresa e calculos automaticos.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase text-slate-500">Empresa</label>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value as Empresa)}
              className="border border-slate-300 rounded px-2 py-1 text-sm uppercase"
            >
              <option value="NSA">NSA</option>
              <option value="COSTA">COSTA CAMARGO</option>
              <option value="UNIQUE">UNIQUE</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-300 shadow-sm print:border-black">
          <div className="border-b border-slate-300 print:border-black">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center">
              <div className="p-4 space-y-2">
                <div className="text-xs font-bold uppercase">Ao</div>
                <input
                  value={header.orgao}
                  onChange={(e) => updateHeader("orgao", e.target.value)}
                  onBlur={() => handleHeaderBlur("orgao")}
                  className="w-full border-b border-slate-400 uppercase text-sm font-semibold"
                  placeholder="Orgao Licitante"
                />
                <input
                  value={header.estadoUf}
                  onChange={(e) => updateHeader("estadoUf", e.target.value)}
                  onBlur={() => handleHeaderBlur("estadoUf")}
                  className="w-full border-b border-slate-400 uppercase text-sm"
                  placeholder="Estado / UF"
                />
              </div>
              <div className="flex items-center justify-center p-4">
                <img src={config.logoSrc} alt={config.logoAlt} className="h-16 object-contain" />
              </div>
              <div className="p-4 text-right space-y-1 text-xs">
                {config.enderecoTopo?.map((linha) => (
                  <div key={linha}>{linha}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm border-b border-slate-300 print:border-black">
            <input
              value={header.pregao}
              onChange={(e) => updateHeader("pregao", e.target.value)}
              onBlur={() => handleHeaderBlur("pregao")}
              className="border-b border-slate-400 text-red-600 font-semibold"
              placeholder="Pregao Eletronico No"
            />
            <input
              value={header.processo}
              onChange={(e) => updateHeader("processo", e.target.value)}
              onBlur={() => handleHeaderBlur("processo")}
              className="border-b border-slate-400 text-red-600 font-semibold"
              placeholder="Processo No"
            />
            <input
              value={header.abertura}
              onChange={(e) => updateHeader("abertura", e.target.value)}
              onBlur={() => handleHeaderBlur("abertura")}
              className="border-b border-slate-400 text-red-600 font-semibold"
              placeholder="Abertura:"
            />
            <input
              value={header.web}
              onChange={(e) => updateHeader("web", e.target.value)}
              className="border-b border-slate-400 uppercase"
              placeholder="WEB"
            />
          </div>

          <div className="bg-slate-200 text-center text-sm font-bold uppercase py-1 border-b border-slate-300 print:border-black">
            Proposta Comercial
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-black text-white uppercase">
                <tr>
                  <th className="border border-slate-300 px-2 py-1">Item</th>
                  <th className="border border-slate-300 px-2 py-1">Descricao</th>
                  <th className="border border-slate-300 px-2 py-1">Unidade</th>
                  <th className="border border-slate-300 px-2 py-1">Quantidade</th>
                  <th className="border border-slate-300 px-2 py-1">Fabricante</th>
                  <th className="border border-slate-300 px-2 py-1">Nome Comercial</th>
                  <th className="border border-slate-300 px-2 py-1">Valor Unitario com ICMS</th>
                  <th className="border border-slate-300 px-2 py-1">Valor Total com ICMS</th>
                  <th className="border border-slate-300 px-2 py-1">Valor Unitario sem ICMS</th>
                  <th className="border border-slate-300 px-2 py-1">Valor Total sem ICMS</th>
                  <th className="border border-slate-300 px-2 py-1 print:hidden">CAP</th>
                  <th className="border border-slate-300 px-2 py-1 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        value={item.item}
                        onChange={(e) => handleItemChange(item.id, "item", e.target.value)}
                        className="w-16 text-center"
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <textarea
                        value={item.descricao}
                        onChange={(e) => handleItemChange(item.id, "descricao", e.target.value)}
                        onBlur={() => handleDescricaoBlur(item.id)}
                        className="w-72 min-h-[80px] whitespace-pre-line"
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        value={item.unidade}
                        onChange={(e) => handleItemChange(item.id, "unidade", e.target.value)}
                        className="w-20 text-center uppercase"
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(item.id, "quantidade", e.target.value)}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        value={item.fabricante}
                        onChange={(e) => handleItemChange(item.id, "fabricante", e.target.value)}
                        className="w-28 uppercase"
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        value={item.nomeComercial}
                        onChange={(e) => handleItemChange(item.id, "nomeComercial", e.target.value)}
                        className="w-28 uppercase"
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      <input
                        value={item.valorUnitarioComIcms}
                        onChange={(e) => handleItemChange(item.id, "valorUnitarioComIcms", e.target.value)}
                        className="w-24 text-right"
                      />
                      <div className="text-[10px] text-slate-500">{formatMoney(item.valorUnitarioComIcms)}</div>
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      {formatMoney(item.valorTotalComIcms)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      <input
                        value={item.valorUnitarioSemIcms}
                        onChange={(e) => handleItemChange(item.id, "valorUnitarioSemIcms", e.target.value)}
                        className="w-24 text-right"
                      />
                      <div className="text-[10px] text-slate-500">{formatMoney(item.valorUnitarioSemIcms)}</div>
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      {formatMoney(item.valorTotalSemIcms)}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center print:hidden">
                      <input
                        type="checkbox"
                        checked={item.cap}
                        onChange={(e) => handleItemChange(item.id, "cap", e.target.checked)}
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center print:hidden">
                      <button onClick={() => removeItem(item.id)} className="text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-300 print:border-black px-4 py-2 text-xs font-bold uppercase flex items-center justify-between">
            <span>{totalExtenso}</span>
            <span className="text-sm font-bold">{formatMoney(totalProposta)}</span>
          </div>

          <div className="bg-slate-200 text-center text-xs font-bold uppercase py-1 border-t border-b border-slate-300 print:border-black">
            Condicoes do Edital
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 text-sm">
            <div>
              <label className="font-semibold">Estado de Faturamento:</label>
              <input
                value={header.estadoFaturamento}
                onChange={(e) => updateHeader("estadoFaturamento", e.target.value)}
                className="ml-2 border-b border-slate-300 uppercase"
              />
            </div>
            <div>
              <input
                value={header.validadeProposta}
                onChange={(e) => updateHeader("validadeProposta", e.target.value)}
                onBlur={() => handleHeaderBlur("validadeProposta")}
                className="w-full border-b border-slate-300"
                placeholder="Validade da Proposta"
              />
            </div>
            <div>
              <input
                value={header.prazoPagamento}
                onChange={(e) => updateHeader("prazoPagamento", e.target.value)}
                onBlur={() => handleHeaderBlur("prazoPagamento")}
                className="w-full border-b border-slate-300"
                placeholder="Prazo de Pagamento"
              />
            </div>
            <div>
              <input
                value={header.vigenciaAta}
                onChange={(e) => updateHeader("vigenciaAta", e.target.value)}
                onBlur={() => handleHeaderBlur("vigenciaAta")}
                className="w-full border-b border-slate-300"
                placeholder="Vigencia da Ata"
              />
            </div>
            <div>
              <input
                value={header.prazoEntrega}
                onChange={(e) => updateHeader("prazoEntrega", e.target.value)}
                onBlur={() => handleHeaderBlur("prazoEntrega")}
                className="w-full border-b border-slate-300"
                placeholder="Prazo de Entrega"
              />
            </div>
            <div>
              <input
                value={header.validadeObjeto}
                onChange={(e) => updateHeader("validadeObjeto", e.target.value)}
                onBlur={() => handleHeaderBlur("validadeObjeto")}
                className="w-full border-b border-slate-300"
                placeholder="Validade do Objeto"
              />
            </div>
          </div>

          <div className="bg-slate-200 text-center text-xs font-bold uppercase py-1 border-t border-b border-slate-300 print:border-black">
            Observacoes
          </div>

          <div className="p-4 text-xs space-y-2">
            {config.observacoesFixas.map((linha) => (
              <p key={linha}>{linha}</p>
            ))}
            {declaracoesOrgao.map((linha) => (
              <p key={linha} className="font-bold">{linha}</p>
            ))}
            <textarea
              value={header.observacoes}
              onChange={(e) => updateHeader("observacoes", e.target.value)}
              className="w-full border border-slate-300 p-2 min-h-[80px]"
              placeholder="Observacoes adicionais"
            />
          </div>

          <div className="bg-slate-200 text-center text-xs font-bold uppercase py-1 border-t border-b border-slate-300 print:border-black">
            Dados para assinatura de contrato
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              {config.dadosEmpresa.map((linha) => (
                <div key={linha.label}>
                  <span className="font-semibold">{linha.label}:</span> {linha.value}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {config.contatos.map((linha) => (
                <div key={linha.label}>
                  <span className="font-semibold">{linha.label}:</span> {linha.value}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {config.bancos.map((linha) => (
                <div key={linha.label}>
                  <span className="font-semibold">{linha.label}:</span> {linha.value}
                </div>
              ))}
            </div>
          </div>

          {config.declaracoesFixas.length > 0 && (
            <div className="p-4 border-t border-slate-300 print:border-black text-xs space-y-2">
              <div className="font-bold uppercase text-center">Declaracoes</div>
              {config.declaracoesFixas.map((linha) => (
                <p key={linha}>{linha}</p>
              ))}
            </div>
          )}

          {selectedEmpresa === "UNIQUE" && (
            <div className="p-4 border-t border-slate-300 print:border-black text-center text-xs text-red-600 font-bold uppercase">
              Em virtude da legislacao vigente somos impossibilitados de efetuar fracionamento dos medicamentos
            </div>
          )}

          <div className="p-6 text-center text-xs space-y-4">
            <input
              value={header.cidadeData}
              onChange={(e) => updateHeader("cidadeData", e.target.value)}
              className="w-full text-center border-b border-slate-300"
              placeholder="Cidade - UF, data."
            />
            <div className="mt-6 border-t border-slate-400 inline-block px-10 pt-2 text-xs">
              {config.assinatura.map((linha) => (
                <div key={linha}>{linha}</div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={addItem}
          className="print:hidden flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm font-semibold"
        >
          <Plus size={16} />
          Adicionar item
        </button>
      </div>
    </div>
  );
}