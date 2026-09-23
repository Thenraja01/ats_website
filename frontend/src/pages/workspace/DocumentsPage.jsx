import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, FolderUp, Loader2, PenLine, Plus } from 'lucide-react';
import { documentsAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import { DocumentCard } from '../../components/workspace/Cards';
import EmptyState from '../../components/workspace/EmptyState';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';

const TYPE_LABEL = { note: 'Note', link: 'Link', file: 'File' };

export default function DocumentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(false);

  const categories = useQuery({ queryKey: ['documents', 'categories'], queryFn: () => documentsAPI.categories().then((r) => r.data || []) });
  const docs = useQuery({
    queryKey: ['documents', { category }],
    queryFn: () => documentsAPI.list({ category }).then((r) => r.data || []),
  });

  const cats = categories.data?.length ? ['All', ...categories.data] : ['All'];

  const remove = useMutation({
    mutationFn: (id) => documentsAPI.remove(id),
    onSuccess: () => {
      toast.success('Document removed');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Your resume-related files, links and notes — organized, versioned, handy."
        icon={FolderUp}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/documents/cover-letter')}>
              <PenLine className="size-4" /> Write cover letter
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Add document
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <Badge
            key={c}
            variant={category === c ? 'default' : 'outline'}
            className={cn('cursor-pointer px-3 py-1 text-xs', category === c ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground')}
            onClick={() => setCategory(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      {docs.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : docs.isError ? (
        <ErrorState error={docs.error} title="Couldn't load documents" onRetry={() => docs.refetch()} />
      ) : (docs.data || []).length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nothing here yet"
          description="Save offers, links, certificates and notes related to your search."
          actionLabel="Add a document"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(docs.data || []).map((d) => (
            <DocumentCard
              key={d.id}
              doc={{
                name: d.name,
                type: d.fileType || d.category,
                created_at: d.createdAt,
                size: d.size,
              }}
              onPreview={(doc) => d.url && window.open(d.url, '_blank')}
              onDelete={() => remove.mutate(d.id)}
            />
          ))}
        </div>
      )}

      <AddDocumentDialog
        open={open}
        onOpenChange={setOpen}
        categories={categories.data || []}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
      />
    </div>
  );
}

function AddDocumentDialog({ open, onOpenChange, categories, onCreated }) {
  const [form, setForm] = useState({ name: '', category: 'Other', description: '', fileType: 'note', url: '', size: '' });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await documentsAPI.create({
        name: form.name.trim(),
        category: form.category,
        description: form.description,
        fileType: form.fileType,
        url: form.url || undefined,
        size: form.size ? Number(form.size) : undefined,
      });
      toast.success('Document added');
      onCreated?.();
      onOpenChange(false);
      setForm({ name: '', category: 'Other', description: '', fileType: 'note', url: '', size: '' });
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Could not add document');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
          <DialogDescription>Attach a file, link or note to your document library.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.fileType} onValueChange={(v) => setForm({ ...form, fileType: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>URL (optional)</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" className="mt-1.5" />
          </div>
          <div>
            <Label>Notes / description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !form.name.trim()}>
            {busy && <Loader2 className="size-4 animate-spin" />} Add document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}