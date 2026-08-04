import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, FileCheck, Briefcase, GraduationCap, Code, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import ScoreRing from '../components/animations/ScoreRing';
import { staggerContainer, fadeInUp } from '../constants/theme';

export default function AtsResult() {
  const [activeTab, setActiveTab] = useState('overview');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If result was passed via router state (e.g. from UploadResume), use it directly
    if (location.state?.result) {
      setResult(location.state.result);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API (requires authentication)
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await resumeAPI.getResult(id);
        setResult(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load analysis result');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[60vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center border-red-500/20">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Analysis Not Found</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
            <ArrowLeft className="w-4 h-4" /> Analyze Another Resume
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  const score = result.ats_score || 0;
  const isEligible = result.eligible;

  const scoreBars = [
    { label: 'Skill Match', pct: 50, value: Math.round((score / 100) * 50), icon: Code, color: 'bg-primary' },
    { label: 'Experience', pct: 25, value: Math.round((score / 100) * 25), icon: Briefcase, color: 'bg-purple-500' },
    { label: 'Projects', pct: 15, value: Math.round((score / 100) * 15), icon: FileCheck, color: 'bg-pink-500' },
    { label: 'Education', pct: 10, value: Math.round((score / 100) * 10), icon: GraduationCap, color: 'bg-accent' },
  ];

  const missingSkills = result.missing_skills || [];
  const matchedSkills = result.extracted_skills || [];
  const suggestions = result.suggestions || [];
  const interviewQuestions = result.interview_questions || [];

  return (
    <motion.div className="max-w-6xl mx-auto" variants={staggerContainer} initial="hidden" animate="visible">
      {/* Score Card */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/3 glass rounded-2xl p-8 flex flex-col items-center justify-center text-center border-white/[0.06]">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">ATS Match Score</h2>
          <div className="relative">
            <ScoreRing score={score} size={180} strokeWidth={10} />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
            className="mt-4"
          >
            {isEligible ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 font-medium text-sm border border-emerald-500/20">
                <CheckCircle className="w-4 h-4" /> Highly Eligible
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 font-medium text-sm border border-amber-500/20">
                <XCircle className="w-4 h-4" /> Needs Improvement
              </span>
            )}
          </motion.div>
        </div>

        {/* Score Breakdown */}
        <div className="w-full md:w-2/3 glass rounded-2xl p-8 border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white mb-6">Score Breakdown</h2>
          <div className="space-y-5">
            {scoreBars.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + scoreBars.indexOf(item) * 0.1 }}
              >
                <div className="flex justify-between mb-1.5">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <item.icon className="w-4 h-4 text-primary" /> {item.label} ({item.pct}%)
                  </span>
                  <span className="text-sm text-white font-medium">{item.value} / {item.pct}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-2 rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.pct) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + scoreBars.indexOf(item) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="glass rounded-2xl overflow-hidden border-white/[0.06]">
        <div className="flex border-b border-white/[0.06]">
          {['overview', 'suggestions', 'interview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === tab ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.length > 0 ? matchedSkills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                      >
                        {skill}
                      </motion.span>
                    )) : <p className="text-slate-400 text-sm">No specific skills extracted.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-400" /> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.length > 0 ? missingSkills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
                      >
                        {skill}
                      </motion.span>
                    )) : <p className="text-slate-400 text-sm">No missing skills detected! Great match.</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {suggestions.length > 0 ? suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex gap-4 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="mt-1"><ChevronRight className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h4 className="font-medium text-white">{suggestion}</h4>
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-slate-400">No suggestions needed, your resume looks solid.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'interview' && (
              <motion.div
                key="interview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <p className="text-slate-400 mb-6 text-sm">AI generated these questions based on the gaps and matches between your resume and the JD.</p>
                {interviewQuestions.length > 0 ? interviewQuestions.map((q, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 transition-all"
                  >
                    <h4 className="font-medium text-primary mb-2 text-sm">Q{index + 1}:</h4>
                    <p className="text-slate-300 text-sm">{q}</p>
                  </motion.div>
                )) : (
                  <p className="text-slate-400">No specific interview questions generated.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
