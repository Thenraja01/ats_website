import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Lock, CheckCircle } from 'lucide-react';

export default function TermsModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-[#0A1026] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h2>
                <p className="text-xs text-slate-400">HireMind AI Platform • Last updated: September 2026</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/[0.08] px-6 bg-black/20">
            <button
              onClick={() => setActiveTab('terms')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'terms'
                  ? 'border-primary text-white bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'privacy'
                  ? 'border-primary text-white bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Privacy Policy & Data Security
            </button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[55vh] custom-scrollbar">
            {activeTab === 'terms' ? (
              <>
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> 1. Acceptance of Terms
                  </h3>
                  <p>
                    By registering, accessing, or utilizing the HireMind AI platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our platform.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> 2. User Accounts & Authenticity
                  </h3>
                  <p>
                    You agree to provide accurate, current, and complete career information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that take place under your account.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> 3. AI Resume & Job Matching Guidelines
                  </h3>
                  <p>
                    HireMind AI uses artificial intelligence and algorithmic models to evaluate resumes, provide ATS scores, and generate targeted career content based strictly on your Master Career Profile. We explicitly prohibit the automated invention or fabrication of unverified credentials, work history, or academic degrees.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> 4. Intellectual Property
                  </h3>
                  <p>
                    You retain 100% ownership of the original text, resumes, and portfolio content you upload or compose. You grant HireMind AI a non-exclusive license solely to process, analyze, and render your documents in accordance with your explicit instructions.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> 5. Service Availability & Termination
                  </h3>
                  <p>
                    We reserve the right to modify or discontinue any part of the service with or without notice. Accounts engaging in abusive scraping, credential stuffing, or violation of applicable employment laws may be suspended immediately.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1. Data Collection & Use
                  </h3>
                  <p>
                    We collect personal information such as your name, email, career history, education, skills, and resume documents strictly to provide AI-powered resume building, ATS evaluation, and recruiter matching features.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Enterprise-Grade Encryption
                  </h3>
                  <p>
                    All uploaded resumes and career records are encrypted both in transit (TLS 1.3) and at rest (AES-256). We never sell your personal data or resumes to third-party data brokers.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. AI Model Training Privacy
                  </h3>
                  <p>
                    Your personal resume documents and sensitive contact records are confidential and are NOT used to train public LLM models without your explicit opt-in consent.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 4. Data Retention & Deletion
                  </h3>
                  <p>
                    You have full sovereignty over your data. You may export your master career profile or request the complete deletion of all your resumes and analytics history at any time from your account settings.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GDPR & CCPA Compliant Security</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-md"
            >
              I Understand & Accept
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
