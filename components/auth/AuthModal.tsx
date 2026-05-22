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
      setUsername('');
    } catch {
      setError('Erro de ligação. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
          />
          <motion.div
            className="fixed inset-x-4 bottom-8 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-96 sm:-translate-x-1/2 sm:-translate-y-1/2"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="bg-[#0d1117] rounded-3xl p-6 border border-white/8">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Entrar na Liga</h2>
                  <p className="text-white/35 text-sm mt-1">Escolhe o teu nome de utilizador</p>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-2 rounded-xl hover:bg-white/8 transition-colors"
                >
                  <X size={16} className="text-white/35" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="nome_utilizador"
                    className="w-full bg-[#161b27] border border-white/8 rounded-2xl pl-10 pr-4 py-3.5
                               text-white placeholder:text-white/20 focus:outline-none focus:border-white/20
                               transition-all text-sm"
                    autoFocus
                    disabled={loading}
                    maxLength={20}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400/80 text-xs bg-red-500/8 rounded-xl px-3 py-2.5 border border-red-500/15"
                  >
                    <AlertCircle size={13} />
                    {error}
                  </motion.div>
                )}

                <p className="text-white/25 text-xs text-center px-2 leading-relaxed">
                  Nome existente recupera os teus dados. Nome novo cria conta automaticamente.
                </p>

                <motion.button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm text-black
                             bg-gold-gradient disabled:opacity-35 flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> A entrar...</>
                    : 'Continuar'
                  }
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
