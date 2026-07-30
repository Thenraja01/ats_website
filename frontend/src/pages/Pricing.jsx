import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import TiltCard from '../components/animations/TiltCard';
import GradientText from '../components/animations/GradientText';
import { staggerContainer, fadeInUp } from '../constants/theme';

const plans = [
  {
    name: 'Free',
    subtitle: 'For job seekers exploring the platform',
    price: '$0',
    period: 'forever',
    highlight: false,
    features: [
      { name: '1 resume analysis per day', included: true },
      { name: 'ATS compatibility score', included: true },
      { name: 'Skill gap analysis', included: true },
      { name: 'AI improvement suggestions', included: true },
      { name: 'Interview questions generation', included: true },
      { name: 'Analysis history', included: false },
      { name: 'Multiple resume management', included: false },
      { name: 'Real-time WebSocket updates', included: false },
      { name: 'Career page integration', included: false },
    ],
    cta: 'Try Free', ctaLink: '/upload',
  },
  {
    name: 'Candidate Pro',
    subtitle: 'For serious job seekers',
    price: '$9',
    period: '/month',
    highlight: true,
    features: [
      { name: 'Unlimited resume analyses', included: true },
      { name: 'ATS compatibility score', included: true },
      { name: 'Skill gap analysis', included: true },
      { name: 'AI improvement suggestions', included: true },
      { name: 'Interview questions generation', included: true },
      { name: 'Full analysis history', included: true },
      { name: 'Multiple resume management', included: true },
      { name: 'Score tracking over time', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Get Started', ctaLink: '/signup',
  },
  {
    name: 'Recruiter',
    subtitle: 'For hiring teams and organizations',
    price: '$49',
    period: '/month',
    highlight: false,
    features: [
      { name: 'Everything in Candidate Pro', included: true },
      { name: 'Job description management', included: true },
      { name: 'AI-powered JD optimization', included: true },
      { name: 'Candidate ranking by ATS score', included: true },
      { name: 'Smart filtering & search', included: true },
      { name: 'Application management', included: true },
      { name: 'Role-based access control', included: true },
      { name: 'Career page integration', included: true },
      { name: 'Real-time WebSocket updates', included: true },
    ],
    cta: 'Contact Sales', ctaLink: '/contact',
  },
];

const comparisonTable = [
  { feature: 'Resume Analysis', free: '1/day', pro: 'Unlimited', recruiter: 'Unlimited' },
  { feature: 'ATS Score', free: true, pro: true, recruiter: true },
  { feature: 'Skill Gap Analysis', free: true, pro: true, recruiter: true },
  { feature: 'AI Suggestions', free: true, pro: true, recruiter: true },
  { feature: 'Interview Questions', free: true, pro: true, recruiter: true },
  { feature: 'Analysis History', free: '7 days', pro: 'Unlimited', recruiter: 'Unlimited' },
  { feature: 'Multiple Resumes', free: false, pro: true, recruiter: true },
  { feature: 'JD Management', free: false, pro: false, recruiter: true },
  { feature: 'Candidate Ranking', free: false, pro: false, recruiter: true },
  { feature: 'Career Page API', free: false, pro: false, recruiter: true },
  { feature: 'Team Members', free: '1', pro: '1', recruiter: 'Up to 10' },
];

export default function Pricing() {
  const renderCell = (val) => {
    if (val === true) return <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />;
    if (val === false) return <X className="w-5 h-5 text-slate-600 mx-auto" />;
    return <span className="text-sm text-slate-300">{val}</span>;
  };

  return (
    <motion.div className="max-w-6xl mx-auto" variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.section variants={fadeInUp} className="text-center py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Simple, Transparent Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 font-heading">
          Plans That Fit{' '}
          <GradientText colors="from-primary via-accent to-accent">Your Needs</GradientText>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Start free and upgrade as you grow. No hidden fees, no surprises.
        </p>
      </motion.section>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-primary/10 to-accent/5 border-primary/30 shadow-xl shadow-primary/10 scale-105'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-primary/30'
              }`}
              tiltDegree={4}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{plan.subtitle}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-slate-400 ml-1">{plan.period}</span>
              </div>
              <Link
                to={plan.ctaLink}
                className={`block text-center py-3 rounded-xl font-semibold mb-8 transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f.name} className="flex items-start gap-3">
                    {f.included ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
                    )}
                    <span className={f.included ? 'text-slate-300' : 'text-slate-500'}>{f.name}</span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      <RevealOnScroll>
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8 font-heading">Compare Plans</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="p-4 text-slate-300 font-medium">Feature</th>
                  <th className="p-4 text-slate-300 font-medium text-center">Free</th>
                  <th className="p-4 text-primary font-medium text-center">Candidate Pro</th>
                  <th className="p-4 text-slate-300 font-medium text-center">Recruiter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {comparisonTable.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-white">{row.feature}</td>
                    <td className="p-4 text-center">{renderCell(row.free)}</td>
                    <td className="p-4 text-center">{renderCell(row.pro)}</td>
                    <td className="p-4 text-center">{renderCell(row.recruiter)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </RevealOnScroll>

      {/* CTA */}
      <RevealOnScroll>
        <section className="text-center py-16 mb-12 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Need a custom plan?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">We offer enterprise plans for larger organizations with custom requirements.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
            Contact Us <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </RevealOnScroll>
    </motion.div>
  );
}
