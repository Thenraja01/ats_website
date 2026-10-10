/**
 * Career OS: Core Synchronization & Application Memory Engine
 * Single Source of Truth Manager for Career Vault & Intelligent Applications
 */

export const MASTER_PROFILE_KEY = 'hiremind_master_career_profile';
export const RESUME_DATA_KEY = 'hiremind_resume_data';
export const APPLICATIONS_KEY = 'hiremind_applications_memory';
export const INTERVIEWS_KEY = 'hiremind_interviews_memory';
export const RESUME_VERSIONS_KEY = 'hiremind_resume_versions';
export const SYNC_EVENT_NAME = 'hiremind_profile_sync';

export const DEFAULT_MASTER_PROFILE = {
  personalInfo: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    portfolio: '',
    avatar: '',
    customFields: [],
  },
  summary: {
    primary: '',
    targetRoles: [],
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  languages: [],
  publications: [],
  openSource: [],
  customSections: [],
  voiceProfile: {
    style: 'Professional', // 'Natural' | 'Professional' | 'Technical' | 'Simple' | 'Executive' | 'Student'
    preserveMetricsOnly: true,
  }
};

/**
 * Transform Master Profile schema into Resume Builder schema
 */
export function convertMasterToResume(master) {
  if (!master) return null;

  const personalInfo = {
    fullName: master.personalInfo?.fullName || '',
    title: master.personalInfo?.headline || master.personalInfo?.title || '',
    email: master.personalInfo?.email || '',
    phone: master.personalInfo?.phone || '',
    location: master.personalInfo?.location || '',
    website: master.personalInfo?.website || '',
    linkedin: master.personalInfo?.linkedin || '',
    github: master.personalInfo?.github || '',
    avatar: master.personalInfo?.avatar || '',
    customFields: Array.isArray(master.personalInfo?.customFields) ? master.personalInfo.customFields : [],
  };

  const summary = typeof master.summary === 'string' 
    ? master.summary 
    : (master.summary?.primary || '');

  const experience = (master.experience || []).map((exp, expIdx) => ({
    id: exp.id || `exp_${expIdx}`,
    company: exp.company || '',
    position: exp.jobTitle || exp.position || '',
    location: exp.location || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    current: Boolean(exp.current),
    description: exp.description || '',
    bullets: Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0
      ? exp.responsibilities
      : (Array.isArray(exp.bullets) && exp.bullets.length > 0 ? exp.bullets : ['']),
    provenance: {
      source: `${exp.company || 'Role'} → Responsibility`,
      verified: true
    }
  }));

  const education = (master.education || []).map((edu, eduIdx) => ({
    id: edu.id || `edu_${eduIdx}`,
    institution: edu.institution || '',
    degree: edu.degree || '',
    startYear: edu.startDate || edu.startYear || '',
    endYear: edu.endDate || edu.endYear || '',
    gpa: edu.gpa || ''
  }));

  const projects = (master.projects || []).map((proj, pIdx) => ({
    id: proj.id || `proj_${pIdx}`,
    name: proj.name || '',
    technologies: Array.isArray(proj.technologies) 
      ? proj.technologies.join(', ') 
      : (proj.technologies || ''),
    period: proj.startDate && proj.endDate 
      ? `${proj.startDate} – ${proj.endDate}` 
      : (proj.period || proj.startDate || 'Present'),
    link: proj.url || proj.link || proj.githubUrl || '',
    description: proj.description || '',
    provenance: {
      source: `Project: ${proj.name || 'Personal Project'}`,
      verified: true
    }
  }));

  const skills = Array.isArray(master.skills)
    ? master.skills.map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean)
    : [];

  const certifications = (master.certifications || []).map(c => ({
    name: c.name || '',
    issuer: c.organization || c.issuer || '',
    year: c.issueDate || c.year || ''
  }));

  const achievements = (master.achievements || []).map(a => ({
    title: a.title || '',
    description: a.description || ''
  }));

  const languages = (master.languages || []).map(l => ({
    name: l.name || '',
    proficiency: l.proficiency || ''
  }));

  const publications = master.publications || [];
  const openSource = master.openSource || [];
  const customSections = master.customSections || [];

  return {
    personalInfo,
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    achievements,
    languages,
    publications,
    openSource,
    customSections
  };
}

/**
 * Transform Resume Builder schema back to Master Profile schema
 */
