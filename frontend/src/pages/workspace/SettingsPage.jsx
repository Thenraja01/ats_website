import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { CloudUpload, Download, Loader2, LogOut, Moon, Monitor, Palette, Sun, User } from 'lucide-react';
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
      <PageHeader title="Settings" description="Personalize your workspace and manage your account." icon={Palette} />

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
                  theme === t.value ? 'border-primary/60 bg-primary/8' : 'border-border hover:border-primary/40'
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