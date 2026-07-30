import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BarChart, Users, Shield, Zap, Globe, FileText, Search, CheckCircle, Star, Sparkles, ArrowRight } from 'lucide-react';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import TiltCard from '../components/animations/TiltCard';
import GradientText from '../components/animations/GradientText';
import { staggerContainer, fadeInUp } from '../constants/theme';

const featureCategories = [
  {
    title: 'For Job Seekers',
    subtitle: 'Optimize your resume and land more interviews',
    color: 'from-primary to-blue-600',
    features: [
      { icon: FileText, name: 'AI Resume Parsing', desc: 'Upload any PDF or DOCX resume. Our NLP engine extracts skills, education, experience, and projects with 95%+ accuracy.' },
      { icon: BarChart, name: 'ATS Compatibility Scoring', desc: 'Get a 0-100 ATS score based on semantic matching. See exactly how your resume stacks up against any job description.' },
      { icon: Search, name: 'Skill Gap Analysis', desc: 'Identify missing keywords and skills the employer is looking for. Know exactly what to add to your resume.' },
      { icon: Zap, name: 'AI Improvement Suggestions', desc: 'Receive actionable suggestions to improve your resume. Our AI acts as your personal career coach.' },
      { icon: Star, name: 'Tailored Interview Questions', desc: 'Get 5 AI-generated interview questions based on the job requirements and your skill gaps.' },
      { icon: CheckCircle, name: 'History & Progress Tracking', desc: 'Track your ATS scores over time. See your resume improvements translate into better scores.' },
    ],
  },
  {
    title: 'For Recruiters & Organizations',
    subtitle: 'Streamline your hiring pipeline with AI',
    color: 'from-purple-500 to-pink-600',
    features: [
      { icon: Users, name: 'AI Candidate Ranking', desc: 'Automatically rank applicants by ATS score. See the best matches at the top instantly.' },
      { icon: Globe, name: 'Job Description Management', desc: 'Create, edit, and manage JDs. Use AI to optimize for maximum visibility.' },
      { icon: Shield, name: 'Role-Based Access Control', desc: 'Secure auth with Candidate, Recruiter, and Organization Admin roles.' },
      { icon: Brain, name: 'Smart Filtering', desc: 'Filter candidates by ATS score, skills, experience, and eligibility status.' },
      { icon: Sparkles, name: 'JD Optimization with AI', desc: 'Let AI analyze and improve your job descriptions. Make them inclusive and ATS-friendly.' },
      { icon: BarChart, name: 'Advanced Analytics', desc: 'Get insights into your hiring pipeline. Track volumes, scores, and time-to-hire.' },
    ],
  },
  {
    title: 'Platform Features',
    subtitle: 'Enterprise-grade infrastructure',
    color: 'from-pink-500 to-rose-600',
    features: [
      { icon: Globe, name: 'Career Page Integration', desc: 'Embed HireMind AI into your career page. Auto-analyze incoming resumes.' },
      { icon: Zap, name: 'Real-Time WebSocket Updates', desc: 'Get live progress during analysis. Instant notifications on application reviews.' },
      { icon: Shield, name: 'Security & Authentication', desc: 'JWT auth with bcrypt hashing. OTP email verification for secure signups.' },
      { icon: Brain, name: 'Llama 3 AI Pipeline', desc: 'Groq Llama 3.3-70B with 5-agent pipeline for analysis, scoring, and suggestions.' },
      { icon: FileText, name: 'RAG Knowledge Base', desc: 'ChromaDB + Google embeddings for intelligent Q&A about jobs.' },
      { icon: Users, name: 'Scalable Architecture', desc: 'FastAPI + MongoDB + React. Scales from individual to enterprise.' },
    ],
  },
];

export default function Features() {
  return (
    <motion.div className="max-w-6xl mx-auto" variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.section variants={fadeInUp} className="text-center py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Platform Features
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 font-heading">
          Powerful Features for{' '}
          <GradientText colors="from-primary via-accent to-accent">Smarter Hiring</GradientText>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Everything you need to analyze resumes, match candidates, and make data-driven hiring decisions — powered by AI.
        </p>
      </motion.section>

      {/* Feature Categories */}
      {featureCategories.map((category, ci) => (
        <RevealOnScroll key={category.title}>
          <section className="mb-20">
            <div className="text-center mb-10">
              <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${category.color} text-white text-sm font-medium mb-4`}>
                {category.title}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-heading">{category.title}</h2>
              <p className="text-slate-400">{category.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.features.map((f, fi) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: fi * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <TiltCard className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-300" tiltDegree={5}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{f.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </section>
        </RevealOnScroll>
      ))}

      {/* CTA */}
      <RevealOnScroll>
        <section className="text-center py-16 mb-12 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Ready to try these features?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Start with a free resume analysis — no account required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
              Try Free Analysis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
              View Pricing
            </Link>
          </div>
        </section>
      </RevealOnScroll>
    </motion.div>
  );
}
