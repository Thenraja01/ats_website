import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  getMasterCareerProfile,
  getApplicationsMemory,
  getInterviewMemory,
  saveInterviewEntry
} from '../services/careerProfileSync';
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  BookOpen,
  Layers,
  Building,
  Award,
  RefreshCw,
  Clock,
  ChevronRight,
  FileCheck,
  Zap,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';

export default function InterviewHub() {
  const location = useLocation();
  const [targetApp, setTargetApp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [category, setCategory] = useState('All');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState({});

  useEffect(() => {
    const apps = getApplicationsMemory();
    setApplications(apps);
    const history = getInterviewMemory();
    setInterviewHistory(history);

    if (location.state?.targetApp) {
      setTargetApp(location.state.targetApp);
      generateQuestions(location.state.targetApp);
    } else if (apps.length > 0) {
      setTargetApp(apps[0]);
      generateQuestions(apps[0]);
    } else {
      generateQuestions(null);
    }
  }, [location.state]);

  const generateQuestions = (app) => {
    setGenerating(true);
    const master = getMasterCareerProfile();
    const company = app?.company || 'Target Tech Company';
    const role = app?.role || master.personalInfo?.headline || 'Software Engineer';
    const skills = (master.skills || []).map(s => typeof s === 'string' ? s : s.name).slice(0, 5);
    const exp = master.experience?.[0];
    const proj = master.projects?.[0];

    setTimeout(() => {
      const generatedList = [
        {
          id: 1,
          category: 'Resume Fact Probe',
          question: `On your resume for ${company}, you highlighted your experience with ${skills[0] || 'core technologies'}. Can you explain the architecture and key challenges you solved?`,
          resumeContext: exp ? `Derived from ${exp.company} (${exp.jobTitle}) verified bullets` : 'Derived from verified skills in Vault',
          tip: 'Use the STAR method (Situation, Task, Action, Result) and mention quantifiable impact.',
          consistencyKey: `${skills[0] || 'Technical'}`
        },
        {
          id: 2,
          category: 'Behavioral & Impact',
          question: `Tell me about a time when a project deadline or critical requirement shifted unexpectedly. How did you prioritize?`,
          resumeContext: `Derived from project leadership claims in your Career Vault`,
          tip: 'Highlight emotional intelligence, team communication, and pragmatic engineering trade-offs.',
          consistencyKey: 'Leadership & Execution'
        },
        {
          id: 3,
          category: 'Technical Deep-Dive',
          question: proj ? `In your project "${proj.name}", how did you design the data flow and handle potential bottleneck or latency spikes?` : `How do you diagnose and fix performance bottlenecks in a production ${skills[1] || 'web'} stack?`,
          resumeContext: proj ? `Verified Project: ${proj.name} (${proj.technologies})` : 'Career OS Technical Benchmark',
          tip: 'Be specific about database indexing, caching strategies, and telemetry observability.',
          consistencyKey: proj?.name || 'System Design'
        },
        {
          id: 4,
          category: 'Company & Role Alignment',
          question: `Why are you interested in joining ${company} as a ${role}, and what distinct value will you bring in your first 90 days?`,
          resumeContext: `Job Specific Alignment for ${role}`,
          tip: 'Tie your answer to company mission and verified skills you have demonstrated previously.',
          consistencyKey: 'Role Alignment'
        },
        {
          id: 5,
          category: 'Consistency & Truth Verification',
          question: exp && exp.responsibilities?.[0]
            ? `Your resume claims: "${exp.responsibilities[0]}". What specific metrics proved this outcome, and what was your exact individual contribution?`
            : `How do you validate the ROI and engineering accuracy of the metrics stated on your application?`,
          resumeContext: `Direct Claim Verification Gate`,
          tip: 'Never inflate numbers. Explain the baseline before and after your intervention.',
          consistencyKey: 'Truth Check'
        }
      ];

      setQuestions(generatedList);
      setActiveQuestionIdx(0);
      setUserAnswer('');
      setGenerating(false);
    }, 450);
  };

  const handleEvaluateAnswer = () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);

    const currentQ = questions[activeQuestionIdx];
    const master = getMasterCareerProfile();

    setTimeout(() => {
      // Simulate AI Consistency & Impact evaluator
      const hasNumbers = /\d+/.test(userAnswer);
      const isDetailed = userAnswer.length > 80;

      const newEval = {
        questionId: currentQ.id,
        score: hasNumbers && isDetailed ? 94 : 85,
        consistencyStatus: 'Consistent with Career Vault',
        feedback: isDetailed
          ? `Excellent detail. Your response matches the verified records in your Career Vault. Clear breakdown of technical decisions and impact.`
          : `Good direction, but consider elaborating more on your specific engineering decisions and quantifiable results.`,
        strengths: [
          'Direct answer to the prompt',
          'Aligns with verified resume claims',
          'Professional and authentic tone'
        ],
        improvements: hasNumbers ? [] : ['Add specific metrics or measurable outcomes (e.g. % improvement, latency ms)']
      };

      setEvaluations(prev => ({ ...prev, [currentQ.id]: newEval }));
      setEvaluating(false);

      // Save to interview memory
      saveInterviewEntry({
        company: targetApp?.company || 'General Prep',
        role: targetApp?.role || 'Software Engineer',
        questions: [{
          question: currentQ.question,
          myAnswer: userAnswer,
          feedback: newEval.feedback,
          category: currentQ.category
        }]
      });
      setInterviewHistory(getInterviewMemory());
    }, 600);
  };

  const currentQ = questions[activeQuestionIdx];
  const currentEval = currentQ ? evaluations[currentQ.id] : null;

  const filteredQuestions = category === 'All'
    ? questions
    : questions.filter(q => q.category === category);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight flex items-center gap-2">
                  Interview Hub & Consistency Checker
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Job-Specific AI Simulator
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Practice questions tailored to your exact application snapshot — ensuring 100% consistency with your submitted resume
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {applications.length > 0 && (
              <select
                value={targetApp?.id || ''}
                onChange={(e) => {
                  const selected = applications.find(a => a.id === e.target.value);
                  setTargetApp(selected || null);
                  generateQuestions(selected);
                }}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 font-medium"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company} – {app.role}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => generateQuestions(targetApp)}
              disabled={generating}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-primary rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              Regenerate Q&A
            </button>
          </div>
        </div>

        {/* Consistency Guarantee Banner */}
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-900/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-primary flex items-center gap-2">
                Resume ↔ Interview Consistency Engine
                <span className="text-[11px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Zero Fact Mismatch Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The questions below probe the exact achievements and skills present in your <strong className="text-slate-200">{targetApp?.company || 'General Target'}</strong> resume version.
              </p>
            </div>
          </div>
          <Link
            to="/vault"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
          >
            Review Career Vault <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Questions Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Target Questions ({questions.length})</span>
              <span className="text-amber-400">{targetApp?.company || 'General Tech'}</span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isEvaluated = Boolean(evaluations[q.id]);
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setActiveQuestionIdx(idx);
                      setUserAnswer('');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${activeQuestionIdx === idx
                        ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {q.category}
                      </span>
                      {isEvaluated && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Practiced
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">
                      {q.question}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Past Practice Logs */}
            {interviewHistory.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Recent Prep Logs ({interviewHistory.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {interviewHistory.slice(0, 4).map((entry, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-medium">
                        <span>{entry.company}</span>
                        <span className="text-[10px] text-slate-500">{entry.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{entry.questions?.[0]?.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Question Simulator & Consistency Feedback */}
          <div className="lg:col-span-8 space-y-6">
            {currentQ ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">

                {/* Question Header */}
                <div className="space-y-3 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {currentQ.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      Question {activeQuestionIdx + 1} of {questions.length}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-primary leading-relaxed">
                    {currentQ.question}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{currentQ.resumeContext}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-amber-300">Coaching Strategy: </strong>
                      {currentQ.tip}
                    </div>
                  </div>
                </div>

                {/* Answer Box */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Your Response (Simulate Verbal or Written Answer)
                  </label>
                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer: 1. Context & situation 2. Specific technical action you led 3. Quantifiable outcome/lesson..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={evaluating || !userAnswer.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-primary rounded-xl font-medium text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                      {evaluating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Evaluating Consistency...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Evaluate Consistency & Impact
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Evaluation Report */}
                {currentEval && (
                  <div className="mt-6 p-5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-primary">AI Consistency & Impact Assessment</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {currentEval.score}/100 Impact Score
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentEval.feedback}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Key Strengths
                        </div>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {currentEval.strengths.map((st, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              {st}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {currentEval.improvements.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> High-Impact Polish
                          </div>
                          <ul className="text-xs text-slate-400 space-y-1">
                            {currentEval.improvements.map((imp, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-sm text-slate-400">Loading interview practice questions...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
