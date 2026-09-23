import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, Wand2, ScanSearch, Mic2, MessagesSquare, Loader2, ArrowRight } from 'lucide-react';
import { intelligenceAPI, careerAPI, studioAPI } from '../../services/api';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeDate } from '../../components/workspace/utils';

const QUICK = [
  { label: 'Create Resume', href: '/resume-studio/new', icon: FileText, desc: 'Start from a template' },
  { label: 'Tailor Resume', href: '/resume-studio/jd-tailor', icon: Wand2, desc: 'Optimize for a job description' },
  { label: 'ATS Check', href: '/ats-analyzer', icon: ScanSearch, desc: 'Verify ATS compatibility' },
  { label: 'Practice Interview', href: '/interview', icon: Mic2, desc: 'Category-based preparation' },
  { label: 'Mock Interview', href: '/interview/mock', icon: MessagesSquare, desc: 'AI-led practice session' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const overview = useQuery({ queryKey: ['intelligence', 'overview'], queryFn: () => intelligenceAPI.overview().then((r) => r.data), retry: 1 });
  const completion = useQuery({ queryKey: ['career', 'completion'], queryFn: () => careerAPI.completion().then((r) => r.data), retry: 1 });
  const resumes = useQuery({ queryKey: ['studio', 'resumes'], queryFn: () => studioAPI.listResumes().then((r) => r.data || []), retry: 1 });

  const firstName = user?.name?.split(' ')[0] || 'there';
  const readiness = overview.data?.readiness || {};
  const avgAts = overview.data?.stats?.averageAts;
  const profiles = resumes.data || [];

  const careerScore = completion.data?.completion ?? readiness.profile ?? 0;
  const resumeResumeScore = readiness.resume || readiness.ats;
  const resumeScore = resumeResumeScore || avgAts || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Your resume and interview preparation workspace.
        </p>
      </div>

      {/* Readiness cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-heading text-sm font-semibold">Career Profile</p>
            {completion.isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing value={careerScore} size={112} stroke={10} color={scoreColor(careerScore)}>
              <span className="font-heading text-2xl font-bold tabular-nums">{Math.round(careerScore)}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">complete</span>
            </ScoreRing>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Keep this the foundation of every resume and interview session.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => navigate('/career-vault')}
              >
                Complete <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-heading text-sm font-semibold">Resume Readiness</p>
            {overview.isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="mt-4 flex items-center gap-5">
            <ScoreRing value={resumeScore} size={112} stroke={10} color={scoreColor(resumeScore)}>
              <span className="font-heading text-2xl font-bold tabular-nums">{Math.round(resumeScore)}</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{scoreLabel(resumeScore)}</span>
            </ScoreRing>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {profiles.length
                  ? `${profiles.length} resume${profiles.length === 1 ? '' : 's'} in your studio — verify them against a JD.`
                  : 'Create a resume first, then analyze it for ATS compatibility.'}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => navigate(profiles.length ? '/ats-analyzer' : '/resume-studio/new')}
              >
                {profiles.length ? 'Analyze' : 'Create resume'} <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-heading mb-4 text-sm font-semibold">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK.map((q) => (
            <button
              key={q.label}
              onClick={() => navigate(q.href)}
              className="group flex flex-col items-start gap-3 rounded-lg border border-border p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <q.icon className="size-4" />
              </div>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{q.label}</span>
                <span className="block text-xs text-muted-foreground">{q.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent resumes */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">Recent resumes</p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/resume-studio')}>
            Open studio <ArrowRight className="size-3.5" />
          </Button>
        </div>
        {resumes.isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            description="Create your first resume from a template to get an ATS score."
          />
        ) : (
          <div className="divide-y divide-border">
            {profiles.slice(0, 3).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Updated {safeDate(r.updated_at)}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    !r.ats
                      ? 'text-muted-foreground'
                      : r.ats.score >= 75
                        ? 'border-success/25 text-success bg-success/10'
                        : 'border-warning/25 text-warning bg-warning/10'
                  }
                >
                  {r.ats ? `ATS ${r.ats.score}` : 'Not analyzed'}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/resume-studio/${r.id}/edit`)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/ats-analyzer', { state: { resumeId: r.id } })}>ATS</Button>
                <Button size="sm" variant="outline" onClick={() => navigate('/resume-studio/jd-tailor', { state: { resumeId: r.id } })}>Tailor</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}