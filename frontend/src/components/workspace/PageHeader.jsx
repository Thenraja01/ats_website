import { cn } from '@/lib/utils';

export default function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
            <Icon className="size-5 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-heading truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      {children}
    </div>
  );
}