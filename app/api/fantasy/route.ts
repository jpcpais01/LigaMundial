import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GROUP_MATCHES, TOURNAMENT_START } from '@/data/matches';
import { resolveTeamId, findMatch } from '@/lib/espn';
import { resolveKnockout } from '@/lib/bracket';
import { isRealTeam } from '@/data/teams';
import type { Match, MatchPlayerStats, MatchResult, PlayerStatLine } from '@/types';

export const dynamic = 'force-dynamic';

// Estatísticas por jogador (golos, assistências, defesas, cartões…) a partir
// dos resumos de jogo da ESPN. Jogos terminados ficam guardados de forma
// permanente em `liveScores/fantasy_stats_{matchId}`; jogos ao vivo vivem numa
// cache partilhada em `liveScores/fantasy_cache`.
// Nota: as regras do Firestore só permitem escrita nas colecções existentes
// (leagueMembers / results / liveScores), por isso os dados fantasy vivem em
// documentos com prefixo dentro de `liveScores` — a rota /api/live lê apenas
// o documento `current`, pelo que não há interferência.

const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const ESPN_SUMMARY = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary';

const ACTIVE_CACHE_MS = 60 * 1000;       // jogos a decorrer: refresca a cada 60 s
const IDLE_CACHE_MS = 5 * 60 * 1000;     // sem jogos: tenta liquidar a cada 5 min
const WINDOW_BEFORE_MS = 30 * 60 * 1000;
const WINDOW_AFTER_MS = 3 * 60 * 60 * 1000;
const MAX_SUMMARIES_PER_RUN = 8;         // limita a latência de cada pedido

type CacheDoc = {
  live: Record<string, MatchPlayerStats>;
  checkedAt: number;
};

function anyMatchActive(matches: Match[]): boolean {
  const now = Date.now();
  return matches.some(m => {
    if (!isRealTeam(m.homeTeamId)) return false;
    const start = new Date(m.scheduledAt).getTime();
    return now >= start - WINDOW_BEFORE_MS && now <= start + WINDOW_AFTER_MS;
  });
}

// Jogos com janela expirada e ainda sem estatísticas guardadas
function unsettledMatchIds(matches: Match[], settled: Set<string>): string[] {
  const now = Date.now();
  return matches
    .filter(m => isRealTeam(m.homeTeamId)
      && !settled.has(m.id)
      && now > new Date(m.scheduledAt).getTime() + WINDOW_AFTER_MS)
    .map(m => m.id);
}

// ─── Parsing ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statValue(stats: any[], name: string): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = (stats || []).find((x: any) => x.name === name);
  return typeof s?.value === 'number' ? s.value : 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSummaryRosters(summary: any): Record<string, PlayerStatLine> | null {
  const rosters = summary?.rosters;
  if (!Array.isArray(rosters) || rosters.length < 2) return null;
  const players: Record<string, PlayerStatLine> = {};
  let anyPlayer = false;
  for (const side of rosters) {
    const teamId = resolveTeamId(side?.team);
    if (!teamId) continue;
    for (const entry of side?.roster ?? []) {
      const id = entry?.athlete?.id;
      if (!id) continue;
      anyPlayer = true;
      players[String(id)] = {
        teamId,
        started: entry.starter === true,
        subbedIn: entry.subbedIn === true,
        subbedOut: entry.subbedOut === true,
        goals: statValue(entry.stats, 'totalGoals'),
        assists: statValue(entry.stats, 'goalAssists'),
        saves: statValue(entry.stats, 'saves'),
        yellow: statValue(entry.stats, 'yellowCards'),
        red: statValue(entry.stats, 'redCards'),
        ownGoals: statValue(entry.stats, 'ownGoals'),
      };
    }
  }
  return anyPlayer ? players : null;
}

