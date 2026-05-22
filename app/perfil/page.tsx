'use client';
import { motion } from 'framer-motion';
import { LogOut, Trophy, LogIn } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import { LEAGUES } from '@/data/leagues';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';

export default function PerfilPage() {
  const { user, logout, setShowAuthModal } = useAuthContext();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-8">
        <span className="text-6xl">👤</span>
        <h2 className="text-white font-bold text-xl">O teu Perfil</h2>
        <p className="text-white/40 text-sm text-center">
          Entra na tua conta para ver as tuas estatísticas e ligas.
        </p>
        <motion.button
          onClick={() => setShowAuthModal(true)}
          className="bg-gold-gradient text-black font-bold px-6 py-3 rounded-2xl flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <LogIn size={16} /> Entrar
        </motion.button>
      </div>
    );
  }

  const joinedLeagues = LEAGUES.filter(l => user.joinedLeagues.includes(l.id));

  return (
    <div className="min-h-dvh">
      <header className="px-4 pt-12 pb-5">
        <h1 className="text-2xl font-black text-white">Perfil 👤</h1>
      </header>

      {/* Avatar + username */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 glass-card border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-3 mb-5"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black"
          style={{ backgroundColor: user.avatarColor }}
        >
          {getInitials(user.username)}
        </div>
        <div className="text-center">
          <h2 className="text-white font-black text-xl">{user.username}</h2>
          <p className="text-white/35 text-xs mt-0.5">Membro desde {new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</p>
        </div>
      </motion.div>

      {/* Joined leagues */}
      {joinedLeagues.length > 0 && (
        <section className="px-4 mb-5">
          <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
            As minhas ligas ({joinedLeagues.length})
          </h2>
          <div className="space-y-2">
            {joinedLeagues.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/ligas/${l.id}`}>
                  <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-2xl p-3.5
                                  active:scale-98 transition-transform">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center text-lg`}>
                      {l.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{l.name}</p>
                      <p className="text-white/35 text-xs">{l.entryFee}€ · {l.subtitle}</p>
                    </div>
                    <Trophy size={14} className="text-gold/50" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {joinedLeagues.length === 0 && (
        <div className="mx-4 mb-5 text-center py-8 text-white/25 text-sm">
          Ainda não te inscreveste em nenhuma liga.{' '}
          <Link href="/ligas" className="text-gold underline">Ver ligas →</Link>
        </div>
      )}

      {/* Logout */}
      <div className="px-4">
        <motion.button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-white/4 border border-white/8
                     rounded-2xl py-3.5 text-white/50 text-sm font-medium"
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={16} />
          Terminar sessão
        </motion.button>
      </div>
    </div>
  );
}
