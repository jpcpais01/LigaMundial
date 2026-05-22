'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import { ALL_MATCHES } from '@/data/matches';
import { getTeam } from '@/data/teams';
import { setMatchResult } from '@/lib/firestore';
import { formatMatchDate } from '@/lib/utils';
import type { Match } from '@/types';

export default function AdminPage() {
  const { user, isAdmin } = useAuthContext();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-8">
        <Lock size={40} className="text-white/20" />
        <p className="text-white/40 text-center text-sm">
          Acesso restrito a administradores.
        </p>
      </div>
    );
  }

  const filteredMatches = ALL_MATCHES.filter(m => {
    const h = getTeam(m.homeTeamId);
    const a = getTeam(m.awayTeamId);
    const q = search.toLowerCase();
    return !q || h.name.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) ||
      h.shortName.toLowerCase().includes(q) || a.shortName.toLowerCase().includes(q);
  }).slice(0, 30);

  const handleSave = async () => {
    if (!selected) return;
    const h = parseInt(homeScore);
    const a = parseInt(awayScore);
    if (isNaN(h) || isNaN(a)) return;
    setSaving(true);
    try {
      await setMatchResult({
        matchId: selected.id,
        homeScore: h,
        awayScore: a,
        setAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh px-4 pt-12 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck size={24} className="text-gold" />
        <div>
          <h1 className="text-xl font-black text-white">Painel Admin</h1>
          <p className="text-white/40 text-xs">Inserir resultados dos jogos</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Pesquisar jogo..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white
                   placeholder:text-white/25 focus:outline-none focus:border-gold/40 mb-4 text-sm"
      />

      {/* Match selector */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto mb-6">
        {filteredMatches.map(m => {
          const h = getTeam(m.homeTeamId);
          const a = getTeam(m.awayTeamId);
          const isSelected = selected?.id === m.id;
          if (m.homeTeamId === 'TBD') return null;
          return (
            <button
              key={m.id}
              onClick={() => { setSelected(m); setHomeScore(''); setAwayScore(''); setSaved(false); }}
              className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all border ${
                isSelected ? 'bg-gold/15 border-gold/30' : 'bg-white/3 border-white/6'
              }`}
            >
              <span className="text-lg">{h.flag}</span>
              <span className={`text-xs font-medium flex-1 truncate ${isSelected ? 'text-gold' : 'text-white/70'}`}>
                {h.shortName} vs {a.shortName}
              </span>
              <span className="text-lg">{a.flag}</span>
              <span className="text-white/25 text-[10px] w-24 text-right flex-shrink-0">{formatMatchDate(m.scheduledAt)}</span>
            </button>
          );
        })}
      </div>

      {/* Result input */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/4 border border-white/10 rounded-2xl p-5"
        >
          <p className="text-white/50 text-xs mb-4 text-center">
            {getTeam(selected.homeTeamId).name} vs {getTeam(selected.awayTeamId).name}
          </p>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex flex-col items-center flex-1 gap-2">
              <span className="text-3xl">{getTeam(selected.homeTeamId).flag}</span>
              <input
                type="number" min="0" max="20"
                value={homeScore}
                onChange={e => setHomeScore(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl text-center text-white
                           text-2xl font-bold py-3 focus:outline-none focus:border-gold/50
                           [appearance:textfield]"
              />
            </div>
            <span className="text-white/20 text-2xl">-</span>
            <div className="flex flex-col items-center flex-1 gap-2">
              <span className="text-3xl">{getTeam(selected.awayTeamId).flag}</span>
              <input
                type="number" min="0" max="20"
                value={awayScore}
                onChange={e => setAwayScore(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl text-center text-white
                           text-2xl font-bold py-3 focus:outline-none focus:border-gold/50
                           [appearance:textfield]"
              />
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saving || homeScore === '' || awayScore === ''}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${
              saved ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gold-gradient text-black disabled:opacity-40'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {saved ? <><Check size={16} /> Resultado guardado!</>
              : saving ? <><Loader2 size={16} className="animate-spin" /> A guardar...</>
              : '💾 Guardar resultado'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
