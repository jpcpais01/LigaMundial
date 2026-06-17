'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getTeam } from '@/data/teams';
import { GROUP_MATCHES, KNOCKOUT_MATCHES, JORNADAS } from '@/data/matches';
import { formatTime, isBettingOpen } from '@/lib/utils';
import { useLiveScores } from '@/hooks/useLiveScores';
import BetModal from './BetModal';
import type { League, Match, Bet } from '@/types';

interface GamesTabProps {
  league: League;
  username: string;
  bets: Bet[];
}

type ViewMode = 'rounds' | 'groups';

export default function GamesTab({ league, username, bets }: GamesTabProps) {
  // Determine which matches this league shows
  const allMatches = useMemo(() => {
    if (league.matchPhase === 'group') return GROUP_MATCHES;
    if (league.matchPhase === 'cup') return KNOCKOUT_MATCHES;
    return [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];
  }, [league]);

  const [selectedRound, setSelectedRound] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [viewMode, setViewMode] = useState<ViewMode>(league.matchPhase === 'cup' ? 'rounds' : 'rounds');
  const [activeBetMatch, setActiveBetMatch] = useState<Match | null>(null);
  const liveScores = useLiveScores();

  // Build rounds/filters based on league type
  const rounds = useMemo(() => {
    if (league.id === 'extra-jornadas') return JORNADAS;
    if (league.matchPhase === 'group') {
      return [
        { id: 'j1', label: 'Jornada 1', matchIds: GROUP_MATCHES.filter(m => m.round === 1).map(m => m.id) },
        { id: 'j2', label: 'Jornada 2', matchIds: GROUP_MATCHES.filter(m => m.round === 2).map(m => m.id) },
        { id: 'j3', label: 'Jornada 3', matchIds: GROUP_MATCHES.filter(m => m.round === 3).map(m => m.id) },
      ];
    }
    if (league.matchPhase === 'cup') {
      return [
        { id: 'r32', label: 'Ronda 32',  matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'round32').map(m => m.id) },
        { id: 'r16', label: 'Oitavos',   matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'round16').map(m => m.id) },
        { id: 'qf',  label: 'Quartos',   matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'qf').map(m => m.id) },
        { id: 'sf',  label: 'Meias',     matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'sf').map(m => m.id) },
        { id: 'f',   label: 'Final',     matchIds: KNOCKOUT_MATCHES.filter(m => m.phase === 'final' || m.phase === '3rd').map(m => m.id) },
      ];
    }
    return JORNADAS;
  }, [league]);

  const currentRoundMatches = useMemo(() => {
    const ids = new Set(rounds[selectedRound]?.matchIds || []);
    return allMatches.filter(m => ids.has(m.id));
  }, [allMatches, rounds, selectedRound]);

  // Deep link: ?match=<id> coming from the featured game on the home page.
  // Jump to the round that contains the match and open it automatically.
  const searchParams = useSearchParams();
  useEffect(() => {
    const matchId = searchParams.get('match');
    if (!matchId) return;
    const target = allMatches.find(m => m.id === matchId);
    if (!target || target.homeTeamId === 'TBD') return;
    const roundIndex = rounds.findIndex(r => r.matchIds.includes(matchId));
    if (roundIndex >= 0) setSelectedRound(roundIndex);
    setActiveBetMatch(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allMatches, rounds]);

  const getBetForMatch = (matchId: string) =>
    bets.find(b => b.matchId === matchId) || null;

  return (
    <div className="pb-4">
      {/* Round selector */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {rounds.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setSelectedRound(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedRound === i
                ? 'bg-gold text-black'
                : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="px-4 space-y-2.5 mt-1">
        {currentRoundMatches.length === 0 ? (
          <div className="text-center py-10 text-white/30 text-sm">
            Jogos ainda por definir
          </div>
        ) : (
          currentRoundMatches.map((match, i) => {
            const bet = getBetForMatch(match.id);
            const open = isBettingOpen(match.scheduledAt);
            return (
              <MatchRow
                key={match.id}
                match={match}
                bet={bet}
                bettingOpen={open}
                index={i}
                liveScore={liveScores[`${match.homeTeamId}_${match.awayTeamId}`]}
                onBet={() => setActiveBetMatch(match)}
              />
            );
          })
        )}
      </div>

      <BetModal
        match={activeBetMatch}
        leagueId={league.id}
        username={username}
        onClose={() => setActiveBetMatch(null)}
      />
    </div>
  );
}

import type { LiveScore } from '@/app/api/live/route';

function MatchRow({
  match, bet, bettingOpen, index, liveScore, onBet,
}: {
  match: Match;
  bet: Bet | null;
  bettingOpen: boolean;
  index: number;
  liveScore?: LiveScore;
  onBet: () => void;
}) {
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const isLive = liveScore?.status === 'live' || match.status === 'live';
  const isFinished = liveScore?.status === 'finished' || match.status === 'finished';
  const homeScore = liveScore?.homeScore ?? match.homeScore;
  const awayScore = liveScore?.awayScore ?? match.awayScore;
  const isTBD = match.homeTeamId === 'TBD';

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onBet}
      disabled={isTBD}
      className="w-full text-left"
    >
      <div className={`relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-3.5
                       active:scale-98 transition-transform ${isTBD ? 'opacity-40' : ''}`}>
        {isLive && (
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
        )}

        <div className="flex items-center gap-3">
          {/* Time / Status */}
          <div className="w-14 flex-shrink-0 text-center">
            {isLive ? (
              <span className="text-green-400 text-[10px] font-bold">⬤ LIVE</span>
            ) : isFinished ? (
              <span className="text-white/30 text-[10px]">FIM</span>
            ) : (
              <span className="text-white/40 text-[10px]">{formatTime(match.scheduledAt)}</span>
            )}
            {match.group && (
              <p className="text-white/20 text-[9px] mt-0.5">Gr. {match.group}</p>
            )}
          </div>

          {/* Home */}
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="text-white text-xs font-semibold text-right leading-tight">{home.shortName}</span>
            <span className="text-xl">{home.flag}</span>
          </div>

          {/* Score / VS */}
          <div className="w-16 text-center flex-shrink-0 flex flex-col items-center gap-0.5">
            {bet && (
              <span className="text-[9px] text-gold/60 font-medium leading-none">
                {bet.exactHome !== null ? `${bet.exactHome}-${bet.exactAway}` : ''}
                {bet.exactHome !== null ? ' ' : ''}
                {bet.outcome === 'home' ? '1' : bet.outcome === 'draw' ? 'X' : '2'}
              </span>
            )}
            {(isLive || isFinished) && homeScore !== undefined ? (
              <span className="text-white font-black text-base leading-none">
                {homeScore} – {awayScore}
              </span>
            ) : (
              <span className="text-white/20 text-xs font-medium">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xl">{away.flag}</span>
            <span className="text-white text-xs font-semibold leading-tight">{away.shortName}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
