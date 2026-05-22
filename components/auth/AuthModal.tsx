'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuthContext } from './AuthContext';
import { getOrCreateUser } from '@/lib/firestore';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useAuthContext();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmed || trimmed.length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setError('Apenas letras, números e underscore (_).');
      return;
    }
    setLoading(true); setError('');
    try {
      const user = await getOrCreateUser(trimmed);
      login(user);
      setShowAuthModal(false);
    } catch (err) {
      setError('Erro de ligação. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 bottom-8 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-96 sm:-translate-x-1/2 sm:-translate-y-1/2"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="glass-card rounded-3xl p-6 border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Entrar na Liga</h2>
                  <p className="text-sm text-white/50 mt-0.5">Escolhe o teu nome de utilizador</p>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              {/* Ball emoji */}
              <div className="text-center mb-6">
                <span className="text-5xl">⚽</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="nome_utilizador"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5
                               text-white placeholder:text-white/25 focus:outline-none focus:border-gold/50
                               focus:bg-white/8 transition-all text-sm"
                    autoFocus
                    disabled={loading}
                    maxLength={20}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2.5"
                  >
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}

                <p className="text-xs text-white/35 text-center px-2">
                  Se já tens conta, o teu nome irá recuperar os teus dados. Caso contrário, será criada uma conta nova.
                </p>

                <motion.button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm text-black
                             bg-gold-gradient disabled:opacity-40 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 transition-opacity"
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> A entrar...</> : '🏆 Entrar'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
