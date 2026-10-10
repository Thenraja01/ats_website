import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ScanSearch,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Target,
  Wand2,
  ShieldCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Code2,
  GraduationCap,
  Plus,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { studioAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SAMPLE_JDS = [
  {
    role: 'Full Stack Engineer',
    text: `Looking for a Full Stack Engineer to build high-scale web platforms using React, TypeScript, Node.js, and PostgreSQL. Experience with Docker, Redis caching, REST/GraphQL APIs, and AWS deployment required. Strong foundation in system design, CI/CD pipelines, and automated testing (Jest/Cypress).`,
  },
  {
    role: 'Backend & Cloud Engineer',
    text: `Seeking a Backend Engineer proficient in Python (FastAPI/Django), PostgreSQL, and distributed architectures. Must have hands-on experience with Redis, message brokers (RabbitMQ/Kafka), microservices, Docker containerization, and AWS cloud security. Strong focus on database indexing and API performance.`,
  },
  {
    role: 'DevOps & Platform Engineer',
    text: `Hiring a DevOps Engineer to manage Kubernetes clusters, Terraform infrastructure-as-code, and GitHub Actions CI/CD workflows. Deep knowledge of Linux, Docker, AWS/GCP, Prometheus monitoring, and secure secrets management required.`,
  },
];

export default function AtsAnalyzer() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const presetResume = location.state?.resumeId || '';
  const [resumeId, setResumeId] = useState(presetResume);
  const [targetTitle, setTargetTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const resumes = useQuery({
    queryKey: ['studio', 'resumes'],
    queryFn: () => studioAPI.listResumes().then((r) => r.data || []),
  });
  const resumesList = resumes.data || [];

  // Unified ATS diagnostic mutation
  const analyzeMutation = useMutation({
    mutationFn: async ({ id, jd, title }) => {
      // 1. Run ATS pipeline
      const atsRes = await studioAPI.runAts(id, { jd_text: jd }).then((r) => r.data);

      // 2. Run tailoring assessment if JD is provided
      let tailorRes = null;
      if (jd.trim()) {
        try {
          const t = await studioAPI.tailorAssess({
            resumeId: id,
            jdText: jd,
            targetJobTitle: title || undefined,
          });
          tailorRes = t.data;
        } catch (e) {
          console.warn('Tailoring assess fallback:', e);
        }
      }

      return {
        ats: atsRes.ats || atsRes,
        tailor: tailorRes,
      };
    },
    onSuccess: () => {
      toast.success('ATS & Job Match diagnostic complete');
      queryClient.invalidateQueries({ queryKey: ['studio', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'overview'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Analysis failed. Please check inputs.'),
  });

  // 1-Click Tailored Resume Creation
  const createTailoredMutation = useMutation({
    mutationFn: async () => {
      if (!resumeId) throw new Error('Select a source resume');
      const source = await studioAPI.getResume(resumeId).then((r) => r.data);
      const baseData = { ...(source?.data || {}) };

      const safeSkills = analyzeMutation.data?.tailor?.safeImprovements
        ?.flatMap((s) => s.addSkills || [])
        .map((name) =>
          typeof name === 'string'
            ? { name, category: 'Technical', proficiency: 'Advanced', verified: true }
            : name
        );

      const mergedSkills = [
        ...(Array.isArray(baseData.skills) ? baseData.skills : []),
        ...(safeSkills || []),
      ].filter((s, i, arr) => {
        const n = typeof s === 'string' ? s : s?.name;
        return n && arr.findIndex((x) => (typeof x === 'string' ? x : x?.name) === n) === i;
      });

      baseData.skills = mergedSkills;
      if (targetTitle) {
        baseData.summary = {
          ...(baseData.summary || {}),
          primary: `Targeting ${targetTitle} with verified technical background.`,
        };
      }

      return studioAPI.tailorCreate({
        sourceResumeId: resumeId,
        name: `Tailored — ${targetTitle || 'Target JD'}`,
        jdTitle: targetTitle || 'Target Role',
        jdText,
        data: baseData,
      });
    },
    onSuccess: (res) => {
      const created = res.data;
      toast.success(`Tailored version v${created.versionNumber || 2} created!`);
      navigate(`/resumes/${created.id}`);
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not create tailored version'),
  });

  const handleRunAnalysis = () => {
    if (!resumeId) {
      toast.error('Please select a resume version to analyze');
      return;
    }
    analyzeMutation.mutate({ id: resumeId, jd: jdText, title: targetTitle });
  };

  const handleLoadSample = (sample) => {
    setTargetTitle(sample.role);
    setJdText(sample.text);
    toast.info(`Loaded sample JD: ${sample.role}`);
  };

  const analysisResult = analyzeMutation.data;
  const atsScore = analysisResult?.ats?.score ?? analysisResult?.ats?.overall ?? null;
  const missingSkills = useMemo(() => {
    const listAts = analysisResult?.ats?.missing_skills || [];
    const listTailor = analysisResult?.tailor?.missingSkills || [];
    const set = new Set([...listAts, ...listTailor]);
    return Array.from(set);
  }, [analysisResult]);

  const matchedSkills = useMemo(() => {
    return analysisResult?.tailor?.matchedSkills || [];
  }, [analysisResult]);

  const suggestions = useMemo(() => {
    return analysisResult?.ats?.suggestions || [];
  }, [analysisResult]);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Job Match & ATS Scanner"
        description="Single-page diagnostic engine. Benchmark resume parseability, score keyword match against job descriptions, and generate factually-accurate tailored versions."
        icon={ScanSearch}
      />

      {/* ── Input Card (Resume + Target JD) ── */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Resume Version Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Select Source Resume
              </Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Choose a resume version" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.isLoading ? (
                    <SelectItem value="__loading" disabled>
                      Loading resumes…
                    </SelectItem>
                  ) : resumesList.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      No saved resumes yet
                    </SelectItem>
                  ) : (
                    resumesList.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} (v{r.versionNumber || r.version_number || 1})
                        {r.ats ? ` · ATS ${r.ats.score}%` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Select which version you want to test and optimize.
              </p>
            </div>

            {/* 2. Target Job Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                2. Target Job Title <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="rounded-xl"
              />
              <p className="text-[11px] text-muted-foreground">
                Used to tune semantic match criteria and summary alignment.
              </p>
            </div>
          </div>

          {/* 3. Job Description Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                3. Target Job Description <span className="text-muted-foreground font-normal">(Paste or choose sample)</span>
              </Label>

              {/* Sample JD Quick Fill */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">
                  Quick load:
                </span>
                {SAMPLE_JDS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadSample(s)}
                    className="text-[11px] font-medium text-primary hover:underline bg-primary/8 px-2 py-0.5 rounded-md border border-primary/20"
                  >
                    {s.role}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={6}
              placeholder="Paste the target job description here to audit keyword alignment and identify critical missing topics… (Leave blank for generic ATS readability audit)"
              className="rounded-xl text-xs font-mono leading-relaxed resize-y"
            />
          </div>

          {/* Action Trigger Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              {jdText.trim()
                ? 'Mode: Full Job Description Match & Keyword Gap Audit'
                : 'Mode: General ATS Format & Structural Compatibility Check'}
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRunAnalysis}
                disabled={analyzeMutation.isPending || !resumeId}
                className="bg-[#0084FF] hover:bg-[#0074E0] text-white rounded-xl text-xs font-semibold px-5 shadow-xs"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-1.5 animate-spin" />
                    Analyzing ATS Match…
                  </>
                ) : (
                  <>
                    <ScanSearch className="size-4 mr-1.5" />
                    Scan &amp; Analyze ATS Match
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Diagnostic Results Section (Single Page, Zero Splitting) ── */}
      {analyzeMutation.isPending && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card p-12 text-center">
          <Loader2 className="size-8 animate-spin text-[#0084FF]" />
          <p className="font-heading text-base font-bold text-foreground">
            Evaluating ATS Compatibility &amp; Keyword Alignment
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Auditing structural parsers, calculating TF-IDF keyword overlap, and verifying evidence-based improvements…
          </p>
        </div>
      )}

      {analysisResult && !analyzeMutation.isPending && (
        <div className="space-y-6">
          {/* Top Score & Health Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Score Ring Card */}
            <Card className="md:col-span-4 rounded-2xl border-border/80 shadow-xs flex flex-col justify-center items-center p-6 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                ATS Match Index
              </p>
              <ScoreRing
                value={atsScore ?? 0}
                size={144}
                stroke={12}
                color={scoreColor(atsScore ?? 0)}
                track="rgba(0, 132, 255, 0.12)"
              >
                <span className="font-heading text-3xl font-black text-foreground">
                  {Math.round(atsScore ?? 0)}%
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {scoreLabel(atsScore ?? 0)}
                </span>
              </ScoreRing>

              <div className="mt-4 space-y-1">
                <Badge
                  variant="outline"
                  className={
                    analysisResult.ats?.eligible
                      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                      : 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  }
                >
                  {analysisResult.ats?.eligible
                    ? '✔ Passes Automated ATS Filters'
                    : '⚠ Needs Keyword & Section Optimization'}
                </Badge>
                <p className="text-[11px] text-muted-foreground">
                  Benchmark based on enterprise ATS parser thresholds.
                </p>
              </div>
            </Card>

            {/* Quick Metrics & 1-Click Tailor Callout */}
            <Card className="md:col-span-8 rounded-2xl border-border/80 shadow-xs p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Diagnostic Breakdown
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {jdText.trim() ? 'Job Description Aligned' : 'General Scan'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Matched Skills</p>
                    <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-1">
                      {matchedSkills.length}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Critical Gaps</p>
                    <p className="text-xl font-bold font-heading text-rose-600 dark:text-rose-400 mt-1">
                      {missingSkills.length}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Suggestions</p>
                    <p className="text-xl font-bold font-heading text-primary mt-1">
                      {suggestions.length}
                    </p>
                  </div>
                </div>

                {/* 1-Click Tailoring CTA Banner */}
                {jdText.trim() && (
                  <div className="rounded-xl border border-[#0084FF]/30 bg-[#0084FF]/8 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-[#0084FF]" />
                        1-Click AI Tailoring Available
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Create a dedicated version with closed keyword gaps and tailored summary.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createTailoredMutation.mutate()}
                      disabled={createTailoredMutation.isPending}
                      className="bg-[#0084FF] hover:bg-[#0074E0] text-white rounded-xl text-xs font-semibold shrink-0"
                    >
                      {createTailoredMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Wand2 className="size-3.5 mr-1.5" />
                      )}
                      Create Tailored Version
                    </Button>
                  </div>
                )}
              </div>

              {/* Direct Navigation Links */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/resumes/${resumeId}`)}
                  className="rounded-xl text-xs font-semibold"
                >
                  <FileText className="size-3.5 mr-1.5" /> Open in Builder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/interviews/mock', { state: { resumeId } })}
                  className="rounded-xl text-xs font-semibold"
                >
                  <Sparkles className="size-3.5 mr-1.5 text-primary" /> Practice Interview
                </Button>
              </div>
            </Card>
          </div>

          {/* Deep Tabs: Skills Matrix vs Actionable Bullet Suggestions */}
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="skills" className="rounded-lg text-xs font-semibold">
                Keywords &amp; Skills Matrix ({matchedSkills.length + missingSkills.length})
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="rounded-lg text-xs font-semibold">
                Suggestions &amp; Weak Bullets ({suggestions.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Keywords & Skills Matrix */}
            <TabsContent value="skills" className="mt-4 space-y-4">
              <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  {/* Missing Skills Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="size-4 text-rose-500" />
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        Missing Critical Skills ({missingSkills.length})
                      </h4>
                    </div>
                    {missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400"
                          >
                            <span className="size-1.5 rounded-full bg-rose-500" />
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        No critical skills missing against target job!
                      </p>
                    )}
                  </div>

                  {/* Matched Skills Section */}
                  <div className="pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <h4 className="font-heading text-sm font-bold text-foreground">
                        Matched Skills Found in Resume ({matchedSkills.length})
                      </h4>
                    </div>
                    {matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                          >
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Run scan with a detailed job description to surface matched keyword overlap.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Suggestions & Weak Bullets */}
            <TabsContent value="suggestions" className="mt-4 space-y-4">
              <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-primary" />
                    <h4 className="font-heading text-sm font-bold text-foreground">
                      Actionable ATS &amp; Recruiter Improvements
                    </h4>
                  </div>

                  {suggestions.length > 0 ? (
                    <ul className="space-y-2.5">
                      {suggestions.map((sug, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-muted-foreground p-3 rounded-xl border border-border/50 bg-muted/20"
                        >
                          <ArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{sug}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No formatting or parsing issues detected. Resume is structurally clean!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State before Running */}
      {!analyzeMutation.isPending && !analysisResult && (
        <EmptyState
          icon={ScanSearch}
          title="Ready to scan and tailor"
          description="Select your resume above and click 'Scan & Analyze ATS Match' to run deep keyword matching and 1-click tailoring."
        />
      )}
    </div>
  );
}