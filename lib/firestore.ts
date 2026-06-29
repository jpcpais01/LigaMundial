import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { getOutcomeFromScore } from './scoring';
import type { User, Bet, SpecialBet, LeagueMember, MatchResult, Outcome } from '@/types';

// ─── UTILIZADORES ────────────────────────────────────────────────────────────
export async function getUser(username: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', username.toLowerCase()));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

export async function createUser(username: string): Promise<User> {
  const colors = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const user: User = {
    username: username.toLowerCase(),
    createdAt: new Date().toISOString(),
    joinedLeagues: [],
    avatarColor: color,
  };
  await setDoc(doc(db, 'users', user.username), user);
  return user;
}

export async function getOrCreateUser(username: string): Promise<User> {
  const existing = await getUser(username);
  if (existing) return existing;
  return createUser(username);
}

// ─── MEMBROS DA LIGA ─────────────────────────────────────────────────────────
export async function joinLeague(leagueId: string, username: string): Promise<void> {
  const memberId = `${leagueId}_${username}`;
  const member: LeagueMember = {
    id: memberId,
    leagueId,
    username,
    joinedAt: new Date().toISOString(),
    hasPaid: false,
  };
  await setDoc(doc(db, 'leagueMembers', memberId), member);
  // Atualizar lista de ligas do utilizador
  const userRef = doc(db, 'users', username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const current = userSnap.data().joinedLeagues || [];
    if (!current.includes(leagueId)) {
      await updateDoc(userRef, { joinedLeagues: [...current, leagueId] });
    }
  }
  // Inscrição tardia na Extra — Jornadas: importa as apostas já feitas
  // nas ligas gerais (fase de grupos / fase de taça)
  if (leagueId === JORNADAS_LEAGUE_ID) {
    await copyExistingBetsToJornadas(username);
  }
}

export async function isLeagueMember(leagueId: string, username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'leagueMembers', `${leagueId}_${username}`));
  return snap.exists();
}

export async function leaveLeague(leagueId: string, username: string): Promise<void> {
  // Remove member doc
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'leagueMembers', `${leagueId}_${username}`));
  // Remove from user's joinedLeagues list
  const userRef = doc(db, 'users', username);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const current: string[] = userSnap.data().joinedLeagues || [];
    await updateDoc(userRef, { joinedLeagues: current.filter(id => id !== leagueId) });
  }
}

export async function getLeagueMembers(leagueId: string): Promise<LeagueMember[]> {
  const q = query(collection(db, 'leagueMembers'), where('leagueId', '==', leagueId));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => d.data() as LeagueMember);
}

// ─── APOSTAS ─────────────────────────────────────────────────────────────────
// A liga Extra — Jornadas espelha automaticamente as apostas feitas nas ligas
// gerais (fase de grupos e fase de taça) para os membros de ambas.
const JORNADAS_LEAGUE_ID = 'extra-jornadas';
const JORNADAS_SOURCE_LEAGUES = ['fase-grupos', 'fase-copa'];

type NewBet = Omit<Bet, 'id' | 'createdAt' | 'updatedAt' | 'points'>;

async function writeBet(rawBet: NewBet): Promise<void> {
  // Com resultado exacto preenchido, o 1X2 é forçado a ser coerente com ele
  const bet: NewBet =
    rawBet.exactHome !== null && rawBet.exactAway !== null
      ? { ...rawBet, outcome: getOutcomeFromScore(rawBet.exactHome, rawBet.exactAway) }
      : rawBet;
  const id = `${bet.leagueId}_${bet.matchId}_${bet.username}`;
  const now = new Date().toISOString();
  const existing = await getDoc(doc(db, 'bets', id));
  if (existing.exists()) {
    await updateDoc(doc(db, 'bets', id), { ...bet, updatedAt: now });
  } else {
    await setDoc(doc(db, 'bets', id), { ...bet, id, points: null, createdAt: now, updatedAt: now });
  }
}

export async function saveBet(bet: NewBet): Promise<void> {
  await writeBet(bet);
  // Espelhar para a liga Extra — Jornadas, se o utilizador for membro
  if (JORNADAS_SOURCE_LEAGUES.includes(bet.leagueId)) {
    const isMember = await isLeagueMember(JORNADAS_LEAGUE_ID, bet.username);
    if (isMember) {
      await writeBet({ ...bet, leagueId: JORNADAS_LEAGUE_ID });
    }
  }
}

