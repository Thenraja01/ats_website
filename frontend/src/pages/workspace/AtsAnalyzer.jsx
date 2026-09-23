import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ScanSearch, Loader2, Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { studioAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor, scoreLabel } from '../../components/workspace/ScoreRing';
import EmptyState from '../../components/workspace/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AtsAnalyzer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState(location.state?.resumeId || '');
  const [jdText, setJdText] = useState('');

  const resumes = useQuery({ queryKey: ['studio', 'resumes'], queryFn: () => studioAPI.listResumes().then((r) => r.data || []) });
  const resumesList = resumes.data || [];

  const analyze = useMutation({
    mutationFn: (id) => studioAPI.runAts(id).then((r) => r.data),
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not run ATS analysis'),
  });

  const run = () => {
    if (!resumeId) {
      toast.error('Select a resume to analyze');
      return;
    }
    analyze.mutate(resumeId);
  };

  const result = analyze.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATS Analyzer"
        description="Check how well a resume would pass an applicant tracking system — optionally against a target job description."
        icon={ScanSearch}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label>Select Resume</Label>
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue placeholder="Choose a resume version" />
              </SelectTrigger>
              <SelectContent>
                {resumes.isLoading
                  ? <SelectItem value="__loading" disabled>Loading resumes…</SelectItem>
                  : resumesList.length === 0
                    ? <SelectItem value="__empty" disabled>No resumes yet</SelectItem>
                    : resumesList.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                        {r.ats ? ` · ATS ${r.ats.score}` : ''}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Job Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={5}
              placeholder="Paste the target job description here to score keyword overlap against it…"
            />
            <p className="text-xs text-muted-foreground">
              Without a JD, HireMind scores standard ATS readability and keyword strength.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={run} disabled={analyze.isPending || !resumeId || resumesList.length === 0}>
              {analyze.isPending ? <Loader2 className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
              {analyze.isPending ? 'Analyzing…' : 'Analyze'}
            </Button>
            {result && (
              <Button variant="outline" onClick={() => navigate('/resume-studio/jd-tailor', { state: { resumeId } })}>
                <Sparkles className="size-4" /> Tailor to close the gap
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {analyze.isPending && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Running the ATS evaluation…
        </div>
      )}

      {result && !analyze.isPending && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <Card>
              <CardContent className="flex flex-col items-center gap-2 p-6">
                <p className="font-heading text-sm font-semibold self-start">ATS Score</p>
                <ScoreRing value={result.ats?.score ?? 0} size={140} stroke={11} color={scoreColor(result.ats?.score)}>
                  <span className="font-heading text-3xl font-bold tabular-nums">{Math.round(result.ats?.score ?? 0)}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{scoreLabel(result.ats?.score)}</span>
                </ScoreRing>
                <Badge
                  variant="outline"
                  className={result.ats?.eligible
                    ? 'border-success/25 text-success bg-success/10'
                    : 'border-warning/25 text-warning bg-warning/10'}
                >
                  {result.ats?.eligible ? 'Passes automated screening' : 'Below eligibility threshold'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="size-4 text-warning" /> Issues to address
                  </div>
                  {(result.ats?.missing_skills || []).length ? (
                    <div className="flex flex-wrap gap-2">
                      {(result.ats.missing_skills || []).map((s, i) => (
                        <Badge key={i} variant="outline" className="border-warning/25 text-warning bg-warning/10">{s}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      <CheckCircle2 className="mr-1.5 inline size-4 text-success" /> No obvious missing keywords detected.
                    </p>
                  )}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-ai" /> Suggestions
                  </div>
                  {(result.ats?.suggestions || []).length ? (
                    <ul className="space-y-1.5">
                      {(result.ats.suggestions || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-ai" /> {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No suggestions right now — your resume looks strong.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="mb-2 text-sm font-semibold">What next?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="justify-start" onClick={() => navigate(`/resume-studio?highlight=${resumeId}`)}>
                  Open in Resume Studio
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate('/interview', { state: { resumeId } })}>
                  Prepare for interviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!analyze.isPending && !result && (
        <EmptyState
          icon={ScanSearch}
          title="No analysis yet"
          description="Select a resume and run the check to see your ATS score, issues and suggestions."
        />
      )}
    </div>
  );
}