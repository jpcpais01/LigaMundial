import { JORNADAS, ALL_MATCHES } from '@/data/matches';
import { TEAMS_LIST } from '@/data/teams';
import { BETTING_CUTOFF_MS } from '@/lib/utils';
import type {
  FantasyPlayer, FantasyPosition, FantasySquad, Match, MatchPlayerStats, PlayerStatLine,
} from '@/types';

// ─── REGRAS ───────────────────────────────────────────────────────────────────
export const FANTASY_BUDGET = 1000; // M€ por jornada

export const SQUAD_RULES = {
  starters: 11,
  bench: 5,
  // Formação dos titulares
  gk: 1,
  defMin: 3, defMax: 5,
  midMin: 2, midMax: 5,
  fwdMin: 1, fwdMax: 3,
  // Banco: 1 GK + 4 de campo
  benchGk: 1,
  // Máximo de jogadores da mesma selecção (titulares + banco)
  maxPerTeam: 4,
} as const;

// ─── JORNADAS ─────────────────────────────────────────────────────────────────
export interface FantasyWeek {
  id: string;
  label: string;
  matchIds: string[];
  deadline: string;     // ISO — fecho das equipas
  firstKickoff: string;
  lastKickoff: string;
}

// J1: a liga lançou já com 2 jogos disputados — o fecho é adiado para o
// 3.º jogo e os jogos anteriores ao fecho não pontuam (igual para todos).
const DEADLINE_OVERRIDES: Record<string, string> = {
  j1: '2026-06-12T18:55:00Z',
};

export const FANTASY_WEEKS: FantasyWeek[] = JORNADAS.map(j => {
  const matches = j.matchIds
    .map(id => ALL_MATCHES.find(m => m.id === id)!)
    .filter(Boolean)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const first = matches[0]?.scheduledAt ?? new Date(0).toISOString();
  const last = matches[matches.length - 1]?.scheduledAt ?? first;
  const deadline = DEADLINE_OVERRIDES[j.id]
    ?? new Date(new Date(first).getTime() - BETTING_CUTOFF_MS).toISOString();
  return { id: j.id, label: j.label, matchIds: j.matchIds, deadline, firstKickoff: first, lastKickoff: last };
});

export const getWeek = (id: string) => FANTASY_WEEKS.find(w => w.id === id);

export function isWeekLocked(week: FantasyWeek, now = Date.now()): boolean {
  return now >= new Date(week.deadline).getTime();
}

// Jornada por omissão: a que está "em jogo" (fechada mas ainda com jogos),
// senão a primeira ainda aberta, senão a última.
export function getDefaultWeekId(now = Date.now()): string {
  const WINDOW_AFTER_MS = 3 * 60 * 60 * 1000;
  const inPlay = FANTASY_WEEKS.find(w =>
    isWeekLocked(w, now) && now <= new Date(w.lastKickoff).getTime() + WINDOW_AFTER_MS,
  );
  if (inPlay) return inPlay.id;
  const open = FANTASY_WEEKS.find(w => !isWeekLocked(w, now));
  return (open ?? FANTASY_WEEKS[FANTASY_WEEKS.length - 1]).id;
}

