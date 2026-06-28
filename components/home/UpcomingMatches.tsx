'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getTeam, isRealTeam } from '@/data/teams';
import { formatTime, formatShortDate } from '@/lib/utils';
import { useLiveScores } from '@/hooks/useLiveScores';
import { useResolvedMatches } from '@/hooks/useResolvedMatches';
import { isToday, isTomorrow } from 'date-fns';

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d))    return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  return formatShortDate(iso);
}

function phaseShort(match: { phase: string; group?: string }): string {
  if (match.group) return `G${match.group}`;
  const map: Record<string, string> = {
    round32: 'R32', round16: 'R16', qf: 'QF', sf: 'SF', '3rd': '3º', final: 'F',
  };
  return map[match.phase] ?? '';
}

export default function UpcomingMatches() {
  const liveScores = useLiveScores();
  const { all } = useResolvedMatches();

  // Next 10 matches: upcoming + currently live (within 3h window)
  const matches = useMemo(() => {
    const cutoff = Date.now() - 3 * 60 * 60 * 1000;
    return all
      .filter(m => new Date(m.scheduledAt).getTime() > cutoff)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 10);
  }, [all]);

  // Group by day label
  const groups = useMemo(() => {
    const map = new Map<string, typeof matches>();
    for (const m of matches) {
      const label = dayLabel(m.scheduledAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(m);
    }
    return Array.from(map.entries());
  }, [matches]);

  if (matches.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="px-4 mt-5"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-3">
        Próximos Jogos
      </p>

      <div className="rounded-2xl border border-white/6 bg-white/3 overflow-hidden">
        {groups.map(([day, dayMatches], gi) => (
          <div key={day}>
            {/* Day header */}
            <div className="px-4 py-1.5 bg-white/3 border-b border-white/5">
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{day}</span>
            </div>

            {dayMatches.map((match, mi) => {
              const home      = getTeam(match.homeTeamId);
              const away      = getTeam(match.awayTeamId);
              const liveScore = liveScores[`${match.homeTeamId}_${match.awayTeamId}`];
              const isLive    = liveScore?.status === 'live'     || match.status === 'live';
              const isEnd     = liveScore?.status === 'finished' || match.status === 'finished';
              const hScore    = liveScore?.homeScore ?? match.homeScore;
              const aScore    = liveScore?.awayScore ?? match.awayScore;
              const isTBD     = !isRealTeam(match.homeTeamId);
              const isLast    = gi === groups.length - 1 && mi === dayMatches.length - 1;

              return (
                <div
                  key={match.id}
                  className={`flex items-center gap-2 px-4 py-2.5 ${!isLast ? 'border-b border-white/4' : ''} ${isTBD ? 'opacity-35' : ''} ${isLive ? 'bg-emerald-400/4' : ''}`}
                >
                  {/* Time / Status */}
                  <div className="w-11 flex-shrink-0 text-center">
                    {isLive ? (
                      <span className="text-green-400 text-[9px] font-bold leading-none">
                        ⬤ {liveScore?.elapsed ? `${liveScore.elapsed}'` : 'LIVE'}
                      </span>
                    ) : isEnd ? (
                      <span className="text-white/25 text-[9px]">FIM</span>
                    ) : (
                      <span className="text-white/40 text-[10px]">{formatTime(match.scheduledAt)}</span>
                    )}
                  </div>

                  {/* Home */}
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <span className="text-white/60 text-[11px] font-semibold">{home.shortName}</span>
                    <span className="text-[18px] leading-none">{home.flag}</span>
                  </div>

                  {/* Score / VS */}
                  <div className="w-11 text-center flex-shrink-0">
                    {(isLive || isEnd) && hScore !== undefined ? (
                      <span className="text-white font-black text-sm">{hScore}–{aScore}</span>
                    ) : (
                      <span className="text-white/20 text-[10px]">vs</span>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[18px] leading-none">{away.flag}</span>
                    <span className="text-white/60 text-[11px] font-semibold">{away.shortName}</span>
                  </div>

                  {/* Phase badge */}
                  <div className="w-6 text-right flex-shrink-0">
                    <span className="text-white/20 text-[9px] font-medium">{phaseShort(match)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
