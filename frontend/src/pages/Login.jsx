import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAppStore from '../store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.login({ email, password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      
      // Parse token or fetch profile
      // Quick mock user role based on token payload decoding if needed, 
      // but for now let's just set isAuthenticated
      setUser({ email, token });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-slate-900 rounded-xl border border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
        <button type="submit" className="py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-bold mt-2">Login</button>
      </form>
      <p className="mt-4 text-center text-slate-400">
        Don't have an account? <Link to="/signup" className="text-indigo-400">Sign Up</Link>
      </p>
    </div>
  );
}
