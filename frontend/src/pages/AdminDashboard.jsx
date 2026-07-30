import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, FileText, BarChart3, Loader2, 
  RefreshCw, TrendingUp, Trophy, Building2, X
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { GlassCard, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, candidatesRes, topRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getCandidates(),
        adminAPI.getTopCandidates(),
      ]);
      setStats(statsRes.data);
      setCandidates(candidatesRes.data);
      setTopCandidates(topRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-primary' },
    { label: 'Analyses Run', value: stats.total_analyses, icon: FileText, color: 'text-accent' },
    { label: 'Job Descriptions', value: stats.total_jobs, icon: Briefcase, color: 'text-emerald-400' },
    { label: 'Applications', value: stats.total_applications, icon: BarChart3, color: 'text-purple-400' },
  ] : [];

  return (
    <motion.div 
      className="max-w-7xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading mb-1">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Organization-wide analytics and user management.</p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl glass text-slate-400 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map(stat => (
          <GlassCard key={stat.label} className="!p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* All Candidates */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> All Candidates
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            {candidates.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No candidates registered yet.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {candidates.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent/50 flex items-center justify-center text-white font-bold text-xs">
                        {c.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{c.total_analyses} analyses</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Candidates */}
        <motion.div variants={fadeInUp}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Top Performers
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            {topCandidates.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No analysis data yet.</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {topCandidates.map((c, i) => (
                  <div key={c.user_id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-amber-700/20 text-amber-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{c.average_ats_score}%</p>
                      <p className="text-xs text-slate-500">{c.total_analyses} analyses</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
