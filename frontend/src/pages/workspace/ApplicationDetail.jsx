import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  ScanSearch,
} from 'lucide-react';
import { candidateAPI } from '../../services/api';
import PageHeader from '../../components/workspace/PageHeader';
import ScoreRing, { scoreColor } from '../../components/workspace/ScoreRing';
import ErrorState from '../../components/workspace/ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUSES = ['applied', 'screening', 'interview', 'technical', 'offer', 'rejected', 'withdrawn'];

const STATUS_TONE = {
  applied: 'bg-primary/12 text-primary border-primary/25',
  screening: 'bg-warning/12 text-warning border-warning/25',
  interview: 'bg-ai/12 text-ai border-ai/25',
  technical: 'bg-ai/12 text-ai border-ai/25',
  offer: 'bg-success/12 text-success border-success/25',
  rejected: 'bg-destructive/12 text-destructive border-destructive/25',
  withdrawn: 'bg-muted text-muted-foreground border-border',
};

export default function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const query = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => candidateAPI.getApplication(applicationId).then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: ({ status, note }) => candidateAPI.updateApplicationStatus(applicationId, status, note),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['intelligence', 'activity'] });
    },
    onError: (e) => toast.error(e?.response?.data?.detail || 'Update failed'),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-48" />
      </div>
    );
  }
  if (query.isError) {
    return <ErrorState error={query.error} title="Application not found" onRetry={() => query.refetch()} />;
  }

  const app = query.data;
  const timeline = app.timeline || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={app.role || app.job_title || 'Application'}
        description={`${app.company || 'Unknown company'}${app.location ? ` · ${app.location}` : ''}`}
        icon={Briefcase}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/applications">
                <ArrowLeft className="size-4" /> All applications
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={update.isPending}>
                  {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                  Update status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Move to</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUSES.map((st) => (
                  <DropdownMenuItem key={st} onClick={() => update.mutate({ status: st, note })}>
                    <span className={`size-2 rounded-full border ${STATUS_TONE[st].replace('bg-', 'border-')}`} />
                    <span className="capitalize">{st}</span>
                    {st === app.status && <span className="ml-auto text-xs text-primary">Current</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <ScoreRing value={app.ats_score} size={72} stroke={7} color={scoreColor(app.ats_score)}>
              <span className="text-lg font-bold">{app.ats_score}</span>
            </ScoreRing>
            <div>
              <p className="text-sm font-semibold">ATS score</p>
              <p className="text-xs text-muted-foreground">at application time</p>
              {app.analysis_id && (
                <Link to={`/ats/${app.analysis_id}`} className="mt-1 inline-block text-xs text-primary hover:underline">
                  Full report →
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <ScoreRing value={app.jd_match ?? 0} size={72} stroke={7} color={scoreColor(app.jd_match ?? 0)}>
              <span className="text-lg font-bold">{app.jd_match ?? '—'}</span>
            </ScoreRing>
            <div>
              <p className="text-sm font-semibold">JD match</p>
              <p className="text-xs text-muted-foreground">keyword-level</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Status</p>
                <Badge variant="outline" className={`mt-1.5 capitalize ${STATUS_TONE[app.status] || STATUS_TONE.applied}`}>
                  {app.status}
                </Badge>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p className="flex items-center justify-end gap-1"><CalendarDays className="size-3" /> Applied</p>
                <p>{new Date(app.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`size-2.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                  {i < timeline.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium capitalize">{t.status}</p>
                  {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
                  <p className="text-xs text-muted-foreground/70">{new Date(t.at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for the next status change…"
                className="h-8 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Briefcase} label="Role" value={app.role || app.job_title} />
              <Row icon={MapPin} label="Location" value={app.location || '—'} />
              {app.salary && <Row label="Salary" value={app.salary} />}
              {app.job_url && (
                <a href={app.job_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <ExternalLink className="size-4" /> View original posting
                </a>
              )}
              {app.resume_version_id && (
                <Link to={`/resume-studio/${app.resume_version_id}/edit`} className="flex items-center gap-2 text-primary hover:underline">
                  <FileText className="size-4" /> Open the resume used
                </Link>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/ats/${app.analysis_id || ''}`}>
                    <ScanSearch className="size-3.5" /> ATS analysis
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/resume-studio/jd-tailor">Re-tailor</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {app.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{app.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}