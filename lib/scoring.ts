import type { Bet, MatchResult, LeaderboardEntry, Outcome } from '@/types';

export function getOutcomeFromScore(home: number, away: number): Outcome {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

export function calculateBetPoints(bet: Bet, result: MatchResult): number {
  let points = 0;
  const realOutcome = getOutcomeFromScore(result.homeScore, result.awayScore);

  // Resultado exacto: 3 pontos
  if (bet.exactHome !== null && bet.exactAway !== null) {
    if (bet.exactHome === result.homeScore && bet.exactAway === result.awayScore) {
      points += 3;
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
    const p = calculateBetPoints(bet, result);
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
    else if (i === 2 && prizeDistribution.third) e.prizeMoney = totalPool * (prizeDistribution.third / 100);
  });

  return entries;
}
