import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/constants/theme';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, glow = false, onClick, ...props }: GlassCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-6 backdrop-blur-md transition-all duration-200',
        'bg-card/90 border border-border/70 text-card-foreground',
        'shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]',
        'hover:border-border hover:shadow-md',
        glow && 'shadow-[0_0_25px_rgba(37,99,235,0.12)] border-primary/30',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
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
  type,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'ai' | 'outline';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) {
  const base = cn(
    'relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    className
  );

  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/85',
    outline: 'border border-border/80 bg-card text-foreground shadow-2xs hover:bg-muted/80',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    ai: 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-primary/10 border border-orange-500/30 text-foreground hover:border-orange-500/60 hover:bg-orange-500/20 font-medium shadow-2xs',
  };

  if (href) {
    return (
      <motion.a
        href={href}
        onClick={onClick}
        className={cn(base, variants[variant])}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type || 'button'}
      disabled={disabled}
      onClick={onClick}
      className={cn(base, variants[variant])}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children, color = 'primary' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-destructive/10 text-destructive border-destructive/20',
    ai: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    header: 'bg-orange-500 text-primary font-semibold border-orange-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.primary}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <GlassCard className="text-center p-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
    </GlassCard>
  );
}
