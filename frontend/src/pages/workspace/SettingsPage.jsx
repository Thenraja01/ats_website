import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { CloudUpload, Download, Loader2, LogOut, Moon, Monitor, Palette, Sun, User, Lock, Globe, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/workspace/PageHeader';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { fetchVaultFromCloud, pushMasterToCloud } from '../../services/vaultSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { theme, setTheme } = useTheme();
  const [syncing, setSyncing] = useState('');

  // Template privacy preference state: 'private' vs 'public'
  const [templatePrivacy, setTemplatePrivacy] = useState(() => {
    return localStorage.getItem('hiremind_template_privacy') || 'private';
  });

  const handlePrivacyChange = (mode) => {
    setTemplatePrivacy(mode);
    localStorage.setItem('hiremind_template_privacy', mode);
    if (mode === 'private') {
      toast.success('Private Template Mode activated: Your templates and styles are strictly private to you.');
    } else {
      toast.info('Public Mode activated: Custom templates can be shared in the community catalog.');
    }
  };

  const syncVault = async (direction) => {
    setSyncing(direction);
    try {
      if (direction === 'push') {
        await pushMasterToCloud();
        toast.success('Career Vault pushed to the cloud');
      } else {
        await fetchVaultFromCloud();
        toast.success('Career Vault pulled from the cloud');
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Sync failed — is your account connected to the backend?');
    } finally {
      setSyncing('');
    }
  };

  const signOut = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Personalize your workspace, privacy preferences, and account." icon={Palette} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Pick a look. “System” follows your device preference.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                  theme === t.value ? 'border-primary/60 bg-primary/8 shadow-sm' : 'border-border hover:border-primary/40'
                )}
              >
                <t.icon className="size-4 text-primary" />
                <span>
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="block text-xs capitalize text-muted-foreground">
                    {theme === t.value ? 'Active' : 'Click to enable'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resume Template Privacy & Workspace Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Resume & Template Privacy
              </CardTitle>
              <CardDescription>
                Control how you work with resume templates. Choose whether your custom layouts, styles, and edits remain strictly private to you.
              </CardDescription>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
              templatePrivacy === 'private'
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            )}>
              {templatePrivacy === 'private' ? <Lock className="size-3" /> : <Globe className="size-3" />}
              {templatePrivacy === 'private' ? 'Private Mode Active' : 'Public Catalog Mode'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handlePrivacyChange('private')}
              className={cn(
                'relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all',
                templatePrivacy === 'private'
                  ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Lock className="size-4" />
                    </div>
                    Work Privately (Only Me)
                  </div>
                  {templatePrivacy === 'private' && (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every template you design, clone, or customize is stored in your private vault. Only you can view, edit, or use it. Zero public exposure.
                </p>
              </div>
              <div className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> Recommended for confidential job hunts
              </div>
            </button>

            <button
              type="button"
              onClick={() => handlePrivacyChange('public')}
              className={cn(
                'relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all',
                templatePrivacy === 'public'
                  ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Globe className="size-4" />
                    </div>
                    Public / Community Mode
                  </div>
                  {templatePrivacy === 'public' && (
                    <CheckCircle2 className="size-4 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Templates you publish or export can be contributed to the shared template marketplace for other applicants to browse and use.
                </p>
              </div>
              <div className="mt-3 text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Globe className="size-3.5" /> Accessible to global users
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Career Vault sync</CardTitle>
          <CardDescription>
            Your Career Vault lives locally for speed and syncs to the HireMind cloud so matching, tailoring and interviews all use the same truth.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => syncVault('pull')} disabled={!!syncing}>
            {syncing === 'pull' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Pull from cloud
          </Button>
          <Button onClick={() => syncVault('push')} disabled={!!syncing}>
            {syncing === 'push' ? <Loader2 className="size-4 animate-spin" /> : <CloudUpload className="size-4" />}
            Push to cloud
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Signed in as {user?.email || 'candidate'}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input defaultValue={user?.name || ''} readOnly className="mt-1.5" />
            </div>
            <div>
              <Label>Role</Label>
              <Input defaultValue={user?.role || 'candidate'} readOnly className="mt-1.5" />
            </div>
          </div>
          <Separator className="my-4" />
          <Button variant="destructive" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}