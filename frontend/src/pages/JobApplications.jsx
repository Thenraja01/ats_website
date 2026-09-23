import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, Star, ExternalLink, Loader2, 
  RefreshCw, Check, X, Filter, Sparkles, TrendingUp, Upload, FileText
} from 'lucide-react';
import { recruiterAPI } from '../services/api';
import { getApiErrorMessage } from '../utils';
import { GlassCard, Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';
import { toast } from 'sonner';

export default function JobApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'batch'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Batch screen states
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruiterAPI.getApplications(id);
      setApplications(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load applications for this job'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApplications();
  }, [id]);

  const updateStatus = async (appId, status) => {
    try {
      await recruiterAPI.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Application updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleBatchFileChange = (e) => {
    if (e.target.files) {
      setBatchFiles(Array.from(e.target.files));
    }
  };

  const handleBatchScreen = async () => {
    if (batchFiles.length === 0) {
      toast.error('Please select at least one resume');
      return;
    }
    const formData = new FormData();
    batchFiles.forEach((file) => {
      formData.append('files', file);
    });

    setBatchLoading(true);
    try {
      const res = await recruiterAPI.batchScreen(id, formData);
      setBatchResults(res.data);
      toast.success('Batch resume screening complete!');
    } catch (err) {
      toast.error('Batch screening failed');
    } finally {
      setBatchLoading(false);
    }
  };

  const filteredApps = applications.filter(a => {
    return statusFilter === 'all' || a.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <button
        onClick={() => navigate('/recruiter-dashboard')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Recruiter Portal
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading mb-1">Applications Workspace</h1>
          <p className="text-slate-400 text-sm">Review candidate matches or sifting batches dynamically with AI.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchApplications}
            className="p-2.5 rounded-xl glass text-slate-400 hover:text-white transition-all w-fit"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Sub-Tabs */}
      <div className="flex gap-2 mb-6 glass rounded-xl p-1 w-fit border border-white/[0.06]">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'list' ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveSubTab('batch')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeSubTab === 'batch' ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Batch Sifter
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {['all', 'pending', 'shortlisted', 'rejected', 'hired'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                    statusFilter === s 
                      ? 'bg-primary/20 text-primary border border-primary/20 shadow-sm' 
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {s} ({s === 'all' ? applications.length : applications.filter(a => a.status === s).length})
                </button>
              ))}
            </div>

            {filteredApps.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border-white/[0.06]">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No applications found</h3>
                <p className="text-slate-400 text-sm">No candidates have applied to this job yet or match this filter.</p>
              </div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden border-white/[0.06]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
                        <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">ATS Score</th>
                        <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Eligibility</th>
                        <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Hiring Status</th>
                        <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Applied Date</th>
                        <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">View Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredApps.map((app) => (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent/50 flex items-center justify-center text-white font-bold text-sm">
                                {app.candidate_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{app.candidate_name || 'Unknown'}</p>
                                <p className="text-xs text-slate-500">{app.candidate_id?.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                                app.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                                app.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                                'bg-red-500/15 text-red-400'
                              }`}>
                                {app.ats_score}
                              </div>
                              {app.eligible && app.ats_score >= 80 && (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <Star className="w-3.5 h-3.5 fill-emerald-400" /> Top Match
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge color={app.eligible ? 'success' : 'warning'}>
                              {app.eligible ? 'Eligible' : 'Needs Review'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <select
                              value={app.status}
                              onChange={e => updateStatus(app.id, e.target.value)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg bg-[#0f172a] border font-medium capitalize focus:outline-none transition-all ${
                                app.status === 'hired' ? 'border-emerald-500/40 text-emerald-400' :
                                app.status === 'shortlisted' ? 'border-primary/40 text-primary' :
                                app.status === 'rejected' ? 'border-red-500/40 text-red-400' :
                                'border-white/10 text-slate-300'
                              }`}
                            >
                              <option value="pending" className="bg-[#0f172a] text-slate-300">Pending</option>
                              <option value="shortlisted" className="bg-[#0f172a] text-primary">Shortlisted</option>
                              <option value="rejected" className="bg-[#0f172a] text-red-400">Rejected</option>
                              <option value="hired" className="bg-[#0f172a] text-emerald-400">Hired</option>
                            </select>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-4 text-right">
                            {app.analysis_id ? (
                              <button
                                onClick={() => navigate(`/result/${app.analysis_id}`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/10 text-slate-300 hover:text-primary transition-all text-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Full Analysis
                              </button>
                            ) : (
                              <span className="text-xs text-slate-600">No report</span>
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
        ) : (
          <motion.div key="batch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Uploader Box */}
              <div className="glass rounded-2xl p-6 border-white/[0.06] flex flex-col h-fit">
                <h3 className="text-lg font-semibold text-white mb-2">1. Select Resumes</h3>
                <p className="text-slate-400 text-xs mb-4">Select up to 20 candidate resumes (PDF/DOCX/TXT) to scan concurrently against the active JD requirements.</p>
                
                <label className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer transition-all mb-4">
                  <Upload className="w-8 h-8 text-primary mb-2" />
                  <span className="text-xs text-white font-medium">Click to select files</span>
                  <input type="file" multiple accept=".pdf,.docx,.txt" onChange={handleBatchFileChange} className="hidden" />
                </label>

                {batchFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto mb-4 bg-white/5 p-2 rounded-xl border border-white/10">
                    {batchFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-300 text-xs truncate">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <GlowButton 
                  onClick={handleBatchScreen} 
                  disabled={batchFiles.length === 0 || batchLoading}
                >
                  {batchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sifting Resumes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Batch Sifter
                    </>
                  )}
                </GlowButton>
              </div>

              {/* Leaderboard Results */}
              <div className="md:col-span-2 glass rounded-2xl p-6 border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Sifting Match Leaderboard
                </h3>
                <p className="text-slate-400 text-xs mb-6">Concurrently analyzed resumes sorted by compatibility match score.</p>

                {batchResults.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                    No results. Select resumes and click "Run AI Batch Sifter" to view the ranking leaderboard.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {batchResults.map((r, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl gap-4 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 truncate">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-500/20 text-amber-400' :
                            i === 1 ? 'bg-slate-400/20 text-slate-300' :
                            i === 2 ? 'bg-amber-700/20 text-amber-600' :
                            'bg-primary/10 text-primary'
                          }`}>
                            #{i + 1}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">{r.candidate_name}</p>
                            <p className="text-xs text-slate-500 truncate">{r.filename}</p>
                          </div>
                        </div>
                        
                        {/* Score Indicator & Badges */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-wrap gap-1 mr-2">
                            {(r.extracted_skills || []).slice(0, 3).map((s, index) => (
                              <span key={index} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded">{s}</span>
                            ))}
                          </div>
                          
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            r.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                            r.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {r.ats_score}
                          </div>
                          
                          <Badge color={r.eligible ? 'success' : 'warning'}>
                            {r.eligible ? 'Eligible' : 'Needs Review'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

