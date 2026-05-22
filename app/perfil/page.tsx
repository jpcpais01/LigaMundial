'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, ChevronRight, LogIn, Camera, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import { LEAGUES } from '@/data/leagues';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateUserDoc } from '@/lib/firestore';

const ACCENT: Record<string, string> = {
  'fase-grupos':    '#3b82f6',
  'fase-copa':      '#a78bfa',
  'extra-jornadas': '#34d399',
  'extra-campeao':  '#fbbf24',
  'extra-marcador': '#fb7185',
};

export default function PerfilPage() {
  const { user, logout, setShowAuthModal, updateUser } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setUploadError(false);
    try {
      const storageRef = ref(storage, `avatars/${user.username}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateUserDoc(user.username, { avatarUrl: url });
      updateUser({ avatarUrl: url });
    } catch (err) {
      console.error('Avatar upload failed', err);
      setUploadError(true);
      setTimeout(() => setUploadError(false), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-5 px-8">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
          <LogIn size={22} className="text-white/25" />
        </div>
        <div className="text-center">
          <h2 className="text-white font-bold text-xl tracking-tight">O teu Perfil</h2>
          <p className="text-white/35 text-sm mt-2 leading-relaxed">
            Entra na tua conta para ver as tuas estatísticas e ligas.
          </p>
        </div>
        <motion.button
          onClick={() => setShowAuthModal(true)}
          className="bg-gold-gradient text-black font-semibold px-6 py-3 rounded-2xl text-sm"
          whileTap={{ scale: 0.95 }}
        >
          Entrar
        </motion.button>
      </div>
    );
  }

  const joinedLeagues = LEAGUES.filter(l => user.joinedLeagues.includes(l.id));

  return (
    <div className="min-h-dvh">
      <header className="px-4 pt-14 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">Perfil</h1>
      </header>

      {/* Avatar card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 border border-white/6 bg-white/3 rounded-3xl p-6 flex items-center gap-4 mb-6"
      >
        {/* Avatar with camera overlay */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-16 h-16 rounded-2xl overflow-hidden"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-xl font-black"
                style={{ backgroundColor: user.avatarColor }}
              >
                {getInitials(user.username)}
              </div>
            )}
            {/* Overlay — always visible on mobile (no hover) */}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              {uploading
                ? <Loader2 size={16} className="text-white animate-spin" />
                : <Camera size={15} className="text-white/80" />
              }
            </div>
          </button>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h2 className="text-white font-black text-xl tracking-tight">{user.username}</h2>
          <p className="text-white/30 text-xs mt-0.5">
            Membro desde {new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </p>
          {uploadError
            ? <p className="text-red-400 text-[10px] mt-1">Erro ao fazer upload. Verifica as regras do Storage.</p>
            : <p className="text-white/20 text-[10px] mt-1">Toca no avatar para mudar a foto</p>
          }
        </div>
      </motion.div>

      {/* Joined leagues */}
      {joinedLeagues.length > 0 && (
        <section className="px-4 mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/25 mb-3">
            As minhas ligas ({joinedLeagues.length})
          </p>
          <div className="space-y-2">
            {joinedLeagues.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/ligas/${l.id}`}>
                  <div className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ACCENT[l.id] || '#fff' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{l.name}</p>
                      <p className="text-white/30 text-xs">{l.entryFee}€ · {l.subtitle}</p>
                    </div>
                    <ChevronRight size={15} className="text-white/20" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {joinedLeagues.length === 0 && (
        <div className="mx-4 mb-5 text-center py-8 text-white/20 text-sm">
          Ainda não te inscreveste em nenhuma liga.{' '}
          <Link href="/ligas" className="text-white/40 underline">Ver ligas</Link>
        </div>
      )}

      {/* Logout */}
      <div className="px-4">
        <motion.button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-white/3 border border-white/6
                     rounded-2xl py-3.5 text-white/35 text-sm font-medium hover:bg-white/6 transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={15} />
          Terminar sessão
        </motion.button>
      </div>
    </div>
  );
}
