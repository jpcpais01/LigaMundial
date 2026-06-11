'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { NewsItem } from '@/app/api/news/route';

// Cor do chip da fonte — rotação estável por índice
const ACCENTS = ['#fbbf24', '#a78bfa', '#3b82f6', '#34d399', '#fb7185', '#f97316'];

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { locale: pt, addSuffix: true });
  } catch {
    return '';
  }
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[] | null>(null); // null = a carregar

  useEffect(() => {
    let alive = true;
    fetch('/api/news')
      .then(r => (r.ok ? r.json() : []))
      .then(data => { if (alive) setNews(Array.isArray(data) ? data : []); })
      .catch(() => { if (alive) setNews([]); });
    return () => { alive = false; };
  }, []);

  // Feed indisponível — esconder a secção em vez de mostrar notícias velhas
  if (news !== null && news.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3 px-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
          Últimas Notícias
        </p>
        <span className="text-[11px] text-white/20">Mundial 2026</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory scrollbar-none">
        {news === null
          ? // Skeleton enquanto carrega
            [0, 1, 2].map(i => (
              <div
                key={i}
                className="flex-shrink-0 w-60 snap-start rounded-2xl border border-white/6 bg-white/3 p-4 animate-pulse"
              >
                <div className="h-4 w-20 bg-white/8 rounded-full mb-4" />
                <div className="h-3 bg-white/8 rounded mb-2" />
                <div className="h-3 bg-white/8 rounded mb-2 w-4/5" />
                <div className="h-3 bg-white/8 rounded w-3/5 mb-4" />
                <div className="h-2.5 w-16 bg-white/6 rounded" />
              </div>
            ))
          : news.map((item, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <motion.a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                  className="flex-shrink-0 w-60 snap-start rounded-2xl border border-white/6 bg-white/3 p-4
                             cursor-pointer active:scale-[0.97] transition-transform block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border max-w-[160px] truncate"
                      style={{
                        color: accent,
                        borderColor: `${accent}35`,
                        backgroundColor: `${accent}12`,
                      }}
                    >
                      {item.source}
                    </span>
                    <ArrowUpRight size={13} className="text-white/15 mt-0.5 flex-shrink-0" />
                  </div>

                  <h3 className="text-white font-semibold text-sm leading-snug mb-3 line-clamp-3">
                    {item.title}
                  </h3>
                  <p className="text-white/20 text-[10px]">{timeAgo(item.publishedAt)}</p>
                </motion.a>
              );
            })}
      </div>
    </section>
  );
}
