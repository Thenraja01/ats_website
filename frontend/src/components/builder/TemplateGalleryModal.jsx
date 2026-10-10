import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  Lock,
  Globe,
  Check,
  ShieldCheck,
  Plus,
  Trash2,
  Sliders,
  Layers,
  ArrowRight,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { templatesAPI } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
  currentDesignState,
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' | 'public' | 'private'
  const [categories, setCategories] = useState([]);

  // User's default privacy setting from Settings page
  const userSettingPrivacy = typeof window !== 'undefined'
    ? localStorage.getItem('hiremind_template_privacy') || 'private'
    : 'private';

  // Publish / Save New Template Dialog State
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    category: 'tech',
    tags: '',
    visibility: userSettingPrivacy,
  });
  const [publishing, setPublishing] = useState(false);

  // Sync privacy default when modal opens
  useEffect(() => {
    if (isOpen) {
      setPublishForm(prev => ({
        ...prev,
        visibility: localStorage.getItem('hiremind_template_privacy') || 'private'
      }));
      loadTemplates();
    }
  }, [isOpen, selectedCategory, searchQuery, scopeFilter]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const params = {
        scope: scopeFilter,
        page: 1,
        limit: 50,
      };
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await templatesAPI.list(params);
      if (res?.data?.templates) {
        setTemplates(res.data.templates);
        if (res.data.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        }
      }
    } catch (err) {
      console.error('Failed to fetch template catalog:', err);
      toast.error('Unable to load template catalog. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (template) => {
    onSelectTemplate(template);
    toast.success(`Applied template: "${template.title}"`);
    onClose();
  };

  const handleDelete = async (e, slug) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this custom template?')) return;
    try {
      await templatesAPI.delete(slug);
      toast.success('Template deleted successfully.');
      loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete template.');
    }
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!publishForm.title.trim()) {
      toast.error('Please provide a title for the template.');
      return;
    }

    setPublishing(true);
    try {
      const slug = publishForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
      const tagList = publishForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        slug,
        title: publishForm.title,
        description: publishForm.description || 'Custom crafted resume layout AST.',
        category: publishForm.category,
        tags: tagList,
        visibility: publishForm.visibility,
        atsScoreRating: 96,
        typography: {
          fontFamily: currentDesignState?.fontFamily || 'inter',
          baseSizePt: currentDesignState?.fontSizeNum || 10.5,
          lineHeight: currentDesignState?.lineHeight || 1.45,
        },
        palette: {
          primary: currentDesignState?.accentColor || '#2563EB',
          textPrimary: '#0F172A',
          textMuted: '#64748B',
          surface: '#FFFFFF',
          borderColor: '#E2E8F0',
        },
        layout: {
          schemaVersion: '1.0.0',
          layoutType: currentDesignState?.selectedTemplate === 'executive' ? 'two_column_left_sidebar' : 'single_column',
          pageMarginPx: currentDesignState?.pagePadding || 32,
          sectionGapPx: currentDesignState?.sectionGap || 16,
          itemGapPx: currentDesignState?.itemGap || 8,
          borderRadiusPx: currentDesignState?.borderRadius || 6,
          bulletStyle: currentDesignState?.bulletStyle || 'disc',
          headerAlign: currentDesignState?.headerLayout || 'left',
          atsSafe: true,
          zones: [
            { id: 'header', widthPct: 100, sections: ['personal'], paddingPx: 12 },
            { id: 'main', widthPct: 100, sections: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'], paddingPx: 12 },
          ]
        }
      };

      await templatesAPI.publish(payload);
      toast.success(
        publishForm.visibility === 'private'
          ? 'Template saved privately to your personal vault!'
          : 'Template published to community catalog!'
      );
      setIsPublishOpen(false);
      setPublishForm({
        title: '',
        description: '',
        category: 'tech',
        tags: '',
        visibility: userSettingPrivacy,
      });
      loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save template.');
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Dynamic Template Library</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                1,000+ AST Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse professionally engineered layouts or save your current design.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Setting privacy reminder badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-border bg-muted/40 text-muted-foreground">
              {userSettingPrivacy === 'private' ? (
                <>
                  <Lock className="size-3 text-emerald-500" />
                  <span>Settings: <strong className="text-foreground">Private Mode</strong></span>
                </>
              ) : (
                <>
                  <Globe className="size-3 text-blue-500" />
                  <span>Settings: <strong className="text-foreground">Public Mode</strong></span>
                </>
              )}
            </div>

            <Button
              size="sm"
              variant="default"
              className="gap-1.5 text-xs shadow-sm"
              onClick={() => setIsPublishOpen(true)}
            >
              <Plus className="size-3.5" />
              Save Current Style
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Scope selection */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs w-full md:w-auto">
            <button
              onClick={() => setScopeFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5',
                scopeFilter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Library
            </button>
            <button
              onClick={() => setScopeFilter('public')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5',
                scopeFilter === 'public'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Globe className="size-3.5 text-blue-500" />
              Community Public
            </button>
            <button
              onClick={() => setScopeFilter('private')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5',
                scopeFilter === 'private'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Lock className="size-3.5 text-emerald-500" />
              My Private Only
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, tags, ATS score..."
              className="pl-8 text-xs h-9 bg-card border-border/80"
            />
          </div>
        </div>

        {/* Templates Grid Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <div className="size-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs">Loading template specifications from MongoDB catalog...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No templates found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {scopeFilter === 'private'
                  ? "You don't have any private templates saved yet. Click 'Save Current Style' above to create one strictly for yourself."
                  : "No templates match your search criteria. Try a different query."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl) => {
                const isSelected = currentTemplateId === tpl.slug || currentTemplateId === tpl.id;
                const isPrivate = tpl.visibility === 'private';
                const primaryColor = tpl.palette?.primary || '#2563EB';

                return (
                  <div
                    key={tpl.id || tpl.slug}
                    className={cn(
                      'group relative rounded-xl border p-4 transition-all flex flex-col justify-between bg-card hover:shadow-lg',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border hover:border-border/80'
                    )}
                  >
                    <div>
                      {/* Badge row */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tpl.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="size-3" />
                            {tpl.atsScoreRating || 95}% ATS
                          </span>

                          {isPrivate ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1" title="Private to your account only">
                              <Lock className="size-3" /> Only Me
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Globe className="size-3" /> Public
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mock Layout preview bar */}
                      <div className="w-full h-16 rounded-lg border border-border/60 bg-muted/40 p-2 mb-3 flex gap-2 overflow-hidden">
                        {tpl.layout?.layoutType === 'two_column_left_sidebar' ? (
                          <>
                            <div className="w-1/3 h-full rounded bg-muted-foreground/15 p-1 flex flex-col gap-1">
                              <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: primaryColor }} />
                              <div className="h-1 w-full rounded-full bg-muted-foreground/20" />
                              <div className="h-1 w-2/3 rounded-full bg-muted-foreground/20" />
                            </div>
                            <div className="w-2/3 h-full rounded bg-card p-1 flex flex-col gap-1">
                              <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: primaryColor }} />
                              <div className="h-1 w-full rounded-full bg-muted-foreground/20" />
                              <div className="h-1 w-5/6 rounded-full bg-muted-foreground/20" />
                              <div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full rounded bg-card p-1 flex flex-col gap-1 justify-center">
                            <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: primaryColor }} />
                            <div className="h-1 w-full rounded-full bg-muted-foreground/20" />
                            <div className="h-1 w-4/5 rounded-full bg-muted-foreground/20" />
                            <div className="h-1 w-2/3 rounded-full bg-muted-foreground/20" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {tpl.description}
                      </p>

                      {/* Tags */}
                      {Array.isArray(tpl.tags) && tpl.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {tpl.tags.slice(0, 3).map((tg, idx) => (
                            <span key={idx} className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/60">
                      {tpl.isOwner ? (
                        <button
                          onClick={(e) => handleDelete(e, tpl.slug)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete custom template"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : <div />}

                      <Button
                        size="sm"
                        variant={isSelected ? "outline" : "default"}
                        className="text-xs h-8 gap-1.5 ml-auto"
                        onClick={() => handleApply(tpl)}
                      >
                        {isSelected ? (
                          <>
                            <Check className="size-3.5 text-primary" /> Active
                          </>
                        ) : (
                          <>
                            Apply Template <ArrowRight className="size-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border bg-card/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {templates.length} declarative templates ready for instant rendering.
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>

      {/* Publish / Save Custom Template Submodal */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Save Current Design As Template</h3>
              <button
                onClick={() => setIsPublishOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              <div>
                <Label className="text-xs">Template Title</Label>
                <Input
                  required
                  value={publishForm.title}
                  onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                  placeholder="e.g., Senior Fullstack Clean"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  value={publishForm.description}
                  onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                  placeholder="Brief description of the structure & purpose..."
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <select
                    value={publishForm.category}
                    onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm"
                  >
                    <option value="tech">Tech</option>
                    <option value="executive">Executive</option>
                    <option value="minimal_ats">Minimal ATS</option>
                    <option value="creative">Creative</option>
                    <option value="academic">Academic</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Tags (comma separated)</Label>
                  <Input
                    value={publishForm.tags}
                    onChange={(e) => setPublishForm({ ...publishForm, tags: e.target.value })}
                    placeholder="React, Lead, 2-Col"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Privacy Radio Selection */}
              <div>
                <Label className="text-xs font-semibold">Visibility & Privacy Mode</Label>
                <p className="text-[11px] text-muted-foreground mb-2">
                  Respects your workspace preference from the Settings page.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishForm({ ...publishForm, visibility: 'private' })}
                    className={cn(
                      'p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all',
                      publishForm.visibility === 'private'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Lock className="size-3.5" /> Private (Only Me)
                    </div>
                    <span className="text-[10px] mt-1 font-normal opacity-80">
                      Hidden from everyone else
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishForm({ ...publishForm, visibility: 'public' })}
                    className={cn(
                      'p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all',
                      publishForm.visibility === 'public'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Globe className="size-3.5" /> Public (Community)
                    </div>
                    <span className="text-[10px] mt-1 font-normal opacity-80">
                      Visible in global catalog
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPublishOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={publishing}
                  className="gap-1.5"
                >
                  {publishing ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
