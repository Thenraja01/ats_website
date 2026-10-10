import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  UploadCloud,
  FileText,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Code2,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/icons/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { resumeAPI } from '../services/api';
import { saveMasterCareerProfile } from '../services/careerProfileSync';

const POPULAR_SKILLS = [
  'React',
  'Python',
  'Node.js',
  'TypeScript',
  'FastAPI',
  'Docker',
  'AWS',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'System Design',
  'Tailwind CSS',
];

const EXPERIENCE_LEVELS = [
  { id: 'entry', label: 'Entry Level', desc: '0 - 2 years' },
  { id: 'mid', label: 'Mid-Level', desc: '2 - 5 years' },
  { id: 'senior', label: 'Senior', desc: '5 - 8 years' },
  { id: 'lead', label: 'Staff / Lead', desc: '8+ years' },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth?.user);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(authUser?.name || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [location, setLocation] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSkip = () => {
    toast.info('Onboarding skipped. You can update your profile anytime in Workspace.');
    navigate('/resume-studio');
  };

  const handleAddSkill = (skillName) => {
    const trimmed = (skillName || skillInput).trim().replace(',', '');
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (toRemove) => {
    setSkills((prev) => prev.filter((s) => s !== toRemove));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setResumeFile(file);
      toast.success(`Attached ${file.name}`);
    }
  };

  const handleFinish = async () => {
    try {
      setIsUploading(true);

      // 1. If candidate attached a resume, upload to MinIO
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        try {
          await resumeAPI.upload(formData);
          toast.success('Resume uploaded and synced to your storage!');
        } catch (uploadErr) {
          console.warn('Resume auto-upload warning:', uploadErr);
        }
      }

      // 2. Persist master profile
      const companiesList = targetCompanies
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      saveMasterCareerProfile({
        personalInfo: {
          fullName: fullName.trim(),
          headline: targetRole.trim(),
          email: email.trim(),
          location: location.trim(),
        },
        summary: {
          primary: targetRole ? `Targeting ${targetRole} positions with focus on ${skills.slice(0, 4).join(', ')}.` : '',
          targetRoles: targetRole ? [targetRole] : [],
        },
        skills: skills.map((s) => ({
          name: s,
          category: 'Technical',
          proficiency: 'Advanced',
          verified: true,
        })),
        experience: [],
        education: [],
        projects: [],
      });

      toast.success('🎉 Welcome to HireMind AI! Your workspace is ready.');
      navigate('/resume-studio');
    } catch (e) {
      toast.error('Could not complete setup. Redirecting to workspace...');
      navigate('/resume-studio');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* ── Top Header with Brand & Prominent SKIP Button ── */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HireMind AI Logo" className="size-8 object-contain" />
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-base tracking-tight text-foreground">
                HireMind <span className="text-primary">AI</span>
              </span>
              <span className="text-[11px] text-muted-foreground block -mt-0.5">
                Resume Tailoring &amp; Preparation
              </span>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-primary'
                    : step > s
                    ? 'w-2 bg-primary/60'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground font-medium ml-2">
              Step {step} of 3
            </span>
          </div>

          {/* Skip Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            Skip to Workspace <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* ── Main Step Content ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl mx-auto py-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Target Career & Role */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs mb-2">
                    <Compass className="size-3 mr-1" /> Career Direction
                  </Badge>
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    What role are you targeting?
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    HireMind AI uses your target role to benchmark ATS match scores and research real interview patterns.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullname" className="text-xs font-semibold">Your Full Name</Label>
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="target-role" className="text-xs font-semibold">Target Job Title *</Label>
                    <Input
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer, Full Stack Developer, ML Engineer"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <Label className="text-xs font-semibold">Experience Level</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setExperienceLevel(lvl.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            experienceLevel === lvl.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/60 bg-background/50 hover:border-primary/40 text-muted-foreground'
                          }`}
                        >
                          <p className="text-xs font-semibold leading-tight">{lvl.label}</p>
                          <p className="text-[10px] opacity-75 mt-0.5">{lvl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="location" className="text-xs font-semibold">Preferred Location / Remote</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote / New York, NY / London"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" onClick={handleSkip} className="text-xs text-muted-foreground">
                    Skip onboarding
                  </Button>
                  <Button
                    onClick={() => {
                      if (!targetRole.trim()) {
                        toast.error('Please specify your target job role.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-primary text-white"
                  >
                    Next: Core Skills <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Core Skills & Stack */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs mb-2">
                    <Code2 className="size-3 mr-1" /> Technical Profile
                  </Badge>
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    What are your primary skills?
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add the technologies you want highlighted on tailored resumes and tested in mock interviews.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="skill-input" className="text-xs font-semibold">Add Skills (Press Enter)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skill-input"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Type a skill (e.g. Go, GraphQL, Kubernetes) and press Enter"
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleAddSkill()}
                        disabled={!skillInput.trim()}
                      >
                        <Plus className="size-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>

                  {/* Selected Skills Chips */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-xs py-1 px-2.5 flex items-center gap-1.5"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Quick Suggestions */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">Quick suggestions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((pop) => (
                        <button
                          key={pop}
                          type="button"
                          onClick={() => handleAddSkill(pop)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-border/60 bg-background/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                        >
                          <Plus className="size-2.5" /> {pop}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="text-xs">
                    <ArrowLeft className="size-4 mr-1.5" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-primary text-white">
                    Next: Target Companies &amp; Resume <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Target Companies & Resume */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs mb-2">
                    <Building2 className="size-3 mr-1" /> Final Kickoff
                  </Badge>
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    Target Companies &amp; Resume Kickoff
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optionally attach an existing resume to auto-seed your Career Vault and MinIO document storage.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="companies" className="text-xs font-semibold">Target Companies / Organizations (Optional)</Label>
                    <Input
                      id="companies"
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      placeholder="e.g. Google, Amazon, Stripe, Fintech Startups"
                    />
                    <p className="text-[11px] text-muted-foreground">Used by the Celery agent to research current interview questions.</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <Label className="text-xs font-semibold">Upload Existing Resume (Optional)</Label>
                    <label
                      htmlFor="resume-upload"
                      className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-background/40 hover:bg-muted/30 transition-all text-center"
                    >
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {resumeFile ? (
                        <div className="flex items-center gap-2 text-primary font-medium text-xs">
                          <FileText className="size-5 text-primary" />
                          <span>{resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="size-7 text-muted-foreground mb-1.5" />
                          <span className="text-xs font-semibold text-foreground">
                            Click to browse or drag and drop
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            PDF, DOCX, or TXT (Max 5MB)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="text-xs">
                    <ArrowLeft className="size-4 mr-1.5" /> Back
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={isUploading}
                    className="bg-primary text-white shadow-md hover:opacity-95"
                  >
                    <Sparkles className="size-4 mr-1.5" />
                    {isUploading ? 'Setting up Workspace...' : 'Finish & Open Workspace'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-border/30 py-3 text-center text-[11px] text-muted-foreground">
        HireMind AI • Single Source of Truth for ATS Evaluation &amp; Interview Preparation
      </footer>
    </div>
  );
}
