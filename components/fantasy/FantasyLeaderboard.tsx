'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, Trophy, Crown, X } from 'lucide-react';
import PitchView, { PitchSlot } from './PitchView';
import { PLAYERS_BY_ID } from '@/data/players';
import { getLeagueMembers, getAllFantasySquads, getUser } from '@/lib/firestore';
import { useFantasyStats } from '@/hooks/useFantasyStats';
import {
  FANTASY_WEEKS, isWeekLocked, scoringMatchesOfWeek, computeSquadWeekPoints,
} from '@/lib/fantasy';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { League, FantasySquad, FantasyPosition } from '@/types';

interface FantasyLeaderboardProps {
  league: League;
  currentUsername: string;
  totalMembers: number;
}

interface Row {
  rank: number;
  username: string;
  avatarColor: string;
  avatarUrl?: string;
  total: number;
  weekPoints: Record<string, number>;
  prizeMoney: number;
}

const RANK_EMOJIS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const ROW_ORDER: FantasyPosition[] = ['FWD', 'MID', 'DEF', 'GK'];

export default function FantasyLeaderboard({ league, currentUsername, totalMembers }: FantasyLeaderboardProps) {
  const byId = PLAYERS_BY_ID;
  const { stats, loaded: statsLoaded } = useFantasyStats();
  const [members, setMembers] = useState<{ username: string; avatarColor: string; avatarUrl?: string }[] | null>(null);
  const [squads, setSquads] = useState<FantasySquad[] | null>(null);
  const [viewing, setViewing] = useState<{ username: string; weekId: string } | null>(null);

  const prizePool = totalMembers * league.entryFee;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ms, sq] = await Promise.all([
          getLeagueMembers(league.id),
          getAllFantasySquads(league.id),
        ]);
        const enriched = await Promise.all(
          ms.map(async m => {
            const u = await getUser(m.username);
            return { username: m.username, avatarColor: u?.avatarColor || '#6366f1', avatarUrl: u?.avatarUrl };
          }),
        );
        if (!cancelled) { setMembers(enriched); setSquads(sq); }
      } catch (e) {
        console.error(e);
        if (!cancelled) { setMembers([]); setSquads([]); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [league.id]);

  const lockedWeeks = useMemo(() => FANTASY_WEEKS.filter(w => isWeekLocked(w)), []);

  const rows = useMemo((): Row[] | null => {
    if (!members || !squads || !statsLoaded) return null;
    const squadByKey: Record<string, FantasySquad> = {};
    squads.forEach(s => { squadByKey[`${s.weekId}_${s.username}`] = s; });

    const list = members.map(m => {
      const weekPoints: Record<string, number> = {};
      let total = 0;
      lockedWeeks.forEach(w => {
        const s = squadByKey[`${w.id}_${m.username}`];
        if (!s) return;
        const r = computeSquadWeekPoints(s, scoringMatchesOfWeek(w), stats, byId);
        weekPoints[w.id] = r.total;
        total += r.total;
      });
      return { rank: 0, username: m.username, avatarColor: m.avatarColor, avatarUrl: m.avatarUrl, total, weekPoints, prizeMoney: 0 };
    });

    list.sort((a, b) => b.total - a.total || a.username.localeCompare(b.username));
    list.forEach((r, i) => {
      r.rank = i + 1;
      const pd = league.prizeDistribution;
      if (i === 0) r.prizeMoney = prizePool * (pd.first / 100);
      else if (i === 1 && pd.second) r.prizeMoney = prizePool * (pd.second / 100);
      else if (i === 2 && pd.third) r.prizeMoney = prizePool * (pd.third / 100);
    });
    return list;
  }, [members, squads, statsLoaded, stats, byId, lockedWeeks, league.prizeDistribution, prizePool]);

  // ─── Equipa de outro jogador (apenas jornadas fechadas) ────────────────────
  const viewingSquad = useMemo(() => {
    if (!viewing || !squads) return null;
    return squads.find(s => s.weekId === viewing.weekId && s.username === viewing.username) ?? null;
  }, [viewing, squads]);

  const viewingSlots = useMemo((): { rows: PitchSlot[][]; bench: PitchSlot[]; total: number } | null => {
    if (!viewing || !viewingSquad) return null;
    const week = FANTASY_WEEKS.find(w => w.id === viewing.weekId)!;
    const result = computeSquadWeekPoints(viewingSquad, scoringMatchesOfWeek(week), stats, byId);
    const subbedIn = new Set(result.autoSubs.map(s => s.in));
    const outByIn: Record<string, string> = {};
    result.autoSubs.forEach(s => { outByIn[s.in] = s.out; });

    const chip = (id: string, onBench = false): PitchSlot => {
      const p = byId[id];
      const r = result.perPlayer[id];
      const isCaptain = viewingSquad.captainId === id;
      const pts = r ? (isCaptain && result.captainCounted ? r.points * 2 : r.points) : 0;
      const showPts = r && r.state !== 'pending';
      return {
        key: `${id}${onBench ? '-b' : ''}`,
        player: p ?? null,
        position: p?.position ?? 'OUT',
        isCaptain,
        badge: showPts ? `${pts} pts` : '–',
        badgeTone: r?.live ? 'live' : showPts && pts !== 0 ? 'points' : 'muted',
        dimmed: r?.state === 'didnt-play' || r?.state === 'no-match',
        subbed: subbedIn.has(id) ? 'in' : undefined,
      };
    };

    const pitchRows = ROW_ORDER.map(pos =>
      result.effectiveStarters.filter(id => byId[id]?.position === pos).map(id => chip(id)),
    );
    const bench = viewingSquad.bench.map(id => {
      const replaced = outByIn[id];
      const c = chip(replaced ?? id, true);
      if (replaced) c.subbed = 'out';
      return c;
    });
    return { rows: pitchRows, bench, total: result.total };
  }, [viewing, viewingSquad, stats, byId]);

  if (!rows) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center px-8">
        <Users size={36} className="text-white/15" />
        <p className="text-white/40 text-sm">Ainda não há jogadores registados nesta liga.</p>
      </div>
    );
  }

  const latestLockedWeek = lockedWeeks[lockedWeeks.length - 1];

  return (
    <div className="px-4 pb-4 pt-3">
      {/* Prémio */}
      <div className="flex items-center justify-between bg-white/4 rounded-2xl p-3.5 mb-4 border border-white/8">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-gold" />
          <span className="text-white/60 text-xs">Prémio Total</span>
        </div>
        <span className="text-gold font-bold">{formatCurrency(prizePool)}</span>
      </div>

      {/* Pódio */}
      {rows.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-6 mt-2" style={{ minHeight: '180px' }}>
          <PodiumItem row={rows[1]} height="h-20" currentUser={currentUsername} />
          <PodiumItem row={rows[0]} height="h-28" currentUser={currentUsername} crown />
          <PodiumItem row={rows[2]} height="h-16" currentUser={currentUsername} />
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {rows.map((r, i) => {
          const isCurrent = r.username === currentUsername;
          const weekSummary = lockedWeeks
            .filter(w => r.weekPoints[w.id] !== undefined)
            .map(w => `${w.label.replace('Jornada ', 'J')} ${r.weekPoints[w.id]}`)
            .join(' · ');
          return (
            <motion.button
              key={r.username}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => latestLockedWeek && setViewing({ username: r.username, weekId: latestLockedWeek.id })}
              className={`w-full flex items-center gap-3 rounded-2xl p-3 border transition-colors text-left ${
                isCurrent ? 'bg-gold/10 border-gold/25' : 'bg-white/3 border-white/6'
              }`}
            >
              <div className="w-8 text-center flex-shrink-0">
                {RANK_EMOJIS[r.rank] || <span className="text-white/30 text-sm font-bold">{r.rank}</span>}
              </div>
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: r.avatarUrl ? undefined : r.avatarColor }}
              >
                {r.avatarUrl
                  ? <img src={r.avatarUrl} alt={r.username} className="w-full h-full object-cover" />
                  : getInitials(r.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-gold' : 'text-white'}`}>
                  {r.username}{isCurrent && ' (tu)'}
                </p>
                <p className="text-white/30 text-[10px] mt-0.5 truncate">
                  {weekSummary || 'Sem equipas fechadas'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-black text-lg leading-none ${isCurrent ? 'text-gold' : 'text-white'}`}>{r.total}</p>
                <p className="text-white/25 text-[10px]">pts</p>
              </div>
              {r.prizeMoney > 0 && (
                <div className="text-right flex-shrink-0 ml-1">
                  <p className="text-green-400 text-xs font-bold">{formatCurrency(r.prizeMoney)}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Equipa de outro jogador */}
      <AnimatePresence>
        {viewing && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewing(null)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              <div className="bg-[#0d1117] border-t border-white/8 rounded-t-3xl p-5 pb-9 max-h-[88dvh] overflow-y-auto">
                <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Equipa de {viewing.username}</h2>
                    {viewingSlots && (
                      <p className="text-white/35 text-xs mt-0.5">
                        Total da jornada: <span className="text-gold font-bold">{viewingSlots.total} pts</span>
                      </p>
                    )}
                  </div>
                  <button onClick={() => setViewing(null)} className="p-2 rounded-xl bg-white/5">
                    <X size={16} className="text-white/50" />
                  </button>
                </div>

                {/* Selector de jornada (só fechadas) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                  {lockedWeeks.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setViewing({ ...viewing, weekId: w.id })}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                        viewing.weekId === w.id
                          ? 'bg-cyan-400 text-black'
                          : 'bg-white/5 text-white/50 border border-white/10'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {viewingSlots ? (
                  <PitchView rows={viewingSlots.rows} bench={viewingSlots.bench} />
                ) : (
                  <p className="text-center text-white/30 text-sm py-10">
                    {viewing.username} não criou equipa nesta jornada.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PodiumItem({ row, height, currentUser, crown = false }: {
  row: Row; height: string; currentUser: string; crown?: boolean;
}) {
  const isCurrent = row.username === currentUser;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      {crown && <Crown size={14} className="text-gold mb-0.5" />}
      <div
        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: row.avatarUrl ? undefined : row.avatarColor }}
      >
        {row.avatarUrl
          ? <img src={row.avatarUrl} alt={row.username} className="w-full h-full object-cover" />
          : getInitials(row.username)}
      </div>
      <p className={`text-[9px] font-semibold truncate max-w-[60px] text-center ${isCurrent ? 'text-gold' : 'text-white/70'}`}>
        {row.username}
      </p>
      <div className={`${height} w-full rounded-t-xl flex items-center justify-center
                       ${row.rank === 1 ? 'bg-gold/20 border-t border-gold/30' :
                         row.rank === 2 ? 'bg-white/8 border-t border-white/15' :
                         'bg-white/5 border-t border-white/10'}`}>
        <span className="text-white font-black text-sm">{row.total}</span>
      </div>
    </div>
  );
}
