import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Users,
  FolderGit2,
  Mic2,
  Library,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Globe,
  Cpu,
  CheckCircle2,
  Loader2,
  Bot,
  Play,
  Clock,
  ExternalLink,
  Target,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { interviewAPI, intelligenceAPI, studioAPI } from '../../services/api';
import { getMasterCareerProfile } from '../../services/careerProfileSync';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import PageHeader from '../../components/workspace/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { safeDate } from '../../components/workspace/utils';

const TECH_CATEGORIES = ['Frontend', 'Backend', 'Database', 'AI/ML', 'RAG', 'DevOps', 'System Design'];
const PEOPLE_CATEGORIES = ['Behavioral', 'HR'];

export default function InterviewHub() {
  const navigate = useNavigate();
  const profile = useMemo(() => getMasterCareerProfile(), []);

  // Deep Research Dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [role, setRole] = useState(profile?.personalInfo?.headline || 'Full Stack Developer');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState(
    (profile?.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).slice(0, 6).join(', ') ||
      'React, Node.js, Python, PostgreSQL, Docker'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const pollIntervalRef = useRef(null);

  // Unified Mock Setup Form State
  const [mockTitle, setMockTitle] = useState('Full Stack Mock Interview');
  const [mockJobTitle, setMockJobTitle] = useState(profile?.personalInfo?.headline || '');
  const [mockCategory, setMockCategory] = useState('All');
  const [mockDifficulty, setMockDifficulty] = useState('All');
  const [mockCount, setMockCount] = useState('10');

  const meta = useQuery({
    queryKey: ['interview', 'meta'],
    queryFn: () => interviewAPI.meta().then((r) => r.data),
    retry: 1,
  });

  const saved = useQuery({
    queryKey: ['interview', 'saved'],
    queryFn: () => interviewAPI.questions({ savedOnly: true, limit: 200 }).then((r) => r.data || []),
    retry: 1,
  });

  const sessions = useQuery({
    queryKey: ['interview', 'sessions'],
    queryFn: () => interviewAPI.sessions().then((r) => r.data || []),
    retry: 1,
  });

  const overview = useQuery({
    queryKey: ['intelligence', 'overview'],
    queryFn: () => intelligenceAPI.overview().then((r) => r.data),
    retry: 1,
  });

  // Polling Celery task status for Deep Prep
  useEffect(() => {
    if (!activeTaskId || !isGenerating) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await interviewAPI.getTaskStatus(activeTaskId);
        const data = res.data;

        if (data.status === 'PROGRESS') {
          const step = data.step || 2;
          setCurrentStep(step);
          setStatusMessage(data.message || 'Conducting company research and synthesizing rounds...');
          setProgressPercent(Math.min(90, step * 25));
        } else if (data.status === 'SUCCESS') {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setProgressPercent(100);
          toast.success('Interview Prep generated successfully!');
          setModalOpen(false);
          setActiveTaskId(null);
          navigate('/interview/questions');
        } else if (data.status === 'FAILURE') {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          toast.error(data.error || 'Deep research generation failed.');
          setActiveTaskId(null);
        }
      } catch (err) {
        console.error('Task status check error:', err);
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeTaskId, isGenerating, navigate]);

  const handleStartDeepPrep = async () => {
    if (!role.trim()) {
      toast.error('Please specify a target role.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(1);
    setProgressPercent(15);
    setStatusMessage('Searching company expectations and industry interview trends...');

    try {
      const res = await interviewAPI.startDeepPrepTask({
        role: role.trim(),
        company: company.trim() || undefined,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });

      if (res.data?.task_id) {
        setActiveTaskId(res.data.task_id);
      } else {
        throw new Error('Task ID not received');
      }
    } catch (e) {
      setIsGenerating(false);
      toast.error(e?.response?.data?.detail || e.message || 'Could not queue interview generation.');
    }
  };

  // Start Mock Interview Mutation
  const startMockMutation = useMutation({
    mutationFn: () =>
      interviewAPI.createSession({
        sessionType: 'mock',
        title: mockTitle.trim() || 'AI Mock Interview',
        jobTitle: mockJobTitle.trim() || undefined,
        category: mockCategory,
        difficulty: mockDifficulty,
        count: Number(mockCount) || 10,
      }),
    onSuccess: (res) => {
      toast.success('Mock interview session ready!');
      navigate(`/interview/mock/${res.data.id}`);
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not start mock interview'),
  });

  const savedList = saved.data || [];
  const sessionList = sessions.data || [];
  const completedSessions = sessionList.filter((s) => s.status === 'completed');

  const countFor = (cats) => savedList.filter((q) => cats.includes(q.category)).length;
  const techSaved = countFor(TECH_CATEGORIES);
  const peopleSaved = countFor(PEOPLE_CATEGORIES);
  const projectSaved = countFor(['Project']);

  const ready = (savedN) => Math.min(100, Math.round(savedN * 12 + completedSessions.length * 5));
  const overallReadiness = overview.data?.readiness?.interview || ready(techSaved + peopleSaved + projectSaved);

  const roundCards = [
    {
      title: 'Technical Round',
      category: 'Technical',
      desc: 'Frontend, backend, databases, system design, and algorithmic problem-solving.',
      score: ready(techSaved),
      icon: Code2,
      badge: `${techSaved} saved questions`,
      tone: 'text-[#0084FF] bg-[#0084FF]/10',
    },
    {
      title: 'Behavioral & STAR',
      category: 'Behavioral',
      desc: 'Situational leadership, conflict resolution, and communication structure.',
      score: ready(peopleSaved),
      icon: Users,
      badge: `${peopleSaved} saved questions`,
      tone: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Project Defense',
      category: 'System Design',
      desc: 'Deep-dive questions challenging decisions made in your Career Vault projects.',
      score: ready(projectSaved),
      icon: FolderGit2,
      badge: `${projectSaved} saved questions`,
      tone: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header ── */}
      <PageHeader
        title="Interview Coach"
        description="Unified practice hub. Simulate AI mock interviews, practice question rounds, and get 4-dimension rubric feedback."
        icon={Mic2}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold rounded-xl border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="size-3.5 mr-1.5" /> AI Deep Prep
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/interview/questions')}
              className="text-xs font-semibold rounded-xl"
            >
              <Library className="size-3.5 mr-1.5" /> Question Bank
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/interview/reports')}
              className="text-xs font-semibold rounded-xl"
            >
              <ClipboardList className="size-3.5 mr-1.5" /> Reports
            </Button>
          </div>
        }
      />

      {/* ── Top Highlight Readiness & Deep Prep Banner ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Overall Readiness Gauge */}
        <Card className="lg:col-span-5 rounded-2xl border-border/80 shadow-xs flex items-center p-5">
          <div className="flex items-center gap-5 w-full">
            <ScoreRing
              value={overallReadiness}
              size={88}
              stroke={8}
              color={scoreColor(overallReadiness)}
              track="rgba(0, 132, 255, 0.12)"
            >
              <span className="font-heading text-xl font-black text-foreground">
                {Math.round(overallReadiness)}%
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">
                Ready
              </span>
            </ScoreRing>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Interview Readiness
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(0, 132, 255, 0.1)',
                    color: scoreColor(overallReadiness),
                  }}
                >
                  {scoreLabel(overallReadiness)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {completedSessions.length} completed session{completedSessions.length === 1 ? '' : 's'} ·{' '}
                {savedList.length} questions in practice bank.
              </p>
            </div>
          </div>
        </Card>

        {/* Right: AI Deep Research Feature Strip */}
        <Card className="lg:col-span-7 rounded-2xl border-border/80 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
              <Bot className="size-3" />
              <span>Ollama llama3.2 Autonomous Prep</span>
            </div>
            <h3 className="font-heading text-sm font-bold text-foreground">
              Company-Targeted Question Synthesizer
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-lg">
              Searches live hiring expectations for your target employer and generates Aptitude, Technical, and System Design rounds.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="rounded-xl text-xs font-semibold bg-primary text-white shrink-0 shadow-xs"
          >
            <Sparkles className="size-3.5 mr-1.5" /> Launch Deep Prep
          </Button>
        </Card>
      </div>

      {/* ── Main Unified Hub Layout: Simulator (Left) + Recent Sessions (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Launch AI Mock Interview & Rounds */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Launch Card */}
          <Card className="rounded-2xl border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-heading">
                    Launch AI Mock Interview
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Live 1-on-1 simulation with real-time feedback across Relevance, Accuracy, Clarity &amp; Depth.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-medium">
                  {mockCategory === 'All' ? 'Full Spectrum' : mockCategory}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Target Job Role</Label>
                  <Input
                    value={mockJobTitle}
                    onChange={(e) => setMockJobTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="mt-1.5 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Interview Category</Label>
                  <Select value={mockCategory} onValueChange={setMockCategory}>
                    <SelectTrigger className="mt-1.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['All', 'Technical', 'Frontend', 'Backend', 'System Design', 'Behavioral', 'HR'].map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Experience Level</Label>
                  <Select value={mockDifficulty} onValueChange={setMockDifficulty}>
                    <SelectTrigger className="mt-1.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['All', 'Junior', 'Mid', 'Senior', 'Staff'].map((d) => (
                        <SelectItem key={d} value={d} className="text-xs">
                          {d} Level
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Number of Questions</Label>
                  <Select value={mockCount} onValueChange={setMockCount}>
                    <SelectTrigger className="mt-1.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['5', '8', '10', '12', '15'].map((n) => (
                        <SelectItem key={n} value={n} className="text-xs">
                          {n} Questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full bg-[#0084FF] hover:bg-[#0074E0] text-white rounded-xl text-xs font-semibold h-10 shadow-xs mt-2"
                onClick={() => startMockMutation.mutate()}
                disabled={startMockMutation.isPending}
              >
                {startMockMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Preparing Custom Mock Session…
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    Start Mock Interview Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick-Preset Category Rounds */}
          <div>
            <p className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
              Practice by Focus Area
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roundCards.map((rc) => (
                <div
                  key={rc.title}
                  onClick={() => {
                    setMockCategory(rc.category);
                    setMockTitle(`${rc.title}`);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    mockCategory === rc.category
                      ? 'border-[#0084FF] bg-[#0084FF]/5 ring-1 ring-[#0084FF]'
                      : 'border-border/80 bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`size-8 rounded-xl flex items-center justify-center ${rc.tone}`}>
                      <rc.icon className="size-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {rc.score}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{rc.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {rc.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Previous Mock Sessions & Reports */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Recent Mock Sessions ({sessionList.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/interview/reports')}
              className="text-xs text-primary hover:underline h-auto p-0"
            >
              View All Reports
            </Button>
          </div>

          {sessions.isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-18 rounded-2xl" />
              ))}
            </div>
          ) : sessionList.length === 0 ? (
            <EmptyState
              icon={Mic2}
              title="No mock sessions yet"
              description="Configure role settings on the left to launch your first session."
            />
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {sessionList.slice(0, 8).map((s) => {
                const isComplete = s.status === 'completed';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      navigate(isComplete ? `/interview/reports/${s.id}` : `/interview/mock/${s.id}`)
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3.5 text-left transition-all hover:border-[#0084FF] hover:shadow-xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="size-4.5" />
                        ) : (
                          <Clock className="size-4.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground group-hover:text-[#0084FF] transition-colors">
                          {s.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                          {s.questions?.length || 0} questions · {safeDate(s.createdAt)}
                        </p>
                      </div>
                    </div>

                    {s.feedback?.overall != null ? (
                      <ScoreRing
                        value={s.feedback.overall}
                        size={38}
                        stroke={4}
                        color={scoreColor(s.feedback.overall)}
                      >
                        <span className="text-[10px] font-bold">
                          {Math.round(s.feedback.overall)}
                        </span>
                      </ScoreRing>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {isComplete ? 'Done' : 'Resume'}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Autonomous Deep Research Prep Dialog ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Bot className="size-4" /> Autonomous Prep Agent
            </div>
            <DialogTitle className="font-heading text-xl">
              Deep Research Interview Pack
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Our background agent searches live web trends for your target company, extracts your resume skills, and synthesizes Aptitude, Logic, Technical &amp; System Design questions with local Ollama (<code className="text-primary font-mono text-[11px]">llama3.2</code>).
            </DialogDescription>
          </DialogHeader>

          {!isGenerating ? (
            <div className="space-y-4 py-3">
              <div>
                <Label htmlFor="role-input" className="text-xs font-semibold">Target Job Role</Label>
                <Input
                  id="role-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
              <div>
                <Label htmlFor="company-input" className="text-xs font-semibold">Target Company (Optional)</Label>
                <Input
                  id="company-input"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google, Amazon, Stripe (or blank for industry average)"
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
              <div>
                <Label htmlFor="skills-input" className="text-xs font-semibold">Core Candidate Skills</Label>
                <Input
                  id="skills-input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, FastAPI, Redis, Kafka, Docker"
                  className="mt-1 rounded-xl text-xs"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Comma-separated skills from your profile or resume.</p>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button onClick={handleStartDeepPrep} className="bg-primary text-white rounded-xl text-xs font-semibold">
                  <Sparkles className="size-4 mr-1.5" /> Start Research &amp; Synthesize
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6 space-y-5">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <Loader2 className="size-7 animate-spin text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold">Deep Research Agent Active</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {statusMessage || 'Analyzing company expectations and building custom rounds...'}
                </p>
              </div>

              <div className="space-y-1.5 px-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pipeline Progress</span>
                  <span className="font-semibold text-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${currentStep >= 1 ? 'border-primary/40 bg-primary/5 text-foreground' : 'opacity-40 border-border'}`}>
                  <CheckCircle2 className={`size-4 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>Resume Profile</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${currentStep >= 2 ? 'border-primary/40 bg-primary/5 text-foreground' : 'opacity-40 border-border'}`}>
                  <Globe className={`size-4 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>Web Research</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${currentStep >= 3 ? 'border-primary/40 bg-primary/5 text-foreground' : 'opacity-40 border-border'}`}>
                  <Cpu className={`size-4 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>Ollama Llama3.2</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${currentStep >= 4 ? 'border-success/40 bg-success/5 text-foreground' : 'opacity-40 border-border'}`}>
                  <CheckCircle2 className={`size-4 ${currentStep >= 4 ? 'text-success' : 'text-muted-foreground'}`} />
                  <span>Ready to Practice</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}