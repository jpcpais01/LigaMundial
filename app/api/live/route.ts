import { NextResponse } from 'next/server';
import { ALL_MATCHES } from '@/data/matches';

// ─── Types ────────────────────────────────────────────────────────────────────
export type LiveScore = {
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  elapsed?: number;
};
export type LiveScoresMap = Record<string, LiveScore>;

// ─── Server-side cache ────────────────────────────────────────────────────────
let _cache: { data: LiveScoresMap; at: number } | null = null;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

// ─── Is any match happening right now? ───────────────────────────────────────
// Returns true if any match is scheduled within the last 3h or next 30min.
// This prevents calling the API during the ~20 hours per day with no matches.
function anyMatchActive(): boolean {
  const now = Date.now();
  return ALL_MATCHES.some(m => {
    if (m.homeTeamId === 'TBD') return false;
    const start = new Date(m.scheduledAt).getTime();
    return now >= start - 30 * 60 * 1000   // starts within 30 min
        && now <= start + 3 * 60 * 60 * 1000; // finished within 3h
  });
}

// ─── Team name → internal ID ──────────────────────────────────────────────────
const API_TO_ID: Record<string, string> = {
  'Mexico': 'mexico',
  'South Africa': 'south-africa',
  'Korea Republic': 'south-korea', 'South Korea': 'south-korea',
  'Czech Republic': 'czech-rep', 'Czechia': 'czech-rep',
  'Canada': 'canada',
  'Bosnia': 'bosnia', 'Bosnia and Herzegovina': 'bosnia',
  'Qatar': 'qatar',
  'Switzerland': 'switzerland',
  'Brazil': 'brazil',
  'Morocco': 'morocco',
  'Haiti': 'haiti',
  'Scotland': 'scotland',
  'USA': 'usa', 'United States': 'usa',
  'Paraguay': 'paraguay',
  'Australia': 'australia',
  'Turkey': 'turkey', 'Turkiye': 'turkey',
  'Germany': 'germany',
  'Curacao': 'curacao', 'Curaçao': 'curacao',
  'Ivory Coast': 'ivory-coast', "Cote d'Ivoire": 'ivory-coast',
  'Ecuador': 'ecuador',
  'Netherlands': 'netherlands',
  'Japan': 'japan',
  'Sweden': 'sweden',
  'Tunisia': 'tunisia',
  'Belgium': 'belgium',
  'Egypt': 'egypt',
  'Iran': 'iran',
  'New Zealand': 'new-zealand',
  'Spain': 'spain',
  'Cape Verde': 'cape-verde',
  'Saudi Arabia': 'saudi-arabia',
  'Uruguay': 'uruguay',
  'France': 'france',
  'Senegal': 'senegal',
  'Iraq': 'iraq',
  'Norway': 'norway',
  'Argentina': 'argentina',
  'Algeria': 'algeria',
  'Austria': 'austria',
  'Jordan': 'jordan',
  'Portugal': 'portugal',
  'DR Congo': 'dr-congo', 'Congo DR': 'dr-congo',
  'Uzbekistan': 'uzbekistan',
  'Colombia': 'colombia',
  'England': 'england',
  'Croatia': 'croatia',
  'Ghana': 'ghana',
  'Panama': 'panama',
};

const LIVE_STATUSES     = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT']);
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFixtures(fixtures: any[]): LiveScoresMap {
  const map: LiveScoresMap = {};
  for (const f of fixtures) {
    const homeId = API_TO_ID[f.teams?.home?.name ?? ''];
    const awayId = API_TO_ID[f.teams?.away?.name ?? ''];
    if (!homeId || !awayId) continue;
    const s: string = f.fixture?.status?.short ?? '';
    if (!LIVE_STATUSES.has(s) && !FINISHED_STATUSES.has(s)) continue;
    map[`${homeId}_${awayId}`] = {
      homeScore: f.goals?.home ?? 0,
      awayScore: f.goals?.away ?? 0,
      status: LIVE_STATUSES.has(s) ? 'live' : 'finished',
      elapsed: f.fixture?.status?.elapsed ?? undefined,
    };
  }
  return map;
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return NextResponse.json({} as LiveScoresMap);

  // Outside match windows → return empty without touching the API
  if (!anyMatchActive()) {
    return NextResponse.json(_cache?.data ?? {});
  }

  // Fresh cache → return it
  if (_cache && Date.now() - _cache.at < CACHE_MS) {
    return NextResponse.json(_cache.data);
  }

  // One API call: all currently live WC2026 fixtures
  try {
    const res = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026&live=all',
      { headers: { 'x-apisports-key': apiKey } }
    );
    const json = await res.json();
    const data = parseFixtures(json.response ?? []);
    _cache = { data, at: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(_cache?.data ?? {});
  }
}
