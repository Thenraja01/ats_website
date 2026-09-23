import { useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AICallout({ icon, title, children, className, compact = false }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-ai/25 bg-gradient-to-br from-ai/[0.08] via-ai/[0.04] to-transparent p-4',
        className
      )}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-ai/10 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-ai/15 text-ai">
          {icon || <Sparkles className="size-4" />}
        </div>
        <div className={cn('min-w-0 flex-1', compact && 'space-y-1')}>
          {title && <p className="font-heading mb-1 text-sm font-semibold">{title}</p>}
          <div className="text-sm text-muted-foreground [&_p]:leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function CopyBlock({ text, label = 'Copy', className, children }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn('relative group', className)}>
      {children}
      <button
        onClick={copy}
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
        {copied ? 'Copied' : label}
      </button>
    </div>
  );
}