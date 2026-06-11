'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthContext';
import HeroLiveMatch from '@/components/home/HeroLiveMatch';
import NewsSection from '@/components/home/NewsSection';
import UpcomingMatches from '@/components/home/UpcomingMatches';
import { getInitials } from '@/lib/utils';
import { TOURNAMENT_START } from '@/data/matches';

const TOURNAMENT_DAYS = 39; // 11 Jun – 19 Jul

export default function HomePage() {
  const { user, loading, setShowAuthModal } = useAuthContext();
  const [subtitle, setSubtitle] = useState('FIFA World Cup 2026');

  // Calculado no cliente para evitar divergência de hidratação à meia-noite
  useEffect(() => {
    const day = Math.floor((Date.now() - new Date(TOURNAMENT_START).getTime()) / 86_400_000) + 1;
    if (day >= 1 && day <= TOURNAMENT_DAYS) setSubtitle(`Mundial 2026 · Dia ${day}`);
  }, []);

  return (
    <div className="pb-4">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">LigaMundial</h1>
          <p className="text-white/30 text-xs mt-0.5 font-medium tracking-wide">{subtitle}</p>
        </div>

        {!loading && (
          user ? (
            <Link href="/perfil" className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-[13px] font-bold text-white"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {getInitials(user.username)}
                </div>
              )}
            </Link>
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

      {/* Live / Next match hero — o título da secção vive dentro do componente */}
      <section className="mt-1">
        <HeroLiveMatch />
      </section>

      {/* News */}
      <NewsSection />

      {/* Next 10 matches */}
      <UpcomingMatches />
    </div>
  );
}
