import { Link } from 'react-router-dom';
import { ArrowRight, FileText, BarChart, Users } from 'lucide-react';
import logo from "../assets/icons/logo1.png"
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        AI-Powered Resume Analysis
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        Get Hired Faster with <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          <img src={logo} className=' w-20 h-20 mx-2 inline-block '/>
          HireMind AI 
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
        Leverage Llama 3 and RAG technology to match your resume against job descriptions, calculate ATS scores, and generate tailored interview questions.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link to="/upload" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25 text-white font-semibold text-lg hover:scale-105 active:scale-95">
          Analyze Your Resume
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/recruiter-dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 text-white font-semibold text-lg hover:scale-105 active:scale-95">
          For Recruiters
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors text-left group">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Smart Parsing</h3>
          <p className="text-slate-400">Extract skills, education, and experience with high accuracy using our advanced NLP pipeline.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-colors text-left group">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BarChart className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">ATS Scoring</h3>
          <p className="text-slate-400">Get an instant ATS score based on semantic matching using BGE-large embeddings.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition-colors text-left group">
          <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Agents</h3>
          <p className="text-slate-400">Multiple specialized agents handle everything from suggestions to generating interview questions.</p>
        </div>
      </div>
    </div>
  );
}
