import { Match } from '@/types';

// ─── FASE DE GRUPOS ──────────────────────────────────────────────────────────
// Dados reais do sorteio do Mundial FIFA 2026 (fonte: openfootball/worldcup.json)
// Horários em UTC

export const GROUP_MATCHES: Match[] = [

  // ══ GRUPO A ══
  { id: 'm001', homeTeamId: 'mexico',       awayTeamId: 'south-africa', scheduledAt: '2026-06-11T19:00:00Z', status: 'scheduled', phase: 'group', group: 'A', round: 1, venue: 'Estadio Azteca',         city: 'Cidade do México' },
  { id: 'm002', homeTeamId: 'south-korea',  awayTeamId: 'czech-rep',    scheduledAt: '2026-06-12T02:00:00Z', status: 'scheduled', phase: 'group', group: 'A', round: 1, venue: 'Estadio Akron',          city: 'Guadalajara' },
  { id: 'm003', homeTeamId: 'czech-rep',    awayTeamId: 'south-africa', scheduledAt: '2026-06-18T16:00:00Z', status: 'scheduled', phase: 'group', group: 'A', round: 2, venue: 'Mercedes-Benz Stadium',   city: 'Atlanta' },
  { id: 'm004', homeTeamId: 'mexico',       awayTeamId: 'south-korea',  scheduledAt: '2026-06-19T01:00:00Z', status: 'scheduled', phase: 'group', group: 'A', round: 2, venue: 'Estadio Akron',          city: 'Guadalajara' },
  { id: 'm005', homeTeamId: 'czech-rep',    awayTeamId: 'mexico',       scheduledAt: '2026-06-25T01:00:00Z', status: 'scheduled', phase: 'group', group: 'A', round: 3, venue: 'Estadio Azteca',         city: 'Cidade do México' },
  { id: 'm006', homeTeamId: 'south-africa', awayTeamId: 'south-korea',  scheduledAt: '2026-06-25T01:00:00Z', status: 'scheduled', phase: 'group', group: 'A', round: 3, venue: 'Estadio BBVA',           city: 'Monterrey' },

  // ══ GRUPO B ══
  { id: 'm007', homeTeamId: 'canada',       awayTeamId: 'bosnia',       scheduledAt: '2026-06-12T19:00:00Z', status: 'scheduled', phase: 'group', group: 'B', round: 1, venue: 'BMO Field',              city: 'Toronto' },
  { id: 'm008', homeTeamId: 'qatar',        awayTeamId: 'switzerland',  scheduledAt: '2026-06-13T19:00:00Z', status: 'scheduled', phase: 'group', group: 'B', round: 1, venue: "Levi's Stadium",         city: 'Santa Clara' },
  { id: 'm009', homeTeamId: 'switzerland',  awayTeamId: 'bosnia',       scheduledAt: '2026-06-18T19:00:00Z', status: 'scheduled', phase: 'group', group: 'B', round: 2, venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm010', homeTeamId: 'canada',       awayTeamId: 'qatar',        scheduledAt: '2026-06-18T22:00:00Z', status: 'scheduled', phase: 'group', group: 'B', round: 2, venue: 'BC Place',               city: 'Vancouver' },
  { id: 'm011', homeTeamId: 'switzerland',  awayTeamId: 'canada',       scheduledAt: '2026-06-24T19:00:00Z', status: 'scheduled', phase: 'group', group: 'B', round: 3, venue: 'BC Place',               city: 'Vancouver' },
  { id: 'm012', homeTeamId: 'bosnia',       awayTeamId: 'qatar',        scheduledAt: '2026-06-24T19:00:00Z', status: 'scheduled', phase: 'group', group: 'B', round: 3, venue: 'Lumen Field',            city: 'Seattle' },

  // ══ GRUPO C ══
  { id: 'm013', homeTeamId: 'brazil',       awayTeamId: 'morocco',      scheduledAt: '2026-06-13T22:00:00Z', status: 'scheduled', phase: 'group', group: 'C', round: 1, venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'm014', homeTeamId: 'haiti',        awayTeamId: 'scotland',     scheduledAt: '2026-06-14T01:00:00Z', status: 'scheduled', phase: 'group', group: 'C', round: 1, venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm015', homeTeamId: 'scotland',     awayTeamId: 'morocco',      scheduledAt: '2026-06-19T22:00:00Z', status: 'scheduled', phase: 'group', group: 'C', round: 2, venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm016', homeTeamId: 'brazil',       awayTeamId: 'haiti',        scheduledAt: '2026-06-20T00:30:00Z', status: 'scheduled', phase: 'group', group: 'C', round: 2, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'm017', homeTeamId: 'scotland',     awayTeamId: 'brazil',       scheduledAt: '2026-06-24T22:00:00Z', status: 'scheduled', phase: 'group', group: 'C', round: 3, venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'm018', homeTeamId: 'morocco',      awayTeamId: 'haiti',        scheduledAt: '2026-06-24T22:00:00Z', status: 'scheduled', phase: 'group', group: 'C', round: 3, venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },

  // ══ GRUPO D ══
  { id: 'm019', homeTeamId: 'usa',          awayTeamId: 'paraguay',     scheduledAt: '2026-06-13T01:00:00Z', status: 'scheduled', phase: 'group', group: 'D', round: 1, venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm020', homeTeamId: 'australia',    awayTeamId: 'turkey',       scheduledAt: '2026-06-14T04:00:00Z', status: 'scheduled', phase: 'group', group: 'D', round: 1, venue: 'BC Place',               city: 'Vancouver' },
  { id: 'm021', homeTeamId: 'usa',          awayTeamId: 'australia',    scheduledAt: '2026-06-19T19:00:00Z', status: 'scheduled', phase: 'group', group: 'D', round: 2, venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'm022', homeTeamId: 'turkey',       awayTeamId: 'paraguay',     scheduledAt: '2026-06-20T03:00:00Z', status: 'scheduled', phase: 'group', group: 'D', round: 2, venue: "Levi's Stadium",         city: 'Santa Clara' },
  { id: 'm023', homeTeamId: 'turkey',       awayTeamId: 'usa',          scheduledAt: '2026-06-26T02:00:00Z', status: 'scheduled', phase: 'group', group: 'D', round: 3, venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm024', homeTeamId: 'paraguay',     awayTeamId: 'australia',    scheduledAt: '2026-06-26T02:00:00Z', status: 'scheduled', phase: 'group', group: 'D', round: 3, venue: "Levi's Stadium",         city: 'Santa Clara' },

  // ══ GRUPO E ══
  { id: 'm025', homeTeamId: 'germany',      awayTeamId: 'curacao',      scheduledAt: '2026-06-14T17:00:00Z', status: 'scheduled', phase: 'group', group: 'E', round: 1, venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'm026', homeTeamId: 'ivory-coast',  awayTeamId: 'ecuador',      scheduledAt: '2026-06-14T23:00:00Z', status: 'scheduled', phase: 'group', group: 'E', round: 1, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'm027', homeTeamId: 'germany',      awayTeamId: 'ivory-coast',  scheduledAt: '2026-06-20T20:00:00Z', status: 'scheduled', phase: 'group', group: 'E', round: 2, venue: 'BMO Field',              city: 'Toronto' },
  { id: 'm028', homeTeamId: 'ecuador',      awayTeamId: 'curacao',      scheduledAt: '2026-06-21T00:00:00Z', status: 'scheduled', phase: 'group', group: 'E', round: 2, venue: 'Arrowhead Stadium',      city: 'Kansas City' },
  { id: 'm029', homeTeamId: 'curacao',      awayTeamId: 'ivory-coast',  scheduledAt: '2026-06-25T20:00:00Z', status: 'scheduled', phase: 'group', group: 'E', round: 3, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'm030', homeTeamId: 'ecuador',      awayTeamId: 'germany',      scheduledAt: '2026-06-25T20:00:00Z', status: 'scheduled', phase: 'group', group: 'E', round: 3, venue: 'MetLife Stadium',        city: 'Nova Iorque' },

  // ══ GRUPO F ══
  { id: 'm031', homeTeamId: 'netherlands',  awayTeamId: 'japan',        scheduledAt: '2026-06-14T20:00:00Z', status: 'scheduled', phase: 'group', group: 'F', round: 1, venue: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'm032', homeTeamId: 'sweden',       awayTeamId: 'tunisia',      scheduledAt: '2026-06-15T02:00:00Z', status: 'scheduled', phase: 'group', group: 'F', round: 1, venue: 'Estadio BBVA',          city: 'Monterrey' },
  { id: 'm033', homeTeamId: 'netherlands',  awayTeamId: 'sweden',       scheduledAt: '2026-06-20T17:00:00Z', status: 'scheduled', phase: 'group', group: 'F', round: 2, venue: 'NRG Stadium',           city: 'Houston' },
  { id: 'm034', homeTeamId: 'tunisia',      awayTeamId: 'japan',        scheduledAt: '2026-06-21T04:00:00Z', status: 'scheduled', phase: 'group', group: 'F', round: 2, venue: 'Estadio BBVA',          city: 'Monterrey' },
  { id: 'm035', homeTeamId: 'japan',        awayTeamId: 'sweden',       scheduledAt: '2026-06-25T23:00:00Z', status: 'scheduled', phase: 'group', group: 'F', round: 3, venue: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'm036', homeTeamId: 'tunisia',      awayTeamId: 'netherlands',  scheduledAt: '2026-06-25T23:00:00Z', status: 'scheduled', phase: 'group', group: 'F', round: 3, venue: 'Arrowhead Stadium',      city: 'Kansas City' },

  // ══ GRUPO G ══
  { id: 'm037', homeTeamId: 'belgium',      awayTeamId: 'egypt',        scheduledAt: '2026-06-15T19:00:00Z', status: 'scheduled', phase: 'group', group: 'G', round: 1, venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'm038', homeTeamId: 'iran',         awayTeamId: 'new-zealand',  scheduledAt: '2026-06-16T01:00:00Z', status: 'scheduled', phase: 'group', group: 'G', round: 1, venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm039', homeTeamId: 'belgium',      awayTeamId: 'iran',         scheduledAt: '2026-06-21T19:00:00Z', status: 'scheduled', phase: 'group', group: 'G', round: 2, venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm040', homeTeamId: 'new-zealand',  awayTeamId: 'egypt',        scheduledAt: '2026-06-22T01:00:00Z', status: 'scheduled', phase: 'group', group: 'G', round: 2, venue: 'BC Place',               city: 'Vancouver' },
  { id: 'm041', homeTeamId: 'egypt',        awayTeamId: 'iran',         scheduledAt: '2026-06-27T03:00:00Z', status: 'scheduled', phase: 'group', group: 'G', round: 3, venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'm042', homeTeamId: 'new-zealand',  awayTeamId: 'belgium',      scheduledAt: '2026-06-27T03:00:00Z', status: 'scheduled', phase: 'group', group: 'G', round: 3, venue: 'BC Place',               city: 'Vancouver' },

  // ══ GRUPO H ══
  { id: 'm043', homeTeamId: 'spain',        awayTeamId: 'cape-verde',   scheduledAt: '2026-06-15T16:00:00Z', status: 'scheduled', phase: 'group', group: 'H', round: 1, venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { id: 'm044', homeTeamId: 'saudi-arabia', awayTeamId: 'uruguay',      scheduledAt: '2026-06-15T22:00:00Z', status: 'scheduled', phase: 'group', group: 'H', round: 1, venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'm045', homeTeamId: 'spain',        awayTeamId: 'saudi-arabia', scheduledAt: '2026-06-21T16:00:00Z', status: 'scheduled', phase: 'group', group: 'H', round: 2, venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { id: 'm046', homeTeamId: 'uruguay',      awayTeamId: 'cape-verde',   scheduledAt: '2026-06-21T22:00:00Z', status: 'scheduled', phase: 'group', group: 'H', round: 2, venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'm047', homeTeamId: 'cape-verde',   awayTeamId: 'saudi-arabia', scheduledAt: '2026-06-27T00:00:00Z', status: 'scheduled', phase: 'group', group: 'H', round: 3, venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'm048', homeTeamId: 'uruguay',      awayTeamId: 'spain',        scheduledAt: '2026-06-27T00:00:00Z', status: 'scheduled', phase: 'group', group: 'H', round: 3, venue: 'Estadio Akron',          city: 'Guadalajara' },

  // ══ GRUPO I ══
  { id: 'm049', homeTeamId: 'france',       awayTeamId: 'senegal',      scheduledAt: '2026-06-16T19:00:00Z', status: 'scheduled', phase: 'group', group: 'I', round: 1, venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'm050', homeTeamId: 'iraq',         awayTeamId: 'norway',       scheduledAt: '2026-06-16T22:00:00Z', status: 'scheduled', phase: 'group', group: 'I', round: 1, venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm051', homeTeamId: 'france',       awayTeamId: 'iraq',         scheduledAt: '2026-06-22T21:00:00Z', status: 'scheduled', phase: 'group', group: 'I', round: 2, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'm052', homeTeamId: 'norway',       awayTeamId: 'senegal',      scheduledAt: '2026-06-23T00:00:00Z', status: 'scheduled', phase: 'group', group: 'I', round: 2, venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'm053', homeTeamId: 'norway',       awayTeamId: 'france',       scheduledAt: '2026-06-26T19:00:00Z', status: 'scheduled', phase: 'group', group: 'I', round: 3, venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm054', homeTeamId: 'senegal',      awayTeamId: 'iraq',         scheduledAt: '2026-06-26T19:00:00Z', status: 'scheduled', phase: 'group', group: 'I', round: 3, venue: 'BMO Field',              city: 'Toronto' },

  // ══ GRUPO J ══
  { id: 'm055', homeTeamId: 'argentina',    awayTeamId: 'algeria',      scheduledAt: '2026-06-17T01:00:00Z', status: 'scheduled', phase: 'group', group: 'J', round: 1, venue: 'Arrowhead Stadium',      city: 'Kansas City' },
  { id: 'm056', homeTeamId: 'austria',      awayTeamId: 'jordan',       scheduledAt: '2026-06-17T04:00:00Z', status: 'scheduled', phase: 'group', group: 'J', round: 1, venue: "Levi's Stadium",         city: 'Santa Clara' },
  { id: 'm057', homeTeamId: 'argentina',    awayTeamId: 'austria',      scheduledAt: '2026-06-22T17:00:00Z', status: 'scheduled', phase: 'group', group: 'J', round: 2, venue: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'm058', homeTeamId: 'jordan',       awayTeamId: 'algeria',      scheduledAt: '2026-06-23T03:00:00Z', status: 'scheduled', phase: 'group', group: 'J', round: 2, venue: "Levi's Stadium",         city: 'Santa Clara' },
  { id: 'm059', homeTeamId: 'algeria',      awayTeamId: 'austria',      scheduledAt: '2026-06-28T02:00:00Z', status: 'scheduled', phase: 'group', group: 'J', round: 3, venue: 'Arrowhead Stadium',      city: 'Kansas City' },
  { id: 'm060', homeTeamId: 'jordan',       awayTeamId: 'argentina',    scheduledAt: '2026-06-28T02:00:00Z', status: 'scheduled', phase: 'group', group: 'J', round: 3, venue: 'AT&T Stadium',          city: 'Dallas' },

  // ══ GRUPO K ══
  { id: 'm061', homeTeamId: 'portugal',     awayTeamId: 'dr-congo',     scheduledAt: '2026-06-17T17:00:00Z', status: 'scheduled', phase: 'group', group: 'K', round: 1, venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'm062', homeTeamId: 'uzbekistan',   awayTeamId: 'colombia',     scheduledAt: '2026-06-18T02:00:00Z', status: 'scheduled', phase: 'group', group: 'K', round: 1, venue: 'Estadio Azteca',         city: 'Cidade do México' },
  { id: 'm063', homeTeamId: 'portugal',     awayTeamId: 'uzbekistan',   scheduledAt: '2026-06-23T17:00:00Z', status: 'scheduled', phase: 'group', group: 'K', round: 2, venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'm064', homeTeamId: 'colombia',     awayTeamId: 'dr-congo',     scheduledAt: '2026-06-24T02:00:00Z', status: 'scheduled', phase: 'group', group: 'K', round: 2, venue: 'Estadio Akron',          city: 'Guadalajara' },
  { id: 'm065', homeTeamId: 'colombia',     awayTeamId: 'portugal',     scheduledAt: '2026-06-27T23:30:00Z', status: 'scheduled', phase: 'group', group: 'K', round: 3, venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'm066', homeTeamId: 'dr-congo',     awayTeamId: 'uzbekistan',   scheduledAt: '2026-06-27T23:30:00Z', status: 'scheduled', phase: 'group', group: 'K', round: 3, venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },

  // ══ GRUPO L ══
  { id: 'm067', homeTeamId: 'england',      awayTeamId: 'croatia',      scheduledAt: '2026-06-17T20:00:00Z', status: 'scheduled', phase: 'group', group: 'L', round: 1, venue: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'm068', homeTeamId: 'ghana',        awayTeamId: 'panama',       scheduledAt: '2026-06-17T23:00:00Z', status: 'scheduled', phase: 'group', group: 'L', round: 1, venue: 'BMO Field',              city: 'Toronto' },
  { id: 'm069', homeTeamId: 'england',      awayTeamId: 'ghana',        scheduledAt: '2026-06-23T20:00:00Z', status: 'scheduled', phase: 'group', group: 'L', round: 2, venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm070', homeTeamId: 'panama',       awayTeamId: 'croatia',      scheduledAt: '2026-06-23T23:00:00Z', status: 'scheduled', phase: 'group', group: 'L', round: 2, venue: 'BMO Field',              city: 'Toronto' },
  { id: 'm071', homeTeamId: 'panama',       awayTeamId: 'england',      scheduledAt: '2026-06-27T21:00:00Z', status: 'scheduled', phase: 'group', group: 'L', round: 3, venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'm072', homeTeamId: 'croatia',      awayTeamId: 'ghana',        scheduledAt: '2026-06-27T21:00:00Z', status: 'scheduled', phase: 'group', group: 'L', round: 3, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
];

// ─── FASE ELIMINATÓRIA ────────────────────────────────────────────────────────

export const KNOCKOUT_MATCHES: Match[] = [

  // ══ RONDA DE 32 ══
  { id: 'm073', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-06-28T19:00:00Z', status: 'scheduled', phase: 'round32', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm074', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-06-29T17:00:00Z', status: 'scheduled', phase: 'round32', venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'm075', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-06-29T20:30:00Z', status: 'scheduled', phase: 'round32', venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm076', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-06-30T01:00:00Z', status: 'scheduled', phase: 'round32', venue: 'Estadio BBVA',           city: 'Monterrey' },
  { id: 'm077', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-06-30T17:00:00Z', status: 'scheduled', phase: 'round32', venue: 'AT&T Stadium',           city: 'Dallas' },
  { id: 'm078', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-06-30T21:00:00Z', status: 'scheduled', phase: 'round32', venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'm079', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-01T01:00:00Z', status: 'scheduled', phase: 'round32', venue: 'Estadio Azteca',         city: 'Cidade do México' },
  { id: 'm080', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-01T16:00:00Z', status: 'scheduled', phase: 'round32', venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { id: 'm081', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-01T20:00:00Z', status: 'scheduled', phase: 'round32', venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'm082', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-02T00:00:00Z', status: 'scheduled', phase: 'round32', venue: "Levi's Stadium",         city: 'Santa Clara' },
  { id: 'm083', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-02T19:00:00Z', status: 'scheduled', phase: 'round32', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm084', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-02T23:00:00Z', status: 'scheduled', phase: 'round32', venue: 'BMO Field',              city: 'Toronto' },
  { id: 'm085', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-03T03:00:00Z', status: 'scheduled', phase: 'round32', venue: 'BC Place',               city: 'Vancouver' },
  { id: 'm086', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-03T18:00:00Z', status: 'scheduled', phase: 'round32', venue: 'AT&T Stadium',           city: 'Dallas' },
  { id: 'm087', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-03T22:00:00Z', status: 'scheduled', phase: 'round32', venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'm088', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-04T01:30:00Z', status: 'scheduled', phase: 'round32', venue: 'Arrowhead Stadium',      city: 'Kansas City' },

  // ══ OITAVOS DE FINAL ══
  { id: 'm089', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-04T17:00:00Z', status: 'scheduled', phase: 'round16', venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'm090', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-04T21:00:00Z', status: 'scheduled', phase: 'round16', venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'm091', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-05T20:00:00Z', status: 'scheduled', phase: 'round16', venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'm092', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-06T00:00:00Z', status: 'scheduled', phase: 'round16', venue: 'Estadio Azteca',         city: 'Cidade do México' },
  { id: 'm093', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-06T19:00:00Z', status: 'scheduled', phase: 'round16', venue: 'AT&T Stadium',           city: 'Dallas' },
  { id: 'm094', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-07T00:00:00Z', status: 'scheduled', phase: 'round16', venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'm095', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-07T16:00:00Z', status: 'scheduled', phase: 'round16', venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { id: 'm096', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-07T20:00:00Z', status: 'scheduled', phase: 'round16', venue: 'BC Place',               city: 'Vancouver' },

  // ══ QUARTOS DE FINAL ══
  { id: 'm097', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-09T20:00:00Z', status: 'scheduled', phase: 'qf', venue: 'Gillette Stadium',       city: 'Boston' },
  { id: 'm098', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-10T19:00:00Z', status: 'scheduled', phase: 'qf', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'm099', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-11T21:00:00Z', status: 'scheduled', phase: 'qf', venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'm100', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-12T01:00:00Z', status: 'scheduled', phase: 'qf', venue: 'Arrowhead Stadium',      city: 'Kansas City' },

  // ══ MEIAS-FINAIS ══
  { id: 'm101', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-14T19:00:00Z', status: 'scheduled', phase: 'sf', venue: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'm102', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-15T19:00:00Z', status: 'scheduled', phase: 'sf', venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },

  // ══ 3º LUGAR ══
  { id: 'm103', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-18T21:00:00Z', status: 'scheduled', phase: '3rd', venue: 'Hard Rock Stadium',     city: 'Miami' },

  // ══ FINAL ══
  { id: 'm104', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-19T19:00:00Z', status: 'scheduled', phase: 'final', venue: 'MetLife Stadium',      city: 'Nova Iorque' },
];

export const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];

// Início do torneio = kick-off do primeiro jogo agendado
export const TOURNAMENT_START = ALL_MATCHES.reduce(
  (min, m) => (m.scheduledAt < min ? m.scheduledAt : min),
  ALL_MATCHES[0].scheduledAt,
);

export const getMatchById = (id: string) => ALL_MATCHES.find(m => m.id === id);

export const getMatchesByGroup = (group: string) =>
  GROUP_MATCHES.filter(m => m.group === group);

export const getMatchesByRound = (round: 1 | 2 | 3) =>
  GROUP_MATCHES.filter(m => m.round === round);

export const getMatchesByPhase = (phase: string) =>
  ALL_MATCHES.filter(m => m.phase === phase);

// Jornadas para a liga Extra Jornadas
export const JORNADAS = [
  { id: 'j1', label: 'Jornada 1', matchIds: GROUP_MATCHES.filter(m => m.round === 1).map(m => m.id) },
  { id: 'j2', label: 'Jornada 2', matchIds: GROUP_MATCHES.filter(m => m.round === 2).map(m => m.id) },
  { id: 'j3', label: 'Jornada 3', matchIds: GROUP_MATCHES.filter(m => m.round === 3).map(m => m.id) },
  { id: 'j4', label: 'Ronda 32',  matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'round32').map(m => m.id) },
  { id: 'j5', label: 'Oitavos',   matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'round16').map(m => m.id) },
  { id: 'j6', label: 'Quartos',   matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'qf').map(m => m.id) },
  { id: 'j7', label: 'Meias',     matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'sf').map(m => m.id) },
  { id: 'j8', label: 'Final',     matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'final' || m.phase === '3rd').map(m => m.id) },
];
