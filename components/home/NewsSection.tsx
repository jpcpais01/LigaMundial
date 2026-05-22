'use client';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const NEWS = [
  {
    id: 1,
    emoji: '🏟️',
    title: 'MetLife Stadium recebe a Grande Final',
    summary: 'Nova Iorque acolhe o jogo mais esperado do século. Capacidade de 82.500 adeptos.',
    date: '20 Mai 2026',
    tag: 'Infraestrutura',
    color: 'from-blue-500/20 to-blue-900/10',
  },
  {
    id: 2,
    emoji: '⭐',
    title: 'Messi e Ronaldo: o último capítulo',
    summary: 'Argentina e Portugal poderão cruzar-se nos quartos de final. O mundo aguarda ansioso.',
    date: '19 Mai 2026',
    tag: 'Estrelas',
    color: 'from-gold/20 to-yellow-900/10',
  },
  {
    id: 3,
    emoji: '🇧🇷',
    title: 'Brasil treina às portas do Mundial',
    summary: 'A canarinha terminou a preparação com vitória sobre o Chile. Vinicius em grande forma.',
    date: '18 Mai 2026',
    tag: 'Seleções',
    color: 'from-green-500/20 to-green-900/10',
  },
  {
    id: 4,
    emoji: '📅',
    title: 'Calendário completo disponível',
    summary: '104 jogos em 16 cidades dos EUA, México e Canadá. Fase de grupos começa a 11 de Junho.',
    date: '17 Mai 2026',
    tag: 'Organização',
    color: 'from-purple-500/20 to-purple-900/10',
  },
  {
    id: 5,
    emoji: '🇵🇹',
    title: 'Portugal: Ronaldo lidera os campeões europeus',
    summary: 'A seleção das quinas parte como uma das favoritas ao título mundial.',
    date: '16 Mai 2026',
    tag: 'Portugal',
    color: 'from-red-500/20 to-red-900/10',
  },
];

export default function NewsSection() {
  return (
    <section className="mt-6 px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-white">Últimas Notícias</h2>
        <span className="text-xs text-white/40">Mundial 2026</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
        {NEWS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`flex-shrink-0 w-64 snap-start rounded-2xl border border-white/10
                       bg-gradient-to-br ${item.color} backdrop-blur-sm p-4 cursor-pointer
                       active:scale-95 transition-transform`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[10px] text-white/40 bg-white/10 rounded-full px-2 py-0.5">
                {item.tag}
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mb-3">
              {item.summary}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30">{item.date}</span>
              <ExternalLink size={11} className="text-white/25" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
