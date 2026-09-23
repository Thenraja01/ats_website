import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as
    | { response?: { data?: { detail?: unknown } }; message?: unknown }
    | null
    | undefined;
  const detail = e?.response?.data?.detail ?? e?.message;

  if (typeof detail === 'string' && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const { msg, loc } = item as { msg?: unknown; loc?: unknown };
          if (typeof msg === 'string') {
            const path =
              Array.isArray(loc) ? loc.filter((p) => typeof p === 'string').join('.') : '';
            return path ? `${path}: ${msg}` : msg;
          }
        }
        return null;
      })
      .filter((m): m is string => !!m);
    if (msgs.length) return msgs.join(' ');
  }

  if (detail && typeof detail === 'object') {
    const obj = detail as { msg?: unknown; message?: unknown };
    if (typeof obj.msg === 'string') return obj.msg;
    if (typeof obj.message === 'string') return obj.message;
  }

  return fallback;
}