type MappedEvent = {
  matchId: string;
  espnEventId: string;
  homeScore: number;   // já na orientação interna do jogo
  awayScore: number;
  status: 'live' | 'finished';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvents(events: any[], pool: Match[]): MappedEvent[] {
  const out: MappedEvent[] = [];
  for (const e of events) {
    const comp = e?.competitions?.[0];
    if (!comp) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const homeSide = comp.competitors?.find((c: any) => c.homeAway === 'home');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const awaySide = comp.competitors?.find((c: any) => c.homeAway === 'away');
    const homeId = resolveTeamId(homeSide?.team);
    const awayId = resolveTeamId(awaySide?.team);
    if (!homeId || !awayId) continue;

    const state: string = e?.status?.type?.state ?? '';
    const completed: boolean = e?.status?.type?.completed === true;
    const isLive = state === 'in';
    const isFinished = state === 'post' && completed;
    if (!isLive && !isFinished) continue;

    const found = findMatch(homeId, awayId, e?.date ?? '', pool);
    if (!found) continue;

    let homeScore = parseInt(homeSide?.score ?? '0') || 0;
    let awayScore = parseInt(awaySide?.score ?? '0') || 0;
    if (found.swapped) [homeScore, awayScore] = [awayScore, homeScore];

    out.push({
      matchId: found.match.id,
      espnEventId: String(e.id),
      homeScore,
      awayScore,
      status: isLive ? 'live' : 'finished',
    });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchEspnEvents(): Promise<any[]> {
  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, '');
  const range = `${fmt(new Date(TOURNAMENT_START).getTime())}-${fmt(Date.now() + 24 * 60 * 60 * 1000)}`;
  const res = await fetch(`${ESPN_SCOREBOARD}?dates=${range}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.events)) throw new Error('ESPN: resposta sem events');
  return json.events;
}

async function fetchMatchStats(ev: MappedEvent): Promise<MatchPlayerStats | null> {
  const res = await fetch(`${ESPN_SUMMARY}?event=${ev.espnEventId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const players = parseSummaryRosters(await res.json());
  if (!players) return null;
  return {
    matchId: ev.matchId,
    espnEventId: ev.espnEventId,
    homeScore: ev.homeScore,
    awayScore: ev.awayScore,
    status: ev.status,
    players,
    updatedAt: new Date().toISOString(),
  };
}

// ─── Firestore ────────────────────────────────────────────────────────────────
const STATS_PREFIX = 'fantasy_stats_';
const CACHE_DOC = 'fantasy_cache';

async function readSettledStats(): Promise<Record<string, MatchPlayerStats>> {
  const snaps = await getDocs(collection(db, 'liveScores'));
  const out: Record<string, MatchPlayerStats> = {};
  snaps.docs.forEach(d => {
    if (!d.id.startsWith(STATS_PREFIX)) return;
    out[d.id.slice(STATS_PREFIX.length)] = d.data() as MatchPlayerStats;
  });
  return out;
}

async function readAllResults(): Promise<Record<string, MatchResult>> {
  const snaps = await getDocs(collection(db, 'results'));
  const res: Record<string, MatchResult> = {};
  snaps.docs.forEach(d => { res[d.id] = d.data() as MatchResult; });
  return res;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET() {
  let settled: Record<string, MatchPlayerStats>;
  try {
    settled = await readSettledStats();
  } catch {
    return NextResponse.json({ stats: {}, updatedAt: Date.now() }, { status: 200 });
  }

  let cache: CacheDoc = { live: {}, checkedAt: 0 };
  try {
    const snap = await getDoc(doc(db, 'liveScores', CACHE_DOC));
    if (snap.exists()) cache = snap.data() as CacheDoc;
  } catch { /* segue sem cache */ }

  // Resolve as equipas do quadro a eliminar para casar os jogos da ESPN.
  let allMatches: Match[] = GROUP_MATCHES;
  try {
    allMatches = [...GROUP_MATCHES, ...resolveKnockout(await readAllResults())];
  } catch { /* sem resultados — fica só com a fase de grupos */ }

  const active = anyMatchActive(allMatches);
  const missing = unsettledMatchIds(allMatches, new Set(Object.keys(settled)));
  const ttl = active ? ACTIVE_CACHE_MS : IDLE_CACHE_MS;
  const needCheck = (active || missing.length > 0) && Date.now() - cache.checkedAt > ttl;

  if (needCheck) {
    try {
      const events = mapEvents(await fetchEspnEvents(), allMatches);
      const toFetch: MappedEvent[] = [];
      for (const ev of events) {
        if (ev.status === 'live') toFetch.push(ev);
        else if (!settled[ev.matchId]) toFetch.push(ev);
      }

      const live: Record<string, MatchPlayerStats> = {};
      const writes: Promise<void>[] = [];
      for (const ev of toFetch.slice(0, MAX_SUMMARIES_PER_RUN)) {
        const stats = await fetchMatchStats(ev);
        if (!stats) continue;
        if (stats.status === 'finished') {
          settled[stats.matchId] = stats;
          writes.push(setDoc(doc(db, 'liveScores', `${STATS_PREFIX}${stats.matchId}`), stats));
        } else {
          live[stats.matchId] = stats;
        }
      }
      cache = { live, checkedAt: Date.now() };
      writes.push(setDoc(doc(db, 'liveScores', CACHE_DOC), cache));
      await Promise.all(writes);
    } catch {
      // ESPN indisponível — responde com o que temos
    }
  }

  // Jogos liquidados têm prioridade sobre a cache ao vivo
  const merged: Record<string, MatchPlayerStats> = { ...cache.live, ...settled };
  return NextResponse.json({ stats: merged, updatedAt: cache.checkedAt || Date.now() });
}
