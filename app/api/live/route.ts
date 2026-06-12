import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ALL_MATCHES, TOURNAMENT_START } from '@/data/matches';
import { resolveTeamId, findMatch } from '@/lib/espn';
import type { Match, MatchResult } from '@/types';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────
export type LiveScore = {
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  elapsed?: number;
};
export type LiveScoresMap = Record<string, LiveScore>;

type FirestoreLiveDoc = {
  scores: LiveScoresMap;
  updatedAt: number; // ms timestamp
};

// ─── Constants ────────────────────────────────────────────────────────────────
// Fonte de dados: API pública da ESPN (sem chave, cobre o Mundial 2026)
const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const ACTIVE_CACHE_MS = 30 * 1000;      // durante jogos: refresca a cada 30 s
const IDLE_CACHE_MS   = 5 * 60 * 1000;  // sem jogos a decorrer: a cada 5 min
const WINDOW_BEFORE_MS = 30 * 60 * 1000;
const WINDOW_AFTER_MS  = 3 * 60 * 60 * 1000;

// ─── Is any match happening right now? ───────────────────────────────────────
function anyMatchActive(): boolean {
  const now = Date.now();
  return ALL_MATCHES.some(m => {
    if (m.homeTeamId === 'TBD') return false;
    const start = new Date(m.scheduledAt).getTime();
    return now >= start - WINDOW_BEFORE_MS && now <= start + WINDOW_AFTER_MS;
  });
}

// Há jogos já terminados (janela expirada) sem resultado registado?
function hasUnsettledFinishedMatches(results: Record<string, MatchResult>): boolean {
  const now = Date.now();
  return ALL_MATCHES.some(m => {
    if (m.homeTeamId === 'TBD' || results[m.id]) return false;
    return now > new Date(m.scheduledAt).getTime() + WINDOW_AFTER_MS;
  });
}

// ─── Parsing ESPN ─────────────────────────────────────────────────────────────
// (mapeamento de equipas e matching de jogos em lib/espn.ts)

type ParsedEvent = {
  match: Match;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  elapsed?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEspnEvents(events: any[]): ParsedEvent[] {
  const out: ParsedEvent[] = [];
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

    const found = findMatch(homeId, awayId, e?.date ?? '');
    if (!found) continue;

    let homeScore = parseInt(homeSide?.score ?? '0') || 0;
    let awayScore = parseInt(awaySide?.score ?? '0') || 0;
    if (found.swapped) [homeScore, awayScore] = [awayScore, homeScore];

    const elapsed = parseInt(e?.status?.displayClock ?? '');
    out.push({
      match: found.match,
      homeScore,
      awayScore,
      status: isLive ? 'live' : 'finished',
      elapsed: isNaN(elapsed) ? undefined : elapsed,
    });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchEspnEvents(): Promise<any[]> {
  const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, '');
  // Todo o torneio até amanhã — permite liquidar jogos antigos em falta
  const range = `${fmt(new Date(TOURNAMENT_START).getTime())}-${fmt(Date.now() + 24 * 60 * 60 * 1000)}`;
  const res = await fetch(`${ESPN_SCOREBOARD}?dates=${range}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.events)) throw new Error('ESPN: resposta sem events');
  return json.events;
}

// ─── Resultados (settlement) ──────────────────────────────────────────────────
async function readAllResults(): Promise<Record<string, MatchResult>> {
  const snaps = await getDocs(collection(db, 'results'));
  const res: Record<string, MatchResult> = {};
  snaps.docs.forEach(d => { res[d.id] = d.data() as MatchResult; });
  return res;
}

// Regista automaticamente os resultados finais; nunca substitui resultados
// inseridos manualmente pelo admin
async function settleFinished(parsed: ParsedEvent[], results: Record<string, MatchResult>): Promise<void> {
  const writes: Promise<void>[] = [];
  for (const p of parsed) {
    if (p.status !== 'finished') continue;
    const existing = results[p.match.id];
    if (existing) {
      // 'admin' (ou docs antigos sem source) têm prioridade; auto só corrige auto
      if (existing.source !== 'auto') continue;
      if (existing.homeScore === p.homeScore && existing.awayScore === p.awayScore) continue;
    }
    const result: MatchResult = {
      matchId: p.match.id,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      setAt: new Date().toISOString(),
      source: 'auto',
    };
    results[p.match.id] = result;
    writes.push(setDoc(doc(db, 'results', p.match.id), result));
  }
  await Promise.all(writes);
}

// Converte a colecção de resultados para o mapa usado pela UI
function finishedMapFromResults(results: Record<string, MatchResult>): LiveScoresMap {
  const map: LiveScoresMap = {};
  for (const r of Object.values(results)) {
    const m = ALL_MATCHES.find(x => x.id === r.matchId);
    if (!m || m.homeTeamId === 'TBD') continue;
    map[`${m.homeTeamId}_${m.awayTeamId}`] = {
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      status: 'finished',
    };
  }
  return map;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET() {
  const active = anyMatchActive();
  const cacheTtl = active ? ACTIVE_CACHE_MS : IDLE_CACHE_MS;

  // Step 1 — cache partilhada no Firestore (comum a todas as instâncias)
  let cached: FirestoreLiveDoc | null = null;
  try {
    const snap = await getDoc(doc(db, 'liveScores', 'current'));
    if (snap.exists()) cached = snap.data() as FirestoreLiveDoc;
  } catch { /* falha de leitura — segue em frente */ }

  if (cached && Date.now() - cached.updatedAt < cacheTtl) {
    return NextResponse.json(cached.scores);
  }

  // Step 2 — cache expirada: reconstruir a partir dos resultados + ESPN
  let results: Record<string, MatchResult>;
  try {
    results = await readAllResults();
  } catch {
    return NextResponse.json(cached?.scores ?? {});
  }

  let liveOnly: LiveScoresMap = {};
  if (active || hasUnsettledFinishedMatches(results)) {
    try {
      const parsed = parseEspnEvents(await fetchEspnEvents());
      await settleFinished(parsed, results);
      for (const p of parsed) {
        if (p.status !== 'live') continue;
        liveOnly[`${p.match.homeTeamId}_${p.match.awayTeamId}`] = {
          homeScore: p.homeScore,
          awayScore: p.awayScore,
          status: 'live',
          elapsed: p.elapsed,
        };
      }
    } catch {
      // ESPN falhou — devolve a cache antiga sem a substituir
      if (cached) return NextResponse.json(cached.scores);
      liveOnly = {};
    }
  }

  // Resultados liquidados primeiro; jogos ao vivo sobrepõem-se
  const merged: LiveScoresMap = { ...finishedMapFromResults(results), ...liveOnly };

  try {
    const newDoc: FirestoreLiveDoc = { scores: merged, updatedAt: Date.now() };
    await setDoc(doc(db, 'liveScores', 'current'), newDoc);
  } catch { /* falha de escrita da cache não impede a resposta */ }

  return NextResponse.json(merged);
}
