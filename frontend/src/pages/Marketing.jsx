import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, BarChart, Users, FileText, CheckCircle, Globe, Brain, Bot, Workflow } from 'lucide-react';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import TiltCard from '../components/animations/TiltCard';
import GradientText from '../components/animations/GradientText';
import { staggerContainer, fadeInUp } from '../constants/theme';

const stats = [
  { label: 'Resumes Analyzed', value: '10K+', icon: FileText },
  { label: 'ATS Score Accuracy', value: '95%', icon: BarChart },
  { label: 'Active Recruiters', value: '500+', icon: Users },
  { label: 'Time Saved', value: '70%', icon: Zap },
];

const features = [
  { icon: Brain, title: 'AI Resume Analysis', desc: 'Llama 3 powered parsing extracts skills, experience, education with 95% accuracy.' },
  { icon: BarChart, title: 'ATS Compatibility Scoring', desc: 'Instant match scores based on semantic resume-to-JD comparison.' },
  { icon: Users, title: 'Candidate Ranking', desc: 'AI-powered ranking sorts applicants by relevance, saving hours of manual screening.' },
  { icon: Globe, title: 'Career Page Integration', desc: 'Embed HireMind into your career page for automatic applicant analysis.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Secure authentication with Candidate, Recruiter, and Admin roles.' },
  { icon: Zap, title: 'Real-Time Updates', desc: 'WebSocket-powered live updates on analysis progress and application status.' },
];

const steps = [
  { step: '01', title: 'Upload Resume & JD', desc: 'Upload a PDF/DOCX resume and paste the job description.' },
  { step: '02', title: 'AI Analysis', desc: 'Our 5-agent AI pipeline analyzes, scores, and compares your resume against the JD.' },
  { step: '03', title: 'Get Insights', desc: 'Receive a detailed report with ATS score, missing skills, suggestions, and interview questions.' },
];

export default function Marketing() {
  return (
    <motion.div className="max-w-6xl mx-auto" variants={staggerContainer} initial="hidden" animate="visible">
      {/* Hero */}
      <motion.section variants={fadeInUp} className="text-center py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Hiring
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 font-heading">
          Hire Smarter with{' '}
          <GradientText colors="from-primary via-accent to-accent">HireMind AI</GradientText>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10">
          The intelligent Applicant Tracking System that uses Llama 3 AI to analyze resumes, match candidates, and automate recruitment workflows.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/upload" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
            Try Free Analysis <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
            Create Account <Zap className="w-5 h-5" />
          </Link>
        </div>
      </motion.section>

      {/* Stats */}
      <RevealOnScroll>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-300">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </section>
      </RevealOnScroll>

      {/* Features */}
      <RevealOnScroll>
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12 font-heading">Everything You Need to Hire Better</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-300" tiltDegree={5}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* How it works */}
      <RevealOnScroll>
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12 font-heading">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* CTA */}
      <RevealOnScroll>
        <section className="text-center py-16 mb-12 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Ready to Transform Your Hiring?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of companies using HireMind AI to find the best talent faster.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </RevealOnScroll>
    </motion.div>
  );
}
