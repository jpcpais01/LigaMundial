'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Loader2, Check, Image as ImageIcon, X, Ticket } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthContext';
import { getTeam, isRealTeam } from '@/data/teams';
import { useResolvedMatches } from '@/hooks/useResolvedMatches';
import { setMatchResult, setLeagueBackground, adminSetBet } from '@/lib/firestore';
import { LEAGUES } from '@/data/leagues';
import { formatMatchDate } from '@/lib/utils';
import type { Match } from '@/types';

async function compressLeagueBg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const TARGET_W = 900;
      const TARGET_H = 500;
      const srcRatio = img.width / img.height;
      const tgtRatio = TARGET_W / TARGET_H;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcRatio > tgtRatio) {
        sw = img.height * tgtRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / tgtRatio;
        sy = (img.height - sh) / 2;
      }
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminPage() {
  const { user, isAdmin } = useAuthContext();
  const { all: ALL_MATCHES } = useResolvedMatches();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Player bet section (admin override)
  const regularLeagues = LEAGUES.filter(l => l.type === 'regular');
  const [betUsername, setBetUsername] = useState('');
  const [betSearch, setBetSearch] = useState('');
  const [betMatch, setBetMatch] = useState<Match | null>(null);
  const [betLeagues, setBetLeagues] = useState<string[]>([]);
  const [betHome, setBetHome] = useState('');
  const [betAway, setBetAway] = useState('');
  const [betSaving, setBetSaving] = useState(false);
  const [betSaved, setBetSaved] = useState(false);
  const [betError, setBetError] = useState('');

  // League background section
  const [bgLeagueId, setBgLeagueId] = useState(LEAGUES[0].id);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [bgSaving, setBgSaving] = useState(false);
  const [bgSaved, setBgSaved] = useState(false);
  const [bgError, setBgError] = useState('');
  const bgInputRef = useRef<HTMLInputElement>(null);

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

  const matchMatchesQuery = (m: Match, q: string) => {
    const h = getTeam(m.homeTeamId);
    const a = getTeam(m.awayTeamId);
    const query = q.toLowerCase();
    return !query || h.name.toLowerCase().includes(query) || a.name.toLowerCase().includes(query) ||
      h.shortName.toLowerCase().includes(query) || a.shortName.toLowerCase().includes(query);
  };

  const filteredMatches = ALL_MATCHES.filter(m => matchMatchesQuery(m, search)).slice(0, 30);

  // Só jogos com equipas reais (não dá para apostar em posições por definir)
  const betFilteredMatches = ALL_MATCHES
    .filter(m => isRealTeam(m.homeTeamId) && matchMatchesQuery(m, betSearch))
    .slice(0, 30);

  const handleBetSave = async () => {
    setBetError('');
    if (!betUsername.trim()) { setBetError('Indica o nome de utilizador.'); return; }
    if (!betMatch) { setBetError('Escolhe um jogo.'); return; }
    if (betLeagues.length === 0) { setBetError('Escolhe pelo menos uma liga.'); return; }
    const h = parseInt(betHome);
    const a = parseInt(betAway);
    if (isNaN(h) || isNaN(a)) { setBetError('Indica o resultado exacto.'); return; }
    setBetSaving(true);
    try {
      await Promise.all(betLeagues.map(leagueId => adminSetBet({
        leagueId, matchId: betMatch.id, username: betUsername, exactHome: h, exactAway: a,
      })));
      setBetSaved(true);
      setTimeout(() => setBetSaved(false), 2500);
    } catch (err) {
      setBetError('Erro ao guardar. Tenta novamente.');
      console.error(err);
    } finally {
      setBetSaving(false);
    }
  };

  const handleBgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressLeagueBg(file);
      setBgPreview(compressed);
      setBgError('');
    } catch {
      setBgError('Erro ao processar imagem.');
    }
    e.target.value = '';
  };

  const handleBgSave = async () => {
    if (!bgPreview) return;
    setBgSaving(true);
    setBgError('');
    try {
      await setLeagueBackground(bgLeagueId, bgPreview);
      setBgSaved(true);
      setTimeout(() => setBgSaved(false), 2500);
    } catch (err) {
      setBgError('Erro ao guardar. Tenta novamente.');
      console.error(err);
    } finally {
      setBgSaving(false);
    }
  };

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
        source: 'admin',
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
          if (!isRealTeam(m.homeTeamId)) return null;
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

      {/* ── League background upload ─────────────────── */}
      <div className="border-t border-white/8 pt-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon size={16} className="text-gold" />
          <h2 className="text-sm font-bold text-white">Background das Ligas</h2>
        </div>

        {/* League selector */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {LEAGUES.map(l => (
            <button
              key={l.id}
              onClick={() => { setBgLeagueId(l.id); setBgPreview(null); setBgSaved(false); setBgError(''); }}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                bgLeagueId === l.id
                  ? 'bg-gold/15 border-gold/30 text-gold font-semibold'
                  : 'bg-white/4 border-white/8 text-white/50'
              }`}
            >
              {l.name.replace('Liga ', '').replace('Extra — ', '')}
            </button>
          ))}
        </div>

        {/* Upload area */}
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBgFile}
        />

        {bgPreview ? (
          <div className="relative rounded-2xl overflow-hidden mb-3 border border-white/10" style={{ aspectRatio: '9/5' }}>
            <img src={bgPreview} alt="preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setBgPreview(null)}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/50 rounded-lg px-2 py-1 text-[10px] text-white/70">
              {LEAGUES.find(l => l.id === bgLeagueId)?.name}
            </div>
          </div>
        ) : (
          <button
            onClick={() => bgInputRef.current?.click()}
            className="w-full rounded-2xl border border-dashed border-white/15 bg-white/3 flex flex-col items-center justify-center gap-2 py-8 mb-3 active:bg-white/5 transition-colors"
          >
            <ImageIcon size={24} className="text-white/20" />
            <p className="text-white/35 text-xs">Toca para seleccionar imagem</p>
            <p className="text-white/20 text-[10px]">JPG / PNG · recomendado 16:9</p>
          </button>
        )}

        {bgError && <p className="text-red-400 text-xs mb-3">{bgError}</p>}

        <div className="flex gap-2">
          {bgPreview && (
            <button
              onClick={() => bgInputRef.current?.click()}
              className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/4 text-white/50 text-sm font-medium"
            >
              Trocar
            </button>
          )}
          <motion.button
            onClick={handleBgSave}
            disabled={!bgPreview || bgSaving}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              bgSaved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gold-gradient text-black disabled:opacity-30'
            }`}
          >
            {bgSaved ? <><Check size={16} /> Guardado!</>
              : bgSaving ? <><Loader2 size={16} className="animate-spin" /> A guardar...</>
              : '💾 Guardar background'}
          </motion.button>
        </div>
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

      {/* ── Aposta de jogador (admin) ─────────────────── */}
      <div className="border-t border-white/8 pt-6 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <Ticket size={16} className="text-gold" />
          <h2 className="text-sm font-bold text-white">Aposta de Jogador</h2>
        </div>
        <p className="text-white/35 text-xs mb-4">Inserir ou corrigir a aposta de um jogador (ex: esqueceu-se de apostar).</p>

        {/* Username */}
        <input
          type="text"
          placeholder="Nome de utilizador (ex: gandamoca)"
          value={betUsername}
          onChange={e => setBetUsername(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white
                     placeholder:text-white/25 focus:outline-none focus:border-gold/40 mb-3 text-sm"
        />

        {/* Match search + selector */}
        {betMatch ? (
          <div className="flex items-center gap-3 rounded-xl p-3 border border-gold/30 bg-gold/15 mb-3">
            <span className="text-lg">{getTeam(betMatch.homeTeamId).flag}</span>
            <span className="text-xs font-medium flex-1 truncate text-gold">
              {getTeam(betMatch.homeTeamId).shortName} vs {getTeam(betMatch.awayTeamId).shortName}
            </span>
            <span className="text-lg">{getTeam(betMatch.awayTeamId).flag}</span>
            <button onClick={() => { setBetMatch(null); setBetHome(''); setBetAway(''); }} className="p-1">
              <X size={14} className="text-white/50" />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Pesquisar jogo..."
              value={betSearch}
              onChange={e => setBetSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white
                         placeholder:text-white/25 focus:outline-none focus:border-gold/40 mb-2 text-sm"
            />
            {betSearch && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto mb-3">
                {betFilteredMatches.map(m => {
                  const h = getTeam(m.homeTeamId);
                  const a = getTeam(m.awayTeamId);
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setBetMatch(m); setBetSearch(''); }}
                      className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all border bg-white/3 border-white/6"
                    >
                      <span className="text-lg">{h.flag}</span>
                      <span className="text-xs font-medium flex-1 truncate text-white/70">{h.shortName} vs {a.shortName}</span>
                      <span className="text-lg">{a.flag}</span>
                      <span className="text-white/25 text-[10px] w-24 text-right flex-shrink-0">{formatMatchDate(m.scheduledAt)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* League selector (multi) */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {regularLeagues.map(l => {
            const on = betLeagues.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => setBetLeagues(prev => on ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  on ? 'bg-gold/15 border-gold/30 text-gold font-semibold' : 'bg-white/4 border-white/8 text-white/50'
                }`}
              >
                {l.name.replace('Liga ', '').replace('Extra — ', '')}
              </button>
            );
          })}
        </div>

        {/* Exact score */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center flex-1 gap-2">
            <span className="text-2xl">{betMatch ? getTeam(betMatch.homeTeamId).flag : '🏳'}</span>
            <input
              type="number" min="0" max="20" value={betHome}
              onChange={e => setBetHome(e.target.value)} placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl text-center text-white
                         text-2xl font-bold py-3 focus:outline-none focus:border-gold/50 [appearance:textfield]"
            />
          </div>
          <span className="text-white/20 text-2xl">-</span>
          <div className="flex flex-col items-center flex-1 gap-2">
            <span className="text-2xl">{betMatch ? getTeam(betMatch.awayTeamId).flag : '🏳'}</span>
            <input
              type="number" min="0" max="20" value={betAway}
              onChange={e => setBetAway(e.target.value)} placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl text-center text-white
                         text-2xl font-bold py-3 focus:outline-none focus:border-gold/50 [appearance:textfield]"
            />
          </div>
        </div>

        {betError && <p className="text-red-400 text-xs mb-3">{betError}</p>}

        <motion.button
          onClick={handleBetSave}
          disabled={betSaving}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 ${
            betSaved ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                     : 'bg-gold-gradient text-black disabled:opacity-40'
          }`}
        >
          {betSaved ? <><Check size={16} /> Aposta guardada!</>
            : betSaving ? <><Loader2 size={16} className="animate-spin" /> A guardar...</>
            : '💾 Guardar aposta'}
        </motion.button>
      </div>
    </div>
  );
}
