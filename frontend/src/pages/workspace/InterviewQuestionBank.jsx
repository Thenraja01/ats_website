import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bookmark, Library, Loader2, Plus, Search } from 'lucide-react';
import { interviewAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DIFF_TONE = {
  Beginner: 'bg-success/12 text-success border-success/25',
  Intermediate: 'bg-primary/12 text-primary border-primary/25',
  Advanced: 'bg-destructive/12 text-destructive border-destructive/25',
};

const DEFAULT_CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'AI/ML', 'RAG', 'DevOps', 'System Design', 'Behavioral', 'HR', 'Project'];
const DEFAULT_DIFFS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function bookmarkIcon(saved) {
  return saved ? <Bookmark className="size-3.5 fill-current" /> : <Bookmark className="size-3.5" />;
}

export default function InterviewQuestionBank() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [category, setCategory] = useState(location.state?.category || 'All');
  const [difficulty, setDifficulty] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const meta = useQuery({ queryKey: ['interview', 'meta'], queryFn: () => interviewAPI.meta().then((r) => r.data) });
  const questions = useQuery({
    queryKey: ['interview', 'questions', { category, difficulty, savedOnly, search }],
    queryFn: () => interviewAPI.questions({ category, difficulty, savedOnly, search, limit: 200 }).then((r) => r.data), 
  });

  const categories = meta.data?.categories?.length ? meta.data.categories : DEFAULT_CATEGORIES;
  const diffs = meta.data?.difficulties?.length ? meta.data.difficulties : DEFAULT_DIFFS;

  const save = useMutation({
    mutationFn: ({ id, saved }) => interviewAPI.saveQuestion(id, saved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['interview', 'meta'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not update question'),
  });

  const remove = useMutation({
    mutationFn: (id) => interviewAPI.deleteQuestion(id),
    onSuccess: () => {
      toast.success('Question removed');
      queryClient.invalidateQueries({ queryKey: ['interview', 'questions'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Could not delete question'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Curated questions across categories and difficulty levels. Save what matters, add your own."
        icon={Library}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add question
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {diffs.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          variant={savedOnly ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setSavedOnly((s) => !s)}
          className="ml-auto"
        >
          <Bookmark className="size-3.5" /> Saved
        </Button>
      </div>

      {questions.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : questions.isError ? (
        <ErrorState error={questions.error} title="Couldn't load questions" onRetry={() => questions.refetch()} />
      ) : !questions.data?.length ? (
        <EmptyState icon={Library} title="No questions found" description="Try changing filters or clear the search." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(questions.data || []).map((q) => (
            <Card key={q.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-h-12 text-sm leading-relaxed">{q.question}</p>
                  <button
                    onClick={() => save.mutate({ id: q.id, saved: !q.saved })}
                    className={`shrink-0 rounded-md p-1.5 transition-colors ${q.saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    title={q.saved ? 'Unsave' : 'Save'}
                  >
                    {bookmarkIcon(q.saved)}
                  </button>
                </div>
                <div className="mt-auto flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${DIFF_TONE[q.difficulty] || ''}`}>{q.difficulty}</Badge>
                  {q.isCustom && <Badge variant="outline" className="bg-ai/10 text-ai border-ai/25 text-[10px]">Custom</Badge>}
                  <div className="ml-auto">
                    {q.isCustom && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">⋯</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="text-xs">Question actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => remove.mutate(q.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddQuestionDialog open={addOpen} onOpenChange={setAddOpen} categories={categories} diffs={diffs} />
    </div>
  );
}

function AddQuestionDialog({ open, onOpenChange, categories, diffs }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ question: '', category: 'Technical', difficulty: 'Intermediate', idealAnswer: '', keywords: '' });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.question.trim()) return;
    setBusy(true);
    try {
      await interviewAPI.createQuestion({
        question: form.question.trim(),
        category: form.category,
        difficulty: form.difficulty,
        idealAnswer: form.idealAnswer,
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      });
      toast.success('Question added');
      queryClient.invalidateQueries({ queryKey: ['interview', 'questions'] });
      onOpenChange(false);
      setForm({ question: '', category: 'Technical', difficulty: 'Intermediate', idealAnswer: '', keywords: '' });
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Could not add question');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a question</DialogTitle>
          <DialogDescription>Create your own question for the bank.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question</Label>
            <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c !== 'All').map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {diffs.filter((d) => d !== 'All').map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Ideal answer (optional)</Label>
            <Textarea value={form.idealAnswer} onChange={(e) => setForm({ ...form, idealAnswer: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Keywords (comma separated)</Label>
            <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="mt-1.5" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !form.question.trim()}>
            {busy && <Loader2 className="size-4 animate-spin" />} Add question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}