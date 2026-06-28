// ─── SLOTS DA FASE A ELIMINAR ─────────────────────────────────────────────────
// Os jogos do quadro a eliminar do Mundial 2026 têm posições ("slots") fixas e já
// determinadas pelo sorteio — só as equipas é que dependem dos resultados. Cada
// posição é representada por um id de placeholder:
//
//   1A          → vencedor do Grupo A
//   2B          → 2º classificado do Grupo B
//   3-CEFHI     → melhor 3º de entre os Grupos C/E/F/H/I
//   w-m075      → vencedor do jogo m075
//   l-m101      → perdedor do jogo m101
//
// Este módulo não tem dependências (evita imports circulares entre `data/teams`
// e `lib/bracket`).

export type Slot =
  | { kind: 'winner'; group: string }
  | { kind: 'runnerup'; group: string }
  | { kind: 'third'; groups: string[] }
  | { kind: 'matchWinner'; matchId: string }
  | { kind: 'matchLoser'; matchId: string };

// Número oficial FIFA de cada jogo (os ids internos m0XX seguem a ordem de
// pontapé de saída, que não coincide com a numeração oficial). Usado apenas
// nas etiquetas "Vencedor Jogo 74" / "Perdedor Jogo 101".
export const OFFICIAL_MATCH_NO: Record<string, number> = {
  m073: 73, m074: 76, m075: 74, m076: 75, m077: 78, m078: 77, m079: 79, m080: 80,
  m081: 82, m082: 81, m083: 84, m084: 83, m085: 85, m086: 88, m087: 86, m088: 87,
  m089: 90, m090: 89, m091: 91, m092: 92, m093: 93, m094: 94, m095: 95, m096: 96,
  m097: 97, m098: 98, m099: 99, m100: 100, m101: 101, m102: 102, m103: 103, m104: 104,
};

export function parseSlot(id: string): Slot | null {
  if (/^1[A-L]$/.test(id)) return { kind: 'winner', group: id[1] };
  if (/^2[A-L]$/.test(id)) return { kind: 'runnerup', group: id[1] };
  if (/^3-[A-L]+$/.test(id)) return { kind: 'third', groups: id.slice(2).split('') };
  if (/^w-m\d+$/.test(id)) return { kind: 'matchWinner', matchId: id.slice(2) };
  if (/^l-m\d+$/.test(id)) return { kind: 'matchLoser', matchId: id.slice(2) };
  return null;
}

export function isSlotId(id: string): boolean {
  return parseSlot(id) !== null;
}

// Etiqueta de apresentação de uma posição ainda por preencher.
export function slotLabels(id: string): { name: string; shortName: string } | null {
  const s = parseSlot(id);
  if (!s) return null;
  switch (s.kind) {
    case 'winner':
      return { name: `Vencedor Grupo ${s.group}`, shortName: `1${s.group}` };
    case 'runnerup':
      return { name: `2º Grupo ${s.group}`, shortName: `2${s.group}` };
    case 'third':
      return { name: `3º (${s.groups.join('/')})`, shortName: '3º' };
    case 'matchWinner': {
      const n = OFFICIAL_MATCH_NO[s.matchId];
      return { name: `Vencedor Jogo ${n}`, shortName: `V${n}` };
    }
    case 'matchLoser': {
      const n = OFFICIAL_MATCH_NO[s.matchId];
      return { name: `Perdedor Jogo ${n}`, shortName: `P${n}` };
    }
  }
}

// Bandeira/ícone neutro usado para qualquer posição ainda por preencher.
export const SLOT_FLAG = '🏳';