// Quando alguém se inscreve mais tarde na Extra — Jornadas, copia as apostas
// já feitas nas ligas gerais (sem substituir apostas já existentes na jornadas)
async function copyExistingBetsToJornadas(username: string): Promise<void> {
  const [jornadasBets, ...sourceBets] = await Promise.all([
    getUserBetsForLeague(JORNADAS_LEAGUE_ID, username),
    ...JORNADAS_SOURCE_LEAGUES.map(l => getUserBetsForLeague(l, username)),
  ]);
  const alreadyBet = new Set(jornadasBets.map(b => b.matchId));
  const toCopy = sourceBets.flat().filter(b => !alreadyBet.has(b.matchId));
  await Promise.all(
    toCopy.map(b => writeBet({
      username,
      leagueId: JORNADAS_LEAGUE_ID,
      matchId: b.matchId,
      exactHome: b.exactHome,
      exactAway: b.exactAway,
      outcome: b.outcome,
    }))
  );
}

// Inserir/editar a aposta de um jogador (painel admin). Ao contrário de
// saveBet, escreve diretamente na liga indicada (sem exigir inscrição nem
// espelhar automaticamente), para o admin poder corrigir apostas esquecidas.
export async function adminSetBet(params: {
  leagueId: string;
  matchId: string;
  username: string;
  exactHome: number | null;
  exactAway: number | null;
  outcome?: Outcome;
}): Promise<void> {
  const username = params.username.trim().toLowerCase();
  const outcome: Outcome =
    params.exactHome !== null && params.exactAway !== null
      ? getOutcomeFromScore(params.exactHome, params.exactAway)
      : (params.outcome ?? 'draw');
  const id = `${params.leagueId}_${params.matchId}_${username}`;
  const now = new Date().toISOString();
  const data = {
    username,
    leagueId: params.leagueId,
    matchId: params.matchId,
    exactHome: params.exactHome,
    exactAway: params.exactAway,
    outcome,
  };
  const existing = await getDoc(doc(db, 'bets', id));
  if (existing.exists()) {
    await updateDoc(doc(db, 'bets', id), { ...data, updatedAt: now });
  } else {
    await setDoc(doc(db, 'bets', id), { ...data, id, points: null, createdAt: now, updatedAt: now });
  }
}

export async function getBet(leagueId: string, matchId: string, username: string): Promise<Bet | null> {
  const snap = await getDoc(doc(db, 'bets', `${leagueId}_${matchId}_${username}`));
  if (!snap.exists()) return null;
  return snap.data() as Bet;
}

export async function getUserBetsForLeague(leagueId: string, username: string): Promise<Bet[]> {
  const q = query(collection(db, 'bets'), where('leagueId', '==', leagueId), where('username', '==', username));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => d.data() as Bet);
}

// Todas as apostas de um jogo numa liga — para mostrar aos restantes jogadores
// depois de as apostas fecharem
export async function getBetsForMatch(leagueId: string, matchId: string): Promise<Bet[]> {
  const q = query(
    collection(db, 'bets'),
    where('leagueId', '==', leagueId),
    where('matchId', '==', matchId),
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(d => d.data() as Bet);
}

export async function getAllBetsForLeague(leagueId: string): Promise<Bet[]> {
  const q = query(collection(db, 'bets'), where('leagueId', '==', leagueId));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => d.data() as Bet);
}

// ─── APOSTAS ESPECIAIS (campeão / marcador) ──────────────────────────────────
export async function saveSpecialBet(bet: Omit<SpecialBet, 'id' | 'createdAt' | 'isWinner'>): Promise<void> {
  const id = `${bet.leagueId}_${bet.username}`;
  const existing = await getDoc(doc(db, 'specialBets', id));
  if (existing.exists()) {
    await updateDoc(doc(db, 'specialBets', id), { prediction: bet.prediction });
  } else {
    await setDoc(doc(db, 'specialBets', id), { ...bet, id, isWinner: null, createdAt: new Date().toISOString() });
  }
}

export async function getSpecialBet(leagueId: string, username: string): Promise<SpecialBet | null> {
  const snap = await getDoc(doc(db, 'specialBets', `${leagueId}_${username}`));
  if (!snap.exists()) return null;
  return snap.data() as SpecialBet;
}

export async function getAllSpecialBetsForLeague(leagueId: string): Promise<SpecialBet[]> {
  const q = query(collection(db, 'specialBets'), where('leagueId', '==', leagueId));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => d.data() as SpecialBet);
}

