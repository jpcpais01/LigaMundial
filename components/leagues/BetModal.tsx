'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Loader2, Check, Lock } from 'lucide-react';
import { getTeam } from '@/data/teams';
import { formatMatchDate, isBettingOpen } from '@/lib/utils';
import { saveBet, getBet } from '@/lib/firestore';
import { getOutcomeFromScore } from '@/lib/scoring';
import type { Match, Outcome, Bet } from '@/types';

interface BetModalProps {
  match: Match | null;
  leagueId: string;
  username: string;
  onClose: () => void;
}

export default function BetModal({ match, leagueId, username, onClose }: BetModalProps) {
  const [exactHome, setExactHome] = useState('');
  const [exactAway, setExactAway] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);

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
      setSaved(false);
      setLoading(false);
    });
  }, [match, leagueId, username]);

  useEffect(() => {
    const h = parseInt(exactHome);
    const a = parseInt(exactAway);
    if (!isNaN(h) && !isNaN(a)) setOutcome(getOutcomeFromScore(h, a));
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
      setTimeout(onClose, 700);
    } finally {
      setSaving(false);
    }
  };

  if (!match) return null;
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);

  return (
    <AnimatePresence>
      {match && (
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
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="bg-[#0d1117] rounded-t-3xl border-t border-x border-white/8 p-5 pb-10 max-h-[85vh] overflow-y-auto">
              <div className="w-10 h-1 bg-white/12 rounded-full mx-auto mb-5" />

              {/* Match header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25 mb-1">
                    {match.group ? `Grupo ${match.group} · Jornada ${match.round}` : match.phase.toUpperCase()}
                  </p>
                  <div className="flex items-center gap-3 text-white/30 text-xs">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {match.city}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatMatchDate(match.scheduledAt)}</span>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 transition-colors">
                  <X size={16} className="text-white/30" />
                </button>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-5xl leading-none">{home.flag}</span>
                  <p className="text-white font-bold text-sm">{home.shortName}</p>
                </div>

                {match.status !== 'scheduled' && match.homeScore !== undefined ? (
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-3xl font-black text-white tabular-nums">{match.homeScore}</span>
                    <span className="text-white/20 text-lg">–</span>
                    <span className="text-3xl font-black text-white tabular-nums">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-white/15 font-bold text-lg px-4 tracking-widest">VS</span>
                )}

                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-5xl leading-none">{away.flag}</span>
                  <p className="text-white font-bold text-sm">{away.shortName}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-white/20" />
                </div>
              ) : !bettingOpen ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Lock size={18} className="text-white/20" />
                  <p className="text-white/30 text-sm">Apostas fechadas para este jogo.</p>
                  {existing && (
                    <div className="mt-2 bg-white/4 border border-white/6 rounded-2xl p-4 w-full">
                      <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">A tua aposta</p>
                      <div className="flex items-center justify-center gap-3">
                        {existing.exactHome !== null && (
                          <span className="text-white font-bold text-xl tabular-nums">
                            {existing.exactHome} – {existing.exactAway}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-gold/80 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                          {existing.outcome === 'home' ? `1 (${home.shortName})` : existing.outcome === 'draw' ? 'X' : `2 (${away.shortName})`}
                        </span>
                      </div>
                      {existing.points !== null && (
                        <p className="text-gold font-bold text-center mt-2 text-lg">+{existing.points} pts</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Exact score */}
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25 mb-2">
                      Resultado Exacto <span className="text-gold/60 normal-case tracking-normal">+3 pts</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number" min="0" max="20"
                        value={exactHome}
                        onChange={e => setExactHome(e.target.value)}
                        placeholder="–"
                        className="flex-1 bg-white/4 border border-white/8 rounded-2xl text-center text-white
                                   text-2xl font-bold py-3.5 focus:outline-none focus:border-white/20 transition-all
                                   [appearance:textfield]"
                      />
                      <span className="text-white/15 text-xl font-light">–</span>
                      <input
                        type="number" min="0" max="20"
                        value={exactAway}
                        onChange={e => setExactAway(e.target.value)}
                        placeholder="–"
                        className="flex-1 bg-white/4 border border-white/8 rounded-2xl text-center text-white
                                   text-2xl font-bold py-3.5 focus:outline-none focus:border-white/20 transition-all
                                   [appearance:textfield]"
                      />
                    </div>
                  </div>

                  {/* 1X2 */}
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/25 mb-2">
                      1X2 <span className="text-gold/60 normal-case tracking-normal">+1 pt</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['home', 'draw', 'away'] as Outcome[]).map(o => (
                        <button
                          key={o}
                          onClick={() => setOutcome(o)}
                          className={`py-3 rounded-2xl text-sm font-semibold transition-all ${
                            outcome === o
                              ? 'bg-gold text-black'
                              : 'bg-white/4 text-white/50 border border-white/8 hover:bg-white/8'
                          }`}
                        >
                          {o === 'home' ? `1  ${home.flag}` : o === 'draw' ? 'X' : `${away.flag}  2`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save */}
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || !outcome || saved}
                    className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      saved
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'bg-gold-gradient text-black disabled:opacity-35'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {saved
                      ? <><Check size={15} /> Aposta guardada</>
                      : saving
                        ? <><Loader2 size={15} className="animate-spin" /> A guardar...</>
                        : existing ? 'Actualizar aposta' : 'Confirmar aposta'
                    }
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
