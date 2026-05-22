'use client';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const NEWS = [
  {
    id: 1,
    title: 'Mbappé: "O Mundial é a minha prioridade absoluta"',
    summary: 'O avançado francês chega a 2026 como grande favorito individual. A França é uma das candidatas ao título.',
    date: '21 Mai 2026',
    tag: 'Estrelas',
    accent: '#fbbf24',
    url: 'https://www.fifa.com/en/tournaments/mens/worldcup/2026worldcup',
  },
  {
    id: 2,
    title: 'Argentina quer o tri: a defesa do título começa agora',
    summary: 'Os campeões de 2022 chegam confiantes sob o comando de Scaloni. Messi lidera a albiceleste pela última vez.',
    date: '20 Mai 2026',
    tag: 'Seleções',
    accent: '#a78bfa',
    url: 'https://www.fifa.com/en/tournaments/mens/worldcup/2026worldcup',
  },
  {
    id: 3,
    title: 'MetLife Stadium recebe a Grande Final a 26 de Julho',
    summary: 'Nova Iorque acolhe o jogo mais esperado do século. O estádio tem capacidade para 82.500 adeptos.',
    date: '18 Mai 2026',
    tag: 'Infraestrutura',
    accent: '#3b82f6',
    url: 'https://www.fifa.com/en/tournaments/mens/worldcup/2026worldcup',
  },
  {
    id: 4,
    title: 'Vinicius Jr.: a esperança do Brasil para acabar com o jejum',
    summary: 'O extremo do Real Madrid lidera a geração canarinha que quer o título 24 anos depois de 2002.',
    date: '17 Mai 2026',
    tag: 'Seleções',
    accent: '#34d399',
    url: 'https://www.fifa.com/en/tournaments/mens/worldcup/2026worldcup',
  },
  {
    id: 5,
    title: '48 seleções, 3 países, 104 jogos: o maior Mundial de sempre',
    summary: 'EUA, México e Canadá acolhem pela primeira vez 48 equipas. Os grupos arrancam a 11 de Junho no Azteca.',
    date: '15 Mai 2026',
    tag: 'Organização',
    accent: '#fb7185',
    url: 'https://www.fifa.com/en/tournaments/mens/worldcup/2026worldcup',
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

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
        {NEWS.map((item, i) => (
          <motion.a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.35 }}
            className="flex-shrink-0 w-60 snap-start rounded-2xl border border-white/6 bg-white/3 p-4 cursor-pointer active:scale-[0.97] transition-transform block"
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
              <ArrowUpRight size={13} className="text-white/15 mt-0.5 flex-shrink-0" />
            </div>

            <h3 className="text-white font-semibold text-sm leading-snug mb-1.5 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-3">
              {item.summary}
            </p>
            <p className="text-white/20 text-[10px]">{item.date}</p>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
