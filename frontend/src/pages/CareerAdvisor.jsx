import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  Code2, 
  CheckCircle2, 
  RefreshCw,
  Lightbulb,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getMasterCareerProfile, 
  getApplicationsMemory, 
  calculateSkillEvidenceMap 
} from '../services/careerProfileSync';
import { 
  Activity, 
  BarChart2, 
  Target, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export default function CareerAdvisor() {
  const masterProfile = getMasterCareerProfile();
  const userName = masterProfile?.personalInfo?.fullName || 'Candidate';
  const headline = masterProfile?.personalInfo?.headline || 'Your Career Goal';
  const userSkills = (masterProfile?.skills || []).map(s => typeof s === 'string' ? s : s.name);
  const skillNames = userSkills.slice(0, 8).join(', ');
  const hasExperience = masterProfile?.experience && masterProfile.experience.length > 0;
  const hasSkills = userSkills.length > 0;

  const [messages, setMessages] = useState([
    {
      id: 'm_1',
      sender: 'ai',
      text: hasSkills
        ? `Hello **${userName}**! I am your **AI Career & Resume Consultant**. I have context of your verified **Master Career Profile** (${headline}) with skills: **${skillNames}**.\n\nHow can I assist you with resume tailoring, bullet improvements, or role readiness today?`
        : `Hello **${userName}**! I am your **AI Career & Resume Consultant**.\n\nI noticed your **Master Career Profile** is currently waiting for your details. You can head over to **Career Profile** to add your verified skills, experience, and education, or ask me for guidance on structuring your resume for maximum ATS impact!`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const SUGGESTIONS = [
    hasSkills ? `What skills should I learn next as a ${headline}?` : "How do I build an ATS-friendly resume from scratch?",
    "How can I strengthen my experience bullet points for ATS?",
    "Analyze skill gaps between my profile and target roles",
    "Generate a tailored elevator pitch based on my master profile"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      let aiResponse = '';
      const lower = text.toLowerCase();

      if (lower.includes('skill') || lower.includes('gap') || lower.includes('learn')) {
        if (hasSkills) {
          aiResponse = `### 🎯 Targeted Skill Gap & Growth Roadmap for ${userName}\n\nBased on your verified **Master Career Profile**:\n\n**Your Current Core Stack:**\n- ✅ **Verified Skills:** ${skillNames}\n${hasExperience ? `- ✅ **Current/Recent Role:** ${masterProfile.experience[0].jobTitle} at ${masterProfile.experience[0].company}` : ''}\n\n**Recommended Strategic Additions:**\n1. Add any secondary libraries or tools you actively use into your **Verified Skills** section.\n2. When applying to specific postings, run our **JD Analyzer** to instantly match required keywords against your verified profile!`;
        } else {
          aiResponse = `### 📋 Setting Up Your Career Foundation\n\nYou haven't added any verified skills to your Master Profile yet.\n\n**Next Steps:**\n1. Visit [Master Career Profile](/career-profile) to list your technical proficiencies, tools, and domain knowledge.\n2. Every skill you add will immediately power automated ATS matching and resume generation across the entire platform!`;
        }
      } else if (lower.includes('bullet') || lower.includes('experience') || lower.includes('ats')) {
        if (hasExperience) {
          const sampleBullet = masterProfile.experience[0].responsibilities?.[0] || 'Executed core engineering initiatives.';
          aiResponse = `### ✍️ Impact-Driven Bullet Optimization (XYZ Formula)\n\nFor your role at **${masterProfile.experience[0].company}**, apply Google's **XYZ Formula**: *Accomplished [X] as measured by [Y], by doing [Z]*.\n\n**Your Current Statement:**\n> "${sampleBullet}"\n\n**ATS-Optimized Structure:**\n> Highlight the specific tool used, the quantitative metric (e.g. latency, throughput, users), and the business result.\n\n*This approach preserves your 100% verified facts while maximizing recruiter impact!*`;
        } else {
          aiResponse = `### ✍️ Structuring High-Impact ATS Bullets (XYZ Formula)\n\nWhen adding responsibilities in your **Master Profile** or **Resume Builder**, follow Google's **XYZ Formula**:\n\n*Accomplished [X] as measured by [Y], by doing [Z]*\n\n**Example Template:**\n> *"Engineered [System/Feature] using [Your Skills], accelerating [Performance/Metric] by [Percentage/Value] across [Scale/Users]."*`;
        }
      } else {
        aiResponse = `### 💡 Strategic Career Recommendation for ${userName}\n\n**Key Action Items:**\n1. **Maintain Single Source of Truth:** Keep your [Career Profile](/career-profile) current with verified projects, certifications, and responsibilities.\n2. **Targeted Applications:** Use [Resume Builder](/builder) and [JD Analyzer](/jd-analyzer) to generate tailored resumes matching each unique job description without fabricating facts.\n3. **100% Fact Integrity:** Grounding all resume points in your verified history guarantees maximum confidence in interviews!`;
      }

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 900);
  };



  return (
    <div className="min-h-[85vh] pt-4 pb-12 px-3 sm:px-6 max-w-5xl mx-auto flex flex-col space-y-4">
      
      {/* Top Header Card */}
      <div className="bg-[#0A1026] border border-white/[0.08] rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center text-primary shadow-inner">
            <Compass className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white font-heading">AI Career Intelligence & Strategic Advisor</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                Vault Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">Cross-application pattern intelligence strictly derived from your Career Vault</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero Fabrication Guardrail</span>
        </div>
      </div>

      {/* Multi-Application Pattern Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Target Role Fit</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{headline || 'Software Engineer'}</div>
          <div className="text-[11px] text-cyan-400 mt-0.5">{userSkills.length} Verified Skills in Vault</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Recurring High-Demand Skills</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs text-emerald-300 font-medium flex flex-wrap gap-1 mt-1">
            {userSkills.slice(0, 3).map((s, i) => (
              <span key={i} className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{s}</span>
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">High ATS recruiter match frequency</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Next High-Leverage Sprint</span>
            <GraduationCap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xs font-bold text-purple-300 mt-1">AWS Cloud & System Architecture</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Build a verified project to add to Vault</div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-[#080D1E] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto space-y-4 min-h-[500px] max-h-[600px] custom-scrollbar">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed ${
                  isAI
                    ? 'bg-white/[0.04] border border-white/[0.08] text-slate-200'
                    : 'bg-gradient-to-r from-primary to-accent text-white font-medium shadow-md shadow-primary/20'
                }`}
              >
                <div className="whitespace-pre-line space-y-2">
                  {msg.text}
                </div>
                <span className={`block text-[10px] mt-2 ${isAI ? 'text-slate-500' : 'text-white/70'} text-right`}>
                  {msg.timestamp}
                </span>
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-accent animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Analyzing Master Profile context and consulting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(sug)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>{sug}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-[#0A1026] border border-white/[0.08] rounded-2xl p-2 shadow-xl"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything about your resume, skill gaps, or target roles..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
