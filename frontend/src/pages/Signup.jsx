import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, googleLogin, clearError } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Briefcase, 
  User as UserIcon, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/icons/logo.png';
import TermsModal from '@/components/legal/TermsModal';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState('terms');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user]);

  // Google Sign-In setup
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleResponse,
      });
      const btnContainer = document.getElementById('google-signup-btn');
      if (btnContainer) {
        btnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
          shape: 'pill',
          width: 320,
        });
      }
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    const credential = response.credential;
    const result = await dispatch(googleLogin({ credential, role: 'candidate' }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created successfully with Google!');
      navigate('/onboarding');
    } else {
      toast.error(result.payload || 'Google registration failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name or username');
      return;
    }
    if (!email.trim() || !password) {
      toast.error('Please complete all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }

    const result = await dispatch(
      register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'candidate',
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account registered successfully! Welcome to HireMind AI.');
      try {
        const existing = localStorage.getItem('hiremind_master_career_profile');
        const parsed = existing ? JSON.parse(existing) : {};
        localStorage.setItem('hiremind_master_career_profile', JSON.stringify({
          ...parsed,
          personalInfo: {
            ...(parsed.personalInfo || {}),
            fullName: name.trim(),
            email: email.trim(),
          }
        }));
      } catch (e) {}
      navigate('/onboarding');
    } else {
      toast.error(result.payload || 'Registration failed. Please check your details.');
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: '', score: 0, color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 33, color: 'bg-red-500' };
    if (score <= 4) return { label: 'Good', score: 66, color: 'bg-amber-500' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-accent/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative"
      >
        {/* Outer Card Container */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-white/0 shadow-2xl shadow-black/60">
          <div className="rounded-3xl bg-[#080D1E]/90 backdrop-blur-2xl p-7 sm:p-9 border border-white/[0.08] relative overflow-hidden">
            
            {/* Top Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>AI Career Operating System</span>
              </div>
            </div>

            {/* Header / Logo */}
            <div className="text-center mb-7">
              <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <img src={logo} alt="HireMind AI" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight font-heading">
                  HireMind<span className="text-primary">.AI</span>
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Create your account</h1>
              <p className="text-slate-400 text-sm">Create your Master Profile and start generating job-tailored resumes</p>
            </div>

            {/* Error Message Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, mb: 0 }}
                  animate={{ opacity: 1, height: 'auto', mb: 20 }}
                  exit={{ opacity: 0, height: 0, mb: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5 relative">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="flex-1 text-xs leading-relaxed">{error}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(clearError())}
                      className="text-red-400/80 hover:text-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) dispatch(clearError());
                    }}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) dispatch(clearError());
                    }}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) dispatch(clearError());
                    }}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.label === 'Strong' ? 'text-emerald-400' :
                        passwordStrength.label === 'Good' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.score}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-white/5 border-white/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-colors"
                />
                <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsInitialTab('terms');
                      setTermsModalOpen(true);
                    }}
                    className="text-primary hover:text-accent underline underline-offset-2 transition-colors font-medium"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsInitialTab('privacy');
                      setTermsModalOpen(true);
                    }}
                    className="text-primary hover:text-accent underline underline-offset-2 transition-colors font-medium"
                  >
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-primary to-accent text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#080D1E] px-3 text-slate-500 font-medium">Or register with</span>
              </div>
            </div>

            {/* Google Sign-up Container */}
            <div className="flex justify-center w-full min-h-[44px]">
              <div id="google-signup-btn" className="w-full flex justify-center"></div>
            </div>

            {/* Switch to Login */}
            <p className="mt-7 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-accent font-semibold transition-colors underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* Security Guarantee */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant free access • No credit card required</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms & Privacy Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        initialTab={termsInitialTab}
      />
    </div>
  );
}
