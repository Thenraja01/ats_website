import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Eye, 
  Save, 
  Trash2, 
  Plus, 
  X, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Award, 
  Languages as LanguagesIcon, 
  Palette, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  FileCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Share2,
  Upload,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sliders,
  Type,
  AlignLeft,
  AlignCenter,
  EyeOff,
  MoveUp,
  MoveDown,
  Check,
  LayoutTemplate,
  Maximize,
  Minimize2,
  Columns,
  Square,
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { 
  ModernTemplate, 
  MinimalTemplate, 
  ExecutiveTemplate, 
  CreativeTemplate,
  TechSingleColumnTemplate
} from '@/components/builder/ResumeTemplates';
import {
  getResumeData,
  saveResumeData,
  getMasterCareerProfile,
  convertMasterToResume,
  convertResumeToMaster,
  SYNC_EVENT_NAME
} from '../services/careerProfileSync';

const COLOR_PRESETS = [
  { name: 'Electric Blue', hex: '#4F8CFF' },
  { name: 'Cyber Cyan', hex: '#06B6D4' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Royal Indigo', hex: '#6366F1' },
  { name: 'Amber Sunset', hex: '#F59E0B' },
  { name: 'Rose Red', hex: '#F43F5E' },
  { name: 'Purple Violet', hex: '#8B5CF6' },
  { name: 'Deep Teal', hex: '#0D9488' },
  { name: 'Coral Orange', hex: '#F97316' },
  { name: 'Dark Slate', hex: '#1E293B' },
  { name: 'Crimson Wine', hex: '#991B1B' },
  { name: 'Forest Moss', hex: '#166534' },
];

const TEMPLATES = [
  { id: 'modern', name: 'Modern Pro', desc: 'Clean 2-column layout with accent bar & skill chips' },
  { id: 'minimal', name: 'Minimal ATS', desc: 'High-parsing single-column format optimized for ATS engines' },
  { id: 'executive', name: 'Executive', desc: 'Bold executive header for leadership and senior roles' },
  { id: 'creative', name: 'Creative Tech', desc: 'Modern dark sidebar layout for engineers and designers' },
  { id: 'tech', name: 'Tech Single-Col', desc: 'Silicon Valley & Stanford CS compact technical format' },
];

const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter (Modern Sans)', sample: 'Clean & highly readable' },
  { id: 'merriweather', name: 'Merriweather (Serif)', sample: 'Traditional & authoritative' },
  { id: 'outfit', name: 'Outfit (Modern Tech)', sample: 'Contemporary & bold' },
  { id: 'jetbrains', name: 'JetBrains Mono (Code)', sample: 'Engineering-focused' },
  { id: 'poppins', name: 'Poppins (Geometric)', sample: 'Friendly & modern' },
  { id: 'roboto', name: 'Roboto (Standard)', sample: 'Balanced & versatile' },
  { id: 'playfair', name: 'Playfair Display (Serif)', sample: 'Editorial & premium' },
  { id: 'montserrat', name: 'Montserrat (Clean)', sample: 'High impact styling' },
];

