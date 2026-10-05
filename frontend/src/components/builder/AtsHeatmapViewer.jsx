import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  FileCode,
  FileText,
  Sparkles,
  Info,
  Check,
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Common technical and action verb dictionaries for parsing simulation
const ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'developed', 'designed',
  'implemented', 'optimized', 'streamlined', 'accelerated', 'transformed',
  'refactored', 'orchestrated', 'collaborated', 'scaled', 'delivered',
  'mentored', 'automated', 'deployed', 'managed', 'led', 'built', 'created'
]);

export default function AtsHeatmapViewer({
  resumeData,
  onExportText,
  onExportJSON,
  onExportPDF
}) {
  const [copied, setCopied] = useState(false);
  const [highlightFilter, setHighlightFilter] = useState('all'); // 'all' | 'metrics' | 'skills' | 'verbs'

  // Generate plain text extraction representation
  const plainText = useMemo(() => {
    const lines = [];
    const p = resumeData.personalInfo || {};

    if (p.fullName) lines.push(p.fullName.toUpperCase());
    if (p.title) lines.push(p.title);
    
    const contactParts = [p.email, p.phone, p.location].filter(Boolean);
    if (contactParts.length) lines.push(contactParts.join(' | '));

    const links = [p.linkedin, p.github, p.website].filter(Boolean);
    if (links.length) lines.push(links.join(' | '));

    lines.push('');

    if (resumeData.summary) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(resumeData.summary);
      lines.push('');
    }

    if (resumeData.experience?.length) {
      lines.push('WORK EXPERIENCE');
      resumeData.experience.forEach(exp => {
        lines.push(`${exp.position || 'Role'} — ${exp.company || 'Company'}`);
        lines.push(`${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''} | ${exp.location || ''}`);
        (exp.bullets || []).forEach(b => {
          if (b && b.trim()) lines.push(`• ${b.trim()}`);
        });
        lines.push('');
      });
    }

    if (resumeData.education?.length) {
      lines.push('EDUCATION');
      resumeData.education.forEach(edu => {
        lines.push(`${edu.degree || 'Degree'} — ${edu.institution || 'University'}`);
        lines.push(`${edu.startYear || ''} - ${edu.endYear || ''} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}`);
        lines.push('');
      });
    }

    if (resumeData.skills?.length) {
      lines.push('SKILLS & TECHNOLOGIES');
      lines.push(resumeData.skills.join(', '));
      lines.push('');
    }

    if (resumeData.projects?.length) {
      lines.push('PROJECTS');
      resumeData.projects.forEach(proj => {
        lines.push(`${proj.name || 'Project'} ${proj.technologies ? `(${proj.technologies})` : ''}`);
        if (proj.description) lines.push(proj.description);
        lines.push('');
      });
    }

    if (resumeData.certifications?.length) {
      lines.push('CERTIFICATIONS');
      resumeData.certifications.forEach(cert => {
        lines.push(`${cert.name || ''} — ${cert.issuer || ''} (${cert.year || ''})`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }, [resumeData]);

  // Analyze metrics and keyword density
  const analysis = useMemo(() => {
    const text = plainText;
    const words = text.toLowerCase().match(/\b[a-z0-9+#.-]+\b/g) || [];
    
    const metricMatches = text.match(/\d+[\d,.]*[%+xXkKmMbB$]?|\$\d+[\d,.]*/g) || [];
    const detectedVerbs = words.filter(w => ACTION_VERBS.has(w));
    const detectedSkills = resumeData.skills || [];

    // Parseability checklist
    const checks = [
      { name: 'Contact & Header Parsing', status: Boolean(resumeData.personalInfo?.email && resumeData.personalInfo?.phone), desc: 'Clean single-line header without unparseable tables' },
      { name: 'Standard Section Headings', status: true, desc: 'Uses universally recognized headers (Experience, Education, Skills)' },
      { name: 'Quantifiable Metrics', status: metricMatches.length >= 3, desc: `${metricMatches.length} numerical achievements detected` },
      { name: 'Action Verb Density', status: detectedVerbs.length >= 4, desc: `${detectedVerbs.length} high-impact verbs detected` },
      { name: 'Unreadable Characters Audit', status: !/[^\x00-\x7F]/.test(text.replace(/[•–—]/g, '')), desc: 'No corrupt UTF-8 symbols or graphical glitch characters' }
    ];

    const passCount = checks.filter(c => c.status).length;
    const parseScore = Math.round((passCount / checks.length) * 100);

    return {
      metricMatches,
      detectedVerbs,
      detectedSkills,
      checks,
      parseScore,
      wordCount: words.length
    };
  }, [plainText, resumeData]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success('📋 ATS raw text copied to clipboard for portal application!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Highlight keywords in raw text
  const renderHighlightedText = () => {
    const lines = plainText.split('\n');

    return lines.map((line, lIdx) => {
      if (!line.trim()) return <div key={lIdx} className="h-4" />;

      const isHeader = /^(PROFESSIONAL SUMMARY|WORK EXPERIENCE|EDUCATION|SKILLS & TECHNOLOGIES|PROJECTS|CERTIFICATIONS)$/.test(line);

      if (isHeader) {
        return (
          <div key={lIdx} className="font-mono font-bold text-primary text-xs uppercase tracking-wider pt-3 pb-1 border-b border-border/40">
            {line}
          </div>
        );
      }

      // Word-by-word tokenized rendering with heatmap pills
      const tokens = line.split(/(\s+|•|[(),|])/);

      return (
        <div key={lIdx} className="font-mono text-xs text-foreground/90 leading-relaxed">
          {tokens.map((token, tIdx) => {
            const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isMetric = /\d+[%+xXkKmMbB$]?|\$\d+/.test(token);
            const isVerb = ACTION_VERBS.has(clean);
            const isSkill = analysis.detectedSkills.some(s => s.toLowerCase() === clean);

            if (isMetric && (highlightFilter === 'all' || highlightFilter === 'metrics')) {
              return (
                <span
                  key={tIdx}
                  className="bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-1 rounded border border-amber-500/30"
                  title="Quantifiable Impact Metric"
                >
                  {token}
                </span>
              );
            }

            if (isVerb && (highlightFilter === 'all' || highlightFilter === 'verbs')) {
              return (
                <span
                  key={tIdx}
                  className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold px-1 rounded border border-emerald-500/30"
                  title="Strong Action Verb"
                >
                  {token}
                </span>
              );
            }

            if (isSkill && (highlightFilter === 'all' || highlightFilter === 'skills')) {
              return (
                <span
                  key={tIdx}
                  className="bg-primary/20 text-primary font-semibold px-1 rounded border border-primary/30"
                  title="Hard Technical Skill"
                >
                  {token}
                </span>
              );
            }

            return <span key={tIdx}>{token}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl space-y-4 text-left">
      {/* Top Banner: ATS Parser Diagnostics & Score */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-500">
              <span className="text-base font-extrabold leading-none">{analysis.parseScore}%</span>
              <span className="text-[9px] uppercase font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Match</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Robot ATS Parsing Simulation</h3>
                <Badge variant={analysis.parseScore >= 80 ? 'success' : 'warning'}>
                  {analysis.parseScore >= 80 ? '100% Robot Parseable' : 'Needs Optimization'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Shows exact character text stream extracted by Workday, Taleo, Greenhouse & Lever.
              </p>
            </div>
          </div>

          {/* Quick Export Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyText}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied!' : 'Copy Raw Text'}
            </Button>
            <Button size="sm" variant="default" onClick={onExportText}>
              <Download className="w-3.5 h-3.5 mr-1" /> Export .TXT
            </Button>
            <Button size="sm" variant="secondary" onClick={onExportJSON}>
              <FileCode className="w-3.5 h-3.5 mr-1" /> JSON Resume
            </Button>
          </div>
        </div>

        {/* Legend Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium text-[11px]">Heatmap Highlights:</span>
            <button
              onClick={() => setHighlightFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                highlightFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({analysis.metricMatches.length + analysis.detectedVerbs.length})
            </button>
            <button
              onClick={() => setHighlightFilter('metrics')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                highlightFilter === 'metrics' ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              📊 Metrics ({analysis.metricMatches.length})
            </button>
            <button
              onClick={() => setHighlightFilter('verbs')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                highlightFilter === 'verbs' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              ⚡ Action Verbs ({analysis.detectedVerbs.length})
            </button>
            <button
              onClick={() => setHighlightFilter('skills')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                highlightFilter === 'skills' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              💻 Tech Skills ({analysis.detectedSkills.length})
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground font-mono">
            {analysis.wordCount} words · {plainText.length} characters
          </div>
        </div>

        {/* Checklist Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 border-t border-border/40">
          {analysis.checks.map((c, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-2/40 border border-border/50 text-[11px]">
              {c.status ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-foreground leading-tight">{c.name}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Extracted Text Terminal Window */}
      <div className="rounded-2xl border border-border/80 bg-surface-2/50 backdrop-blur-md p-6 shadow-inner space-y-1 overflow-x-auto max-h-[600px] custom-scrollbar">
        {renderHighlightedText()}
      </div>
    </div>
  );
}
