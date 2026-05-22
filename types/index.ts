// ─── UTILIZADORES ────────────────────────────────────────────────────────────
export interface User {
  username: string;
  createdAt: string; // ISO string
  joinedLeagues: string[];
  avatarColor: string;
}

// ─── EQUIPAS ─────────────────────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string; // emoji flag
  group: string;
}

// ─── LIGAS ───────────────────────────────────────────────────────────────────
export type LeagueId =
  | 'fase-grupos'
  | 'fase-copa'
  | 'extra-jornadas'
  | 'extra-campeao'
  | 'extra-marcador';

export type LeagueType = 'regular' | 'champion' | 'scorer';

export interface PrizeDistribution {
  first: number;
  second?: number;
  third?: number;
}

export interface League {
  id: LeagueId;
  name: string;
  subtitle: string;
  description: string;
  type: LeagueType;
  entryFee: number;
  prizeDistribution: PrizeDistribution;
  matchPhase: 'group' | 'cup' | 'all';
  icon: string;
  color: string; // tailwind gradient class
}

// ─── JOGOS ───────────────────────────────────────────────────────────────────
export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type MatchPhase = 'group' | 'round32' | 'round16' | 'qf' | 'sf' | '3rd' | 'final';
export type Outcome = 'home' | 'draw' | 'away';

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string; // ISO string
  status: MatchStatus;
  phase: MatchPhase;
  group?: string; // "A", "B", ...
  round?: 1 | 2 | 3; // group stage rounds
  homeScore?: number;
  awayScore?: number;
  venue: string;
  city: string;
}

// ─── APOSTAS ─────────────────────────────────────────────────────────────────
export interface Bet {
  id: string; // `${leagueId}_${matchId}_${username}`
  username: string;
  leagueId: string;
  matchId: string;
  exactHome: number | null;
  exactAway: number | null;
  outcome: Outcome;
  points: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialBet {
  id: string; // `${leagueId}_${username}`
  username: string;
  leagueId: 'extra-campeao' | 'extra-marcador';
  prediction: string; // teamId ou nome do jogador
  isWinner: boolean | null;
  createdAt: string;
}

// ─── CLASSIFICAÇÃO ───────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarColor: string;
  points: number;
  exactScores: number;
  correctOutcomes: number;
  prizeMoney: number;
}

// ─── RESULTADOS (Admin) ───────────────────────────────────────────────────────
export interface MatchResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  setAt: string;
}

// ─── MEMBRO DA LIGA ──────────────────────────────────────────────────────────
export interface LeagueMember {
  id: string; // `${leagueId}_${username}`
  leagueId: string;
  username: string;
  joinedAt: string;
  hasPaid: boolean;
}
