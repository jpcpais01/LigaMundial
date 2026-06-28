// Mapeamento de equipas ESPN → ids internos, partilhado pelas rotas
// /api/live (resultados) e /api/fantasy (estatísticas de jogadores).
import { ALL_MATCHES } from '@/data/matches';
import type { Match } from '@/types';

// Primário: código FIFA (abbreviation); fallback: nome em inglês
export const ABBR_TO_ID: Record<string, string> = {
  MEX: 'mexico', RSA: 'south-africa', KOR: 'south-korea', CZE: 'czech-rep',
  CAN: 'canada', BIH: 'bosnia', QAT: 'qatar', SUI: 'switzerland',
  BRA: 'brazil', MAR: 'morocco', HAI: 'haiti', SCO: 'scotland',
  USA: 'usa', PAR: 'paraguay', AUS: 'australia', TUR: 'turkey',
  GER: 'germany', CUW: 'curacao', CIV: 'ivory-coast', ECU: 'ecuador',
  NED: 'netherlands', JPN: 'japan', SWE: 'sweden', TUN: 'tunisia',
  BEL: 'belgium', EGY: 'egypt', IRN: 'iran', IRI: 'iran', NZL: 'new-zealand',
  ESP: 'spain', CPV: 'cape-verde', KSA: 'saudi-arabia', SAU: 'saudi-arabia',
  URU: 'uruguay', FRA: 'france', SEN: 'senegal', IRQ: 'iraq', NOR: 'norway',
  ARG: 'argentina', ALG: 'algeria', AUT: 'austria', JOR: 'jordan',
  POR: 'portugal', COD: 'dr-congo', UZB: 'uzbekistan', COL: 'colombia',
  ENG: 'england', CRO: 'croatia', GHA: 'ghana', PAN: 'panama',
};

export const NAME_TO_ID: Record<string, string> = {
  'Mexico': 'mexico',
  'South Africa': 'south-africa',
  'Korea Republic': 'south-korea', 'South Korea': 'south-korea',
  'Czech Republic': 'czech-rep', 'Czechia': 'czech-rep',
  'Canada': 'canada',
  'Bosnia': 'bosnia', 'Bosnia and Herzegovina': 'bosnia', 'Bosnia-Herzegovina': 'bosnia',
  'Qatar': 'qatar',
  'Switzerland': 'switzerland',
  'Brazil': 'brazil',
  'Morocco': 'morocco',
  'Haiti': 'haiti',
  'Scotland': 'scotland',
  'USA': 'usa', 'United States': 'usa',
  'Paraguay': 'paraguay',
  'Australia': 'australia',
  'Turkey': 'turkey', 'Turkiye': 'turkey', 'Türkiye': 'turkey',
  'Germany': 'germany',
  'Curacao': 'curacao', 'Curaçao': 'curacao',
  'Ivory Coast': 'ivory-coast', "Cote d'Ivoire": 'ivory-coast', "Côte d'Ivoire": 'ivory-coast',
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
  'Cape Verde': 'cape-verde', 'Cabo Verde': 'cape-verde', 'Cape Verde Islands': 'cape-verde',
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveTeamId(team: any): string | null {
  if (!team) return null;
  return ABBR_TO_ID[team.abbreviation ?? ''] ?? NAME_TO_ID[team.displayName ?? ''] ?? NAME_TO_ID[team.name ?? ''] ?? null;
}

// Encontra o jogo interno correspondente; em caso de pares repetidos
// (ex: reencontro na fase a eliminar) escolhe o mais próximo da data do evento
// `pool` permite passar os jogos com o quadro a eliminar já resolvido (equipas
// reais); por omissão usa os jogos estáticos (apenas a fase de grupos casa).
export function findMatch(
  homeId: string,
  awayId: string,
  eventDate: string,
  pool: Match[] = ALL_MATCHES,
): { match: Match; swapped: boolean } | null {
  const candidates: { match: Match; swapped: boolean }[] = [];
  for (const m of pool) {
    if (m.homeTeamId === homeId && m.awayTeamId === awayId) candidates.push({ match: m, swapped: false });
    else if (m.homeTeamId === awayId && m.awayTeamId === homeId) candidates.push({ match: m, swapped: true });
  }
  if (candidates.length === 0) return null;
  const t = new Date(eventDate).getTime();
  candidates.sort((a, b) =>
    Math.abs(new Date(a.match.scheduledAt).getTime() - t) -
    Math.abs(new Date(b.match.scheduledAt).getTime() - t)
  );
  return candidates[0];
}
