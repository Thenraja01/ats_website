import { useState, useEffect, useRef, useMemo } from 'react';
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
  Tag,
  Wand2,
  Target,
  CheckCheck,
  BookOpen,
  Trophy,
  Smile,
  Heart,
  Copy,
  Edit3,
  SlidersHorizontal,
  Paintbrush
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
import WordTemplateStudio from '@/components/builder/WordTemplateStudio';
import {
  getResumeData,
  saveResumeData,
  getMasterCareerProfile,
  convertMasterToResume,
  convertResumeToMaster,
  SYNC_EVENT_NAME
} from '../services/careerProfileSync';
import { resumeAPI } from '../services/api';

const TEMPLATES = [
  { id: 'modern', name: 'Modern Pro', desc: 'Clean 2-column layout with accent bar', baseTemplate: 'modern', accentColor: '#4F8CFF', fontFamily: 'inter' },
  { id: 'minimal', name: 'Minimal ATS', desc: 'High-parsing single-column standard', baseTemplate: 'minimal', accentColor: '#0EA5E9', fontFamily: 'inter' },
  { id: 'executive', name: 'Executive', desc: 'Bold leadership layout for senior roles', baseTemplate: 'executive', accentColor: '#1E293B', fontFamily: 'merriweather' },
  { id: 'creative', name: 'Creative Tech', desc: 'Sleek dark sidebar for engineers', baseTemplate: 'creative', accentColor: '#8B5CF6', fontFamily: 'outfit' },
  { id: 'tech', name: 'Tech Single-Col', desc: 'Stanford & Silicon Valley compact format', baseTemplate: 'tech', accentColor: '#10B981', fontFamily: 'jetbrains' },
];

import { fetchBackendFonts, loadGoogleFont, DEFAULT_FALLBACK_FONTS } from '../utils/fontLoader';

const PRESET_COLORS = [
  { label: 'Royal Blue', hex: '#4F8CFF' },
  { label: 'Cyan Sky', hex: '#0EA5E9' },
  { label: 'Emerald Tech', hex: '#10B981' },
  { label: 'Violet Purple', hex: '#8B5CF6' },
  { label: 'Ruby Crimson', hex: '#EF4444' },
  { label: 'Amber Gold', hex: '#F59E0B' },
  { label: 'Slate Charcoal', hex: '#475569' },
  { label: 'Obsidian Black', hex: '#0F172A' },
];

