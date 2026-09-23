import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const stepIcon = {
  pending: null,
  loading: <Loader2 className="size-4 animate-spin" />,
  done: <CheckCircle2 className="size-4 text-success" />,
  error: <XCircle className="size-4 text-destructive" />,
};

export default function LoadingSteps({ steps, title = 'HireMind AI is working…' }) {
  const active = steps.findIndex((s) => s.status === 'loading');
  return (
    <div className="glass glow-subtle mx-auto w-full max-w-md rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <p className="font-heading text-sm font-semibold">{title}</p>
      </div>
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  step.status === 'done'
                    ? 'border-success/40 bg-success/10'
                    : step.status === 'error'
                      ? 'border-destructive/40 bg-destructive/10'
                      : step.status === 'loading'
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground'
                }`}
              >
                {stepIcon[step.status]}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${step.status === 'pending' ? 'text-muted-foreground' : ''}`}>
                  {step.label}
                </p>
                {(step.status === 'done' || step.status === 'error') && step.detail && (
                  <p className="truncate text-xs text-muted-foreground">{step.detail}</p>
                )}
              </div>
              {step.status === 'loading' && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {active >= 0 ? i + 1 : ''}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function buildSteps(labels) {
  return labels.map((label, i) => ({
    label,
    status: i === 0 ? 'loading' : 'pending',
    detail: '',
  }));
}

export function updateStep(steps, label, status, detail) {
  return steps.map((s) => {
    if (s.label === label) return { ...s, status, detail };
    return s;
  });
}