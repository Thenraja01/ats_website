import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  AlertCircle,
  X,
  Share2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getMasterCareerProfile,
  saveMasterCareerProfile,
  calculateProfileScore,
  DEFAULT_MASTER_PROFILE
} from '../services/careerProfileSync';

export default function CareerProfile() {
  const [profile, setProfile] = useState(() => getMasterCareerProfile());
  const [activeTab, setActiveTab] = useState('personal');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Advanced');
  const [syncedTime, setSyncedTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    saveMasterCareerProfile(profile);
    setSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [profile]);

  const completionScore = calculateProfileScore(profile);


  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `career-profile-${profile.personalInfo?.fullName?.replace(/\s+/g, '_') || 'master'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Master Career Profile exported as JSON');
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
        toast.success('Master Career Profile imported successfully!');
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
      verified: true
    };
    setProfile(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skillObj]
    }));
    setNewSkillName('');
    toast.success(`Added verified skill: ${skillObj.name}`);
  };

  const handleRemoveSkill = (skillName) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary & Goals', icon: Sparkles },
    { id: 'experience', label: 'Work Experience', icon: Briefcase, count: profile.experience?.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: profile.education?.length },
    { id: 'projects', label: 'Projects', icon: Code2, count: profile.projects?.length },
    { id: 'skills', label: 'Verified Skills', icon: ShieldCheck, count: profile.skills?.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: profile.certifications?.length },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon, count: profile.languages?.length },
    { id: 'custom', label: 'Custom Sections', icon: Layers, count: profile.customSections?.length },
  ];

  return (
    <div className="min-h-screen pt-4 pb-20 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#0C142E] via-[#0A1026] to-[#0D1838] border border-primary/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Single Source of Truth • 100% Fact Grounded</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-heading">
              Master Career Profile
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Maintain your verified professional record once. All AI resume tailoring, JD matching, and ATS optimizations will strictly draw from this data without hallucinations.
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
                <p className="text-xs font-bold text-primary">Profile Score</p>
                <p className="text-[11px] text-slate-400">Ready for AI Matching</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3.5 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 text-slate-200 hover:text-primary text-xs font-semibold flex items-center gap-2 transition-all"
                title="Export career profile as portable JSON"
              >
                <Download className="w-4 h-4 text-accent" />
                <span>Export JSON</span>
              </button>

              <label className="px-3.5 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 text-slate-200 hover:text-primary text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-primary" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <Link
                to="/builder"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary text-xs font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Open in Resume Builder</span>
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
            <strong>Live Single Source of Truth:</strong> Any edits made here are instantly synced to your <strong>Resume Builder</strong>, <strong>JD Analyzer</strong>, and <strong>AI Career Advisor</strong>.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400/80 font-mono">
          Last Synced: {syncedTime}
        </span>
      </div>


      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Navigation Sidebar Tabs (3 Cols) */}
        <div className="lg:col-span-3 bg-[#080D1E] border border-primary/[0.08] rounded-3xl p-3 shadow-xl space-y-1 sticky top-24">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
            Profile Sections
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
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-primary/20 text-primary' : 'bg-primary/5 text-slate-400'
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
              <div>
                <h2 className="text-base font-bold text-primary">Personal Information</h2>
                <p className="text-xs text-slate-400">Core contact info and public developer links</p>
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
                    <Plus className="w-3.5 h-3.5" /> Add Field
                  </button>
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
                    <p className="text-xs text-slate-500 italic">No custom fields added yet. Click "+ Add Field" above to add arbitrary links or candidate properties.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Professional Summary & Goals */}
          {activeTab === 'summary' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-primary">Professional Summary & Target Roles</h2>
                <p className="text-xs text-slate-400">Master elevator pitch and preferred career directions</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Primary Summary</label>
                  <textarea
                    rows={5}
                    value={profile.summary?.primary || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      summary: { ...prev.summary, primary: e.target.value }
                    }))}
                    placeholder="Describe your career achievements, core architectural philosophies, and value proposition..."
                    className="w-full px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-xs leading-relaxed focus:outline-none focus:border-primary resize-y"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-primary/[0.02] border border-primary/[0.06] flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    When you run the <strong>JD Matching Engine</strong>, AI will naturally highlight elements from this summary that match your target role's keywords without fabricating unearned claims.
                  </p>
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
                      employmentType: 'Full-time',
                      location: '',
                      startDate: '',
                      endDate: '',
                      current: false,
                      description: '',
                      responsibilities: [''],
                      achievements: [''],
                      technologies: []
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

                    {/* Responsibilities */}
                    <div className="space-y-2 pt-2 border-t border-primary/[0.04]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300 font-medium">Key Responsibilities (Fact Tracked)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...profile.experience];
                            updated[expIdx].responsibilities = [...(updated[expIdx].responsibilities || []), ''];
                            setProfile(prev => ({ ...prev, experience: updated }));
                          }}
                          className="text-xs text-primary hover:text-accent font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Responsibility
                        </button>
                      </div>
                      {exp.responsibilities?.map((resp, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={resp}
                            onChange={(e) => {
                              const updated = [...profile.experience];
                              updated[expIdx].responsibilities[rIdx] = e.target.value;
                              setProfile(prev => ({ ...prev, experience: updated }));
                            }}
                            placeholder="e.g. Designed asynchronous message queues with RabbitMQ handling 50k msgs/sec..."
                            className="flex-1 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...profile.experience];
                              updated[expIdx].responsibilities = updated[expIdx].responsibilities.filter((_, idx) => idx !== rIdx);
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

          {/* 4. Verified Skills */}
          {activeTab === 'skills' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-primary">Verified Career Skills</h2>
                <p className="text-xs text-slate-400">Add technical skills, tools, and proficiencies</p>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="p-4 rounded-2xl bg-primary/[0.03] border border-primary/[0.08] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-slate-300 font-medium">Skill Name</label>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Docker, PyTorch, GraphQL"
                    className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0c1226] border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary text-xs font-semibold shadow-md shadow-primary/20"
                >
                  Add Skill
                </button>
              </form>

              {/* Categorized Skills Grid */}
              <div className="space-y-4 pt-2">
                {['Programming', 'Frontend', 'Backend', 'Database', 'DevOps & Cloud', 'AI & ML', 'Architecture'].map(cat => {
                  const catSkills = profile.skills?.filter(s => s.category === cat) || [];
                  if (catSkills.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{cat}</h3>
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map(skill => (
                          <span
                            key={skill.name}
                            className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-slate-200 text-xs flex items-center gap-2 group hover:border-primary/40 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{skill.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({skill.proficiency})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.name)}
                              className="text-slate-500 group-hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 5. Projects */}
          {activeTab === 'projects' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Projects & Portfolio</h2>
                  <p className="text-xs text-slate-400">Software systems, repositories, and quantified impact</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProj = {
                      id: `proj_${Date.now()}`,
                      name: '',
                      role: '',
                      technologies: '',
                      startDate: '',
                      endDate: '',
                      url: '',
                      githubUrl: '',
                      description: '',
                      metrics: ''
                    };
                    setProfile(prev => ({ ...prev, projects: [...(prev.projects || []), newProj] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5"
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
                          placeholder="e.g. Distributed RAG Engine"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => {
                            const updated = [...profile.projects];
                            updated[idx].technologies = e.target.value;
                            setProfile(prev => ({ ...prev, projects: updated }));
                          }}
                          placeholder="e.g. Python, FastAPI, Docker"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-slate-300 font-medium">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...profile.projects];
                            updated[idx].description = e.target.value;
                            setProfile(prev => ({ ...prev, projects: updated }));
                          }}
                          placeholder="Architecture, key capabilities, and user value..."
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 6. Education */}
          {activeTab === 'education' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Academic History</h2>
                  <p className="text-xs text-slate-400">Degrees, colleges, coursework, and honors</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newEdu = {
                      id: `edu_${Date.now()}`,
                      institution: '',
                      degree: '',
                      fieldOfStudy: '',
                      startDate: '',
                      endDate: '',
                      gpa: '',
                      coursework: ''
                    };
                    setProfile(prev => ({ ...prev, education: [...(prev.education || []), newEdu] }));
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
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
                          placeholder="e.g. UC Berkeley"
                          className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Degree</label>
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

          {/* 7. Certifications & Languages */}
          {(activeTab === 'certifications' || activeTab === 'languages') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Certifications & Languages</h2>
                  <p className="text-xs text-slate-400">Industry badges, licenses, and language competencies</p>
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

          {/* 8. Custom Sections */}
          {activeTab === 'custom' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-primary">Custom Sections</h2>
                  <p className="text-xs text-slate-400">Add arbitrary career dimensions (Publications, Volunteering, Patents, Talks, Awards)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSec = {
                      id: `custom_${Date.now()}`,
                      title: 'Publications & Research',
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
                        placeholder="e.g. Publications & Research"
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
                            placeholder="e.g. Published 'Large-scale inference' at IEEE 2024..."
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

                {(!profile.customSections || profile.customSections.length === 0) && (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-primary/10 rounded-2xl">
                    No custom sections created yet. Click "Add Section" above to define extra career sections.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
