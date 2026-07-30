import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import RevealOnScroll from '../components/animations/RevealOnScroll';
import TiltCard from '../components/animations/TiltCard';
import GradientText from '../components/animations/GradientText';
import { staggerContainer, fadeInUp } from '../constants/theme';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg mx-auto text-center py-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-4 font-heading">Message Sent!</h1>
        <p className="text-slate-400 mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div className="max-w-4xl mx-auto" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.section variants={fadeInUp} className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <MessageSquare className="w-4 h-4" />
          Get in Touch
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 font-heading">
          Let's{' '}
          <GradientText colors="from-primary via-accent to-accent">Talk</GradientText>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Have questions about HireMind AI? Want a custom enterprise plan? We'd love to hear from you.
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-20">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-4">
          {[
            { icon: Mail, title: 'Email', detail: 'hello@hiremind.ai', sub: 'We respond within 24 hours', color: 'from-primary to-blue-600' },
            { icon: MessageSquare, title: 'Live Chat', detail: 'Chat with our team', sub: 'Mon-Fri, 9AM-6PM EST', color: 'from-purple-500 to-pink-600' },
            { icon: MapPin, title: 'Location', detail: 'San Francisco, CA', sub: 'Remote-first team', color: 'from-pink-500 to-rose-600' },
          ].map((item, i) => (
            <RevealOnScroll key={item.title} direction="left" delay={i * 0.1}>
              <TiltCard className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-300" tiltDegree={3}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-slate-300 text-sm">{item.detail}</p>
                <p className="text-slate-500 text-xs mt-1">{item.sub}</p>
              </TiltCard>
            </RevealOnScroll>
          ))}

          <RevealOnScroll direction="left" delay={0.3}>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-lg font-bold text-white mb-2">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/features" className="block text-primary hover:text-accent text-sm transition-colors">Features</Link>
                <Link to="/pricing" className="block text-primary hover:text-accent text-sm transition-colors">Pricing</Link>
                <Link to="/signup" className="block text-primary hover:text-accent text-sm transition-colors">Create Account</Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Contact Form */}
        <RevealOnScroll direction="right" className="md:col-span-3">
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Name', type: 'text', key: 'name', placeholder: 'Your name' },
                { label: 'Email', type: 'email', key: 'email', placeholder: 'you@example.com' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-slate-400 mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="sales">Sales / Enterprise Plan</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                <Send className="w-4 h-4" />
                Send Message
              </motion.button>
            </form>
          </div>
        </RevealOnScroll>
      </div>
    </motion.div>
  );
}
