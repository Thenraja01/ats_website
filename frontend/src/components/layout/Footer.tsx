import { Link } from 'react-router-dom';
import { Mail, Github, Twitter } from 'lucide-react';
import logo from '@/assets/icons/logo1.png';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'AI Capabilities', href: '/features' },
      { label: 'Integrations', href: '/features' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/marketing' },
      { label: 'API Reference', href: '/marketing' },
      { label: 'Blog', href: '/marketing' },
      { label: 'Support', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/contact' },
      { label: 'Careers', href: '/contact' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/marketing' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050816]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img src={logo} alt="HireMind AI" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold text-white">HireMind AI</span>
            </Link>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              AI-powered applicant tracking system. Smart resume analysis, intelligent candidate matching.
            </p>
            <div className="flex items-center gap-3">
              <a href="mailto:hello@hiremind.ai" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} HireMind AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/marketing" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
            <Link to="/marketing" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</Link>
            <Link to="/contact" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
