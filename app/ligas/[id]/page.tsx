'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, CheckCircle, LogIn, Info, LogOut } from 'lucide-react';
import Link from 'next/link';
import { getLeague } from '@/data/leagues';
import { GROUP_MATCHES, KNOCKOUT_MATCHES } from '@/data/matches';
import { useAuthContext } from '@/components/auth/AuthContext';
import { joinLeague, leaveLeague, getLeagueMembers, getUserBetsForLeague, getUsersByUsernames } from '@/lib/firestore';
import GamesTab from '@/components/leagues/GamesTab';
import LeaderboardTab from '@/components/leagues/LeaderboardTab';
import SpecialBetView from '@/components/leagues/SpecialBetView';
import Fantasy11View from '@/components/fantasy/Fantasy11View';
import InfoModal from '@/components/leagues/InfoModal';
import { getInitials } from '@/lib/utils';
import type { Bet, User } from '@/types';

type Tab = 'jogos' | 'classificacao';

const ACCENT: Record<string, string> = {
  'fase-grupos':    '#3b82f6',
  'fase-copa':      '#a78bfa',
  'fantasy-11':     '#22d3ee',
  'extra-jornadas': '#34d399',
  'extra-campeao':  '#fbbf24',
  'extra-marcador': '#fb7185',
};

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const league = getLeague(id);
  const { user, setShowAuthModal, updateUser } = useAuthContext();

  const [tab, setTab] = useState<Tab>('jogos');
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [memberUsers, setMemberUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const accent = ACCENT[id] || '#3b82f6';

  useEffect(() => {
    if (!league) return;
    async function init() {
      setLoading(true);
      const members = await getLeagueMembers(league!.id);
      setMemberCount(members.length);
      const users = await getUsersByUsernames(members.map(m => m.username));
      setMemberUsers(users);
      if (user) {
        const isMember = members.find(m => m.username === user.username);
        setJoined(!!isMember);
        const userBets = await getUserBetsForLeague(league!.id, user.username);
        setBets(userBets);
      }
      setLoading(false);
    }
    init();
  }, [league, user]);

  if (!league) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
        <p className="text-white/30 text-sm">Liga não encontrada</p>
        <Link href="/ligas" className="text-white/50 text-sm underline">Voltar</Link>
      </div>
    );
  }

  const isSpecial = league.type === 'champion' || league.type === 'scorer';

  // Can leave only if the first match of this league hasn't started yet
  const firstMatch = (() => {
    const pool = league.matchPhase === 'cup' ? KNOCKOUT_MATCHES : GROUP_MATCHES;
    return pool.filter(m => m.homeTeamId !== 'TBD')
               .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  })();
  const canLeave = firstMatch ? new Date(firstMatch.scheduledAt) > new Date() : false;

  const handleLeave = async () => {
    if (!user) return;
    setLeaving(true);
    try {
      await leaveLeague(league.id, user.username);
      setJoined(false);
      setMemberCount(c => Math.max(0, c - 1));
      setMemberUsers(prev => prev.filter(u => u.username !== user.username));
      setShowLeaveConfirm(false);
      updateUser({ joinedLeagues: (user.joinedLeagues || []).filter(id => id !== league.id) });
    } finally {
      setLeaving(false);
    }
  };

  const handleJoin = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setJoining(true);
    try {
      await joinLeague(league.id, user.username);
      setJoined(true);
      setMemberCount(c => c + 1);
      // Add current user to member circles
      const currentUserData: User = {
        username: user.username,
        createdAt: user.createdAt,
        joinedLeagues: user.joinedLeagues,
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
      };
      setMemberUsers(prev => [...prev, currentUserData]);
      updateUser({ joinedLeagues: [...(user.joinedLeagues || []), league.id] });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="px-4 pt-14 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/ligas" className="p-1.5 -ml-1.5 rounded-xl hover:bg-white/8 transition-colors">
            <ChevronLeft size={20} className="text-white/50" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-white truncate">{league.name}</h1>
            <p className="text-white/35 text-xs font-medium mt-0.5">{league.subtitle}</p>
          </div>
          {/* Info button */}
          <button
            onClick={() => setShowInfo(true)}
            className="p-2 transition-colors"
          >
            <Info size={15} className="text-white/35" />
          </button>
        </div>

        {/* Member avatars row */}
        <div className="flex items-center gap-2 min-h-[32px]">
          {memberUsers.length === 0 ? (
            <span className="text-white/20 text-xs">Nenhum membro ainda</span>
          ) : (
            <div className="flex items-center">
              {memberUsers.slice(0, 9).map((u, i) => (
                <div
                  key={u.username}
                  title={u.username}
                  className="w-8 h-8 rounded-full border-2 border-[#050714] overflow-hidden flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                  style={{
                    backgroundColor: u.avatarUrl ? undefined : u.avatarColor,
                    marginLeft: i === 0 ? 0 : '-8px',
                    zIndex: memberUsers.length - i,
                    position: 'relative',
                  }}
                >
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                    : getInitials(u.username)
                  }
                </div>
              ))}
              {memberUsers.length > 9 && (
                <div
                  className="w-8 h-8 rounded-full border-2 border-[#050714] bg-white/10 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white/50"
                  style={{ marginLeft: '-8px', position: 'relative', zIndex: 0 }}
                >
                  +{memberUsers.length - 9}
                </div>
              )}
            </div>
          )}
          {/* Accent dot */}
          <div className="flex-1 flex justify-end">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
          </div>
        </div>
      </header>

      {/* Join / Joined section */}
      {!loading && (
        <AnimatePresence mode="wait">
          {!joined ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-4 mb-4 bg-white/3 border border-white/8 rounded-2xl p-4"
            >
              {user ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-semibold">Entrar na liga</p>
                    <p className="text-white/35 text-xs mt-0.5">
                      Entrada: <span className="font-bold" style={{ color: accent }}>{league.entryFee}€</span> (pago entre amigos)
                    </p>
                  </div>
                  <motion.button
                    onClick={handleJoin}
                    disabled={joining}
                    className="text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 flex-shrink-0 disabled:opacity-50 text-black"
                    style={{ backgroundColor: accent }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {joining ? <Loader2 size={14} className="animate-spin" /> : 'Inscrever'}
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-white/45 text-sm">Entra na tua conta para participar.</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0 text-black"
                    style={{ backgroundColor: accent }}
                  >
                    <LogIn size={12} />
                    Entrar
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="joined"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-4 mb-4"
            >
              {!showLeaveConfirm ? (
                <div className="flex items-center justify-between bg-emerald-500/6 border border-emerald-500/15 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <p className="text-emerald-400/80 text-xs font-medium">Inscrito nesta liga</p>
                  </div>
                  {canLeave && (
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="flex items-center gap-1.5 text-white/25 text-xs hover:text-white/45 transition-colors"
                    >
                      <LogOut size={12} />
                      Sair
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/8 border border-red-500/20 rounded-2xl px-4 py-3.5">
                  <p className="text-white/70 text-sm font-medium mb-3">Tens a certeza que queres sair da liga?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowLeaveConfirm(false)}
                      className="flex-1 py-2 rounded-xl bg-white/6 border border-white/8 text-white/50 text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {leaving ? <Loader2 size={13} className="animate-spin" /> : 'Sair da liga'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Fantasy league */}
      {league.type === 'fantasy' ? (
        loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-white/20" />
          </div>
        ) : joined && user ? (
          <Fantasy11View league={league} username={user.username} totalMembers={memberCount} />
        ) : (
          <div className="text-center px-8 py-10 text-white/25 text-sm">
            Inscreve-te para montares o teu onze.
          </div>
        )
      ) : isSpecial ? (
        loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-white/20" />
          </div>
        ) : joined && user ? (
          <SpecialBetView league={league} username={user.username} />
        ) : (
          <div className="text-center px-8 py-10 text-white/25 text-sm">
            Inscreve-te para poderes apostar.
          </div>
        )
      ) : (
        <>
          {/* Tabs */}
          <div className="flex mx-4 bg-white/4 rounded-2xl p-1 mb-1 border border-white/6">
            {(['jogos', 'classificacao'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                }`}
              >
                {t === 'jogos' ? 'Jogos' : 'Classificação'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={22} className="animate-spin text-white/20" />
            </div>
          ) : tab === 'jogos' ? (
            joined && user ? (
              <GamesTab league={league} username={user.username} bets={bets} />
            ) : (
              <div className="text-center px-8 py-10 text-white/25 text-sm">
                Inscreve-te para poderes apostar.
              </div>
            )
          ) : (
            <LeaderboardTab
              league={league}
              currentUsername={user?.username || ''}
              totalMembers={memberCount}
              accent={accent}
            />
          )}
        </>
      )}

      {/* Info Modal */}
      <InfoModal league={showInfo ? league : null} onClose={() => setShowInfo(false)} />
    </div>
  );
}
