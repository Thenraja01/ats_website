import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, CalendarDays, ExternalLink } from 'lucide-react';
import ScoreRing, { scoreColor } from './ScoreRing';

export function ResumeCard({ resume, to, actions, className }) {
  const updated = resume.updated_at ? new Date(resume.updated_at) : null;
  const ats = resume.ats_score ?? resume.ats?.overall ?? resume.atsScore ?? null;

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <FileText className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <Link to={to} className="font-heading truncate text-sm font-semibold hover:text-primary">
            {resume.title || resume.name || 'Untitled resume'}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3" />
            {updated ? updated.toLocaleDateString() : '—'}
            {resume.version_number && (
              <span className="ml-1 rounded border border-border px-1.5 py-0.5 text-[10px]">
                v{resume.version_number}
              </span>
            )}
          </p>
          {resume.target_role && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Target: {resume.target_role}
            </p>
          )}
        </div>
        {ats != null && (
          <ScoreRing value={Number(ats)} size={52} stroke={5} color={scoreColor(Number(ats))}>
            <span className="text-xs font-bold tabular-nums">{Math.round(Number(ats))}</span>
          </ScoreRing>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap gap-1.5">
          {(resume.tags || resume.skills?.slice(0, 3) || []).slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] font-normal">
              {typeof t === 'string' ? t : t.name}
            </Badge>
          ))}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function JobCard({ job, match, actions, className }) {
  const score = match?.score ?? match?.overall ?? job.match_score ?? null;
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading truncate text-sm font-semibold">{job.role || job.title}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{job.company}</p>
        </div>
        {score != null && (
          <ScoreRing value={Number(score)} size={46} stroke={5} color={scoreColor(Number(score))}>
            <span className="text-[11px] font-bold tabular-nums">{Math.round(Number(score))}</span>
          </ScoreRing>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3" /> {job.location}
          </span>
        )}
        {job.salary && <span>{job.salary}</span>}
        {job.job_type && <span className="rounded border border-border px-1.5">{job.job_type}</span>}
      </div>
      {(actions || (job.job_url && (
        <a href={job.job_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="size-3" /> View posting
        </a>
      )))}
      {actions}
    </div>
  );
}

export function DocumentCard({ doc, onPreview, onDelete, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40',
        className
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
        <FileText className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{doc.name || doc.filename}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {doc.type && <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>}
          {doc.created_at && new Date(doc.created_at).toLocaleDateString()}
          {doc.size && <span>· {typeof doc.size === 'number' ? `${Math.round(doc.size / 1024)} KB` : doc.size}</span>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onPreview && (
          <button onClick={() => onPreview(doc)} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ExternalLink className="size-4" />
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(doc)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}