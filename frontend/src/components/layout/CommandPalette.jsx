import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, Command as CommandIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WORKSPACE_NAV_FLAT, WORKSPACE_QUICK_ACTIONS } from './workspaceList';
import { cn } from '@/lib/utils';

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const commands = useMemo(() => {
    const nav = WORKSPACE_NAV_FLAT.map((i) => ({
      id: `nav-${i.href}`,
      label: i.label,
      group: 'Navigate',
      keywords: `${i.keywords || ''} ${i.href}`,
      href: i.href,
      icon: i.icon,
    }));
    const actions = WORKSPACE_QUICK_ACTIONS.map((a, idx) => ({
      id: `act-${idx}`,
      label: a.label,
      group: 'Actions',
      keywords: a.keywords || '',
      href: a.href,
      icon: null,
    }));
    return [...nav, ...actions];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 10);
    return commands
      .filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          (c.keywords || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [query, commands]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const run = (cmd) => {
    if (!cmd) return;
    onOpenChange(false);
    navigate(cmd.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(filtered[active]);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const grouped = filtered.reduce((acc, c) => {
    (acc[c.group] = acc[c.group] || []).push(c);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Search pages and quick actions</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
            Esc
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {Object.keys(grouped).length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results found.</p>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1.5">
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{group}</p>
              {items.map((cmd) => {
                const globalIdx = filtered.indexOf(cmd);
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => run(cmd)}
                    onMouseEnter={() => setActive(globalIdx)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      globalIdx === active ? 'bg-accent text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {Icon ? <Icon className="size-4 shrink-0" /> : <span className="size-4" />}
                    <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                    {globalIdx === active && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CommandIcon className="size-3" /> K to open
          </span>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}