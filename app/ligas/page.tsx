'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Info } from 'lucide-react';
import { LEAGUES } from '@/data/leagues';
import LeagueCard from '@/components/leagues/LeagueCard';
import { useAuthContext } from '@/components/auth/AuthContext';
import { getLeagueMembers } from '@/lib/firestore';

export default function LigasPage() {
  const { user, setShowAuthModal } = useAuthContext();
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const counts: Record<string, number> = {};
      await Promise.all(
        LEAGUES.map(async l => {
          const members = await getLeagueMembers(l.id);
          counts[l.id] = members.length;
        })
      );
      setMemberCounts(counts);
    }
    loadCounts();
  }, []);

  const generalLeagues = LEAGUES.filter(l => l.id === 'fase-grupos' || l.id === 'fase-copa');
  const extraLeagues = LEAGUES.filter(l => l.id.startsWith('extra'));

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="px-4 pt-12 pb-5">
        <h1 className="text-2xl font-black text-white">Ligas 🏆</h1>
        <p className="text-white/40 text-sm mt-1">Escolhe uma liga para apostar</p>
      </header>

      {/* Not logged in banner */}
      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mb-5 bg-gold/8 border border-gold/15 rounded-2xl p-4 flex items-center gap-3"
        >
          <Info size={16} className="text-gold flex-shrink-0" />
          <p className="text-white/60 text-xs flex-1">
            Entra na tua conta para te inscrever e apostar nas ligas.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gold-gradient text-black text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0 flex items-center gap-1"
          >
            <LogIn size={12} /> Entrar
          </button>
        </motion.div>
      )}

      {/* Prize pool info */}
      <div className="mx-4 mb-5 bg-white/3 border border-white/8 rounded-2xl p-4">
        <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wider">Como funciona</p>
        <div className="space-y-1.5">
          <p className="text-white/60 text-xs">💰 <span className="text-white/80">10€</span> de entrada por liga</p>
          <p className="text-white/60 text-xs">🎯 Resultado exacto: <span className="text-gold font-bold">3 pontos</span></p>
          <p className="text-white/60 text-xs">✅ 1X2 correcto: <span className="text-gold font-bold">1 ponto</span></p>
          <p className="text-white/60 text-xs">🏆 Prémio: 60% / 30% / 10% do poço</p>
        </div>
      </div>

      {/* General leagues */}
      <section className="px-4 mb-6">
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
          Ligas Gerais
        </h2>
        <div className="space-y-3">
          {generalLeagues.map((l, i) => (
            <LeagueCard
              key={l.id}
              league={l}
              memberCount={memberCounts[l.id] || 0}
              isJoined={user?.joinedLeagues.includes(l.id) || false}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Extra leagues */}
      <section className="px-4 mb-6">
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
          Ligas Extra
        </h2>
        <div className="space-y-3">
          {extraLeagues.map((l, i) => (
            <LeagueCard
              key={l.id}
              league={l}
              memberCount={memberCounts[l.id] || 0}
              isJoined={user?.joinedLeagues.includes(l.id) || false}
              index={i + 2}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
