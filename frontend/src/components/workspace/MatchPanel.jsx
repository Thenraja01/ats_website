import ScoreRing, { scoreColor } from './ScoreRing';
import SkillChip from './SkillChip';
import { cn } from '@/lib/utils';

const GROUP_LABELS = {
  matched: { label: 'Matched', dot: 'bg-success' },
  partial: { label: 'Partial', dot: 'bg-warning' },
  missing: { label: 'Missing', dot: 'bg-destructive' },
  notApplicable: { label: 'Not applicable', dot: 'bg-muted-foreground/60' },
};

export function MatchRing({ score, size = 88 }) {
  return (
    <ScoreRing value={score} size={size} stroke={8} color={scoreColor(score)}>
      <span className="font-heading text-xl font-bold tabular-nums">{Math.round(score)}</span>
      <span className="text-[9px] text-muted-foreground uppercase">match</span>
    </ScoreRing>
  );
}

export function MatchGroups({ match }) {
  const order = ['matched', 'partial', 'missing', 'notApplicable'];
  const extract = (key) => {
    const raw = (match?.groups && match.groups[key]) ?? match?.[key] ?? [];
    return raw.map((s) => (typeof s === 'string' ? s : s?.skill)).filter(Boolean);
  };
  const groups = Object.fromEntries(order.map((k) => [k, extract(k)]));

  const any = order.some((g) => (groups[g] || []).length > 0);

  if (!any) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nothing to compare yet.</p>;
  }

  return (
    <div className="space-y-4">
      {order.map((key) => {
        const items = groups[key] || [];
        if (items.length === 0) return null;
        const meta = GROUP_LABELS[key];
        return (
          <div key={key}>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn('size-2 rounded-full', meta.dot)} />
              <p className="text-xs font-semibold text-muted-foreground">
                {meta.label} ({items.length})
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((s) => (
                <SkillChip key={s} label={s} match={key === 'matched' ? 'matched' : key === 'partial' ? 'partial' : key === 'missing' ? 'missing' : undefined} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MatchPanel({ match, className }) {
  if (!match) return null;
  const score = match.overall ?? match.score ?? 0;
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <div className="flex items-center gap-5">
        <MatchRing score={score} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-heading text-lg font-semibold text-foreground">{score >= 75 ? 'Strong match' : score >= 50 ? 'Moderate match' : 'Weak match'}</span>
          </p>
          <MatchGroups match={match} />
        </div>
      </div>
    </div>
  );
}