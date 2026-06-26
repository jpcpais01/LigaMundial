import type { Bet, MatchResult, Outcome } from '@/types';
import { getOutcomeFromScore, calculateBetPoints } from './scoring';

export type StatMember = { username: string; avatarColor: string; avatarUrl?: string };

export const GROUP_LABEL = 'Consenso'; // palpite agregado dos utilizadores
export const REAL_LABEL = 'Real';      // dados reais dos jogos terminados

export interface BarRow {
  username: string;
  avatarColor: string;
  avatarUrl?: string;
  value: number;      // valor numérico principal
  detail?: string;    // legenda pequena (ex. "4/6")
  count: number;      // nº de jogos considerados
  isGroup?: boolean;  // linha do Consenso (palpite do grupo)
  isReal?: boolean;   // linha baseada em dados reais dos jogos
  isCurrent?: boolean;
}

export interface TendencyRow {
  username: string;
  avatarColor: string;
  avatarUrl?: string;
  home: number; // %
  draw: number; // %
  away: number; // %
  count: number;
  isGroup?: boolean;
  isCurrent?: boolean;
}

export interface Superlative {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  username: string;
  avatarColor: string;
  avatarUrl?: string;
  value: string;
}

export interface LeagueStats {
  predictedMatches: number;  // jogos com pelo menos uma aposta
  gradedMatches: number;     // jogos já terminados com pelo menos uma aposta
  totalBets: number;
  accuracy: BarRow[];        // precisão 1X2 (inclui Consenso)
  exactRate: BarRow[];       // % resultados exactos (inclui Consenso)
  avgPoints: BarRow[];       // média de pontos por jogo
  conformity: BarRow[];      // proximidade ao consenso (valor = distância média em golos)
  scoreError: BarRow[];      // erro médio do placar vs. resultado real (inclui Consenso)
  againstCrowd: BarRow[];    // acertos 1X2 contra o consenso
  tendency: TendencyRow[];   // distribuição 1 / X / 2 (inclui média da liga)
  goals: BarRow[];           // média de golos previstos por jogo
  realGoalsAvg: number | null; // média real de golos/jogo (linha "Real" no gráfico)
  superlatives: Superlative[];
}

type Consensus = { home: number; away: number; outcome: Outcome; hasExact: boolean };

