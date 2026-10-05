import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Briefcase, Calendar, Star, MapPin,
  ChevronRight, Sparkles, Loader2, Filter, Info, FileText, CheckCircle2
} from 'lucide-react';
import { candidateAPI } from '../services/api';
import { getApiErrorMessage } from '../utils';
import { GlassCard, Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';
import { toast } from 'sonner';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // Selected Job for Detailed View
  const [selectedJob, setSelectedJob] = useState(null);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumesLoading, setResumesLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState({});

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await candidateAPI.browseJobs({
        search: search || undefined,
        skill: skillFilter || undefined
      });
      setJobs(res.data);
      if (res.data.length > 0 && !selectedJob) {
        setSelectedJob(res.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch job postings. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Load previously applied jobs
    candidateAPI.getApplications().then(res => {
      const mappings = {};
      res.data.forEach(app => {
        if (app.job_id) {
          mappings[app.job_id] = {
            analysis_id: app.analysis_id,
            ats_score: app.ats_score
          };
        }
      });
      setAppliedJobs(mappings);
    }).catch(() => { });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const openApplyModal = async (job) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please log in to apply for this position.');
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
    setResumesLoading(true);
    try {
      const res = await candidateAPI.getResumes();
      setResumes(res.data || []);
      if (res.data?.length > 0) {
        setSelectedResumeId(res.data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load your resumes');
    } finally {
      setResumesLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume to apply.');
      return;
    }
    setApplying(true);
    try {
      const res = await candidateAPI.applyToJob(selectedJob.id, selectedResumeId);
      setAppliedJobs(prev => ({
        ...prev,
        [selectedJob.id]: {
          analysis_id: res.data.analysis_id,
          ats_score: res.data.ats_score
        }
      }));
      toast.success(`Successfully applied! Match Score: ${res.data.ats_score}%`);
      setShowApplyModal(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Application submission failed'));
    } finally {
      setApplying(false);
    }
  };

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary font-heading mb-2">Discover Career Openings</h1>
        <p className="text-slate-400 text-sm">Browse current openings and run AI resume matching instantly.</p>
      </div>

      {/* Search & Filter Controls */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="job-search-input"
            aria-label="Search jobs by title or keywords"
            placeholder="Search jobs by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary/5 border border-primary/10 rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              id="skill-filter-input"
              aria-label="Filter jobs by specific skill"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-primary/5 border border-primary/10 rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <GlowButton type="submit" id="search-submit-btn" aria-label="Submit search query">
            Find
          </GlowButton>
        </div>
      </form>

      {/* Main Browse Panel */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-12 text-center border-red-500/20">
          <Info className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <GlowButton onClick={() => navigate('/login')}>Go to Sign In</GlowButton>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border-primary/[0.06]">
          <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">No active jobs found</h3>
          <p className="text-slate-400 text-sm">Try broadening your search keywords or skill filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Jobs List (Left Col) */}
          <div className="lg:col-span-5 space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`glass p-5 rounded-2xl border transition-all cursor-pointer text-left ${selectedJob?.id === job.id
                    ? 'border-primary/50 bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-primary/[0.06] hover:border-primary/20'
                  }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-primary text-base leading-tight truncate">{job.title}</h3>
                  {appliedJobs[job.id] && (
                    <Badge color="success">Applied ({appliedJobs[job.id].ats_score}%)</Badge>
                  )}
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(job.required_skills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded bg-primary/5 text-slate-300 text-[10px]">
                      {skill}
                    </span>
                  ))}
                  {(job.required_skills || []).length > 3 && (
                    <span className="text-[10px] text-slate-500 py-0.5 px-1">
                      +{job.required_skills.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="flex items-center gap-0.5 text-primary hover:text-primary font-medium">
                    View Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Job Details Panel (Right Col) */}
          {selectedJob && (
            <div className="lg:col-span-7 glass rounded-2xl p-6 border-primary/[0.06] sticky top-24 space-y-6 text-left">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary font-heading leading-tight">{selectedJob.title}</h2>
                  <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Posted on {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {appliedJobs[selectedJob.id] ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold text-sm border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Applied ({appliedJobs[selectedJob.id].ats_score}%)
                    </span>
                    {appliedJobs[selectedJob.id].analysis_id && (
                      <Link
                        to={`/result/${appliedJobs[selectedJob.id].analysis_id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/25 border border-primary/30 text-primary hover:text-primary text-xs font-semibold hover:scale-105 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 text-primary" /> View AI Report
                      </Link>
                    )}
                  </div>
                ) : (
                  <GlowButton onClick={() => openApplyModal(selectedJob)}>
                    <Sparkles className="w-4 h-4" /> Match & Apply
                  </GlowButton>
                )}
              </div>

              <div className="border-t border-primary/[0.06] pt-4">
                <h3 className="text-sm font-semibold text-primary mb-2">Job Description</h3>
                <p className="text-slate-300 text-sm primaryspace-pre-line leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.required_skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">Required Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.required_skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">Key Responsibilities</h3>
                  <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                    {selectedJob.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.experience_required && (
                <div className="grid grid-cols-2 gap-4 bg-primary/[0.02] p-4 rounded-xl border border-primary/[0.06]">
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Experience Required</h4>
                    <p className="text-sm text-slate-200 mt-1 font-medium">{selectedJob.experience_required}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Education Required</h4>
                    <p className="text-sm text-slate-200 mt-1 font-medium">{selectedJob.education_required || 'Not Specified'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full rounded-2xl border border-primary/[0.08] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-primary/[0.06] flex items-center justify-between">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> AI Sift & Match
                </h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  id="close-apply-modal-btn"
                  aria-label="Close match and apply dialog"
                  className="p-1 rounded-lg hover:bg-primary/5 text-slate-400 hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-left">
                <p className="text-sm text-slate-300">
                  Select a stored resume. Our LLM pipeline will evaluate your match score before submitting your application.
                </p>

                {resumesLoading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-primary/10 text-center">
                    <p className="text-xs text-slate-400 mb-3">No resumes saved in your account.</p>
                    <GlowButton variant="secondary" onClick={() => {
                      setShowApplyModal(false);
                      navigate('/candidate-dashboard');
                    }}>
                      Upload Resume
                    </GlowButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Choose Resume</label>
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${selectedResumeId === resume.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-primary/10 bg-primary/[0.01] hover:bg-primary/5 text-slate-300'
                          }`}
                      >
                        <FileText className={`w-5 h-5 ${selectedResumeId === resume.id ? 'text-primary' : 'text-slate-500'}`} />
                        <div className="truncate flex-1">
                          <p className="text-xs font-semibold truncate leading-normal">{resume.original_filename}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-primary/[0.02] border-t border-primary/[0.06] flex justify-end gap-2">
                <button
                  onClick={() => setShowApplyModal(false)}
                  id="cancel-apply-btn"
                  aria-label="Cancel application"
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-primary text-sm font-medium"
                >
                  Cancel
                </button>
                <GlowButton
                  onClick={handleApply}
                  id="submit-apply-btn"
                  aria-label="Submit match and apply application"
                  disabled={applying || resumes.length === 0}
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Match & Applying...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </GlowButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Simple absolute replacement for standard close icon missing in imports
function X(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
