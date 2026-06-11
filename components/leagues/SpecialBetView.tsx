'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Search, Lock } from 'lucide-react';
import { TEAMS_LIST } from '@/data/teams';
import { saveSpecialBet, getSpecialBet } from '@/lib/firestore';
import { isSpecialBettingOpen, formatMatchDate } from '@/lib/utils';
import { TOURNAMENT_START } from '@/data/matches';
import type { League, SpecialBet } from '@/types';

interface SpecialBetViewProps {
  league: League;
  username: string;
}

export default function SpecialBetView({ league, username }: SpecialBetViewProps) {
  const [existing, setExisting] = useState<SpecialBet | null>(null);
  const [selected, setSelected] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isChampion = league.id === 'extra-campeao';
  // Apostas especiais fecham 5 min antes do primeiro jogo do torneio
  const bettingOpen = isSpecialBettingOpen();

  useEffect(() => {
    getSpecialBet(league.id as any, username).then(b => {
      if (b) {
        setExisting(b);
        if (isChampion) setSelected(b.prediction);
        else setPlayerName(b.prediction);
      }
      setLoading(false);
    });
  }, [league.id, username, isChampion]);

  const handleSave = async () => {
    const prediction = isChampion ? selected : playerName.trim();
    if (!prediction || !isSpecialBettingOpen()) return;
    setSaving(true);
    try {
      await saveSpecialBet({ username, leagueId: league.id as any, prediction });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const filteredTeams = TEAMS_LIST.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.shortName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-white/30" /></div>;
  }

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="text-center py-6">
        <span className="text-6xl">{league.icon}</span>
        <h2 className="text-white font-bold text-xl mt-3">{league.name}</h2>
        <p className="text-white/50 text-sm mt-1 px-4">{league.description}</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-bold
                        px-4 py-1.5 rounded-full border border-gold/20">
          🏆 100% do prémio para o(s) vencedor(es)
        </div>
        {bettingOpen && (
          <p className="text-white/25 text-xs mt-3">
            Apostas abertas até 5 min antes do primeiro jogo do torneio · {formatMatchDate(TOURNAMENT_START)}
          </p>
        )}
      </div>

      {existing && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-green-400 text-xs font-semibold mb-1">✅ A tua aposta actual</p>
          {isChampion ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{TEAMS_LIST.find(t => t.id === existing.prediction)?.flag || '🏳️'}</span>
              <span className="text-white font-bold">{TEAMS_LIST.find(t => t.id === existing.prediction)?.name || existing.prediction}</span>
            </div>
          ) : (
            <p className="text-white font-bold">⚽ {existing.prediction}</p>
          )}
        </div>
      )}

      {!bettingOpen ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Lock size={20} className="text-white/20" />
          <p className="text-white/40 text-sm">
            Apostas fechadas — encerraram 5 minutos antes do primeiro jogo do torneio ({formatMatchDate(TOURNAMENT_START)}).
          </p>
          {!existing && (
            <p className="text-white/25 text-xs">Não registaste nenhuma aposta nesta liga.</p>
          )}
        </div>
      ) : isChampion ? (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Pesquisar selecção..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5
                         text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold/40"
            />
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
            {filteredTeams.map(team => (
              <button
                key={team.id}
                onClick={() => setSelected(team.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  selected === team.id
                    ? 'bg-gold/15 border-gold/40 shadow-glow-sm'
                    : 'bg-white/3 border-white/8 hover:bg-white/8'
                }`}
              >
                <span className="text-2xl">{team.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${selected === team.id ? 'text-gold' : 'text-white'}`}>
                    {team.shortName}
                  </p>
                  <p className="text-white/30 text-[10px] truncate">{team.name}</p>
                </div>
                {selected === team.id && <Check size={14} className="text-gold flex-shrink-0" />}
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Scorer input */
        <div className="space-y-3">
          <label className="text-white/50 text-xs font-medium uppercase tracking-wider block">
            Nome do jogador
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="ex: Cristiano Ronaldo"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5
                       text-white placeholder:text-white/25 focus:outline-none focus:border-gold/50
                       transition-all text-sm"
          />
          <p className="text-white/25 text-xs">Inclui o nome completo ou como é conhecido.</p>
        </div>
      )}

      {/* Save button */}
      {bettingOpen && (
      <motion.button
        onClick={handleSave}
        disabled={saving || (!selected && !playerName.trim())}
        className={`w-full mt-5 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
                    transition-all ${
                      saved
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gold-gradient text-black disabled:opacity-40'
                    }`}
        whileTap={{ scale: 0.97 }}
      >
        {saved ? (
          <><Check size={16} /> Aposta guardada!</>
        ) : saving ? (
          <><Loader2 size={16} className="animate-spin" /> A guardar...</>
        ) : (
          `${existing ? '✏️ Alterar aposta' : '💰 Confirmar aposta'}`
        )}
      </motion.button>
      )}
    </div>
  );
}
