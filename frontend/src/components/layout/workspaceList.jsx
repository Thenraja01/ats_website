import {
  LayoutDashboard,
  User,
  Sparkles,
  Zap,
  Target,
  FileText,
  Hammer,
  ScanSearch,
  Wand2,
  Mic2,
  MessagesSquare,
  Library,
  ClipboardList,
  Kanban,
  FolderOpen,
  Settings,
  Bell,
} from 'lucide-react';

export const WORKSPACE_NAV = [
  {
    section: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, keywords: 'home overview start metrics' },
    ],
  },
  {
    section: 'My Career',
    items: [
      { label: 'Profile', href: '/profile', icon: User, keywords: 'profile master info experience education foundation' },
      { label: 'Career Advisor', href: '/career/advisor', icon: Sparkles, keywords: 'ai advisor roadmap guidance path' },
      { label: 'Skills & Gaps', href: '/career/skills', icon: Zap, keywords: 'skills analysis gap matrix learning' },
      { label: 'Goals', href: '/career/goals', icon: Target, keywords: 'career goals milestones targets' },
    ],
  },
  {
    section: 'Resume',
    items: [
      { label: 'My Resumes', href: '/resumes', icon: FileText, keywords: 'resumes studio versions drafts' },
      { label: 'Resume Builder', href: '/resumes/new', icon: Hammer, keywords: 'builder create new resume live preview' },
      { label: 'Resume Analyzer', href: '/resumes/analyze', icon: ScanSearch, keywords: 'ats analyzer score feedback breakdown' },
      { label: 'JD Match', href: '/jd-match', icon: Wand2, keywords: 'jd match tailor optimize comparison' },
    ],
  },
  {
    section: 'Interview',
    items: [
      { label: 'Interview Hub', href: '/interviews', icon: Mic2, keywords: 'practice prep readiness categories' },
      { label: 'Mock Interview', href: '/interviews/mock', icon: MessagesSquare, keywords: 'mock practice simulate ai session' },
      { label: 'Question Bank', href: '/interviews/questions', icon: Library, keywords: 'questions bank search bookmark' },
      { label: 'Reports', href: '/interviews/reports', icon: ClipboardList, keywords: 'reports results performance feedback scores' },
    ],
  },
  {
    section: 'Applications',
    items: [
      { label: 'Application Tracker', href: '/applications', icon: Kanban, keywords: 'jobs tracker kanban applied offer status' },
    ],
  },
  {
    section: 'Career Vault',
    items: [
      { label: 'Documents', href: '/vault/documents', icon: FolderOpen, keywords: 'vault documents certificates offer letters files' },
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
  { label: 'Update Master Profile', href: '/profile', keywords: 'profile update vault' },
  { label: 'Create a new Resume', href: '/resumes/new', keywords: 'create resume blank builder' },
  { label: 'Analyze Resume (ATS)', href: '/resumes/analyze', keywords: 'ats check score resume analyzer' },
  { label: 'Match Resume with JD', href: '/jd-match', keywords: 'tailor customize jd match' },
  { label: 'Start Mock Interview', href: '/interviews/mock', keywords: 'mock interview practice simulate' },
  { label: 'Track Job Application', href: '/applications', keywords: 'application track kanban' },
  { label: 'View Career Roadmap', href: '/career/advisor', keywords: 'advisor roadmap skills' },
  { label: 'Upload to Career Vault', href: '/vault/documents', keywords: 'vault documents certificates files' },
];