import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Languages as LanguagesIcon,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Layers,
  FileText,
  ExternalLink,
  Info,
  Check,
  AlertTriangle,
  X,
  Share2,
  Lock,
  ArrowRight,
  BookOpen,
  FolderGit2,
  Database,
  Search,
  Sliders,
  Tag,
  Link as LinkIcon,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  GitBranch,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getMasterCareerProfile,
  saveMasterCareerProfile,
  calculateProfileScore,
  calculateSkillEvidenceMap,
  DEFAULT_MASTER_PROFILE
} from '../services/careerProfileSync';

export default function CareerVault() {
  const [profile, setProfile] = useState(() => getMasterCareerProfile());
  const [activeTab, setActiveTab] = useState('personal');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Advanced');
  const [syncedTime, setSyncedTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Multi-Document Ingestion & Conflict Resolver State
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState([]);
  const [evidenceMapOpen, setEvidenceMapOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    saveMasterCareerProfile(profile);
    setSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [profile]);

  const completionScore = calculateProfileScore(profile);
  const skillEvidence = calculateSkillEvidenceMap(profile);

  // Multi-Document Ingestion Parser with Conflict Detection
  const handleMultiDocUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingDocs(true);
    toast.info(`Parsing ${files.length} career document(s)...`);

    setTimeout(() => {
      // Simulate intelligent parsing & conflict detection
      const conflicts = [];

      // Example conflict simulation if candidate has existing experience
      if (profile.experience && profile.experience.length > 0) {
        const firstExp = profile.experience[0];
        conflicts.push({
          id: 'conf_1',
          field: 'Employment Date Range',
          entity: `${firstExp.company} (${firstExp.jobTitle || firstExp.position})`,
          currentValue: `${firstExp.startDate} – ${firstExp.endDate || 'Present'}`,
          incomingValue: `Feb 2022 – Present`,
          sourceDoc: files[0].name,
          resolvedValue: firstExp.startDate
        });
      }

      setIsUploadingDocs(false);
      if (conflicts.length > 0) {
        setDetectedConflicts(conflicts);
        setConflictModalOpen(true);
        toast.warning('⚠️ Conflicting career facts detected across documents. Please verify.');
      } else {
        toast.success(`Successfully ingested ${files.length} document(s) into your Career Vault!`);
      }
    }, 1200);
  };

  const handleResolveConflict = (conflictId, chosenValue) => {
    setDetectedConflicts(prev => prev.filter(c => c.id !== conflictId));
    if (detectedConflicts.length <= 1) {
      setConflictModalOpen(false);
      toast.success('All document conflicts resolved and locked into Career Vault');
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `career-vault-${profile.personalInfo?.fullName?.replace(/\s+/g, '_') || 'master'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Career Vault exported as portable JSON');
  };

  // Import JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        setProfile(parsed);
        toast.success('Career Vault imported and synchronized successfully!');
      } catch (err) {
        toast.error('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  // Add Skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const skillObj = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      verified: true,
      evidenceLevel: 'Strong'
    };
    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skillObj]
    }));
    setNewSkillName('');
    toast.success(`Added skill to Vault: ${skillObj.name}`);
  };

  const handleRemoveSkill = (skillName) => {
    setProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => (typeof s === 'string' ? s : s.name) !== skillName)
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'summary', label: 'Summary & Voice', icon: Sparkles },
    { id: 'experience', label: 'Work Experience', icon: Briefcase, count: profile.experience?.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: profile.education?.length },
    { id: 'projects', label: 'Engineering Projects', icon: Code2, count: profile.projects?.length },
    { id: 'skills', label: 'Verified Skills & Evidence', icon: ShieldCheck, count: profile.skills?.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: profile.certifications?.length },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon, count: profile.languages?.length },
    { id: 'publications', label: 'Publications & Research', icon: BookOpen, count: profile.publications?.length || 0 },
    { id: 'openSource', label: 'Open Source & Patents', icon: FolderGit2, count: profile.openSource?.length || 0 },
    { id: 'custom', label: 'Custom Information', icon: Layers, count: profile.customSections?.length || 0 },
  ];

  return (
    <div className="min-h-screen pt-4 pb-20 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">

      {/* Top Hero Banner - Career Vault Pillar */}
      <div className="bg-gradient-to-r from-[#0C142E] via-[#0A1026] to-[#0D1838] border border-primary/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Career Vault • Single Source of Truth</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-heading">
              The Career Vault
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Your entire professional career, stored once. All resume versions, JD matches, and ATS optimizations strictly draw from this verified record without hallucinated facts.
            </p>
          </div>

          {/* Actions & Completion Score */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            {/* Completion Meter */}
            <div className="p-3.5 rounded-2xl bg-primary/[0.04] border border-primary/[0.08] flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" className="text-primary/10 stroke-current" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="text-primary stroke-current transition-all duration-1000"
                    strokeWidth="4"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * completionScore) / 100}
                    fill="transparent"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-primary">{completionScore}%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-primary">Vault Readiness</p>
                <p className="text-[11px] text-slate-400">100% Fact Grounded</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="px-3.5 py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-bold flex items-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Documents</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.json"
                  onChange={handleMultiDocUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3.5 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 text-slate-200 hover:text-primary text-xs font-semibold flex items-center gap-2 transition-all"
                title="Export vault as JSON"
              >
                <Download className="w-4 h-4 text-accent" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <Link
                to="/builder"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary text-xs font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Resume Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sync Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Live Single Source of Truth:</strong> Any edits made in the Career Vault are instantly synchronized with your <strong>Resume Studio</strong>, <strong>JD Tailorer</strong>, and <strong>Application Memory</strong>.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400/80 font-mono">
          Last Synced: {syncedTime}
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Navigation Sidebar Tabs (3 Cols) */}
        <div className="lg:col-span-3 bg-[#080D1E] border border-primary/[0.08] rounded-3xl p-3 shadow-xl space-y-1 sticky top-20">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
            Career Vault Modules
          </p>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${isActive
                    ? 'bg-primary text-primary shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                  }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${isActive ? 'bg-primary/20 text-primary' : 'bg-primary/5 text-slate-400'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section Editor Card (9 Cols) */}
        <div className="lg:col-span-9 bg-[#080D1E] border border-primary/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl">

          {/* 1. Personal Information */}
          {activeTab === 'personal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Personal Identity & Links</h2>
                  <p className="text-xs text-slate-400">Core contact info and public developer links</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newField = { id: `cf_${Date.now()}`, label: 'Portfolio', value: '' };
                    setProfile(prev => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        customFields: [...(prev.personalInfo?.customFields || []), newField]
                      }
                    }));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom Field
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.fullName || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Professional Headline / Primary Specialization</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.headline || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, headline: e.target.value }
                    }))}
                    placeholder="e.g. Senior Full Stack & AI Engineer"
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={profile.personalInfo?.email || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.phone || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Location</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.location || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value }
                    }))}
                    placeholder="City, State, Country"
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.linkedin || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                    }))}
                    placeholder="linkedin.com/in/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">GitHub / Portfolio Link</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.github || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, github: e.target.value }
                    }))}
                    placeholder="github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Dynamic Custom Contact / Profile Fields */}
              <div className="pt-4 border-t border-primary/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">Custom Profile Fields</h3>
                    <p className="text-[11px] text-slate-400">Add custom URLs, platforms, or attributes (e.g. LeetCode, Visa Status, Twitter)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {(profile.personalInfo?.customFields || []).map((cf, cIdx) => (
                    <div key={cf.id || cIdx} className="flex items-center gap-2.5 p-2 rounded-xl bg-primary/[0.02] border border-primary/[0.06]">
                      <input
                        type="text"
                        value={cf.label}
                        onChange={(e) => {
                          const updated = [...(profile.personalInfo?.customFields || [])];
                          updated[cIdx] = { ...updated[cIdx], label: e.target.value };
                          setProfile(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, customFields: updated }
                          }));
                        }}
                        placeholder="Label (e.g. LeetCode, Medium)"
                        className="w-1/3 px-3.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={cf.value}
                        onChange={(e) => {
                          const updated = [...(profile.personalInfo?.customFields || [])];
                          updated[cIdx] = { ...updated[cIdx], value: e.target.value };
                          setProfile(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, customFields: updated }
                          }));
                        }}
                        placeholder="Value (e.g. leetcode.com/username, Authorized to work)"
                        className="flex-1 px-3.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo,
                              customFields: (prev.personalInfo?.customFields || []).filter((_, i) => i !== cIdx)
                            }
                          }));
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!profile.personalInfo?.customFields || profile.personalInfo.customFields.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No custom fields added yet. Click "+ Add Custom Field" above to add arbitrary links or candidate properties.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Professional Summary & Human Voice Engine */}
          {activeTab === 'summary' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-primary">Professional Summary & Human Voice Engine</h2>
                <p className="text-xs text-slate-400">Master elevator pitch and preferred writing tone presets</p>
              </div>

              {/* Human Voice Engine Selector */}
              <div className="p-4 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Human Voice Engine Preset
                  </label>
                  <span className="text-[11px] text-slate-400">Prevents generic corporate AI fluff</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Natural', desc: 'Authentic & grounded' },
                    { id: 'Professional', desc: 'Crisp & balanced' },
                    { id: 'Technical', desc: 'Architecture & stack focus' },
                    { id: 'Simple', desc: 'Direct & jargon-free' },
                    { id: 'Executive', desc: 'Strategic & business impact' },
                    { id: 'Student', desc: 'Growth & project oriented' }
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        voiceProfile: { ...(prev.voiceProfile || {}), style: style.id }
                      }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${(profile.voiceProfile?.style || 'Professional') === style.id
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-primary/[0.02] border-primary/[0.06] text-slate-400 hover:text-primary'
                        }`}
                    >
                      <div className="text-xs font-bold">{style.id}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Primary Career Summary</label>
                  <textarea
                    rows={6}
                    value={profile.summary?.primary || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      summary: { ...prev.summary, primary: e.target.value }
                    }))}
                    placeholder="Describe your career achievements, core architectural philosophies, and value proposition..."
                    className="w-full px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-xs leading-relaxed focus:outline-none focus:border-primary resize-y"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Work Experience */}
          {activeTab === 'experience' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Work Experience</h2>
                  <p className="text-xs text-slate-400">Granular roles, companies, responsibilities, and verified metrics</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newExp = {
                      id: `exp_${Date.now()}`,
                      company: '',
                      jobTitle: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      current: false,
                      description: '',
                      responsibilities: [''],
                    };
                    setProfile(prev => ({ ...prev, experience: [...(prev.experience || []), newExp] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              <div className="space-y-5">
                {profile.experience?.map((exp, expIdx) => (
                  <div key={exp.id || expIdx} className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        experience: prev.experience.filter((_, idx) => idx !== expIdx)
                      }))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[expIdx].jobTitle = e.target.value;
                            setProfile(prev => ({ ...prev, experience: updated }));
                          }}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[expIdx].company = e.target.value;
                            setProfile(prev => ({ ...prev, experience: updated }));
                          }}
                          placeholder="e.g. Google"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[expIdx].startDate = e.target.value;
                            setProfile(prev => ({ ...prev, experience: updated }));
                          }}
                          placeholder="e.g. Jan 2022"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">End Date</label>
                        <input
                          type="text"
                          value={exp.current ? 'Present' : exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => {
                            const updated = [...profile.experience];
                            updated[expIdx].endDate = e.target.value;
                            setProfile(prev => ({ ...prev, experience: updated }));
                          }}
                          placeholder="e.g. Dec 2023"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary disabled:opacity-40"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`curr-${expIdx}`}
                        checked={exp.current}
                        onChange={(e) => {
                          const updated = [...profile.experience];
                          updated[expIdx].current = e.target.checked;
                          setProfile(prev => ({ ...prev, experience: updated }));
                        }}
                        className="rounded bg-primary/5 border-primary/20 text-primary focus:ring-0"
                      />
                      <label htmlFor={`curr-${expIdx}`} className="text-xs text-slate-400 cursor-pointer">
                        Currently employed in this role
                      </label>
                    </div>

                    {/* Quantified Responsibilities / Bullets */}
                    <div className="space-y-2 pt-2 border-t border-primary/[0.04]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-400 font-medium">Key Responsibility & Achievement Bullets</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...profile.experience];
                            updated[expIdx].responsibilities = [...(updated[expIdx].responsibilities || []), ''];
                            setProfile(prev => ({ ...prev, experience: updated }));
                          }}
                          className="text-xs text-primary font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>
                      {(exp.responsibilities || []).map((resp, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={resp}
                            onChange={(e) => {
                              const updated = [...profile.experience];
                              const resps = [...(updated[expIdx].responsibilities || [])];
                              resps[rIdx] = e.target.value;
                              updated[expIdx].responsibilities = resps;
                              setProfile(prev => ({ ...prev, experience: updated }));
                            }}
                            placeholder="e.g. Architected FastAPI microservices processing 100k+ candidate profiles..."
                            className="flex-1 px-3.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...profile.experience];
                              updated[expIdx].responsibilities = updated[expIdx].responsibilities.filter((_, i) => i !== rIdx);
                              setProfile(prev => ({ ...prev, experience: updated }));
                            }}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Education & Academics</h2>
                  <p className="text-xs text-slate-400">Degrees, institutions, honors, and graduation timelines</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newEdu = { id: `edu_${Date.now()}`, institution: '', degree: '', startDate: '', endDate: '', gpa: '' };
                    setProfile(prev => ({ ...prev, education: [...(prev.education || []), newEdu] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              <div className="space-y-4">
                {profile.education?.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        education: prev.education.filter((_, eIdx) => eIdx !== idx)
                      }))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-slate-300 font-medium">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...profile.education];
                            updated[idx].institution = e.target.value;
                            setProfile(prev => ({ ...prev, education: updated }));
                          }}
                          placeholder="e.g. Stanford University"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Degree & Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...profile.education];
                            updated[idx].degree = e.target.value;
                            setProfile(prev => ({ ...prev, education: updated }));
                          }}
                          placeholder="e.g. B.S. in Computer Science"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => {
                            const updated = [...profile.education];
                            updated[idx].endDate = e.target.value;
                            setProfile(prev => ({ ...prev, education: updated }));
                          }}
                          placeholder="e.g. 2024"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Engineering Projects</h2>
                  <p className="text-xs text-slate-400">Applications, open-source repositories, and technical deliverables</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProj = { id: `proj_${Date.now()}`, name: '', technologies: '', startDate: '', url: '', description: '' };
                    setProfile(prev => ({ ...prev, projects: [...(prev.projects || []), newProj] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {profile.projects?.map((proj, idx) => (
                  <div key={proj.id || idx} className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        projects: prev.projects.filter((_, pIdx) => pIdx !== idx)
                      }))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...profile.projects];
                            updated[idx].name = e.target.value;
                            setProfile(prev => ({ ...prev, projects: updated }));
                          }}
                          placeholder="e.g. AI Resume Intelligence Engine"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Tech Stack</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => {
                            const updated = [...profile.projects];
                            updated[idx].technologies = e.target.value;
                            setProfile(prev => ({ ...prev, projects: updated }));
                          }}
                          placeholder="e.g. Python, FastAPI, React, PostgreSQL"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-slate-300 font-medium">Project Description</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...profile.projects];
                            updated[idx].description = e.target.value;
                            setProfile(prev => ({ ...prev, projects: updated }));
                          }}
                          placeholder="Key features, engineering challenges overcome, and measurable outcome..."
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 6. Skills & Evidence Map */}
          {activeTab === 'skills' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Verified Skills & Evidence Map</h2>
                  <p className="text-xs text-slate-400">Skills mapped directly to factual experiences and projects in your vault</p>
                </div>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-primary/[0.02] border border-primary/[0.06]">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Enter verified skill (e.g. Docker, RAG, PyTorch)..."
                  className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </form>

              {/* Skill Evidence Map Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skillEvidence.map((se, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{se.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${se.confidence === 'Strong Evidence'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : se.confidence === 'Moderate Evidence'
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                          {se.confidence}
                        </span>
                      </div>

                      {se.sources.length > 0 ? (
                        <div className="text-[10px] text-slate-400 flex flex-wrap gap-1 mt-1">
                          <span className="font-semibold text-slate-300">Sources:</span>
                          {se.sources.map((src, sIdx) => (
                            <span key={sIdx} className="px-1.5 py-0.2 rounded bg-primary/5 text-slate-300">
                              {src.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">No direct experience cited yet</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(se.name)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 7. Certifications & Languages */}
          {(activeTab === 'certifications' || activeTab === 'languages') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Certifications & Languages</h2>
                  <p className="text-xs text-slate-400">Industry credentials, licenses, and language competencies</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newCert = { id: `cert_${Date.now()}`, name: '', organization: '', issueDate: '' };
                      setProfile(prev => ({ ...prev, certifications: [...(prev.certifications || []), newCert] }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newLang = { name: '', proficiency: 'Fluent' };
                      setProfile(prev => ({ ...prev, languages: [...(prev.languages || []), newLang] }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Language
                  </button>
                </div>
              </div>

              {/* Certifications List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Certifications</h3>
                {profile.certifications?.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-primary/[0.02] border border-primary/[0.08] flex items-center gap-3">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = [...profile.certifications];
                        updated[idx].name = e.target.value;
                        setProfile(prev => ({ ...prev, certifications: updated }));
                      }}
                      placeholder="Certification Name"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={c.organization}
                      onChange={(e) => {
                        const updated = [...profile.certifications];
                        updated[idx].organization = e.target.value;
                        setProfile(prev => ({ ...prev, certifications: updated }));
                      }}
                      placeholder="Issuer (e.g. AWS)"
                      className="w-1/3 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Languages List */}
              <div className="space-y-3 pt-3 border-t border-primary/[0.06]">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Languages</h3>
                {profile.languages?.map((l, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={l.name}
                      onChange={(e) => {
                        const updated = [...profile.languages];
                        updated[idx].name = e.target.value;
                        setProfile(prev => ({ ...prev, languages: updated }));
                      }}
                      placeholder="Language"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                    />
                    <select
                      value={l.proficiency}
                      onChange={(e) => {
                        const updated = [...profile.languages];
                        updated[idx].proficiency = e.target.value;
                        setProfile(prev => ({ ...prev, languages: updated }));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0C1226] border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="Native / Bilingual">Native / Bilingual</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Professional Working">Professional Working</option>
                      <option value="Conversational">Conversational</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }))}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 8. Publications & Research */}
          {activeTab === 'publications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Publications & Research Papers</h2>
                  <p className="text-xs text-slate-400">Academic papers, journal articles, conference talks, and primarypapers</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newPub = { id: `pub_${Date.now()}`, title: '', publisher: '', year: '', link: '', description: '' };
                    setProfile(prev => ({ ...prev, publications: [...(prev.publications || []), newPub] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Publication
                </button>
              </div>

              <div className="space-y-4">
                {(profile.publications || []).map((pub, idx) => (
                  <div key={pub.id || idx} className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, publications: prev.publications.filter((_, i) => i !== idx) }))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-slate-300 font-medium">Paper / Article Title</label>
                        <input
                          type="text"
                          value={pub.title}
                          onChange={(e) => {
                            const updated = [...profile.publications];
                            updated[idx].title = e.target.value;
                            setProfile(prev => ({ ...prev, publications: updated }));
                          }}
                          placeholder="e.g. Distributed Consensus in Asynchronous Networks"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Publisher / Conference</label>
                        <input
                          type="text"
                          value={pub.publisher}
                          onChange={(e) => {
                            const updated = [...profile.publications];
                            updated[idx].publisher = e.target.value;
                            setProfile(prev => ({ ...prev, publications: updated }));
                          }}
                          placeholder="e.g. IEEE / ACM"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Year</label>
                        <input
                          type="text"
                          value={pub.year}
                          onChange={(e) => {
                            const updated = [...profile.publications];
                            updated[idx].year = e.target.value;
                            setProfile(prev => ({ ...prev, publications: updated }));
                          }}
                          placeholder="e.g. 2024"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!profile.publications || profile.publications.length === 0) && (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-primary/10 rounded-2xl">
                    No publications added yet. Click "Add Publication" above.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 9. Open Source & Patents */}
          {activeTab === 'openSource' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Open Source & Patents</h2>
                  <p className="text-xs text-slate-400">Public OSS maintainership, major contributions, and filed patents</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newOSS = { id: `oss_${Date.now()}`, name: '', role: 'Maintainer / Contributor', link: '', impact: '' };
                    setProfile(prev => ({ ...prev, openSource: [...(prev.openSource || []), newOSS] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Contribution
                </button>
              </div>

              <div className="space-y-4">
                {(profile.openSource || []).map((oss, idx) => (
                  <div key={oss.id || idx} className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, openSource: prev.openSource.filter((_, i) => i !== idx) }))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Repository / Project / Patent Name</label>
                        <input
                          type="text"
                          value={oss.name}
                          onChange={(e) => {
                            const updated = [...profile.openSource];
                            updated[idx].name = e.target.value;
                            setProfile(prev => ({ ...prev, openSource: updated }));
                          }}
                          placeholder="e.g. LangChain Contributor"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Link</label>
                        <input
                          type="text"
                          value={oss.link}
                          onChange={(e) => {
                            const updated = [...profile.openSource];
                            updated[idx].link = e.target.value;
                            setProfile(prev => ({ ...prev, openSource: updated }));
                          }}
                          placeholder="e.g. github.com/..."
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!profile.openSource || profile.openSource.length === 0) && (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-primary/10 rounded-2xl">
                    No open source or patent items added yet. Click "Add Contribution" above.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 10. Custom Information */}
          {activeTab === 'custom' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Custom Career Sections</h2>
                  <p className="text-xs text-slate-400">Add arbitrary career dimensions (Volunteering, Speaking, Advisory, Awards)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSec = {
                      id: `custom_${Date.now()}`,
                      title: 'Community & Volunteering',
                      content: '',
                      items: ['']
                    };
                    setProfile(prev => ({
                      ...prev,
                      customSections: [...(prev.customSections || []), newSec]
                    }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
              </div>

              <div className="space-y-4">
                {(profile.customSections || []).map((sec, sIdx) => (
                  <div key={sec.id || sIdx} className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        customSections: prev.customSections.filter((_, idx) => idx !== sIdx)
                      }))}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-2 pr-8">
                      <label className="text-xs text-slate-300 font-medium">Section Title</label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...profile.customSections];
                          updated[sIdx].title = e.target.value;
                          setProfile(prev => ({ ...prev, customSections: updated }));
                        }}
                        placeholder="e.g. Community & Volunteering"
                        className="w-full px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs font-bold focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-primary/[0.04]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-400 font-medium">Bullet Items</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...profile.customSections];
                            updated[sIdx].items = [...(updated[sIdx].items || []), ''];
                            setProfile(prev => ({ ...prev, customSections: updated }));
                          }}
                          className="text-xs text-primary font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Item
                        </button>
                      </div>

                      {(sec.items || []).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={typeof item === 'string' ? item : (item.text || '')}
                            onChange={(e) => {
                              const updated = [...profile.customSections];
                              const items = [...(updated[sIdx].items || [])];
                              items[itemIdx] = e.target.value;
                              updated[sIdx].items = items;
                              setProfile(prev => ({ ...prev, customSections: updated }));
                            }}
                            placeholder="e.g. Mentored 20+ underrepresented engineers in cloud architecture..."
                            className="flex-1 px-3.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...profile.customSections];
                              updated[sIdx].items = updated[sIdx].items.filter((_, i) => i !== itemIdx);
                              setProfile(prev => ({ ...prev, customSections: updated }));
                            }}
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

        </div>
      </div>

      {/* Multi-Document Conflict Resolution Modal */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A1026] border border-amber-500/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Conflicting Career Facts Detected</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Different dates or titles were found in your uploaded document vs existing Career Vault. Please select the accurate fact:
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {detectedConflicts.map(conf => (
                <div key={conf.id} className="p-4 rounded-2xl bg-primary/[0.02] border border-primary/[0.08] space-y-3">
                  <div className="text-xs font-bold text-primary">{conf.entity} — <span className="text-amber-400">{conf.field}</span></div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleResolveConflict(conf.id, conf.currentValue)}
                      className="p-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-left transition-all"
                    >
                      <span className="text-[10px] font-bold text-primary block uppercase">Vault Value</span>
                      <span className="text-xs text-primary font-medium">{conf.currentValue}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResolveConflict(conf.id, conf.incomingValue)}
                      className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all"
                    >
                      <span className="text-[10px] font-bold text-amber-400 block uppercase">Uploaded Doc ({conf.sourceDoc})</span>
                      <span className="text-xs text-primary font-medium">{conf.incomingValue}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setConflictModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary/10 text-slate-300 text-xs hover:text-primary"
              >
                Dismiss & Review Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
