import { Link } from 'react-router-dom';
import { FileText, Clock, TrendingUp } from 'lucide-react';

export default function CandidateDashboard() {
  const pastAnalyses = [
    { id: '1', role: 'Frontend Developer', company: 'TechCorp', score: 82, date: '2 days ago', status: 'Eligible' },
    { id: '2', role: 'Full Stack Engineer', company: 'StartupInc', score: 65, date: '1 week ago', status: 'Improvement Needed' },
    { id: '3', role: 'React Developer', company: 'AgencyX', score: 91, date: '2 weeks ago', status: 'Highly Eligible' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-slate-400">Track your application performance and ATS scores.</p>
        </div>
        <Link to="/upload" className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-medium shadow-lg shadow-indigo-500/25">
          New Analysis
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Resumes Analyzed</p>
          <h3 className="text-3xl font-bold text-white">12</h3>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Average ATS Score</p>
          <h3 className="text-3xl font-bold text-white">78%</h3>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-slate-400 text-sm mb-1">Last Activity</p>
          <h3 className="text-xl font-bold text-white mt-2">2 days ago</h3>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mb-6">Recent Analyses</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-300 text-sm border-b border-slate-800">
              <th className="p-4 font-medium">Role & Company</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Score</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pastAnalyses.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-white">{item.role}</p>
                  <p className="text-sm text-slate-400">{item.company}</p>
                </td>
                <td className="p-4 text-sm text-slate-400">{item.date}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.score >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.score}%
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link to={`/result/${item.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                    View Report
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
