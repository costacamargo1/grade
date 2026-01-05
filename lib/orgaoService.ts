// lib/orgaoService.ts

import { Orgao, bancoOrgaos, ufs } from './data';
import { removerAcentos } from './formatters';

export interface ResultadoBuscaOrgao {
    orgaoEncontrado: Orgao | null;
    textoFinal: string;
}

/**
 * Searches for an "órgão" (public entity) based on user input, mimicking the complex VBA logic.
 * The search is accent-insensitive and supports abbreviations.
 * @param textoEntrada The text input by the user.
 * @returns An object containing the found Orgao object and the formatted text.
 */
export function buscarOrgao(textoEntrada: string, orgaos: Orgao[]): ResultadoBuscaOrgao {
    if (!textoEntrada) {
        return { orgaoEncontrado: null, textoFinal: "" };
    }

    // Combine o banco de dados estático com os órgãos dinâmicos, evitando duplicatas
    const orgaosUnicos = [...bancoOrgaos];
    const nomesNoBanco = new Set(bancoOrgaos.map(o => o.nome.toUpperCase()));
    for (const orgao of orgaos) {
        if (!nomesNoBanco.has(orgao.nome.toUpperCase())) {
            orgaosUnicos.push(orgao);
        }
    }

    // 1. Clean the input text
    let textoProcessado = textoEntrada.toUpperCase().trim().replace("ÓRGÃO:", "").trim();

    if (!textoProcessado) {
        return { orgaoEncontrado: null, textoFinal: "" };
    }

    // 2. Detect and separate the UF (state) from the input
    let ufDetectada = "";
    let textoBase = textoProcessado;

    const palavras = textoBase.split(" ");
    const ultimaPalavra = palavras[palavras.length - 1];

    if (ufs.includes(ultimaPalavra)) {
        ufDetectada = ultimaPalavra;
        textoBase = palavras.slice(0, -1).join(" ").replace(/[/]$/, "").trim();
    }

    let melhorResultado: Orgao | null = null;
    let melhorPrioridade = -1;

    const textoBuscaLimpo = removerAcentos(textoBase);
    const palavrasBusca = textoBuscaLimpo.split(" ").filter(p => p);

    // 3. Iterate through the database of "órgãos"
    for (const orgao of orgaosUnicos) {
        const nomeDbLimpo = removerAcentos(orgao.nome.toUpperCase());
        let prioridadeAtual = -1;

        // Check if all search words are present in the organ's name
        const todasPalavrasEncontradas = palavrasBusca.every(palavraBusca =>
            nomeDbLimpo.split(" ").some(palavraDb => palavraDb.startsWith(palavraBusca))
        );

        if (todasPalavrasEncontradas) {
            // Priority 2: Exact match with UF
            if (ufDetectada && nomeDbLimpo === `${textoBuscaLimpo} / ${ufDetectada}`) {
                prioridadeAtual = 2;
            }
            // Priority 1: Exact match without UF
            else if (nomeDbLimpo === textoBuscaLimpo) {
                prioridadeAtual = 1;
            }
            // Priority 0: Partial match (abbreviation)
            else {
                prioridadeAtual = 0;
            }
        }

        if (prioridadeAtual > melhorPrioridade) {
            melhorPrioridade = prioridadeAtual;
            melhorResultado = orgao;
            if (prioridadeAtual === 2) {
                break; // Found the best possible match
            }
        }
    }
    
    // 4. Determine the final text to be displayed
    let textoFinal: string;
    if (melhorResultado) {
        textoFinal = melhorResultado.nome;
    } else {
        if (ufDetectada) {
            textoFinal = `${textoBase} / ${ufDetectada}`;
        } else {
            textoFinal = textoBase;
        }
    }

    return { orgaoEncontrado: melhorResultado, textoFinal };
}

/**
 * Finds an "órgão" by its UASG code.
 * @param uasg The UASG code to search for.
 * @returns The found Orgao object or null.
 */
export function buscarOrgaoPorUasg(uasg: string, orgaos: Orgao[]): Orgao | null {
    if (!uasg) return null;
    const uasgLimpo = uasg.trim();
    
    // Combine o banco de dados estático com os órgãos dinâmicos, evitando duplicatas
    const orgaosUnicos = [...bancoOrgaos];
    const uasgsNoBanco = new Set(bancoOrgaos.map(o => o.uasg));
    for (const orgao of orgaos) {
        if (orgao.uasg && !uasgsNoBanco.has(orgao.uasg)) {
            orgaosUnicos.push(orgao);
        }
    }

    return orgaosUnicos.find(o => o.uasg === uasgLimpo) || null;
}
