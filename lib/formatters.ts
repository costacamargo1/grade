// lib/formatters.ts

/**
 * Removes accents from a string.
 * @param texto The input string.
 * @returns The string without accents.
 */
export function removerAcentos(texto: string): string {
    if (!texto) return "";
    const comAcentos = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ";
    const semAcentos = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";
    let novoTexto = texto;
    for (let i = 0; i < comAcentos.length; i++) {
        novoTexto = novoTexto.replace(new RegExp(comAcentos.charAt(i), 'g'), semAcentos.charAt(i));
    }
    return novoTexto;
}


// --- 1. LÓGICA DO EDITAL ---
export function formatarEdital(valor: string): string {
  if (!valor) return "";
  
  const limpo = valor.trim().toUpperCase().replace("EDITAL:", "").trim();
  const anoAtual = new Date().getFullYear();
  
  // Caso 1: Já tem barra (Ex: "123/24")
  if (limpo.includes("/")) {
    const [num, ano] = limpo.split("/");
    let anoCompleto = ano;
    if (ano.length === 2) anoCompleto = "20" + ano;
    
    // Padroniza zeros à esquerda (até 4 dígitos)
    const numFormatado = num.padStart(4, "0"); 
    return `${numFormatado}/${anoCompleto}`;
  }
  
  // Caso 2: Apenas números (Ex: "123" -> vira do ano atual)
  if (/^\d+$/.test(limpo)) {
    // Se for curto (até 5 digitos), assume que é só o numero
    if (limpo.length <= 5) {
      return `${limpo.padStart(4, "0")}/${anoAtual}`;
    }
    // Se for longo (Ex: 1232025), tenta separar
    if (limpo.length >= 6) {
      const anoExtraido = limpo.slice(-4);
      const numExtraido = limpo.slice(0, -4);
      return `${numExtraido.padStart(4, "0")}/${anoExtraido}`;
    }
  }

  return limpo; // Retorna original se não entender
}

// --- 2. LÓGICA DE DATA INTELIGENTE (H, A, T) ---
export function formatarDataInteligente(valor: string): string {
  if (!valor) return "";
  const entrada = valor.toUpperCase().trim();
  
  const hoje = new Date();
  let dataAlvo = new Date();
  let restoHorario = "";

  // Atalhos do VBA
  if (entrada.startsWith("H")) { // HOJE
    restoHorario = entrada.substring(1);
  } 
  else if (entrada.startsWith("A")) { // AMANHÃ
    dataAlvo.setDate(hoje.getDate() + 1);
    restoHorario = entrada.substring(1);
  }
  else if (entrada.startsWith("O")) { // ONTEM (Old)
    dataAlvo.setDate(hoje.getDate() - 1);
    restoHorario = entrada.substring(1);
  }
  else if (entrada.startsWith("T")) { // T + Dias (Ex: T3 = Daqui 3 dias)
    const dias = parseInt(entrada.charAt(1)); // Pega o número logo após o T
    if (!isNaN(dias)) {
      dataAlvo.setDate(hoje.getDate() + dias);
      restoHorario = entrada.substring(2); // O resto é hora
    }
  } else {
    return valor; // Se não for atalho, devolve o que o usuário digitou
  }

  // Formata a data DD/MM/AAAA
  const dia = String(dataAlvo.getDate()).padStart(2, '0');
  const mes = String(dataAlvo.getMonth() + 1).padStart(2, '0');
  const ano = dataAlvo.getFullYear();
  
  let resultado = `${dia}/${mes}/${ano}`;

  // Se tiver horário junto (Ex: "H10" ou "H1030")
  if (restoHorario) {
    let hora = "";
    let min = "00";
    
    // Tenta limpar caracteres não numéricos
    const numerosHora = restoHorario.replace(/\D/g, "");
    
    if (numerosHora.length > 0) {
       if (numerosHora.length <= 2) {
         hora = numerosHora.padStart(2, '0');
       } else {
         hora = numerosHora.substring(0, 2);
         min = numerosHora.substring(2, 4).padEnd(2, '0');
       }
       resultado += ` - ${hora}:${min}h`;
    }
  }

  return resultado;
}