import {
  FileText,
  Hammer,
  ScanSearch,
  Wand2,
  Mic2,
  MessagesSquare,
  Library,
  ClipboardList,
  FolderOpen,
  Sparkles,
  Zap,
  Briefcase,
  Settings,
} from 'lucide-react';

export const WORKSPACE_NAV = [
  {
    section: 'Resume Studio',
    items: [
      { label: 'My Resumes', href: '/resumes', icon: FileText, keywords: 'resumes studio versions drafts' },
      { label: 'Resume Builder', href: '/resumes/new', icon: Hammer, keywords: 'builder create new resume live preview' },
      { label: 'ATS Analyzer', href: '/resumes/analyze', icon: ScanSearch, keywords: 'ats analyzer score feedback breakdown' },
    ],
  },
  {
    section: 'JD Match',
    items: [
      { label: 'Match & Tailor', href: '/jd-match', icon: Wand2, keywords: 'jd match tailor optimize comparison scanner' },
    ],
  },
  {
    section: 'Interview Coach',
    items: [
      { label: 'Interview Hub', href: '/interviews', icon: Mic2, keywords: 'practice prep readiness categories' },
      { label: 'Mock Interview', href: '/interviews/mock', icon: MessagesSquare, keywords: 'mock practice simulate ai session' },
      { label: 'Question Bank', href: '/interviews/questions', icon: Library, keywords: 'questions bank search bookmark' },
      { label: 'Performance Reports', href: '/interviews/reports', icon: ClipboardList, keywords: 'reports results performance feedback scores' },
    ],
  },
  {
    section: 'Portfolio',
    items: [
      { label: 'Career Vault', href: '/profile', icon: Briefcase, keywords: 'portfolio profile vault master info experience' },
      { label: 'AI Advisor', href: '/career/advisor', icon: Sparkles, keywords: 'ai advisor roadmap guidance path' },
      { label: 'Skills & Gaps', href: '/career/skills', icon: Zap, keywords: 'skills analysis gap matrix learning' },
      { label: 'Documents & Certs', href: '/vault/documents', icon: FolderOpen, keywords: 'vault documents certificates offer letters files' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings, keywords: 'account security preferences appearance' },
    ],
  },
];

export const WORKSPACE_NAV_FLAT = WORKSPACE_NAV.flatMap((g) => g.items);

export const WORKSPACE_QUICK_ACTIONS = [
  { label: 'Create a new Resume', href: '/resumes/new', keywords: 'create resume blank builder' },
  { label: 'Analyze Resume (ATS)', href: '/resumes/analyze', keywords: 'ats check score resume analyzer' },
  { label: 'Match Resume with JD', href: '/jd-match', keywords: 'tailor customize jd match' },
  { label: 'Start Mock Interview', href: '/interviews/mock', keywords: 'mock interview practice simulate' },
  { label: 'Practice Question Bank', href: '/interviews/questions', keywords: 'questions interview practice' },
  { label: 'Update Portfolio & Vault', href: '/profile', keywords: 'portfolio profile vault master info' },
  { label: 'View Career Roadmap', href: '/career/advisor', keywords: 'advisor roadmap skills' },
  { label: 'Upload Certificate / Doc', href: '/vault/documents', keywords: 'vault documents certificates files' },
];