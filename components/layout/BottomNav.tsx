'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/auth/AuthContext';

const NAV_ITEMS = [
  { href: '/',       icon: Home,       label: 'Início' },
  { href: '/ligas',  icon: Trophy,     label: 'Ligas' },
  { href: '/perfil', icon: User,       label: 'Perfil' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuthContext();

  const items = isAdmin
    ? [...NAV_ITEMS, { href: '/admin', icon: ShieldCheck, label: 'Admin' }]
    : NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe">
      <div className="mx-3 mb-3 glass-card rounded-2xl border border-white/10 px-2 py-1.5">
        <div className="flex items-center justify-around">
          {items.map(item => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors',
                    active ? 'text-gold' : 'text-white/40'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="relative w-[22px] h-[22px] flex items-center justify-center">
                    <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                    {active && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                      />
                    )}
                  </div>
                  <span className={cn('text-[10px] font-medium', active ? 'text-gold' : 'text-white/40')}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
