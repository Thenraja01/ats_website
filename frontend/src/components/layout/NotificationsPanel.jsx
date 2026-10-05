import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const TYPE_DOT = {
  resume: 'bg-primary',
  application: 'bg-success',
  interview: 'bg-ai',
  default: 'bg-muted-foreground',
};

export function BellButton({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex size-9 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={`Notifications${count ? `, ${count} unread` : ''}`}
    >
      <Bell className="size-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-primary">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

export default function NotificationsPanel({ unread, onUnread, disabled }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list({ limit: 20 }).then((r) => r.data),
    enabled: open && !disabled,
  });

  useEffect(() => {
    if (!disabled) {
      notificationsAPI
        .unreadCount()
        .then((r) => onUnread?.(r.data.count || 0))
        .catch(() => { });
    }
  }, [disabled, onUnread, open]);

  const markAll = async () => {
    try {
      await notificationsAPI.markAllRead();
      onUnread?.(0);
      refetch();
    } catch {
      /* noop */
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="ring-0 focus:ring-0" asChild={false}>
        <button
          className="relative flex size-9 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-primary">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="font-heading text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto py-1">
          {isLoading && (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!isLoading && (!data || data.length === 0) && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
          )}
          {(data || []).map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setOpen(false);
                if (n.link) navigate(n.link);
                else {
                  notificationsAPI.markRead(n.id).catch(() => { });
                  if (!n.read) onUnread?.(Math.max(0, unread - 1));
                }
              }}
              className={cn(
                'flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent',
                !n.read && 'bg-primary/5'
              )}
            >
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', TYPE_DOT[n.type] || TYPE_DOT.default)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{n.title}</span>
                {n.message && (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.message}</span>
                )}
                {n.createdAt && (
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                )}
              </span>
              {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}