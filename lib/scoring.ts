import { getMatchById } from '@/data/matches';
import type { Bet, MatchResult, LeaderboardEntry, Outcome } from '@/types';

export function getOutcomeFromScore(home: number, away: number): Outcome {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

// Bónus do resultado exacto (somado por cima do ponto do 1X2). Na Liga Fase de
// Grupos vale 3; nos jogos da fase a eliminar vale 2; nas restantes situações
// (ex: jornadas de grupos na Extra — Jornadas) vale 1.
export function exactScoreBonus(leagueId: string, isCupPhase = false): number {
  if (leagueId === 'fase-grupos') return 3;
  return isCupPhase ? 2 : 1;
}

export function calculateBetPoints(bet: Bet, result: MatchResult, exactBonus = 3): number {
  let points = 0;
  const realOutcome = getOutcomeFromScore(result.homeScore, result.awayScore);

  // Resultado exacto: bónus (3 na fase de grupos, 1 nas restantes)
  if (bet.exactHome !== null && bet.exactAway !== null) {
    if (bet.exactHome === result.homeScore && bet.exactAway === result.awayScore) {
      points += exactBonus;
    }
  }

  // 1X2: 1 ponto
  if (bet.outcome === realOutcome) {
    points += 1;
  }

  return points;
}

export function buildLeaderboard(
  bets: Bet[],
  results: Record<string, MatchResult>,
  members: { username: string; avatarColor: string; avatarUrl?: string }[],
  totalPool: number,
  prizeDistribution: { first: number; second?: number; third?: number },
): LeaderboardEntry[] {
  // Calcular pontos por utilizador
  const statsMap: Record<string, { points: number; exactScores: number; correctOutcomes: number }> = {};

  members.forEach(m => {
    statsMap[m.username] = { points: 0, exactScores: 0, correctOutcomes: 0 };
  });

  bets.forEach(bet => {
    const result = results[bet.matchId];
    if (!result) return;
    const betMatch = getMatchById(bet.matchId);
    const isCupPhase = !!betMatch && betMatch.phase !== 'group';
    const p = calculateBetPoints(bet, result, exactScoreBonus(bet.leagueId, isCupPhase));
    if (!statsMap[bet.username]) {
      statsMap[bet.username] = { points: 0, exactScores: 0, correctOutcomes: 0 };
    }
    statsMap[bet.username].points += p;

    const realOutcome = getOutcomeFromScore(result.homeScore, result.awayScore);
    if (bet.exactHome === result.homeScore && bet.exactAway === result.awayScore) {
      statsMap[bet.username].exactScores += 1;
    }
    if (bet.outcome === realOutcome) {
      statsMap[bet.username].correctOutcomes += 1;
    }
  });

  const entries = members.map(m => ({
    rank: 0,
    username: m.username,
    avatarColor: m.avatarColor,
    avatarUrl: m.avatarUrl,
    ...statsMap[m.username],
    prizeMoney: 0,
  }));

  // Ordenar por pontos (desc), depois por resultados exactos (desc)
  entries.sort((a, b) => b.points - a.points || b.exactScores - a.exactScores);

  // Atribuir rank e prémio
  entries.forEach((e, i) => {
    e.rank = i + 1;
    if (i === 0) e.prizeMoney = totalPool * (prizeDistribution.first / 100);
    else if (i === 1 && prizeDistribution.second) e.prizeMoney = totalPool * (prizeDistribution.second / 100);
    else if (i === 2 && prizeDistribution.third) e.prizeMoney = Math.floor(totalPool * (prizeDistribution.third / 100));
  });

  return entries;
}
