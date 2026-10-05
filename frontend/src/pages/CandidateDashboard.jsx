import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, TrendingUp, Loader2, Plus, History,
  BarChart3, ArrowUpRight, X, RefreshCw, Upload, Trash2,
  Briefcase, CheckCircle2, Star, ExternalLink, File,
  Download, Copy, Sparkles, User, ShieldCheck
} from 'lucide-react';
import { resumeAPI, candidateAPI } from '../services/api';
import { getApiErrorMessage } from '../utils';
import { GlassCard, Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';
import { toast } from 'sonner';
import {
  getMasterCareerProfile,
  calculateProfileScore,
  SYNC_EVENT_NAME
} from '../services/careerProfileSync';

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState('analyses');
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profileScore, setProfileScore] = useState(() => calculateProfileScore(getMasterCareerProfile()));
  const [loading, setLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cover Letter Generator States
  const [selectedResumeForLetter, setSelectedResumeForLetter] = useState('');
  const [jobTitleForLetter, setJobTitleForLetter] = useState('');
  const [jdForLetter, setJdForLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analysesRes, resumesRes, appsRes] = await Promise.all([
        resumeAPI.getHistoryStats().catch(() => ({ data: null })),
        resumeAPI.getHistory(0, 10).catch(() => ({ data: [] })),
        candidateAPI.getResumes().catch(() => ({ data: [] })),
        candidateAPI.getApplications().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setAnalyses(analysesRes.data || []);
      setResumes(resumesRes.data || []);
      setApplications(appsRes.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setProfileScore(calculateProfileScore(getMasterCareerProfile()));

    const handleProfileSync = () => {
      setProfileScore(calculateProfileScore(getMasterCareerProfile()));
    };

    window.addEventListener(SYNC_EVENT_NAME, handleProfileSync);
    return () => window.removeEventListener(SYNC_EVENT_NAME, handleProfileSync);
  }, []);


  // Auto-set the first resume for cover letter once resumes are loaded
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeForLetter) {
      setSelectedResumeForLetter(resumes[0].id);
    }
  }, [resumes]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingResume(true);
    try {
      await candidateAPI.uploadResume(formData);
      toast.success('Resume uploaded successfully to locker!');
      // Reload resumes list
      const resumesRes = await candidateAPI.getResumes();
      setResumes(resumesRes.data || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload resume'));
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await candidateAPI.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted successfully');
      if (selectedResumeForLetter === id) {
        setSelectedResumeForLetter('');
      }
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeForLetter || !jobTitleForLetter || !jdForLetter) {
      toast.error('Please select a resume, enter job title and job description.');
      return;
    }
    const resumeObj = resumes.find(r => r.id === selectedResumeForLetter);
    if (!resumeObj) return;

    setGeneratingLetter(true);
    setGeneratedLetter('');
    try {
      const res = await candidateAPI.generateCoverLetter({
        resume_text: resumeObj.text,
        job_title: jobTitleForLetter,
        job_description: jdForLetter
      });
      setGeneratedLetter(res.data.cover_letter);
      toast.success('Cover letter generated successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate cover letter.'));
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleDownloadLetter = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover-Letter-${jobTitleForLetter.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center border-red-500/20">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">Failed to Load</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <GlowButton onClick={fetchData}><RefreshCw className="w-4 h-4" /> Retry</GlowButton>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading mb-1">Candidate Portal</h1>
          <p className="text-slate-400 text-sm">Manage your resumes, track ATS scores, and monitor job applications.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchData} className="p-2.5 rounded-xl glass text-slate-400 hover:text-primary transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-sm font-semibold hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-accent" /> Resume Builder
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-slate-300 hover:text-primary hover:bg-primary/10 text-sm font-semibold hover:scale-105 active:scale-95 transition-all"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Analysis
          </Link>
        </div>
      </motion.div>

      {/* Master Career Profile Readiness Banner */}
      <motion.div variants={fadeInUp} className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0C142E] via-[#0A1026] to-[#0D1838] border border-primary/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-base font-heading shrink-0 shadow-inner">
            {profileScore}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-primary">Master Career Profile Readiness</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${profileScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                {profileScore >= 80 ? 'Verified & Ready' : 'Setup Incomplete'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {profileScore >= 80
                ? 'Your verified profile is active as the single source of truth for all AI resume tailoring and JD matching.'
                : 'Complete your initial profile setup wizard to unlock 100% accurate, zero-hallucination AI resume generation.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/onboarding"
            className="px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 text-slate-200 hover:text-primary text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Setup Wizard</span>
          </Link>
          <Link
            to="/career-profile"
            className="px-4 py-2 rounded-xl bg-primary text-primary text-xs font-semibold shadow-md shadow-primary/25 hover:bg-primary/90 flex items-center gap-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: FileText, label: 'Resumes Analyzed', value: stats?.total_analyses || analyses.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: TrendingUp, label: 'Average ATS Score', value: stats?.avg_score ? `${stats.avg_score}%` : '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Briefcase, label: 'Active Applications', value: applications.length, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass rounded-2xl !p-6 border-primary/[0.06]"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-6 glass rounded-xl p-1 w-fit border border-primary/[0.06]">
        {[
          { id: 'analyses', label: 'ATS Scans', icon: BarChart3 },
          { id: 'resumes', label: `Resume Locker (${resumes.length})`, icon: FileText },
          { id: 'applications', label: `Job Applications (${applications.length})`, icon: Briefcase },
          { id: 'coverletter', label: 'Cover Letter Generator', icon: File },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-primary'
              }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Tab 1: ATS Scans */}
      {activeTab === 'analyses' && (
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Recent Analyses</h2>
            {analyses.length > 5 && (
              <Link to="/candidate/analyses" className="text-sm text-primary hover:text-accent transition-colors">View All History</Link>
            )}
          </div>

          {analyses.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border-primary/[0.06]">
              <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No analyses yet</h3>
              <p className="text-slate-400 text-sm mb-6">Upload your first resume and job description to get started.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary text-sm font-semibold shadow-lg shadow-primary/25"
              >
                <Plus className="w-4 h-4" /> Analyze Resume
              </Link>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden border-primary/[0.06]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-primary/[0.06]">
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Eligible</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Skills Matched</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/[0.06]">
                    {analyses.map((item, i) => (
                      <tr
                        key={item.id}
                        onClick={() => navigate(`/result/${item.id}`)}
                        className="hover:bg-primary/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="p-4 text-sm text-slate-300">{formatDate(item.created_at)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${item.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                                item.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                                  'bg-red-500/15 text-red-400'
                              }`}>
                              {item.ats_score}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge color={item.eligible ? 'success' : 'warning'}>
                            {item.eligible ? 'Eligible' : 'Needs Work'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(item.extracted_skills || []).slice(0, 3).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">{s}</span>
                            ))}
                            {(item.missing_skills?.length || 0) > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs">{item.missing_skills.length} gaps</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-2 rounded-lg hover:bg-primary/5 text-slate-400 hover:text-primary transition-all">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 2: Resume Locker */}
      {activeTab === 'resumes' && (
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary">Resume Locker</h2>
            <div className="relative">
              <input
                type="file"
                id="locker-file-upload"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
              />
              <label
                htmlFor="locker-file-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 hover:border-primary text-primary hover:text-primary text-xs font-semibold cursor-pointer transition-all ${uploadingResume ? 'opacity-50 pointer-events-none' : ''
                  }`}
              >
                {uploadingResume ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" /> Upload Resume
                  </>
                )}
              </label>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border-primary/[0.06]">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">Locker is empty</h3>
              <p className="text-slate-400 text-sm">Upload resumes here so you can reuse them to apply for jobs matching your compatibility.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map(r => (
                <GlassCard key={r.id} className="!p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary truncate max-w-[200px] sm:max-w-[300px]" title={r.original_filename}>
                        {r.original_filename}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Uploaded {formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteResume(r.id)}
                    className="p-2 rounded-lg bg-primary/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-primary/5 hover:border-red-500/20"
                    title="Remove from locker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Job Applications */}
      {activeTab === 'applications' && (
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Submitted Job Applications</h2>
            <span className="text-xs text-slate-500">{applications.length} applied</span>
          </div>

          {applications.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center border-primary/[0.06]">
              <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No active applications</h3>
              <p className="text-slate-400 text-sm mb-6">You haven&apos;t applied to any job listings yet.</p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary text-sm font-semibold shadow-lg shadow-primary/25"
              >
                Browse open jobs <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden border-primary/[0.06]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-primary/[0.06]">
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Match Score</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Applied Date</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/[0.06]">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-medium text-primary">{app.job_title || 'Position Application'}</p>
                          <p className="text-xs text-slate-500">ID: {app.id.slice(-6)}</p>
                        </td>
                        <td className="p-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${app.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                              app.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                                'bg-red-500/15 text-red-400'
                            }`}>
                            {app.ats_score}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${app.status === 'hired' ? 'bg-accent/20 text-accent border border-accent/30' :
                              app.status === 'shortlisted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          {app.analysis_id ? (
                            <button
                              onClick={() => navigate(`/result/${app.analysis_id}`)}
                              className="p-2 rounded-lg hover:bg-primary/5 text-slate-400 hover:text-primary transition-all"
                              title="View match analysis"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 4: Cover Letter Generator */}
      {activeTab === 'coverletter' && (
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-primary">Generate Cover Letter</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Select Resume</label>
                {resumes.length === 0 ? (
                  <p className="text-xs text-amber-400">Please upload a resume in the "Resume Locker" tab first.</p>
                ) : (
                  <select
                    value={selectedResumeForLetter}
                    onChange={(e) => setSelectedResumeForLetter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-primary/15 text-slate-300 focus:outline-none focus:border-primary/40 transition-all text-xs cursor-pointer"
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.original_filename}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitleForLetter}
                  onChange={(e) => setJobTitleForLetter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary placeholder-slate-500 focus:outline-none focus:border-primary/40 transition-all text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Job Description Requirements</label>
                <textarea
                  rows={6}
                  placeholder="Paste the job description or requirement details here to tailor the cover letter..."
                  value={jdForLetter}
                  onChange={(e) => setJdForLetter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-primary placeholder-slate-500 focus:outline-none focus:border-primary/40 transition-all text-xs resize-none"
                />
              </div>

              <GlowButton
                onClick={handleGenerateCoverLetter}
                disabled={generatingLetter || resumes.length === 0}
                className="w-full py-3 mt-2 text-xs"
              >
                {generatingLetter ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Tailoring Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate tailored letter
                  </>
                )}
              </GlowButton>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary">Generated Cover Letter</h2>
              {generatedLetter && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLetter);
                      toast.success('Copied to clipboard!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-slate-400 hover:text-primary transition-colors text-xs font-semibold"
                  >
                    Copy text
                  </button>
                  <button
                    onClick={handleDownloadLetter}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:text-primary transition-colors text-xs font-semibold"
                  >
                    Download .txt
                  </button>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 border border-primary/[0.06] min-h-[350px] flex flex-col justify-start relative">
              {generatingLetter ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050816]/40 backdrop-blur-sm rounded-2xl">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-slate-400">Our AI is parsing your matching skills to draft a highly tailored cover letter...</p>
                </div>
              ) : null}

              {generatedLetter ? (
                <pre className="text-slate-300 text-xs font-sans primaryspace-pre-wrap leading-relaxed">
                  {generatedLetter}
                </pre>
              ) : !generatingLetter ? (
                <div className="flex flex-col items-center justify-center h-full my-auto text-slate-500 py-12">
                  <FileText className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-xs">Your generated cover letter will appear here.</p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
