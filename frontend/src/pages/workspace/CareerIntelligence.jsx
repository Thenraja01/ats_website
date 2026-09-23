import { useQuery } from '@tanstack/react-query';
import { Brain, Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';
import { intelligenceAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import SkillChip from '../../components/workspace/SkillChip';
import StatCard from '../../components/workspace/StatCard';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const TONE = {
  positive: { border: 'border-success/30', dot: 'bg-success', title: 'text-success' },
  warning: { border: 'border-warning/30', dot: 'bg-warning', title: 'text-warning' },
  info: { border: 'border-primary/30', dot: 'bg-primary', title: 'text-primary' },
  neutral: { border: 'border-border', dot: 'bg-muted-foreground', title: 'text-muted-foreground' },
};

export default function CareerIntelligence() {
  const overview = useQuery({
    queryKey: ['intelligence', 'overview'],
    queryFn: () => intelligenceAPI.overview().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Intelligence"
        description="A live read on your readiness — skills, gaps and interview track record all in one place."
        icon={Brain}
      />

      {overview.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      )}
      {overview.isError && (
        <ErrorState error={overview.error} title="Couldn't compute your intelligence" onRetry={() => overview.refetch()} />
      )}

      {overview.data && <IntelligenceBody data={overview.data} />}
    </div>
  );
}

function IntelligenceBody({ data }) {
  const r = data.readiness || {};
  const dims = [
    { key: 'profile', label: 'Profile' },
    { key: 'resume', label: 'Resume' },
    { key: 'interview', label: 'Interview' },
    { key: 'match', label: 'Match' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <ScoreRing value={r.overall || 0} size={160} stroke={13} color={scoreColor(r.overall)}>
            <span className="font-heading text-4xl font-bold">{Math.round(r.overall || 0)}</span>
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase">{scoreLabel(r.overall)}</span>
          </ScoreRing>
          <div className="grid w-full flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
            {dims.map((d) => (
              <div key={d.key} className="flex flex-col items-center rounded-lg border border-border bg-card p-4">
                <span className="font-heading text-2xl font-bold" style={{ color: scoreColor(r[d.key]) }}>
                  {Math.round(r[d.key] ?? 0)}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Brain} label="Analyses" value={data.stats.analysesCount} tone="primary" />
        <StatCard icon={Sparkles} label="Avg. ATS" value={data.stats.averageAts} tone="success" />
        <StatCard icon={Target} label="Avg. match" value={data.stats.averageMatch} tone="warning" />
        <StatCard icon={Lightbulb} label="Interviews" value={data.stats.interviewsCompleted} tone="ai" />
        <StatCard icon={TrendingUp} label="Interview avg" value={data.stats.averageInterviewScore} tone="muted" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top skills</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.topSkills || []).length ? (
              <div className="flex flex-wrap gap-1.5">
                {(data.topSkills || []).map((s) => <SkillChip key={s} label={s} match="matched" />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Build your vault to surface skills here.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Growing skills</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.growingSkills || []).length ? (
              <div className="flex flex-wrap gap-1.5">
                {(data.growingSkills || []).map((s) => <SkillChip key={s} label={s} match="matched" />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Skills the market is hungry for.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Potential gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.potentialGaps || []).length ? (
              <div className="flex flex-wrap gap-1.5">
                {(data.potentialGaps || []).map((s) => <SkillChip key={s} label={s} match="missing" />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Looks like you're covering the in-demand set.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {(data.insights || []).length > 0 && (
        <div className="space-y-2.5">
          <p className="font-heading text-sm font-semibold">AI insights</p>
          {(data.insights || []).map((ins, i) => {
            const tone = TONE[ins.tone] || TONE.neutral;
            return (
              <Alert key={i} variant="default" className={cn('items-start border-l-4', tone.border)}>
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', tone.dot)} />
                <AlertTitle className={cn('text-sm', tone.title)}>Insight</AlertTitle>
                <AlertDescription className="text-sm">{ins.text}</AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
}