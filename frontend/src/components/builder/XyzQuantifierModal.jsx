import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, ArrowRight, Zap, TrendingUp, DollarSign, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function XyzQuantifierModal({
  isOpen,
  onClose,
  initialText = '',
  onApply,
  role = 'Software Engineer'
}) {
  const [currentText, setCurrentText] = useState(initialText);
  const [impactType, setImpactType] = useState('performance');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update text when modal opens with new bullet
  React.useEffect(() => {
    setCurrentText(initialText);
  }, [initialText]);

  // Generate dynamic XYZ formulas based on input and impact type
  const generateFormulas = (text, type) => {
    const raw = text.trim() || 'developed responsive user interface and backend services';
    const cleanAction = raw.replace(/^(worked on|helped with|responsible for|did)\s+/i, '');

    if (type === 'performance') {
      return [
        `Architected and optimized ${cleanAction}, decreasing latency by 42% and cutting API response times to <120ms across 1.5M+ requests.`,
        `Streamlined ${cleanAction} using modern async patterns, boosting system throughput by 35% and reducing server compute costs by 20%.`,
        `Refactored core architecture of ${cleanAction}, achieving 99.98% uptime and accelerating build & deployment pipeline speeds by 50%.`
      ];
    } else if (type === 'scale') {
      return [
        `Engineered high-scale infrastructure for ${cleanAction}, supporting 2.4M+ monthly active users with zero downtime.`,
        `Spearheaded the technical design of ${cleanAction}, automating data pipelines and processing over 500GB+ of daily transactions.`,
        `Scaled ${cleanAction} across 8 distributed microservices, improving concurrency handling by 65% and reducing failover incidents.`
      ];
    } else if (type === 'business') {
      return [
        `Delivered ${cleanAction} ahead of schedule, driving a 28% increase in user retention and generating $180K in annualized revenue.`,
        `Transformed client workflows through ${cleanAction}, boosting end-user conversion rates by 34% and cutting onboarding drop-off by half.`,
        `Implemented key optimizations for ${cleanAction}, saving 15+ engineering hours per week and reducing third-party SaaS expenses by $40K/yr.`
      ];
    } else {
      return [
        `Spearheaded a cross-functional team of 6 engineers to build ${cleanAction}, accelerating release cycles by 30%.`,
        `Mentored 4 junior developers and established code review standards while shipping ${cleanAction} to enterprise production clients.`,
        `Partnered closely with Product and UX leads to deliver ${cleanAction}, achieving a 94% customer satisfaction (CSAT) score.`
      ];
    }
  };

  const suggestions = generateFormulas(currentText, impactType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-card border border-border/80 text-card-foreground rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">Google XYZ Impact Quantifier</h3>
                <Badge variant="header">AI Formula</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Convert weak bullet points into high-scoring ATS metrics: <em>Accomplished [X], as measured by [Y], by doing [Z]</em>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Bullet Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Original / Weak Bullet Point
          </label>
          <textarea
            rows={2}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="e.g. Worked on frontend with React and improved performance..."
            className="w-full bg-surface-2/60 border border-input rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Impact Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select Desired Impact Dimension
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setImpactType('performance')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                impactType === 'performance'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-card border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Performance</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">% speed & latency</p>
            </button>

            <button
              type="button"
              onClick={() => setImpactType('scale')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                impactType === 'scale'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-card border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                <span>Scale & Vol</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Millions & data</p>
            </button>

            <button
              type="button"
              onClick={() => setImpactType('business')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                impactType === 'business'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-card border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Business & $</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">ARR & conversion</p>
            </button>

            <button
              type="button"
              onClick={() => setImpactType('leadership')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                impactType === 'leadership'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-card border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>Leadership</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Teams & delivery</p>
            </button>
          </div>
        </div>

        {/* Quantified Suggestions List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              ⚡ High-Impact AI Formulated Bullets
            </span>
            <span className="text-[11px] text-muted-foreground">Click to apply instantly</span>
          </div>

          <div className="space-y-2.5">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="group p-3.5 rounded-xl bg-surface-2/40 hover:bg-surface-2 border border-border/70 hover:border-primary/50 transition-all flex items-start justify-between gap-3 text-left"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      Option {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed pt-0.5">
                    {sug}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    onApply(sug);
                    toast.success('✨ Quantified XYZ bullet applied to resume!');
                    onClose();
                  }}
                  className="shrink-0 text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Apply
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Tip: ATS algorithms give highest relevance to action verbs combined with numerical percentages.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
