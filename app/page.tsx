'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import HeroLiveMatch from '@/components/home/HeroLiveMatch';
import NewsSection from '@/components/home/NewsSection';
import { getInitials } from '@/lib/utils';

export default function HomePage() {
  const { user, loading, setShowAuthModal } = useAuthContext();

  // Prevent body scroll on homepage
  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => { document.body.style.overflowY = ''; };
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
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

