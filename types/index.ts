// ─── UTILIZADORES ────────────────────────────────────────────────────────────
export interface User {
  username: string;
  createdAt: string; // ISO string
  joinedLeagues: string[];
  avatarColor: string;
  avatarUrl?: string; // Firebase Storage download URL
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
  | 'extra-marcador'
  | 'fantasy-11';

export type LeagueType = 'regular' | 'champion' | 'scorer' | 'fantasy';

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
  avatarUrl?: string;
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
  // 'auto' = liquidado automaticamente pela API; 'admin' (ou ausente) = manual.
  // Resultados manuais nunca são substituídos pela liquidação automática.
  source?: 'auto' | 'admin';
  // Vencedor nos penáltis, quando o resultado (90'/prolongamento) termina empatado
  // numa eliminatória. As apostas 1X2 continuam a basear-se no empate — este
  // campo serve apenas para o quadro a eliminar avançar para a selecção real.
  penaltyWinner?: 'home' | 'away';
}

// ─── FANTASY 11 ──────────────────────────────────────────────────────────────
export type FantasyPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface FantasyPlayer {
  id: string;              // ESPN athlete id
  name: string;
  teamId: string;          // id interno da selecção
  position: FantasyPosition;
  value: number;           // valor de mercado em M€
  age?: number | null;
  jersey?: string | null;
  photo?: string | null;   // URL da foto real (TheSportsDB)
}

// Equipa de um utilizador para uma jornada
export interface FantasySquad {
  id: string;              // `${weekId}_${username}`
  leagueId: string;        // 'fantasy-11'
  username: string;
  weekId: string;          // 'j1' … 'j8'
  starters: string[];      // 11 ids
  bench: string[];         // 5 ids — bench[0] é sempre GK; ordem = prioridade de substituição
  captainId: string | null;
  formation: string;       // '442' | '433' | '352' | '451' | '343'
  totalCost: number;       // M€
  createdAt: string;
  updatedAt: string;
}

// Linha de estatísticas de um jogador num jogo (fonte: ESPN)
export interface PlayerStatLine {
  teamId: string;
  started: boolean;
  subbedIn: boolean;
  subbedOut: boolean;
  goals: number;
  assists: number;
  saves: number;
  yellow: number;
  red: number;
  ownGoals: number;
}

// Estatísticas de todos os jogadores de um jogo
export interface MatchPlayerStats {
  matchId: string;
  espnEventId: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  players: Record<string, PlayerStatLine>; // por id de jogador
  updatedAt: string;
}

// ─── MEMBRO DA LIGA ──────────────────────────────────────────────────────────
export interface LeagueMember {
  id: string; // `${leagueId}_${username}`
  leagueId: string;
  username: string;
  joinedAt: string;
  hasPaid: boolean;
}
