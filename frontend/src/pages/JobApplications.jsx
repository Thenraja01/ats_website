import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, LayoutGrid, Table as TableIcon, Search, Building2, MapPin, 
  DollarSign, ExternalLink, Calendar, FileText, Trash2, Edit3, 
  CheckCircle2, Clock, XCircle, Briefcase, Filter, ChevronRight, Sparkles
} from 'lucide-react';
import { applicationsAPI, studioAPI } from '../services/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';

const STATUS_COLUMNS = [
  { id: 'saved', label: 'Saved', color: 'border-slate-500/30 bg-slate-500/5 text-slate-400' },
  { id: 'applied', label: 'Applied', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
  { id: 'screening', label: 'Screening', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400' },
  { id: 'interview', label: 'Interview', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
  { id: 'offer', label: 'Offer', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
  { id: 'rejected', label: 'Rejected', color: 'border-rose-500/30 bg-rose-500/5 text-rose-400' },
  { id: 'withdrawn', label: 'Withdrawn', color: 'border-zinc-500/30 bg-zinc-500/5 text-zinc-400' },
];

export default function JobApplications() {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    jobUrl: '',
    location: '',
    salary: '',
    status: 'applied',
    resumeVersionId: '',
    notes: '',
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const [appsRes, resumesRes] = await Promise.all([
        applicationsAPI.list(),
        studioAPI.listResumes().catch(() => ({ data: [] })),
      ]);
      setApplications(appsRes.data || []);
      setResumes(resumesRes.data || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenAdd = () => {
    setEditingApp(null);
    setFormData({
      company: '',
      role: '',
      jobUrl: '',
      location: '',
      salary: '',
      status: 'applied',
      resumeVersionId: resumes[0]?.id || '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (app) => {
    setEditingApp(app);
    setFormData({
      company: app.company || '',
      role: app.role || app.job_title || '',
      jobUrl: app.job_url || '',
      location: app.location || '',
      salary: app.salary || '',
      status: app.status || 'applied',
      resumeVersionId: app.resume_version_id || '',
      notes: app.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) {
      toast.error('Company and Role are required');
      return;
    }

    try {
      if (editingApp) {
        const res = await applicationsAPI.update(editingApp.id, formData);
        setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? res.data : a)));
        toast.success('Application updated');
      } else {
        const res = await applicationsAPI.create(formData);
        setApplications((prev) => [res.data, ...prev]);
        toast.success('Application tracked successfully');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save application');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this application from tracking?')) return;
    try {
      await applicationsAPI.delete(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.success('Application removed');
    } catch (err) {
      toast.error('Failed to delete application');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationsAPI.update(appId, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === appId ? res.data : a)));
      toast.success(`Moved to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchSearch =
      (app.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.role || app.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || (app.status || 'applied').toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Job Application Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your career search, track interview stages, and connect resumes used per application.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="size-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TableIcon className="size-3.5" />
              Table
            </button>
          </div>

          <Button onClick={handleOpenAdd} className="gap-1.5">
            <Plus className="size-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {STATUS_COLUMNS.map((col) => {
          const count = applications.filter((a) => (a.status || 'applied').toLowerCase() === col.id).length;
          return (
            <div
              key={col.id}
              onClick={() => setStatusFilter(statusFilter === col.id ? 'all' : col.id)}
              className={cn(
                'cursor-pointer rounded-xl border p-3 transition-all hover:border-primary/50',
                statusFilter === col.id ? 'ring-2 ring-primary/50 border-primary' : 'border-border/60 bg-card/60'
              )}
            >
              <p className="text-xs font-medium text-muted-foreground capitalize">{col.label}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, title, location..."
            className="pl-9 h-9"
          />
        </div>

        {statusFilter !== 'all' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="text-xs text-muted-foreground"
          >
            Clear filter ({statusFilter})
          </Button>
        )}
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => (a.status || 'applied').toLowerCase() === col.id);
            return (
              <div
                key={col.id}
                className="flex w-80 shrink-0 flex-col rounded-xl border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2.5 rounded-full', col.color.split(' ')[0].replace('border-', 'bg-'))} />
                    <span className="text-sm font-semibold text-foreground capitalize">{col.label}</span>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {colApps.length}
                  </span>
                </div>

                <div className="mt-3 flex flex-1 flex-col gap-2.5 min-h-[300px]">
                  {colApps.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group rounded-lg border border-border/80 bg-card p-3.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{app.role || app.job_title}</h3>
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="size-3" />
                            {app.company}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(app)}
                            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {(app.location || app.salary) && (
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {app.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="size-3" />
                              {app.location}
                            </span>
                          )}
                          {app.salary && (
                            <span className="flex items-center gap-0.5">
                              <DollarSign className="size-3" />
                              {app.salary}
                            </span>
                          )}
                        </div>
                      )}

                      {app.notes && (
                        <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2 bg-muted/30 p-1.5 rounded">
                          {app.notes}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                        <select
                          value={app.status || 'applied'}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="text-[11px] rounded border border-border/60 bg-background px-1.5 py-0.5 text-muted-foreground capitalize focus:outline-none"
                        >
                          {STATUS_COLUMNS.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move: {s.label}
                            </option>
                          ))}
                        </select>

                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            Job Link <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                      No jobs in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Salary</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-accent/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-semibold text-foreground">{app.role || app.job_title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="size-3" />
                        {app.company}
                      </p>
                    </td>
                    <td className="p-3.5 text-xs text-muted-foreground">{app.location || '—'}</td>
                    <td className="p-3.5 text-xs text-muted-foreground">{app.salary || '—'}</td>
                    <td className="p-3.5">
                      <select
                        value={app.status || 'applied'}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs rounded border border-border/60 bg-background px-2 py-1 capitalize focus:outline-none"
                      >
                        {STATUS_COLUMNS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 text-xs text-muted-foreground max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      No applications found. Click "Add Application" to start tracking your job search!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingApp ? 'Edit Job Application' : 'Track New Application'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">Company *</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google, Stripe"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Job Title *</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. AI Engineer"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Remote, San Francisco"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Salary / Compensation</label>
                <Input
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g. $140k - $160k"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                >
                  {STATUS_COLUMNS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Job Posting URL</label>
                <Input
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Resume Used</label>
              <select
                value={formData.resumeVersionId}
                onChange={(e) => setFormData({ ...formData, resumeVersionId: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Resume Version</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (v{r.version_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Notes / Next Steps</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Key dates, referral contact, questions asked..."
                rows={3}
                className="mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingApp ? 'Save Changes' : 'Add to Tracker'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