export function convertResumeToMaster(resume, existingMaster = {}) {
  if (!resume) return existingMaster;

  const base = { ...DEFAULT_MASTER_PROFILE, ...existingMaster };

  const personalInfo = {
    ...base.personalInfo,
    fullName: resume.personalInfo?.fullName || base.personalInfo?.fullName || '',
    headline: resume.personalInfo?.title || base.personalInfo?.headline || '',
    email: resume.personalInfo?.email || base.personalInfo?.email || '',
    phone: resume.personalInfo?.phone || base.personalInfo?.phone || '',
    location: resume.personalInfo?.location || base.personalInfo?.location || '',
    website: resume.personalInfo?.website || base.personalInfo?.website || '',
    linkedin: resume.personalInfo?.linkedin || base.personalInfo?.linkedin || '',
    github: resume.personalInfo?.github || base.personalInfo?.github || '',
    avatar: resume.personalInfo?.avatar || base.personalInfo?.avatar || '',
    customFields: Array.isArray(resume.personalInfo?.customFields) ? resume.personalInfo.customFields : (base.personalInfo?.customFields || []),
  };

  const summary = {
    ...base.summary,
    primary: typeof resume.summary === 'string' ? resume.summary : (base.summary?.primary || ''),
  };

  const experience = (resume.experience || []).map((exp, idx) => {
    const existing = base.experience?.[idx] || {};
    return {
      ...existing,
      id: existing.id || `exp_${Date.now()}_${idx}`,
      company: exp.company || '',
      jobTitle: exp.position || exp.jobTitle || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: Boolean(exp.current),
      description: exp.description || '',
      responsibilities: exp.bullets || exp.responsibilities || []
    };
  });

  const education = (resume.education || []).map((edu, idx) => {
    const existing = base.education?.[idx] || {};
    return {
      ...existing,
      id: existing.id || `edu_${Date.now()}_${idx}`,
      institution: edu.institution || '',
      degree: edu.degree || '',
      startDate: edu.startYear || edu.startDate || '',
      endDate: edu.endYear || edu.endDate || '',
      gpa: edu.gpa || ''
    };
  });

  const projects = (resume.projects || []).map((proj, idx) => {
    const existing = base.projects?.[idx] || {};
    return {
      ...existing,
      id: existing.id || `proj_${Date.now()}_${idx}`,
      name: proj.name || '',
      technologies: proj.technologies || '',
      startDate: proj.period || '',
      url: proj.link || '',
      description: proj.description || ''
    };
  });

  // Skills mapping with evidence computation
  const skills = (resume.skills || []).map(s => {
    if (typeof s === 'object' && s.name) return s;
    const existingSkill = base.skills?.find(ex => (typeof ex === 'string' ? ex : ex.name).toLowerCase() === s.toLowerCase());
    if (existingSkill && typeof existingSkill === 'object') return existingSkill;
    return {
      name: s,
      category: 'Technical',
      proficiency: 'Advanced',
      verified: true,
      evidenceLevel: 'Strong'
    };
  });

  const certifications = (resume.certifications || []).map((c, idx) => {
    const existing = base.certifications?.[idx] || {};
    return {
      ...existing,
      id: existing.id || `cert_${Date.now()}_${idx}`,
      name: c.name || '',
      organization: c.issuer || c.organization || '',
      issueDate: c.year || c.issueDate || ''
    };
  });

  const achievements = (resume.achievements || []).map((a, idx) => {
    const existing = base.achievements?.[idx] || {};
    return {
      ...existing,
      id: existing.id || `ach_${Date.now()}_${idx}`,
      title: a.title || '',
      description: a.description || ''
    };
  });

  const languages = (resume.languages || []).map(l => ({
    name: l.name || '',
    proficiency: l.proficiency || ''
  }));

  return {
    ...base,
    personalInfo,
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    achievements,
    languages,
    customSections: resume.customSections || []
  };
}

/**
 * Get Master Career Profile with fallback
 */
export function getMasterCareerProfile() {
  try {
    const saved = localStorage.getItem(MASTER_PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading master profile', e);
  }
  return DEFAULT_MASTER_PROFILE;
}

/**
 * Save Master Career Profile and dispatch live sync event
 */
export function saveMasterCareerProfile(profile) {
  try {
    localStorage.setItem(MASTER_PROFILE_KEY, JSON.stringify(profile));
    const converted = convertMasterToResume(profile);
    localStorage.setItem(RESUME_DATA_KEY, JSON.stringify(converted));

    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, {
      detail: { masterProfile: profile, resumeData: converted, source: 'master' }
    }));
  } catch (e) {
    console.error('Error saving master profile', e);
  }
}

/**
 * Get Resume Builder data
 */
export function getResumeData() {
  const emptyFallback = {
    personalInfo: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      avatar: '',
      customFields: [],
    },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: [],
    publications: [],
    openSource: [],
    customSections: [],
  };

  try {
    const saved = localStorage.getItem(RESUME_DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...emptyFallback,
          ...parsed,
          personalInfo: { ...emptyFallback.personalInfo, ...(parsed.personalInfo || {}) },
          experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          education: Array.isArray(parsed.education) ? parsed.education : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          languages: Array.isArray(parsed.languages) ? parsed.languages : [],
          customSections: Array.isArray(parsed.customSections) ? parsed.customSections : [],
        };
      }
    }
  } catch (e) {
    console.error('Error reading resume data', e);
  }

  const converted = convertMasterToResume(getMasterCareerProfile());
  if (converted && typeof converted === 'object') {
    return {
      ...emptyFallback,
      ...converted,
      personalInfo: { ...emptyFallback.personalInfo, ...(converted.personalInfo || {}) },
    };
  }

  return emptyFallback;
}

/**
 * Save Resume Builder data
 */
