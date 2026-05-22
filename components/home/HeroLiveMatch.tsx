'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { GROUP_MATCHES, KNOCKOUT_MATCHES, ALL_MATCHES } from '@/data/matches';
import { getTeam } from '@/data/teams';
import { formatMatchDate, formatTime, timeUntil } from '@/lib/utils';
import type { Match } from '@/types';

function getNextOrLiveMatch(): Match | null {
  const now = new Date();
  // Primeiro tenta live
  const live = ALL_MATCHES.find(m => m.status === 'live');
  if (live) return live;
  // Depois o mais próximo no futuro
  const upcoming = ALL_MATCHES
    .filter(m => new Date(m.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return upcoming[0] || null;
}

function TeamDisplay({ teamId, side }: { teamId: string; side: 'home' | 'away' }) {
  const team = getTeam(teamId);
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${side === 'home' ? 'items-start' : 'items-end'}`}>
      <span className="text-5xl">{team.flag}</span>
      <div className={side === 'home' ? 'text-left' : 'text-right'}>
        <p className="text-white font-bold text-base leading-tight">{team.shortName}</p>
        <p className="text-white/40 text-xs">{team.name}</p>
      </div>
    </div>
  );
}

export default function HeroLiveMatch() {
  const [match, setMatch] = useState<Match | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    setMatch(getNextOrLiveMatch());
  }, []);

  useEffect(() => {
    if (!match || match.status !== 'scheduled') return;
    const interval = setInterval(() => {
      setCountdown(timeUntil(match.scheduledAt));
    }, 1000);
    setCountdown(timeUntil(match.scheduledAt));
    return () => clearInterval(interval);
  }, [match]);

  if (!match) {
    return (
      <div className="mx-4 rounded-3xl glass-card border border-white/10 p-6 text-center">
        <span className="text-4xl">🏆</span>
        <p className="text-white/60 mt-2 text-sm">Nenhum jogo em destaque</p>
      </div>
    );
  }

  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mx-4"
    >
      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-md p-5">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/20 pointer-events-none" />

        {/* Status badge */}
        <div className="relative flex items-center justify-between mb-4">
          <span className="text-xs text-white/40 font-medium">
            {match.group ? `Grupo ${match.group}` : match.phase === 'final' ? 'Final' : match.phase.toUpperCase()}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              AO VIVO
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="text-xs text-white/50">Em breve</span>
          )}
          {isFinished && (
            <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-full">Terminado</span>
          )}
        </div>

        {/* Teams */}
        <div className="relative flex items-center gap-4">
          <TeamDisplay teamId={match.homeTeamId} side="home" />

          {/* Score / VS */}
          <div className="flex flex-col items-center flex-shrink-0">
            {(isLive || isFinished) && match.homeScore !== undefined ? (
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-white">{match.homeScore}</span>
                <span className="text-white/30 text-2xl font-light">-</span>
                <span className="text-4xl font-black text-white">{match.awayScore}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white/30">VS</span>
              </div>
            )}
            <p className="text-white/30 text-xs mt-1">{formatTime(match.scheduledAt)}</p>
          </div>

          <TeamDisplay teamId={match.awayTeamId} side="away" />
        </div>

        {/* Footer info */}
        <div className="relative flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-white/35 text-xs">
            <MapPin size={11} />
            <span>{match.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/35 text-xs">
            <Clock size={11} />
            <span>{countdown || formatMatchDate(match.scheduledAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