// ─── UTILIZADORES (update) ───────────────────────────────────────────────────
export async function updateUserDoc(username: string, data: Partial<import('@/types').User>): Promise<void> {
  // setDoc with merge:true creates the doc if missing, updates if it exists
  await setDoc(doc(db, 'users', username), data as Record<string, unknown>, { merge: true });
}

// ─── CONFIGURAÇÃO DAS LIGAS (background) ─────────────────────────────────────
export async function getLeagueConfig(leagueId: string): Promise<{ backgroundUrl?: string } | null> {
  const snap = await getDoc(doc(db, 'leagueConfig', leagueId));
  if (!snap.exists()) return null;
  return snap.data() as { backgroundUrl?: string };
}

export async function setLeagueBackground(leagueId: string, backgroundUrl: string): Promise<void> {
  await setDoc(doc(db, 'leagueConfig', leagueId), { backgroundUrl }, { merge: true });
}

export async function getAllLeagueConfigs(): Promise<Record<string, { backgroundUrl?: string }>> {
  const snaps = await getDocs(collection(db, 'leagueConfig'));
  const res: Record<string, { backgroundUrl?: string }> = {};
  snaps.docs.forEach(d => { res[d.id] = d.data() as { backgroundUrl?: string }; });
  return res;
}

export async function getUsersByUsernames(usernames: string[]): Promise<import('@/types').User[]> {
  if (usernames.length === 0) return [];
  const snaps = await Promise.all(usernames.map(u => getDoc(doc(db, 'users', u))));
  return snaps.filter(d => d.exists()).map(d => d.data() as import('@/types').User);
}

// ─── FANTASY 11 ───────────────────────────────────────────────────────────────
// As regras do Firestore só permitem escrita nas colecções existentes, por isso
// as equipas fantasy vivem na colecção `leagueMembers` com ids `fsquad_*` e um
// leagueId com sufixo `#squads` — assim nunca aparecem nas queries de membros
// (que usam sempre os ids exactos das ligas).
const fantasySquadLeagueKey = (leagueId: string) => `${leagueId}#squads`;
const fantasySquadDocId = (weekId: string, username: string) => `fsquad_${weekId}_${username}`;

export async function saveFantasySquad(
  squad: Omit<import('@/types').FantasySquad, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const id = `${squad.weekId}_${squad.username}`;
  const now = new Date().toISOString();
  const ref = doc(db, 'leagueMembers', fantasySquadDocId(squad.weekId, squad.username));
  const data = { ...squad, leagueId: fantasySquadLeagueKey(squad.leagueId), id };
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { ...data, updatedAt: now });
  } else {
    await setDoc(ref, { ...data, createdAt: now, updatedAt: now });
  }
}

function squadFromDoc(data: Record<string, unknown>): import('@/types').FantasySquad {
  const squad = data as unknown as import('@/types').FantasySquad;
  // repõe o leagueId original (sem o sufixo #squads)
  return { ...squad, leagueId: String(squad.leagueId).replace(/#squads$/, '') };
}

export async function getFantasySquad(
  weekId: string, username: string,
): Promise<import('@/types').FantasySquad | null> {
  const snap = await getDoc(doc(db, 'leagueMembers', fantasySquadDocId(weekId, username)));
  if (!snap.exists()) return null;
  return squadFromDoc(snap.data());
}

export async function getAllFantasySquads(
  leagueId: string,
): Promise<import('@/types').FantasySquad[]> {
  const q = query(collection(db, 'leagueMembers'), where('leagueId', '==', fantasySquadLeagueKey(leagueId)));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => squadFromDoc(d.data()));
}

// ─── RESULTADOS DOS JOGOS (admin) ─────────────────────────────────────────────
export async function setMatchResult(result: MatchResult): Promise<void> {
  await setDoc(doc(db, 'results', result.matchId), result);
}

export async function getMatchResult(matchId: string): Promise<MatchResult | null> {
  const snap = await getDoc(doc(db, 'results', matchId));
  if (!snap.exists()) return null;
  return snap.data() as MatchResult;
}

export async function getAllResults(): Promise<Record<string, MatchResult>> {
  const snaps = await getDocs(collection(db, 'results'));
  const res: Record<string, MatchResult> = {};
  snaps.docs.forEach(d => { res[d.id] = d.data() as MatchResult; });
  return res;
}