const BULLET_STYLES = [
  { id: 'disc', label: 'Disc ( • )', char: '•' },
  { id: 'dash', label: 'Dash ( — )', char: '—' },
  { id: 'arrow', label: 'Arrow ( › )', char: '›' },
  { id: 'check', label: 'Check ( ✓ )', char: '✓' },
  { id: 'square', label: 'Square ( ▪ )', char: '▪' },
  { id: 'diamond', label: 'Diamond ( ◆ )', char: '◆' },
  { id: 'star', label: 'Star ( ★ )', char: '★' },
];

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState('design');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [accentColor, setAccentColor] = useState('#4F8CFF');
  const [fontFamily, setFontFamily] = useState('inter');
  
  // Continuous Dynamic Customization Values (Sliders & Inputs)
  const [fontSizeNum, setFontSizeNum] = useState(10.5); // 8.5 to 15 pt
  const [lineHeight, setLineHeight] = useState(1.45); // 1.1 to 2.2
  const [pagePadding, setPagePadding] = useState(32); // 12 to 48 px
  const [sectionGap, setSectionGap] = useState(16); // 6 to 36 px
  const [itemGap, setItemGap] = useState(8); // 2 to 20 px
  const [borderRadius, setBorderRadius] = useState(6); // 0 to 16 px
  const [bulletStyle, setBulletStyle] = useState('disc');
  const [headerLayout, setHeaderLayout] = useState('left'); // left | center
  const [showAvatar, setShowAvatar] = useState(true);
  const [hiddenSections, setHiddenSections] = useState([]);

  // PDF Viewer Sizing & View Modes
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState('split'); // 'split' (50/50) | 'wide-preview' (35/65) | 'preview-only'
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [resumeData, setResumeData] = useState(() => getResumeData());

  const previewRef = useRef(null);
  const viewerContainerRef = useRef(null);

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      saveResumeData(resumeData, false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Failed to auto-save resume', e);
    }
  }, [resumeData]);

  // Listen for global sync events from Master Career Profile
  useEffect(() => {
    const handleSyncEvent = (e) => {
      if (e.detail?.resumeData && e.detail.source === 'master') {
        setResumeData(e.detail.resumeData);
        toast.info('🔄 Resume Builder updated from Master Career Profile');
      }
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSyncEvent);
    return () => window.removeEventListener(SYNC_EVENT_NAME, handleSyncEvent);
  }, []);

  // Fit to container width helper
  const handleFitWidth = () => {
    if (viewerContainerRef.current) {
      const containerWidth = viewerContainerRef.current.clientWidth - 48;
      const targetScale = Math.min(130, Math.max(40, Math.round((containerWidth / 794) * 100)));
      setZoomLevel(targetScale);
      toast.info(`Adjusted zoom to ${targetScale}% (Fit Width)`);
    }
  };

  const handleFitPage = () => {
    if (viewerContainerRef.current) {
      const containerHeight = viewerContainerRef.current.clientHeight - 60;
      const targetScale = Math.min(100, Math.max(40, Math.round((containerHeight / 1123) * 100)));
      setZoomLevel(targetScale);
      toast.info(`Adjusted zoom to ${targetScale}% (Fit Page)`);
    }
  };

  const handleUpdatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  // Custom Fields on Personal Info
  const handleAddCustomField = () => {
    const newField = { id: `cf_${Date.now()}`, label: 'Portfolio', value: '' };
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        customFields: [...(prev.personalInfo?.customFields || []), newField]
      }
    }));
  };

  const handleUpdateCustomField = (index, key, val) => {
    setResumeData(prev => {
      const updated = [...(prev.personalInfo?.customFields || [])];
      updated[index] = { ...updated[index], [key]: val };
      return {
        ...prev,
        personalInfo: { ...prev.personalInfo, customFields: updated }
      };
    });
  };

  const handleRemoveCustomField = (index) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        customFields: (prev.personalInfo?.customFields || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Toggle Section Visibility
  const toggleSectionVisibility = (sectionId) => {
    setHiddenSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Experience handlers
  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          bullets: ['']
        }
      ]
    }));
  };

  const handleUpdateExperience = (index, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddExpBullet = (expIndex) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      updated[expIndex].bullets = [...(updated[expIndex].bullets || []), ''];
      return { ...prev, experience: updated };
    });
  };

  const handleUpdateExpBullet = (expIndex, bulletIndex, value) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      const newBullets = [...updated[expIndex].bullets];
      newBullets[bulletIndex] = value;
      updated[expIndex].bullets = newBullets;
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExpBullet = (expIndex, bulletIndex) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      updated[expIndex].bullets = updated[expIndex].bullets.filter((_, bIdx) => bIdx !== bulletIndex);
      return { ...prev, experience: updated };
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', startYear: '', endYear: '', gpa: '' }
      ]
    }));
  };

  const handleUpdateEducation = (index, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleRemoveEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== index)
    }));
  };

  // Projects handlers
  const handleAddProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', technologies: '', period: '', link: '', description: '' }
      ]
    }));
  };

  const handleUpdateProject = (index, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const handleRemoveProject = (index) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  // Skills handlers
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillInput.trim().replace(',', '');
      if (trimmed && !resumeData.skills.includes(trimmed)) {
        setResumeData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Certifications handlers
  const handleAddCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', year: '' }
      ]
    }));
  };

  const handleUpdateCertification = (index, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const handleRemoveCertification = (index) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index)
    }));
  };

  // Custom Sections Handlers
  const handleAddCustomSection = () => {
    const newSec = {
      id: `custom_${Date.now()}`,
      title: 'Publications & Research',
      content: '',
      items: ['']
    };
    setResumeData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
  };

  const handleUpdateCustomSection = (index, field, value) => {
    setResumeData(prev => {
      const updated = [...(prev.customSections || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customSections: updated };
    });
  };

  const handleRemoveCustomSection = (index) => {
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleAddCustomItem = (secIndex) => {
    setResumeData(prev => {
      const updated = [...(prev.customSections || [])];
      updated[secIndex].items = [...(updated[secIndex].items || []), ''];
      return { ...prev, customSections: updated };
    });
  };

  const handleUpdateCustomItem = (secIndex, itemIndex, value) => {
    setResumeData(prev => {
      const updated = [...(prev.customSections || [])];
      const items = [...(updated[secIndex].items || [])];
      items[itemIndex] = value;
      updated[secIndex].items = items;
      return { ...prev, customSections: updated };
    });
  };

  const handleRemoveCustomItem = (secIndex, itemIndex) => {
    setResumeData(prev => {
      const updated = [...(prev.customSections || [])];
      updated[secIndex].items = (updated[secIndex].items || []).filter((_, i) => i !== itemIndex);
      return { ...prev, customSections: updated };
    });
  };

  // PDF Export
  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast.info('Generating high-resolution PDF...');

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_CV.pdf`;
      pdf.save(fileName);
      toast.success('Resume PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export error', err);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Plain Text Export
  const handleExportText = () => {
    const text = `
# ${resumeData.personalInfo.fullName}
${resumeData.personalInfo.title}
${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
${resumeData.personalInfo.linkedin} | ${resumeData.personalInfo.github}

## Professional Summary
${resumeData.summary}

## Experience
${resumeData.experience.map(e => `
### ${e.position} - ${e.company} (${e.startDate} - ${e.current ? 'Present' : e.endDate})
${e.description}
${e.bullets ? e.bullets.map(b => `- ${b}`).join('\n') : ''}
`).join('\n')}

## Education
${resumeData.education.map(edu => `
### ${edu.degree} - ${edu.institution} (${edu.startYear} - ${edu.endYear}) GPA: ${edu.gpa}
`).join('\n')}

## Key Projects
${resumeData.projects.map(p => `
### ${p.name} [${p.technologies}]
${p.description}
`).join('\n')}

## Skills
${resumeData.skills.join(', ')}

## Certifications
${resumeData.certifications.map(c => `- ${c.name} (${c.issuer}, ${c.year})`).join('\n')}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Resume text export downloaded');
  };

  // Master Career Profile Sync Handlers
  const handleSaveToMasterProfile = () => {
    saveResumeData(resumeData, true);
    toast.success('✅ Successfully saved to Master Career Profile! This is now your single source of truth.');
  };

  const handlePullFromMasterProfile = () => {
    const master = getMasterCareerProfile();
    const converted = convertMasterToResume(master);
    setResumeData(converted);
    toast.success('🔄 Synced latest data from Master Career Profile!');
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the resume data?')) {
      setResumeData({
        personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', avatar: '', customFields: [] },
        summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        achievements: [],
        languages: [],
        customSections: []
      });
      toast.info('Resume cleared');
    }
  };

  const templateOptions = {
    fontFamily,
    fontSizeNum,
    lineHeight,
    pagePadding,
    sectionGap,
    itemGap,
    borderRadius,
    bulletStyle,
    headerLayout,
    showAvatar,
    hiddenSections
  };

  const renderActiveTemplate = () => {
    switch (selectedTemplate) {
      case 'minimal':
        return <MinimalTemplate data={resumeData} color={accentColor} options={templateOptions} />;
      case 'executive':
        return <ExecutiveTemplate data={resumeData} color={accentColor} options={templateOptions} />;
      case 'creative':
        return <CreativeTemplate data={resumeData} color={accentColor} options={templateOptions} />;
      case 'tech':
        return <TechSingleColumnTemplate data={resumeData} color={accentColor} options={templateOptions} />;
      case 'modern':
      default:
        return <ModernTemplate data={resumeData} color={accentColor} options={templateOptions} />;
    }
  };

  const navSections = [
    { id: 'design', label: 'Design & Style', icon: Palette, badge: 'Dynamic' },
    { id: 'personal', label: 'Personal Info', icon: User, count: resumeData.personalInfo?.customFields?.length ? `+${resumeData.personalInfo.customFields.length}` : undefined },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: resumeData.experience.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: resumeData.education.length },
    { id: 'projects', label: 'Projects', icon: Code2, count: resumeData.projects.length },
    { id: 'skills', label: 'Skills', icon: Award, count: resumeData.skills.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: resumeData.certifications.length },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon, count: resumeData.languages.length },
    { id: 'custom', label: 'Custom Sections', icon: Layers, count: resumeData.customSections?.length || 0 },
  ];

  return (
    <div className="min-h-screen pt-4 pb-16 px-3 sm:px-6 max-w-[1700px] mx-auto">
      
      {/* Top Toolbar */}
      <div className="bg-[#0A1026]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Title & Auto-save Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">AI Resume Studio</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
                Dynamic Customizer
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Auto-saved {lastSaved ? `at ${lastSaved}` : 'locally'}
            </p>
          </div>
        </div>

        {/* Center: Quick Template Switcher & Quick Color */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTemplate === tpl.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={tpl.desc}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 border border-white/10 rounded-xl">
            {COLOR_PRESETS.slice(0, 6).map(c => (
              <button
                key={c.hex}
                onClick={() => setAccentColor(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  accentColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                title={c.name}
              />
            ))}
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0 ml-1"
              title="Custom Hex Color"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePullFromMasterProfile}
            className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-semibold text-primary transition-all flex items-center gap-1.5"
            title="Load latest data from Master Career Profile"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Profile</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToMasterProfile}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Save modifications to Master Profile"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Push to Master</span>
          </button>

          <Link
            to="/career-profile"
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Manage your full verified career record"
          >
            <User className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          <button
            type="button"
            onClick={handleExportText}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Export Plain Text"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>TXT</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white text-xs font-semibold shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Fact-Grounding Anti-Hallucination Assurance Banner */}
      <div className="mb-6 p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Master Profile Grounding:</strong> All content is synchronized with your verified career records.
            <Link to="/career-profile" className="text-primary hover:underline font-semibold ml-1.5 inline-flex items-center gap-0.5">
              Open Master Career Profile <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </span>
        </div>
        <button
          onClick={handleClear}
          className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 shrink-0 ml-3"
          title="Reset and clear all fields"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {/* Main Split Layout: Left Form & Customization Editor, Right Live Preview */}
      <div className={`grid gap-6 items-start ${
        viewMode === 'wide-preview' 
          ? 'grid-cols-1 lg:grid-cols-12' 
          : viewMode === 'preview-only'
          ? 'grid-cols-1'
          : 'grid-cols-1 lg:grid-cols-12'
      }`}>
        
        {/* Left Side: Form Section Navigation & Editor */}
        {viewMode !== 'preview-only' && (
          <div className={`${viewMode === 'wide-preview' ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-4`}>
            
            {/* Section Navigation Tabs */}
            <div className="bg-[#0A1026] border border-white/[0.08] rounded-2xl p-2 flex overflow-x-auto gap-1.5 scrollbar-none">
              {navSections.map(sec => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sec.label}</span>
                    {sec.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-accent/20 text-accent border border-accent/30">
                        {sec.badge}
                      </span>
                    )}
                    {sec.count !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {sec.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Content Card */}
            <div className="bg-[#080D1E] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              
              {/* 0. DYNAMIC VISUAL CUSTOMIZATION CENTER */}
              {activeTab === 'design' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold text-white">Continuous Dynamic Styling</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Granular sliders and controls for font sizes, line heights, margins, and layout</p>
                  </div>

                  {/* 1. Template Selection Grid */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>1. ATS Resume Template</span>
                      <span className="text-[11px] text-primary font-normal">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TEMPLATES.map(tpl => (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplate(tpl.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all text-left ${
                            selectedTemplate === tpl.id
                              ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10'
                              : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{tpl.name}</span>
                            {selectedTemplate === tpl.id && <Check className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tpl.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Color Palette & Hex Input */}
                  <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">2. Accent Color Theme</label>
                      <span className="text-xs font-mono text-slate-300">{accentColor.toUpperCase()}</span>
                    </div>
                    
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setAccentColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className={`h-7 rounded-xl transition-all flex items-center justify-center ${
                            accentColor.toLowerCase() === c.hex.toLowerCase()
                              ? 'ring-2 ring-white scale-110 shadow-md'
                              : 'opacity-80 hover:opacity-100 hover:scale-105'
                          }`}
                          title={c.name}
                        >
                          {accentColor.toLowerCase() === c.hex.toLowerCase() && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">#</span>
                        <input
                          type="text"
                          value={accentColor.replace('#', '')}
                          onChange={(e) => setAccentColor(`#${e.target.value}`)}
                          placeholder="4F8CFF"
                          className="w-full pl-6 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-primary uppercase"
                        />
                      </div>
                      <label className="p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 flex items-center gap-1.5 text-xs text-slate-300">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                        <span>Color Wheel</span>
                      </label>
                    </div>
                  </div>

                  {/* 3. Typography & Font Family Picker */}
                  <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
                    <label className="text-xs font-bold text-slate-200">3. Font Family</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FONT_OPTIONS.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFontFamily(f.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            fontFamily === f.id
                              ? 'bg-primary/15 border-primary text-white'
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{f.name.split(' ')[0]}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{f.sample}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Continuous Sliders: Font Size & Line Height */}
                  <div className="space-y-4 pt-3 border-t border-white/[0.06]">
                    {/* Font Size Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-primary" /> Base Font Size
                        </span>
                        <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {fontSizeNum} pt
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">8.5pt</span>
                        <input
                          type="range"
                          min="8.5"
                          max="14.5"
                          step="0.5"
                          value={fontSizeNum}
                          onChange={(e) => setFontSizeNum(parseFloat(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">14.5pt</span>
                      </div>
                    </div>

                    {/* Line Height Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>Line Height / Text Spacing</span>
                        <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {lineHeight.toFixed(2)}x
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">1.1x</span>
                        <input
                          type="range"
                          min="1.1"
                          max="2.1"
                          step="0.05"
                          value={lineHeight}
                          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">2.1x</span>
                      </div>
                    </div>

                    {/* Page Margin / Padding Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>Page Margin / Border Padding</span>
                        <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {pagePadding} px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">12px</span>
                        <input
                          type="range"
                          min="12"
                          max="48"
                          step="2"
                          value={pagePadding}
                          onChange={(e) => setPagePadding(parseInt(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">48px</span>
                      </div>
                    </div>

                    {/* Section Gap Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>Gap Between Sections</span>
                        <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {sectionGap} px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">6px</span>
                        <input
                          type="range"
                          min="6"
                          max="32"
                          step="2"
                          value={sectionGap}
                          onChange={(e) => setSectionGap(parseInt(e.target.value))}
                          className="flex-1 accent-primary cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">32px</span>
                      </div>
                    </div>

                    {/* Item Spacing & Border Radius */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span>Item Gap</span>
                          <span className="text-primary font-mono text-[11px]">{itemGap}px</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="18"
                          step="1"
                          value={itemGap}
                          onChange={(e) => setItemGap(parseInt(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span>Pill Radius</span>
                          <span className="text-primary font-mono text-[11px]">{borderRadius}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="2"
                          value={borderRadius}
                          onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Bullet Style & Header Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.06]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200">Bullet Symbol Style</label>
                      <div className="grid grid-cols-7 gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        {BULLET_STYLES.map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBulletStyle(b.id)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                              bulletStyle === b.id
                                ? 'bg-primary text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                            title={b.label}
                          >
                            {b.char}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200">Header Layout</label>
                      <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setHeaderLayout('left')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                            headerLayout === 'left' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" /> Left
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeaderLayout('center')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                            headerLayout === 'center' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" /> Center
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 6. Section Visibility Manager */}
                  <div className="space-y-2 pt-3 border-t border-white/[0.06]">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>Section Visibility & Display</span>
                      <span className="text-[11px] text-slate-400">Click to show / hide</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'summary', label: 'Summary' },
                        { id: 'experience', label: 'Experience' },
                        { id: 'education', label: 'Education' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'skills', label: 'Skills' },
                        { id: 'certifications', label: 'Certifications' },
                        { id: 'languages', label: 'Languages' },
                        { id: 'customSections', label: 'Custom Sections' },
                      ].map(sec => {
                        const isHidden = hiddenSections.includes(sec.id);
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => toggleSectionVisibility(sec.id)}
                            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                              !isHidden
                                ? 'bg-white/5 border-primary/30 text-white'
                                : 'bg-white/[0.01] border-white/5 text-slate-500 line-through'
                            }`}
                          >
                            <span>{sec.label}</span>
                            {!isHidden ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* 1. Personal Information & Custom Contact Fields */}
              {activeTab === 'personal' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Personal Information</h3>
                      <p className="text-xs text-slate-400">Contact details and custom profile links</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Custom Field
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-medium">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => handleUpdatePersonalInfo('fullName', e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-medium">Professional Title / Headline</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.title}
                        onChange={(e) => handleUpdatePersonalInfo('title', e.target.value)}
                        placeholder="e.g. Senior Full Stack & AI Engineer"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Email Address</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handleUpdatePersonalInfo('email', e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Phone Number</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handleUpdatePersonalInfo('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-slate-300 font-medium">Location</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handleUpdatePersonalInfo('location', e.target.value)}
                        placeholder="City, State / Country"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">LinkedIn Profile</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => handleUpdatePersonalInfo('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">GitHub / Portfolio</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.github}
                        onChange={(e) => handleUpdatePersonalInfo('github', e.target.value)}
                        placeholder="github.com/username"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Dynamic Custom Fields List */}
                  {(resumeData.personalInfo?.customFields || []).length > 0 && (
                    <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-accent" /> Additional Custom Fields
                      </label>
                      <div className="space-y-2">
                        {(resumeData.personalInfo?.customFields || []).map((cf, cIdx) => (
                          <div key={cf.id || cIdx} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <input
                              type="text"
                              value={cf.label}
                              onChange={(e) => handleUpdateCustomField(cIdx, 'label', e.target.value)}
                              placeholder="Field Name (e.g. LeetCode, Visa, Twitter)"
                              className="w-1/3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-primary"
                            />
                            <input
                              type="text"
                              value={cf.value}
                              onChange={(e) => handleUpdateCustomField(cIdx, 'value', e.target.value)}
                              placeholder="Value (e.g. leetcode.com/username, Authorized to work)"
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomField(cIdx)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title="Delete Field"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 2. Professional Summary */}
              {activeTab === 'summary' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-bold text-white">Professional Summary</h3>
                    <p className="text-xs text-slate-400">Summarize your career impact and core capabilities</p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Write a concise 3-4 sentence summary highlighting your key achievements and technical mastery..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-primary resize-y"
                    />
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>ATS Tip:</strong> Mention target job keywords directly in your summary for high score parsing.
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. Work Experience */}
              {activeTab === 'experience' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Work Experience</h3>
                      <p className="text-xs text-slate-400">Add past roles, companies, and quantified achievements</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Role
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.experience.map((exp, expIdx) => (
                      <div key={expIdx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(expIdx)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">Job Title / Position</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => handleUpdateExperience(expIdx, 'position', e.target.value)}
                              placeholder="e.g. Senior Software Engineer"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">Company Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)}
                              placeholder="e.g. Google"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => handleUpdateExperience(expIdx, 'startDate', e.target.value)}
                              placeholder="e.g. Jan 2022"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">End Date</label>
                            <input
                              type="text"
                              value={exp.current ? 'Present' : exp.endDate}
                              disabled={exp.current}
                              onChange={(e) => handleUpdateExperience(expIdx, 'endDate', e.target.value)}
                              placeholder="e.g. Dec 2023"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary disabled:opacity-40"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`current-${expIdx}`}
                            checked={exp.current}
                            onChange={(e) => handleUpdateExperience(expIdx, 'current', e.target.checked)}
                            className="rounded bg-white/5 border-white/20 text-primary focus:ring-0"
                          />
                          <label htmlFor={`current-${expIdx}`} className="text-xs text-slate-400 cursor-pointer">
                            I currently work here
                          </label>
                        </div>

                        {/* Bullet Points */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-slate-400 font-medium">Key Achievement Bullets</label>
                            <button
                              type="button"
                              onClick={() => handleAddExpBullet(expIdx)}
                              className="text-[11px] text-primary hover:text-accent font-medium flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Bullet
                            </button>
                          </div>
                          {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleUpdateExpBullet(expIdx, bIdx, e.target.value)}
                                placeholder="e.g. Increased system throughput by 35% by rewriting caching layer..."
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExpBullet(expIdx, bIdx)}
                                className="text-slate-500 hover:text-red-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4. Education */}
              {activeTab === 'education' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Education</h3>
                      <p className="text-xs text-slate-400">Degrees, colleges, and GPA</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Degree
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] text-slate-300 font-medium">Institution / University</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                              placeholder="e.g. Stanford University"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] text-slate-300 font-medium">Degree & Major</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                              placeholder="e.g. B.S. in Computer Science"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">Start Year</label>
                            <input
                              type="text"
                              value={edu.startYear}
                              onChange={(e) => handleUpdateEducation(idx, 'startYear', e.target.value)}
                              placeholder="e.g. 2018"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">End Year / Expected</label>
                            <input
                              type="text"
                              value={edu.endYear}
                              onChange={(e) => handleUpdateEducation(idx, 'endYear', e.target.value)}
                              placeholder="e.g. 2022"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 5. Projects */}
              {activeTab === 'projects' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Projects</h3>
                      <p className="text-xs text-slate-400">Technical applications, open source repos, and tools</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resumeData.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(idx)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">Project Name</label>
                            <input
                              type="text"
                              value={proj.name}
                              onChange={(e) => handleUpdateProject(idx, 'name', e.target.value)}
                              placeholder="e.g. AI Resume Parser"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-slate-300 font-medium">Tech Stack / Tools</label>
                            <input
                              type="text"
                              value={proj.technologies}
                              onChange={(e) => handleUpdateProject(idx, 'technologies', e.target.value)}
                              placeholder="e.g. React, FastAPI, OpenAI"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] text-slate-300 font-medium">Link / GitHub</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => handleUpdateProject(idx, 'link', e.target.value)}
                              placeholder="e.g. github.com/username/project"
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-[11px] text-slate-300 font-medium">Description</label>
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                              placeholder="Describe architecture decisions, and impact..."
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary resize-y"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 6. Skills */}
              {activeTab === 'skills' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-bold text-white">Skills & Keywords</h3>
                    <p className="text-xs text-slate-400">Add technical skills, libraries, frameworks, and tools</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Type a skill and press Enter (e.g. Docker, Python)..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = skillInput.trim();
                          if (trimmed && !resumeData.skills.includes(trimmed)) {
                            setResumeData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
                            setSkillInput('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {resumeData.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs flex items-center gap-1.5 group"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 group-hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 7. Certifications */}
              {activeTab === 'certifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Certifications</h3>
                      <p className="text-xs text-slate-400">Industry credentials and specialized badges</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Certificate
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resumeData.certifications.map((c, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(idx)}
                          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => handleUpdateCertification(idx, 'name', e.target.value)}
                          placeholder="Certificate Title"
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={c.issuer}
                          onChange={(e) => handleUpdateCertification(idx, 'issuer', e.target.value)}
                          placeholder="Issuing Organization"
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={c.year}
                          onChange={(e) => handleUpdateCertification(idx, 'year', e.target.value)}
                          placeholder="Year (e.g. 2023)"
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary pr-8"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 8. Languages */}
              {activeTab === 'languages' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Languages</h3>
                      <p className="text-xs text-slate-400">Language proficiencies and fluency</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeData(prev => ({ ...prev, languages: [...prev.languages, { name: '', proficiency: 'Fluent' }] }))}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Language
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resumeData.languages.map((l, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={l.name}
                          onChange={(e) => {
                            const updated = [...resumeData.languages];
                            updated[idx].name = e.target.value;
                            setResumeData(prev => ({ ...prev, languages: updated }));
                          }}
                          placeholder="Language (e.g. English, French)"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                        />
                        <select
                          value={l.proficiency}
                          onChange={(e) => {
                            const updated = [...resumeData.languages];
                            updated[idx].proficiency = e.target.value;
                            setResumeData(prev => ({ ...prev, languages: updated }));
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0c1226] border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                        >
                          <option value="Native / Bilingual">Native / Bilingual</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Professional Working">Professional Working</option>
                          <option value="Conversational">Conversational</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setResumeData(prev => ({ ...prev, languages: prev.languages.filter((_, lIdx) => lIdx !== idx) }))}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 9. Custom Sections */}
              {activeTab === 'custom' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Custom Sections</h3>
                      <p className="text-xs text-slate-400">Add arbitrary sections (e.g. Publications, Volunteering, Patents, Talks)</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSection}
                      className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(resumeData.customSections || []).map((sec, sIdx) => (
                      <div key={sec.id || sIdx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSection(sIdx)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-400"
                          title="Remove Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-2 pr-8">
                          <label className="text-[11px] text-slate-300 font-medium">Section Title</label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => handleUpdateCustomSection(sIdx, 'title', e.target.value)}
                            placeholder="e.g. Publications & Research"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-slate-400 font-medium">Bullet Items</label>
                            <button
                              type="button"
                              onClick={() => handleAddCustomItem(sIdx)}
                              className="text-[11px] text-primary hover:text-accent font-medium flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Item
                            </button>
                          </div>
                          {(sec.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={typeof item === 'string' ? item : (item.text || '')}
                                onChange={(e) => handleUpdateCustomItem(sIdx, itemIdx, e.target.value)}
                                placeholder="e.g. Published research paper on distributed systems..."
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomItem(sIdx, itemIdx)}
                                className="text-slate-500 hover:text-red-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {(!resumeData.customSections || resumeData.customSections.length === 0) && (
                      <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-white/10 rounded-2xl">
                        No custom sections added yet. Click "Add Section" to create one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        )}

        {/* Right Side: Responsive Live A4 PDF & Document Viewer */}
        <div 
          ref={viewerContainerRef}
          className={`${
            viewMode === 'wide-preview' 
              ? 'lg:col-span-8' 
              : viewMode === 'preview-only' 
              ? 'w-full max-w-5xl mx-auto' 
              : 'lg:col-span-7'
          } space-y-3 sticky top-20`}
        >
          {/* Zoom & Document Viewer Controls Header */}
          <div className="flex items-center justify-between bg-[#0A1026] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-slate-300 shadow-md flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-semibold text-white">Live A4 Document Viewer</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">• {selectedTemplate.toUpperCase()}</span>
              <span className="text-primary text-[10px] font-mono font-bold ml-1">{fontFamily.toUpperCase()}</span>
            </div>

            {/* Viewer Mode & Scale Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Auto-Fit Buttons */}
              <button
                type="button"
                onClick={handleFitWidth}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                title="Scale to fit container width"
              >
                Fit Width
              </button>
              <button
                type="button"
                onClick={handleFitPage}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                title="Scale to fit full page"
              >
                Fit Page
              </button>

              {/* Zoom Buttons & Slider */}
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(40, prev - 10))}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="40"
                  max="140"
                  step="5"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                  className="w-16 sm:w-24 accent-primary cursor-pointer h-1"
                />
                <span className="text-[11px] font-mono w-9 text-center font-bold text-white">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'split' ? 'wide-preview' : 'split')}
                  className={`p-1.5 rounded-lg text-slate-300 hover:text-white ${viewMode === 'wide-preview' ? 'bg-primary text-white' : ''}`}
                  title="Toggle Wide Preview"
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white"
                  title="Fullscreen Preview Mode"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Paper Canvas Frame - Clean A4 Scaling & Proper Shadow */}
          <div className="bg-[#050816]/70 border border-white/[0.08] rounded-3xl p-4 sm:p-6 overflow-x-auto overflow-y-auto max-h-[calc(100vh-170px)] flex justify-center custom-scrollbar">
            <div
              style={{
                width: '794px', // 210mm at 96 DPI
                minHeight: '1123px', // 297mm at 96 DPI
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.12s ease-out',
                marginBottom: `${(zoomLevel / 100 - 1) * 1123}px`
              }}
              className="shrink-0 shadow-2xl rounded-sm overflow-hidden bg-white"
            >
              <div ref={previewRef} className="w-[794px] bg-white min-h-[1123px]">
                {renderActiveTemplate()}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 max-w-5xl mx-auto w-full border-b border-white/10">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-white">Full-Screen Resume Preview</h2>
              <span className="text-xs text-slate-400">({selectedTemplate.toUpperCase()} Template)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                title="Close Fullscreen Preview"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-start pt-6 pb-12 overflow-y-auto">
            <div className="w-[794px] bg-white min-h-[1123px] shadow-2xl rounded-sm">
              {renderActiveTemplate()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
