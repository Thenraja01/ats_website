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
  LayoutDashboard,
  GraduationCap,
} from 'lucide-react';

export const WORKSPACE_NAV = [
  {
    section: 'Core Platform',
    items: [
      {
        label: 'Career Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        keywords: 'dashboard overview command center readiness stats home',
      },
      {
        label: 'Resume Studio',
        href: '/resumes',
        icon: FileText,
        keywords: 'resumes studio versions drafts builder templates',
      },
      {
        label: 'Job Match & ATS',
        href: '/ats-analyzer',
        icon: ScanSearch,
        keywords: 'ats analyzer job match tailor keywords scanner gaps score',
      },
      {
        label: 'Interview Coach',
        href: '/interviews',
        icon: Mic2,
        keywords: 'interview hub mock session practice simulate ai prep readiness rounds questions reports',
      },
      {
        label: 'Learning Academy',
        href: '/learning',
        icon: GraduationCap,
        keywords: 'learning academy skills courses tracks projects gaps',
      },
      {
        label: 'Career Vault',
        href: '/profile',
        icon: Briefcase,
        keywords: 'portfolio profile vault master info experience documents certificates',
      },
    ],
  },
];

export const WORKSPACE_NAV_FLAT = WORKSPACE_NAV.flatMap((g) => g.items);

export const WORKSPACE_QUICK_ACTIONS = [
  { label: 'Open Career Dashboard', href: '/dashboard', keywords: 'dashboard command center overview' },
  { label: 'Create a new Resume', href: '/resumes/new', keywords: 'create resume blank builder' },
  { label: 'Analyze Resume (ATS)', href: '/ats-analyzer', keywords: 'ats check score resume analyzer' },
  { label: 'Match Resume with Job Description', href: '/ats-analyzer', keywords: 'tailor customize jd match' },
  { label: 'Start Mock Interview Simulator', href: '/interviews', keywords: 'mock interview practice simulate' },
  { label: 'Practice Question Bank', href: '/interviews/questions', keywords: 'questions interview practice' },
  { label: 'View Interview Performance Reports', href: '/interviews/reports', keywords: 'reports interview performance scores' },
  { label: 'Explore Learning Tracks & Skill Gaps', href: '/learning', keywords: 'learning tracks academy skill gaps' },
  { label: 'Update Portfolio & Career Vault', href: '/profile', keywords: 'portfolio profile vault master info' },
  { label: 'Upload Documents & Certifications', href: '/vault/documents', keywords: 'vault documents certificates files' },
  { label: 'Workspace Preferences & Settings', href: '/settings', keywords: 'settings account preferences' },
];