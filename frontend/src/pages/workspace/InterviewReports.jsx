import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Mic2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { interviewAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { safeDate } from '../../components/workspace/utils';

const DIMS = [
  { key: 'communication', label: 'Communication' },
  { key: 'technicalCoverage', label: 'Technical' },
  { key: 'answerStructure', label: 'Structure' },
];

export default function InterviewReports() {
  const navigate = useNavigate();
  const sessions = useQuery({ queryKey: ['interview', 'sessions'], queryFn: () => interviewAPI.sessions().then((r) => r.data || []), retry: 1 });

  const list = sessions.data || [];
  const completed = list.filter((s) => s.status === 'completed');
  const active = list.filter((s) => s.status !== 'completed');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Reports"
        description="Every completed mock interview, with overall scores and per-answer feedback."
        icon={ClipboardList}
        actions={
          <Button onClick={() => navigate('/interview/mock')}>
            <Mic2 className="size-4" /> New mock interview
          </Button>
        }
      />

      {sessions.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : sessions.isError ? (
        <ErrorState error={sessions.error} title="Couldn't load reports" onRetry={() => sessions.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No interviews yet" description="Complete a mock interview and your reports will appear here." />
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              {active.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.title || 'Mock Interview'}</p>
                      <p className="text-xs text-muted-foreground">{safeDate(s.createdAt)} · in progress</p>
                    </div>
                    <Badge variant="outline" className="text-ai bg-ai/10 border-ai/25">In progress</Badge>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/interview/mock/${s.id}`)}>
                      Resume <ArrowRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {completed.map((s) => (
              <Card key={s.id} className="transition-colors hover:border-primary/40">
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-heading text-sm font-semibold">{s.title || 'Mock Interview'}</p>
                      {s.jobTitle && <p className="truncate text-xs text-muted-foreground">{s.jobTitle}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground">{safeDate(s.createdAt)}</p>
                    </div>
                    <ScoreRing value={s.feedback?.overall ?? 0} size={64} stroke={7} color={scoreColor(s.feedback?.overall)}>
                      <span className="font-heading text-sm font-bold tabular-nums">{s.feedback?.overall ?? 0}</span>
                    </ScoreRing>
                  </div>
                  <div className="space-y-1.5">
                    {DIMS.map((d) => (
                      <div key={d.key} className="flex items-center gap-2 text-xs">
                        <span className="w-24 shrink-0 text-muted-foreground">{d.label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full" style={{ width: `${s.feedback?.[d.key] ?? 0}%`, background: scoreColor(s.feedback?.[d.key]) }} />
                        </div>
                        <span className="w-6 shrink-0 text-right font-semibold tabular-nums">{s.feedback?.[d.key] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {(s.feedback?.strengths || []).length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-success">
                        <CheckCircle2 className="size-3.5" /> {s.feedback.strengths.length} strengths
                      </span>
                    )}
                    <Button size="sm" className="ml-auto" onClick={() => navigate(`/interview/reports/${s.id}`)}>
                      Full report <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}