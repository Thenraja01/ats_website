import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function MetricBar({ label, value, color, suffix = '%', hint, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-medium">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {value}
          {suffix}
          {hint && <span className="ml-1 text-xs text-muted-foreground/70">· {hint}</span>}
        </span>
      </div>
      <Progress value={value} indicatorClassName={color} className="h-1.5" />
    </div>
  );
}