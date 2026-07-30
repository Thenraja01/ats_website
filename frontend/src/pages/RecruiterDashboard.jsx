import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, TrendingUp, FileText, Loader2, Plus, 
  Search, Filter, Star, X, Check, Clock, RefreshCw, 
  ExternalLink, ChevronDown, MoreHorizontal 
} from 'lucide-react';
import { recruiterAPI, resumeAPI } from '../services/api';
import { GlassCard, Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';
import { useNavigate } from 'react-router-dom';

export default function RecruiterPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        recruiterAPI.getAllApplications(),
        recruiterAPI.getJobs(),
      ]);
      setApplications(appsRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (appId, status) => {
    try {
      await recruiterAPI.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter(a => {
    const matchesSearch = a.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total_applications: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired: applications.filter(a => a.status === 'hired').length,
    avg_score: applications.length ? Math.round(applications.reduce((s, a) => s + a.ats_score, 0) / applications.length) : 0,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center border-red-500/20">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <GlowButton onClick={fetchData}>
            <RefreshCw className="w-4 h-4" /> Retry
          </GlowButton>
        </div>
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
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading mb-1">Recruiter Portal</h1>
          <p className="text-slate-400 text-sm">Manage candidates, jobs, and AI-powered rankings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl glass text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> New Job
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total_applications, icon: FileText, color: 'text-primary' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: Star, color: 'text-emerald-400' },
          { label: 'Hired', value: stats.hired, icon: Check, color: 'text-accent' },
          { label: 'Avg ATS Score', value: `${stats.avg_score}%`, icon: TrendingUp, color: 'text-purple-400' },
        ].map(stat => (
          <GlassCard key={stat.label} className="!p-5">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="flex gap-1 mb-6 glass rounded-xl p-1 w-fit">
        {[
          { id: 'applications', label: 'Applications', icon: Users },
          { id: 'jobs', label: 'Job Descriptions', icon: Briefcase },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Applications Tab */}
      {tab === 'applications' && (
        <motion.div variants={fadeInUp}>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search candidates or jobs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'shortlisted', 'rejected', 'hired'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    statusFilter === s 
                      ? 'bg-primary/20 text-primary border border-primary/20' 
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          {filteredApps.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No applications found</h3>
              <p className="text-slate-400 text-sm">Create a job description to start receiving applications.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Job</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">ATS Score</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Applied</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
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
                        <td className="p-4 text-sm text-slate-300">{app.job_title || 'N/A'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              app.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                              app.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                              'bg-red-500/15 text-red-400'
                            }`}>
                              {app.ats_score}
                            </div>
                            {app.eligible && app.ats_score >= 80 && <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={app.status}
                            onChange={e => updateStatus(app.id, e.target.value)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium capitalize focus:outline-none focus:border-primary/30"
                          >
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/result/${app.analysis_id}`)}
                            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
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

      {/* Jobs Tab */}
      {tab === 'jobs' && (
        <motion.div variants={fadeInUp}>
          {jobs.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No job descriptions yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first job description to start screening candidates.</p>
              <Link
                to="/recruiter/jobs/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/25"
              >
                <Plus className="w-4 h-4" /> Create Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <GlassCard key={job.id} glow className="!p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {job.required_skills?.length || 0} skills · {job.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <Badge color={job.is_active ? 'success' : 'warning'}>{job.is_active ? 'Active' : 'Draft'}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.required_skills || []).slice(0, 5).map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">{skill}</span>
                    ))}
                    {(job.required_skills?.length || 0) > 5 && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs">+{job.required_skills.length - 5}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/recruiter/jobs/${job.id}/applications`}
                      className="flex-1 text-center py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      View Applications
                    </Link>
                    <Link
                      to={`/recruiter/jobs/${job.id}/edit`}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
