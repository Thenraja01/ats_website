import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/utils';
import logo from '@/assets/icons/logo1.png';
import { useMagnetic } from '@/hooks/useAnimations';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'AI', href: '/upload' },
  { label: 'Docs', href: '/marketing' },
  { label: 'About', href: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  const navBg = useTransform(scrollY, [0, 80], ['rgba(5,8,22,0)', 'rgba(5,8,22,0.85)']);
  const navBlur = useTransform(scrollY, [0, 80], [0, 20]);
  const navBorder = useTransform(scrollY, [0, 80], [0, 1]);

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        backgroundColor: navBg,
        backdropFilter: navBlur.get() ? `blur(${navBlur}px)` : undefined,
        borderBottom: navBorder.get() ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src={logo}
              alt="HireMind AI"
              className="w-8 h-8 object-contain"
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.3, 1] }}
              whileHover={{ rotate: 5, scale: 1.1 }}
            />
            <span className="text-lg font-bold text-white tracking-tight">HireMind AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                <span className={cn(
                  'relative z-10',
                  location.pathname === link.href ? 'text-white' : 'text-slate-400 hover:text-white'
                )}>
                  {link.label}
                </span>
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <MagneticButtonLink
                to="/candidate-dashboard"
                className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-medium text-primary hover:bg-primary/20 transition-all"
              >
                Dashboard
              </MagneticButtonLink>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <MagneticButtonLink
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                >
                  Get Started
                </MagneticButtonLink>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden border-t border-white/[0.06] bg-[#050816]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                {isAuthenticated ? (
                  <Link
                    to="/candidate-dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-sm font-medium text-primary text-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-300 text-center hover:bg-white/5"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function MagneticButtonLink({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) {
  const ref = useMagnetic();
  return (
    <div ref={ref} className="inline-block">
      <Link to={to} className={className}>
        {children}
      </Link>
    </div>
  );
}
