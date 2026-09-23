import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Copy,
  FilePlus2,
  FileText,
  Loader2,
  Plus,
  ScanSearch,
  Sparkles,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { studioAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import { ResumeCard } from '../../components/workspace/Cards';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import ScoreRing, { scoreColor } from '../../components/workspace/ScoreRing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const TEMPLATES = [
  { id: 'modern', name: 'Modern' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'professional', name: 'Professional' },
  { id: 'technical', name: 'Technical' },
  { id: 'executive', name: 'Executive' },
  { id: 'creative', name: 'Creative' },
  { id: 'academic', name: 'Academic' },
  { id: 'ats-classic', name: 'ATS Classic' },
];

const STATUS_TONE = {
  draft: 'bg-muted text-muted-foreground border-border',
  ready: 'bg-success/12 text-success border-success/25',
  exported: 'bg-primary/12 text-primary border-primary/25',
};

function CreateResumeDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('My Resume');
  const [template, setTemplate] = useState('modern');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const res = await studioAPI.createResume({
        name: name.trim() || 'My Resume',
        template,
        role,
      });
      toast.success('Resume created');
      onCreated(res.data);
      onOpenChange(false);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Could not create resume');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New resume</DialogTitle>
          <DialogDescription>
            Start a versioned resume. You can edit content later in the Resume Builder.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Target role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Engineer" className="mt-1.5" />
          </div>
          <div>
            <Label>Template</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${template === t.id ? 'border-primary/60 bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} Create resume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ResumeStudio() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const highlight = params.get('highlight');
  const justTailored = params.get('ats') === '1';

  const resumes = useQuery({
    queryKey: ['studio', 'resumes'],
    queryFn: () => studioAPI.listResumes().then((r) => r.data || []),
  });

  const templates = useQuery({
    queryKey: ['studio', 'templates'],
    queryFn: () => studioAPI.templates().then((r) => r.data || []),
  });

  const ats = useMutation({
    mutationFn: (id) => studioAPI.runAts(id),
    onSuccess: () => {
      toast.success('ATS analysis complete');
      queryClient.invalidateQueries({ queryKey: ['studio', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'overview'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'ATS check failed'),
  });

  const duplicate = useMutation({
    mutationFn: (id) => studioAPI.duplicateResume(id),
    onSuccess: (res) => {
      toast.success(`New version v${res.data.versionNumber} created`);
      queryClient.invalidateQueries({ queryKey: ['studio', 'resumes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Duplicate failed'),
  });

  const remove = useMutation({
    mutationFn: (id) => studioAPI.deleteResume(id),
    onSuccess: () => {
      toast.success('Resume deleted');
      queryClient.invalidateQueries({ queryKey: ['studio', 'resumes'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Delete failed'),
  });

  const clearHighlight = () => {
    const next = new URLSearchParams(params);
    next.delete('highlight');
    next.delete('ats');
    setParams(next, { replace: true });
  };

  if (resumes.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-52" />)}
        </div>
      </div>
    );
  }

  const list = resumes.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Studio"
        description="Versioned resumes that are never overwritten. Create, duplicate, rank with ATS and tailor to a job description."
        icon={FileText}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/resume-studio/jd-tailor')}>
              <Sparkles className="size-4" /> Tailor to a JD
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> New resume
            </Button>
          </>
        }
      />

      {justTailored && highlight && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/8 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold">Tailored version created &amp; re-scored</p>
            <p className="text-xs text-muted-foreground">The new version was checked against the target JD automatically.</p>
          </div>
          <Button size="sm" variant="outline" onClick={clearHighlight}>Dismiss</Button>
        </div>
      )}

      {resumes.isError ? (
        <ErrorState error={resumes.error} title="Couldn't load your resumes" onRetry={() => resumes.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Create your first versioned resume, or push your Career Vault into a fresh one."
          actionLabel="Create a resume"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <div key={r.id} className={highlight === r.id ? 'rounded-xl ring-2 ring-primary/50' : undefined}>
              <ResumeCard
                resume={r}
                to={`/resume-studio/${r.id}/edit`}
                actions={
                  <div className="flex items-center gap-1">
                    {ats.isPending && ats.variables === r.id ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <button
                        onClick={() => ats.mutate(r.id)}
                        title="Run ATS check"
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <ScanSearch className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => duplicate.mutate(r.id)}
                      title="Duplicate as next version"
                      className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      onClick={() => remove.mutate(r.id)}
                      title="Delete"
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                }
              />
            </div>
          ))}

          <button
            onClick={() => setCreateOpen(true)}
            className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
          >
            <FilePlus2 className="size-6" />
            New resume
          </button>
        </div>
      )}

      {list.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-heading text-sm font-semibold">Version history</p>
              <Badge variant="outline">{list.length} versions</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {list.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/resume-studio/${r.id}/edit`)}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs transition-all hover:border-primary/40"
                >
                  <span className={`rounded px-1.5 py-0.5 border font-semibold ${STATUS_TONE[r.status] || STATUS_TONE.draft}`}>
                    v{r.versionNumber}
                  </span>
                  <span className="max-w-36 truncate">{r.name}</span>
                  {r.ats && (
                    <ScoreRing value={r.ats.score} size={30} stroke={4} color={scoreColor(r.ats.score)}>
                      <span className="text-[10px] font-bold">{r.ats.score}</span>
                    </ScoreRing>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateResumeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(r) => {
          const next = new URLSearchParams();
          next.set('highlight', r.id);
          setParams(next, { replace: true });
          navigate('/resume-builder', { state: { resumeId: r.id } });
        }}
      />
    </div>
  );
}