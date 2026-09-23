import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Mic2,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { interviewAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import ErrorState from '../../components/workspace/ErrorState';
import AICallout from '../../components/workspace/AICallout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const METRIC_RING = [
  { key: 'technical_coverage', label: 'Technical' },
  { key: 'communication', label: 'Communication' },
  { key: 'answer_structure', label: 'Structure' },
];

export default function InterviewReport() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const report = useQuery({
    queryKey: ['interview', 'session', reportId],
    queryFn: () => interviewAPI.getSession(reportId).then((r) => r.data),
  });

  if (report.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (report.isError) {
    return <ErrorState error={report.error} title="Couldn't load this report" onRetry={() => report.refetch()} />;
  }

  const s = report.data;
  const fb = s.feedback;

  if (!fb) {
    return <ErrorState error={new Error('No feedback yet')} title="This interview isn't complete yet" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Report"
        description={`${s.title}${s.jobTitle ? ` · ${s.jobTitle}` : ''}`}
        icon={Brain}
        actions={
          <Button variant="outline" onClick={() => navigate('/interview/mock')}>
            <ArrowLeft className="size-4" /> Back to interviews
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center p-5">
            <ScoreRing value={fb.overall} size={104} stroke={9} color={scoreColor(fb.overall)}>
              <span className="font-heading text-2xl font-bold">{fb.overall}</span>
            </ScoreRing>
            <p className="mt-3 text-sm font-semibold">{scoreLabel(fb.overall)}</p>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>
        {METRIC_RING.map((m) => (
          <Card key={m.key}>
            <CardContent className="flex flex-col items-center p-5">
              <ScoreRing value={fb[m.key]} size={82} stroke={8} color={scoreColor(fb[m.key])}>
                <span className="font-heading text-xl font-bold">{fb[m.key]}</span>
              </ScoreRing>
              <p className="mt-3 text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-muted-foreground">dimension</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-success" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(fb.strengths || []).length ? (
              fb.strengths.map((st, i) => (
                <p key={i} className="text-sm text-muted-foreground">• {st}</p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No strengths flagged.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="size-4 text-warning" /> Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(fb.improvements || []).length ? (
              fb.improvements.map((im, i) => (
                <p key={i} className="text-sm text-muted-foreground">• {im}</p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Clean performance — keep it up.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <p className="font-heading text-sm font-semibold">Question breakdown</p>
        {s.questions.map((q, i) => (
          <QuestionCard key={q.id || i} q={q} index={i} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(index === 0);
  const fb = q.feedback;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/40"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <Mic2 className="size-4" />
        </div>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{q.question}</span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
            <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
          </span>
        </span>
        {fb && (
          <span className="flex items-center gap-2 shrink-0">
            <span className="font-heading text-lg font-bold tabular-nums" style={{ color: scoreColor(fb.overall) }}>
              {fb.overall}
            </span>
            <span className="rounded-md border border-border p-1">
              {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </span>
          </span>
        )}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {q.userAnswer ? (
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Your answer</p>
              <p className="rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">{q.userAnswer}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not answered.</p>
          )}
          {fb && (
            <div className="grid gap-4 sm:grid-cols-3">
              {(fb.strengths || []).length > 0 && (
                <div className="rounded-lg border border-success/20 p-3">
                  <p className="mb-1 text-xs font-semibold text-success">Strengths</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {(fb.strengths || []).map((st, i) => <li key={i}>• {st}</li>)}
                  </ul>
                </div>
              )}
              {(fb.improvements || []).length > 0 && (
                <div className="rounded-lg border border-warning/20 p-3">
                  <p className="mb-1 text-xs font-semibold text-warning">Improve</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {(fb.improvements || []).map((im, i) => <li key={i}>• {im}</li>)}
                  </ul>
                </div>
              )}
              {q.idealAnswer && (
                <AICallout compact icon={<Sparkles className="size-4" />} title="Ideal answer" className="col-span-full lg:col-span-1">
                  <p className="text-xs">{q.idealAnswer}</p>
                </AICallout>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}