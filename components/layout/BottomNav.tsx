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
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe overflow-hidden">
      {/* Full-width blur layer — blurs content behind the whole nav area */}
      <div className="absolute inset-0 backdrop-blur-2xl" />
      {/* Gradient fade: transparent at top → dark at bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(5,7,20,0.65) 35%, rgba(5,7,20,0.92) 100%)',
        }}
      />
      {/* Pill card sits on top of the blurred area */}
      <div className="relative mx-3 mb-3 bg-white/6 rounded-2xl border border-white/10 px-2 py-1.5">
        <div className="flex items-center justify-around">
          {items.map(item => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors w-full',
                    active ? 'text-gold' : 'text-white/40'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className={cn('text-[10px] font-medium', active ? 'text-gold' : 'text-white/40')}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gold"
                      style={{ left: 'calc(50% - 2px)' }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );

}
