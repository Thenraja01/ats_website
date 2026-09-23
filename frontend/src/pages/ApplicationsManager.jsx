import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getApplicationsMemory, 
  saveApplicationMemory, 
  deleteApplicationMemory,
  getMasterCareerProfile
} from '../services/careerProfileSync';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Award, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Download, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Building,
  Target
} from 'lucide-react';

export default function ApplicationsManager() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    company: '',
    role: '',
    jdText: '',
    status: 'Applied',
    matchScore: 88,
    notes: '',
    effortMinutes: 15
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = () => {
    const memory = getApplicationsMemory();
    setApplications(memory);
    if (memory.length > 0 && !selectedApp) {
      setSelectedApp(memory[0]);
    }
  };

  const handleStatusChange = (appId, newStatus) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      const updated = { ...app, status: newStatus };
      saveApplicationMemory(updated);
      loadApps();
      if (selectedApp?.id === appId) {
        setSelectedApp(updated);
      }
    }
  };

  const handleDelete = (appId) => {
    if (window.confirm('Delete this application record and its snapshot history?')) {
      deleteApplicationMemory(appId);
      const remaining = applications.filter(a => a.id !== appId);
      setApplications(remaining);
      if (selectedApp?.id === appId) {
        setSelectedApp(remaining[0] || null);
      }
    }
  };

  const handleCreateManualApp = (e) => {
    e.preventDefault();
    if (!newAppForm.company || !newAppForm.role) return;

    const master = getMasterCareerProfile();
    const created = saveApplicationMemory({
      ...newAppForm,
      resumeVersion: `${newAppForm.role.replace(/[^a-zA-Z0-9]/g, '_')}_Resume_v1`,
      resumeData: master,
      coverLetter: `Dear Hiring Team at ${newAppForm.company},\n\nI am writing to express my strong enthusiasm for the ${newAppForm.role} position. Based on my hands-on background and verified projects in ${master.skills?.[0]?.name || 'relevant technologies'}, I look forward to contributing to your engineering goals.\n\nSincerely,\n${master.personalInfo?.fullName || 'Candidate'}`
    });

    setShowAddModal(false);
    setNewAppForm({
      company: '',
      role: '',
      jdText: '',
      status: 'Applied',
      matchScore: 88,
      notes: '',
      effortMinutes: 15
    });
    loadApps();
    setSelectedApp(created);
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><Award className="w-3 h-3" /> Offer Received</span>;
      case 'Interviewing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3" /> Interviewing</span>;
      case 'Applied':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Applied</span>;
      case 'Saved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">Draft / Saved</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Application OS & Memory
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {applications.length} Saved Records
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Every application, tailored resume version, JD snapshot, and interview prep in one living memory
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Log Application
            </button>
            <Link
              to="/jd-analyzer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm flex items-center gap-2 transition-all border border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Tailor New JD
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Tracked</div>
            <div className="text-2xl font-bold text-white mt-1">{applications.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Across all target employers</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-xs font-medium text-amber-400 uppercase tracking-wider">Active Interviews</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {applications.filter(a => a.status === 'Interviewing').length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Stage 1 & Onsites</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Offers Received</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {applications.filter(a => a.status === 'Offer').length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">In negotiation</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Avg ATS Match</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {applications.length > 0 
                ? `${Math.round(applications.reduce((acc, a) => acc + (a.matchScore || 85), 0) / applications.length)}%`
                : '92%'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Based on Career Vault facts</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Applications List */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Search and Filters */}
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search role or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Saved">Saved</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/20 border border-slate-800/60 rounded-xl p-6">
                  <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No applications found</p>
                  <p className="text-xs text-slate-500 mt-1">Start by tailoring your resume for a job or log an application manually.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-3 py-1.5 bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-medium hover:bg-cyan-600/40"
                  >
                    + Add first application
                  </button>
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedApp?.id === app.id
                        ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          {app.company}
                          {app.matchScore && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {app.matchScore}% Match
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{app.role}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.appliedDate || 'Recent'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-cyan-400 font-medium">
                        <span>{app.resumeVersion || 'Resume Snapshot'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Application Detail View */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{selectedApp.role}</h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedApp.company}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>Applied: {selectedApp.appliedDate || 'Not specified'}</span>
                      <span>•</span>
                      <span>Target Match: <strong className="text-cyan-400">{selectedApp.matchScore || 85}%</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedApp.status}
                      onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-medium"
                    >
                      <option value="Saved">Saved Draft</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer Received</option>
                      <option value="Archived">Archived</option>
                    </select>

                    <button
                      onClick={() => handleDelete(selectedApp.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Action Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      if (selectedApp.resumeData) {
                        localStorage.setItem('hiremind_resume_data', JSON.stringify(selectedApp.resumeData));
                      }
                      navigate('/builder');
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-2.5 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Resume Snapshot</div>
                      <div className="text-[10px] text-slate-400">View exact version</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/interview-hub', { state: { targetApp: selectedApp } });
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-2.5 text-left transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Prep Interview</div>
                      <div className="text-[10px] text-slate-400">Consistency QA</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/ats-simulator', { state: { resumeData: selectedApp.resumeData, jdText: selectedApp.jdText } });
                    }}
                    className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-2.5 text-left transition-all group col-span-2 sm:col-span-1"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">ATS Simulator</div>
                      <div className="text-[10px] text-slate-400">6-Sec Recruiter scan</div>
                    </div>
                  </button>
                </div>

                {/* Job Description Snapshot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Job Description Snapshot</span>
                    <span>{selectedApp.jdText ? `${selectedApp.jdText.length} characters` : 'No JD stored'}</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                    {selectedApp.jdText || 'No JD text was pasted during tailoring. All candidate bullets originate from the verified Career Vault.'}
                  </div>
                </div>

                {/* Cover Letter Snapshot */}
                {selectedApp.coverLetter && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Tailored Cover Letter</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedApp.coverLetter);
                          alert('Cover letter copied to clipboard!');
                        }}
                        className="text-cyan-400 hover:underline text-[11px]"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {selectedApp.coverLetter}
                    </div>
                  </div>
                )}

                {/* Application Notes */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                    Internal Notes & Interview Follow-ups
                  </label>
                  <textarea
                    rows={3}
                    value={selectedApp.notes || ''}
                    onChange={(e) => {
                      const updated = { ...selectedApp, notes: e.target.value };
                      setSelectedApp(updated);
                      saveApplicationMemory(updated);
                    }}
                    placeholder="E.g. Recruiter mentioned Round 2 will focus on system design and React performance..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">Select an application to view memory</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  View the exact resume version sent to this employer, cover letters, and launch consistency prep.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Application Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Log New Application
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Google, Acme Corp"
                    value={newAppForm.company}
                    onChange={(e) => setNewAppForm({ ...newAppForm, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newAppForm.role}
                    onChange={(e) => setNewAppForm({ ...newAppForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={newAppForm.status}
                    onChange={(e) => setNewAppForm({ ...newAppForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Saved">Saved Draft</option>
                    <option value="Offer">Offer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Job Description (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Paste job requirements or paste URL summary..."
                    value={newAppForm.jdText}
                    onChange={(e) => setNewAppForm({ ...newAppForm, jdText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-medium"
                  >
                    Save to Application Memory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
