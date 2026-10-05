import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Palette,
  Columns,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Check,
  Download,
  Eye,
  RotateCcw,
  RefreshCw,
  LayoutTemplate,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Smile,
  Layers,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchBackendFonts, loadGoogleFont, DEFAULT_FALLBACK_FONTS } from '../../utils/fontLoader';

const THEME_PALETTES = [
  { name: 'Word Classic Blue', hex: '#185ABD' },
  { name: 'Silicon Valley Sky', hex: '#0284C7' },
  { name: 'Executive Navy', hex: '#0F172A' },
  { name: 'Emerald Tech', hex: '#059669' },
  { name: 'Crimson Leadership', hex: '#DC2626' },
  { name: 'Royal Violet', hex: '#7C3AED' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Minimalist Charcoal', hex: '#334155' },
];

const HEADING_STYLES = [
  { id: 'underline', name: 'Bottom Border Line', desc: 'Sleek accent underline spanning section width' },
  { id: 'banner', name: 'Shaded Banner Pill', desc: 'Soft tinted background highlight with rounded pill' },
  { id: 'left-bar', name: 'Left Accent Bar', desc: 'Bold vertical line to the left of the title' },
  { id: 'minimal', name: 'Minimal Clean', desc: 'Uppercase bold with high letter-spacing' },
  { id: 'boxed', name: 'Boxed Frame', desc: 'Framed outline for distinct section grouping' },
];

// Sample Resume Data specifically curated for MS Word Template Designing
const INITIAL_SAMPLE_RESUME = {
  templateName: 'New Word Resume Template',
  templateDesc: 'Clean ATS-friendly Microsoft Word styled resume architecture',
  baseTemplate: 'modern',
  styling: {
    fontFamily: 'inter',
    fontSizePt: 10.5,
    headingSizePt: 13,
    titleSizePt: 22,
    lineHeight: 1.45,
    accentColor: '#185ABD',
    headingStyle: 'underline', // 'underline' | 'banner' | 'left-bar' | 'minimal' | 'boxed'
    headerLayout: 'left', // 'left' | 'center' | 'split'
    pageMargins: 32, // in px (approx 0.85 in)
    sectionGap: 16,
    itemGap: 8,
    bulletStyle: 'disc', // 'disc' | 'square' | 'dash' | 'arrow' | 'none'
    columnLayout: '1-col', // '1-col' | '2-col-left' | '2-col-right'
    showIcons: true,
    showDividerLines: true,
    isBoldHeadings: true,
    isUppercaseHeadings: true
  },
  personalInfo: {
    fullName: 'ALEXANDER CHEN',
    title: 'Senior Full-Stack & AI Systems Architect',
    email: 'alex.chen@stanford.edu',
    phone: '+1 (415) 890-2341',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexchen',
    github: 'github.com/alexchen'
  },
  sections: [
    {
      id: 'summary',
      title: 'Professional Summary',
      type: 'paragraph',
      content: 'Distinguished Systems Architect with 6+ years of experience designing scalable microservices, vector search pipelines, and high-concurrency cloud infrastructure. Spearheaded distributed caching architectures reducing p99 latency by 45% for 12M+ monthly active users.'
    },
    {
      id: 'experience',
      title: 'Work Experience',
      type: 'experience',
      items: [
        {
          id: 'exp_1',
          position: 'Lead AI Infrastructure Engineer',
          company: 'Anthropic Systems & Cloud Labs',
          location: 'San Francisco, CA',
          startDate: '2022',
          endDate: 'Present',
          bullets: [
            'Architected distributed LLM inference orchestration handling 4,500+ requests/sec with 99.98% uptime.',
            'Engineered automated vector retrieval indexing using PostgreSQL pgvector and Redis, slashing search latency by 60%.',
            'Mentored a high-performing squad of 8 engineers across backend telemetry and Kubernetes clusters.'
          ]
        },
        {
          id: 'exp_2',
          position: 'Senior Software Engineer',
          company: 'Stripe Global Financial Core',
          location: 'San Francisco, CA',
          startDate: '2019',
          endDate: '2022',
          bullets: [
            'Designed fault-tolerant payment routing services processing $2.4B+ in annual transaction volume.',
            'Optimized relational query bottlenecks resulting in a 35% reduction in cloud AWS compute overhead.'
          ]
        }
      ]
    },
    {
      id: 'education',
      title: 'Education',
      type: 'education',
      items: [
        {
          id: 'edu_1',
          institution: 'Stanford University',
          degree: 'B.S. in Computer Science (Artificial Intelligence Specialization)',
          startYear: '2015',
          endYear: '2019',
          gpa: '3.92 / 4.0'
        }
      ]
    },
    {
      id: 'skills',
      title: 'Technical Skills & Core Competencies',
      type: 'skills',
      categories: [
        { name: 'Languages & Frameworks', list: 'Python, TypeScript, React, Next.js, Node.js, Go, FastAPI' },
        { name: 'AI & Data Infrastructure', list: 'PyTorch, LangChain, Vector DBs, Redis, PostgreSQL, Kafka' },
        { name: 'Cloud & DevOps', list: 'AWS (ECS, Lambda, S3), Docker, Kubernetes, Terraform, CI/CD' }
      ]
    },
    {
      id: 'projects',
      title: 'Key Technical Projects',
      type: 'projects',
      items: [
        {
          id: 'proj_1',
          name: 'HyperScale Vector Engine',
          tech: 'Rust, CUDA, PyTorch, gRPC',
          description: 'High-throughput GPU-accelerated nearest-neighbor vector search library achieving 8x performance over standard CPU indexing.'
        }
      ]
    }
  ]
};

export default function WordTemplateStudio({
  isOpen = true,
  onClose,
  onSaveTemplate,
  initialTemplateData = null
}) {
  const [activeRibbonTab, setActiveRibbonTab] = useState('home'); // 'home' | 'layout' | 'insert' | 'themes'
  const [templateName, setTemplateName] = useState(() => initialTemplateData?.name || 'My Custom MS Word Template');
  const [templateDesc, setTemplateDesc] = useState(() => initialTemplateData?.desc || 'Custom designed template created in Word Studio');
  const [styling, setStyling] = useState(() => initialTemplateData?.styling || INITIAL_SAMPLE_RESUME.styling);
  const [resumeContent, setResumeContent] = useState(() => INITIAL_SAMPLE_RESUME);
  const [zoomLevel, setZoomLevel] = useState(95);
  const [activeSectionId, setActiveSectionId] = useState(null);

  const [fontList, setFontList] = useState(DEFAULT_FALLBACK_FONTS);

  // Fetch backend-driven font metadata on mount
  useEffect(() => {
    fetchBackendFonts().then(fonts => {
      if (fonts && fonts.length > 0) {
        setFontList(fonts);
      }
    });
  }, []);

  const documentPaperRef = useRef(null);

  // Sync if editing an existing template
  useEffect(() => {
    if (initialTemplateData) {
      if (initialTemplateData.name) setTemplateName(initialTemplateData.name);
      if (initialTemplateData.desc) setTemplateDesc(initialTemplateData.desc);
      if (initialTemplateData.accentColor) {
        setStyling(prev => ({
          ...prev,
          accentColor: initialTemplateData.accentColor,
          fontFamily: initialTemplateData.fontFamily || prev.fontFamily,
          fontSizePt: initialTemplateData.fontSizeNum || prev.fontSizePt,
          lineHeight: initialTemplateData.lineHeight || prev.lineHeight,
          pageMargins: initialTemplateData.pagePadding || prev.pageMargins,
          sectionGap: initialTemplateData.sectionGap || prev.sectionGap,
          itemGap: initialTemplateData.itemGap || prev.itemGap,
          bulletStyle: initialTemplateData.bulletStyle || prev.bulletStyle,
          headerLayout: initialTemplateData.headerLayout || prev.headerLayout
        }));
      }
    }
  }, [initialTemplateData]);

  const activeFontObj = fontList.find(f => f.id === styling.fontFamily || f.family === styling.fontFamily) || fontList[0] || DEFAULT_FALLBACK_FONTS[0];

  // Dynamically load Google Font into DOM
  useEffect(() => {
    if (activeFontObj) {
      loadGoogleFont(activeFontObj);
    }
  }, [activeFontObj]);

  // Helper to update styling properties
  const updateStyle = (key, value) => {
    setStyling(prev => ({ ...prev, [key]: value }));
  };

  // Section Reordering
  const handleMoveSection = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= resumeContent.sections.length) return;
    const updated = [...resumeContent.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setResumeContent(prev => ({ ...prev, sections: updated }));
    toast.success('Section reordered');
  };

  const handleDeleteSection = (index) => {
    const updated = resumeContent.sections.filter((_, i) => i !== index);
    setResumeContent(prev => ({ ...prev, sections: updated }));
    toast.success('Section removed from template');
  };

  const handleAddSection = (type) => {
    let newSec = null;
    const id = `sec_${Date.now()}`;
    if (type === 'experience') {
      newSec = {
        id,
        title: 'Experience / Leadership',
        type: 'experience',
        items: [{
          id: `item_${Date.now()}`,
          position: 'Role Title',
          company: 'Company / Organization',
          location: 'City, State',
          startDate: '2023',
          endDate: 'Present',
          bullets: ['Key outcome or achievement highlight with quantitative metrics.']
        }]
      };
    } else if (type === 'education') {
      newSec = {
        id,
        title: 'Education & Honors',
        type: 'education',
        items: [{
          id: `item_${Date.now()}`,
          institution: 'University Name',
          degree: 'Degree & Major',
          startYear: '2020',
          endYear: '2024',
          gpa: '3.9 / 4.0'
        }]
      };
    } else if (type === 'skills') {
      newSec = {
        id,
        title: 'Skills & Proficiencies',
        type: 'skills',
        categories: [
          { name: 'Core Proficiencies', list: 'Leadership, Architecture, Communication, Strategy' }
        ]
      };
    } else if (type === 'projects') {
      newSec = {
        id,
        title: 'Key Projects',
        type: 'projects',
        items: [{
          id: `item_${Date.now()}`,
          name: 'Project Title',
          tech: 'Tech Stack / Frameworks',
          description: 'Summary of technical impact, design decisions, and quantifiable deliverables.'
        }]
      };
    } else {
      newSec = {
        id,
        title: 'Certifications / Awards',
        type: 'paragraph',
        content: 'Add details, honors, patents, or publications in this custom section.'
      };
    }

    setResumeContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSec]
    }));
    toast.success(`Added ${newSec.title} section`);
  };

  // Save template package
  const handleSaveAndApply = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a name for this template');
      return;
    }

    const customTemplatePackage = {
      id: initialTemplateData?.id || `custom_word_${Date.now()}`,
      name: templateName.trim(),
      desc: templateDesc.trim() || `MS Word layout with ${styling.headingStyle} headings`,
      baseTemplate: styling.columnLayout === '1-col' ? 'minimal' : 'modern',
      accentColor: styling.accentColor,
      fontFamily: styling.fontFamily,
      fontSizeNum: styling.fontSizePt,
      lineHeight: styling.lineHeight,
      pagePadding: styling.pageMargins,
      sectionGap: styling.sectionGap,
      itemGap: styling.itemGap,
      borderRadius: styling.headingStyle === 'banner' ? 6 : 0,
      bulletStyle: styling.bulletStyle,
      headerLayout: styling.headerLayout,
      showAvatar: false,
      stylingConfig: styling,
      createdAt: new Date().toISOString()
    };

    if (onSaveTemplate) {
      onSaveTemplate(customTemplatePackage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1E1E1E] text-slate-100 flex flex-col font-sans overflow-hidden select-none">

      {/* ── 1. MS WORD TOP TITLE BAR ────────────────────────────────────── */}
      <div className="bg-[#102A43] border-b border-[#243E56] px-3 py-1.5 flex items-center justify-between text-xs text-primary shadow-sm">
        {/* Left: App Logo & Quick Access */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-6 h-6 rounded bg-[#185ABD] text-primary flex items-center justify-center font-bold text-xs shadow">
              W
            </div>
            <span className="text-primary font-bold tracking-tight text-sm hidden sm:inline">Word Resume Studio</span>
          </div>

          <div className="hidden md:flex items-center gap-1 pl-3 border-l border-primary/15">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template Name..."
              className="bg-[#0B1D3A] border border-primary/20 rounded px-2.5 py-0.5 text-xs text-primary focus:outline-none focus:border-blue-400 w-56 font-medium"
              title="Click to rename template"
            />
          </div>
        </div>

        {/* Center: Autosave Pill */}
        <div className="flex items-center gap-1.5 text-[11px] text-blue-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100% MS Word Template Engine</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAndApply}
            className="px-3 py-1 rounded bg-[#185ABD] hover:bg-[#154E9E] text-primary font-semibold text-xs flex items-center gap-1.5 shadow transition-all border border-blue-400/40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Use Template</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-primary/10 text-slate-300 hover:text-primary"
            title="Close Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. MS WORD RIBBON TABS & TOOLBAR ─────────────────────────────── */}
      <div className="bg-[#2B2B2B] border-b border-[#3D3D3D] flex flex-col shadow-md">

        {/* Ribbon Tab Header List */}
        <div className="flex items-center gap-1 px-3 pt-1 border-b border-[#3A3A3A] text-xs">
          {[
            { id: 'home', label: 'Home' },
            { id: 'layout', label: 'Layout & Margins' },
            { id: 'insert', label: 'Insert Sections' },
            { id: 'themes', label: 'Design & Themes' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRibbonTab(tab.id)}
              className={`px-3 py-1.5 rounded-t font-semibold transition-colors ${activeRibbonTab === tab.id
                  ? 'bg-[#383838] text-primary border-b-2 border-[#185ABD]'
                  : 'text-slate-300 hover:text-primary hover:bg-primary/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ribbon Content Bar based on active tab */}
        <div className="p-2 px-3 flex flex-wrap items-center gap-4 text-xs overflow-x-auto min-h-[52px]">

          {/* TAB 1: HOME (Typography, Formatting, Paragraph) */}
          {activeRibbonTab === 'home' && (
            <>
              {/* Group 1: Font Selection (Backend-Driven Categorized) */}
              <div className="flex items-center gap-1.5 pr-3 border-r border-[#4A4A4A]">
                <select
                  value={styling.fontFamily}
                  onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  className="bg-[#1C1C1C] text-primary border border-[#444] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 w-48 font-medium"
                >
                  {['sans-serif', 'serif', 'handwriting', 'monospace'].map(cat => {
                    const catFonts = fontList.filter(f => (f.category || '').toLowerCase() === cat);
                    if (catFonts.length === 0) return null;
                    const catLabel = cat === 'sans-serif' ? 'Sans-Serif (ATS Preferred)'
                      : cat === 'serif' ? 'Serif (Executive)'
                        : cat === 'handwriting' ? 'Handwriting & Script'
                          : 'Monospace & Tech';
                    return (
                      <optgroup key={cat} label={catLabel} className="bg-[#2B2B2B] text-blue-300 font-bold">
                        {catFonts.map(f => (
                          <option key={f.id} value={f.id} className="bg-[#1C1C1C] text-primary font-normal">
                            {f.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>

                <select
                  value={styling.fontSizePt}
                  onChange={(e) => updateStyle('fontSizePt', parseFloat(e.target.value))}
                  className="bg-[#1C1C1C] text-primary border border-[#444] rounded px-1.5 py-1 text-xs focus:outline-none focus:border-blue-400 w-16"
                  title="Body Font Size"
                >
                  {[9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14].map(sz => (
                    <option key={sz} value={sz}>{sz} pt</option>
                  ))}
                </select>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => updateStyle('fontSizePt', Math.min(14, styling.fontSizePt + 0.5))}
                    className="p-1 hover:bg-primary/10 rounded font-bold text-xs text-slate-300 hover:text-primary"
                    title="Grow Font Size"
                  >
                    A^
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStyle('fontSizePt', Math.max(8.5, styling.fontSizePt - 0.5))}
                    className="p-1 hover:bg-primary/10 rounded font-bold text-[10px] text-slate-300 hover:text-primary"
                    title="Shrink Font Size"
                  >
                    Av
                  </button>
                </div>
              </div>

              {/* Group 2: Font Formatting */}
              <div className="flex items-center gap-1 pr-3 border-r border-[#4A4A4A]">
                <button
                  type="button"
                  onClick={() => updateStyle('isBoldHeadings', !styling.isBoldHeadings)}
                  className={`p-1.5 rounded transition-all ${styling.isBoldHeadings ? 'bg-[#185ABD] text-primary' : 'hover:bg-primary/10 text-slate-300'
                    }`}
                  title="Bold Section Headings"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('isUppercaseHeadings', !styling.isUppercaseHeadings)}
                  className={`px-1.5 py-1 rounded text-[11px] font-bold transition-all ${styling.isUppercaseHeadings ? 'bg-[#185ABD] text-primary' : 'hover:bg-primary/10 text-slate-300'
                    }`}
                  title="UPPERCASE / Title Case Headings"
                >
                  AA
                </button>
              </div>

              {/* Group 3: Alignment & Paragraph */}
              <div className="flex items-center gap-1 pr-3 border-r border-[#4A4A4A]">
                <button
                  type="button"
                  onClick={() => updateStyle('headerLayout', 'left')}
                  className={`p-1.5 rounded transition-all ${styling.headerLayout === 'left' ? 'bg-[#185ABD] text-primary' : 'hover:bg-primary/10 text-slate-300'
                    }`}
                  title="Align Header Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('headerLayout', 'center')}
                  className={`p-1.5 rounded transition-all ${styling.headerLayout === 'center' ? 'bg-[#185ABD] text-primary' : 'hover:bg-primary/10 text-slate-300'
                    }`}
                  title="Align Header Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('headerLayout', 'split')}
                  className={`p-1.5 rounded transition-all ${styling.headerLayout === 'split' ? 'bg-[#185ABD] text-primary' : 'hover:bg-primary/10 text-slate-300'
                    }`}
                  title="Split Modern Header"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Group 4: Line Spacing & Bullets */}
              <div className="flex items-center gap-2 pr-3 border-r border-[#4A4A4A]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">Bullets:</span>
                  <select
                    value={styling.bulletStyle}
                    onChange={(e) => updateStyle('bulletStyle', e.target.value)}
                    className="bg-[#1C1C1C] text-primary border border-[#444] rounded px-1.5 py-1 text-xs focus:outline-none"
                  >
                    <option value="disc">Disc (•)</option>
                    <option value="square">Square (▪)</option>
                    <option value="dash">Dash (–)</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[11px]">Spacing:</span>
                  <select
                    value={styling.lineHeight}
                    onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value))}
                    className="bg-[#1C1C1C] text-primary border border-[#444] rounded px-1.5 py-1 text-xs focus:outline-none"
                  >
                    <option value={1.2}>1.2 (Tight)</option>
                    <option value={1.35}>1.35 (Compact)</option>
                    <option value={1.45}>1.45 (Standard)</option>
                    <option value={1.6}>1.6 (Spacious)</option>
                  </select>
                </div>
              </div>

              {/* Group 5: Heading Style Preset Gallery */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Heading Style:</span>
                {HEADING_STYLES.map(hs => (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => updateStyle('headingStyle', hs.id)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${styling.headingStyle === hs.id
                        ? 'bg-[#185ABD] text-primary shadow-sm'
                        : 'bg-[#1C1C1C] text-slate-300 hover:bg-primary/10'
                      }`}
                    title={hs.desc}
                  >
                    {hs.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* TAB 2: LAYOUT & MARGINS */}
          {activeRibbonTab === 'layout' && (
            <>
              {/* Margins */}
              <div className="flex items-center gap-2 pr-3 border-r border-[#4A4A4A]">
                <span className="text-slate-300 font-semibold">Page Margins:</span>
                <button
                  type="button"
                  onClick={() => updateStyle('pageMargins', 20)}
                  className={`px-2.5 py-1 rounded text-xs ${styling.pageMargins === 20 ? 'bg-[#185ABD] text-primary' : 'bg-[#1C1C1C] text-slate-300'
                    }`}
                >
                  Narrow (0.5")
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('pageMargins', 32)}
                  className={`px-2.5 py-1 rounded text-xs ${styling.pageMargins === 32 ? 'bg-[#185ABD] text-primary' : 'bg-[#1C1C1C] text-slate-300'
                    }`}
                >
                  Normal (0.85")
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('pageMargins', 44)}
                  className={`px-2.5 py-1 rounded text-xs ${styling.pageMargins === 44 ? 'bg-[#185ABD] text-primary' : 'bg-[#1C1C1C] text-slate-300'
                    }`}
                >
                  Wide (1.15")
                </button>
              </div>

              {/* Columns */}
              <div className="flex items-center gap-2 pr-3 border-r border-[#4A4A4A]">
                <span className="text-slate-300 font-semibold">Columns:</span>
                <button
                  type="button"
                  onClick={() => updateStyle('columnLayout', '1-col')}
                  className={`px-2.5 py-1 rounded text-xs ${styling.columnLayout === '1-col' ? 'bg-[#185ABD] text-primary' : 'bg-[#1C1C1C] text-slate-300'
                    }`}
                >
                  Single Column (High ATS)
                </button>
                <button
                  type="button"
                  onClick={() => updateStyle('columnLayout', '2-col-left')}
                  className={`px-2.5 py-1 rounded text-xs ${styling.columnLayout === '2-col-left' ? 'bg-[#185ABD] text-primary' : 'bg-[#1C1C1C] text-slate-300'
                    }`}
                >
                  2-Column (Sidebar Left)
                </button>
              </div>

              {/* Section Spacing */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Section Gap:</span>
                <input
                  type="range"
                  min="10"
                  max="28"
                  value={styling.sectionGap}
                  onChange={(e) => updateStyle('sectionGap', parseInt(e.target.value))}
                  className="w-24 accent-[#185ABD] cursor-pointer"
                />
                <span className="text-slate-300 font-mono text-[11px]">{styling.sectionGap}px</span>
              </div>
            </>
          )}

          {/* TAB 3: INSERT SECTIONS */}
          {activeRibbonTab === 'insert' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold pr-2">Insert Section Block:</span>
              <button
                type="button"
                onClick={() => handleAddSection('experience')}
                className="px-2.5 py-1 rounded bg-[#185ABD] hover:bg-blue-600 text-primary font-medium flex items-center gap-1 shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5" /> + Experience Block
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('education')}
                className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-primary/10 text-primary font-medium flex items-center gap-1 border border-primary/10"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> + Education
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('skills')}
                className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-primary/10 text-primary font-medium flex items-center gap-1 border border-primary/10"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" /> + Skills Grid
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('projects')}
                className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-primary/10 text-primary font-medium flex items-center gap-1 border border-primary/10"
              >
                <Code2 className="w-3.5 h-3.5 text-purple-400" /> + Project Card
              </button>
              <button
                type="button"
                onClick={() => handleAddSection('custom')}
                className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-primary/10 text-primary font-medium flex items-center gap-1 border border-primary/10"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" /> + Custom Paragraph
              </button>
            </div>
          )}

          {/* TAB 4: DESIGN & THEMES */}
          {activeRibbonTab === 'themes' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 pr-3 border-r border-[#4A4A4A]">
                <span className="text-slate-300 font-semibold">Theme Color:</span>
                {THEME_PALETTES.map((tp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateStyle('accentColor', tp.hex)}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 shadow-sm ${styling.accentColor.toLowerCase() === tp.hex.toLowerCase()
                        ? 'border-primary scale-110 ring-2 ring-blue-400'
                        : 'border-primary/20'
                      }`}
                    style={{ backgroundColor: tp.hex }}
                    title={tp.name}
                  />
                ))}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Custom Color:</span>
                <label
                  className="w-7 h-7 rounded border border-primary/30 cursor-pointer flex items-center justify-center overflow-hidden shadow"
                  style={{ backgroundColor: styling.accentColor }}
                >
                  <input
                    type="color"
                    value={styling.accentColor}
                    onChange={(e) => updateStyle('accentColor', e.target.value)}
                    className="opacity-0 absolute w-full h-full cursor-pointer"
                  />
                </label>
                <span className="font-mono text-xs text-slate-300 uppercase">{styling.accentColor}</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── 3. WORKSPACE: RULER + A4 MS WORD DOCUMENT CANVAS ─────────────── */}
      <div className="flex-1 bg-[#242424] overflow-y-auto overflow-x-auto flex flex-col items-center py-6 px-4 custom-scrollbar relative">

        {/* Authentic MS Word Horizontal Ruler */}
        <div className="w-[794px] h-5 bg-[#333333] border-b border-[#444] rounded-t flex items-center justify-between px-4 text-[9px] font-mono text-slate-400 shadow-sm select-none shrink-0 mb-1">
          <div className="flex items-center gap-6">
            <span>| 1"</span>
            <span>| 2"</span>
            <span>| 3"</span>
            <span>| 4"</span>
            <span>| 5"</span>
            <span>| 6"</span>
            <span>| 7"</span>
            <span>| 8"</span>
          </div>
          <span className="text-[10px] text-blue-400 font-sans">A4 Page Width: 210mm (794px)</span>
        </div>

        {/* ── A4 primary PAPER DOCUMENT (100% MS Word Canvas) ── */}
        <div
          ref={documentPaperRef}
          style={{
            width: '794px',
            minHeight: '1123px',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.1s ease-out',
            fontFamily: activeFontObj.family,
            fontSize: `${styling.fontSizePt}pt`,
            lineHeight: styling.lineHeight,
            padding: `${styling.pageMargins}px`,
            color: '#111827',
            marginBottom: `${(zoomLevel / 100 - 1) * 1123}px`
          }}
          className="bg-primary shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm shrink-0 select-text relative"
        >

          {/* ── HEADER BLOCK ── */}
          <div className={`mb-5 ${styling.headerLayout === 'center' ? 'text-center' : ''
            }`}>
            <h1
              contentEditable
              suppressContentEditableWarning
              style={{
                color: styling.accentColor,
                fontSize: `${styling.titleSizePt || 22}pt`,
                letterSpacing: '-0.02em',
                fontWeight: 800
              }}
              className="leading-tight outline-none focus:bg-blue-50/50 rounded px-1"
            >
              {resumeContent.personalInfo.fullName}
            </h1>

            <div
              contentEditable
              suppressContentEditableWarning
              style={{ fontSize: `${styling.fontSizePt + 1.5}pt` }}
              className="text-slate-700 font-semibold tracking-wide mt-0.5 outline-none focus:bg-blue-50/50 rounded px-1"
            >
              {resumeContent.personalInfo.title}
            </div>

            {/* Contact Row */}
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-slate-600 font-medium ${styling.headerLayout === 'center' ? 'justify-center' : ''
              }`}>
              <span>{resumeContent.personalInfo.email}</span>
              <span>•</span>
              <span>{resumeContent.personalInfo.phone}</span>
              <span>•</span>
              <span>{resumeContent.personalInfo.location}</span>
              <span>•</span>
              <span className="text-blue-700 font-medium underline">{resumeContent.personalInfo.linkedin}</span>
            </div>

            {/* Optional Header Bottom Divider */}
            {styling.headingStyle === 'underline' && (
              <div
                className="h-[2px] w-full mt-3 mb-2"
                style={{ backgroundColor: styling.accentColor }}
              />
            )}
          </div>

          {/* ── 2-COLUMN OR 1-COLUMN BODY LAYOUT ── */}
          <div className={`grid ${styling.columnLayout === '2-col-left'
              ? 'grid-cols-12 gap-5'
              : 'grid-cols-1'
            }`}>

            {/* Main Content Sections */}
            <div className={styling.columnLayout === '2-col-left' ? 'col-span-12 space-y-4' : 'space-y-4'}>
              {resumeContent.sections.map((section, secIdx) => {
                const isHovered = activeSectionId === section.id;
                return (
                  <div
                    key={section.id}
                    onMouseEnter={() => setActiveSectionId(section.id)}
                    onMouseLeave={() => setActiveSectionId(null)}
                    style={{ marginBottom: `${styling.sectionGap}px` }}
                    className="relative group rounded p-1 transition-all hover:bg-blue-50/20"
                  >
                    {/* Floating Section Reorder / Delete Tool Handles */}
                    {isHovered && (
                      <div className="absolute -top-3 right-2 bg-[#185ABD] text-primary px-2 py-0.5 rounded shadow flex items-center gap-1.5 text-[10px] z-20 font-sans">
                        <span className="font-bold">{section.title}</span>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(secIdx, 'up')}
                          disabled={secIdx === 0}
                          className="hover:text-amber-300 disabled:opacity-30"
                          title="Move Section Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(secIdx, 'down')}
                          disabled={secIdx === resumeContent.sections.length - 1}
                          className="hover:text-amber-300 disabled:opacity-30"
                          title="Move Section Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(secIdx)}
                          className="hover:text-red-300"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Section Header with dynamic Word heading styling */}
                    <div className="mb-2">
                      {styling.headingStyle === 'underline' && (
                        <div className="border-b-[1.5px] pb-0.5 flex items-center justify-between" style={{ borderColor: styling.accentColor }}>
                          <h2
                            style={{
                              color: styling.accentColor,
                              fontSize: `${styling.headingSizePt}pt`,
                              fontWeight: styling.isBoldHeadings ? 700 : 500,
                              textTransform: styling.isUppercaseHeadings ? 'uppercase' : 'none',
                              letterSpacing: styling.isUppercaseHeadings ? '0.05em' : 'normal'
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                      )}

                      {styling.headingStyle === 'banner' && (
                        <div
                          className="px-2.5 py-1 rounded-sm mb-2"
                          style={{ backgroundColor: `${styling.accentColor}18`, borderLeft: `4px solid ${styling.accentColor}` }}
                        >
                          <h2
                            style={{
                              color: styling.accentColor,
                              fontSize: `${styling.headingSizePt}pt`,
                              fontWeight: 700,
                              textTransform: styling.isUppercaseHeadings ? 'uppercase' : 'none'
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                      )}

                      {styling.headingStyle === 'left-bar' && (
                        <div className="flex items-center gap-2 pl-2 border-l-4" style={{ borderColor: styling.accentColor }}>
                          <h2
                            style={{
                              color: styling.accentColor,
                              fontSize: `${styling.headingSizePt}pt`,
                              fontWeight: 700,
                              textTransform: styling.isUppercaseHeadings ? 'uppercase' : 'none'
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                      )}

                      {styling.headingStyle === 'minimal' && (
                        <h2
                          style={{
                            color: '#1E293B',
                            fontSize: `${styling.headingSizePt}pt`,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                          }}
                        >
                          {section.title}
                        </h2>
                      )}

                      {styling.headingStyle === 'boxed' && (
                        <div className="border px-2 py-0.5 rounded-sm" style={{ borderColor: styling.accentColor }}>
                          <h2
                            style={{
                              color: styling.accentColor,
                              fontSize: `${styling.headingSizePt}pt`,
                              fontWeight: 700
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                      )}
                    </div>

                    {/* Section Body Content */}
                    {section.type === 'paragraph' && (
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-slate-700 leading-relaxed outline-none focus:bg-blue-50/50 rounded p-1"
                      >
                        {section.content}
                      </p>
                    )}

                    {section.type === 'experience' && (
                      <div className="space-y-3">
                        {section.items.map((exp, eIdx) => (
                          <div key={exp.id || eIdx} style={{ marginBottom: `${styling.itemGap}px` }}>
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900">{exp.position}</span>
                              <span className="text-slate-600 font-semibold">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <div className="flex justify-between items-baseline text-slate-700 font-medium mb-1">
                              <span style={{ color: styling.accentColor }}>{exp.company}</span>
                              <span className="text-slate-500 italic">{exp.location}</span>
                            </div>
                            <ul className={`space-y-1 text-slate-700 pl-4 ${styling.bulletStyle === 'square' ? 'list-square' : styling.bulletStyle === 'disc' ? 'list-disc' : 'list-none'
                              }`}>
                              {exp.bullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">
                                  {styling.bulletStyle === 'dash' && <span className="mr-1.5 text-slate-400">–</span>}
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === 'education' && (
                      <div className="space-y-2">
                        {section.items.map((edu, eduIdx) => (
                          <div key={edu.id || eduIdx} className="flex justify-between items-baseline">
                            <div>
                              <div className="font-bold text-slate-900">{edu.institution}</div>
                              <div className="text-slate-700">{edu.degree}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-slate-600">{edu.startYear} – {edu.endYear}</div>
                              {edu.gpa && <div className="text-slate-500 text-xs">GPA: {edu.gpa}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === 'skills' && (
                      <div className="space-y-1.5 text-slate-800">
                        {section.categories.map((cat, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-1.5">
                            <span className="font-bold text-slate-900 shrink-0">{cat.name}:</span>
                            <span className="text-slate-700">{cat.list}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.type === 'projects' && (
                      <div className="space-y-2">
                        {section.items.map((proj, pIdx) => (
                          <div key={proj.id || pIdx}>
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-900">{proj.name}</span>
                              <span className="text-slate-500 italic">{proj.tech}</span>
                            </div>
                            <p className="text-slate-700 mt-0.5">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* ── 4. MS WORD STATUS BAR (Bottom) ───────────────────────────────── */}
      <div className="bg-[#185ABD] text-primary px-4 py-1 text-xs flex items-center justify-between shadow-inner select-none shrink-0 font-medium">
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
          <span>482 words</span>
          <span>English (United States)</span>
          <span className="hidden sm:inline bg-primary/20 px-2 py-0.2 rounded font-mono text-[11px]">
            ATS Readiness: 99%
          </span>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
            className="hover:bg-primary/20 px-1 rounded font-bold"
          >
            −
          </button>
          <input
            type="range"
            min="60"
            max="140"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="w-24 accent-primary cursor-pointer"
          />
          <span className="w-10 font-mono text-right">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
            className="hover:bg-primary/20 px-1 rounded font-bold"
          >
            +
          </button>
        </div>
      </div>

    </div>
  );
}
