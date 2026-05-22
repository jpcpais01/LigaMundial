'use client';
import { motion } from 'framer-motion';
import { Users, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import type { League } from '@/types';

interface LeagueCardProps {
  league: League;
  memberCount: number;
  isJoined: boolean;
  index: number;
}

export default function LeagueCard({ league, memberCount, isJoined, index }: LeagueCardProps) {
  const prizes = league.prizeDistribution;
  const prizeText = prizes.second
    ? `🥇 ${prizes.first}% · 🥈 ${prizes.second}% · 🥉 ${prizes.third}%`
    : `🏆 100% vencedor`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link href={`/ligas/${league.id}`}>
        <div className={`relative rounded-2xl overflow-hidden border border-white/10
                         bg-gradient-to-br from-white/8 to-white/2 backdrop-blur-md p-4
                         active:scale-98 transition-transform`}>
          {/* Gradient accent */}
          <div className={`absolute inset-0 bg-gradient-to-br ${league.color} opacity-10 pointer-events-none`} />

          <div className="relative flex items-start justify-between gap-3">
            {/* Left: icon + info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${league.color}
                              flex items-center justify-center text-2xl shadow-lg`}>
                {league.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-bold text-sm leading-tight">{league.name}</h3>
                  {isJoined && (
                    <span className="flex items-center gap-0.5 text-[9px] bg-green-500/20 text-green-400
                                   border border-green-500/30 rounded-full px-1.5 py-0.5 font-medium">
                      <Check size={9} /> inscrito
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-0.5">{league.subtitle}</p>
                <p className="text-white/60 text-xs mt-1.5 leading-relaxed line-clamp-2">
                  {league.description}
                </p>
              </div>
            </div>

            <ChevronRight size={18} className="text-white/30 flex-shrink-0 mt-1" />
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Users size={11} />
              <span>{memberCount} jogadores</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{prizeText}</span>
              <span className="text-xs font-bold text-gold">{league.entryFee}€</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
