import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  FileText,
  Target,
  Mic2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Wrench,
  Clock,
  Briefcase,
  Zap,
  BookOpen,
  Award,
  ChevronRight,
  FolderOpen,
  MessageSquareCode,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { intelligenceAPI, studioAPI, interviewAPI } from '../../services/api';
import {
  getMasterCareerProfile,
  calculateProfileScore,
  SYNC_EVENT_NAME,
} from '../../services/careerProfileSync';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import PageHeader from '../../components/workspace/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CareerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getMasterCareerProfile());

  useEffect(() => {
    const handleSync = () => setProfile(getMasterCareerProfile());
    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Live queries across the unified ecosystem
  const intelligence = useQuery({
    queryKey: ['intelligence', 'overview'],
    queryFn: () => intelligenceAPI.overview().then((r) => r.data),
  });

  const resumes = useQuery({
    queryKey: ['studio', 'resumes'],
    queryFn: () => studioAPI.listResumes().then((r) => r.data || []),
  });

  const profileScore = useMemo(() => calculateProfileScore(profile), [profile]);

  const targetRole = useMemo(() => {
    return (
      profile?.personalInfo?.headline ||
      profile?.summary?.targetRoles?.[0] ||
      'Software Engineer'
    );
  }, [profile]);

  const candidateName = useMemo(() => {
    return profile?.personalInfo?.fullName || 'Candidate';
  }, [profile]);

  // Derived state for the 4 outcome cards
  const latestResume = useMemo(() => {
    const list = resumes.data || [];
    if (list.length === 0) return null;
    return list[0];
  }, [resumes.data]);

  const resumeScore = useMemo(() => {
    if (!latestResume) return null;
    return latestResume.ats?.score ?? latestResume.ats_score ?? latestResume.ats?.overall ?? null;
  }, [latestResume]);

  const interviewStats = useMemo(() => {
    const data = intelligence.data;
    if (!data) return { count: 0, avg: 0 };
    return {
      count: data.stats?.interviewsCompleted || 0,
      avg: data.stats?.averageInterviewScore || data.readiness?.interview || 0,
    };
  }, [intelligence.data]);

  const skillGaps = useMemo(() => {
    const data = intelligence.data;
    if (data?.skillGaps && data.skillGaps.length > 0) {
      return data.skillGaps;
    }
    // Contextual fallback based on target role
    return ['System Design', 'Redis & Caching', 'Cloud APIs & Security'];
  }, [intelligence.data]);

  const overallReadiness = useMemo(() => {
    if (intelligence.data?.readiness?.overall) {
      return Math.round(intelligence.data.readiness.overall);
    }
    // Compute composite if API loading
    const resWeight = resumeScore ? Number(resumeScore) * 0.35 : 20;
    const profWeight = profileScore * 0.35;
    const intWeight = (interviewStats.avg || 65) * 0.3;
    return Math.min(100, Math.round(resWeight + profWeight + intWeight));
  }, [intelligence.data, resumeScore, profileScore, interviewStats.avg]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── Hero Command Center Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              <Sparkles className="size-3.5" />
              <span>HireMind AI · Your Intelligent Career Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-foreground tracking-tight">
              Welcome back, {candidateName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Your unified career command center. Monitor resume optimization, job-match readiness,
              interview performance, and skill-gap learning in real time.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Badge variant="outline" className="rounded-lg text-xs py-1 px-3">
                <Target className="size-3.5 mr-1.5 text-primary" /> Target Role: {targetRole}
              </Badge>
              <Badge variant="outline" className="rounded-lg text-xs py-1 px-3">
                <ShieldCheck className="size-3.5 mr-1.5 text-emerald-500" /> Career Profile: {profileScore}% Complete
              </Badge>
            </div>
          </div>

          {/* Overall Readiness Ring */}
          <div className="flex items-center gap-5 rounded-2xl border border-border/80 bg-background/80 p-4 backdrop-blur-xs shrink-0">
            <ScoreRing
              value={overallReadiness}
              size={110}
              stroke={9}
              color={scoreColor(overallReadiness)}
              track="rgba(0, 132, 255, 0.12)"
            >
              <span className="font-heading text-2xl font-black text-foreground">
                {overallReadiness}%
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Readiness
              </span>
            </ScoreRing>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">Job-Ready Index</p>
              <p className="text-[11px] text-muted-foreground max-w-[140px] leading-tight">
                Derived from resume ATS, verified skills, and interview tests.
              </p>
              <span
                className="inline-block text-[11px] font-semibold mt-1"
                style={{ color: scoreColor(overallReadiness) }}
              >
                ● {scoreLabel(overallReadiness)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Primary Outcome Pillars (Direct User Roadmap Alignment) ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Core Career Outcomes
          </h2>
          <span className="text-xs text-muted-foreground">
            Synchronized with your Master Profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Resume Outcome Card */}
          <Card className="rounded-2xl border-border/80 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                {resumeScore != null ? (
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(Number(resumeScore))}% ATS
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Draft
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resume Studio
                </p>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5 truncate">
                  {latestResume ? latestResume.name : 'Ready to improve'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {latestResume
                    ? `v${latestResume.versionNumber || latestResume.version_number || 1} · ${latestResume.role || targetRole}`
                    : 'Build or import your resume to start versioned ATS optimization.'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(latestResume ? `/resumes/${latestResume.id}` : '/resumes')}
                className="w-full text-xs font-semibold rounded-xl group"
              >
                Continue editing
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>

          {/* 2. Target Job & Match Card */}
          <Card className="rounded-2xl border-border/80 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Target className="size-5" />
                </div>
                <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  Target Role
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Job Match &amp; ATS
                </p>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5 truncate">
                  {targetRole}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Compare your credentials against live job descriptions to find keyword gaps.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/jd-match')}
                className="w-full text-xs font-semibold rounded-xl group"
              >
                Analyze a job description
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>

          {/* 3. Interview Prep Outcome Card */}
          <Card className="rounded-2xl border-border/80 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Mic2 className="size-5" />
                </div>
                <span className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                  {interviewStats.count > 0 ? `${interviewStats.count} Done` : 'Ready'}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Interview Coach
                </p>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5 truncate">
                  {interviewStats.count > 0 ? `Avg: ${Math.round(interviewStats.avg)}%` : 'Practice next'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Role-specific technical MCQs, system design questions, and STAR behavioral coaching.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/interviews/mock')}
                className="w-full text-xs font-semibold rounded-xl group"
              >
                Start a mock interview
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>

          {/* 4. AI Learning Academy Card */}
          <Card className="rounded-2xl border-border/80 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <GraduationCap className="size-5" />
                </div>
                <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {skillGaps.length} Gaps
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Learning Academy
                </p>
                <h3 className="font-heading text-base font-bold text-foreground mt-0.5 truncate">
                  Your next lesson
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Targeted micro-lessons and portfolio project briefs for: {skillGaps.slice(0, 2).join(', ')}.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/learning')}
                className="w-full text-xs font-semibold rounded-xl group"
              >
                Continue learning
                <ArrowRight className="size-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recommended Next Actions (Real-Time Guided Workflow) ── */}
      <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold font-heading">
                Recommended Next Actions
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Targeted steps calculated from your skill gaps and resume benchmarks
              </p>
            </div>
            <Sparkles className="size-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {/* Action 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card transition-all">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Improve your resume
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Compare your latest version against a live {targetRole} job description to eliminate weak bullet points.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/jd-match')}
              className="rounded-xl text-xs font-semibold shrink-0"
            >
              Tailor to Job
            </Button>
          </div>

          {/* Action 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card transition-all">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                <Mic2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Practice {skillGaps[0] || 'System Design'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Take a 10-minute AI technical drill with rubric evaluation and model answer comparisons.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/interviews/questions')}
              className="rounded-xl text-xs font-semibold shrink-0"
            >
              Start Drill
            </Button>
          </div>

          {/* Action 3 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 hover:border-primary/40 bg-card transition-all">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Build a practical project
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add concrete evidence to your Career Vault for identified gaps ({skillGaps.slice(0, 2).join(', ')}).
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/career-profile')}
              className="rounded-xl text-xs font-semibold shrink-0"
            >
              Add Evidence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 6 Unified Application Modules Navigation Grid ── */}
      <div>
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            The 6 Unified Platform Modules
          </h2>
          <p className="text-xs text-muted-foreground">
            Every module reads and updates your single Career Vault memory
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1 */}
          <Link
            to="/resumes"
            className="group p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
                Module 01
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
              Resume Studio
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Live resume builder, ATS keyword diagnostic, version branching, and PDF/DOCX exports.
            </p>
          </Link>

          {/* Module 2 */}
          <Link
            to="/jd-match"
            className="group p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-500 tracking-widest uppercase">
                Module 02
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-purple-500 transition-colors">
              Job Match &amp; ATS Analyzer
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Match resumes to JD postings, identify missing keywords, and tailor bullet points accurately.
            </p>
          </Link>

          {/* Module 3 */}
          <Link
            to="/interviews"
            className="group p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-500 tracking-widest uppercase">
                Module 03
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-sky-500 transition-colors">
              Interview Coach
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Deep web-searched question bank, AI mock interview simulator, and 4-dimension rubric scoring.
            </p>
          </Link>

          {/* Module 4 */}
          <Link
            to="/learning"
            className="group p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">
                Module 04
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">
              AI Learning Academy
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Bridge demonstrated skill gaps with curated lessons, practical projects, and quiz assessments.
            </p>
          </Link>

          {/* Module 5 */}
          <Link
            to="/career-profile"
            className="group p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">
                Module 05
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors">
              Career Vault
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Single source of truth for verified skills, career history, certificates, and application memory.
            </p>
          </Link>

          {/* Module 6 */}
          <Link
            to="/career/advisor"
            className="group p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">
                Module 06
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-rose-500 transition-colors">
              HireMind AI Assistant
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              Grounded AI career strategist answering questions against your authentic documents and goals.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
