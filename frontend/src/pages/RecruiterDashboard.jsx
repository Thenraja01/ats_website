import { useState } from 'react';
import { Search, Filter, Download, Star, StarOff, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterDashboard() {
  const [candidates] = useState([
    { id: 1, name: 'Alex Johnson', role: 'Senior React Dev', score: 94, applied: 'Today', status: 'shortlisted' },
    { id: 2, name: 'Sarah Williams', role: 'Senior React Dev', score: 88, applied: 'Yesterday', status: 'pending' },
    { id: 3, name: 'Michael Chen', role: 'Full Stack Engineer', score: 82, applied: '2 days ago', status: 'pending' },
    { id: 4, name: 'Emily Davis', role: 'Backend Dev', score: 71, applied: '2 days ago', status: 'rejected' },
    { id: 5, name: 'David Wilson', role: 'Senior React Dev', score: 65, applied: '3 days ago', status: 'pending' },
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recruiter Portal</h1>
          <p className="text-slate-400">Manage candidates, view AI rankings, and shortlist top talent.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-white font-medium flex items-center gap-2 border border-slate-700">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-medium shadow-lg shadow-indigo-500/25">
            Create New Job
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search candidates by name, skills, or role..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
          <Filter className="w-5 h-5" /> Filters
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-300 text-sm border-b border-slate-800">
              <th className="p-4 font-medium">Candidate Name</th>
              <th className="p-4 font-medium">Applied Role</th>
              <th className="p-4 font-medium">ATS Score</th>
              <th className="p-4 font-medium">Applied Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {candidates.map((cand) => (
              <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{cand.name}</p>
                      <Link to={`/result/${cand.id}`} className="text-xs text-indigo-400 hover:underline">View Resume & AI Report</Link>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{cand.role}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      cand.score >= 85 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      cand.score >= 75 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {cand.score}
                    </div>
                    {cand.score >= 85 && <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-400">{cand.applied}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    cand.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    cand.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-slate-700/50 text-slate-300 border border-slate-600'
                  }`}>
                    {cand.status.charAt(0).toUpperCase() + cand.status.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Shortlist">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
