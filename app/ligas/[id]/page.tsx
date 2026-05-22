'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Loader2, CheckCircle, LogIn, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLeague } from '@/data/leagues';
import { useAuthContext } from '@/components/auth/AuthContext';
import { joinLeague, getLeagueMembers, getUserBetsForLeague } from '@/lib/firestore';
import GamesTab from '@/components/leagues/GamesTab';
import LeaderboardTab from '@/components/leagues/LeaderboardTab';
import SpecialBetView from '@/components/leagues/SpecialBetView';
import InfoModal from '@/components/leagues/InfoModal';
import type { Bet } from '@/types';

type Tab = 'jogos' | 'classificacao';

const ACCENT: Record<string, string> = {
  'fase-grupos':    '#3b82f6',
  'fase-copa':      '#a78bfa',
  'extra-jornadas': '#34d399',
  'extra-campeao':  '#fbbf24',
  'extra-marcador': '#fb7185',
};

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const league = getLeague(id);
  const { user, setShowAuthModal } = useAuthContext();

  const [tab, setTab] = useState<Tab>('jogos');
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const accent = ACCENT[id] || '#3b82f6';

  useEffect(() => {
    if (!league) return;
    async function init() {
      setLoading(true);
      const members = await getLeagueMembers(league!.id);
      setMemberCount(members.length);
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
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/8"
          >
            <Info size={15} className="text-white/40" />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/4 rounded-xl px-3 py-2 border border-white/6">
            <Users size={11} className="text-white/30" />
            <span className="text-white/50 text-xs">{memberCount} jogadores</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/4 rounded-xl px-3 py-2 border border-white/6">
            <span className="text-white/50 text-xs">{prizePool}€ em prémios</span>
          </div>
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
              className="mx-4 mb-4 flex items-center gap-2.5 bg-emerald-500/6 border border-emerald-500/15 rounded-2xl px-4 py-3"
            >
              <CheckCircle size={14} className="text-emerald-400" />
              <p className="text-emerald-400/80 text-xs font-medium">Inscrito nesta liga</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Special leagues */}
      {isSpecial ? (
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
            />
          )}
        </>
      )}

      {/* Info Modal */}
      <InfoModal league={showInfo ? league : null} onClose={() => setShowInfo(false)} />
    </div>
  );
}
