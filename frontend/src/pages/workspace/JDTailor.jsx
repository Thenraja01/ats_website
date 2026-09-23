import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import { studioAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import SkillChip from '../../components/workspace/SkillChip';
import MatchPanel, { MatchGroups } from '../../components/workspace/MatchPanel';
import EmptyState from '../../components/workspace/EmptyState';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function JDTailor() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetResume = params.get('resume');

  const [resumeId, setResumeId] = useState(presetResume || '');
  const [jdText, setJdText] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [accepted, setAccepted] = useState({});
  const [error, setError] = useState('');

  const resumes = useQuery({
    queryKey: ['studio', 'resumes'],
    queryFn: () => studioAPI.listResumes().then((r) => r.data || []),
  });

  const assess = useMutation({
    mutationFn: () =>
      studioAPI.tailorAssess({
        resumeId: resumeId || undefined,
        jdText,
        targetJobTitle: targetTitle || undefined,
      }),
    onSuccess: () => {
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => {
      setError(err?.response?.data?.detail || err?.message || 'Assessment failed. Please try again.');
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const source = await studioAPI.getResume(resumeId).then((r) => r.data);
      const baseData = { ...(source?.data || {}) };
      const safeSkills = assess.data?.safeImprovements
        ?.flatMap((s) => s.addSkills || [])
        .map((name) => (typeof name === 'string' ? { name, category: 'Technical', proficiency: 'Advanced', verified: true } : name));

      const mergedSkills = [
        ...(Array.isArray(baseData.skills) ? baseData.skills : []),
        ...(safeSkills || []),
      ].filter((s, i, arr) => {
        const n = typeof s === 'string' ? s : s?.name;
        return n && arr.findIndex((x) => (typeof x === 'string' ? x : x?.name) === n) === i;
      });

      baseData.skills = mergedSkills;
      if (targetTitle) baseData.summary = { ...(baseData.summary || {}), primary: `${targetTitle}` };

      return studioAPI.tailorCreate({
        sourceResumeId: resumeId,
        name: `Tailored — ${targetTitle || 'JD'}`,
        jdTitle: targetTitle || 'Target Role',
        jdText,
        data: baseData,
      });
    },
    onSuccess: (res) => {
      const resume = res.data;
      toast.success('Tailored version created');
      navigate(`/resume-studio?highlight=${resume.id}${resume.ats ? '&ats=1' : ''}`);
    },
    onError: (err) => {
      setError(err?.response?.data?.detail || err?.message || 'Could not create the tailored version.');
    },
  });

  const startAssess = () => {
    if (!jdText.trim()) {
      setError('Paste a job description first.');
      return;
    }
    setAccepted({});
    assess.mutate();
  };

  const result = assess.data;
  const createReady = result && !!resumeId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Tailor"
        description="AI compares your Career Vault + resume against a job description and proposes evidence-based edits — never fabricated. Tailoring always creates a new version."
        icon={Sparkles}
        actions={
          <Button variant="outline" asChild>
            <a href="/resume-studio/jd-tailor">
              <RefreshCw className="size-4" /> Start over
            </a>
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Assessment failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Left: inputs */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <Label>Job description</Label>
                <Textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description here…"
                  className="mt-2 min-h-44 font-mono text-xs"
                />
              </div>
              <div>
                <Label>Target job title</Label>
                <Input
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Source resume</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {resumes.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Loading resumes…
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setResumeId('')}
                        className={`rounded-lg border p-3 text-left text-sm transition-all ${!resumeId ? 'border-primary/60 bg-primary/8' : 'border-border hover:border-primary/40'}`}
                      >
                        <p className="font-medium">Career Vault only</p>
                        <p className="text-xs text-muted-foreground">Use vault evidence as source</p>
                      </button>
                      {(resumes.data || []).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setResumeId(r.id)}
                          className={`flex items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all ${resumeId === r.id ? 'border-primary/60 bg-primary/8' : 'border-border hover:border-primary/40'}`}
                        >
                          <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{r.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              v{r.versionNumber} · {r.template}
                            </span>
                          </span>
                        </button>
                      ))}
                      {(resumes.data || []).length === 0 && (
                        <p className="col-span-full text-xs text-muted-foreground">
                          No saved resumes yet — the Career Vault will be used as your source.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={startAssess}
                disabled={assess.isPending || !jdText.trim()}
              >
                {assess.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Assess tailoring
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: results */}
        <div className="space-y-4">
          {!result && !assess.isPending && (
            <EmptyState
              icon={ListChecks}
              title="Awaiting assessment"
              description="Paste a job description, optionally pick a resume, and run the assessment. Safe edits are backed by your Career Vault evidence."
            />
          )}

          {assess.isPending && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Reading your vault &amp; resume…</p>
              <p className="text-xs text-muted-foreground">Matching skills and computing safe changes</p>
            </div>
          )}

          {result && (
            <>
              <Alert variant="ai" className="items-start">
                <Sparkles className="size-4" />
                <AlertTitle className="text-sm">AI assessment complete</AlertTitle>
                <AlertDescription className="text-xs">
                  Safe changes are backed by Career Vault evidence. Anything else appears under “needs verification” — we never invent experience.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 xl:grid-cols-2">
                {/* JD insights */}
                <Card>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-primary" />
                      <p className="font-heading text-sm font-semibold">Job description signals</p>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs text-muted-foreground">Required skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(result.jdInsights?.requiredSkills || []).map((s) => (
                          <SkillChip key={s} label={s} />
                        ))}
                        {(result.jdInsights?.requiredSkills || []).length === 0 && (
                          <p className="text-xs text-muted-foreground">None detected</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs text-muted-foreground">Preferred / nice-to-have</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(result.jdInsights?.preferredSkills || []).map((s) => (
                          <SkillChip key={s} label={s} />
                        ))}
                      </div>
                    </div>
                    {result.jdInsights?.roleType && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Role:</span>
                        {Array.isArray(result.jdInsights.roleType) ? (
                          result.jdInsights.roleType.map((r) => <Badge key={r} variant="outline">{r}</Badge>)
                        ) : (
                          <Badge variant="outline">{result.jdInsights.roleType}</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current match */}
                <Card>
                  <CardContent className="p-5">
                    <p className="font-heading mb-3 text-sm font-semibold">Current match</p>
                    <div className="flex items-start gap-4">
                      <MatchPanel match={result.match} className="flex-1 !border-0 !bg-transparent !p-0" />
                    </div>
                    <div className="mt-2">
                      <MatchGroups match={result.match} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Safe improvements */}
              <Card>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    <p className="font-heading text-sm font-semibold">
                      Suggested changes <span className="font-normal text-muted-foreground">({(result.safeImprovements || []).length})</span>
                    </p>
                  </div>
                  {(result.safeImprovements || []).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Your resume and vault already align well with this description.
                    </p>
                  )}
                  <div className="space-y-2.5">
                    {(result.safeImprovements || []).map((imp, i) => (
                      <div
                        key={`${imp.action}-${i}`}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <label className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={accepted[imp.action] !== false}
                            onChange={(e) => setAccepted((a) => ({ ...a, [imp.action]: e.target.checked }))}
                            className="mt-0.5 size-4 accent-primary"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{imp.action}</span>
                            {imp.rationale && <span className="mt-0.5 block text-xs text-muted-foreground">{imp.rationale}</span>}
                            {imp.addSkills && imp.addSkills.length > 0 && (
                              <span className="mt-1.5 flex flex-wrap gap-1">
                                {(imp.addSkills || []).map((s) => (
                                  <SkillChip key={typeof s === 'string' ? s : s.name} label={typeof s === 'string' ? s : s.name} match="matched" />
                                ))}
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verification */}
              {result.requiresVerification && result.requiresVerification.length > 0 && (
                <Alert variant="warning" className="items-start">
                  <ShieldAlert className="size-4" />
                  <AlertTitle className="text-sm">Needs your verification</AlertTitle>
                  <AlertDescription className="text-xs">
                    The role values these skills but your vault has no direct evidence yet. Add proof (a project, course or experience) to unlock them — HireMind won’t fabricate them.
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.requiresVerification.map((s) => {
                        const name = typeof s === 'string' ? s : s.name;
                        return <SkillChip key={`verify-${name}`} label={name} match="missing" />;
                      })}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  disabled={!createReady || create.isPending}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Creating…
                    </>
                  ) : (
                    <>
                      Create tailored version <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}