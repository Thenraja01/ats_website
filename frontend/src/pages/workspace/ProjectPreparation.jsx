import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FolderGit2, Loader2, Plus, Sparkles, ChevronDown, Bookmark } from 'lucide-react';
import { careerAPI, interviewAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DIFF_TONE = {
  Beginner: 'bg-success/12 text-success border-success/25',
  Intermediate: 'bg-primary/12 text-primary border-primary/25',
  Advanced: 'bg-destructive/12 text-destructive border-destructive/25',
};

function asList(techs) {
  if (!techs) return [];
  if (Array.isArray(techs)) return techs.map((t) => (typeof t === 'object' ? t?.name : t)).filter(Boolean);
  return String(techs).split(',').map((t) => t.trim()).filter(Boolean);
}

export default function ProjectPreparation() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState('');
  const [active, setActive] = useState(null);
  const [saved, setSaved] = useState(new Set());

  const profile = useQuery({ queryKey: ['career', 'profile'], queryFn: () => careerAPI.get().then((r) => r.data), retry: 1 });
  const projects = profile.data?.projects || [];

  const selected = projects.find((p) => String(p.id || p.name) === String(projectId)) || null;

  const generate = useMutation({
    mutationFn: () =>
      interviewAPI.generateProjectQuestions({
        project: {
          name: selected.name,
          technologies: asList(selected.technologies).join(', '),
          description: selected.description || '',
        },
      }).then((r) => r.data?.questions || []),
    onSuccess: (q) => {
      toast.success(`Generated ${q.length} questions`);
      setActive(q);
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not generate questions'),
  });

  const persist = useMutation({
    mutationFn: (q) =>
      interviewAPI.createQuestion({
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        idealAnswer: q.ideal_answer,
        keywords: q.keywords || [],
      }),
    onSuccess: (_res, q) => {
      setSaved((prev) => new Set(prev).add(q.question));
      toast.success('Saved to question bank');
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not save question'),
  });

  const run = () => {
    if (!selected) {
      toast.error('Select a project first');
      return;
    }
    generate.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Preparation"
        description="Deep-dive questions automatically generated from the projects in your Career Vault — grounded in your actual stack and work."
        icon={FolderGit2}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/career-vault')}>
                Manage in Career Vault
              </Button>
            </div>
            {profile.isLoading ? (
              <Skeleton className="h-10 w-full sm:w-96" />
            ) : (
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full sm:w-96">
                  <SelectValue placeholder="Choose a project from your vault" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="__none" disabled>No projects yet</SelectItem>
                  ) : (
                    projects.map((p) => (
                      <SelectItem key={String(p.id || p.name)} value={String(p.id || p.name)}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button onClick={run} disabled={generate.isPending || !selected || projects.length === 0}>
            {generate.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generate.isPending ? 'Generating…' : 'Generate Questions'}
          </Button>
        </CardContent>
      </Card>

      {profile.isError && <ErrorState error={profile.error} title="Couldn't load your career vault" onRetry={() => profile.refetch()} />}

      {!profile.isLoading && projects.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No projects in your vault yet"
          description="Add your projects to the Career Vault — Project preparation is generated from real, verified work."
        />
      )}

      {active && generate.isSuccess && (
        <div className="space-y-3">
          {active.map((q, i) => {
            const open = active === null ? false : q.question === active;
            const isSaved = saved.has(q.question);
            return (
              <Card key={i}>
                <CardContent className="p-0">
                  <button
                    onClick={() => setActive(open ? null : q.question)}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${DIFF_TONE[q.difficulty] || ''}`}>{q.difficulty}</Badge>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                    </div>
                    <ChevronDown className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expected answer signals</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{q.ideal_answer}</p>
                      </div>
                      {(q.keywords || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(q.keywords || []).map((k) => (
                            <Badge key={k} variant="outline" className="text-[10px] bg-muted/40">{k}</Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant={isSaved ? 'secondary' : 'outline'}
                        disabled={isSaved}
                        onClick={() => persist.mutate(q)}
                      >
                        {isSaved ? <Bookmark className="size-3.5 fill-current" /> : <Plus className="size-3.5" />}
                        {isSaved ? 'Saved to bank' : 'Save to question bank'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          <div className="pt-2">
            <Button onClick={() => navigate('/interview/mock', { state: { category: 'All' } })}>
              <Sparkles className="size-4" /> Practice in a mock interview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}