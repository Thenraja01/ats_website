import { motion } from 'framer-motion';
import { ShieldX, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="glass rounded-2xl p-8 max-w-md text-center border-red-500/20">
        <ShieldX className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">
          You do not have permission to access this page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </motion.div>
  );
}
