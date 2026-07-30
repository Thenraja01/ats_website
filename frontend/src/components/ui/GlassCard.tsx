import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { fadeInUp } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, glow = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 cursor-default',
        'bg-white/[0.03] border border-white/[0.06]',
        'hover:bg-white/[0.05] hover:border-white/[0.1]',
        glow && 'shadow-[0_0_30px_rgba(79,140,255,0.1)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function GlowButton({
  children,
  className,
  href,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const base = cn(
    'relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
    'active:scale-95',
    className
  );

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105',
    secondary: 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  };

  const Tag = href ? 'a' : motion.button;
  const props = {
    className: cn(base, variants[variant]),
    ...(href ? { href } : {}),
    ...(onClick ? { onClick } : {}),
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };

  // @ts-ignore
  return <Tag {...props}>{children}</Tag>;
}

export function Badge({ children, color = 'primary' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[color] || colors.primary}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <GlassCard className="text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </GlassCard>
  );
}
