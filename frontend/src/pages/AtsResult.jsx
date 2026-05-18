import { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CheckCircle, XCircle, ChevronRight, FileCheck, Briefcase, GraduationCap, Code } from 'lucide-react';

export default function AtsResult() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data based on the skill.md requirements
  const score = 82;
  const isEligible = score >= 75;
  
  const skillMatch = 45; // out of 50
  const expMatch = 20; // out of 25
  const projMatch = 10; // out of 15
  const eduMatch = 7; // out of 10

  const missingSkills = ['GraphQL', 'Redis', 'Docker'];
  const matchedSkills = ['React', 'Node.js', 'MongoDB', 'Python', 'FastAPI'];
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/3 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
          <h2 className="text-xl font-semibold text-slate-300 mb-6">ATS Match Score</h2>
          <div className="w-48 h-48 mb-6">
            <CircularProgressbar 
              value={score} 
              text={`${score}%`} 
              styles={buildStyles({
                textColor: '#fff',
                pathColor: isEligible ? '#10b981' : '#f59e0b',
                trailColor: '#334155',
                textSize: '24px',
              })}
            />
          </div>
          {isEligible ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
              <CheckCircle className="w-5 h-5" /> Highly Eligible
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 font-medium">
              <XCircle className="w-5 h-5" /> Needs Improvement
            </div>
          )}
        </div>

        <div className="w-full md:w-2/3 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Score Breakdown</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-slate-300"><Code className="w-4 h-4 text-indigo-400" /> Skill Match (50%)</span>
                <span className="text-white font-medium">{skillMatch} / 50</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${(skillMatch/50)*100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-slate-300"><Briefcase className="w-4 h-4 text-purple-400" /> Experience (25%)</span>
                <span className="text-white font-medium">{expMatch} / 25</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${(expMatch/25)*100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-slate-300"><FileCheck className="w-4 h-4 text-pink-400" /> Projects (15%)</span>
                <span className="text-white font-medium">{projMatch} / 15</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-pink-500 h-3 rounded-full" style={{ width: `${(projMatch/15)*100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="flex items-center gap-2 text-slate-300"><GraduationCap className="w-4 h-4 text-blue-400" /> Education (10%)</span>
                <span className="text-white font-medium">{eduMatch} / 10</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(eduMatch/10)*100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800">
          {['overview', 'suggestions', 'interview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" /> Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-400" /> Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex gap-4">
                <div className="mt-1"><ChevronRight className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h4 className="font-medium text-white">Add quantifiable metrics to your recent role</h4>
                  <p className="text-slate-400 text-sm mt-1">Instead of "Improved performance", use "Improved database query performance by 40% using Redis caching".</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex gap-4">
                <div className="mt-1"><ChevronRight className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h4 className="font-medium text-white">Highlight Docker experience</h4>
                  <p className="text-slate-400 text-sm mt-1">The JD heavily emphasizes containerization. If you have Docker experience, make it more prominent in the skills section.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-4">
              <p className="text-slate-400 mb-6">AI generated these questions based on the gaps and matches between your resume and the JD.</p>
              <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
                <h4 className="font-medium text-indigo-300 mb-2">Q1: How do you handle state management in large React applications?</h4>
                <p className="text-slate-400 text-sm">Reason: You listed React, but the JD specifically mentions complex state. Be prepared to discuss Redux vs Context vs Zustand.</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
                <h4 className="font-medium text-indigo-300 mb-2">Q2: Can you explain a scenario where you would choose MongoDB over a SQL database?</h4>
                <p className="text-slate-400 text-sm">Reason: You have strong MongoDB experience matching the JD, so expect deep-dive architectural questions on NoSQL.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