// Jogos de uma jornada que contam para a pontuação (kick-off após o fecho)
export function scoringMatchesOfWeek(week: FantasyWeek): Match[] {
  const deadlineMs = new Date(week.deadline).getTime();
  return week.matchIds
    .map(id => ALL_MATCHES.find(m => m.id === id)!)
    .filter(m => m && new Date(m.scheduledAt).getTime() >= deadlineMs);
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────
export interface SquadCounts {
  GK: number; DEF: number; MID: number; FWD: number;
}

export function countPositions(ids: string[], byId: Record<string, FantasyPlayer>): SquadCounts {
  const c: SquadCounts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  ids.forEach(id => { const p = byId[id]; if (p) c[p.position]++; });
  return c;
}

export function squadCost(ids: string[], byId: Record<string, FantasyPlayer>): number {
  return Math.round(ids.reduce((s, id) => s + (byId[id]?.value ?? 0), 0) * 10) / 10;
}

// Valida a equipa completa; devolve a lista de problemas (vazia = válida)
export function validateSquad(
  starters: string[], bench: string[], captainId: string | null,
  byId: Record<string, FantasyPlayer>,
): string[] {
  const errors: string[] = [];
  const all = [...starters, ...bench];

  if (starters.length !== SQUAD_RULES.starters) errors.push(`Precisas de ${SQUAD_RULES.starters} titulares (tens ${starters.length}).`);
  if (bench.length !== SQUAD_RULES.bench) errors.push(`Precisas de ${SQUAD_RULES.bench} suplentes (tens ${bench.length}).`);
  if (new Set(all).size !== all.length) errors.push('Tens jogadores repetidos.');

  const sc = countPositions(starters, byId);
  if (starters.length === SQUAD_RULES.starters) {
    if (sc.GK !== SQUAD_RULES.gk) errors.push('Os titulares têm de incluir exactamente 1 guarda-redes.');
    if (sc.DEF < SQUAD_RULES.defMin || sc.DEF > SQUAD_RULES.defMax) errors.push(`Defesas titulares: entre ${SQUAD_RULES.defMin} e ${SQUAD_RULES.defMax}.`);
    if (sc.MID < SQUAD_RULES.midMin || sc.MID > SQUAD_RULES.midMax) errors.push(`Médios titulares: entre ${SQUAD_RULES.midMin} e ${SQUAD_RULES.midMax}.`);
    if (sc.FWD < SQUAD_RULES.fwdMin || sc.FWD > SQUAD_RULES.fwdMax) errors.push(`Avançados titulares: entre ${SQUAD_RULES.fwdMin} e ${SQUAD_RULES.fwdMax}.`);
  }

  const bc = countPositions(bench, byId);
  if (bench.length === SQUAD_RULES.bench && bc.GK !== SQUAD_RULES.benchGk) {
    errors.push('O banco tem de incluir exactamente 1 guarda-redes.');
  }

  // Máximo por selecção
  const perTeam: Record<string, number> = {};
  all.forEach(id => { const p = byId[id]; if (p) perTeam[p.teamId] = (perTeam[p.teamId] ?? 0) + 1; });
  Object.entries(perTeam).forEach(([teamId, n]) => {
    if (n > SQUAD_RULES.maxPerTeam) errors.push(`Máximo de ${SQUAD_RULES.maxPerTeam} jogadores da mesma selecção (${teamId}: ${n}).`);
  });

  const cost = squadCost(all, byId);
  if (cost > FANTASY_BUDGET) errors.push(`Orçamento ultrapassado: ${cost}M€ de ${FANTASY_BUDGET}M€.`);

  if (captainId && !starters.includes(captainId)) errors.push('O capitão tem de ser titular.');
  if (!captainId && starters.length === SQUAD_RULES.starters) errors.push('Escolhe um capitão.');

  return errors;
}

// ─── PONTUAÇÃO ────────────────────────────────────────────────────────────────
// Sistema clássico de fantasy:
//   Titular +2 · Suplente utilizado +1
//   Golo: GR/DEF +6 · MED +5 · AVA +4
//   Assistência +3
//   Baliza a zeros (titular): GR/DEF +4 · MED +1
//   Cada 3 defesas (GR) +1
//   Cada 2 golos sofridos pela equipa (GR/DEF titulares) −1
//   Amarelo −1 · Vermelho −3 · Autogolo −2
//   Capitão ×2

export interface PointsBreakdownItem { label: string; pts: number }

export const GOAL_POINTS: Record<FantasyPosition, number> = { GK: 6, DEF: 6, MID: 5, FWD: 4 };
export const CLEAN_SHEET_POINTS: Record<FantasyPosition, number> = { GK: 4, DEF: 4, MID: 1, FWD: 0 };

export function playerMatchPoints(
  line: PlayerStatLine,
  position: FantasyPosition,
  stats: MatchPlayerStats,
  match: Match,
): { total: number; breakdown: PointsBreakdownItem[] } {
  const breakdown: PointsBreakdownItem[] = [];
  const played = line.started || line.subbedIn;
  if (!played) return { total: 0, breakdown };

  breakdown.push(line.started ? { label: 'Titular', pts: 2 } : { label: 'Entrou', pts: 1 });

  if (line.goals > 0) breakdown.push({ label: `${line.goals} golo${line.goals > 1 ? 's' : ''}`, pts: line.goals * GOAL_POINTS[position] });
  if (line.assists > 0) breakdown.push({ label: `${line.assists} assistência${line.assists > 1 ? 's' : ''}`, pts: line.assists * 3 });

  const conceded = line.teamId === match.homeTeamId ? stats.awayScore : stats.homeScore;

  if (line.started && conceded === 0 && stats.status === 'finished' && CLEAN_SHEET_POINTS[position] > 0) {
    breakdown.push({ label: 'Baliza a zeros', pts: CLEAN_SHEET_POINTS[position] });
  }
  if (position === 'GK' && line.saves >= 3) {
    breakdown.push({ label: `${line.saves} defesas`, pts: Math.floor(line.saves / 3) });
  }
  if (line.started && (position === 'GK' || position === 'DEF') && conceded >= 2) {
    breakdown.push({ label: `${conceded} golos sofridos`, pts: -Math.floor(conceded / 2) });
  }
  if (line.yellow > 0) breakdown.push({ label: 'Cartão amarelo', pts: -line.yellow });
  if (line.red > 0) breakdown.push({ label: 'Cartão vermelho', pts: -3 * line.red });
  if (line.ownGoals > 0) breakdown.push({ label: `${line.ownGoals} autogolo${line.ownGoals > 1 ? 's' : ''}`, pts: -2 * line.ownGoals });

  return { total: breakdown.reduce((s, b) => s + b.pts, 0), breakdown };
}

// ─── PONTOS DA JORNADA (com substituições automáticas e capitão) ─────────────
export type PlayerWeekState = 'played' | 'pending' | 'didnt-play' | 'no-match';

export interface PlayerWeekResult {
  playerId: string;
  state: PlayerWeekState;
  points: number;               // pontos base (sem capitão)
  breakdown: PointsBreakdownItem[];
  live: boolean;                // tem jogo a decorrer
}

export interface SquadWeekResult {
  total: number;
  perPlayer: Record<string, PlayerWeekResult>;
  effectiveStarters: string[];  // XI após substituições automáticas
  autoSubs: { out: string; in: string }[];
  captainId: string | null;
  captainCounted: boolean;      // capitão jogou → pontos a dobrar
  finished: boolean;            // todos os jogos relevantes terminados
}

function playerWeekResult(
  playerId: string,
  byId: Record<string, FantasyPlayer>,
  weekMatches: Match[],
  stats: Record<string, MatchPlayerStats>,
): PlayerWeekResult {
  const player = byId[playerId];
  if (!player) return { playerId, state: 'no-match', points: 0, breakdown: [], live: false };

  const teamMatches = weekMatches.filter(
    m => m.homeTeamId === player.teamId || m.awayTeamId === player.teamId,
  );
  if (teamMatches.length === 0) {
    return { playerId, state: 'no-match', points: 0, breakdown: [], live: false };
  }

  let points = 0;
  const breakdown: PointsBreakdownItem[] = [];
  let anyPlayed = false;
  let anyPending = false;
  let anyLive = false;

  for (const m of teamMatches) {
    const s = stats[m.id];
    if (!s) {
      // sem estatísticas ainda — pendente se o jogo ainda não acabou há muito
      anyPending = true;
      continue;
    }
    if (s.status === 'live') anyLive = true;
    const line = s.players[playerId];
    if (!line || (!line.started && !line.subbedIn)) {
      if (s.status === 'live') anyPending = true; // ainda pode entrar
      continue;
    }
    anyPlayed = true;
    const r = playerMatchPoints(line, player.position, s, m);
    points += r.total;
    breakdown.push(...r.breakdown);
  }

  const state: PlayerWeekState = anyPlayed ? 'played' : anyPending ? 'pending' : 'didnt-play';
  return { playerId, state, points, breakdown, live: anyLive };
}

export function computeSquadWeekPoints(
  squad: Pick<FantasySquad, 'starters' | 'bench' | 'captainId'>,
  weekMatches: Match[],
  stats: Record<string, MatchPlayerStats>,
  byId: Record<string, FantasyPlayer>,
): SquadWeekResult {
  const perPlayer: Record<string, PlayerWeekResult> = {};
  [...squad.starters, ...squad.bench].forEach(id => {
    perPlayer[id] = playerWeekResult(id, byId, weekMatches, stats);
  });

  const finished = Object.values(perPlayer).every(r => r.state !== 'pending');

  // Substituições automáticas — apenas quando já não há jogos pendentes do
  // titular (didnt-play / no-match definitivo)
  const effective = [...squad.starters];
  const autoSubs: { out: string; in: string }[] = [];
  const usedBench = new Set<string>();

  const formationValid = (ids: string[]) => {
    const c = countPositions(ids, byId);
    return c.GK === 1 && c.DEF >= SQUAD_RULES.defMin && c.MID >= SQUAD_RULES.midMin && c.FWD >= SQUAD_RULES.fwdMin;
  };

  for (let i = 0; i < effective.length; i++) {
    const starterId = effective[i];
    const r = perPlayer[starterId];
    if (!r || r.state === 'played' || r.state === 'pending') continue;
    const starterPos = byId[starterId]?.position;
    for (const benchId of squad.bench) {
      if (usedBench.has(benchId)) continue;
      const br = perPlayer[benchId];
      if (!br || br.state !== 'played') continue;
      const benchPos = byId[benchId]?.position;
      // GR só troca com GR; jogadores de campo não entram por GR
      if ((starterPos === 'GK') !== (benchPos === 'GK')) continue;
      const candidate = [...effective];
      candidate[i] = benchId;
      if (!formationValid(candidate)) continue;
      effective[i] = benchId;
      usedBench.add(benchId);
      autoSubs.push({ out: starterId, in: benchId });
      break;
    }
  }

  const captainCounted = !!(squad.captainId && perPlayer[squad.captainId]?.state === 'played');

  let total = 0;
  effective.forEach(id => {
    const pts = perPlayer[id]?.points ?? 0;
    total += pts;
    if (id === squad.captainId && captainCounted) total += pts; // ×2
  });

  return {
    total,
    perPlayer,
    effectiveStarters: effective,
    autoSubs,
    captainId: squad.captainId ?? null,
    captainCounted,
    finished,
  };
}

// Selecções sem jogo que pontue na jornada (ex: equipas cujo jogo da J1
// aconteceu antes do fecho, ou já eliminadas). Se a jornada ainda tiver jogos
// por definir (TBD), devolve um conjunto vazio — não dá para saber quem joga.
export function teamsWithoutMatchInWeek(week: FantasyWeek): Set<string> {
  const all = week.matchIds.map(id => ALL_MATCHES.find(m => m.id === id)!).filter(Boolean);
  if (all.some(m => m.homeTeamId === 'TBD' || m.awayTeamId === 'TBD')) return new Set();
  const playing = new Set<string>();
  scoringMatchesOfWeek(week).forEach(m => { playing.add(m.homeTeamId); playing.add(m.awayTeamId); });
  const out = new Set<string>();
  TEAMS_LIST.forEach(t => { if (!playing.has(t.id)) out.add(t.id); });
  return out;
}

export const POSITION_LABELS: Record<FantasyPosition, string> = {
  GK: 'Guarda-redes', DEF: 'Defesa', MID: 'Médio', FWD: 'Avançado',
};

export const POSITION_SHORT: Record<FantasyPosition, string> = {
  GK: 'GR', DEF: 'DEF', MID: 'MED', FWD: 'AVA',
};

export function formatValue(v: number): string {
  return Number.isInteger(v) ? `${v}M€` : `${v.toFixed(1).replace('.', ',')}M€`;
}
