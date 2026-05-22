'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const NEWS = [
  {
    id: 1,
    title: 'MetLife Stadium recebe a Grande Final',
    summary: 'Nova Iorque acolhe o jogo mais esperado do século. Capacidade de 82.500 adeptos.',
    date: '20 Mai 2026',
    tag: 'Infraestrutura',
    accent: '#3b82f6',
  },
  {
    id: 2,
    title: 'Messi e Ronaldo: o último capítulo',
    summary: 'Argentina e Portugal poderão cruzar-se nos quartos de final.',
    date: '19 Mai 2026',
    tag: 'Estrelas',
    accent: '#fbbf24',
  },
  {
    id: 3,
    title: 'Brasil termina preparação com vitória',
    summary: 'A canarinha venceu o Chile na derradeira partida de preparação. Vinicius em destaque.',
    date: '18 Mai 2026',
    tag: 'Seleções',
    accent: '#34d399',
  },
  {
    id: 4,
    title: 'Calendário completo do Mundial',
    summary: '104 jogos em 16 cidades dos EUA, México e Canadá. Grupos a 11 de Junho.',
    date: '17 Mai 2026',
    tag: 'Organização',
    accent: '#a78bfa',
  },
  {
    id: 5,
    title: 'Portugal parte como favorito',
    summary: 'A seleção nacional é apontada como uma das principais candidatas ao título.',
    date: '16 Mai 2026',
    tag: 'Portugal',
    accent: '#fb7185',
  },
];

export default function NewsSection() {
  return (
    <section className="mt-6 px-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
          Últimas Notícias
        </p>
        <span className="text-[11px] text-white/20">Mundial 2026</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
        {NEWS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.35 }}
            className="flex-shrink-0 w-60 snap-start rounded-2xl border border-white/6 bg-white/3 p-4 cursor-pointer active:scale-[0.97] transition-transform"
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  color: item.accent,
                  borderColor: `${item.accent}35`,
                  backgroundColor: `${item.accent}12`,
                }}
              >
                {item.tag}
              </span>
              <ArrowUpRight size={13} className="text-white/15 mt-0.5" />
            </div>

            <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">
              {item.summary}
            </p>
            <p className="text-white/20 text-[10px]">{item.date}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
