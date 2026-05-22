import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  gradient?: string;
}

export default function GlassCard({ children, className, glow, gradient }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10',
        'bg-white/5 backdrop-blur-md',
        glow && 'shadow-glow',
        className,
      )}
    >
      {gradient && (
        <div className={cn('absolute inset-0 opacity-10 bg-gradient-to-br', gradient)} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
