'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Loader2, CheckCircle, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLeague } from '@/data/leagues';
import { useAuthContext } from '@/components/auth/AuthContext';
import { joinLeague, isLeagueMember, getLeagueMembers } from '@/lib/firestore';
import { getUserBetsForLeague } from '@/lib/firestore';
import GamesTab from '@/components/leagues/GamesTab';
import LeaderboardTab from '@/components/leagues/LeaderboardTab';
import SpecialBetView from '@/components/leagues/SpecialBetView';
import type { Bet } from '@/types';

type Tab = 'jogos' | 'classificacao';

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const league = getLeague(id);
  const router = useRouter();
  const { user, setShowAuthModal } = useAuthContext();

  const [tab, setTab] = useState<Tab>('jogos');
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!league) return;
    async function init() {
      setLoading(true);
      const [members] = await Promise.all([getLeagueMembers(league!.id)]);
      setMemberCount(members.length);
      if (user) {
        const memberSnap = members.find(m => m.username === user.username);
        setJoined(!!memberSnap);
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
        <p className="text-white/40">Liga não encontrada</p>
        <Link href="/ligas" className="text-gold text-sm">← Voltar</Link>
      </div>
    );
  }

  const isSpecial = league.type === 'champion' || league.type === 'scorer';
  const prizePool = memberCount * league.entryFee;

  const handleJoin = async () => {
    if (!user) { setShowAuthModal(true); return; }
    setJoining(true);
    try {
      await joinLeague(league.id, user.username);
      setJoined(true);
      setMemberCount(c => c + 1);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/ligas" className="p-2 -ml-2 rounded-xl hover:bg-white/8 transition-colors">
            <ChevronLeft size={22} className="text-white/60" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white truncate">{league.name}</h1>
            <p className="text-white/40 text-xs">{league.subtitle}</p>
          </div>
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${league.color} flex items-center justify-center text-2xl flex-shrink-0`}>
            {league.icon}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-2 border border-white/8">
            <Users size={12} className="text-white/40" />
            <span className="text-white/60 text-xs">{memberCount} jogadores</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-2 border border-white/8">
            <span className="text-gold text-xs font-bold">💰 {prizePool}€</span>
            <span className="text-white/30 text-xs">em prémios</span>
          </div>
        </div>
      </header>

      {/* Join section */}
      {!loading && (
        <AnimatePresence>
          {!joined ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-4 mb-4 bg-white/4 border border-white/10 rounded-2xl p-4"
            >
              {user ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-sm font-semibold">Entrar na liga</p>
                    <p className="text-white/40 text-xs mt-0.5">Entrada: <span className="text-gold font-bold">{league.entryFee}€</span> (pago entre amigos)</p>
                  </div>
                  <motion.button
                    onClick={handleJoin}
                    disabled={joining}
                    className="bg-gold-gradient text-black text-sm font-bold px-4 py-2.5 rounded-xl
                               flex items-center gap-2 flex-shrink-0 disabled:opacity-60"
                    whileTap={{ scale: 0.95 }}
                  >
                    {joining ? <Loader2 size={14} className="animate-spin" /> : '🏆 Inscrever'}
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-white/50 text-sm">Entra na tua conta para participar.</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gold-gradient text-black text-xs font-bold px-3 py-2 rounded-xl
                               flex items-center gap-1.5 flex-shrink-0"
                  >
                    <LogIn size={12} /> Entrar
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-4 mb-4 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3
                         flex items-center gap-2"
            >
              <CheckCircle size={14} className="text-green-400" />
              <p className="text-green-400 text-xs font-medium">Inscrito nesta liga</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Special leagues (champion/scorer) */}
      {isSpecial ? (
        loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-white/30" /></div>
        ) : joined && user ? (
          <SpecialBetView league={league} username={user.username} />
        ) : !joined ? (
          <div className="text-center px-8 py-10 text-white/30 text-sm">
            Inscreve-te para poderes apostar.
          </div>
        ) : null
      ) : (
        /* Regular leagues: tabs */
        <>
          {/* Tabs */}
          <div className="flex mx-4 bg-white/5 rounded-2xl p-1 mb-4">
            {(['jogos', 'classificacao'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? 'bg-white/10 text-white' : 'text-white/35'
                }`}
              >
                {t === 'jogos' ? '⚽ Jogos' : '🏆 Classificação'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-white/30" />
            </div>
          ) : tab === 'jogos' ? (
            joined && user ? (
              <GamesTab league={league} username={user.username} bets={bets} />
            ) : (
              <div className="text-center px-8 py-10 text-white/30 text-sm">
                Inscreve-te para poderes apostar.
              </div>
            )
          ) : (
            <LeaderboardTab
              league={league}
              currentUsername={user?.username || ''}
              totalMembers={memberCount}
            />
          )}
        </>
      )}
    </div>
  );
}
