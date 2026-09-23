import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw,
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  saveMasterCareerProfile, 
  calculateProfileScore, 
  getMasterCareerProfile,
  DEFAULT_MASTER_PROFILE 
} from '../services/careerProfileSync';


export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('hiremind_master_career_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.personalInfo?.fullName) return parsed;
      }
    } catch (e) {}
    return {
      personalInfo: { fullName: '', headline: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
      summary: { primary: '', targetRoles: [] },
      experience: [{ company: '', jobTitle: '', location: '', startDate: '', endDate: '', current: false, responsibilities: [''] }],
      education: [{ institution: '', degree: '', startDate: '', endDate: '', gpa: '' }],
      skills: [],
      projects: [{ name: '', role: '', technologies: '', description: '' }]
    };
  });

  const [skillInput, setSkillInput] = useState('');

  const calculatePercentage = () => {
    return calculateProfileScore(formData);
  };

  const percentage = calculatePercentage();

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    saveMasterCareerProfile(formData);
    toast.success('🎉 Master Career Profile saved and synced with Resume Builder! Welcome to your candidate suite.');
    navigate('/dashboard');
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(',', '');
      if (val && !formData.skills.some(s => s.name.toLowerCase() === val.toLowerCase())) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, { name: val, category: 'Technical', proficiency: 'Advanced', verified: true }]
        }));
        setSkillInput('');
      }
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col justify-center">
      
      {/* Progress & Header Card */}
      <div className="bg-[#0A1026] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Step {step} of 5 • Master Career Profile Setup</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              {step === 1 && "Personal Information & Contact"}
              {step === 2 && "Professional Summary & Target Role"}
              {step === 3 && "Work Experience & History"}
              {step === 4 && "Education & Academic Credentials"}
              {step === 5 && "Verified Skills & Technologies"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Build your single source of truth for all AI resume tailoring & JD matches.
            </p>
          </div>
        </div>


        {/* Live Animated Percentage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Profile Readiness Score:
            </span>
            <span className="font-extrabold text-primary font-mono text-sm">{percentage}%</span>
          </div>

          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Form Steps Card */}
      <div className="bg-[#080D1E] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.fullName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Target Role / Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.headline}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, headline: e.target.value }
                  }))}
                  placeholder="e.g. Senior Full Stack & AI Engineer"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.personalInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={formData.personalInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Location (City, Country)</label>
                <input
                  type="text"
                  value={formData.personalInfo.location}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                  }))}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">LinkedIn Profile</label>
                <input
                  type="text"
                  value={formData.personalInfo.linkedin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                  }))}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Professional Summary *</label>
              <textarea
                rows={6}
                value={formData.summary.primary}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  summary: { ...prev.summary, primary: e.target.value }
                }))}
                placeholder="Describe your background, technical expertise, and career impact..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-primary resize-y"
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {formData.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const updated = [...formData.experience];
                        updated[idx].jobTitle = e.target.value;
                        setFormData(prev => ({ ...prev, experience: updated }));
                      }}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Company Name</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...formData.experience];
                        updated[idx].company = e.target.value;
                        setFormData(prev => ({ ...prev, experience: updated }));
                      }}
                      placeholder="e.g. Google / TechCorp"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Step 4: Education */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-slate-300 font-medium">University / College</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[idx].institution = e.target.value;
                        setFormData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g. UC Berkeley"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[idx].degree = e.target.value;
                        setFormData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Graduation Year</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[idx].endDate = e.target.value;
                        setFormData(prev => ({ ...prev, education: updated }));
                      }}
                      placeholder="e.g. 2024"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Step 5: Skills */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Add Key Technical & Core Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill and press Enter (e.g. Python, Docker, React)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = skillInput.trim();
                    if (val && !formData.skills.some(s => s.name.toLowerCase() === val.toLowerCase())) {
                      setFormData(prev => ({
                        ...prev,
                        skills: [...prev.skills, { name: val, category: 'Technical', proficiency: 'Advanced', verified: true }]
                      }));
                      setSkillInput('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                {formData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-1.5"
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, sIdx) => sIdx !== idx) }))}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Skip Setup for now →
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2"
          >
            <span>{step === 5 ? 'Finish & Launch Platform' : 'Save & Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
