import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Wand2,
  ScanSearch,
  Mic2,
  Library,
  MessagesSquare,
  ClipboardList,
  FolderUp,
  Layers,
  Settings,
} from 'lucide-react';

export const WORKSPACE_NAV = [
  {
    section: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, keywords: 'home overview start' },
      { label: 'Career Vault', href: '/career-vault', icon: FolderOpen, keywords: 'profile skills experience vault foundation' },
      { label: 'Resume Studio', href: '/resume-studio', icon: FileText, keywords: 'resume builder drafts versions studio' },
      { label: 'JD Tailor', href: '/resume-studio/jd-tailor', icon: Wand2, keywords: 'customize tailor optimize job description' },
      { label: 'ATS Analyzer', href: '/ats-analyzer', icon: ScanSearch, keywords: 'resume analysis ats score compatibility' },
    ],
  },
  {
    section: 'Interview',
    items: [
      { label: 'Interview Hub', href: '/interview', icon: Mic2, keywords: 'practice overview prep categories' },
      { label: 'Question Bank', href: '/interview/questions', icon: Library, keywords: 'questions save bank categories' },
      { label: 'Mock Interview', href: '/interview/mock', icon: MessagesSquare, keywords: 'mock practice session simulate' },
      { label: 'Interview Reports', href: '/interview/reports', icon: ClipboardList, keywords: 'reports results feedback scores' },
    ],
  },
  {
    section: 'Resources',
    items: [
      { label: 'Documents', href: '/documents', icon: FolderUp, keywords: 'cover letter files upload notes' },
      { label: 'Resume Versions', href: '/resume-studio', icon: Layers, keywords: 'versions history duplicates resumes' },
    ],
  },
  {
    section: 'General',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings, keywords: 'preferences appearance account' },
    ],
  },
];

export const WORKSPACE_NAV_FLAT = WORKSPACE_NAV.flatMap((g) => g.items);

export const WORKSPACE_QUICK_ACTIONS = [
  { label: 'Create a resume', href: '/resume-studio/new', keywords: 'create resume blank new' },
  { label: 'Tailor resume to a JD', href: '/resume-studio/jd-tailor', keywords: 'tailor customize jd' },
  { label: 'Run an ATS check', href: '/ats-analyzer', keywords: 'ats analysis score resume' },
  { label: 'Practice an interview', href: '/interview', keywords: 'interview hub practice prep' },
  { label: 'Start a mock interview', href: '/interview/mock', keywords: 'mock interview simulate' },
  { label: 'Prepare for a project', href: '/interview/project', keywords: 'project questions generate' },
  { label: 'Browse the question bank', href: '/interview/questions', keywords: 'questions bank save' },
  { label: 'Update career vault', href: '/career-vault', keywords: 'career profile vault foundation' },
];