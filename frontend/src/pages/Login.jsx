import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin, clearError } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
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
  Briefcase,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/icons/logo.png';
import TermsModal from '@/components/legal/TermsModal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState('terms');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      handleRedirect(user.role);
    }
  }, [isAuthenticated, user]);

  // Initialize Google Sign-In
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google && clientId && clientId.trim() && !clientId.includes('your-google-client-id')) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        const btnContainer = document.getElementById('google-login-btn');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 320,
          });
        }
      } catch (e) {
        console.warn('Google Sign-In initialization skipped:', e);
      }
    }
  }, []);

  const handleRedirect = () => {
    navigate('/resume-studio');
  };

  const handleGoogleResponse = async (response) => {
    const credential = response.credential;
    const result = await dispatch(googleLogin({ credential }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Signed in successfully with Google!');
      handleRedirect();
    } else {
      toast.error(result.payload || 'Google authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    const result = await dispatch(login({ email: email.trim(), password }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Welcome back, ${result.payload.user?.name || 'User'}!`);
      handleRedirect();
    } else {
      toast.error(result.payload || 'Login failed. Please check your credentials.');
    }
  };



  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setResetSent(true);
    toast.success('Password reset instructions sent to your email!');
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSent(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-accent/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Outer Glow Card Container */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-primary/15 via-primary/5 to-primary/0 shadow-2xl shadow-black/60">
          <div className="rounded-3xl bg-[#080D1E]/90 backdrop-blur-2xl p-7 sm:p-9 border border-primary/[0.08] relative overflow-hidden">

            {/* Top Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>AI-Powered Recruitment Portal</span>
              </div>
            </div>

            {/* Header / Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <img src={logo} alt="HireMind AI" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-2xl font-extrabold text-primary tracking-tight font-heading">
                  HireMind<span className="text-primary">.AI</span>
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-primary tracking-tight mb-1.5">Welcome back</h1>
              <p className="text-slate-400 text-sm">Sign in to access your dashboard and insights</p>
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

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Username or Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) dispatch(clearError());
                    }}
                    placeholder="username or you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-primary/[0.04] border border-primary/[0.08] text-primary placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs text-primary hover:text-accent font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-primary/[0.04] border border-primary/[0.08] text-primary placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-primary/5 border-primary/20 text-primary focus:ring-primary/40 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-xs text-slate-400">Remember this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-primary to-accent text-primary font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>


            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#080D1E] px-3 text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-in Container */}
            <div className="flex justify-center w-full min-h-[44px]">
              <div id="google-login-btn" className="w-full flex justify-center"></div>
            </div>

            {/* Switch to Signup */}
            <p className="mt-7 text-center text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link
                to="/signup"
                className="text-primary hover:text-accent font-semibold transition-colors underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>

            {/* Terms and Privacy Policy links */}
            <div className="mt-4 text-center text-[11px] text-slate-500">
              By continuing, you agree to our{' '}
              <button
                type="button"
                onClick={() => {
                  setTermsInitialTab('terms');
                  setTermsModalOpen(true);
                }}
                className="text-slate-400 hover:text-primary underline transition-colors"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => {
                  setTermsInitialTab('privacy');
                  setTermsModalOpen(true);
                }}
                className="text-slate-400 hover:text-primary underline transition-colors"
              >
                Privacy Policy
              </button>
              .
            </div>

            {/* Security Guarantee */}
            <div className="mt-4 pt-3 border-t border-primary/[0.06] flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise-grade 256-bit encrypted security</span>
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

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1226] border border-primary/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-primary">Reset Password</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered email address and we will send you a reset link.
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>Password reset email dispatched successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary text-xs font-semibold transition-all shadow-md"
                  >
                    Send Reset Instructions
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
