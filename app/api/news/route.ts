import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
};

// Google News RSS em português — gratuito, sem chave
const FEED_URL =
  'https://news.google.com/rss/search?q=mundial+2026+futebol&hl=pt-PT&gl=PT&ceid=PT:pt-150';

function stripCdata(s: string): string {
  const m = s.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return m ? m[1] : s;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

function extractTag(item: string, name: string): string {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(stripCdata(m[1].trim())) : '';
}

export async function GET() {
  try {
    const res = await fetch(FEED_URL, {
      // Cache de dados do Next — 1 pedido ao Google a cada 15 min no máximo
      next: { revalidate: 900 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LigaMundial/1.0)' },
    });
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
    const news: NewsItem[] = [];
    for (const item of items) {
      let title = extractTag(item, 'title');
      const url = extractTag(item, 'link');
      const source = extractTag(item, 'source');
      const pubDate = extractTag(item, 'pubDate');
      if (!title || !url) continue;
      // O Google anexa " - Fonte" ao título; a fonte é mostrada à parte
      if (source && title.endsWith(` - ${source}`)) {
        title = title.slice(0, -(source.length + 3)).trim();
      }
      const parsed = new Date(pubDate);
      news.push({
        title,
        url,
        source: source || 'Google News',
        publishedAt: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
      });
    }

    news.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return NextResponse.json(news.slice(0, 10));
  } catch {
    return NextResponse.json([] as NewsItem[]);
  }
}
