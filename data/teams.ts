import { Team } from '@/types';

export const TEAMS: Record<string, Team> = {
  // GRUPO A
  usa:        { id: 'usa',        name: 'Estados Unidos',  shortName: 'USA', flag: '🇺🇸', group: 'A' },
  brasil:     { id: 'brasil',     name: 'Brasil',          shortName: 'BRA', flag: '🇧🇷', group: 'A' },
  marrocos:   { id: 'marrocos',   name: 'Marrocos',        shortName: 'MAR', flag: '🇲🇦', group: 'A' },
  coreia:     { id: 'coreia',     name: 'Coreia do Sul',   shortName: 'KOR', flag: '🇰🇷', group: 'A' },

  // GRUPO B
  canada:     { id: 'canada',     name: 'Canadá',          shortName: 'CAN', flag: '🇨🇦', group: 'B' },
  franca:     { id: 'franca',     name: 'França',          shortName: 'FRA', flag: '🇫🇷', group: 'B' },
  japao:      { id: 'japao',      name: 'Japão',           shortName: 'JPN', flag: '🇯🇵', group: 'B' },
  nigeria:    { id: 'nigeria',    name: 'Nigéria',         shortName: 'NGA', flag: '🇳🇬', group: 'B' },

  // GRUPO C
  mexico:     { id: 'mexico',     name: 'México',          shortName: 'MEX', flag: '🇲🇽', group: 'C' },
  argentina:  { id: 'argentina',  name: 'Argentina',       shortName: 'ARG', flag: '🇦🇷', group: 'C' },
  australia:  { id: 'australia',  name: 'Austrália',       shortName: 'AUS', flag: '🇦🇺', group: 'C' },
  argelia:    { id: 'argelia',    name: 'Argélia',         shortName: 'ALG', flag: '🇩🇿', group: 'C' },

  // GRUPO D
  espanha:    { id: 'espanha',    name: 'Espanha',         shortName: 'ESP', flag: '🇪🇸', group: 'D' },
  alemanha:   { id: 'alemanha',   name: 'Alemanha',        shortName: 'GER', flag: '🇩🇪', group: 'D' },
  senegal:    { id: 'senegal',    name: 'Senegal',         shortName: 'SEN', flag: '🇸🇳', group: 'D' },
  honduras:   { id: 'honduras',   name: 'Honduras',        shortName: 'HON', flag: '🇭🇳', group: 'D' },

  // GRUPO E
  portugal:   { id: 'portugal',   name: 'Portugal',        shortName: 'POR', flag: '🇵🇹', group: 'E' },
  belgica:    { id: 'belgica',    name: 'Bélgica',         shortName: 'BEL', flag: '🇧🇪', group: 'E' },
  ira:        { id: 'ira',        name: 'Irão',            shortName: 'IRN', flag: '🇮🇷', group: 'E' },
  chile:      { id: 'chile',      name: 'Chile',           shortName: 'CHI', flag: '🇨🇱', group: 'E' },

  // GRUPO F
  inglaterra: { id: 'inglaterra', name: 'Inglaterra',      shortName: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'F' },
  holanda:    { id: 'holanda',    name: 'Holanda',         shortName: 'NED', flag: '🇳🇱', group: 'F' },
  egito:      { id: 'egito',      name: 'Egito',           shortName: 'EGY', flag: '🇪🇬', group: 'F' },
  paraguai:   { id: 'paraguai',   name: 'Paraguai',        shortName: 'PAR', flag: '🇵🇾', group: 'F' },

  // GRUPO G
  italia:     { id: 'italia',     name: 'Itália',          shortName: 'ITA', flag: '🇮🇹', group: 'G' },
  colombia:   { id: 'colombia',   name: 'Colômbia',        shortName: 'COL', flag: '🇨🇴', group: 'G' },
  gana:       { id: 'gana',       name: 'Gana',            shortName: 'GHA', flag: '🇬🇭', group: 'G' },
  costarica:  { id: 'costarica',  name: 'Costa Rica',      shortName: 'CRC', flag: '🇨🇷', group: 'G' },

  // GRUPO H
  croacia:    { id: 'croacia',    name: 'Croácia',         shortName: 'CRO', flag: '🇭🇷', group: 'H' },
  dinamarca:  { id: 'dinamarca',  name: 'Dinamarca',       shortName: 'DEN', flag: '🇩🇰', group: 'H' },
  arabia:     { id: 'arabia',     name: 'Arábia Saudita',  shortName: 'KSA', flag: '🇸🇦', group: 'H' },
  venezuela:  { id: 'venezuela',  name: 'Venezuela',       shortName: 'VEN', flag: '🇻🇪', group: 'H' },

  // GRUPO I
  suica:      { id: 'suica',      name: 'Suíça',           shortName: 'SUI', flag: '🇨🇭', group: 'I' },
  uruguai:    { id: 'uruguai',    name: 'Uruguai',         shortName: 'URU', flag: '🇺🇾', group: 'I' },
  costamarfim:{ id: 'costamarfim',name: 'Costa do Marfim', shortName: 'CIV', flag: '🇨🇮', group: 'I' },
  elsalvador: { id: 'elsalvador', name: 'El Salvador',     shortName: 'SLV', flag: '🇸🇻', group: 'I' },

  // GRUPO J
  serbia:     { id: 'serbia',     name: 'Sérvia',          shortName: 'SRB', flag: '🇷🇸', group: 'J' },
  turquia:    { id: 'turquia',    name: 'Turquia',         shortName: 'TUR', flag: '🇹🇷', group: 'J' },
  africasul:  { id: 'africasul',  name: 'África do Sul',   shortName: 'RSA', flag: '🇿🇦', group: 'J' },
  jamaica:    { id: 'jamaica',    name: 'Jamaica',         shortName: 'JAM', flag: '🇯🇲', group: 'J' },

  // GRUPO K
  polonia:    { id: 'polonia',    name: 'Polónia',         shortName: 'POL', flag: '🇵🇱', group: 'K' },
  equador:    { id: 'equador',    name: 'Equador',         shortName: 'ECU', flag: '🇪🇨', group: 'K' },
  tunisia:    { id: 'tunisia',    name: 'Tunísia',         shortName: 'TUN', flag: '🇹🇳', group: 'K' },
  novazelandia:{ id: 'novazelandia', name: 'Nova Zelândia', shortName: 'NZL', flag: '🇳🇿', group: 'K' },

  // GRUPO L
  romenia:    { id: 'romenia',    name: 'Roménia',         shortName: 'ROU', flag: '🇷🇴', group: 'L' },
  eslovenia:  { id: 'eslovenia',  name: 'Eslovénia',       shortName: 'SVN', flag: '🇸🇮', group: 'L' },
  peru:       { id: 'peru',       name: 'Peru',            shortName: 'PER', flag: '🇵🇪', group: 'L' },
  jordania:   { id: 'jordania',   name: 'Jordânia',        shortName: 'JOR', flag: '🇯🇴', group: 'L' },
};

export const TEAMS_LIST = Object.values(TEAMS);

export const getTeam = (id: string): Team => {
  return TEAMS[id] || { id, name: id, shortName: id.toUpperCase().slice(0, 3), flag: '🏳️', group: '?' };
};

export const getTeamsByGroup = (group: string): Team[] =>
  TEAMS_LIST.filter(t => t.group === group);

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
