'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { ALL_MATCHES } from '@/data/matches';
import { getTeam } from '@/data/teams';
import { formatMatchDate, formatTime, timeUntil } from '@/lib/utils';
import type { Match } from '@/types';
import type { LiveScoresMap } from '@/app/api/live/route';

function getNextOrLiveMatch(): Match | null {
  const now = new Date();
  const live = ALL_MATCHES.find(m => m.status === 'live');
  if (live) return live;
  const upcoming = ALL_MATCHES
    .filter(m => new Date(m.scheduledAt) > now && m.homeTeamId !== 'TBD')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return upcoming[0] || null;
}

export default function HeroLiveMatch() {
  const [match, setMatch] = useState<Match | null>(null);
  const [countdown, setCountdown] = useState('');
  const [liveScores, setLiveScores] = useState<LiveScoresMap>({});

  // Pick match
  useEffect(() => { setMatch(getNextOrLiveMatch()); }, []);

  // Countdown
  useEffect(() => {
    if (!match || match.status !== 'scheduled') return;
    const interval = setInterval(() => setCountdown(timeUntil(match.scheduledAt)), 1000);
    setCountdown(timeUntil(match.scheduledAt));
    return () => clearInterval(interval);
  }, [match]);

  // Poll live scores every 60 s
  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/live');
        if (res.ok) setLiveScores(await res.json());
      } catch {}
    }
    fetchScores();
    const interval = setInterval(fetchScores, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!match) {
    return (
      <div className="mx-4 rounded-2xl border border-white/6 bg-white/3 p-6 text-center">
        <p className="text-white/25 text-sm">Nenhum jogo em destaque</p>
      </div>
    );
  }

  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);

  const liveKey = `${match.homeTeamId}_${match.awayTeamId}`;
  const live = liveScores[liveKey];
  const isLive = live?.status === 'live' || match.status === 'live';
  const isFinished = live?.status === 'finished' || match.status === 'finished';
  const homeScore = live?.homeScore ?? match.homeScore;
  const awayScore = live?.awayScore ?? match.awayScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="mx-4"
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/6 p-5"
        style={{ background: '#080d1e' }}
      >
        {/* Home flag — left half, clipped diagonally */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: 'polygon(0 0, 58% 0, 42% 100%, 0 100%)' }}
        >
          <span
            style={{
              position: 'absolute',
              fontSize: 320,
              top: '50%',
              left: '-25%',
              transform: 'translateY(-50%)',
              opacity: 0.22,
              filter: 'blur(10px)',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {home.flag}
          </span>
        </div>

        {/* Away flag — right half, clipped diagonally */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)' }}
        >
          <span
            style={{
              position: 'absolute',
              fontSize: 320,
              top: '50%',
              right: '-25%',
              transform: 'translateY(-50%)',
              opacity: 0.22,
              filter: 'blur(10px)',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {away.flag}
          </span>
        </div>

        {/* Diagonal divider line */}
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{
            left: 'calc(50% - 0.5px)',
            width: '1px',
            background: 'rgba(255,255,255,0.07)',
            transform: 'skewX(-10deg)',
          }}
        />

        {/* Dark vignette — keeps text readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(8,13,30,0.75) 100%)',
          }}
        />

        {/* Status */}
        <div className="relative flex items-center justify-between mb-5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25">
            {match.group ? `Grupo ${match.group}` : match.phase === 'final' ? 'Final' : match.phase?.toUpperCase()}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {live?.elapsed ? `${live.elapsed}'` : 'Ao Vivo'}
            </span>
          )}
          {isFinished && !isLive && (
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Terminado</span>
          )}
        </div>

        {/* Teams */}
        <div className="relative flex items-center gap-4 mb-5">
          {/* Home */}
          <div className="flex-1 flex flex-col items-start gap-2">
            <span className="text-5xl leading-none">{home.flag}</span>
            <div>
              <p className="text-white font-bold text-sm">{home.shortName}</p>
              <p className="text-white/30 text-[11px]">{home.name}</p>
            </div>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {(isLive || isFinished) && homeScore !== undefined ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-white tabular-nums">{homeScore}</span>
                <span className="text-white/20 text-xl">–</span>
                <span className="text-4xl font-black text-white tabular-nums">{awayScore}</span>
              </div>
            ) : (
              <span className="text-white/15 font-bold text-xl tracking-widest">VS</span>
            )}
            <p className="text-white/25 text-[11px]">{formatTime(match.scheduledAt)}</p>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-end gap-2">
            <span className="text-5xl leading-none">{away.flag}</span>
            <div className="text-right">
              <p className="text-white font-bold text-sm">{away.shortName}</p>
              <p className="text-white/30 text-[11px]">{away.name}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
            <MapPin size={10} />
            <span>{match.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
            <Clock size={10} />
            <span>{countdown || formatMatchDate(match.scheduledAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
