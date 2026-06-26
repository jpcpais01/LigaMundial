'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Crosshair, Sparkles, Users, TrendingUp, Goal, Award, BarChart3 } from 'lucide-react';
import { computeLeagueStats, type BarRow, type TendencyRow, type StatMember } from '@/lib/stats';
import { getInitials } from '@/lib/utils';
import type { Bet, MatchResult } from '@/types';

interface LeagueStatsProps {
  bets: Bet[];
  results: Record<string, MatchResult>;
  members: StatMember[];
  currentUsername: string;
  accent: string;
}

const OUTCOME_COLORS = { home: '#34d399', draw: '#94a3b8', away: '#60a5fa' };

export default function LeagueStats({ bets, results, members, currentUsername, accent }: LeagueStatsProps) {
  const stats = useMemo(
    () => computeLeagueStats(bets, results, members, currentUsername),
    [bets, results, members, currentUsername],
  );

  if (stats.predictedMatches === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 py-8 text-center">
        <BarChart3 size={28} className="text-white/15" />
        <p className="text-white/35 text-sm">As estatísticas aparecem assim que houver apostas.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-white/8" />
        <div className="flex items-center gap-1.5 text-white/45">
          <BarChart3 size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Estatísticas</span>
        </div>
        <div className="h-px flex-1 bg-white/8" />
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryCard label="Jogos previstos" value={stats.predictedMatches} />
        <SummaryCard label="Jogos terminados" value={stats.gradedMatches} />
        <SummaryCard label="Apostas totais" value={stats.totalBets} />
      </div>

      {/* Superlativos */}
      {stats.superlatives.length > 0 && (
        <Section icon={<Award size={15} />} title="Distinções" subtitle="Os destaques desta liga">
          <div className="grid grid-cols-2 gap-2">
            {stats.superlatives.map(s => (
              <div key={s.key} className="bg-white/4 border border-white/8 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-lg leading-none">{s.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold leading-tight truncate">{s.title}</p>
                    <p className="text-white/35 text-[9px] leading-tight truncate">{s.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar row={s} size={22} />
                  <div className="min-w-0 flex-1">
                    <p className="text-white/80 text-[11px] font-semibold truncate">{s.username}</p>
                  </div>
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: accent }}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Precisão 1X2 */}
      {stats.accuracy.length > 0 && (
        <Section
          icon={<Target size={15} />}
          title="Precisão 1X2"
          subtitle="% de jogos com o resultado (1X2) certo · inclui o palpite do Consenso"
        >
          <BarChart rows={stats.accuracy} max={100} suffix="%" accent={accent} />
        </Section>
      )}

      {/* Resultados exactos */}
      {stats.exactRate.length > 0 && (
        <Section
          icon={<Crosshair size={15} />}
          title="Resultados exactos"
          subtitle="% de jogos com o placar exacto acertado"
        >
          <BarChart rows={stats.exactRate} max={100} suffix="%" accent={accent} />
        </Section>
      )}

      {/* Pontos por jogo */}
      {stats.avgPoints.length > 0 && (
        <Section
          icon={<TrendingUp size={15} />}
          title="Média de pontos por jogo"
          subtitle="Eficiência: pontos ganhos a dividir pelos jogos terminados"
        >
          <BarChart rows={stats.avgPoints} accent={accent} decimals={2} />
        </Section>
      )}

      {/* Proximidade ao consenso */}
      {stats.conformity.length > 0 && (
        <Section
          icon={<Users size={15} />}
          title="Proximidade ao consenso"
          subtitle="Quem aposta mais perto da média do grupo (menos golos de diferença = mais alinhado)"
        >
          <ConformityChart rows={stats.conformity} accent={accent} />
        </Section>
      )}

      {/* Tendência 1 / X / 2 */}
      {stats.tendency.length > 0 && (
        <Section
          icon={<BarChart3 size={15} />}
          title="Tendência 1 / X / 2"
          subtitle="Estilo de aposta: casa (1) · empate (X) · fora (2)"
        >
          <div className="flex items-center gap-3 mb-2.5 text-[10px] text-white/45">
            <Legend color={OUTCOME_COLORS.home} label="1 Casa" />
            <Legend color={OUTCOME_COLORS.draw} label="X Empate" />
            <Legend color={OUTCOME_COLORS.away} label="2 Fora" />
          </div>
          <div className="space-y-2.5">
            {stats.tendency.map((row, i) => (
              <TendencyBar key={row.username} row={row} delay={i * 0.03} />
            ))}
          </div>
        </Section>
      )}

      {/* Golos previstos */}
      {stats.goals.length > 0 && (
        <Section
          icon={<Goal size={15} />}
          title="Golos previstos por jogo"
          subtitle={
            stats.realGoalsAvg !== null
              ? `Ofensivo vs cauteloso · média real: ${stats.realGoalsAvg.toFixed(2)} golos/jogo`
              : 'Ofensivo vs cauteloso · média de golos por palpite'
          }
        >
          <BarChart rows={stats.goals} accent={accent} decimals={2} />
        </Section>
      )}
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function Section({
  icon, title, subtitle, children,
}: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
      <div className="flex items-start gap-2 mb-3.5">
        <span className="text-white/55 mt-0.5">{icon}</span>
        <div>
          <h3 className="text-white text-sm font-bold leading-tight">{title}</h3>
          <p className="text-white/35 text-[10px] leading-snug mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-3 text-center">
      <p className="text-white font-black text-xl leading-none">{value}</p>
      <p className="text-white/35 text-[9px] mt-1 leading-tight">{label}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function Avatar({ row, size = 24 }: { row: { username: string; avatarColor: string; avatarUrl?: string; isGroup?: boolean }; size?: number }) {
  if (row.isGroup) {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 text-black font-bold"
        style={{ width: size, height: size, backgroundColor: row.avatarColor, fontSize: size * 0.42 }}
      >
        <Users size={size * 0.5} />
      </div>
    );
  }
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, backgroundColor: row.avatarUrl ? undefined : row.avatarColor, fontSize: size * 0.36 }}
    >
      {row.avatarUrl
        ? <img src={row.avatarUrl} alt={row.username} className="w-full h-full object-cover" />
        : getInitials(row.username)}
    </div>
  );
}

function BarChart({
  rows, max, suffix = '', decimals = 0, accent,
}: { rows: BarRow[]; max?: number; suffix?: string; decimals?: number; accent: string }) {
  const top = max ?? Math.max(...rows.map(r => r.value), 0.0001);
  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => {
        const pct = top > 0 ? Math.min(100, (row.value / top) * 100) : 0;
        return <Bar key={row.username} row={row} pct={pct} label={`${row.value.toFixed(decimals)}${suffix}`} delay={i * 0.03} accent={accent} />;
      })}
    </div>
  );
}

