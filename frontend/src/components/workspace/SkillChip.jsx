import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function SkillChip({ label, match, className }) {
  const tone =
    match === 'matched'
      ? 'bg-success/12 text-success border-success/25'
      : match === 'partial'
        ? 'bg-warning/12 text-warning border-warning/25'
        : match === 'missing'
          ? 'bg-destructive/12 text-destructive border-destructive/25'
          : 'bg-muted text-muted-foreground border-transparent';

  return (
    <Badge variant="outline" className={cn('font-medium normal-case', tone, match && 'border', className)}>
      {label}
    </Badge>
  );
}

export function SkillDot({ matched }) {
  return (
    <span
      className={cn(
        'inline-block size-1.5 rounded-full',
        matched ? 'bg-success' : 'bg-muted-foreground/50'
      )}
    />
  );
}