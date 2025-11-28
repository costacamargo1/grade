// lib/orgaoService.ts

export interface Orgao {
  id: string;
  nome: string;
  uasg?: string;
  portal?: string;
}

const STORAGE_KEY = "grade_orgaos_db";

// Carrega todos os órgãos salvos
export function getOrgaos(): Orgao[] {
  if (typeof window === "undefined") return []; // Proteção para servidor
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Salva um novo órgão
export function saveOrgao(novoOrgao: Omit<Orgao, "id">) {
  const orgaos = getOrgaos();
  const registro: Orgao = { ...novoOrgao, id: Date.now().toString() };
  orgaos.push(registro);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orgaos));
  return registro;
}

// Busca inteligente (pelo nome)
export function findOrgaoByNome(nomeBusca: string): Orgao | undefined {
  const orgaos = getOrgaos();
  const termo = nomeBusca.toUpperCase().trim();
  // Tenta achar exatamente ou parcialmente
  return orgaos.find(o => o.nome.toUpperCase().includes(termo));
}