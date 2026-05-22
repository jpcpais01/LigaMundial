import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Bet, SpecialBet, LeagueMember, MatchResult } from '@/types';

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
export async function saveBet(bet: Omit<Bet, 'id' | 'createdAt' | 'updatedAt' | 'points'>): Promise<void> {
  const id = `${bet.leagueId}_${bet.matchId}_${bet.username}`;
  const now = new Date().toISOString();
  const existing = await getDoc(doc(db, 'bets', id));
  if (existing.exists()) {
    await updateDoc(doc(db, 'bets', id), { ...bet, updatedAt: now });
  } else {
    await setDoc(doc(db, 'bets', id), { ...bet, id, points: null, createdAt: now, updatedAt: now });
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
  await updateDoc(doc(db, 'users', username), data as Record<string, unknown>);
}

export async function getUsersByUsernames(usernames: string[]): Promise<import('@/types').User[]> {
  if (usernames.length === 0) return [];
  const snaps = await Promise.all(usernames.map(u => getDoc(doc(db, 'users', u))));
  return snaps.filter(d => d.exists()).map(d => d.data() as import('@/types').User);
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
