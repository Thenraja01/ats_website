import { useState, useEffect, useMemo } from 'react';
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
  Eye,
  Check,
  X,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Wrench,
  User,
  Target,
  Award,
  Layers,
  CalendarDays,
  FileCheck2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { studioAPI } from '../../services/api';
import {
  getMasterCareerProfile,
  calculateProfileScore,
  SYNC_EVENT_NAME,
} from '../../services/careerProfileSync';
import PageHeader from '../../components/workspace/PageHeader';
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
import TemplateGalleryModal from '@/components/builder/TemplateGalleryModal';

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

function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function CreateResumeDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('My Resume');
  const [template, setTemplate] = useState('modern-tech');
  const [selectedTemplateObj, setSelectedTemplateObj] = useState({
    title: 'Modern Tech',
    category: 'tech',
    atsScoreRating: 98,
    palette: { primary: '#2563EB' }
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateObj(tpl);
    setTemplate(tpl.slug || tpl.id || tpl.title);
    if (!role && tpl.category) {
      if (tpl.category === 'tech') setRole('Software Engineer');
      else if (tpl.category === 'executive') setRole('Engineering Manager');
    }
  };

  const create = async () => {
    setBusy(true);
    try {
      const res = await studioAPI.createResume({
        name: name.trim() || 'My Resume',
        template: selectedTemplateObj?.slug || template,
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
    <>
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
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="mt-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Template</Label>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="size-3.5" />
                  Browse 1,000+ Library
                </button>
              </div>

              {/* Click to open dynamic template gallery */}
              <div
                onClick={() => setIsGalleryOpen(true)}
                className="mt-2 p-3 rounded-xl border border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                    style={{
                      backgroundColor: selectedTemplateObj?.palette?.primary || '#2563EB',
                    }}
                  >
                    <Sparkles className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {selectedTemplateObj?.title || template}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        {selectedTemplateObj?.atsScoreRating || 98}% ATS
                      </span>
                      {selectedTemplateObj?.visibility === 'private' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                          Private
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {selectedTemplateObj?.description || 'Click to select from 1,000+ templates or private vault'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors shrink-0 pl-2">
                  <span>Change</span>
                  <ChevronRight className="size-4" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Create resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic Template Library Modal */}
      <TemplateGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={template}
      />
    </>
  );
}

/**
 * 2-Tone Dribbble Style Resume Card:
 * Upper section: Paper/Canvas preview with candidate info, ATS badge, and structure
 * Lower section: Electric blue footer bar with document title and quick action icons
 */
function TwoToneResumeCard({
  resume,
  onEdit,
  onAts,
  onDuplicate,
  onTailor,
  onDelete,
  isAtsRunning,
  isHighlighted,
}) {
  const atsScore = resume.ats?.score ?? resume.ats_score ?? resume.ats?.overall ?? null;
  const versionNum = resume.versionNumber ?? resume.version_number ?? 1;
  const updatedText = formatRelativeTime(
    resume.updatedAt || resume.updated_at || resume.createdAt || resume.created_at
  );
  const targetRole =
    resume.role || resume.target_role || resume.targetRole || 'Software Professional';
  const title = resume.name || resume.title || 'Untitled Resume';
  const templateName = resume.template || 'Modern';

  const headline =
    resume.headline ||
    resume.data?.headline ||
    resume.data?.summary ||
    'Tailored for maximum ATS keyword match and technical recruiter visibility.';
  const previewSkills = resume.data?.skills || resume.skills || ['Full Stack', 'Cloud', 'System Design'];

  return (
    <div
      className={`group flex flex-col rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
        isHighlighted
          ? 'border-primary ring-2 ring-primary/40 shadow-lg'
          : 'border-border/80 hover:border-primary/50'
      } bg-card`}
    >
      {/* ── TOP PREVIEW SECTION (Light/Dark Canvas) ── */}
      <div
        onClick={onEdit}
        className="relative flex-1 p-5 cursor-pointer bg-gradient-to-b from-card via-card to-muted/20 flex flex-col justify-between min-h-[220px]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/60">
              <span className="capitalize">{templateName}</span>
            </span>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
              v{versionNum}
            </span>
            {resume.status && (
              <span className="inline-flex items-center rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20 capitalize">
                {resume.status}
              </span>
            )}
          </div>

          {/* ATS Score Indicator */}
          {atsScore != null ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 border border-emerald-500/30">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(Number(atsScore))}% ATS
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded-full">
              No ATS check
            </span>
          )}
        </div>

        {/* Candidate / Role Header */}
        <div className="my-3">
          <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs font-medium text-primary/90 mt-0.5 line-clamp-1">
            {targetRole}
          </p>
        </div>

        {/* Mini Document Layout Preview */}
        <div className="rounded-xl border border-border/60 bg-background/80 p-3 space-y-2 backdrop-blur-xs shadow-xs">
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {headline}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(Array.isArray(previewSkills) ? previewSkills.slice(0, 3) : []).map((sk, idx) => (
              <span
                key={idx}
                className="rounded bg-muted/80 px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
              >
                {typeof sk === 'string' ? sk : sk.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOWER ELECTRIC BLUE FOOTER BAR (#0084FF) ── */}
      <div className="bg-[#0084FF] text-white px-4 py-3 flex items-center justify-between shadow-inner">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 shrink-0 text-white/90" />
            <p className="text-xs font-semibold truncate text-white max-w-[130px] sm:max-w-[160px]">
              {title}
            </p>
          </div>
          <p className="text-[10px] text-white/75 pl-5">
            Updated {updatedText}
          </p>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            title="Open in Resume Builder"
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
          >
            <Eye className="size-4" />
          </button>

          <button
            type="button"
            onClick={onAts}
            disabled={isAtsRunning}
            title="Run ATS deep scan"
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50"
          >
            {isAtsRunning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ScanSearch className="size-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onTailor}
            title="Tailor to a job description"
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
          >
            <Sparkles className="size-4" />
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate as new version"
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
          >
            <Copy className="size-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Delete version"
            className="rounded-lg p-1.5 text-white/90 hover:bg-red-500/80 hover:text-white transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Progress Donut Widget matching the Dribbble sidebar
 */
function ProfileProgressWidget({ onNavigateProfile, onEditProfile }) {
  const [profile, setProfile] = useState(() => getMasterCareerProfile());

  useEffect(() => {
    const handleSync = () => setProfile(getMasterCareerProfile());
    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const score = useMemo(() => calculateProfileScore(profile), [profile]);

  const checklistItems = useMemo(() => {
    const hasName = Boolean(profile?.personalInfo?.fullName?.trim());
    const hasEmail = Boolean(profile?.personalInfo?.email?.trim());
    const hasHeadline = Boolean(profile?.personalInfo?.headline?.trim());
    const hasEducation = Array.isArray(profile?.education) && profile.education.length > 0;
    const hasExperience = Array.isArray(profile?.experience) && profile.experience.length > 0;
    const hasSkills = Array.isArray(profile?.skills) && profile.skills.length > 0;
    const summaryText = typeof profile?.summary === 'string' ? profile.summary : profile?.summary?.primary;
    const hasObjective = Boolean(summaryText && summaryText.trim().length > 20);

    return [
      {
        id: 'personal',
        label: 'Personal Details',
        isComplete: hasName && hasEmail && hasHeadline,
        detail: hasName ? profile.personalInfo.fullName : 'Name, email, title',
        icon: User,
      },
      {
        id: 'education',
        label: 'Academic Qualification',
        isComplete: hasEducation,
        detail: hasEducation ? `${profile.education.length} degree(s)` : 'Universities & degrees',
        icon: GraduationCap,
      },
      {
        id: 'experience',
        label: 'Work Experience',
        isComplete: hasExperience,
        detail: hasExperience ? `${profile.experience.length} position(s)` : 'Past roles & impact',
        icon: Briefcase,
      },
      {
        id: 'skills',
        label: 'Skills',
        isComplete: hasSkills,
        detail: hasSkills ? `${profile.skills.length} skills listed` : 'Technical competencies',
        icon: Wrench,
      },
      {
        id: 'objective',
        label: 'Career Objective',
        isComplete: hasObjective,
        detail: hasObjective ? 'Summary active' : 'Professional overview',
        icon: Target,
      },
    ];
  }, [profile]);

  return (
    <Card className="rounded-2xl border-border/80 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">
            Your Profile Progress
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep your master data verified for instant tailoring and interview prep.
          </p>
        </div>

        {/* Donut Score Ring */}
        <div className="flex flex-col items-center justify-center py-2">
          <ScoreRing
            value={score}
            size={124}
            stroke={10}
            color="#0084FF"
            track="rgba(0, 132, 255, 0.15)"
          >
            <span className="text-2xl font-black font-heading text-foreground">
              {score}%
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </span>
          </ScoreRing>
        </div>

        {/* Section Checklist */}
        <div className="space-y-3 pt-1">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm py-1 border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`size-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.isComplete
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                  }`}
                >
                  {item.isComplete ? (
                    <Check className="size-3 stroke-[3]" />
                  ) : (
                    <X className="size-3 stroke-[3]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.detail}
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-medium shrink-0 ${
                  item.isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                }`}
              >
                {item.isComplete ? 'Complete' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {/* Dual Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateProfile}
            className="w-full text-xs font-semibold rounded-xl"
          >
            View Profile
          </Button>
          <Button
            size="sm"
            onClick={onEditProfile}
            className="w-full text-xs font-semibold rounded-xl bg-[#0084FF] hover:bg-[#0074E0] text-white"
          >
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
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

  const list = resumes.data || [];

  // Metrics for Top Stat Bar
  const stats = useMemo(() => {
    const total = list.length;
    const atsAnalyzed = list.filter(
      (r) => r.ats?.score != null || r.ats_score != null || r.ats?.overall != null
    ).length;
    const tailoredCount = list.filter(
      (r) => r.jd_title || r.jdTitle || (r.versionNumber || r.version_number) > 1
    ).length;

    return { total, atsAnalyzed, tailoredCount };
  }, [list]);

  if (resumes.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Page Header ── */}
      <PageHeader
        title="Resume Studio"
        description="Versioned resumes that are never overwritten. Tailor to JD specifications, benchmark ATS scores, and prepare for interviews."
        icon={FileText}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/resume-studio/jd-tailor')}>
              <Sparkles className="size-4" /> Tailor to a JD
            </Button>
            <Button
              className="bg-[#0084FF] hover:bg-[#0074E0] text-white"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" /> New resume
            </Button>
          </>
        }
      />

      {/* ── Highlight Banner after Tailoring ── */}
      {justTailored && highlight && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold">
              Tailored version created &amp; re-scored
            </p>
            <p className="text-xs text-muted-foreground">
              The new version was analyzed against the target job description automatically.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={clearHighlight}>
            Dismiss
          </Button>
        </div>
      )}

      {/* ── Top AI Intelligence Feature Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-blue-600/10 via-sky-500/5 to-primary/10 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0084FF]/15 px-3 py-1 text-xs font-semibold text-[#0084FF]">
              <Sparkles className="size-3.5" />
              <span>More with AI Intelligence</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold font-heading text-foreground">
              Tailor and benchmark resumes for maximum ATS callback rates
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Scan keyword alignment against specific job descriptions, audit parser structural errors,
              and maintain your single-source career vault.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/resume-studio/jd-tailor')}
              className="rounded-xl text-xs font-semibold"
            >
              <Sparkles className="size-3.5 text-[#0084FF]" />
              Tailor to a JD
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="rounded-xl text-xs font-semibold bg-[#0084FF] hover:bg-[#0074E0] text-white"
            >
              <Plus className="size-3.5" />
              Create Resume
            </Button>
          </div>
        </div>
      </div>

      {/* ── 4 Quick Stat Cards (Inspired by Dribbble top metrics) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. New Resume Action Card */}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="group flex flex-col justify-between p-4 rounded-2xl border border-dashed border-[#0084FF]/40 bg-[#0084FF]/5 hover:bg-[#0084FF]/10 hover:border-[#0084FF] transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-[#0084FF]/15 text-[#0084FF] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="size-5" />
            </div>
            <span className="text-[11px] font-semibold text-[#0084FF] uppercase tracking-wide">
              Action
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-foreground group-hover:text-[#0084FF] transition-colors">
              + New Resume
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Create a fresh version
            </p>
          </div>
        </button>

        {/* 2. Resumes Total */}
        <div className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <span className="text-2xl font-black font-heading text-foreground">
              {stats.total.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-foreground">Resumes</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Active versioned documents
            </p>
          </div>
        </div>

        {/* 3. ATS Analyzed */}
        <div className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ScanSearch className="size-5" />
            </div>
            <span className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">
              {stats.atsAnalyzed.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-foreground">ATS Analyzed</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scored &amp; keyword-verified
            </p>
          </div>
        </div>

        {/* 4. Tailored Versions */}
        <div className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <span className="text-2xl font-black font-heading text-purple-600 dark:text-purple-400">
              {stats.tailoredCount.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-foreground">Tailored Versions</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Job-description aligned
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns (Main Resume Grid + Right Profile Progress) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left / Main Content (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Resumes
              </h3>
              <p className="text-xs text-muted-foreground">
                All saved resumes and role-specific variations
              </p>
            </div>
            <Badge variant="outline" className="rounded-lg text-xs px-2.5 py-1">
              {list.length} {list.length === 1 ? 'version' : 'versions'}
            </Badge>
          </div>

          {resumes.isError ? (
            <ErrorState
              error={resumes.error}
              title="Couldn't load your resumes"
              onRetry={() => resumes.refetch()}
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No resumes yet"
              description="Create your first versioned resume or start building from your Career Profile."
              actionLabel="Create a resume"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {list.map((r) => (
                <TwoToneResumeCard
                  key={r.id}
                  resume={r}
                  isHighlighted={highlight === r.id}
                  isAtsRunning={ats.isPending && ats.variables === r.id}
                  onEdit={() => navigate(`/resumes/${r.id}`)}
                  onAts={() => ats.mutate(r.id)}
                  onTailor={() => navigate(`/resume-studio/jd-tailor?resumeId=${r.id}`)}
                  onDuplicate={() => duplicate.mutate(r.id)}
                  onDelete={() => remove.mutate(r.id)}
                />
              ))}

              {/* Add New Resume Tile */}
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-card/40 text-muted-foreground transition-all hover:border-[#0084FF] hover:bg-[#0084FF]/5 hover:text-[#0084FF]"
              >
                <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-[#0084FF]">
                  <FilePlus2 className="size-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Create New Resume</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Start another version
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Version History Table / Pill Strip */}
          {list.length > 0 && (
            <Card className="rounded-2xl border-border/80 shadow-xs">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading text-sm font-semibold">Version History</p>
                    <p className="text-xs text-muted-foreground">Quick jump to any document version</p>
                  </div>
                  <Badge variant="outline">{list.length} versions</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((r) => {
                    const score = r.ats?.score ?? r.ats_score ?? null;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => navigate(`/resumes/${r.id}`)}
                        className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-left text-xs transition-all hover:border-primary/50 hover:bg-muted/40"
                      >
                        <span
                          className={`rounded px-1.5 py-0.5 border font-semibold ${
                            STATUS_TONE[r.status] || STATUS_TONE.draft
                          }`}
                        >
                          v{r.versionNumber ?? r.version_number ?? 1}
                        </span>
                        <span className="max-w-36 truncate font-medium">{r.name}</span>
                        {score != null && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {Math.round(Number(score))}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right Column: Your Profile Progress Widget (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileProgressWidget
            onNavigateProfile={() => navigate('/career-profile')}
            onEditProfile={() => navigate('/career-profile')}
          />
        </div>
      </div>

      <CreateResumeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(r) => {
          const next = new URLSearchParams();
          next.set('highlight', r.id);
          setParams(next, { replace: true });
          navigate(`/resumes/${r.id}`);
        }}
      />
    </div>
  );
}