export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('experience');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [accentColor, setAccentColor] = useState('#4F8CFF');
  const [fontFamily, setFontFamily] = useState('inter');
  const [fontList, setFontList] = useState(DEFAULT_FALLBACK_FONTS);

  // Fetch backend-driven font metadata
  useEffect(() => {
    fetchBackendFonts().then(fonts => {
      if (fonts && fonts.length > 0) {
        setFontList(fonts);
      }
    });
  }, []);

  // Dynamically load Google font for active resume
  useEffect(() => {
    const activeFont = fontList.find(f => f.id === fontFamily || f.family === fontFamily);
    if (activeFont) {
      loadGoogleFont(activeFont);
    }
  }, [fontFamily, fontList]);
  
  // Customization Sliders
  const [fontSizeNum, setFontSizeNum] = useState(10.5);
  const [lineHeight, setLineHeight] = useState(1.45);
  const [pagePadding, setPagePadding] = useState(32);
  const [sectionGap, setSectionGap] = useState(16);
  const [itemGap, setItemGap] = useState(8);
  const [borderRadius, setBorderRadius] = useState(6);
  const [bulletStyle, setBulletStyle] = useState('disc');
  const [headerLayout, setHeaderLayout] = useState('left');
  const [showAvatar, setShowAvatar] = useState(true);
  const [hiddenSections, setHiddenSections] = useState([]);

  // Template Manager & Custom Templates State
  const [templateTab, setTemplateTab] = useState('presets'); // 'presets' | 'custom'
  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('hiremind_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isSaveCurrentModalOpen, setIsSaveCurrentModalOpen] = useState(false);
  const [saveCurrentTemplateName, setSaveCurrentTemplateName] = useState('');
  const [saveCurrentTemplateDesc, setSaveCurrentTemplateDesc] = useState('');

  const [newTemplateForm, setNewTemplateForm] = useState({
    id: '',
    name: '',
    desc: '',
    baseTemplate: 'modern',
    accentColor: '#4F8CFF',
    fontFamily: 'inter',
    fontSizeNum: 10.5,
    lineHeight: 1.45,
    pagePadding: 32,
    sectionGap: 16,
    itemGap: 8,
    borderRadius: 6,
    bulletStyle: 'disc',
    headerLayout: 'left',
    showAvatar: true
  });

  // Section Manager Modal State
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomStyle, setNewCustomStyle] = useState('bullets'); // 'bullets' | 'paragraph'

  // Paper Zoom & Modes
  const [zoomLevel, setZoomLevel] = useState(90);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [resumeData, setResumeData] = useState(() => getResumeData());

  // Contextual AI Modal State
  const [aiModal, setAiModal] = useState({
    isOpen: false,
    type: 'bullet', // 'bullet' | 'improve-all' | 'match-jd' | 'fix-ats'
    targetExpIndex: null,
    targetBulletIndex: null,
    currentText: '',
    jdText: '',
    isLoading: false,
    suggestions: []
  });

  const previewRef = useRef(null);
  const viewerContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Template Management Handlers
  const saveCustomTemplatesToStorage = (newList) => {
    setCustomTemplates(newList);
    try {
      localStorage.setItem('hiremind_custom_templates', JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save templates to localStorage', e);
    }
  };

  const handleApplyTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    if (tpl.accentColor) setAccentColor(tpl.accentColor);
    if (tpl.fontFamily) setFontFamily(tpl.fontFamily);
    if (tpl.fontSizeNum !== undefined) setFontSizeNum(tpl.fontSizeNum);
    if (tpl.lineHeight !== undefined) setLineHeight(tpl.lineHeight);
    if (tpl.pagePadding !== undefined) setPagePadding(tpl.pagePadding);
    if (tpl.sectionGap !== undefined) setSectionGap(tpl.sectionGap);
    if (tpl.itemGap !== undefined) setItemGap(tpl.itemGap);
    if (tpl.borderRadius !== undefined) setBorderRadius(tpl.borderRadius);
    if (tpl.bulletStyle) setBulletStyle(tpl.bulletStyle);
    if (tpl.headerLayout) setHeaderLayout(tpl.headerLayout);
    if (tpl.showAvatar !== undefined) setShowAvatar(tpl.showAvatar);
    toast.success(`Applied template "${tpl.name}"`);
  };

  const handleSaveCurrentAsTemplate = () => {
    if (!saveCurrentTemplateName.trim()) {
      toast.error('Please provide a name for this template');
      return;
    }
    const currentCustom = customTemplates.find(t => t.id === selectedTemplate);
    const baseTpl = currentCustom ? currentCustom.baseTemplate : (TEMPLATES.find(t => t.id === selectedTemplate)?.id || 'modern');

    const newTpl = {
      id: `custom_${Date.now()}`,
      name: saveCurrentTemplateName.trim(),
      desc: saveCurrentTemplateDesc.trim() || `Custom style based on ${baseTpl.toUpperCase()}`,
      baseTemplate: baseTpl,
      accentColor,
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
      createdAt: new Date().toISOString()
    };

    const updated = [...customTemplates, newTpl];
    saveCustomTemplatesToStorage(updated);
    setSelectedTemplate(newTpl.id);
    setTemplateTab('custom');
    setIsSaveCurrentModalOpen(false);
    setSaveCurrentTemplateName('');
    setSaveCurrentTemplateDesc('');
    toast.success(`Saved "${newTpl.name}" to your templates!`);
  };

  const [editingTemplateData, setEditingTemplateData] = useState(null);

  const handleSaveStudioTemplate = (tplPackage) => {
    const existingIdx = customTemplates.findIndex(t => t.id === tplPackage.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...customTemplates];
      updated[existingIdx] = tplPackage;
    } else {
      updated = [...customTemplates, tplPackage];
    }
    saveCustomTemplatesToStorage(updated);
    handleApplyTemplate(tplPackage);
    setTemplateTab('custom');
    setIsCreateTemplateModalOpen(false);
    toast.success(`Template "${tplPackage.name}" saved and applied!`);
  };

  const handleDeleteCustomTemplate = (tplId, e) => {
    if (e) e.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== tplId);
    saveCustomTemplatesToStorage(updated);
    if (selectedTemplate === tplId) {
      setSelectedTemplate('modern');
    }
    toast.success('Custom template deleted');
  };

  const handleDuplicateCustomTemplate = (tpl, e) => {
    if (e) e.stopPropagation();
    const copy = {
      ...tpl,
      id: `custom_${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    saveCustomTemplatesToStorage([...customTemplates, copy]);
    toast.success(`Duplicated "${tpl.name}"`);
  };

  const handleOpenEditTemplate = (tpl, e) => {
    if (e) e.stopPropagation();
    setEditingTemplateData(tpl);
    setIsCreateTemplateModalOpen(true);
  };

  const handleOpenNewTemplateModal = () => {
    setEditingTemplateData(null);
    setIsCreateTemplateModalOpen(true);
  };

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      saveResumeData(resumeData, false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Auto-save error', e);
    }
  }, [resumeData]);

  // Sync Event Listener from Master Profile
  useEffect(() => {
    const handleSyncEvent = (e) => {
      if (e.detail?.resumeData && e.detail.source === 'master') {
        setResumeData(e.detail.resumeData);
        toast.info('Synced from Master Career Profile');
      }
    };
    window.addEventListener(SYNC_EVENT_NAME, handleSyncEvent);
    return () => window.removeEventListener(SYNC_EVENT_NAME, handleSyncEvent);
  }, []);

  // Calculate live ATS Compatibility score (0 - 100)
  const calculatedAtsScore = useMemo(() => {
    let score = 50;
    if (resumeData.personalInfo?.fullName) score += 8;
    if (resumeData.personalInfo?.email) score += 6;
    if (resumeData.personalInfo?.phone) score += 4;
    if (resumeData.summary && resumeData.summary.length > 50 && !hiddenSections.includes('summary')) score += 10;
    if (resumeData.experience?.length >= 2 && !hiddenSections.includes('experience')) score += 10;
    if (resumeData.education?.length >= 1 && !hiddenSections.includes('education')) score += 6;
    if (resumeData.skills?.length >= 5 && !hiddenSections.includes('skills')) score += 6;

    // Check for quantifiable metric bullets
    const bullets = resumeData.experience?.flatMap(e => e.bullets || []) || [];
    const metricCount = bullets.filter(b => /\d+%|\$\d+|\d+\+|\b\d+\b/.test(b)).length;
    if (metricCount >= 2) score += 8;
    if (metricCount >= 4) score += 4;

    return Math.min(score, 98);
  }, [resumeData, hiddenSections]);

  // Fit Width Helper
  const handleFitWidth = () => {
    if (viewerContainerRef.current) {
      const containerWidth = viewerContainerRef.current.clientWidth - 48;
      const targetScale = Math.min(120, Math.max(50, Math.round((containerWidth / 794) * 100)));
      setZoomLevel(targetScale);
    }
  };

  // Section Toggle & Removal Handlers
  const handleToggleHideSection = (sectionId, e) => {
    if (e) e.stopPropagation();
    setHiddenSections(prev => {
      const isAlreadyHidden = prev.includes(sectionId);
      const updated = isAlreadyHidden ? prev.filter(id => id !== sectionId) : [...prev, sectionId];
      if (!isAlreadyHidden && activeSection === sectionId) {
        setActiveSection('personal');
      }
      toast.info(isAlreadyHidden ? `Restored "${sectionId}" section` : `Removed "${sectionId}" section from resume`);
      return updated;
    });
  };

  // Custom Sections Management
  const handleAddCustomSection = (title, style = 'bullets') => {
    if (!title || !title.trim()) return;
    const newSec = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      style,
      content: '',
      items: style === 'bullets' ? [''] : []
    };
    setResumeData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
    setActiveSection(newSec.id);
    setIsAddSectionModalOpen(false);
    setNewCustomTitle('');
    toast.success(`Added "${title.trim()}" section!`);
  };

  const handleRemoveCustomSection = (secId, e) => {
    if (e) e.stopPropagation();
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).filter(s => s.id !== secId)
    }));
    if (activeSection === secId) {
      setActiveSection('personal');
    }
    toast.success('Custom section removed');
  };

  const handleUpdateCustomSection = (secId, field, value) => {
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => s.id === secId ? { ...s, [field]: value } : s)
    }));
  };

  const handleAddCustomBullet = (secId) => {
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => {
        if (s.id === secId) {
          return { ...s, items: [...(s.items || []), ''] };
        }
        return s;
      })
    }));
  };

  const handleUpdateCustomBullet = (secId, index, value) => {
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => {
        if (s.id === secId) {
          const items = [...(s.items || [])];
          items[index] = value;
          return { ...s, items };
        }
        return s;
      })
    }));
  };

  const handleRemoveCustomBullet = (secId, index) => {
    setResumeData(prev => ({
      ...prev,
      customSections: (prev.customSections || []).map(s => {
        if (s.id === secId) {
          const items = (s.items || []).filter((_, i) => i !== index);
          return { ...s, items: items.length ? items : [''] };
        }
        return s;
      })
    }));
  };

  // Section Handlers
  const handleUpdatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp_${Date.now()}`,
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
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddExpBullet = (expIndex) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      updated[expIndex] = {
        ...updated[expIndex],
        bullets: [...(updated[expIndex].bullets || []), '']
      };
      return { ...prev, experience: updated };
    });
  };

  const handleUpdateExpBullet = (expIndex, bulletIndex, value) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      const bullets = [...(updated[expIndex].bullets || [])];
      bullets[bulletIndex] = value;
      updated[expIndex] = { ...updated[expIndex], bullets };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExpBullet = (expIndex, bulletIndex) => {
    setResumeData(prev => {
      const updated = [...prev.experience];
      const bullets = (updated[expIndex].bullets || []).filter((_, i) => i !== bulletIndex);
      updated[expIndex] = { ...updated[expIndex], bullets: bullets.length ? bullets : [''] };
      return { ...prev, experience: updated };
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: `edu_${Date.now()}`, institution: '', degree: '', startYear: '', endYear: '', gpa: '' }
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
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Projects handlers
  const handleAddProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: `proj_${Date.now()}`, name: '', technologies: '', description: '' }
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
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Skills handlers
  const [skillInput, setSkillInput] = useState('');
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    setResumeData(prev => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, skillInput.trim()]))
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
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
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Languages handlers
  const handleAddLanguage = () => {
    setResumeData(prev => ({
      ...prev,
      languages: [
        ...prev.languages,
        { language: '', proficiency: 'Fluent' }
      ]
    }));
  };

  const handleUpdateLanguage = (index, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.languages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, languages: updated };
    });
  };

  const handleRemoveLanguage = (index) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  // Open Contextual AI Tool for a bullet
  const handleOpenAiBullet = (expIndex, bulletIndex) => {
    const text = resumeData.experience[expIndex]?.bullets?.[bulletIndex] || '';
    setAiModal({
      isOpen: true,
      type: 'bullet',
      targetExpIndex: expIndex,
      targetBulletIndex: bulletIndex,
      currentText: text,
      jdText: '',
      isLoading: false,
      suggestions: [
        `Architected scalable data pipeline reducing processing latency by 35% across 2M+ records.`,
        `Spearheaded backend microservices refactor, improving system throughput by 40% and cutting API response times to <150ms.`,
        `Collaborated with cross-functional teams to deliver enterprise features ahead of deadline, driving 25% increase in user retention.`
      ]
    });
  };

  const handleApplyAiSuggestion = (suggestion) => {
    if (aiModal.type === 'bullet' && aiModal.targetExpIndex !== null && aiModal.targetBulletIndex !== null) {
      handleUpdateExpBullet(aiModal.targetExpIndex, aiModal.targetBulletIndex, suggestion);
      toast.success('✨ Bullet point enhanced with quantifiable metrics!');
    } else if (aiModal.type === 'improve-all' || aiModal.type === 'fix-ats') {
      setResumeData(prev => ({
        ...prev,
        summary: suggestion
      }));
      toast.success('Summary optimized for ATS parsing!');
    }
    setAiModal(prev => ({ ...prev, isOpen: false }));
  };

  // Exports
  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast.info('Generating high-resolution vector PDF...');

    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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

      const fileName = `${(resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}_CV.pdf`;
      pdf.save(fileName);
      toast.success('PDF downloaded successfully!');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDOCX = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Generating native Microsoft Word (.docx)...');
    try {
      const res = await resumeAPI.exportDocx({
        resumeData,
        options: {
          accentColor,
          fontName: fontList.find(f => f.id === fontFamily)?.name || 'Calibri'
        }
      });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Word document (.docx) downloaded successfully!', { id: toastId });
    } catch {
      toast.error('Failed to export Word (.docx) document', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${(resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}_resume.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Resume JSON exported successfully!');
    } catch {
      toast.error('Failed to export JSON');
    }
  };

  const handleExportText = () => {
    const text = `
${resumeData.personalInfo?.fullName || 'Resume'}
${resumeData.personalInfo?.title || ''}
${resumeData.personalInfo?.email || ''} | ${resumeData.personalInfo?.phone || ''} | ${resumeData.personalInfo?.location || ''}
${resumeData.personalInfo?.linkedin || ''} | ${resumeData.personalInfo?.github || ''}

SUMMARY
${resumeData.summary || ''}

EXPERIENCE
${(resumeData.experience || []).map(e => `
${e.position || ''} — ${e.company || ''} (${e.startDate || ''} - ${e.current ? 'Present' : e.endDate || ''})
${(e.bullets || []).map(b => `• ${b}`).join('\n')}
`).join('\n')}

EDUCATION
${(resumeData.education || []).map(edu => `
${edu.degree || ''} — ${edu.institution || ''} (${edu.startYear || ''} - ${edu.endYear || ''})
`).join('\n')}

SKILLS
${(resumeData.skills || []).join(', ')}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Resume text export downloaded');
  };

  // Normalizer for imported data
  const normalizeImportedResume = (raw) => {
    if (!raw || typeof raw !== 'object') return null;

    if (raw.basics) {
      const b = raw.basics;
      return {
        personalInfo: {
          fullName: b.name || '',
          title: b.label || '',
          email: b.email || '',
          phone: b.phone || '',
          location: typeof b.location === 'object' ? `${b.location.city || ''}, ${b.location.region || ''}` : (b.location || ''),
          website: b.url || '',
          linkedin: b.profiles?.find(p => p.network?.toLowerCase().includes('linkedin'))?.url || '',
          github: b.profiles?.find(p => p.network?.toLowerCase().includes('github'))?.url || '',
          avatar: b.image || '',
          customFields: []
        },
        summary: b.summary || '',
        experience: Array.isArray(raw.work) ? raw.work.map((w, idx) => ({
          id: `exp_${Date.now()}_${idx}`,
          company: w.name || w.company || '',
          position: w.position || '',
          location: w.location || '',
          startDate: w.startDate || '',
          endDate: w.endDate || '',
          current: !w.endDate || w.endDate.toLowerCase() === 'present',
          description: w.summary || '',
          bullets: Array.isArray(w.highlights) && w.highlights.length ? w.highlights : ['']
        })) : [],
        education: Array.isArray(raw.education) ? raw.education.map((edu, idx) => ({
          id: `edu_${Date.now()}_${idx}`,
          institution: edu.institution || '',
          degree: [edu.studyType, edu.area].filter(Boolean).join(' in ') || edu.degree || '',
          startYear: edu.startDate || '',
          endYear: edu.endDate || '',
          gpa: edu.score || edu.gpa || ''
        })) : [],
        skills: Array.isArray(raw.skills) ? raw.skills.map(s => typeof s === 'string' ? s : (s.name || '')) : [],
        projects: Array.isArray(raw.projects) ? raw.projects.map((p, idx) => ({
          id: `proj_${Date.now()}_${idx}`,
          name: p.name || '',
          technologies: Array.isArray(p.keywords) ? p.keywords.join(', ') : (p.technologies || ''),
          description: p.description || ''
        })) : [],
        certifications: Array.isArray(raw.certificates) ? raw.certificates.map(c => ({
          name: c.name || '',
          issuer: c.issuer || '',
          year: c.date || ''
        })) : [],
        languages: Array.isArray(raw.languages) ? raw.languages.map(l => ({
          language: l.language || '',
          proficiency: l.fluency || 'Fluent'
        })) : [],
        achievements: [],
        customSections: []
      };
    }

    const p = raw.personalInfo || {};
    return {
      personalInfo: {
        fullName: p.fullName || p.full_name || p.name || '',
        title: p.title || p.headline || p.role || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        website: p.website || '',
        linkedin: p.linkedin || '',
        github: p.github || '',
        avatar: p.avatar || '',
        customFields: []
      },
      summary: typeof raw.summary === 'object' ? (raw.summary.primary || '') : (raw.summary || ''),
      experience: Array.isArray(raw.experience) ? raw.experience.map((exp, idx) => ({
        id: exp.id || `exp_${Date.now()}_${idx}`,
        company: exp.company || '',
        position: exp.position || exp.jobTitle || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: Boolean(exp.current),
        description: exp.description || '',
        bullets: Array.isArray(exp.bullets) && exp.bullets.length ? exp.bullets : ['']
      })) : [],
      education: Array.isArray(raw.education) ? raw.education.map((edu, idx) => ({
        id: edu.id || `edu_${Date.now()}_${idx}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        startYear: edu.startYear || '',
        endYear: edu.endYear || '',
        gpa: edu.gpa || ''
      })) : [],
      skills: Array.isArray(raw.skills) ? raw.skills.map(s => typeof s === 'string' ? s : (s.name || '')) : [],
      projects: Array.isArray(raw.projects) ? raw.projects.map((proj, idx) => ({
        id: proj.id || `proj_${Date.now()}_${idx}`,
        name: proj.name || '',
        technologies: proj.technologies || '',
        description: proj.description || ''
      })) : [],
      certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
      languages: Array.isArray(raw.languages) ? raw.languages : [],
      achievements: [],
      customSections: Array.isArray(raw.customSections) ? raw.customSections : []
    };
  };

  // File Import Handler
  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'json') {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            const normalized = normalizeImportedResume(parsed);
            if (normalized) {
              setResumeData(normalized);
              saveResumeData(normalized, false);
              toast.success(`Imported from ${file.name}!`);
            }
          } catch {
            toast.error('Invalid JSON structure.');
          }
        };
        reader.readAsText(file);
      } catch {
        toast.error('Failed to read JSON');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading(`Parsing ${file.name}... Extracting sections.`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await resumeAPI.parseStructured(formData);
      const structured = res.data?.structured;
      if (structured) {
        const normalized = normalizeImportedResume(structured);
        if (normalized) {
          setResumeData(normalized);
          saveResumeData(normalized, false);
          toast.success(`Extracted resume data from ${file.name}!`, { id: toastId });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to parse file.', { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    const customTpl = customTemplates.find(t => t.id === selectedTemplate);
    const layoutKey = customTpl ? customTpl.baseTemplate : selectedTemplate;

    switch (layoutKey) {
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

  // Build Dynamic Nav Items (Standard + Custom)
  const standardNavItems = [
    { id: 'design', label: 'Design', icon: Palette, canRemove: false },
    { id: 'personal', label: 'Personal', icon: User, canRemove: false },
    { id: 'summary', label: 'Summary', icon: Sparkles, canRemove: true },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: resumeData.experience?.length, canRemove: true },
    { id: 'education', label: 'Education', icon: GraduationCap, count: resumeData.education?.length, canRemove: true },
    { id: 'skills', label: 'Skills', icon: Award, count: resumeData.skills?.length, canRemove: true },
    { id: 'projects', label: 'Projects', icon: Code2, count: resumeData.projects?.length, canRemove: true },
    { id: 'certifications', label: 'Certifications', icon: Award, count: resumeData.certifications?.length, canRemove: true },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon, count: resumeData.languages?.length, canRemove: true },
  ].filter(item => !item.canRemove || !hiddenSections.includes(item.id));

  const customNavItems = (resumeData.customSections || []).map(sec => ({
    id: sec.id,
    label: sec.title || 'Custom Section',
    icon: Layers,
    count: sec.items?.length,
    isCustom: true
  }));

  const navItems = [...standardNavItems, ...customNavItems];

  // List of all possible default sections that could be restored if hidden
  const hiddenStandardList = [
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'projects', label: 'Projects', icon: Code2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon },
  ].filter(sec => hiddenSections.includes(sec.id));

  // Preset custom templates to add
  const PRESET_ADD_SECTIONS = [
    { title: 'Achievements & Awards', icon: Trophy, style: 'bullets' },
    { title: 'Publications & Research', icon: BookOpen, style: 'bullets' },
    { title: 'Volunteer Experience', icon: Heart, style: 'bullets' },
    { title: 'Relevant Coursework', icon: GraduationCap, style: 'bullets' },
    { title: 'Interests & Hobbies', icon: Smile, style: 'paragraph' },
  ];

  // Active custom section object if currently selected
  const activeCustomSection = (resumeData.customSections || []).find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      
      {/* ── LAYER 1: ULTRA-MINIMAL TOP BAR ─────────────────────────────── */}
      <header className="h-14 px-4 sm:px-6 border-b border-white/[0.06] bg-[#050B18]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-primary transition-colors">
              AI Resume Studio
            </h1>
          </Link>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Saved {lastSaved || 'just now'}
          </span>
        </div>

        {/* Right: ATS Score Badge, Import, Export */}
        <div className="flex items-center gap-2.5">
          
          {/* Live ATS Pill */}
          <div 
            onClick={() => setAiModal({ isOpen: true, type: 'fix-ats', suggestions: ['Add 2+ quantifiable metric bullet points', 'Include top industry technical keywords', 'Ensure contact links are complete'] })}
            className="cursor-pointer px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-all"
            title="Click to view ATS recommendations"
          >
            <span className="text-[10px] uppercase font-bold text-emerald-500">ATS</span>
            <span>{calculatedAtsScore}</span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".pdf,.docx,.doc,.json,.txt"
            className="hidden"
          />

          {/* Import Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 disabled:opacity-50"
          >
            {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-[#0A1024] border border-white/10 rounded-xl shadow-2xl p-1 z-50">
                <button
                  type="button"
                  onClick={() => { setShowExportMenu(false); handleExportPDF(); }}
                  disabled={isExporting}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Download PDF</span>
                  <span className="text-[10px] text-primary">.pdf</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowExportMenu(false); handleExportDOCX(); }}
                  disabled={isExporting}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Download Word</span>
                  <span className="text-[10px] text-blue-400">.docx</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowExportMenu(false); handleExportJSON(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Export JSON</span>
                  <span className="text-[10px] text-amber-400">.json</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowExportMenu(false); handleExportText(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">Plain Text</span>
                  <span className="text-[10px] text-slate-400">.txt</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── LAYER 2: 30/70 SPLIT WORKSPACE ─────────────────────────────── */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-3 sm:p-5 items-start">
        
        {/* ── LEFT COLUMN: VERTICAL NAVIGATION & COMPACT SECTION EDITOR (~30%) ── */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          
          {/* Vertical Section Nav & AI Tools Card */}
          <div className="bg-[#070D1F] border border-white/[0.08] rounded-2xl p-4 shadow-xl space-y-4">
            
            {/* 1. Resume Sections */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
                <span>Resume Sections</span>
                <span className="text-[10px] text-slate-500 lowercase">({navItems.length} active)</span>
              </div>
              
              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`group w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-600'}`}></span>
                        <span>{item.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {typeof item.count === 'number' && item.count > 0 && (
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>
                            {item.count}
                          </span>
                        )}

                        {/* Inline Hide/Remove Button on hover */}
                        {item.canRemove && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleHideSection(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                            title={`Remove / Hide "${item.label}" section`}
                          >
                            <EyeOff className="w-3 h-3" />
                          </button>
                        )}

                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveCustomSection(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                            title={`Delete custom "${item.label}" section`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* + Add Section Button */}
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(true)}
                  className="w-full mt-2.5 py-2 px-3 rounded-xl border border-dashed border-white/15 hover:border-primary/50 text-slate-400 hover:text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-white/[0.01] hover:bg-primary/5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] pt-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-2 px-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Power Tools</span>
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setAiModal({
                    isOpen: true,
                    type: 'improve-all',
                    suggestions: [
                      'Highlight technical architecture ownership and cross-functional leadership in professional summary.',
                      'Transform passive phrases into active accomplishment statements with quantitative outcomes.',
                      'Re-order skills prioritizing high-demand cloud and AI tooling keywords.'
                    ]
                  })}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 flex items-center gap-2 transition-all text-left"
                >
                  <span className="text-amber-400">✦</span>
                  <span>Improve Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiModal({
                    isOpen: true,
                    type: 'match-jd',
                    jdText: '',
                    suggestions: []
                  })}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 flex items-center gap-2 transition-all text-left"
                >
                  <span className="text-blue-400">✦</span>
                  <span>Match Job Description</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiModal({
                    isOpen: true,
                    type: 'fix-ats',
                    suggestions: [
                      'Ensure bullet points begin with strong action verbs (Architected, Spearheaded, Accelerated).',
                      'Include specific software frameworks and version tags.',
                      'Keep typography single or clean two-column for 99% ATS parsing rate.'
                    ]
                  })}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 flex items-center gap-2 transition-all text-left"
                >
                  <span className="text-emerald-400">✦</span>
                  <span>Fix ATS Issues</span>
                </button>
              </div>
            </div>

            {/* Master sync link */}
            <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between text-xs">
              <Link 
                to="/career-profile" 
                className="text-primary hover:underline text-[11px] font-medium flex items-center gap-1"
              >
                <span>Master Career Vault</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResumeData(convertMasterToResume(getMasterCareerProfile()));
                  toast.success('Synced from Master Career Profile!');
                }}
                className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync</span>
              </button>
            </div>

          </div>

          {/* ── CONTEXTUAL ACTIVE SECTION EDITOR CARD ── */}
          <div className="bg-[#070D1F] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            
            {/* Header of the Active Section */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-sm font-bold text-white capitalize flex items-center gap-2">
                <span>{activeCustomSection ? activeCustomSection.title : activeSection}</span>
              </h2>

              <div className="flex items-center gap-2">
                {activeSection === 'experience' && (
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                )}
                {activeSection === 'education' && (
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add School</span>
                  </button>
                )}
                {activeSection === 'projects' && (
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                )}

                {/* Hide / Remove active section button */}
                {activeSection !== 'design' && activeSection !== 'personal' && !activeCustomSection && (
                  <button
                    type="button"
                    onClick={(e) => handleToggleHideSection(activeSection, e)}
                    className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 pl-1"
                    title="Remove this section from resume"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Hide</span>
                  </button>
                )}

                {activeCustomSection && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveCustomSection(activeCustomSection.id, e)}
                    className="text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 pl-1"
                    title="Delete custom section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* 1. DESIGN & TEMPLATES SECTION */}
            {activeSection === 'design' && (
              <div className="space-y-4 text-xs">
                
                {/* Template Studio Header & Sub-Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-200 font-bold block">Resume Templates</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleOpenNewTemplateModal}
                        className="px-2 py-1 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                        title="Create a new template"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create New</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSaveCurrentModalOpen(true)}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-[11px] flex items-center gap-1 transition-all border border-white/10"
                        title="Save current resume design as a new template"
                      >
                        <Save className="w-3 h-3 text-amber-400" />
                        <span>Save Style</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab Switcher: Presets vs Custom Templates */}
                  <div className="flex bg-[#050816] p-1 rounded-xl border border-white/10 mb-3">
                    <button
                      type="button"
                      onClick={() => setTemplateTab('presets')}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                        templateTab === 'presets'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Presets (5)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateTab('custom')}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        templateTab === 'custom'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>My Templates</span>
                      {customTemplates.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          templateTab === 'custom' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {customTemplates.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* TAB 1: PRESETS */}
                  {templateTab === 'presets' && (
                    <div className="grid grid-cols-1 gap-2">
                      {TEMPLATES.map(tpl => {
                        const isSelected = selectedTemplate === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => handleApplyTemplate(tpl)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-primary/15 border-primary text-white'
                                : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="w-3 h-3 rounded-full shrink-0 border border-white/20 shadow-sm"
                                style={{ backgroundColor: tpl.accentColor || '#4F8CFF' }}
                              />
                              <div>
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>{tpl.name}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 uppercase font-mono">
                                    {tpl.baseTemplate}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">{tpl.desc}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TAB 2: MY CUSTOM TEMPLATES */}
                  {templateTab === 'custom' && (
                    <div className="space-y-2">
                      {customTemplates.length === 0 ? (
                        <div className="text-center py-6 px-4 bg-white/[0.02] border border-dashed border-white/15 rounded-xl space-y-2.5">
                          <Paintbrush className="w-7 h-7 text-slate-500 mx-auto" />
                          <p className="text-slate-400 text-xs">No custom templates yet.</p>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                            <button
                              type="button"
                              onClick={handleOpenNewTemplateModal}
                              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create Template</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsSaveCurrentModalOpen(true)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs flex items-center justify-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5 text-amber-400" />
                              <span>Save Current Style</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {customTemplates.map(tpl => {
                            const isSelected = selectedTemplate === tpl.id;
                            return (
                              <div
                                key={tpl.id}
                                onClick={() => handleApplyTemplate(tpl)}
                                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-primary/15 border-primary text-white'
                                    : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span 
                                    className="w-3 h-3 rounded-full shrink-0 border border-white/20 shadow-sm"
                                    style={{ backgroundColor: tpl.accentColor || '#4F8CFF' }}
                                  />
                                  <div className="min-w-0 flex-1 pr-2">
                                    <div className="font-bold truncate flex items-center gap-1.5">
                                      <span className="truncate">{tpl.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary uppercase font-mono shrink-0">
                                        {tpl.baseTemplate || 'modern'}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate">{tpl.desc || 'Custom template'}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {isSelected && <Check className="w-3.5 h-3.5 text-primary mr-1" />}
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenEditTemplate(tpl, e)}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-opacity"
                                    title="Edit template settings"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDuplicateCustomTemplate(tpl, e)}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 opacity-70 group-hover:opacity-100 transition-opacity"
                                    title="Duplicate template"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteCustomTemplate(tpl.id, e)}
                                    className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-70 group-hover:opacity-100 transition-opacity"
                                    title="Delete template"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Theme Accent Color */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold block">Theme Accent Color</label>
                    <span className="text-[11px] font-mono text-slate-400 font-medium">{accentColor.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    {/* Color Swatch Box / Tile */}
                    <label 
                      className="relative w-10 h-10 rounded-xl cursor-pointer shadow-md border border-white/20 transition-transform hover:scale-105 shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: accentColor }}
                      title="Click to pick color"
                    >
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>

                    {/* Hex Code Input Box */}
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">#</span>
                      <input
                        type="text"
                        value={accentColor.replace('#', '')}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                          setAccentColor(`#${val}`);
                        }}
                        placeholder="4F8CFF"
                        maxLength={6}
                        className="w-full pl-6 pr-3 py-2 bg-[#050816] border border-white/10 rounded-xl text-white text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Quick Color Presets Palette */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {PRESET_COLORS.map((pc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAccentColor(pc.hex)}
                        className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                          accentColor.toLowerCase() === pc.hex.toLowerCase()
                            ? 'border-white scale-110 shadow-md ring-2 ring-primary/40'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: pc.hex }}
                        title={pc.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography Font (Backend-Driven Categorized) */}
                <div className="pt-3 border-t border-white/[0.06]">
                  <label className="text-slate-300 font-bold block mb-1.5">Typography Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-2 text-slate-200 text-xs focus:outline-none focus:border-primary"
                  >
                    {['sans-serif', 'serif', 'handwriting', 'monospace'].map(cat => {
                      const catFonts = fontList.filter(f => (f.category || '').toLowerCase() === cat);
                      if (catFonts.length === 0) return null;
                      const catLabel = cat === 'sans-serif' ? 'Sans-Serif (ATS Preferred)' 
                        : cat === 'serif' ? 'Serif (Executive)' 
                        : cat === 'handwriting' ? 'Handwriting & Script' 
                        : 'Monospace & Tech';
                      return (
                        <optgroup key={cat} label={catLabel} className="bg-[#0B1228] text-primary font-bold">
                          {catFonts.map(f => (
                            <option key={f.id} value={f.id} className="bg-[#050816] text-slate-200 font-normal">
                              {f.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* Fine-Tuning Spacing & Geometry */}
                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Layout & Spacing Metrics</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Font Size</span>
                        <span className="font-mono text-slate-200">{fontSizeNum}pt</span>
                      </div>
                      <input
                        type="range"
                        min="8.5"
                        max="13"
                        step="0.5"
                        value={fontSizeNum}
                        onChange={(e) => setFontSizeNum(parseFloat(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-[#050816] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Line Height</span>
                        <span className="font-mono text-slate-200">{lineHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="1.15"
                        max="1.8"
                        step="0.05"
                        value={lineHeight}
                        onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-[#050816] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Page Margin</span>
                        <span className="font-mono text-slate-200">{pagePadding}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        step="2"
                        value={pagePadding}
                        onChange={(e) => setPagePadding(parseInt(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-[#050816] rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Section Gap</span>
                        <span className="font-mono text-slate-200">{sectionGap}px</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="28"
                        step="2"
                        value={sectionGap}
                        onChange={(e) => setSectionGap(parseInt(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-[#050816] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-slate-400 block mb-1">Header Layout</label>
                      <select
                        value={headerLayout}
                        onChange={(e) => setHeaderLayout(e.target.value)}
                        className="w-full bg-[#050816] border border-white/10 rounded-lg p-1.5 text-white text-xs focus:outline-none focus:border-primary"
                      >
                        <option value="left">Left Aligned</option>
                        <option value="center">Centered</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Bullet Style</label>
                      <select
                        value={bulletStyle}
                        onChange={(e) => setBulletStyle(e.target.value)}
                        className="w-full bg-[#050816] border border-white/10 rounded-lg p-1.5 text-white text-xs focus:outline-none focus:border-primary"
                      >
                        <option value="disc">Disc (•)</option>
                        <option value="square">Square (▪)</option>
                        <option value="dash">Dash (–)</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. PERSONAL INFO SECTION */}
            {activeSection === 'personal' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.fullName || ''}
                    onChange={(e) => handleUpdatePersonalInfo('fullName', e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Professional Headline / Role</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.title || ''}
                    onChange={(e) => handleUpdatePersonalInfo('title', e.target.value)}
                    placeholder="e.g. Senior Full-Stack AI Engineer"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo?.email || ''}
                      onChange={(e) => handleUpdatePersonalInfo('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.phone || ''}
                      onChange={(e) => handleUpdatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-400 block mb-1">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.location || ''}
                      onChange={(e) => handleUpdatePersonalInfo('location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.linkedin || ''}
                      onChange={(e) => handleUpdatePersonalInfo('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/alex"
                      className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GitHub / Portfolio</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo?.github || ''}
                    onChange={(e) => handleUpdatePersonalInfo('github', e.target.value)}
                    placeholder="github.com/alexchen"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* 3. SUMMARY SECTION */}
            {activeSection === 'summary' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400">Professional Summary</label>
                  <button
                    type="button"
                    onClick={() => setAiModal({
                      isOpen: true,
                      type: 'improve-all',
                      suggestions: [
                        'Proven Software Engineer with 4+ years architecting high-availability distributed systems, specialized in Python, React, and LLM microservices.',
                        'Results-driven AI Engineer experienced in fine-tuning models, scaling vector databases, and reducing cloud infrastructure costs by 30%.'
                      ]
                    })}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Polish</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={resumeData.summary || ''}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Write a compelling 2-3 sentence overview highlighting your core strengths, achievements, and technical expertise..."
                  className="w-full bg-[#050816] border border-white/10 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* 4. EXPERIENCE SECTION */}
            {activeSection === 'experience' && (
              <div className="space-y-5 text-xs">
                {(resumeData.experience || []).length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No experience entries yet.</p>
                    <button
                      onClick={handleAddExperience}
                      className="mt-2 text-primary hover:underline font-semibold"
                    >
                      + Add your first role
                    </button>
                  </div>
                ) : (
                  (resumeData.experience || []).map((exp, expIdx) => (
                    <div key={exp.id || expIdx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">Role #{expIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(expIdx)}
                          className="text-slate-500 hover:text-red-400"
                          title="Remove role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.position || ''}
                          onChange={(e) => handleUpdateExperience(expIdx, 'position', e.target.value)}
                          placeholder="Job Title (e.g. Senior Software Engineer)"
                          className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)}
                          placeholder="Company (e.g. Stripe)"
                          className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => handleUpdateExperience(expIdx, 'startDate', e.target.value)}
                          placeholder="Start Date (e.g. 2022)"
                          className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => handleUpdateExperience(expIdx, 'endDate', e.target.value)}
                          placeholder="End Date (or Present)"
                          className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Bullets List */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[11px] font-bold text-slate-400 block">Responsibility Bullets</label>
                        {(exp.bullets || []).map((bullet, bIdx) => (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <span className="text-slate-500 pt-2 text-xs">•</span>
                              <textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => handleUpdateExpBullet(expIdx, bIdx, e.target.value)}
                                placeholder="Describe impact with numbers..."
                                className="flex-1 bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary leading-relaxed"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExpBullet(expIdx, bIdx)}
                                className="text-slate-600 hover:text-red-400 pt-2"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            {/* Inline AI Improve button */}
                            <div className="pl-4">
                              <button
                                type="button"
                                onClick={() => handleOpenAiBullet(expIdx, bIdx)}
                                className="text-[10px] text-amber-400/90 hover:text-amber-300 font-semibold inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 transition-colors"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Improve with Metrics</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddExpBullet(expIdx)}
                          className="text-primary hover:underline text-[11px] font-semibold pt-1 block"
                        >
                          + Add Bullet
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 5. EDUCATION SECTION */}
            {activeSection === 'education' && (
              <div className="space-y-4 text-xs">
                {(resumeData.education || []).map((edu, eduIdx) => (
                  <div key={edu.id || eduIdx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Education #{eduIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(eduIdx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => handleUpdateEducation(eduIdx, 'institution', e.target.value)}
                      placeholder="University / College (e.g. Stanford University)"
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />

                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => handleUpdateEducation(eduIdx, 'degree', e.target.value)}
                      placeholder="Degree & Major (e.g. B.S. in Computer Science)"
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.startYear || ''}
                        onChange={(e) => handleUpdateEducation(eduIdx, 'startYear', e.target.value)}
                        placeholder="Start Year (2018)"
                        className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={edu.endYear || ''}
                        onChange={(e) => handleUpdateEducation(eduIdx, 'endYear', e.target.value)}
                        placeholder="Grad Year (2022)"
                        className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. SKILLS SECTION */}
            {activeSection === 'skills' && (
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    placeholder="Add skill (e.g. TypeScript, PyTorch, Docker)..."
                    className="flex-1 bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(resumeData.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs flex items-center gap-1.5 hover:border-primary/40 transition-colors"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 7. PROJECTS SECTION */}
            {activeSection === 'projects' && (
              <div className="space-y-4 text-xs">
                {(resumeData.projects || []).map((proj, pIdx) => (
                  <div key={proj.id || pIdx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Project #{pIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(pIdx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={proj.name || ''}
                      onChange={(e) => handleUpdateProject(pIdx, 'name', e.target.value)}
                      placeholder="Project Name"
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />

                    <input
                      type="text"
                      value={proj.technologies || ''}
                      onChange={(e) => handleUpdateProject(pIdx, 'technologies', e.target.value)}
                      placeholder="Technologies (e.g. Next.js, FastAPI, PostgreSQL)"
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />

                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) => handleUpdateProject(pIdx, 'description', e.target.value)}
                      placeholder="Brief description of outcomes and technical highlights..."
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 8. CERTIFICATIONS SECTION */}
            {activeSection === 'certifications' && (
              <div className="space-y-3 text-xs">
                <button
                  type="button"
                  onClick={handleAddCertification}
                  className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 mb-2"
                >
                  <Plus className="w-3 h-3" /> Add Certificate
                </button>
                {(resumeData.certifications || []).map((c, cIdx) => (
                  <div key={cIdx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300">Cert #{cIdx + 1}</span>
                      <button onClick={() => handleRemoveCertification(cIdx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={c.name || ''}
                      onChange={(e) => handleUpdateCertification(cIdx, 'name', e.target.value)}
                      placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={c.issuer || ''}
                        onChange={(e) => handleUpdateCertification(cIdx, 'issuer', e.target.value)}
                        placeholder="Issuer (e.g. Amazon)"
                        className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={c.year || ''}
                        onChange={(e) => handleUpdateCertification(cIdx, 'year', e.target.value)}
                        placeholder="Year (2023)"
                        className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. LANGUAGES SECTION */}
            {activeSection === 'languages' && (
              <div className="space-y-3 text-xs">
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 mb-2"
                >
                  <Plus className="w-3 h-3" /> Add Language
                </button>
                {(resumeData.languages || []).map((l, lIdx) => (
                  <div key={lIdx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={l.language || ''}
                      onChange={(e) => handleUpdateLanguage(lIdx, 'language', e.target.value)}
                      placeholder="Language (e.g. English)"
                      className="flex-1 bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={l.proficiency || ''}
                      onChange={(e) => handleUpdateLanguage(lIdx, 'proficiency', e.target.value)}
                      placeholder="Proficiency (Native / Fluent)"
                      className="w-32 bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                    />
                    <button onClick={() => handleRemoveLanguage(lIdx)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 10. DYNAMIC CUSTOM SECTION EDITOR */}
            {activeCustomSection && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={activeCustomSection.title || ''}
                    onChange={(e) => handleUpdateCustomSection(activeCustomSection.id, 'title', e.target.value)}
                    placeholder="Section Title"
                    className="w-full bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                {activeCustomSection.style === 'paragraph' ? (
                  <div>
                    <label className="text-slate-400 block mb-1">Content</label>
                    <textarea
                      rows={5}
                      value={activeCustomSection.content || ''}
                      onChange={(e) => handleUpdateCustomSection(activeCustomSection.id, 'content', e.target.value)}
                      placeholder="Write details for this section..."
                      className="w-full bg-[#050816] border border-white/10 rounded-lg p-2.5 text-white text-xs leading-relaxed focus:outline-none focus:border-primary"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-slate-400 block">Items / Bullet Points</label>
                    {(activeCustomSection.items || []).map((item, itIdx) => (
                      <div key={itIdx} className="flex items-start gap-1.5">
                        <span className="text-slate-500 pt-2 text-xs">•</span>
                        <textarea
                          rows={2}
                          value={item}
                          onChange={(e) => handleUpdateCustomBullet(activeCustomSection.id, itIdx, e.target.value)}
                          placeholder="Add accomplishment, publication, or detail..."
                          className="flex-1 bg-[#050816] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomBullet(activeCustomSection.id, itIdx)}
                          className="text-slate-600 hover:text-red-400 pt-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddCustomBullet(activeCustomSection.id)}
                      className="text-primary hover:underline text-[11px] font-semibold pt-1 block"
                    >
                      + Add Item
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* ── RIGHT COLUMN: A4 RESUME LIVE CANVAS PREVIEW (~70%) ── */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col items-center">
          
          {/* Paper Canvas Frame */}
          <div 
            ref={viewerContainerRef}
            className="w-full bg-[#050A18]/80 border border-white/[0.08] rounded-3xl p-4 sm:p-6 overflow-x-auto overflow-y-auto max-h-[calc(100vh-130px)] flex justify-center custom-scrollbar shadow-2xl relative"
          >
            <div
              style={{
                width: '794px',
                minHeight: '1123px',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease-out',
                marginBottom: `${(zoomLevel / 100 - 1) * 1123}px`
              }}
              className="shrink-0 shadow-2xl rounded-sm overflow-hidden bg-white"
            >
              <div ref={previewRef} className="w-[794px] bg-white min-h-[1123px]">
                {renderActiveTemplate()}
              </div>
            </div>
          </div>

          {/* Minimalist Floating Zoom & Canvas Controls */}
          <div className="mt-3 bg-[#0A1024]/90 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-3 text-xs text-slate-300 shadow-xl">
            <button
              onClick={() => setZoomLevel(prev => Math.max(40, prev - 10))}
              className="hover:text-white font-bold px-1"
              title="Zoom Out"
            >
              −
            </button>
            <span className="font-mono text-[11px] w-9 text-center text-slate-400">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="hover:text-white font-bold px-1"
              title="Zoom In"
            >
              +
            </button>
            <span className="w-px h-3 bg-white/10"></span>
            <button
              onClick={handleFitWidth}
              className="hover:text-white font-medium text-[11px]"
              title="Fit to Container"
            >
              Fit
            </button>
            <span className="w-px h-3 bg-white/10"></span>
            <button
              onClick={() => setIsFullscreenPreview(true)}
              className="hover:text-white"
              title="Fullscreen Preview"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* ── LAYER 3A: ADD / RESTORE SECTION MODAL ───────────────────────── */}
      <AnimatePresence>
        {isAddSectionModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1228] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>Add or Restore Section</span>
                </div>
                <button
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Restore Hidden Standard Sections (if any) */}
              {hiddenStandardList.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Hidden Standard Sections
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {hiddenStandardList.map(sec => {
                      const Icon = sec.icon;
                      return (
                        <div
                          key={sec.id}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 text-xs text-white">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                            <span>{sec.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleHideSection(sec.id)}
                            className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Quick Preset Additions */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Sections
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_ADD_SECTIONS.map((preset, pIdx) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleAddCustomSection(preset.title, preset.style)}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-primary/15 border border-white/10 hover:border-primary/40 text-left transition-all group"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-primary">
                          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                          <span>{preset.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 capitalize">{preset.style} format</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Create Custom Section */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Create Custom Section
                </div>
                <input
                  type="text"
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  placeholder="e.g. Leadership, Patents, Hackathons..."
                  className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCustomStyle('bullets')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      newCustomStyle === 'bullets'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/[0.02] border-white/10 text-slate-400'
                    }`}
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCustomStyle('paragraph')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      newCustomStyle === 'paragraph'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/[0.02] border-white/10 text-slate-400'
                    }`}
                  >
                    Paragraph Text
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCustomSection(newCustomTitle, newCustomStyle)}
                  disabled={!newCustomTitle.trim()}
                  className="w-full py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Section</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LAYER 3A-2: SAVE CURRENT STYLE AS TEMPLATE MODAL ─────────────── */}
      <AnimatePresence>
        {isSaveCurrentModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1228] border border-white/10 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Style as New Template</span>
                </div>
                <button
                  onClick={() => setIsSaveCurrentModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Base Layout:</span>
                  <span className="font-bold text-white uppercase font-mono">{selectedTemplate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Accent Color:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }}></span>
                    <span className="font-mono text-slate-200">{accentColor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Typography Font:</span>
                  <span className="text-slate-200 capitalize">{fontFamily}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Template Name</label>
                  <input
                    type="text"
                    value={saveCurrentTemplateName}
                    onChange={(e) => setSaveCurrentTemplateName(e.target.value)}
                    placeholder="e.g. Google Principal Minimal, Fintech Dark"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={saveCurrentTemplateDesc}
                    onChange={(e) => setSaveCurrentTemplateDesc(e.target.value)}
                    placeholder="e.g. Optimized for FAANG engineering management"
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveCurrentAsTemplate}
                  disabled={!saveCurrentTemplateName.trim()}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Add to Templates</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── LAYER 3A-3: 100% MS WORD TEMPLATE STUDIO (Full-Screen Visual Canvas) ── */}
      {isCreateTemplateModalOpen && (
        <WordTemplateStudio
          isOpen={isCreateTemplateModalOpen}
          onClose={() => setIsCreateTemplateModalOpen(false)}
          onSaveTemplate={handleSaveStudioTemplate}
          initialTemplateData={editingTemplateData}
        />
      )}

      {/* ── LAYER 3B: CONTEXTUAL AI MODAL / DRAWER ──────────────────────── */}
      <AnimatePresence>
        {aiModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0B1228] border border-white/10 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {aiModal.type === 'bullet' && 'AI Bullet Enhancer'}
                    {aiModal.type === 'improve-all' && 'AI Resume Polish'}
                    {aiModal.type === 'match-jd' && 'Job Description Keyword Match'}
                    {aiModal.type === 'fix-ats' && 'ATS Readiness Suggestions'}
                  </span>
                </div>
                <button
                  onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiModal.type === 'match-jd' ? (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-400">Paste the target Job Description to compare against your resume:</p>
                  <textarea
                    rows={5}
                    value={aiModal.jdText}
                    onChange={(e) => setAiModal(prev => ({ ...prev, jdText: e.target.value }))}
                    placeholder="Paste job requirements here..."
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      toast.success('Analyzing JD match against career records...');
                      setAiModal(prev => ({
                        ...prev,
                        suggestions: [
                          'Found 8/10 core keywords in your resume.',
                          'Suggested addition: Highlight AWS Lambda & Microservices in your top bullet points.',
                          'Add "CI/CD Pipeline Architecture" to your technical skills list.'
                        ]
                      }));
                    }}
                    className="w-full py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
                  >
                    Analyze & Align Resume
                  </button>
                </div>
              ) : null}

              {/* AI Suggested Enhancements List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  AI Recommended Variations (Click to Apply)
                </div>
                {aiModal.suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyAiSuggestion(sug)}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 cursor-pointer text-xs text-slate-200 transition-all flex items-start justify-between gap-3 group"
                  >
                    <p className="leading-relaxed group-hover:text-white">{sug}</p>
                    <CheckCheck className="w-4 h-4 text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FULLSCREEN PREVIEW MODAL ────────────────────────────────────── */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 max-w-5xl mx-auto w-full border-b border-white/10">
            <h2 className="text-sm font-bold text-white">Full-Screen Resume Canvas</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportPDF}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
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
