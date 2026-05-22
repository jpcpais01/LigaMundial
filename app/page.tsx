'use client';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import HeroLiveMatch from '@/components/home/HeroLiveMatch';
import NewsSection from '@/components/home/NewsSection';
import { getInitials } from '@/lib/utils';

export default function HomePage() {
  const { user, loading, setShowAuthModal } = useAuthContext();

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-14 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">LigaMundial</h1>
          <p className="text-white/30 text-xs mt-0.5 font-medium tracking-wide">FIFA World Cup 2026</p>
        </div>

        {!loading && (
          user ? (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white cursor-pointer"
              style={{ backgroundColor: user.avatarColor }}
            >
              {getInitials(user.username)}
            </div>
          ) : (
            <motion.button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 border border-white/15 text-white/70
                         text-xs font-medium px-3.5 py-2 rounded-xl bg-white/4 hover:bg-white/8 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={13} />
              Entrar
            </motion.button>
          )
        )}
      </header>

      {/* Tournament countdown */}
      <TournamentBanner />

      {/* Live / Next match */}
      <section className="mt-3">
        <div className="px-4 mb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
            Jogo em Destaque
          </p>
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mx-4 mb-2"
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/6 px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0c1a3a 0%, #050714 100%)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.015) 20px, rgba(255,255,255,0.015) 21px)`,
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/25 mb-0.5">
            Início do Torneio
          </p>
          <p className="text-white font-semibold text-sm">11 Jun · Estadio Azteca</p>
        </div>
        <div className="relative text-right">
          <p className="text-4xl font-black tracking-tight" style={{ color: '#fbbf24' }}>
            {diffDays}
          </p>
          <p className="text-white/25 text-[10px] font-medium uppercase tracking-wider">dias</p>
        </div>
      </div>
    </motion.div>
  );
}
