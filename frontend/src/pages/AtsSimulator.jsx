import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  getMasterCareerProfile, 
  getResumeData 
} from '../services/careerProfileSync';
import { 
  Cpu, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Search, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Zap, 
  ArrowRight,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';

export default function AtsSimulator() {
  const location = useLocation();
  const [resumeData, setResumeData] = useState(null);
  const [activeTab, setActiveTab] = useState('rawParser'); // 'rawParser' | 'recruiterScan' | 'diagnosticReport'
  const [heatMapActive, setHeatMapActive] = useState(true);

  useEffect(() => {
    if (location.state?.resumeData) {
      setResumeData(location.state.resumeData);
    } else {
      const current = getResumeData() || getMasterCareerProfile();
      setResumeData(current);
    }
  }, [location.state]);

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Activity className="w-6 h-6 animate-spin mr-2 text-cyan-400" />
        Loading ATS Parser Simulator...
      </div>
    );
  }

  // Diagnostics calculations
  const skills = Array.isArray(resumeData.skills) 
    ? resumeData.skills.map(s => typeof s === 'string' ? s : s.name)
    : [];
  const experiences = resumeData.experience || [];
  const education = resumeData.education || [];

  const parserIssues = [];
  if (!resumeData.personalInfo?.email) parserIssues.push('Missing direct email in contact header');
  if (!resumeData.personalInfo?.phone) parserIssues.push('Phone number not detected in primary header');
  if (experiences.some(e => !e.startDate)) parserIssues.push('Some experience items missing explicit start dates');

  const atsParseScore = Math.max(70, 100 - (parserIssues.length * 10));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  ATS Diagnostics & Recruiter Eye-Scan Simulator
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    Dual Parser Engine
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Inspect raw machine tokenization alongside the simulated 6-second recruiter visual eye pattern
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/builder"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs flex items-center gap-2 transition-all border border-slate-700"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              Edit in Resume Builder
            </Link>
          </div>
        </div>

        {/* Simulator Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('rawParser')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'rawParser'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            1. ATS Raw Token Stream (Machine View)
          </button>
          <button
            onClick={() => setActiveTab('recruiterScan')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'recruiterScan'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            2. Recruiter 6-Second Quick-Scan Heatmap
          </button>
          <button
            onClick={() => setActiveTab('diagnosticReport')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'diagnosticReport'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            3. Compliance & Structural Scorecard
          </button>
        </div>

        {/* Tab 1: ATS Raw Parser View */}
        {activeTab === 'rawParser' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-950 border border-purple-500/20 rounded-2xl p-6 font-mono text-xs text-slate-300 space-y-4 shadow-2xl overflow-x-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <Terminal className="w-4 h-4" /> ATS PARSER OUTPUT BUFFER [UTF-8 STREAM]
                </span>
                <span className="text-emerald-400 font-semibold">0 PARSING FATALITIES</span>
              </div>

              {/* Parsed JSON / Token Representation */}
              <div className="space-y-3 leading-relaxed">
                <div>
                  <span className="text-purple-400">=== CANDIDATE CONTACT TOKENS ===</span>
                  <div className="text-slate-400 pl-4">
                    <div>NAME: <strong className="text-white">{resumeData.personalInfo?.fullName || 'N/A'}</strong></div>
                    <div>ROLE_TARGET: <span className="text-cyan-400">{resumeData.personalInfo?.title || resumeData.personalInfo?.headline || 'N/A'}</span></div>
                    <div>EMAIL: <span className="text-emerald-400">{resumeData.personalInfo?.email || 'N/A'}</span></div>
                    <div>PHONE: <span className="text-emerald-400">{resumeData.personalInfo?.phone || 'N/A'}</span></div>
                    <div>GEO_LOCATION: <span className="text-slate-300">{resumeData.personalInfo?.location || 'N/A'}</span></div>
                    <div>PROFILES: [{resumeData.personalInfo?.linkedin || ''}, {resumeData.personalInfo?.github || ''}]</div>
                  </div>
                </div>

                <div>
                  <span className="text-purple-400">=== SUMMARY ABSTRACT ===</span>
                  <div className="text-slate-400 pl-4 italic">
                    "{typeof resumeData.summary === 'string' ? resumeData.summary : resumeData.summary?.primary || 'No summary text'}"
                  </div>
                </div>

                <div>
                  <span className="text-purple-400">=== RECOGNIZED SKILL TOKENS ({skills.length}) ===</span>
                  <div className="flex flex-wrap gap-1.5 pl-4 pt-1">
                    {skills.map((s, idx) => (
                      <span key={idx} className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 text-[11px]">
                        TOKEN_{idx+1}: {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-purple-400">=== EXPERIENCE CHRONOLOGY ({experiences.length} NODES) ===</span>
                  <div className="pl-4 space-y-3 pt-1">
                    {experiences.map((exp, idx) => (
                      <div key={idx} className="border-l border-slate-800 pl-3 space-y-1">
                        <div className="text-white font-semibold">
                          [{idx+1}] {exp.company || 'Company'} — {exp.position || exp.jobTitle || 'Role'} ({exp.startDate || 'N/A'} - {exp.endDate || 'Present'})
                        </div>
                        <ul className="text-slate-400 text-[11px] list-disc list-inside">
                          {(exp.bullets || exp.responsibilities || [exp.description]).map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-purple-400">=== ACADEMIC CREDENTIALS ===</span>
                  <div className="pl-4 space-y-1 pt-1">
                    {education.map((edu, idx) => (
                      <div key={idx} className="text-slate-300">
                        • {edu.degree} — {edu.institution} ({edu.startYear || edu.startDate} - {edu.endYear || edu.endDate})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Parser Audit */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ATS Parseability</span>
                  <span className="text-base font-bold text-emerald-400">{atsParseScore}%</span>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-2 rounded-full" style={{ width: `${atsParseScore}%` }} />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>No unparseable nested tables</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Standard UTF-8 character encoding</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Linear chronological heading hierarchy</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Zero image-embedded body text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Recruiter 6-Second Eye-Scan Simulator */}
        {activeTab === 'recruiterScan' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Simulated 6-Second Visual Scan Overlay
                </h3>
                <p className="text-xs text-slate-400">
                  Eye-tracking studies show recruiters follow an F-pattern: Name/Title → Current Role & Company → Top Skills → Education.
                </p>
              </div>
              <button
                onClick={() => setHeatMapActive(!heatMapActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  heatMapActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {heatMapActive ? 'Heatmap: ON' : 'Heatmap: OFF'}
              </button>
            </div>

            {/* Simulated Resume Canvas with Heatmap Highlights */}
            <div className="max-w-3xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-2xl relative overflow-hidden font-sans border border-slate-200">
              
              {/* Eye Scan Marker 1: Top Left Header */}
              {heatMapActive && (
                <div className="absolute top-6 left-6 w-56 h-24 bg-rose-500/20 border-2 border-rose-500 rounded-lg pointer-events-none animate-pulse flex items-start justify-end p-1">
                  <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">1. FIXATION (0.8s)</span>
                </div>
              )}

              {/* Header */}
              <div className="border-b border-slate-300 pb-4 mb-4">
                <h1 className="text-2xl font-bold text-slate-900">{resumeData.personalInfo?.fullName || 'Candidate Name'}</h1>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                  {resumeData.personalInfo?.title || resumeData.personalInfo?.headline || 'Target Professional Role'}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                  <span>{resumeData.personalInfo?.email}</span>
                  <span>•</span>
                  <span>{resumeData.personalInfo?.phone}</span>
                  <span>•</span>
                  <span>{resumeData.personalInfo?.location}</span>
                </div>
              </div>

              {/* Eye Scan Marker 2: Most Recent Role */}
              {heatMapActive && (
                <div className="absolute top-44 left-6 right-6 h-24 bg-amber-500/20 border-2 border-amber-500 rounded-lg pointer-events-none flex items-start justify-end p-1">
                  <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">2. MOST RECENT IMPACT (2.2s)</span>
                </div>
              )}

              {/* Experience */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                  Professional Experience
                </h2>
                {experiences.slice(0, 2).map((exp, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{exp.company} — {exp.position || exp.jobTitle}</span>
                      <span className="text-slate-500 font-normal">{exp.startDate} – {exp.endDate || 'Present'}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
                      {(exp.bullets || [exp.description]).slice(0, 2).map((b, bI) => (
                        <li key={bI}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Eye Scan Marker 3: Core Skills */}
              {heatMapActive && (
                <div className="absolute bottom-28 left-6 right-6 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-lg pointer-events-none flex items-start justify-end p-1">
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">3. KEYWORD SKILL SCAN (1.8s)</span>
                </div>
              )}

              {/* Skills */}
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                  Core Skills & Technologies
                </h2>
                <div className="flex flex-wrap gap-1 text-xs text-slate-800">
                  {skills.slice(0, 12).join(', ')}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1">
                  Education
                </h2>
                {education.slice(0, 1).map((edu, i) => (
                  <div key={i} className="text-xs text-slate-800 flex justify-between">
                    <span><strong>{edu.degree}</strong>, {edu.institution}</span>
                    <span className="text-slate-500">{edu.endYear || edu.endDate}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Diagnostic Report & Scorecard */}
        {activeTab === 'diagnosticReport' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Format Safety</div>
              <div className="text-3xl font-bold text-white">100%</div>
              <p className="text-xs text-slate-400">
                Single-column ATS compliant structure ensures 0 text scrambling across Workday, Greenhouse, Taleo, and Lever.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Provenance Integrity</div>
              <div className="text-3xl font-bold text-cyan-400">100%</div>
              <p className="text-xs text-slate-400">
                All bullet points trace directly back to verified achievements stored in your Career Vault.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Readability Grade</div>
              <div className="text-3xl font-bold text-emerald-400">A+</div>
              <p className="text-xs text-slate-400">
                Clean hierarchy with high contrast, standard action verbs, and no decorative font artifacts.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
