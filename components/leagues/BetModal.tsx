'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Loader2, Check, Lock } from 'lucide-react';
import { getTeam } from '@/data/teams';
import { formatMatchDate, isBettingOpen, getOutcomeStr } from '@/lib/utils';
import { saveBet, getBet } from '@/lib/firestore';
import { getOutcomeFromScore } from '@/lib/scoring';
import type { Match, Outcome, Bet } from '@/types';

interface BetModalProps {
  match: Match | null;
  leagueId: string;
  username: string;
  onClose: () => void;
}

type OutcomePick = Outcome | null;

export default function BetModal({ match, leagueId, username, onClose }: BetModalProps) {
  const [exactHome, setExactHome] = useState('');
  const [exactAway, setExactAway] = useState('');
  const [outcome, setOutcome] = useState<OutcomePick>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);

  const open = !!match;
  const bettingOpen = match ? isBettingOpen(match.scheduledAt) : false;

  useEffect(() => {
    if (!match) return;
    setLoading(true);
    getBet(leagueId, match.id, username).then(b => {
      if (b) {
        setExisting(b);
        setExactHome(b.exactHome !== null ? String(b.exactHome) : '');
        setExactAway(b.exactAway !== null ? String(b.exactAway) : '');
        setOutcome(b.outcome);
      } else {
        setExisting(null);
        setExactHome(''); setExactAway(''); setOutcome(null);
      }
      setLoading(false);
      setSaved(false);
    });
  }, [match, leagueId, username]);

  // Auto-set 1x2 from exact score
  useEffect(() => {
    const h = parseInt(exactHome);
    const a = parseInt(exactAway);
    if (!isNaN(h) && !isNaN(a)) {
      setOutcome(getOutcomeFromScore(h, a));
    }
  }, [exactHome, exactAway]);

  const handleSave = async () => {
    if (!match || !outcome) return;
    setSaving(true);
    try {
      await saveBet({
        username, leagueId, matchId: match.id,
        exactHome: exactHome !== '' ? parseInt(exactHome) : null,
        exactAway: exactAway !== '' ? parseInt(exactAway) : null,
        outcome,
      });
      setSaved(true);
      setTimeout(onClose, 800);
    } finally {
      setSaving(false);
    }
  };

  if (!match) return null;
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="glass-card rounded-t-3xl border-t border-x border-white/10 p-5 pb-10 max-h-[85vh] overflow-y-auto">
              {/* Handle */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-white/40 text-xs mb-1">
                    {match.group ? `Grupo ${match.group} · Jornada ${match.round}` : match.phase.toUpperCase()}
                  </p>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <MapPin size={11} /> {match.city}
                    <Clock size={11} className="ml-1" /> {formatMatchDate(match.scheduledAt)}
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <X size={18} className="text-white/40" />
                </button>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-5xl">{home.flag}</span>
                  <p className="text-white font-bold text-sm">{home.shortName}</p>
                </div>
                {(match.status !== 'scheduled') && match.homeScore !== undefined ? (
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-3xl font-black text-white">{match.homeScore}</span>
                    <span className="text-white/30">-</span>
                    <span className="text-3xl font-black text-white">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-white/20 font-bold text-xl px-4">VS</span>
                )}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-5xl">{away.flag}</span>
                  <p className="text-white font-bold text-sm">{away.shortName}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-white/40" />
                </div>
              ) : !bettingOpen ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <Lock size={20} className="text-white/30" />
                  <p className="text-white/40 text-sm">As apostas estão fechadas para este jogo.</p>
                  {existing && (
                    <div className="mt-3 bg-white/5 rounded-2xl p-4 w-full">
                      <p className="text-white/40 text-xs mb-2">A tua aposta</p>
                      <div className="flex items-center justify-center gap-3">
                        {existing.exactHome !== null && (
                          <span className="text-white font-bold text-lg">
                            {existing.exactHome} – {existing.exactAway}
                          </span>
                        )}
                        <OutcomeBadge outcome={existing.outcome} home={home.shortName} away={away.shortName} />
                      </div>
                      {existing.points !== null && (
                        <p className="text-gold font-bold text-center mt-2">+{existing.points} pts</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Resultado Exacto */}
                  <div>
                    <p className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
                      Resultado Exacto <span className="text-gold/80 normal-case">(+3 pts)</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number" min="0" max="20"
                        value={exactHome}
                        onChange={e => setExactHome(e.target.value)}
                        placeholder="–"
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl text-center text-white
                                   text-2xl font-bold py-3 focus:outline-none focus:border-gold/50 focus:bg-white/8
                                   transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-white/30 text-xl font-light">-</span>
                      <input
                        type="number" min="0" max="20"
                        value={exactAway}
                        onChange={e => setExactAway(e.target.value)}
                        placeholder="–"
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl text-center text-white
                                   text-2xl font-bold py-3 focus:outline-none focus:border-gold/50 focus:bg-white/8
                                   transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* 1X2 */}
                  <div>
                    <p className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">
                      1X2 <span className="text-gold/80 normal-case">(+1 pt)</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['home', 'draw', 'away'] as Outcome[]).map(o => (
                        <button
                          key={o}
                          onClick={() => setOutcome(o)}
                          className={`py-3 rounded-2xl text-sm font-bold transition-all ${
                            outcome === o
                              ? 'bg-gold text-black shadow-glow'
                              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {o === 'home' ? `1 ${home.flag}` : o === 'draw' ? 'X' : `2 ${away.flag}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save button */}
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || !outcome || saved}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
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
                      `${existing ? '✏️ Atualizar' : '💰 Apostar'}`
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function OutcomeBadge({ outcome, home, away }: { outcome: Outcome; home: string; away: string }) {
  const label = outcome === 'home' ? `1 (${home})` : outcome === 'draw' ? 'X' : `2 (${away})`;
  return (
    <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1.5 rounded-full border border-gold/30">
      {label}
    </span>
  );
}
