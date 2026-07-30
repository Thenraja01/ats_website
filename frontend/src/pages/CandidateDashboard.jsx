import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, TrendingUp, Loader2, Plus, History, BarChart3, ArrowUpRight, X, RefreshCw } from 'lucide-react';
import { resumeAPI } from '../services/api';
import { GlassCard, Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';

export default function CandidateDashboard() {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analysesRes] = await Promise.all([
        resumeAPI.getHistoryStats(),
        resumeAPI.getHistory(0, 10),
      ]);
      setStats(statsRes.data);
      setAnalyses(analysesRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
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
          <h1 className="text-3xl font-bold text-white font-heading mb-1">My Dashboard</h1>
          <p className="text-slate-400 text-sm">Track your ATS scores and application performance.</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> New Analysis
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: FileText, label: 'Resumes Analyzed', value: stats?.total_analyses || 0, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: TrendingUp, label: 'Average ATS Score', value: stats?.avg_score ? `${stats.avg_score}%` : '—', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Clock, label: 'Last Activity', value: stats?.last_activity ? formatDate(stats.last_activity) : 'No activity', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl !p-6 border-white/[0.06]"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Analyses */}
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
          {stats?.total_analyses > 10 && (
            <Link to="/candidate/analyses" className="text-sm text-primary hover:text-accent transition-colors">View All</Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No analyses yet</h3>
            <p className="text-slate-400 text-sm mb-6">Upload your first resume and job description to get started.</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4" /> Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Eligible</th>
                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Skills Matched</th>
                    <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {analyses.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      onClick={() => navigate(`/result/${item.id}`)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-sm text-slate-300">{formatDate(item.created_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                            item.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
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
                        <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
