'use client';
import { motion } from 'framer-motion';
import { Bell, LogIn, LogOut } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import HeroLiveMatch from '@/components/home/HeroLiveMatch';
import NewsSection from '@/components/home/NewsSection';
import { getInitials } from '@/lib/utils';

export default function HomePage() {
  const { user, loading, logout, setShowAuthModal } = useAuthContext();

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <h1 className="text-xl font-black text-gold-gradient">LigaMundial</h1>
          </div>
          <p className="text-white/30 text-xs mt-0.5">FIFA World Cup 2026</p>
        </div>

        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                    style={{ backgroundColor: user.avatarColor }}
                    onClick={() => {/* navigate to profile */}}
                  >
                    {getInitials(user.username)}
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 bg-gold/15 border border-gold/25 text-gold
                             text-xs font-semibold px-3 py-2 rounded-xl"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn size={13} />
                  Entrar
                </motion.button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Welcome if not logged in */}
      {!loading && !user && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 bg-gradient-to-r from-gold/10 to-yellow-800/10 border border-gold/15
                     rounded-2xl p-4 flex items-center justify-between gap-3"
        >
          <div>
            <p className="text-gold text-sm font-bold">Bem-vindo ao LigaMundial! 🏆</p>
            <p className="text-white/40 text-xs mt-0.5">Entra para apostar e competir.</p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gold-gradient text-black text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0"
          >
            Entrar
          </button>
        </motion.div>
      )}

      {/* Welcome back */}
      {!loading && user && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-4"
        >
          <p className="text-white/60 text-sm">
            Olá, <span className="text-white font-semibold">{user.username}</span> 👋
          </p>
        </motion.div>
      )}

      {/* Tournament countdown */}
      <TournamentBanner />

      {/* Live / Next match hero */}
      <section className="mt-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-sm font-bold text-white/80">Jogo em Destaque</h2>
        </div>
        <HeroLiveMatch />
      </section>

      {/* News */}
      <NewsSection />
    </div>
  );
}

function TournamentBanner() {
  const tournamentStart = new Date('2026-06-11T20:00:00-06:00');
  const now = new Date();
  const diffMs = tournamentStart.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="mx-4 mb-2 relative rounded-2xl overflow-hidden border border-white/8"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-blue-900/40 to-purple-900/50" />
      <div className="relative flex items-center justify-between p-4">
        <div>
          <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">Mundial 2026</p>
          <p className="text-white font-bold text-sm mt-0.5">Arranca em <span className="text-gold">{diffDays} dias</span></p>
          <p className="text-white/35 text-xs">11 Jun • Estadio Azteca</p>
        </div>
        <div className="text-right">
          <span className="text-5xl font-black text-gold-gradient">{diffDays}</span>
          <p className="text-white/30 text-[10px]">dias</p>
        </div>
      </div>
    </motion.div>
  );
}
