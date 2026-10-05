import { useRegisterSW } from 'virtual:pwa-register/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { GlowButton } from '../ui/GlassCard';

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r?: ServiceWorkerRegistration) {
      console.log('Service Worker registered successfully:', r);
    },
    onRegisterError(error: any) {
      console.error('Service Worker registration failed:', error);
    },
  });

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-5 glass rounded-2xl border border-primary/[0.08] shadow-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary">App Update Available</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                A new version of HireMind AI is available. Reload the application to get the latest features and optimizations.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-primary rounded-lg transition-colors"
            >
              Dismiss
            </button>
            <GlowButton
              onClick={() => updateServiceWorker(true)}
              className="!py-2 !px-4 !text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reload App
            </GlowButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
