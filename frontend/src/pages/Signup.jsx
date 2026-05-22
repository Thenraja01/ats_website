import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register({ name, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-slate-900 rounded-xl border border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500" 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500" 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500" 
          required 
        />
        <select 
          value={role} 
          onChange={e => setRole(e.target.value)}
          className="p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-50"
        >
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button type="submit" className="py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold mt-2">Create Account</button>
      </form>
      <p className="mt-4 text-center text-slate-400">
        Already have an account? <Link to="/login" className="text-indigo-400">Sign In</Link>
      </p>
    </div>
  );
}
