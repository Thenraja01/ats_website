import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          HireMind AI
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/upload" className="text-slate-300 hover:text-white transition-colors">
            Analyze Resume
          </Link>
          <Link to="/candidate-dashboard" className="text-slate-300 hover:text-white transition-colors">
            Candidate
          </Link>
          <Link to="/recruiter-dashboard" className="text-slate-300 hover:text-white transition-colors">
            Recruiter
          </Link>
          <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-medium">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
