import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, TrendingUp, FileText, Loader2, Plus, 
  Search, Filter, Star, X, Check, Clock, RefreshCw, 
  ExternalLink, ChevronDown, MoreHorizontal, PieChart as PieIcon, BarChart3 
} from 'lucide-react';
import { recruiterAPI, resumeAPI } from '../services/api';
import { getApiErrorMessage } from '../utils';
import { GlassCard, Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function RecruiterPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, jobsRes, analyticsRes] = await Promise.all([
        recruiterAPI.getAllApplications(),
        recruiterAPI.getJobs(),
        recruiterAPI.getAnalytics(),
      ]);
      setApplications(appsRes.data);
      setJobs(jobsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load data'));
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
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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

      {/* Analytics Tab */}
      {tab === 'analytics' && analytics && (
        <motion.div variants={fadeInUp} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score Distribution Card */}
            <div className="glass rounded-2xl p-6 border border-white/[0.06] flex flex-col h-[320px]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">ATS Score Distribution</h3>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.score_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Application Status Card */}
            <div className="glass rounded-2xl p-6 border border-white/[0.06] flex flex-col h-[320px]">
              <div className="flex items-center gap-2 mb-4">
                <PieIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">Applications by Status</h3>
              </div>
              <div className="flex-1 w-full min-h-0 relative">
                {analytics.status_breakdown && analytics.status_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.status_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {analytics.status_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">No applications data</div>
                )}
              </div>
            </div>

            {/* Applications per Job Card */}
            <div className="glass rounded-2xl p-6 border border-white/[0.06] flex flex-col h-[320px]">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-white">Top Jobs by Applications</h3>
              </div>
              <div className="flex-1 w-full min-h-0">
                {analytics.applications_per_job && analytics.applications_per_job.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.applications_per_job} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis dataKey="job" type="category" stroke="#64748b" fontSize={8} width={80} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Bar dataKey="applications" fill="#34d399" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">No active postings</div>
                )}
              </div>
            </div>

          </div>

          {/* Overview summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Recruitment Funnel</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Eligible Candidates</span>
                    <span>{analytics.eligible_count} / {analytics.total_applications}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-1.5 rounded-full" 
                      style={{ width: `${analytics.total_applications ? (analytics.eligible_count / analytics.total_applications) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Average ATS Quality Score</span>
                    <span>{analytics.avg_ats_score}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${analytics.avg_ats_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Status Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-2xl font-bold text-white">{analytics.total_jobs}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Jobs</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-2xl font-bold text-white">{analytics.total_applications}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Received Applications</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
