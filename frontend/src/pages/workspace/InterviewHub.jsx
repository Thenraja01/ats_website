import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, FolderGit2, Mic2, Library, ClipboardList, ArrowRight } from 'lucide-react';
import { interviewAPI, intelligenceAPI } from '../../services/api';
import ScoreRing, { scoreColor } from '../../components/workspace/ScoreRing';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TECH_CATEGORIES = ['Frontend', 'Backend', 'Database', 'AI/ML', 'RAG', 'DevOps', 'System Design'];
const PEOPLE_CATEGORIES = ['Behavioral', 'HR'];

export default function InterviewHub() {
  const navigate = useNavigate();

  const saved = useQuery({
    queryKey: ['interview', 'saved'],
    queryFn: () => interviewAPI.questions({ savedOnly: true, limit: 200 }).then((r) => r.data || []),
    retry: 1,
  });
  const sessions = useQuery({ queryKey: ['interview', 'sessions'], queryFn: () => interviewAPI.sessions().then((r) => r.data || []), retry: 1 });
  const overview = useQuery({ queryKey: ['intelligence', 'overview'], queryFn: () => intelligenceAPI.overview().then((r) => r.data), retry: 1 });

  const savedList = saved.data || [];
  const sessionList = sessions.data || [];
  const completed = sessionList.filter((s) => s.status === 'completed').length;

  const countFor = (cats) => savedList.filter((q) => cats.includes(q.category)).length;

  const techSaved = countFor(TECH_CATEGORIES);
  const peopleSaved = countFor(PEOPLE_CATEGORIES);
  const projectSaved = countFor(['Project']);

  const ready = (savedN) => Math.min(100, Math.round(savedN * 12 + completed * 4));
  const overall = overview.data?.readiness?.interview || ready(techSaved + peopleSaved + projectSaved);

  const cards = [
    {
      title: 'Technical Interview',
      desc: 'Frontend, backend, database, AI/ML, RAG, DevOps and system design.',
      value: ready(techSaved),
      sub: `${techSaved} saved question${techSaved === 1 ? '' : 's'}`,
      icon: Code2,
      tone: 'text-primary bg-primary/12',
      practice: () => navigate('/interview/mock'),
      accent: () => navigate('/interview/questions'),
    },
    {
      title: 'HR / Behavioral Interview',
      desc: 'Behavioral, situational and HR-fit questions drawn from your profile.',
      value: ready(peopleSaved),
      sub: `${peopleSaved} saved question${peopleSaved === 1 ? '' : 's'}`,
      icon: Users,
      tone: 'text-ai bg-ai/12',
      practice: () => navigate('/interview/mock', { state: { category: 'Behavioral' } }),
      accent: () => navigate('/interview/questions', { state: { category: 'Behavioral' } }),
    },
    {
      title: 'Project Interview',
      desc: 'Deep-dive questions on the projects stored in your Career Vault.',
      value: ready(projectSaved),
      sub: `${projectSaved} saved question${projectSaved === 1 ? '' : 's'}`,
      icon: FolderGit2,
      tone: 'text-success bg-success/12',
      practice: () => navigate('/interview/project'),
      accent: () => navigate('/interview/project'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Interview Hub</h1>
          <p className="text-sm text-muted-foreground">
            Prepare based on YOUR career profile and resume — not generic job search.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/interview/questions')}>
            <Library className="size-4" /> Question Bank
          </Button>
          <Button variant="outline" onClick={() => navigate('/interview/reports')}>
            <ClipboardList className="size-4" /> Reports
          </Button>
        </div>
      </div>

      {/* Overall prep */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
          {overview.isLoading ? (
            <Skeleton className="size-20 rounded-full bg-muted" />
          ) : (
            <ScoreRing value={overall} size={80} stroke={8} color={scoreColor(overall)}>
              <span className="font-heading text-xl font-bold tabular-nums">{Math.round(overall)}</span>
            </ScoreRing>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold">Overall preparation</p>
            <p className="text-xs text-muted-foreground">
              {completed} completed mock session{completed === 1 ? '' : 's'} ·{' '}
              {savedList.length} saved question{savedList.length === 1 ? '' : 's'} from your question bank
              {completed === 0 && savedList.length === 0 ? ' — start a mock interview to build your first score.' : ''}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/interview/mock')}>
            <Mic2 className="size-4" /> Start mock interview
          </Button>
        </CardContent>
      </Card>

      {/* Category cards */}
      {saved.isError ? (
        <ErrorState error={saved.error} title="Couldn't load interview data" onRetry={() => saved.refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.title} className="transition-colors hover:border-primary/40">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${c.tone}`}>
                    <c.icon className="size-5" />
                  </div>
                  {saved.isLoading ? (
                    <Skeleton className="size-16 rounded-full bg-muted" />
                  ) : (
                    <ScoreRing value={c.value} size={64} stroke={7} color={scoreColor(c.value)}>
                      <span className="font-heading text-sm font-bold tabular-nums">{c.value}%</span>
                    </ScoreRing>
                  )}
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{c.sub}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 pt-1">
                  <Button size="sm" className="flex-1" onClick={c.practice}>Practice</Button>
                  <Button size="sm" variant="ghost" onClick={c.accent}>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!saved.isLoading && !saved.isError && savedList.length === 0 && sessionList.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Tip: save questions in the Question Bank or run a mock interview — your readiness %, here, is driven by that real activity.
        </p>
      )}
    </div>
  );
}