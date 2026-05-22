import { Link, useNavigate } from 'react-router-dom';
import logo from "../assets/icons/logo1.png"
import useAppStore from '../store/useAppStore';

export default function Navbar() {
  const { isAuthenticated, setUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="">
            
         <img src={logo} alt="logo"  className="w-10 h-10 object-contain" />
        </div>
        <Link to="/" className="text-2xl font-bold bg-linear-to-r from-indigo-100 to-purple-400 bg-clip-text text-transparent  ">
          HireMind AI
        </Link>
          </div>
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
          {isAuthenticated ? (
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors font-medium">
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
