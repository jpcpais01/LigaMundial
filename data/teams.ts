import { Team } from '@/types';
import { slotLabels, SLOT_FLAG } from '@/lib/slots';

export const TEAMS: Record<string, Team> = {
  // GROUP A
  'mexico':        { id: 'mexico',        name: 'México',              shortName: 'MEX', flag: '🇲🇽', group: 'A' },
  'south-africa':  { id: 'south-africa',  name: 'África do Sul',       shortName: 'RSA', flag: '🇿🇦', group: 'A' },
  'south-korea':   { id: 'south-korea',   name: 'Coreia do Sul',       shortName: 'KOR', flag: '🇰🇷', group: 'A' },
  'czech-rep':     { id: 'czech-rep',     name: 'Rep. Checa',          shortName: 'CZE', flag: '🇨🇿', group: 'A' },

  // GROUP B
  'canada':        { id: 'canada',        name: 'Canadá',              shortName: 'CAN', flag: '🇨🇦', group: 'B' },
  'bosnia':        { id: 'bosnia',        name: 'Bósnia e Herzegovina', shortName: 'BIH', flag: '🇧🇦', group: 'B' },
  'qatar':         { id: 'qatar',         name: 'Qatar',               shortName: 'QAT', flag: '🇶🇦', group: 'B' },
  'switzerland':   { id: 'switzerland',   name: 'Suíça',               shortName: 'SUI', flag: '🇨🇭', group: 'B' },

  // GROUP C
  'brazil':        { id: 'brazil',        name: 'Brasil',              shortName: 'BRA', flag: '🇧🇷', group: 'C' },
  'morocco':       { id: 'morocco',       name: 'Marrocos',            shortName: 'MAR', flag: '🇲🇦', group: 'C' },
  'haiti':         { id: 'haiti',         name: 'Haiti',               shortName: 'HAI', flag: '🇭🇹', group: 'C' },
  'scotland':      { id: 'scotland',      name: 'Escócia',             shortName: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },

  // GROUP D
  'usa':           { id: 'usa',           name: 'Estados Unidos',      shortName: 'USA', flag: '🇺🇸', group: 'D' },
  'paraguay':      { id: 'paraguay',      name: 'Paraguai',            shortName: 'PAR', flag: '🇵🇾', group: 'D' },
  'australia':     { id: 'australia',     name: 'Austrália',           shortName: 'AUS', flag: '🇦🇺', group: 'D' },
  'turkey':        { id: 'turkey',        name: 'Turquia',             shortName: 'TUR', flag: '🇹🇷', group: 'D' },

  // GROUP E
  'germany':       { id: 'germany',       name: 'Alemanha',            shortName: 'GER', flag: '🇩🇪', group: 'E' },
  'curacao':       { id: 'curacao',       name: 'Curaçao',             shortName: 'CUW', flag: '🇨🇼', group: 'E' },
  'ivory-coast':   { id: 'ivory-coast',   name: 'Costa do Marfim',     shortName: 'CIV', flag: '🇨🇮', group: 'E' },
  'ecuador':       { id: 'ecuador',       name: 'Equador',             shortName: 'ECU', flag: '🇪🇨', group: 'E' },

  // GROUP F
  'netherlands':   { id: 'netherlands',   name: 'Holanda',             shortName: 'NED', flag: '🇳🇱', group: 'F' },
  'japan':         { id: 'japan',         name: 'Japão',               shortName: 'JPN', flag: '🇯🇵', group: 'F' },
  'sweden':        { id: 'sweden',        name: 'Suécia',              shortName: 'SWE', flag: '🇸🇪', group: 'F' },
  'tunisia':       { id: 'tunisia',       name: 'Tunísia',             shortName: 'TUN', flag: '🇹🇳', group: 'F' },

  // GROUP G
  'belgium':       { id: 'belgium',       name: 'Bélgica',             shortName: 'BEL', flag: '🇧🇪', group: 'G' },
  'egypt':         { id: 'egypt',         name: 'Egito',               shortName: 'EGY', flag: '🇪🇬', group: 'G' },
  'iran':          { id: 'iran',          name: 'Irão',                shortName: 'IRN', flag: '🇮🇷', group: 'G' },
  'new-zealand':   { id: 'new-zealand',   name: 'Nova Zelândia',       shortName: 'NZL', flag: '🇳🇿', group: 'G' },

  // GROUP H
  'spain':         { id: 'spain',         name: 'Espanha',             shortName: 'ESP', flag: '🇪🇸', group: 'H' },
  'cape-verde':    { id: 'cape-verde',    name: 'Cabo Verde',          shortName: 'CPV', flag: '🇨🇻', group: 'H' },
  'saudi-arabia':  { id: 'saudi-arabia',  name: 'Arábia Saudita',      shortName: 'KSA', flag: '🇸🇦', group: 'H' },
  'uruguay':       { id: 'uruguay',       name: 'Uruguai',             shortName: 'URU', flag: '🇺🇾', group: 'H' },

  // GROUP I
  'france':        { id: 'france',        name: 'França',              shortName: 'FRA', flag: '🇫🇷', group: 'I' },
  'senegal':       { id: 'senegal',       name: 'Senegal',             shortName: 'SEN', flag: '🇸🇳', group: 'I' },
  'iraq':          { id: 'iraq',          name: 'Iraque',              shortName: 'IRQ', flag: '🇮🇶', group: 'I' },
  'norway':        { id: 'norway',        name: 'Noruega',             shortName: 'NOR', flag: '🇳🇴', group: 'I' },

  // GROUP J
  'argentina':     { id: 'argentina',     name: 'Argentina',           shortName: 'ARG', flag: '🇦🇷', group: 'J' },
  'algeria':       { id: 'algeria',       name: 'Argélia',             shortName: 'ALG', flag: '🇩🇿', group: 'J' },
  'austria':       { id: 'austria',       name: 'Áustria',             shortName: 'AUT', flag: '🇦🇹', group: 'J' },
  'jordan':        { id: 'jordan',        name: 'Jordânia',            shortName: 'JOR', flag: '🇯🇴', group: 'J' },

  // GROUP K
  'portugal':      { id: 'portugal',      name: 'Portugal',            shortName: 'POR', flag: '🇵🇹', group: 'K' },
  'dr-congo':      { id: 'dr-congo',      name: 'RD Congo',            shortName: 'COD', flag: '🇨🇩', group: 'K' },
  'uzbekistan':    { id: 'uzbekistan',    name: 'Uzbequistão',         shortName: 'UZB', flag: '🇺🇿', group: 'K' },
  'colombia':      { id: 'colombia',      name: 'Colômbia',            shortName: 'COL', flag: '🇨🇴', group: 'K' },

  // GROUP L
  'england':       { id: 'england',       name: 'Inglaterra',          shortName: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
  'croatia':       { id: 'croatia',       name: 'Croácia',             shortName: 'CRO', flag: '🇭🇷', group: 'L' },
  'ghana':         { id: 'ghana',         name: 'Gana',                shortName: 'GHA', flag: '🇬🇭', group: 'L' },
  'panama':        { id: 'panama',        name: 'Panamá',              shortName: 'PAN', flag: '🇵🇦', group: 'L' },

  // Placeholder for knockout TBD slots
  'TBD': { id: 'TBD', name: 'A definir', shortName: 'TBD', flag: '🏳', group: '' },
};

export function getTeam(id: string): Team {
  if (TEAMS[id]) return TEAMS[id];
  // Posição da fase a eliminar ainda por preencher (ex: "1A", "3-CEFHI", "w-m075")
  const labels = slotLabels(id);
  if (labels) return { id, name: labels.name, shortName: labels.shortName, flag: SLOT_FLAG, group: '' };
  return { id, name: id, shortName: id, flag: '🏳', group: '' };
}

// Verdadeiro só para selecções reais já apuradas — falso para "TBD" e para
// qualquer placeholder de posição da fase a eliminar (1A, 3-CEFHI, w-m075…).
export function isRealTeam(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(TEAMS, id) && id !== 'TBD';
}

export const TEAMS_LIST: Team[] = Object.values(TEAMS).filter(t => t.id !== 'TBD');

export const GROUPS: Record<string, string[]> = {
  A: ['mexico', 'south-africa', 'south-korea', 'czech-rep'],
  B: ['canada', 'bosnia', 'qatar', 'switzerland'],
  C: ['brazil', 'morocco', 'haiti', 'scotland'],
  D: ['usa', 'paraguay', 'australia', 'turkey'],
  E: ['germany', 'curacao', 'ivory-coast', 'ecuador'],
  F: ['netherlands', 'japan', 'sweden', 'tunisia'],
  G: ['belgium', 'egypt', 'iran', 'new-zealand'],
  H: ['spain', 'cape-verde', 'saudi-arabia', 'uruguay'],
  I: ['france', 'senegal', 'iraq', 'norway'],
  J: ['argentina', 'algeria', 'austria', 'jordan'],
  K: ['portugal', 'dr-congo', 'uzbekistan', 'colombia'],
  L: ['england', 'croatia', 'ghana', 'panama'],
};