export function saveResumeData(resumeData, updateMaster = false) {
  try {
    localStorage.setItem(RESUME_DATA_KEY, JSON.stringify(resumeData));
    if (updateMaster) {
      const currentMaster = getMasterCareerProfile();
      const updatedMaster = convertResumeToMaster(resumeData, currentMaster);
      localStorage.setItem(MASTER_PROFILE_KEY, JSON.stringify(updatedMaster));

      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, {
        detail: { masterProfile: updatedMaster, resumeData, source: 'builder' }
      }));
    }
  } catch (e) {
    console.error('Error saving resume data', e);
  }
}

/**
 * Skill Evidence Strength Map Calculator
 */
export function calculateSkillEvidenceMap(profile) {
  const skills = profile.skills || [];
  const experiences = profile.experience || [];
  const projects = profile.projects || [];
  const education = profile.education || [];

  return skills.map(skillItem => {
    const skillName = typeof skillItem === 'string' ? skillItem : skillItem.name;
    const skillLower = skillName.toLowerCase();

    const matchedExperiences = experiences.filter(exp => {
      const text = `${exp.jobTitle} ${exp.company} ${exp.description} ${(exp.responsibilities || []).join(' ')}`.toLowerCase();
      return text.includes(skillLower);
    });

    const matchedProjects = projects.filter(p => {
      const text = `${p.name} ${p.technologies} ${p.description}`.toLowerCase();
      return text.includes(skillLower);
    });

    const evidenceSources = [];
    if (matchedExperiences.length > 0) {
      evidenceSources.push(...matchedExperiences.map(e => ({ type: 'Experience', title: `${e.company} (${e.jobTitle})` })));
    }
    if (matchedProjects.length > 0) {
      evidenceSources.push(...matchedProjects.map(p => ({ type: 'Project', title: p.name })));
    }

    let confidence = 'No Direct Evidence';
    if (evidenceSources.length >= 2) {
      confidence = 'Strong Evidence';
    } else if (evidenceSources.length === 1) {
      confidence = 'Moderate Evidence';
    }

    return {
      name: skillName,
      confidence,
      sourcesCount: evidenceSources.length,
      sources: evidenceSources,
      verified: true
    };
  });
}

/**
 * APPLICATIONS MEMORY SYSTEM
 */
export function getApplicationsMemory() {
  try {
    const saved = localStorage.getItem(APPLICATIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading applications memory', e);
  }
  return [];
}

export function saveApplicationMemory(appData) {
  try {
    const apps = getApplicationsMemory();
    const newApp = {
      id: appData.id || `app_${Date.now()}`,
      company: appData.company || 'Target Employer',
      role: appData.role || 'Target Position',
      jdText: appData.jdText || '',
      matchScore: appData.matchScore || 85,
      resumeVersion: appData.resumeVersion || 'Tailored Version',
      resumeData: appData.resumeData || null,
      coverLetter: appData.coverLetter || '',
      atsReport: appData.atsReport || null,
      appliedDate: appData.appliedDate || new Date().toLocaleDateString(),
      status: appData.status || 'Applied', // 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Archived'
      notes: appData.notes || '',
      effortMinutes: appData.effortMinutes || 15
    };

    const existingIdx = apps.findIndex(a => a.id === newApp.id);
    if (existingIdx >= 0) {
      apps[existingIdx] = newApp;
    } else {
      apps.unshift(newApp);
    }

    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    return newApp;
  } catch (e) {
    console.error('Error saving application memory', e);
  }
}

export function deleteApplicationMemory(id) {
  try {
    const apps = getApplicationsMemory().filter(a => a.id !== id);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Error deleting application memory', e);
  }
}

/**
 * INTERVIEW HUB MEMORY SYSTEM
 */
export function getInterviewMemory() {
  try {
    const saved = localStorage.getItem(INTERVIEWS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading interview memory', e);
  }
  return [];
}

export function saveInterviewEntry(entry) {
  try {
    const interviews = getInterviewMemory();
    const newEntry = {
      id: entry.id || `int_${Date.now()}`,
      company: entry.company || 'Target Company',
      role: entry.role || 'Software Engineer',
      date: entry.date || new Date().toLocaleDateString(),
      questions: entry.questions || [], // [{ question, myAnswer, feedback, category }]
      notes: entry.notes || '',
      status: entry.status || 'Scheduled'
    };
    interviews.unshift(newEntry);
    localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(interviews));
    return newEntry;
  } catch (e) {
    console.error('Error saving interview entry', e);
  }
}

/**
 * Calculate Profile Readiness Score
 */
export function calculateProfileScore(profile) {
  if (!profile) return 0;
  let score = 0;
  if (profile.personalInfo?.fullName) score += 15;
  if (profile.personalInfo?.email) score += 10;
  if (profile.personalInfo?.phone) score += 5;
  if (profile.personalInfo?.headline) score += 10;
  const summaryText = typeof profile.summary === 'string' ? profile.summary : profile.summary?.primary;
  if (summaryText && summaryText.length > 20) score += 15;
  if (profile.experience?.length > 0) score += 20;
  if (profile.education?.length > 0) score += 10;
  if (profile.skills?.length > 0) score += 10;
  if (profile.projects?.length > 0) score += 5;
  return Math.min(100, score);
}
