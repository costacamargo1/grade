"use client";

import { useMemo, useState, type ReactNode, Fragment } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Produto } from "../lib/types";
import { formatarDataInteligente, removerAcentos } from "../lib/formatters";
import {
  formatCurrencyForInput,
  formatCurrencyForDisplay,
  handleCurrencyInputChange,
  parseCurrency,
} from "../lib/currencyUtils";

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
  observacoesFixas: ReactNode[];
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
      <p key="costa-empenho-endereco" className="text-sm text-slate-800 leading-relaxed">
        <strong>PARA ENVIO DE EMPENHOS:</strong>{" "}
        <strong>empenho@costacamargo.com.br</strong>
      </p>,
      <p key="costa-empenho-observacao" className="text-sm text-slate-700 leading-relaxed mt-1">
        Observação: A empresa somente processará os empenhos enviados para o endereço
        correto de correspondência eletrônica{" "}
        <strong>empenho@costacamargo.com.br</strong>. Eventual envio para endereço ou
        setor diverso do informado na presente proposta é de inteira responsabilidade
        do remetente, sendo que a empresa não será responsável pelo atraso ou ausência
        de resposta. A empresa esclarece que somente o setor de{" "}
        <strong>Empenho</strong> possui poderes para receber e processar os pedidos de
        empenho, sendo de inteira responsabilidade do Contratante realizar o pedido nos
        moldes da presente proposta, sob pena de responder pelos seus próprios atos. Por
        fim, a empresa não se responsabiliza caso os empenhos sejam enviados para
        endereços diversos ou incorretos.
      </p>,

        <p key="costa-notificacoes-endereco" className="text-sm text-slate-800 leading-relaxed">
        <strong>PARA ENVIO DE NOTIFICAÇÕES:</strong>{" "}
        <strong>notificacoes@costacamargo.com.br</strong>
      </p>,
      <p key="costa-empenho-observacao" className="text-sm text-justify text-slate-700 leading-relaxed mt-1">
        Observação: A empresa somente processará as notificações enviadas para o endereço
        correto de correspondência eletrônica{" "}
        <strong>notificacao@costacamargo.com.br</strong>. Eventual envio para endereço ou
        setor diverso do informado na presente proposta é de inteira responsabilidade
        do remetente, sendo que a empresa não será responsável pelo atraso ou ausência
        de resposta. A empresa esclarece que somente o setor de{" "}
        <strong>Notificação</strong> possui poderes para receber e processar os ofícios de
        notificações, sendo de inteira responsabilidade do Contratante realizar o pedido nos
        moldes da presente proposta, sob pena de responder pelos seus próprios atos. Por
        fim, a empresa não se responsabiliza caso as notificações sejam enviadas para
        endereços diversos ou incorretos.
      </p>,
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
        <p key="unique-empenho-observacao" className="text-sm text-justify text-slate-700 leading-relaxed mt-1">
        A empresa esclarece que somente o setor de <strong>EMPENHO e NOTIFICAÇÕES</strong> possuem poderes para 
        receber e processar os pedidos de <strong>empenho/autorizações de fornecimento OU notificações</strong> respectivamente, 
        sendo de inteira responsabilidade do CONTRATANTE realizar o pedido nos moldes da presente proposta, sob 
        pena de responder pelos seus próprios atos.  Desta forma, a empresa não se responsabiliza caso os <strong>empenhos </strong>
        ou as <strong>notificações</strong> sejam enviados para endereços diversos ou incorretos.{" "}
        </p>,
      <p key="unique-empenho-emails" className="text-sm text-slate-800 leading-relaxed mt-2">
        <strong>EMPENHOS: EMPENHO@UNIQUEMEDICAMENTOS.COM.BR</strong>
        <br/>
        <strong>NOTIFICAÇÕES: NOTIFICACAO@UNIQUEMEDICAMENTOS.COM.BR</strong>
      </p>,
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

const normalizeNumericInput = (value: string): string =>
  value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");

