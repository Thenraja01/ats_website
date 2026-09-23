import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lightbulb,
  Loader2,
  Mic2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { interviewAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { safeDate } from '../../components/workspace/utils';

const FEEDBACK_BARS = [
  { key: 'communication', label: 'Communication' },
  { key: 'technical_coverage', label: 'Technical coverage' },
  { key: 'answer_structure', label: 'Structure' },
];

export default function MockInterview() {
  const { sessionId } = useParams();
  if (sessionId) return <MockSession key={sessionId} sessionId={sessionId} />;
  return <MockSetup />;
}

function MockSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('Mock Interview');
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState(location.state?.category || 'All');
  const [difficulty, setDifficulty] = useState('All');
  const [count, setCount] = useState('10');

  const meta = useQuery({ queryKey: ['interview', 'meta'], queryFn: () => interviewAPI.meta().then((r) => r.data) });
  const sessions = useQuery({ queryKey: ['interview', 'sessions'], queryFn: () => interviewAPI.sessions().then((r) => r.data || []) });

  const start = useMutation({
    mutationFn: () =>
      interviewAPI.createSession({
        sessionType: 'mock',
        title,
        jobTitle,
        category,
        difficulty,
        count: Number(count) || 10,
      }),
    onSuccess: (res) => {
      toast.success('Interview started');
      navigate(`/interview/mock/${res.data.id}`);
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not start interview'),
  });

  const opts = {
    categories: meta.data?.categories || [],
    diffs: meta.data?.difficulties || [],
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mock Interview" description="Practice with AI-led, evidence-aware questions. Answers get instant structured feedback." icon={Mic2} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label>Session title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Job title (optional)</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['All', ...opts.categories].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['All', ...opts.diffs].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Number of questions</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger className="mt-1.5 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['5', '8', '10', '12', '15'].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => start.mutate()} disabled={start.isPending}>
              {start.isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              Start interview
            </Button>
          </CardContent>
        </Card>

        <div>
          <p className="font-heading mb-3 text-sm font-semibold">Previous sessions</p>
          {sessions.isLoading ? (
            <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (sessions.data || []).length === 0 ? (
            <EmptyState
              icon={Mic2}
              title="No sessions yet"
              description="Start one on the left. Completed sessions stay here with full reports."
            />
          ) : (
            <div className="space-y-2">
              {(sessions.data || []).slice(0, 8).map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(s.status === 'completed' ? `/interview/reports/${s.id}` : `/interview/mock/${s.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/40"
                >
                  {s.status === 'completed' ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <Clock className="size-4 text-warning" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.questions.length} questions · {safeDate(s.createdAt)}
                    </span>
                  </span>
                  {s.feedback && (
                    <ScoreRing value={s.feedback.overall} size={38} stroke={4} color={scoreColor(s.feedback.overall)}>
                      <span className="text-[10px] font-bold">{s.feedback.overall}</span>
                    </ScoreRing>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MockSession({ sessionId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: ['interview', 'session', sessionId],
    queryFn: () => interviewAPI.getSession(sessionId).then((r) => r.data),
    refetchInterval: 20000,
  });

  const [answer, setAnswer] = useState('');
  const [lastFeedback, setLastFeedback] = useState(null);

  const submit = useMutation({
    mutationFn: () => interviewAPI.answer(sessionId, { index: idx, answer }),
    onSuccess: (res) => {
      setLastFeedback(res.data.feedback);
      queryClient.invalidateQueries({ queryKey: ['interview', 'session', sessionId] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not submit answer'),
  });

  if (session.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (session.isError) {
    return <ErrorState error={session.error} title="Couldn't load session" onRetry={() => session.refetch()} />;
  }
  const s = session.data;
  const idx = Math.min(s.currentIndex || 0, s.questions.length - 1);
  const q = s.questions[idx];

  const completeMutation = useMutation({
    mutationFn: () => interviewAPI.complete(sessionId),
    onSuccess: () => {
      toast.success('Interview completed');
      queryClient.invalidateQueries({ queryKey: ['interview', 'sessions'] });
      navigate(`/interview/reports/${sessionId}`);
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not complete interview'),
  });

  const goNext = () => {
    setAnswer('');
    setLastFeedback(null);
    if (idx >= s.questions.length - 1) {
      completeMutation.mutate();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const completed = s.status === 'completed';
  if (completed) {
    navigate(`/interview/reports/${sessionId}`);
    return null;
  }

  const answeredCount = s.questions.filter((x) => x.feedback && x.feedback.score > 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={s.title}
        description={`${answeredCount} / ${s.questions.length} answered · ${s.jobTitle || 'General'}`}
        icon={Mic2}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/interview/mock')}>
            <ArrowLeft className="size-4" /> Exit session
          </Button>
        }
      />

      <Progress value={(answeredCount / s.questions.length) * 100} className="h-1.5" />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Question {idx + 1} of {s.questions.length}</Badge>
            <Badge variant="outline">{q.category}</Badge>
            <Badge variant="outline">{q.difficulty}</Badge>
          </div>
          <p className="font-heading text-lg leading-relaxed font-semibold">{q.question}</p>

          <div>
            <Label>Your answer</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Structured approach: situation → action → result…"
              className="mt-2 min-h-44"
              disabled={submit.isPending}
            />
          </div>

          {!lastFeedback && (
            <Button
              className="w-full"
              size="lg"
              disabled={!answer.trim() || submit.isPending}
              onClick={() => submit.mutate()}
            >
              {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Lightbulb className="size-4" />}
              Get AI feedback
            </Button>
          )}
        </CardContent>
      </Card>

      {lastFeedback && (
        <Card className="border-success/30">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <ScoreRing value={lastFeedback.overall} size={72} stroke={7} color={scoreColor(lastFeedback.overall)}>
                <span className="text-lg font-bold">{lastFeedback.overall}</span>
              </ScoreRing>
              <div className="flex-1 space-y-2">
                {FEEDBACK_BARS.map((f) => (
                  <div key={f.key}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="font-semibold">{lastFeedback[f.key]}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-success" style={{ width: `${lastFeedback[f.key] || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {(lastFeedback.strengths || []).length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-success">Strengths</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(lastFeedback.strengths || []).map((st, i) => <li key={i}>• {st}</li>)}
                </ul>
              </div>
            )}
            {(lastFeedback.improvements || []).length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-warning">Improve</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(lastFeedback.improvements || []).map((im, i) => <li key={i}>• {im}</li>)}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
              {idx < s.questions.length - 1 ? (
                <Button onClick={goNext}>
                  Next question <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                  {completeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Complete &amp; view report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}