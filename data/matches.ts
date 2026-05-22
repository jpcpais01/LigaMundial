import { Match } from '@/types';

// ─── FASE DE GRUPOS ──────────────────────────────────────────────────────────
// Jornada 1: 11-17 Junho 2026
// Jornada 2: 19-25 Junho 2026
// Jornada 3: 27 Jun - 1 Jul 2026

export const GROUP_MATCHES: Match[] = [
  // ──── JORNADA 1 ────────────────────────────────────────────────────────────
  // 11 Jun
  { id: 'g-c1', homeTeamId: 'mexico',     awayTeamId: 'argentina',   scheduledAt: '2026-06-11T20:00:00-06:00', status: 'scheduled', phase: 'group', group: 'C', round: 1, venue: 'Estadio Azteca',        city: 'Cidade do México' },
  { id: 'g-a1', homeTeamId: 'usa',        awayTeamId: 'brasil',      scheduledAt: '2026-06-11T17:00:00-04:00', status: 'scheduled', phase: 'group', group: 'A', round: 1, venue: 'MetLife Stadium',       city: 'Nova Iorque' },
  // 12 Jun
  { id: 'g-b1', homeTeamId: 'canada',     awayTeamId: 'franca',      scheduledAt: '2026-06-12T19:00:00-04:00', status: 'scheduled', phase: 'group', group: 'B', round: 1, venue: 'BMO Field',             city: 'Toronto' },
  { id: 'g-d1', homeTeamId: 'espanha',    awayTeamId: 'alemanha',    scheduledAt: '2026-06-12T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'D', round: 1, venue: 'Hard Rock Stadium',    city: 'Miami' },
  // 13 Jun
  { id: 'g-e1', homeTeamId: 'portugal',   awayTeamId: 'belgica',     scheduledAt: '2026-06-13T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'E', round: 1, venue: 'SoFi Stadium',         city: 'Los Angeles' },
  { id: 'g-f1', homeTeamId: 'inglaterra', awayTeamId: 'holanda',     scheduledAt: '2026-06-13T17:00:00-04:00', status: 'scheduled', phase: 'group', group: 'F', round: 1, venue: 'MetLife Stadium',       city: 'Nova Iorque' },
  // 14 Jun
  { id: 'g-g1', homeTeamId: 'italia',     awayTeamId: 'colombia',    scheduledAt: '2026-06-14T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'G', round: 1, venue: 'AT&T Stadium',         city: 'Dallas' },
  { id: 'g-h1', homeTeamId: 'croacia',    awayTeamId: 'dinamarca',   scheduledAt: '2026-06-14T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'H', round: 1, venue: 'Lumen Field',          city: 'Seattle' },
  // 15 Jun
  { id: 'g-i1', homeTeamId: 'suica',      awayTeamId: 'uruguai',     scheduledAt: '2026-06-15T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'I', round: 1, venue: 'Soldier Field',        city: 'Chicago' },
  { id: 'g-j1', homeTeamId: 'serbia',     awayTeamId: 'turquia',     scheduledAt: '2026-06-15T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'J', round: 1, venue: 'NRG Stadium',          city: 'Houston' },
  // 16 Jun
  { id: 'g-a2', homeTeamId: 'marrocos',   awayTeamId: 'coreia',      scheduledAt: '2026-06-16T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'A', round: 1, venue: 'Arrowhead Stadium',    city: 'Kansas City' },
  { id: 'g-b2', homeTeamId: 'japao',      awayTeamId: 'nigeria',     scheduledAt: '2026-06-16T19:00:00-04:00', status: 'scheduled', phase: 'group', group: 'B', round: 1, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'g-c2', homeTeamId: 'australia',  awayTeamId: 'argelia',     scheduledAt: '2026-06-16T22:00:00-06:00', status: 'scheduled', phase: 'group', group: 'C', round: 1, venue: 'BBVA Stadium',         city: 'Houston' },
  { id: 'g-d2', homeTeamId: 'senegal',    awayTeamId: 'honduras',    scheduledAt: '2026-06-16T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'D', round: 1, venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  // 17 Jun
  { id: 'g-e2', homeTeamId: 'ira',        awayTeamId: 'chile',       scheduledAt: '2026-06-17T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'E', round: 1, venue: 'Rose Bowl',            city: 'Los Angeles' },
  { id: 'g-f2', homeTeamId: 'egito',      awayTeamId: 'paraguai',    scheduledAt: '2026-06-17T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'F', round: 1, venue: 'AT&T Stadium',         city: 'Dallas' },
  { id: 'g-g2', homeTeamId: 'gana',       awayTeamId: 'costarica',   scheduledAt: '2026-06-17T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'G', round: 1, venue: 'Hard Rock Stadium',    city: 'Miami' },
  { id: 'g-h2', homeTeamId: 'arabia',     awayTeamId: 'venezuela',   scheduledAt: '2026-06-17T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'H', round: 1, venue: 'Lumen Field',          city: 'Seattle' },
  { id: 'g-i2', homeTeamId: 'costamarfim',awayTeamId: 'elsalvador',  scheduledAt: '2026-06-17T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'I', round: 1, venue: 'Soldier Field',        city: 'Chicago' },
  { id: 'g-j2', homeTeamId: 'africasul',  awayTeamId: 'jamaica',     scheduledAt: '2026-06-17T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'J', round: 1, venue: 'NRG Stadium',          city: 'Houston' },
  { id: 'g-k1', homeTeamId: 'polonia',    awayTeamId: 'equador',     scheduledAt: '2026-06-17T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'K', round: 1, venue: "Levi's Stadium",       city: 'San Francisco' },
  { id: 'g-k2', homeTeamId: 'tunisia',    awayTeamId: 'novazelandia',scheduledAt: '2026-06-17T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'K', round: 1, venue: 'Arrowhead Stadium',    city: 'Kansas City' },
  { id: 'g-l1', homeTeamId: 'romenia',    awayTeamId: 'eslovenia',   scheduledAt: '2026-06-17T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'L', round: 1, venue: 'BMO Field',            city: 'Toronto' },
  { id: 'g-l2', homeTeamId: 'peru',       awayTeamId: 'jordania',    scheduledAt: '2026-06-17T19:00:00-07:00', status: 'scheduled', phase: 'group', group: 'L', round: 1, venue: 'BC Place',             city: 'Vancouver' },

  // ──── JORNADA 2 ────────────────────────────────────────────────────────────
  { id: 'g-a3', homeTeamId: 'usa',        awayTeamId: 'marrocos',    scheduledAt: '2026-06-19T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'A', round: 2, venue: 'MetLife Stadium',       city: 'Nova Iorque' },
  { id: 'g-a4', homeTeamId: 'brasil',     awayTeamId: 'coreia',      scheduledAt: '2026-06-19T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'A', round: 2, venue: 'Arrowhead Stadium',    city: 'Kansas City' },
  { id: 'g-b3', homeTeamId: 'canada',     awayTeamId: 'japao',       scheduledAt: '2026-06-20T19:00:00-04:00', status: 'scheduled', phase: 'group', group: 'B', round: 2, venue: 'BMO Field',            city: 'Toronto' },
  { id: 'g-b4', homeTeamId: 'franca',     awayTeamId: 'nigeria',     scheduledAt: '2026-06-20T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'B', round: 2, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'g-c3', homeTeamId: 'mexico',     awayTeamId: 'australia',   scheduledAt: '2026-06-21T19:00:00-06:00', status: 'scheduled', phase: 'group', group: 'C', round: 2, venue: 'Estadio Azteca',       city: 'Cidade do México' },
  { id: 'g-c4', homeTeamId: 'argentina',  awayTeamId: 'argelia',     scheduledAt: '2026-06-21T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'C', round: 2, venue: 'NRG Stadium',          city: 'Houston' },
  { id: 'g-d3', homeTeamId: 'espanha',    awayTeamId: 'senegal',     scheduledAt: '2026-06-22T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'D', round: 2, venue: 'Hard Rock Stadium',    city: 'Miami' },
  { id: 'g-d4', homeTeamId: 'alemanha',   awayTeamId: 'honduras',    scheduledAt: '2026-06-22T19:00:00-04:00', status: 'scheduled', phase: 'group', group: 'D', round: 2, venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { id: 'g-e3', homeTeamId: 'portugal',   awayTeamId: 'ira',         scheduledAt: '2026-06-23T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'E', round: 2, venue: 'SoFi Stadium',         city: 'Los Angeles' },
  { id: 'g-e4', homeTeamId: 'belgica',    awayTeamId: 'chile',       scheduledAt: '2026-06-23T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'E', round: 2, venue: 'AT&T Stadium',         city: 'Dallas' },
  { id: 'g-f3', homeTeamId: 'inglaterra', awayTeamId: 'egito',       scheduledAt: '2026-06-24T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'F', round: 2, venue: 'MetLife Stadium',       city: 'Nova Iorque' },
  { id: 'g-f4', homeTeamId: 'holanda',    awayTeamId: 'paraguai',    scheduledAt: '2026-06-24T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'F', round: 2, venue: 'Soldier Field',        city: 'Chicago' },
  { id: 'g-g3', homeTeamId: 'italia',     awayTeamId: 'gana',        scheduledAt: '2026-06-24T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'G', round: 2, venue: 'NRG Stadium',          city: 'Houston' },
  { id: 'g-g4', homeTeamId: 'colombia',   awayTeamId: 'costarica',   scheduledAt: '2026-06-24T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'G', round: 2, venue: 'Lumen Field',          city: 'Seattle' },
  { id: 'g-h3', homeTeamId: 'croacia',    awayTeamId: 'arabia',      scheduledAt: '2026-06-25T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'H', round: 2, venue: 'Lumen Field',          city: 'Seattle' },
  { id: 'g-h4', homeTeamId: 'dinamarca',  awayTeamId: 'venezuela',   scheduledAt: '2026-06-25T19:00:00-07:00', status: 'scheduled', phase: 'group', group: 'H', round: 2, venue: 'Rose Bowl',            city: 'Los Angeles' },
  { id: 'g-i3', homeTeamId: 'suica',      awayTeamId: 'costamarfim', scheduledAt: '2026-06-25T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'I', round: 2, venue: 'Soldier Field',        city: 'Chicago' },
  { id: 'g-i4', homeTeamId: 'uruguai',    awayTeamId: 'elsalvador',  scheduledAt: '2026-06-25T19:00:00-06:00', status: 'scheduled', phase: 'group', group: 'I', round: 2, venue: 'BBVA Stadium',         city: 'Houston' },
  { id: 'g-j3', homeTeamId: 'serbia',     awayTeamId: 'africasul',   scheduledAt: '2026-06-25T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'J', round: 2, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'g-j4', homeTeamId: 'turquia',    awayTeamId: 'jamaica',     scheduledAt: '2026-06-25T19:00:00-05:00', status: 'scheduled', phase: 'group', group: 'J', round: 2, venue: 'Arrowhead Stadium',    city: 'Kansas City' },
  { id: 'g-k3', homeTeamId: 'polonia',    awayTeamId: 'tunisia',     scheduledAt: '2026-06-25T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'K', round: 2, venue: 'BMO Field',            city: 'Toronto' },
  { id: 'g-k4', homeTeamId: 'equador',    awayTeamId: 'novazelandia',scheduledAt: '2026-06-25T19:00:00-07:00', status: 'scheduled', phase: 'group', group: 'K', round: 2, venue: "Levi's Stadium",       city: 'San Francisco' },
  { id: 'g-l3', homeTeamId: 'romenia',    awayTeamId: 'peru',        scheduledAt: '2026-06-25T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'L', round: 2, venue: 'BC Place',             city: 'Vancouver' },
  { id: 'g-l4', homeTeamId: 'eslovenia',  awayTeamId: 'jordania',    scheduledAt: '2026-06-25T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'L', round: 2, venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },

  // ──── JORNADA 3 (simultâneos) ───────────────────────────────────────────────
  { id: 'g-a5', homeTeamId: 'usa',        awayTeamId: 'coreia',      scheduledAt: '2026-06-27T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'A', round: 3, venue: 'MetLife Stadium',       city: 'Nova Iorque' },
  { id: 'g-a6', homeTeamId: 'brasil',     awayTeamId: 'marrocos',    scheduledAt: '2026-06-27T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'A', round: 3, venue: 'Arrowhead Stadium',    city: 'Kansas City' },
  { id: 'g-b5', homeTeamId: 'canada',     awayTeamId: 'nigeria',     scheduledAt: '2026-06-27T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'B', round: 3, venue: 'BMO Field',            city: 'Toronto' },
  { id: 'g-b6', homeTeamId: 'franca',     awayTeamId: 'japao',       scheduledAt: '2026-06-27T20:00:00-07:00', status: 'scheduled', phase: 'group', group: 'B', round: 3, venue: 'Rose Bowl',            city: 'Los Angeles' },
  { id: 'g-c5', homeTeamId: 'mexico',     awayTeamId: 'argelia',     scheduledAt: '2026-06-28T16:00:00-06:00', status: 'scheduled', phase: 'group', group: 'C', round: 3, venue: 'Estadio Azteca',       city: 'Cidade do México' },
  { id: 'g-c6', homeTeamId: 'argentina',  awayTeamId: 'australia',   scheduledAt: '2026-06-28T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'C', round: 3, venue: 'NRG Stadium',          city: 'Houston' },
  { id: 'g-d5', homeTeamId: 'espanha',    awayTeamId: 'honduras',    scheduledAt: '2026-06-29T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'D', round: 3, venue: 'Hard Rock Stadium',    city: 'Miami' },
  { id: 'g-d6', homeTeamId: 'alemanha',   awayTeamId: 'senegal',     scheduledAt: '2026-06-29T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'D', round: 3, venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { id: 'g-e5', homeTeamId: 'portugal',   awayTeamId: 'chile',       scheduledAt: '2026-06-29T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'E', round: 3, venue: 'SoFi Stadium',         city: 'Los Angeles' },
  { id: 'g-e6', homeTeamId: 'belgica',    awayTeamId: 'ira',         scheduledAt: '2026-06-29T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'E', round: 3, venue: 'AT&T Stadium',         city: 'Dallas' },
  { id: 'g-f5', homeTeamId: 'inglaterra', awayTeamId: 'paraguai',    scheduledAt: '2026-06-30T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'F', round: 3, venue: 'MetLife Stadium',       city: 'Nova Iorque' },
  { id: 'g-f6', homeTeamId: 'holanda',    awayTeamId: 'egito',       scheduledAt: '2026-06-30T20:00:00-05:00', status: 'scheduled', phase: 'group', group: 'F', round: 3, venue: 'Soldier Field',        city: 'Chicago' },
  { id: 'g-g5', homeTeamId: 'italia',     awayTeamId: 'costarica',   scheduledAt: '2026-06-30T16:00:00-05:00', status: 'scheduled', phase: 'group', group: 'G', round: 3, venue: 'AT&T Stadium',         city: 'Dallas' },
  { id: 'g-g6', homeTeamId: 'colombia',   awayTeamId: 'gana',        scheduledAt: '2026-06-30T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'G', round: 3, venue: 'Lumen Field',          city: 'Seattle' },
  { id: 'g-h5', homeTeamId: 'croacia',    awayTeamId: 'venezuela',   scheduledAt: '2026-07-01T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'H', round: 3, venue: 'Lumen Field',          city: 'Seattle' },
  { id: 'g-h6', homeTeamId: 'dinamarca',  awayTeamId: 'arabia',      scheduledAt: '2026-07-01T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'H', round: 3, venue: 'Rose Bowl',            city: 'Los Angeles' },
  { id: 'g-i5', homeTeamId: 'suica',      awayTeamId: 'elsalvador',  scheduledAt: '2026-07-01T20:00:00-05:00', status: 'scheduled', phase: 'group', group: 'I', round: 3, venue: 'Soldier Field',        city: 'Chicago' },
  { id: 'g-i6', homeTeamId: 'uruguai',    awayTeamId: 'costamarfim', scheduledAt: '2026-07-01T20:00:00-06:00', status: 'scheduled', phase: 'group', group: 'I', round: 3, venue: 'BBVA Stadium',         city: 'Houston' },
  { id: 'g-j5', homeTeamId: 'serbia',     awayTeamId: 'jamaica',     scheduledAt: '2026-07-01T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'J', round: 3, venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'g-j6', homeTeamId: 'turquia',    awayTeamId: 'africasul',   scheduledAt: '2026-07-01T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'J', round: 3, venue: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { id: 'g-k5', homeTeamId: 'polonia',    awayTeamId: 'novazelandia',scheduledAt: '2026-07-01T16:00:00-04:00', status: 'scheduled', phase: 'group', group: 'K', round: 3, venue: 'BMO Field',            city: 'Toronto' },
  { id: 'g-k6', homeTeamId: 'equador',    awayTeamId: 'tunisia',     scheduledAt: '2026-07-01T16:00:00-07:00', status: 'scheduled', phase: 'group', group: 'K', round: 3, venue: "Levi's Stadium",       city: 'San Francisco' },
  { id: 'g-l5', homeTeamId: 'romenia',    awayTeamId: 'jordania',    scheduledAt: '2026-07-01T20:00:00-07:00', status: 'scheduled', phase: 'group', group: 'L', round: 3, venue: 'BC Place',             city: 'Vancouver' },
  { id: 'g-l6', homeTeamId: 'eslovenia',  awayTeamId: 'peru',        scheduledAt: '2026-07-01T20:00:00-04:00', status: 'scheduled', phase: 'group', group: 'L', round: 3, venue: 'Hard Rock Stadium',    city: 'Miami' },
];

// ─── FASE A ELIMINAR (equipas definidas após grupos) ─────────────────────────
export const KNOCKOUT_MATCHES: Match[] = [
  // Ronda de 32
  { id: 'r32-1',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-04T16:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'r32-2',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-04T20:00:00-05:00', status: 'scheduled', phase: 'round32', venue: 'AT&T Stadium',           city: 'Dallas' },
  { id: 'r32-3',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-05T16:00:00-07:00', status: 'scheduled', phase: 'round32', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'r32-4',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-05T20:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'r32-5',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-06T16:00:00-07:00', status: 'scheduled', phase: 'round32', venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'r32-6',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-06T16:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'BMO Field',              city: 'Toronto' },
  { id: 'r32-7',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-06T20:00:00-06:00', status: 'scheduled', phase: 'round32', venue: 'Estadio Azteca',         city: 'Cidade do México' },
  { id: 'r32-8',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-07T16:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'r32-9',  homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-07T20:00:00-05:00', status: 'scheduled', phase: 'round32', venue: 'NRG Stadium',            city: 'Houston' },
  { id: 'r32-10', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-07T16:00:00-07:00', status: 'scheduled', phase: 'round32', venue: 'Rose Bowl',              city: 'Los Angeles' },
  { id: 'r32-11', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-08T16:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { id: 'r32-12', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-08T20:00:00-07:00', status: 'scheduled', phase: 'round32', venue: 'BC Place',               city: 'Vancouver' },
  { id: 'r32-13', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-08T16:00:00-05:00', status: 'scheduled', phase: 'round32', venue: 'Soldier Field',          city: 'Chicago' },
  { id: 'r32-14', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-08T20:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'r32-15', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-08T16:00:00-04:00', status: 'scheduled', phase: 'round32', venue: 'Lincoln Financial Field', city: 'Filadélfia' },
  { id: 'r32-16', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-08T20:00:00-05:00', status: 'scheduled', phase: 'round32', venue: 'Arrowhead Stadium',      city: 'Kansas City' },

  // Oitavos de Final
  { id: 'r16-1', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-10T20:00:00-04:00', status: 'scheduled', phase: 'round16', venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'r16-2', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-10T16:00:00-07:00', status: 'scheduled', phase: 'round16', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'r16-3', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-11T16:00:00-05:00', status: 'scheduled', phase: 'round16', venue: 'AT&T Stadium',           city: 'Dallas' },
  { id: 'r16-4', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-11T20:00:00-04:00', status: 'scheduled', phase: 'round16', venue: 'Hard Rock Stadium',      city: 'Miami' },
  { id: 'r16-5', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-12T16:00:00-04:00', status: 'scheduled', phase: 'round16', venue: 'Mercedes-Benz Stadium',  city: 'Atlanta' },
  { id: 'r16-6', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-12T20:00:00-07:00', status: 'scheduled', phase: 'round16', venue: 'Lumen Field',            city: 'Seattle' },
  { id: 'r16-7', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-13T16:00:00-07:00', status: 'scheduled', phase: 'round16', venue: 'Rose Bowl',              city: 'Los Angeles' },
  { id: 'r16-8', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-13T20:00:00-04:00', status: 'scheduled', phase: 'round16', venue: 'MetLife Stadium',        city: 'Nova Iorque' },

  // Quartos de Final
  { id: 'qf-1', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-16T16:00:00-07:00', status: 'scheduled', phase: 'qf', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'qf-2', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-16T20:00:00-04:00', status: 'scheduled', phase: 'qf', venue: 'MetLife Stadium',        city: 'Nova Iorque' },
  { id: 'qf-3', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-17T16:00:00-05:00', status: 'scheduled', phase: 'qf', venue: 'AT&T Stadium',           city: 'Dallas' },
  { id: 'qf-4', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-17T20:00:00-04:00', status: 'scheduled', phase: 'qf', venue: 'Hard Rock Stadium',      city: 'Miami' },

  // Meias Finais
  { id: 'sf-1', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-20T20:00:00-07:00', status: 'scheduled', phase: 'sf', venue: 'SoFi Stadium',           city: 'Los Angeles' },
  { id: 'sf-2', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-21T20:00:00-04:00', status: 'scheduled', phase: 'sf', venue: 'MetLife Stadium',        city: 'Nova Iorque' },

  // 3º Lugar
  { id: '3rd',   homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-24T16:00:00-05:00', status: 'scheduled', phase: '3rd', venue: 'AT&T Stadium',           city: 'Dallas' },

  // Final
  { id: 'final', homeTeamId: 'TBD', awayTeamId: 'TBD', scheduledAt: '2026-07-26T16:00:00-04:00', status: 'scheduled', phase: 'final', venue: 'MetLife Stadium',       city: 'Nova Iorque' },
];

export const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];

export const getMatchById = (id: string) => ALL_MATCHES.find(m => m.id === id);

export const getMatchesByGroup = (group: string) =>
  GROUP_MATCHES.filter(m => m.group === group);

export const getMatchesByRound = (round: 1 | 2 | 3) =>
  GROUP_MATCHES.filter(m => m.round === round);

export const getMatchesByPhase = (phase: string) =>
  ALL_MATCHES.filter(m => m.phase === phase);

// Jornadas para ExtraLeague
export const JORNADAS = [
  { id: 'j1', label: 'Jornada 1', matchIds: GROUP_MATCHES.filter(m => m.round === 1).map(m => m.id) },
  { id: 'j2', label: 'Jornada 2', matchIds: GROUP_MATCHES.filter(m => m.round === 2).map(m => m.id) },
  { id: 'j3', label: 'Jornada 3', matchIds: GROUP_MATCHES.filter(m => m.round === 3).map(m => m.id) },
  { id: 'j4', label: 'Ronda de 32', matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'round32').map(m => m.id) },
  { id: 'j5', label: 'Oitavos',     matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'round16').map(m => m.id) },
  { id: 'j6', label: 'Quartos',     matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'qf').map(m => m.id) },
  { id: 'j7', label: 'Meias',       matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'sf').map(m => m.id) },
  { id: 'j8', label: 'Final',       matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'final' || m.phase === '3rd').map(m => m.id) },
];