const formatQuantidadeInput = (value: string): string => {
  const cleaned = value.replace(/[^0-9,]/g, "");
  if (!cleaned) return "";
  const [intPartRaw, decimalPartRaw] = cleaned.split(",");
  const intPart = intPartRaw.replace(/^0+(?=\d)/, "");
  const formattedInt = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
  if (decimalPartRaw !== undefined) {
    return decimalPartRaw.length ? `${formattedInt},${decimalPartRaw}` : `${formattedInt},`;
  }
  return formattedInt;
};

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const parsed = parseFloat(normalizeNumericInput(value));
  return Number.isNaN(parsed) ? null : parsed;
};

const parseCurrencyValue = (value: string): number | null => {
  if (!value) return null;
  return parseCurrency(value);
};

const formatCurrencyDisplay = (value: number | string): string => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = typeof value === "string" ? parseCurrency(value) : value;
  if (Number.isNaN(parsed)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

const formatCurrencyTotalDisplay = (value: number | string): string => {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = typeof value === "string" ? parseCurrency(value) : value;
  if (Number.isNaN(parsed)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

const normalizeSearchText = (value: string): string =>
  removerAcentos(value)
    .toUpperCase()
    .replace(/[^0-9A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractMarca = (descricao: string): string | null => {
  if (!descricao) return null;
  const match = descricao.match(/MARCA:\s*([^/]+)/i);
  return match?.[1]?.trim() || null;
};

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
  if (!valorDigitado) return "";
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
        return `${numeroPregao.padStart(4, "0")}/${ano}`;
      }
    }
  }
  if (/^\d+$/.test(valorDigitado)) {
    if (valorDigitado.length >= 6) {
      const ano = valorDigitado.slice(-4);
      const numero = valorDigitado.slice(0, -4);
      const anoNum = Number(ano);
      if (anoNum >= 2024 && anoNum <= 2030) {
        return `${numero.padStart(4, "0")}/${ano}`;
      }
    } else {
      const anoAtual = new Date().getFullYear();
      return `${valorDigitado.padStart(4, "0")}/${anoAtual}`;
    }
  }
  return valorDigitado;
};

const formatDataAbertura = (value: string): string => {
  const cleaned = value.replace(/^ABERTURA:\s*/i, "").trim();
  if (!cleaned) return "";
  const formatted = formatarDataInteligente(cleaned);
  return formatted || cleaned;
};

const formatValidadeProposta = (value: string): string => {
  const prefixo = "";
  const sufixo = " dias, a contar da data de sua apresentação.";
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
  const prefixo = "";
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
  const prefixo = "";
  const sufixo = " meses.";
  const numero = value.trim() ? Number(value.trim()) : 12;
  const extenso = numeroParaExtenso(numero);
  return `${prefixo}${numero} (${extenso})${sufixo}`;
};

const formatPrazoEntrega = (value: string): string => {
  const prefixo = "";
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
  const prefixo = "";
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
  const [editingCurrency, setEditingCurrency] = useState<{
    id: string;
    field: "valorUnitarioComIcms" | "valorUnitarioSemIcms";
    value: string;
  } | null>(null);

  const config = COMPANY_CONFIG[selectedEmpresa];

  const declaracoesOrgao = useMemo(
    () => getDeclaracoesPorOrgao(header.orgao, header.estadoUf),
    [header.orgao, header.estadoUf]
  );

  const totalProposta = useMemo(() => {
    return itens.reduce((acc, item) => {
      const valorJ = parseCurrencyValue(item.valorTotalSemIcms);
      const valorH = parseCurrencyValue(item.valorTotalComIcms);
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
            return { ...prev, processo: prev.processo ? prev.processo.replace(/Processo No /i, "").trim() : "" };
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
    let valorG = parseCurrencyValue(item.valorUnitarioComIcms);
    let valorI = parseCurrencyValue(item.valorUnitarioSemIcms);
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
      if (field === "quantidade" && typeof value === "string") {
        updated.quantidade = formatQuantidadeInput(value);
      }
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

  const getCurrencyInputValue = (item: PropostaItem, field: "valorUnitarioComIcms" | "valorUnitarioSemIcms") => {
    if (editingCurrency && editingCurrency.id === item.id && editingCurrency.field === field) {
      return editingCurrency.value;
    }
    const parsed = parseCurrencyValue(item[field]);
    return parsed ? formatCurrencyForDisplay(parsed) : "";
  };

  const handleCurrencyFocus = (id: string, field: "valorUnitarioComIcms" | "valorUnitarioSemIcms") => {
    const item = itens.find((current) => current.id === id);
    if (!item) return;
    const parsed = parseCurrencyValue(item[field]);
    setEditingCurrency({
      id,
      field,
      value: parsed ? formatCurrencyForInput(parsed) : "",
    });
  };

  const handleCurrencyChange = (value: string) => {
    if (!editingCurrency) return;
    setEditingCurrency({
      ...editingCurrency,
      value: handleCurrencyInputChange(value),
    });
  };

  const handleCurrencyBlur = () => {
    if (!editingCurrency) return;
    const { id, field, value } = editingCurrency;
    const numericValue = parseCurrency(value);
    setItens((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const updated = {
        ...item,
        [field]: numericValue ? String(numericValue) : "",
      } as PropostaItem;
      return applyRecalculo(updated);
    }));
    setEditingCurrency(null);
  };

  const handleDescricaoBlur = (id: string) => {
    setItens((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const texto = item.descricao.trim();
      if (!texto) return item;

      const codigoDigitado = texto.toUpperCase();
      const produtoPorCodigo = produtos.find(
        (produto) =>
          produto.codeuro &&
          produto.codeuro.trim().toUpperCase() === codigoDigitado
      );
      if (produtoPorCodigo) {
        const marca = extractMarca(produtoPorCodigo.descricao || "") || item.marca;
        return applyRecalculo({
          ...item,
          descricao: produtoPorCodigo.descricao || item.descricao,
          fabricante: produtoPorCodigo.fabricante || item.fabricante,
          marca,
          unidade: produtoPorCodigo.unidade || item.unidade,
        });
      }

      const palavras = normalizeSearchText(texto).split(" ").filter(Boolean);
      if (palavras.length) {
        const produtoPorDescricao = produtos.find((produto) => {
          if (!produto.descricao) return false;
          const descricaoNormalizada = normalizeSearchText(produto.descricao);
          return palavras.every((palavra) => descricaoNormalizada.includes(palavra));
        });
        if (produtoPorDescricao) {
          const marca = extractMarca(produtoPorDescricao.descricao || "") || item.marca;
          return applyRecalculo({
            ...item,
            descricao: produtoPorDescricao.descricao || item.descricao,
            fabricante: produtoPorDescricao.fabricante || item.fabricante,
            marca,
            unidade: produtoPorDescricao.unidade || item.unidade,
          });
        }
      }
      return applyRecalculo(item);
    }));
  };

  const addItem = () => setItens((prev) => [...prev, buildDefaultItem()]);

  const removeItem = (id: string) => setItens((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-2xl mx-auto space-y-8">
        {/* Bloco de Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Proposta Comercial</h1>
            <p className="text-sm text-slate-500 mt-1">Layout dinâmico por empresa e cálculos automáticos.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600">Empresa:</label>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value as Empresa)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NSA">NSA</option>
              <option value="COSTA">COSTA CAMARGO</option>
              <option value="UNIQUE">UNIQUE</option>
            </select>
          </div>
        </div>

        {/* Card Principal da Proposta */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 print:border-black print:shadow-none">
          {/* Cabeçalho do Card */}
          <div className="border-b border-slate-200 print:border-black">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center">
              <div className="p-6">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">AO</div>
                <input
                  value={header.orgao}
                  onChange={(e) => updateHeader("orgao", e.target.value)}
                  onBlur={() => handleHeaderBlur("orgao")}
                  className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none uppercase text-base font-semibold text-slate-800 pb-1"
                  placeholder="Órgão Licitante"
                />
                <input
                  value={header.estadoUf}
                  onChange={(e) => updateHeader("estadoUf", e.target.value)}
                  onBlur={() => handleHeaderBlur("estadoUf")}
                  className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none uppercase text-sm text-slate-600 mt-2 pb-1"
                  placeholder="Estado / UF"
                />
              </div>
              <div className="flex items-center justify-center p-6 border-l border-r border-slate-200">
                <img src={config.logoSrc} alt={config.logoAlt} className="h-20 object-contain" />
              </div>
              <div className="p-6 text-right space-y-1 text-xs text-slate-600">
                {config.enderecoTopo?.map((linha) => (
                  <div key={linha}>{linha}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalhes do Processo */}
          <div className="p-6 border-b border-slate-200 print:border-black">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm  text-slate-700 w-48">Pregão Eletrônico Nº:</span>
                <input
                  value={header.pregao}
                  onChange={(e) => updateHeader("pregao", e.target.value)}
                  onBlur={() => handleHeaderBlur("pregao")}
                  className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none text-sm font-semibold text-slate-900"
                  placeholder="Ex: 123/2024"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-700 w-48">Processo Nº:</span>
                <input
                  value={header.processo}
                  onChange={(e) => updateHeader("processo", e.target.value)}
                  onBlur={() => handleHeaderBlur("processo")}
                  className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none text-sm font-semibold text-slate-900"
                  placeholder="Ex: 98765/2024"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-700 w-48">Abertura:</span>
                <input
                  value={header.abertura}
                  onChange={(e) => updateHeader("abertura", e.target.value)}
                  onBlur={() => handleHeaderBlur("abertura")}
                  className="w-full border-b-2 border-slate-200 focus:border-blue-500 outline-none text-sm font-semibold text-slate-900"
                  placeholder="Ex: 10/10/2024 09:00"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 text-center text-sm font-bold uppercase py-2 border-b border-slate-200 print:border-black text-slate-700">
            Proposta Comercial
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-800 text-white uppercase font-semibold divide-x divide-slate-500">
                <tr>
                  <th className="px-3 py-3 text-center">Item</th>
                  <th className="px-3 py-3 text-center w-2/5">Descrição Detalhada</th>
                  <th className="px-3 py-3 text-center">UNIDADE</th>
                  <th className="px-3 py-3 text-center">QUANTIDADE</th>
                  <th className="px-3 py-3 text-center">FABRICANTE</th>
                  <th className="px-3 py-3 text-center">NOME COMERCIAL</th>
                  <th className="px-3 py-3 text-right">Val. c/ ICMS</th>
                  <th className="px-3 py-3 text-right">Total c/ ICMS</th>
                  <th className="px-3 py-3 text-right">Val. s/ ICMS</th>
                  <th className="px-3 py-3 text-right">Total s/ ICMS</th>
                  <th className="px-3 py-3 text-center print:hidden">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-x divide-slate-300">
                {itens.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-slate-50">
                    <td className="px-2 py-1">
                      <input
                        value={item.item}
                        onChange={(e) => handleItemChange(item.id, "item", e.target.value)}
                        className="text-slate-900 w-16 p-2 border border-transparent rounded-md bg-transparent text-center focus:bg-white focus:border-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <textarea
                        value={item.descricao}
                        onChange={(e) => handleItemChange(item.id, "descricao", e.target.value)}
                        onBlur={() => handleDescricaoBlur(item.id)}
                        ref={(el) => {
                          if (!el) return;
                          el.style.height = "auto";
                          el.style.height = `${el.scrollHeight}px`;
                        }}
                        onInput={(e) => {
                          const target = e.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="text-slate-900 text-justify w-full min-h-[80px] p-2 border border-transparent rounded-md bg-transparent whitespace-pre-line resize-none overflow-hidden focus:bg-white focus:border-slate-300 focus:outline-none"
                        rows={3}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <textarea
                        value={item.unidade}
                        onChange={(e) => handleItemChange(item.id, "unidade", e.target.value)}
                        onInput={(e) => {
                          const target = e.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                        className="text-slate-900 text-center w-20 min-h-[32px] p-2 border border-transparent rounded-md bg-transparent uppercase resize-none overflow-hidden whitespace-pre-line break-words focus:bg-white focus:border-slate-300 focus:outline-none"
                        rows={1}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(item.id, "quantidade", e.target.value)}
                        className="text-slate-900 text-center w-20 p-2 border border-transparent rounded-md bg-transparent text-center focus:bg-white focus:border-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={item.fabricante}
                        onChange={(e) => handleItemChange(item.id, "fabricante", e.target.value)}
                        className="text-slate-900 text-center w-32 p-2 border border-transparent rounded-md bg-transparent uppercase focus:bg-white focus:border-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        value={item.marca}
                        onChange={(e) => handleItemChange(item.id, "marca", e.target.value)}
                        className="text-slate-900 text-center w-32 p-2 border border-transparent rounded-md bg-transparent uppercase focus:bg-white focus:border-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1 text-right">
                      <input
                        value={getCurrencyInputValue(item, "valorUnitarioComIcms")}
                        onFocus={() => handleCurrencyFocus(item.id, "valorUnitarioComIcms")}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        onBlur={handleCurrencyBlur}
                        className="text-slate-900 w-28 p-2 border border-transparent rounded-md bg-transparent text-right focus:bg-white focus:border-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1 text-right font-medium text-slate-700">
                      {formatCurrencyTotalDisplay(item.valorTotalComIcms)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      <input
                        value={getCurrencyInputValue(item, "valorUnitarioSemIcms")}
                        onFocus={() => handleCurrencyFocus(item.id, "valorUnitarioSemIcms")}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        onBlur={handleCurrencyBlur}
                        className="text-slate-900 w-28 p-2 border border-transparent rounded-md bg-transparent text-right focus:bg-white focus:border-slate-300 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1 text-right font-medium text-slate-700">
                      {formatCurrencyTotalDisplay(item.valorTotalSemIcms)}
                    </td>
                    <td className="px-2 py-1 text-center print:hidden">
                      <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total e Condições */}
          <div className="border-t border-slate-200 print:border-black p-6">
            <div className="flex justify-between items-center bg-slate-100 rounded-lg p-4 mb-6">
              <span className="text-xs font-semibold uppercase text-slate-600">{totalExtenso}</span>
              <span className="text-xl font-bold text-slate-800">{formatCurrencyDisplay(totalProposta)}</span>
            </div>

            <div className="bg-slate-50 text-center text-sm font-bold uppercase py-2 border-b border-t border-slate-200 print:border-black mb-6 text-slate-700">
              Condições do Edital
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">VALIDADE DA PROPOSTA</label>
                <input
                  value={header.validadeProposta}
                  onChange={(e) => updateHeader("validadeProposta", e.target.value)}
                  onBlur={() => handleHeaderBlur("validadeProposta")}
                  className="text-slate-900 w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: 60 dias"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">PRAZO DE PAGAMENTO</label>
                <input
                  value={header.prazoPagamento}
                  onChange={(e) => updateHeader("prazoPagamento", e.target.value)}
                  onBlur={() => handleHeaderBlur("prazoPagamento")}
                  className="text-slate-900 w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: 30 dias"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">VIGÊNCIA DA ATA</label>
                <input
                  value={header.vigenciaAta}
                  onChange={(e) => updateHeader("vigenciaAta", e.target.value)}
                  onBlur={() => handleHeaderBlur("vigenciaAta")}
                  className="text-slate-900 w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: 12 meses"
                />
              </div>
              <div className="relative md:col-span-2">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">PRAZO DE ENTREGA</label>
                <input
                  value={header.prazoEntrega}
                  onChange={(e) => updateHeader("prazoEntrega", e.target.value)}
                  onBlur={() => handleHeaderBlur("prazoEntrega")}
                  className="w-[80ch] text-slate-900 pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: 15 dias corridos"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-bold text-slate-500">VALIDADE DO OBJETO</label>
                <input
                  value={header.validadeObjeto}
                  onChange={(e) => updateHeader("validadeObjeto", e.target.value)}
                  onBlur={() => handleHeaderBlur("validadeObjeto")}
                  className="text-slate-900 w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: 12 meses"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="border-t border-slate-200 print:border-black p-6">
            <div className="text-slate-700 bg-slate-50 text-center text-sm font-bold uppercase py-2 border-b border-t border-slate-200 print:border-black mb-6">
              PARA ENVIO DE PEDIDOS DE EMPENHO OU NOTIFICAÇÕES
            </div>
            <div className="text-xs text-slate-600 space-y-3">
              {config.observacoesFixas.map((linha, index) =>
                typeof linha === "string" ? (
                  <p key={`obs-${index}`}>{linha}</p>
                ) : (
                  <Fragment key={`obs-${index}`}>{linha}</Fragment>
                )
              )}
              {declaracoesOrgao.map((linha) => (
                <p key={linha} className="font-bold text-slate-700">{linha}</p>
              ))}
              <textarea
                value={header.observacoes}
                onChange={(e) => updateHeader("observacoes", e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-4 min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          {/* Dados e Declarações */}
          <div className="border-t border-slate-200 print:border-black p-6">
            <div className="text-slate-700 bg-slate-50 text-center text-sm font-bold uppercase py-2 border-b border-t border-slate-200 print:border-black mb-6">
              Dados para Assinatura de Contrato
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-600">
              <div className="space-y-2">
                {config.dadosEmpresa.map((linha) => (
                  <div key={linha.label}>
                    <span className="font-bold text-slate-700">{linha.label}:</span> {linha.value}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {config.contatos.map((linha) => (
                  <div key={linha.label}>
                    <span className="font-bold text-slate-700">{linha.label}:</span> {linha.value}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {config.bancos.map((linha) => (
                  <div key={linha.label}>
                    <span className="font-bold text-slate-700">{linha.label}:</span> {linha.value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {config.declaracoesFixas.length > 0 && (
            <div className="border-t border-slate-200 print:border-black p-6">
              <div className="text-slate-700 bg-slate-50 text-center text-sm font-bold uppercase py-2 border-b border-t border-slate-200 print:border-black mb-6">
                Declarações
              </div>
              <div className="text-xs text-slate-600 space-y-3">
                {config.declaracoesFixas.map((linha) => (
                  <p key={linha}>{linha}</p>
                ))}
              </div>
            </div>
          )}

          {selectedEmpresa === "UNIQUE" && (
            <div className="border-t border-slate-200 p-4 text-center text-sm text-red-600 font-bold uppercase bg-red-50">
              Em virtude da legislação vigente somos impossibilitados de efetuar fracionamento dos medicamentos
            </div>
          )}

          {/* Assinatura */}
          <div className="border-t border-slate-200 print:border-black p-10 flex flex-col items-center gap-8">
            <input
              value={header.cidadeData}
              onChange={(e) => updateHeader("cidadeData", e.target.value)}
              className="text-slate-900 w-full max-w-sm text-center outline-none pb-1 mb-10 text-sm"
              placeholder="Cidade - UF, DD de MM de AAAA."
            />
            <div className="text-slate-900 border-t-2 border-slate-900 w-80 text-center pt-3 text-sm">
              {config.assinatura.map((linha) => (
                <div key={linha}>{linha}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-start print:hidden">
          <button
            onClick={addItem}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          >
            <Plus size={18} />
            Adicionar Item
          </button>
        </div>
      </div>
    </div>
  );
}
