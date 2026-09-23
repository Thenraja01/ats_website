import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FileText,
  Link2,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { studioAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import MatchPanel, { MatchGroups } from '../../components/workspace/MatchPanel';
import EmptyState from '../../components/workspace/EmptyState';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CareerMatch() {
  const [resumeId, setResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState('');

  const resumes = useQuery({
    queryKey: ['studio', 'resumes'],
    queryFn: () => studioAPI.listResumes().then((r) => r.data || []),
  });

  const run = useMutation({
    mutationFn: () => studioAPI.match({ resumeId: resumeId || undefined, jdText }),
    onSuccess: () => setError(''),
    onError: (e) => setError(e?.response?.data?.detail || e?.message || 'Match failed'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume → JD Matcher"
        description="Keyword-level comparison between a resume and a job description. Understand what you hit, what's partial, and what's missing before applying."
        icon={Link2}
      />

      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Match failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Resume</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {resumes.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> Loading…
                    </div>
                  ) : (
                    <>
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
                            <span className="block text-xs text-muted-foreground">v{r.versionNumber}</span>
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Job description</label>
                <Textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the JD here…"
                  className="min-h-52 font-mono text-xs"
                />
              </div>
              <Button onClick={() => run.mutate()} disabled={run.isPending || !jdText.trim()} className="w-full">
                {run.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Match resume to JD
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {!run.data && !run.isPending && (
            <EmptyState
              icon={Link2}
              title="Ready to compare"
              description="Pick a resume and paste a job description to compute a keyword-level match."
            />
          )}
          {run.isPending && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Analyzing keywords…</p>
            </div>
          )}
          {run.data && (
            <>
              <MatchPanel match={run.data} />
              <Card>
                <CardContent className="p-5">
                  <p className="font-heading mb-3 text-sm font-semibold">Breakdown</p>
                  <MatchGroups match={run.data} />
                </CardContent>
              </Card>
              {(run.data.overall ?? run.data.score) < 70 && (
                <Alert className="items-start">
                  <Sparkles className="size-4" />
                  <AlertTitle className="text-sm">Boost this match</AlertTitle>
                  <AlertDescription className="text-xs">
                    Tailor a version of this resume to the JD to close the gap — HireMind only adds skills backed by your Career Vault evidence.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}