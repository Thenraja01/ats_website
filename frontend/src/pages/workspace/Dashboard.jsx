import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FileText, Wand2, ScanSearch, Mic2, MessagesSquare, Loader2, ArrowRight,
  Sparkles, CheckCircle2, TrendingUp, Briefcase, ChevronRight, AlertCircle,
  Clock, ShieldCheck, Zap
} from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeDate } from '../../components/workspace/utils';

const QUICK_ACTIONS = [
  { label: 'Create Resume', href: '/resumes/new', icon: FileText, desc: '10-step guided builder' },
  { label: 'ATS Analyzer', href: '/resumes/analyze', icon: ScanSearch, desc: 'Score & keyword breakdown' },
  { label: 'JD Match', href: '/jd-match', icon: Wand2, desc: 'Tailor resume to job description' },
  { label: 'Mock Interview', href: '/interviews/mock', icon: MessagesSquare, desc: 'Interactive AI practice' },
  { label: 'Application Tracker', href: '/applications', icon: Briefcase, desc: 'Kanban job pipeline' },
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

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.get().then((r) => r.data),
    retry: 1,
  });

  const firstName = user?.name?.split(' ')[0] || dashboard?.user_name?.split(' ')[0] || 'there';
  const profileCompletion = dashboard?.profile_completion ?? 0;
  const resumeScore = dashboard?.resume_score ?? 0;
  const interviewReadiness = dashboard?.interview_readiness ?? 0;
  const apps = dashboard?.applications || { total: 0, applied: 0, screening: 0, interviews: 0, offers: 0 };
  const recommendations = dashboard?.recommendations || [];
  const recentResumes = dashboard?.recent_resumes || [];
  const recentInterviews = dashboard?.recent_interviews || [];
  const recentApplications = dashboard?.recent_applications || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome to your personal career workspace. Here is your current preparation status.
        </p>
      </div>

      {/* Main Readiness Gauge Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile Completion */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Health</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{profileCompletion}%</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Master profile foundation</p>
            </div>
            <ScoreRing value={profileCompletion} size={48} stroke={5} color={scoreColor(profileCompletion)}>
              <span className="text-[10px] font-bold">{profileCompletion}%</span>
            </ScoreRing>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-3 justify-between text-xs h-7 px-2"
            onClick={() => navigate('/profile')}
          >
            Update Profile <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* Resume ATS Score */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume ATS</span>
            <ScanSearch className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{resumeScore}/100</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{scoreLabel(resumeScore)}</p>
            </div>
            <ScoreRing value={resumeScore} size={48} stroke={5} color={scoreColor(resumeScore)}>
              <span className="text-[10px] font-bold">{resumeScore}</span>
            </ScoreRing>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-3 justify-between text-xs h-7 px-2"
            onClick={() => navigate('/resumes')}
          >
            Manage Resumes <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* Interview Readiness */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interview Readiness</span>
            <Mic2 className="size-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{interviewReadiness}%</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">AI mock session average</p>
            </div>
            <ScoreRing value={interviewReadiness} size={48} stroke={5} color={scoreColor(interviewReadiness)}>
              <span className="text-[10px] font-bold">{interviewReadiness}%</span>
            </ScoreRing>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-3 justify-between text-xs h-7 px-2"
            onClick={() => navigate('/interviews/mock')}
          >
            Practice Session <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* Applications Progress */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Applications</span>
            <Briefcase className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{apps.total}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {apps.interviews} interview{apps.interviews === 1 ? '' : 's'} · {apps.offers} offer{apps.offers === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm">
              {apps.total}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-3 justify-between text-xs h-7 px-2"
            onClick={() => navigate('/applications')}
          >
            Open Tracker <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* AI Next Steps & Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" />
            <p className="font-heading text-sm font-semibold">AI Career Recommendations</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col justify-between rounded-lg border border-border/80 bg-background/80 p-3.5 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground">{rec.title}</h3>
                    {rec.priority === 'high' && (
                      <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-medium text-rose-500">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full text-xs h-7"
                  onClick={() => navigate(rec.action_link)}
                >
                  {rec.action_text} <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-heading mb-3 text-sm font-semibold">Workspace Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {QUICK_ACTIONS.map((q) => (
            <button
              key={q.label}
              onClick={() => navigate(q.href)}
              className="group flex flex-col items-start gap-2.5 rounded-lg border border-border p-3.5 text-left transition-all hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <q.icon className="size-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-foreground">{q.label}</span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">{q.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Resumes & Recent Applications 2-Column */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resumes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-sm font-semibold">My Resumes</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/resumes')}>
              View all <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentResumes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No resumes yet"
              description="Build your first professional resume with the 10-step AI builder."
            />
          ) : (
            <div className="divide-y divide-border/60">
              {recentResumes.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-xs font-semibold text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">Version {r.version_number} · {safeDate(r.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={
                        r.ats?.score >= 75
                          ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-[10px]'
                          : 'border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px]'
                      }
                    >
                      {r.ats ? `ATS ${r.ats.score}` : 'Draft'}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => navigate(`/resumes/new`)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-sm font-semibold">Tracked Applications</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>
              View all <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentApplications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No applications tracked yet"
              description="Track job applications and keep your interview stages organized."
            />
          ) : (
            <div className="divide-y divide-border/60">
              {recentApplications.slice(0, 4).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-xs font-semibold text-foreground">{app.role || app.job_title}</p>
                    <p className="text-[11px] text-muted-foreground">{app.company} · {app.location || 'Remote'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {app.status || 'applied'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}