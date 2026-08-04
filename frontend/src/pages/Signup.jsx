import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/icons/logo1.png';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim() || name.trim().length < 2) {
      setLocalError('Please enter a valid name (at least 2 characters)');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    if (!hasUpper || !hasLower || !hasDigit) {
      setLocalError('Password must include uppercase, lowercase, and a digit');
      return;
    }

    try {
      await authAPI.sendOtp(email, 'signup');
      setOtpSent(true);
      setStep('otp');
    } catch (err) {
      setLocalError(err.response?.data?.detail || 'Failed to send OTP');
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setLocalError('');
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setLocalError('Please enter the full 6-digit code');
      return;
    }
    try {
      await authAPI.verifyOtp(email, otpCode, 'signup');
      const result = await dispatch(register({ name, email, password, otp_code: otpCode }));
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/login');
      } else {
        setLocalError(result.payload || 'Registration failed');
      }
    } catch (err) {
      setLocalError(err.response?.data?.detail || 'Verification failed');
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-white/[0.06]">
          <div className="flex items-center justify-center gap-2 mb-8">
            <img src={logo} alt="HireMind AI" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white font-heading">HireMind AI</span>
          </div>

          {localError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {localError}
            </div>
          )}

          {step === 'form' ? (
            <>
              <h2 className="text-2xl font-bold text-white text-center mb-1">Create account</h2>
              <p className="text-slate-400 text-sm text-center mb-8">Enter your details to get started</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all pr-10"
                      required
                      minLength={8}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Must include uppercase, lowercase, and a digit</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Sending OTP...' : 'Verify Email'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => setStep('form')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-bold text-white text-center mb-1">Check your email</h2>
              <p className="text-slate-400 text-sm text-center mb-2">
                We sent a 6-digit code to <span className="text-white">{email}</span>
              </p>
              <p className="text-slate-500 text-xs text-center mb-8">Enter it below to verify your account</p>

              <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center bg-white/5 border border-white/10 rounded-xl text-white text-xl font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Resend code
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-accent transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
