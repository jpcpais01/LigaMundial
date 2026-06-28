// ─── RESOLUÇÃO DO QUADRO A ELIMINAR ───────────────────────────────────────────
// A partir dos resultados já registados (colecção `results`), preenche as
// posições do quadro a eliminar com as selecções reais:
//   • Vencedor / 2º de cada grupo → classificação do grupo (quando completo)
//   • Melhores 3ºs → ranking dos 12 terceiros + tabela de emparelhamento FIFA
//   • Vencedor/Perdedor de um jogo → resultado desse jogo (quando decidido)
// Posições ainda indeterminadas mantêm o id de placeholder (ex: "1A").

import { GROUP_MATCHES, KNOCKOUT_MATCHES } from '@/data/matches';
import { GROUPS, isRealTeam } from '@/data/teams';
import { parseSlot } from '@/lib/slots';
import type { Match, MatchResult } from '@/types';

type ResultsMap = Record<string, MatchResult>;
type TeamRow = { teamId: string; pts: number; gd: number; gf: number };

// Classificação de um grupo — só devolve algo quando os 6 jogos têm resultado.
function groupTable(group: string, results: ResultsMap): TeamRow[] | null {
  const teams = GROUPS[group];
  if (!teams) return null;
  const matches = GROUP_MATCHES.filter(m => m.group === group);
  if (matches.length === 0 || matches.some(m => !results[m.id])) return null;

  const rows: Record<string, TeamRow> = {};
  teams.forEach(t => { rows[t] = { teamId: t, pts: 0, gd: 0, gf: 0 }; });

  for (const m of matches) {
    const r = results[m.id];
    const h = rows[m.homeTeamId], a = rows[m.awayTeamId];
    if (!h || !a) continue;
    h.gf += r.homeScore; a.gf += r.awayScore;
    h.gd += r.homeScore - r.awayScore; a.gd += r.awayScore - r.homeScore;
    if (r.homeScore > r.awayScore) h.pts += 3;
    else if (r.homeScore < r.awayScore) a.pts += 3;
    else { h.pts += 1; a.pts += 1; }
  }

  // Critérios FIFA primários: pontos → diferença de golos → golos marcados.
  // (desempate por letra do id apenas para resultado determinístico)
  return Object.values(rows).sort((x, y) =>
    y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.teamId.localeCompare(y.teamId)
  );
}

// Emparelhamento dos 8 melhores terceiros com as 8 posições "3-…" do quadro.
// Devolve um mapa `${matchId}:${side}` → teamId, ou null se ainda não der.
function thirdPlaceAssignment(results: ResultsMap): Record<string, string> | null {
  const orders: Record<string, TeamRow[]> = {};
  for (const g of Object.keys(GROUPS)) {
    const t = groupTable(g, results);
    if (!t) return null; // precisa de TODOS os grupos completos
    orders[g] = t;
  }

  // Ranking dos 12 terceiros classificados → os 8 melhores apuram-se.
  const thirds = Object.keys(GROUPS).map(g => ({ group: g, ...orders[g][2] }));
  thirds.sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.group.localeCompare(b.group)
  );
  const qualifying = new Set(thirds.slice(0, 8).map(t => t.group));

  // Posições "3-…" do quadro, com os grupos elegíveis de cada uma.
  const slots: { key: string; eligible: string[] }[] = [];
  for (const m of KNOCKOUT_MATCHES) {
    (['home', 'away'] as const).forEach(side => {
      const slot = parseSlot(side === 'home' ? m.homeTeamId : m.awayTeamId);
      if (slot && slot.kind === 'third') {
        slots.push({ key: `${m.id}:${side}`, eligible: slot.groups.filter(g => qualifying.has(g)) });
      }
    });
  }

  // Emparelhamento perfeito (cada posição recebe um grupo elegível, sem repetir).
  // Resolve as posições mais restritas primeiro para convergir depressa.
  slots.sort((a, b) => a.eligible.length - b.eligible.length);
  const assigned: Record<string, string> = {};
  const used = new Set<string>();
  const solve = (i: number): boolean => {
    if (i === slots.length) return true;
    for (const g of slots[i].eligible) {
      if (used.has(g)) continue;
      used.add(g); assigned[slots[i].key] = g;
      if (solve(i + 1)) return true;
      used.delete(g); delete assigned[slots[i].key];
    }
    return false;
  };
  if (!solve(0)) return null;

  const out: Record<string, string> = {};
  for (const key of Object.keys(assigned)) out[key] = orders[assigned[key]][2].teamId;
  return out;
}

// Devolve os jogos da fase a eliminar com as equipas resolvidas onde possível.
export function resolveKnockout(results: ResultsMap): Match[] {
  const tableCache: Record<string, TeamRow[] | null> = {};
  const table = (g: string) => (g in tableCache ? tableCache[g] : (tableCache[g] = groupTable(g, results)));
  const thirds = thirdPlaceAssignment(results);

  const home: Record<string, string> = {};
  const away: Record<string, string> = {};

  const resolveSide = (matchId: string, side: 'home' | 'away', slotId: string): string => {
    const slot = parseSlot(slotId);
    if (!slot) return slotId;
    switch (slot.kind) {
      case 'winner':   { const t = table(slot.group); return t ? t[0].teamId : slotId; }
      case 'runnerup': { const t = table(slot.group); return t ? t[1].teamId : slotId; }
      case 'third':    return thirds?.[`${matchId}:${side}`] ?? slotId;
      case 'matchWinner':
      case 'matchLoser': {
        const sh = home[slot.matchId], sa = away[slot.matchId];
        if (!sh || !sa || !isRealTeam(sh) || !isRealTeam(sa)) return slotId;
        const r = results[slot.matchId];
        if (!r || r.homeScore === r.awayScore) return slotId; // por jogar ou empate (decisão por penáltis desconhecida)
        const winner = r.homeScore > r.awayScore ? sh : sa;
        const loser = r.homeScore > r.awayScore ? sa : sh;
        return slot.kind === 'matchWinner' ? winner : loser;
      }
    }
  };

  // Os jogos estão por ordem de ronda, logo as fontes (rondas anteriores) já
  // estão resolvidas quando chegamos aos jogos que delas dependem.
  return KNOCKOUT_MATCHES.map(m => {
    const h = resolveSide(m.id, 'home', m.homeTeamId);
    const a = resolveSide(m.id, 'away', m.awayTeamId);
    home[m.id] = h; away[m.id] = a;
    return { ...m, homeTeamId: h, awayTeamId: a };
  });
}

export function resolveAllMatches(results: ResultsMap): Match[] {
  return [...GROUP_MATCHES, ...resolveKnockout(results)];
}
