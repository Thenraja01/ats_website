import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Sparkles, Wand2, ShieldCheck, User } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import NotificationsPanel from './NotificationsPanel';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMasterCareerProfile } from '../../services/careerProfileSync';
import { useSelector } from 'react-redux';

function TopBar({ onSearch, unread, onUnread }) {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);
  const profile = useMemo(() => getMasterCareerProfile(), []);

  const candidateName = profile?.personalInfo?.fullName || authUser?.name || 'Candidate';
  const initials = candidateName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'HM';

  return (
    <header className="sticky top-0 z-30 hidden h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl md:flex shadow-xs">
      {/* ── Left: Command Palette Search Bar ── */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 px-3.5 text-xs text-muted-foreground shadow-2xs transition-all hover:border-[#0084FF]/50 hover:bg-card/90 hover:text-foreground group"
        >
          <Search className="size-4 shrink-0 text-muted-foreground group-hover:text-[#0084FF] transition-colors" />
          <span className="flex-1 text-left truncate font-normal">
            Search resumes, job matches, interview prep…
          </span>
          <kbd className="rounded-md border border-border/80 bg-muted/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Center: AI Engine Health Pill ── */}
      <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Ollama llama3.2 · Local AI Active</span>
      </div>

      {/* ── Right Action Controls ── */}
      <div className="flex items-center gap-2.5">
        {/* Quick Match Action */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/ats-analyzer')}
          className="rounded-xl text-xs font-semibold gap-1.5 hidden sm:inline-flex hover:border-primary/50"
        >
          <Wand2 className="size-3.5 text-primary" />
          Job Match &amp; ATS
        </Button>

        {/* Quick Resume Action */}
        <Button
          size="sm"
          onClick={() => navigate('/resumes/new')}
          className="rounded-xl text-xs font-semibold gap-1.5 bg-[#0084FF] hover:bg-[#0074E0] text-white shadow-xs"
        >
          <Plus className="size-3.5" />
          New Resume
        </Button>

        <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Notifications & Theme */}
        <NotificationsPanel unread={unread} onUnread={onUnread} />
        <ThemeToggle />

        {/* Quick User Avatar */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          title="Open Career Vault"
          className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all ml-1"
        >
          <Avatar className="size-8 border border-border/80">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}

export default function WorkspaceLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const isBuilderRoute =
    location.pathname.startsWith('/resumes/new') ||
    location.pathname.startsWith('/resume/new') ||
    location.pathname.startsWith('/builder') ||
    location.pathname.startsWith('/resume-builder') ||
    (location.pathname.startsWith('/resumes/') && !location.pathname.includes('/analyze') && location.pathname !== '/resumes/me') ||
    (location.pathname.startsWith('/resume/') && !location.pathname.includes('/analyze') && location.pathname !== '/resume/me');

  if (isBuilderRoute) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNav onSearch={() => setPaletteOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onSearch={() => setPaletteOpen(true)} unread={unread} onUnread={setUnread} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:px-6 lg:pb-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
        <footer className="mx-auto w-full max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
          HireMind AI · Your career, one intelligent workspace.
        </footer>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}