import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import NotificationsPanel from './NotificationsPanel';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

function TopBar({ onSearch, unread, onUnread }) {
  return (
    <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur md:flex">
      <button
        onClick={onSearch}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search pages and actions…</span>
        <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <NotificationsPanel unread={unread} onUnread={onUnread} />
        <ThemeToggle />
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
        <footer className="mx-auto w-full max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground">
          HireMind AI · Your career, one intelligent workspace.
        </footer>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}