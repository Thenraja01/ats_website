import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, History, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react';
import { resumeAPI } from '../services/api';
import { getApiErrorMessage } from '../utils';
import { Badge, GlowButton } from '../components/ui/GlassCard';
import { staggerContainer, fadeInUp } from '../constants/theme';

export default function CandidateAnalyses() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeAPI.getHistory(0, 50);
      setAnalyses(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load analysis history'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
      <button
        onClick={() => navigate('/candidate-dashboard')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading mb-1">Analysis History</h1>
          <p className="text-slate-400 text-sm">Review all your previous resume scans and feedback reports.</p>
        </div>
        <button onClick={fetchHistory} className="p-2.5 rounded-xl glass text-slate-400 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border-white/[0.06]">
          <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No analyses found</h3>
          <p className="text-slate-400 text-sm mb-6">Scan your first resume to see your score progression.</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg shadow-primary/25"
          >
            Analyze Resume
          </Link>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">ATS Score</th>
                  <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Extracted Skills</th>
                  <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">View Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {analyses.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/result/${item.id}`)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-sm text-slate-300">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                        item.ats_score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                        item.ats_score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {item.ats_score}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge color={item.eligible ? 'success' : 'warning'}>
                        {item.eligible ? 'Eligible' : 'Needs Work'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(item.extracted_skills || []).slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
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
  );
}
