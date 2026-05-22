'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Users, Trophy, Crown } from 'lucide-react';
import { getAllBetsForLeague, getLeagueMembers, getAllResults } from '@/lib/firestore';
import { buildLeaderboard } from '@/lib/scoring';
import { getUser } from '@/lib/firestore';
import { formatCurrency, getInitials } from '@/lib/utils';
import type { League, LeaderboardEntry } from '@/types';

interface LeaderboardTabProps {
  league: League;
  currentUsername: string;
  totalMembers: number;
}

const RANK_EMOJIS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardTab({ league, currentUsername, totalMembers }: LeaderboardTabProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const prizePool = totalMembers * league.entryFee;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [members, bets, results] = await Promise.all([
          getLeagueMembers(league.id),
          getAllBetsForLeague(league.id),
          getAllResults(),
        ]);

        // Enrich members with avatar color from user profiles
        const enriched = await Promise.all(
          members.map(async m => {
            const u = await getUser(m.username);
            return { username: m.username, avatarColor: u?.avatarColor || '#6366f1', avatarUrl: u?.avatarUrl };
          })
        );

        const board = buildLeaderboard(bets, results, enriched, prizePool, league.prizeDistribution);
        setEntries(board);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [league, prizePool]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center px-8">
        <Users size={36} className="text-white/15" />
        <p className="text-white/40 text-sm">Ainda não há jogadores registados nesta liga.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {/* Prize pool info */}
      <div className="flex items-center justify-between bg-white/4 rounded-2xl p-3.5 mb-4 border border-white/8">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-gold" />
          <span className="text-white/60 text-xs">Prémio Total</span>
        </div>
        <span className="text-gold font-bold">{formatCurrency(prizePool)}</span>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-6 mt-2" style={{ minHeight: '200px' }}>
          {/* 2nd */}
          <PodiumItem entry={entries[1]} height="h-20" currentUser={currentUsername} />
          {/* 1st */}
          <PodiumItem entry={entries[0]} height="h-28" currentUser={currentUsername} crown />
          {/* 3rd */}
          <PodiumItem entry={entries[2]} height="h-16" currentUser={currentUsername} />
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isCurrent = entry.username === currentUsername;
          return (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 rounded-2xl p-3 border transition-colors ${
                isCurrent
                  ? 'bg-gold/10 border-gold/25'
                  : 'bg-white/3 border-white/6'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {RANK_EMOJIS[entry.rank] || (
                  <span className="text-white/30 text-sm font-bold">{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: entry.avatarUrl ? undefined : entry.avatarColor }}
              >
                {entry.avatarUrl
                  ? <img src={entry.avatarUrl} alt={entry.username} className="w-full h-full object-cover" />
                  : getInitials(entry.username)}
              </div>

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-gold' : 'text-white'}`}>
                  {entry.username}{isCurrent && ' (tu)'}
                </p>
                <p className="text-white/30 text-[10px] mt-0.5">
                  {entry.exactScores} exactos · {entry.correctOutcomes} 1X2
                </p>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <p className={`font-black text-lg leading-none ${isCurrent ? 'text-gold' : 'text-white'}`}>
                  {entry.points}
                </p>
                <p className="text-white/25 text-[10px]">pts</p>
              </div>

              {/* Prize */}
              {entry.prizeMoney > 0 && (
                <div className="text-right flex-shrink-0 ml-1">
                  <p className="text-green-400 text-xs font-bold">{formatCurrency(entry.prizeMoney)}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PodiumItem({
  entry, height, currentUser, crown = false,
}: {
  entry: LeaderboardEntry;
  height: string;
  currentUser: string;
  crown?: boolean;
}) {
  const isCurrent = entry.username === currentUser;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      {crown && <Crown size={14} className="text-gold mb-0.5" />}
      <div
        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: entry.avatarUrl ? undefined : entry.avatarColor }}
      >
        {entry.avatarUrl
          ? <img src={entry.avatarUrl} alt={entry.username} className="w-full h-full object-cover" />
          : getInitials(entry.username)}
      </div>
      <p className={`text-[9px] font-semibold truncate max-w-[60px] text-center ${isCurrent ? 'text-gold' : 'text-white/70'}`}>
        {entry.username}
      </p>
      <div className={`${height} w-full rounded-t-xl flex items-center justify-center
                       ${entry.rank === 1 ? 'bg-gold/20 border-t border-gold/30' :
                         entry.rank === 2 ? 'bg-white/8 border-t border-white/15' :
                         'bg-white/5 border-t border-white/10'}`}>
        <span className="text-white font-black text-sm">{entry.points}</span>
      </div>
    </div>
  );
}