function mean(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/**
 * Predição "do grupo" para cada jogo: média das previsões de todos os
 * utilizadores, arredondada ao número inteiro mais próximo.
 */
function buildConsensus(betsByMatch: Map<string, Bet[]>): Map<string, Consensus> {
  const consensus = new Map<string, Consensus>();
  betsByMatch.forEach((matchBets, matchId) => {
    const homes = matchBets.map(b => b.exactHome).filter((n): n is number => n !== null);
    const aways = matchBets.map(b => b.exactAway).filter((n): n is number => n !== null);
    const hasExact = homes.length > 0 && aways.length > 0;

    if (hasExact) {
      const home = Math.round(mean(homes));
      const away = Math.round(mean(aways));
      consensus.set(matchId, { home, away, outcome: getOutcomeFromScore(home, away), hasExact: true });
    } else {
      // Sem previsões de resultado exacto — usa voto maioritário do 1X2.
      const tally: Record<Outcome, number> = { home: 0, draw: 0, away: 0 };
      matchBets.forEach(b => { tally[b.outcome] += 1; });
      const outcome = (Object.keys(tally) as Outcome[]).sort((a, b) => tally[b] - tally[a])[0];
      consensus.set(matchId, { home: 0, away: 0, outcome, hasExact: false });
    }
  });
  return consensus;
}

export function computeLeagueStats(
  bets: Bet[],
  results: Record<string, MatchResult>,
  members: StatMember[],
  currentUsername: string,
): LeagueStats {
  const memberMap = new Map(members.map(m => [m.username, m]));
  const groupColor = '#FFD700';

  // Agrupar apostas por jogo e por utilizador.
  const betsByMatch = new Map<string, Bet[]>();
  const betsByUser = new Map<string, Bet[]>();
  for (const b of bets) {
    if (!memberMap.has(b.username)) continue; // ignora apostas de não-membros
    (betsByMatch.get(b.matchId) ?? betsByMatch.set(b.matchId, []).get(b.matchId)!).push(b);
    (betsByUser.get(b.username) ?? betsByUser.set(b.username, []).get(b.username)!).push(b);
  }

  const consensus = buildConsensus(betsByMatch);

  const predictedMatches = betsByMatch.size;
  const gradedMatchIds = [...betsByMatch.keys()].filter(id => results[id]);
  const gradedMatches = gradedMatchIds.length;

  const av = (u: string) => ({
    avatarColor: memberMap.get(u)?.avatarColor || '#6366f1',
    avatarUrl: memberMap.get(u)?.avatarUrl,
  });

  // ─── Precisão 1X2, resultados exactos, pontos por jogo ─────────────────────
  const accuracy: BarRow[] = [];
  const exactRate: BarRow[] = [];
  const avgPoints: BarRow[] = [];

  for (const m of members) {
    const userBets = (betsByUser.get(m.username) ?? []).filter(b => results[b.matchId]);
    if (userBets.length === 0) continue;
    let correct = 0, exact = 0, pts = 0;
    for (const b of userBets) {
      const r = results[b.matchId];
      const real = getOutcomeFromScore(r.homeScore, r.awayScore);
      if (b.outcome === real) correct += 1;
      if (b.exactHome === r.homeScore && b.exactAway === r.awayScore) exact += 1;
      pts += calculateBetPoints(b, r);
    }
    const n = userBets.length;
    const base = { username: m.username, ...av(m.username), isCurrent: m.username === currentUsername };
    accuracy.push({ ...base, value: (correct / n) * 100, detail: `${correct}/${n}`, count: n });
    exactRate.push({ ...base, value: (exact / n) * 100, detail: `${exact}/${n}`, count: n });
    avgPoints.push({ ...base, value: pts / n, detail: `${pts} pts`, count: n });
  }

  // Linha "Consenso" para precisão 1X2 e resultados exactos.
  if (gradedMatches > 0) {
    let cCorrect = 0, cExact = 0, cExactDen = 0;
    for (const id of gradedMatchIds) {
      const c = consensus.get(id)!;
      const r = results[id];
      const real = getOutcomeFromScore(r.homeScore, r.awayScore);
      if (c.outcome === real) cCorrect += 1;
      if (c.hasExact) {
        cExactDen += 1;
        if (c.home === r.homeScore && c.away === r.awayScore) cExact += 1;
      }
    }
    accuracy.push({
      username: GROUP_LABEL, avatarColor: groupColor, value: (cCorrect / gradedMatches) * 100,
      detail: `${cCorrect}/${gradedMatches}`, count: gradedMatches, isGroup: true,
    });
    if (cExactDen > 0) {
      exactRate.push({
        username: GROUP_LABEL, avatarColor: groupColor, value: (cExact / cExactDen) * 100,
        detail: `${cExact}/${cExactDen}`, count: cExactDen, isGroup: true,
      });
    }
  }

  accuracy.sort((a, b) => b.value - a.value);
  exactRate.sort((a, b) => b.value - a.value);
  avgPoints.sort((a, b) => b.value - a.value);

  // ─── Proximidade ao consenso (distância média em golos) ────────────────────
  // Distância de Manhattan entre o resultado previsto e a média do grupo.
  const conformity: BarRow[] = [];
  for (const m of members) {
    const userBets = (betsByUser.get(m.username) ?? []).filter(
      b => b.exactHome !== null && b.exactAway !== null && consensus.get(b.matchId)?.hasExact,
    );
    if (userBets.length === 0) continue;
    let dist = 0;
    for (const b of userBets) {
      const c = consensus.get(b.matchId)!;
      dist += Math.abs((b.exactHome as number) - c.home) + Math.abs((b.exactAway as number) - c.away);
    }
    conformity.push({
      username: m.username, ...av(m.username), value: dist / userBets.length,
      detail: `${(dist / userBets.length).toFixed(2)} golos`, count: userBets.length,
      isCurrent: m.username === currentUsername,
    });
  }
  // Menor distância = mais próximo do consenso → primeiro.
  conformity.sort((a, b) => a.value - b.value);

  // ─── Erro médio do placar vs. resultado real ───────────────────────────────
  // Distância de Manhattan entre o placar previsto e o placar REAL do jogo.
  const scoreError: BarRow[] = [];
  for (const m of members) {
    const userBets = (betsByUser.get(m.username) ?? []).filter(
      b => b.exactHome !== null && b.exactAway !== null && results[b.matchId],
    );
    if (userBets.length === 0) continue;
    let err = 0;
    for (const b of userBets) {
      const r = results[b.matchId];
      err += Math.abs((b.exactHome as number) - r.homeScore) + Math.abs((b.exactAway as number) - r.awayScore);
    }
    scoreError.push({
      username: m.username, ...av(m.username), value: err / userBets.length,
      detail: `${(err / userBets.length).toFixed(2)} golos`, count: userBets.length,
      isCurrent: m.username === currentUsername,
    });
  }
  // Linha "Consenso": erro do palpite do grupo vs. resultado real.
  if (gradedMatches > 0) {
    const ids = gradedMatchIds.filter(id => consensus.get(id)?.hasExact);
    if (ids.length > 0) {
      let cErr = 0;
      for (const id of ids) {
        const c = consensus.get(id)!;
        const r = results[id];
        cErr += Math.abs(c.home - r.homeScore) + Math.abs(c.away - r.awayScore);
      }
      scoreError.push({
        username: GROUP_LABEL, avatarColor: groupColor, value: cErr / ids.length,
        detail: `${(cErr / ids.length).toFixed(2)} golos`, count: ids.length, isGroup: true,
      });
    }
  }
  // Menor erro = melhor → primeiro.
  scoreError.sort((a, b) => a.value - b.value);

  // ─── Acertos contra o consenso ("contra a corrente") ───────────────────────
  // Jogos terminados em que o 1X2 do utilizador diferiu do consenso e acertou.
  const againstCrowd: BarRow[] = [];
  for (const m of members) {
    const userBets = (betsByUser.get(m.username) ?? []).filter(b => results[b.matchId]);
    if (userBets.length === 0) continue;
    let against = 0, correctAgainst = 0;
    for (const b of userBets) {
      const c = consensus.get(b.matchId);
      if (!c || b.outcome === c.outcome) continue; // só conta quando discordou do grupo
      against += 1;
      const real = getOutcomeFromScore(results[b.matchId].homeScore, results[b.matchId].awayScore);
      if (b.outcome === real) correctAgainst += 1;
    }
    if (against === 0) continue;
    againstCrowd.push({
      username: m.username, ...av(m.username), value: correctAgainst,
      detail: `${correctAgainst}/${against}`, count: against,
      isCurrent: m.username === currentUsername,
    });
  }
  againstCrowd.sort((a, b) => b.value - a.value || b.count - a.count);

  // ─── Tendência 1 / X / 2 (sobre todas as apostas) ──────────────────────────
  const tendency: TendencyRow[] = [];
  const groupTally: Record<Outcome, number> = { home: 0, draw: 0, away: 0 };
  let groupTotal = 0;
  for (const m of members) {
    const userBets = betsByUser.get(m.username) ?? [];
    if (userBets.length === 0) continue;
    const tally: Record<Outcome, number> = { home: 0, draw: 0, away: 0 };
    userBets.forEach(b => { tally[b.outcome] += 1; groupTally[b.outcome] += 1; });
    groupTotal += userBets.length;
    const n = userBets.length;
    tendency.push({
      username: m.username, ...av(m.username),
      home: (tally.home / n) * 100, draw: (tally.draw / n) * 100, away: (tally.away / n) * 100,
      count: n, isCurrent: m.username === currentUsername,
    });
  }
  tendency.sort((a, b) => b.count - a.count);
  if (groupTotal > 0) {
    tendency.unshift({
      username: 'Média da liga', avatarColor: groupColor,
      home: (groupTally.home / groupTotal) * 100,
      draw: (groupTally.draw / groupTotal) * 100,
      away: (groupTally.away / groupTotal) * 100,
      count: groupTotal, isGroup: true,
    });
  }

  // ─── Média de golos previstos por jogo (ofensivo vs cauteloso) ─────────────
  const goals: BarRow[] = [];
  for (const m of members) {
    const userBets = (betsByUser.get(m.username) ?? []).filter(
      b => b.exactHome !== null && b.exactAway !== null,
    );
    if (userBets.length === 0) continue;
    const total = userBets.reduce((s, b) => s + (b.exactHome as number) + (b.exactAway as number), 0);
    goals.push({
      username: m.username, ...av(m.username), value: total / userBets.length,
      detail: `${(total / userBets.length).toFixed(2)} golos/jogo`, count: userBets.length,
      isCurrent: m.username === currentUsername,
    });
  }
  goals.sort((a, b) => b.value - a.value);

  // Média real de golos (jogos terminados) como referência.
  let realGoalsAvg: number | null = null;
  if (gradedMatches > 0) {
    const totalReal = gradedMatchIds.reduce((s, id) => s + results[id].homeScore + results[id].awayScore, 0);
    realGoalsAvg = totalReal / gradedMatches;
    goals.push({
      username: REAL_LABEL, avatarColor: groupColor, value: realGoalsAvg,
      detail: `${realGoalsAvg.toFixed(2)} reais/jogo`, count: gradedMatches, isReal: true,
    });
    goals.sort((a, b) => b.value - a.value);
  }

  // ─── Superlativos (distinções) ─────────────────────────────────────────────
  const superlatives: Superlative[] = [];
  const human = (r: BarRow | TendencyRow) => ({
    username: r.username, avatarColor: r.avatarColor, avatarUrl: r.avatarUrl,
  });
  const realRows = <T extends { isGroup?: boolean; count: number }>(arr: T[], minN = 1) =>
    arr.filter(r => !r.isGroup && r.count >= minN);

  const accR = realRows(accuracy, 2);
  if (accR.length) {
    const top = accR.reduce((a, b) => (b.value > a.value ? b : a));
    superlatives.push({ key: 'sniper', emoji: '🎯', title: 'O Certeiro', subtitle: 'Melhor precisão 1X2',
      ...human(top), value: `${Math.round(top.value)}%` });
  }
  const exactR = realRows(exactRate, 1).filter(r => r.value > 0);
  if (exactR.length) {
    const top = exactR.reduce((a, b) => (b.value > a.value ? b : a));
    const hits = top.detail?.split('/')[0] ?? '';
    superlatives.push({ key: 'oracle', emoji: '🔮', title: 'O Vidente', subtitle: 'Mais resultados exactos',
      ...human(top), value: `${hits} exactos` });
  }
  const confR = realRows(conformity, 2);
  if (confR.length) {
    const closest = confR[0];
    superlatives.push({ key: 'sheep', emoji: '🐑', title: 'O do Rebanho', subtitle: 'Mais perto do consenso',
      ...human(closest), value: `${closest.value.toFixed(2)} golos` });
    const maverick = confR[confR.length - 1];
    if (maverick.username !== closest.username) {
      superlatives.push({ key: 'maverick', emoji: '🃏', title: 'O Lobo Solitário', subtitle: 'Mais longe do consenso',
        ...human(maverick), value: `${maverick.value.toFixed(2)} golos` });
    }
  }
  const goalsR = realRows(goals, 2);
  if (goalsR.length) {
    const most = goalsR.reduce((a, b) => (b.value > a.value ? b : a));
    superlatives.push({ key: 'attack', emoji: '⚽', title: 'O Goleador', subtitle: 'Prevê mais golos',
      ...human(most), value: `${most.value.toFixed(1)}/jogo` });
    const least = goalsR.reduce((a, b) => (b.value < a.value ? b : a));
    if (least.username !== most.username) {
      superlatives.push({ key: 'wall', emoji: '🧱', title: 'O Ferrolho', subtitle: 'Prevê menos golos',
        ...human(least), value: `${least.value.toFixed(1)}/jogo` });
    }
    // Equilibrado: golos previstos mais próximos da média REAL dos jogos.
    if (realGoalsAvg !== null) {
      const balanced = goalsR.reduce((a, b) =>
        Math.abs(b.value - realGoalsAvg!) < Math.abs(a.value - realGoalsAvg!) ? b : a);
      superlatives.push({ key: 'balanced', emoji: '⚖️', title: 'O Equilibrado',
        subtitle: 'Golos/jogo mais perto da média real', ...human(balanced),
        value: `${balanced.value.toFixed(1)}/jogo` });
    }
  }
  const scoreR = realRows(scoreError, 2);
  if (scoreR.length) {
    const sharp = scoreR.reduce((a, b) => (b.value < a.value ? b : a));
    superlatives.push({ key: 'clinic', emoji: '🩺', title: 'O Olho Clínico',
      subtitle: 'Menor erro no placar', ...human(sharp), value: `${sharp.value.toFixed(2)} golos` });
  }
  const crowdR = realRows(againstCrowd, 1).filter(r => r.value > 0);
  if (crowdR.length) {
    const rebel = crowdR.reduce((a, b) => (b.value > a.value ? b : a));
    superlatives.push({ key: 'rebel', emoji: '🦅', title: 'Contra a Corrente',
      subtitle: 'Mais acertos contra o consenso', ...human(rebel),
      value: `${rebel.value} acertos` });
  }
  const tendR = tendency.filter(r => !r.isGroup && r.count >= 3);
  if (tendR.length) {
    const drawer = tendR.reduce((a, b) => (b.draw > a.draw ? b : a));
    if (drawer.draw > 0) {
      superlatives.push({ key: 'draw', emoji: '🤝', title: 'O do Empate', subtitle: 'Mais empates apostados',
        ...human(drawer), value: `${Math.round(drawer.draw)}% X` });
    }
  }

  return {
    predictedMatches, gradedMatches, totalBets: bets.length,
    accuracy, exactRate, avgPoints, conformity, scoreError, againstCrowd,
    tendency, goals, realGoalsAvg, superlatives,
  };
}
