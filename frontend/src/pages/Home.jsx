import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, FileText, BarChart, Users, Brain, Shield, Zap, CheckCircle, Star, ChevronRight, Server, Cloud, Lock, Globe, Bot, Workflow } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import TiltCard from '../components/animations/TiltCard';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import GradientText from '../components/animations/GradientText';
import Marquee from '../components/animations/Marquee';
import ScoreRing from '../components/animations/ScoreRing';
import { useTypewriter } from '../hooks/useAnimations';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: 'Resumes Analyzed', value: 10000, suffix: '+', icon: FileText },
  { label: 'ATS Accuracy', value: 95, suffix: '%', icon: BarChart },
  { label: 'Active Recruiters', value: 500, suffix: '+', icon: Users },
  { label: 'Time Saved', value: 70, suffix: '%', icon: Zap },
];

const steps = [
  { step: '01', title: 'Upload Resume & JD', desc: 'Upload your resume (PDF/DOCX) and paste the job description.', gradient: 'from-primary to-blue-600' },
  { step: '02', title: 'AI Analysis', desc: 'Our 5-agent Llama 3 pipeline analyzes, scores, and compares.', gradient: 'from-purple-500 to-pink-600' },
  { step: '03', title: 'Get Insights', desc: 'Receive a detailed ATS report with score and suggestions.', gradient: 'from-pink-500 to-rose-600' },
];

const features = [
  { icon: Brain, title: 'Resume Parsing', desc: 'Extract skills, education, experience with 95%+ accuracy.' },
  { icon: BarChart, title: 'ATS Scoring', desc: '0-100 compatibility score via semantic matching.' },
  { icon: Users, title: 'Candidate Ranking', desc: 'AI-powered ranking sorts by relevance.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Secure Candidate, Recruiter, Admin roles.' },
  { icon: Zap, title: 'AI Suggestions', desc: 'Personalized improvements and interview questions.' },
  { icon: Sparkles, title: 'Career Page API', desc: 'Embed AI analysis into your career page.' },
];

const trustedLogos = [
  'TechCorp', 'DataFlow', 'CloudBase', 'AI Labs', 'StackHive', 'NovaTech', 'Quantum', 'ByteForge',
];

export default function Home() {
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const particlesRef = useRef(null);
  const { displayText } = useTypewriter(['analyze resumes', 'match candidates', 'optimize hiring', 'screen faster'], {});

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const handleMouse = (e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // GSAP hero stagger
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const words = heading.querySelectorAll('.hero-word');
    gsap.fromTo(words, 
      { opacity: 0, y: 40, rotateX: -20 },
      {
        opacity: 1, y: 0, rotateX: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
        scrollTrigger: {
          trigger: heading,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, []);

  // Particles
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

      const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 140, 255, ${p.alpha})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(79, 140, 255, ${0.04 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="relative">
      {/* Particles canvas */}
      <canvas ref={particlesRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />

      {/* Hero */}
      <section
        ref={heroRef}
        onMouseMove={handleMouse}
        className="relative z-10 text-center py-28 md:py-36 overflow-hidden"
      >
        {/* Aurora blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Applicant Tracking System
          </motion.div>

          <h1 ref={headingRef} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight font-heading">
            <span className="hero-word inline-block">Hire</span>{' '}
            <span className="hero-word inline-block">Smarter.</span>
            <br />
            <span className="hero-word inline-block">
              <GradientText>Candidates Win Faster.</GradientText>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed"
          >
            Leverage Llama 3 AI to <span className="text-white font-medium">{displayText}</span>
            <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-slate-500 text-sm mb-10 max-w-2xl mx-auto"
          >
            Whether you&apos;re a job seeker optimizing your resume or a recruiter screening hundreds of applicants.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/upload"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 hover:shadow-primary/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Analyze Your Resume <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              to="/features"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-lg hover:bg-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Explore Features
            </Link>
            <Link
              to="/pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-slate-400 font-semibold text-lg hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              See Pricing
            </Link>
          </motion.div>
        </div>

        {/* Floating cards parallax */}
        <motion.div
          className="absolute top-20 right-10 hidden lg:block"
          style={{ x: useTransform(springX, [-0.5, 0.5], [-30, 30]), y: useTransform(springY, [-0.5, 0.5], [-20, 20]) }}
        >
          <div className="glass rounded-2xl p-4 w-48 border border-white/[0.06]">
            <ScoreRing score={92} size={100} strokeWidth={6} label="" />
            <p className="text-xs text-slate-400 text-center mt-2">Match Score</p>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-40 left-10 hidden lg:block"
          style={{ x: useTransform(springX, [-0.5, 0.5], [20, -20]), y: useTransform(springY, [-0.5, 0.5], [30, -30]) }}
        >
          <div className="glass rounded-2xl p-4 w-40 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-xs text-white font-medium">AI Analysis</span>
            </div>
            <div className="space-y-1">
              {['React', 'Python', 'AWS'].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted Companies Marquee */}
      <RevealOnScroll className="mb-24">
        <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-6">Trusted by teams at</p>
        <Marquee speed={25}>
          {trustedLogos.map((name) => (
            <div key={name} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Server className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-400 whitespace-nowrap">{name}</span>
            </div>
          ))}
        </Marquee>
      </RevealOnScroll>

      {/* Stats */}
      <RevealOnScroll className="mb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <TiltCard key={stat.label} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center group hover:border-primary/30 transition-all duration-300" tiltDegree={5}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-white font-heading">
                <AnimatedCounter to={stat.value} duration={2.5} suffix={stat.suffix || ''} />
              </h3>
              <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
            </TiltCard>
          ))}
        </div>
      </RevealOnScroll>

      {/* How It Works */}
      <RevealOnScroll className="mb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">How It Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Three simple steps to get your ATS compatibility score and AI-powered insights.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <RevealOnScroll key={s.step} delay={i * 0.15}>
              <TiltCard className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center group hover:border-primary/30 transition-all duration-300" tiltDegree={8}>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      {/* Features Grid */}
      <RevealOnScroll className="mb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Everything You Need</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Comprehensive AI-powered tools for both job seekers and recruitment teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <RevealOnScroll key={f.title} delay={i * 0.05}>
              <TiltCard className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-300" tiltDegree={5}>
                <motion.div
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <f.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      {/* Testimonials */}
      <RevealOnScroll className="mb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Trusted by Users</h2>
          <p className="text-slate-400 max-w-xl mx-auto">See how HireMind AI is transforming the hiring process.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { quote: 'The ATS score helped me identify exactly what keywords I was missing. Got an interview within a week!', name: 'Sarah K.', role: 'Software Engineer' },
            { quote: 'We reduced screening time by 70%. The AI ranking is incredibly accurate.', name: 'James R.', role: 'HR Manager' },
            { quote: 'The interview questions were surprisingly relevant. Felt like having a career coach.', name: 'Priya M.', role: 'Product Designer' },
          ].map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 0.1}>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic leading-relaxed text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent/50 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      {/* CTA */}
      <RevealOnScroll className="mb-24">
        <div className="max-w-4xl mx-auto text-center py-16 px-8 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Ready to Transform Your Hiring?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of users leveraging AI for smarter hiring decisions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-lg hover:bg-white/5 hover:border-white/20 transition-all hover:scale-105 active:scale-95"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
