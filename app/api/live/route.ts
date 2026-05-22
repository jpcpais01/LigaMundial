import { NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────
export type LiveScore = {
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished';
  elapsed?: number; // minutes played
};

// Indexed by `${homeTeamId}_${awayTeamId}` using our internal IDs
export type LiveScoresMap = Record<string, LiveScore>;

// ─── Server-side cache (5 min) ────────────────────────────────────────────────
let _cache: { data: LiveScoresMap; at: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

// ─── Team name → internal ID mapping ─────────────────────────────────────────
// Covers the different name formats API-Football may return
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

// Live status codes from API-Football
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT']);
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFixtures(fixtures: any[]): LiveScoresMap {
  const map: LiveScoresMap = {};
  for (const f of fixtures) {
    const homeName: string = f.teams?.home?.name ?? '';
    const awayName: string = f.teams?.away?.name ?? '';
    const homeId = API_TO_ID[homeName];
    const awayId = API_TO_ID[awayName];
    if (!homeId || !awayId) continue;

    const statusShort: string = f.fixture?.status?.short ?? '';
    const isLive = LIVE_STATUSES.has(statusShort);
    const isFinished = FINISHED_STATUSES.has(statusShort);
    if (!isLive && !isFinished) continue;

    map[`${homeId}_${awayId}`] = {
      homeScore: f.goals?.home ?? 0,
      awayScore: f.goals?.away ?? 0,
      status: isLive ? 'live' : 'finished',
      elapsed: f.fixture?.status?.elapsed ?? undefined,
    };
  }
  return map;
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY;

  // Return empty map silently if no key configured
  if (!apiKey) {
    return NextResponse.json({} as LiveScoresMap);
  }

  // Serve from cache if fresh
  if (_cache && Date.now() - _cache.at < CACHE_MS) {
    return NextResponse.json(_cache.data);
  }

  try {
    // Fetch live WC2026 matches (league 1, season 2026)
    const liveRes = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026&live=all',
      { headers: { 'x-apisports-key': apiKey } }
    );
    const liveJson = await liveRes.json();

    // Also fetch today's finished matches
    const today = new Date().toISOString().split('T')[0];
    const todayRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${today}`,
      { headers: { 'x-apisports-key': apiKey } }
    );
    const todayJson = await todayRes.json();

    const all = [
      ...(liveJson.response ?? []),
      ...(todayJson.response ?? []),
    ];

    const data = parseFixtures(all);
    _cache = { data, at: Date.now() };
    return NextResponse.json(data);
  } catch {
    // Return cached data on error, or empty
    return NextResponse.json(_cache?.data ?? {});
  }
}
