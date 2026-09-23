import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function StatCard({ icon: Icon, label, value, sub, tone = 'primary', onClick, actions, className }) {
  const tones = {
    primary: 'text-primary bg-primary/12',
    success: 'text-success bg-success/12',
    warning: 'text-warning bg-warning/12',
    ai: 'text-ai bg-ai/12',
    danger: 'text-destructive bg-destructive/12',
    muted: 'text-muted-foreground bg-muted',
  };

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all',
        onClick && 'hover:border-primary/40 hover:shadow-md cursor-pointer',
        className
      )}
    >
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-heading mt-0.5 text-xl font-bold tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      {actions}
    </Comp>
  );
}