function ConformityChart({ rows, accent }: { rows: BarRow[]; accent: string }) {
  // Barra maior = mais próximo do consenso (menor distância).
  const max = Math.max(...rows.map(r => r.value), 0.0001);
  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => {
        const pct = max > 0 ? Math.max(8, (1 - row.value / max) * 100) : 100;
        return <Bar key={row.username} row={row} pct={pct} label={`${row.value.toFixed(2)}`} delay={i * 0.03} accent={accent} />;
      })}
    </div>
  );
}

function Bar({
  row, pct, label, delay, accent,
}: { row: BarRow; pct: number; label: string; delay: number; accent: string }) {
  const color = row.isGroup ? '#FFD700' : row.isCurrent ? accent : '#ffffff';
  return (
    <div className="flex items-center gap-2.5">
      <Avatar row={row} size={26} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-[11px] font-semibold truncate ${
            row.isGroup ? 'text-gold' : row.isCurrent ? 'text-white' : 'text-white/70'
          }`}>
            {row.username}{row.isCurrent && ' (tu)'}
          </span>
          <span className="text-[10px] text-white/40 flex-shrink-0 ml-2 tabular-nums">{label}</span>
        </div>
        <div className="h-2 rounded-full bg-white/6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color, opacity: row.isGroup || row.isCurrent ? 1 : 0.4 }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

function TendencyBar({ row, delay }: { row: TendencyRow; delay: number }) {
  const segments = [
    { key: 'home', value: row.home, color: OUTCOME_COLORS.home },
    { key: 'draw', value: row.draw, color: OUTCOME_COLORS.draw },
    { key: 'away', value: row.away, color: OUTCOME_COLORS.away },
  ];
  return (
    <div className="flex items-center gap-2.5">
      <Avatar row={row} size={26} />
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-semibold truncate mb-1 ${
          row.isGroup ? 'text-gold' : row.isCurrent ? 'text-white' : 'text-white/70'
        }`}>
          {row.username}{row.isCurrent && ' (tu)'}
        </p>
        <div className="flex h-4 rounded-md overflow-hidden bg-white/6">
          {segments.map(seg => (
            <motion.div
              key={seg.key}
              className="h-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: seg.color, opacity: row.isGroup ? 1 : 0.65 }}
              initial={{ width: 0 }}
              animate={{ width: `${seg.value}%` }}
              transition={{ delay, duration: 0.5, ease: 'easeOut' }}
            >
              {seg.value >= 16 && (
                <span className="text-[8px] font-bold text-black/70">{Math.round(seg.value)}%</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
