import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Loader2, PenLine, Save, Sparkles } from 'lucide-react';
import { candidateAPI, documentsAPI, studioAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import { CopyBlock } from '../../components/workspace/AICallout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoverLetterPage() {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');

  const resumes = useQuery({
    queryKey: ['studio', 'resumes'],
    queryFn: () => studioAPI.listResumes().then((r) => r.data || []),
  });

  const gen = useMutation({
    mutationFn: async () => {
      let text = resumeText;
      if (resumeId) {
        const r = await studioAPI.getResume(resumeId).then((x) => x.data);
        const data = r?.data || {};
        const parts = [
          data.personalInfo?.fullName,
          data.summary?.primary,
          Array.isArray(data.experience) ? data.experience.map((e) => `${e.jobTitle} at ${e.company}: ${e.description || ''}`).join('\n') : '',
          Array.isArray(data.skills) ? data.skills.map((s) => (typeof s === 'string' ? s : s.name)).join(', ') : '',
        ];
        text = parts.filter(Boolean).join('\n\n');
      }
      const source = text || 'Use my career vault data as a starting point.';
      return candidateAPI.generateCoverLetter({
        resume_text: source,
        job_description: jdText,
        job_title: jobTitle || 'the role',
      });
    },
    onSuccess: () => toast.success('Cover letter generated'),
    onError: (e) => toast.error(e?.response?.data?.detail || e?.message || 'Could not generate cover letter'),
  });

  const save = useMutation({
    mutationFn: (letter) =>
      documentsAPI.create({
        name: `Cover letter — ${jobTitle || 'Role'}`,
        category: 'Cover Letter',
        description: 'Generated with HireMind AI',
        fileType: 'note',
        content: letter,
      }),
    onSuccess: () => {
      toast.success('Saved to Documents');
      navigate('/documents');
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not save the letter'),
  });

  const letter = gen.data?.cover_letter;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cover Letter Generator"
        description="Use your resume's strongest evidence and a job description to draft a cover letter."
        icon={PenLine}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>What should the letter target?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Job title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Product Designer" className="mt-1.5" />
            </div>
            <div>
              <Label>Job description</Label>
              <Textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the JD…" className="mt-1.5 min-h-40 font-mono text-xs" />
            </div>
            <div>
              <Label>Resume source</Label>
              {resumes.isLoading ? (
                <p className="mt-1.5 text-sm text-muted-foreground">Loading resumes…</p>
              ) : (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => { setResumeId(''); setResumeText(''); }}
                    className={`rounded-lg border p-3 text-left text-sm transition-all ${!resumeId ? 'border-primary/60 bg-primary/8' : 'border-border hover:border-primary/40'}`}
                  >
                    <p className="font-medium">Vault / manual</p>
                    <p className="text-xs text-muted-foreground">Paste or use default</p>
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
                        <span className="block text-xs text-muted-foreground">v{r.versionNumber}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!resumeId && (
              <div>
                <Label>Or paste resume text</Label>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Leave empty to draft from your vault."
                  className="mt-1.5 min-h-24 font-mono text-xs"
                />
              </div>
            )}
            <Button
              className="w-full"
              disabled={gen.isPending || !jdText.trim()}
              onClick={() => gen.mutate()}
            >
              {gen.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate cover letter
            </Button>
          </CardContent>
        </Card>

        <div>
          {!letter && (
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/40">
                  <PenLine className="size-5 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium">Your letter will appear here</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">Fill the inputs and generate — then copy it or save it to Documents.</p>
              </CardContent>
            </Card>
          )}
          {letter && (
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">{jobTitle || 'Cover Letter'}</CardTitle>
                <Button size="sm" variant="outline" onClick={() => save.mutate(letter)} disabled={save.isPending}>
                  {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  Save to Documents
                </Button>
              </CardHeader>
              <CardContent>
                <CopyBlock text={letter}>
                  <pre className="max-h-[520px] overflow-y-auto rounded-xl border border-border bg-background/60 p-5 font-sans text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {letter}
                  </pre>
                </CopyBlock>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}