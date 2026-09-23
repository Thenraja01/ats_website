import api, { careerAPI } from './api';
import {
  getMasterCareerProfile,
  saveMasterCareerProfile,
} from './careerProfileSync';

/**
 * Bridge between the legacy localStorage Career Vault and HireMind's
 * backend career profile. Pushes/pulls the master profile without
 * duplicating logic — the backend is the durable source of truth.
 */

function normalizeToBackend(master) {
  const m = master || {};
  return {
    personalInfo: {
      ...(m.personalInfo || {}),
      customFields: (m.personalInfo?.customFields || []).map((f) =>
        typeof f === 'string' ? { key: f, value: f } : f
      ),
    },
    summary: {
      primary:
        typeof m.summary === 'string'
          ? m.summary
          : m.summary?.primary || '',
      targetRoles: m.summary?.targetRoles || [],
      style: m.summary?.style || m.voiceProfile?.style || 'Professional',
    },
    experience: (m.experience || []).map((e) => ({
      id: e.id || '',
      company: e.company || '',
      jobTitle: e.jobTitle || '',
      location: e.location || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      current: Boolean(e.current),
      description: e.description || '',
      responsibilities: e.responsibilities || [],
    })),
    education: (m.education || []).map((e) => ({
      id: e.id || '',
      institution: e.institution || '',
      degree: e.degree || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      gpa: e.gpa || '',
    })),
    projects: (m.projects || []).map((p) => ({
      id: p.id || '',
      name: p.name || '',
      technologies: Array.isArray(p.technologies)
        ? p.technologies.join(', ')
        : p.technologies || '',
      startDate: p.startDate || '',
      url: p.url || p.link || p.githubUrl || '',
      link: p.link || '',
      githubUrl: p.githubUrl || '',
      description: p.description || '',
      highlights: p.highlights || [],
    })),
    skills: (m.skills || []).map((s) =>
      typeof s === 'string'
        ? { name: s, category: 'Technical', proficiency: 'Advanced' }
        : s
    ),
    certifications: (m.certifications || []).map((c) => ({
      id: c.id || '',
      name: c.name || '',
      organization: c.organization || c.issuer || '',
      issueDate: c.issueDate || c.year || '',
    })),
    achievements: m.achievements || [],
    languages: m.languages || [],
    publications: m.publications || [],
    links: m.links || [],
    openSource: m.openSource || [],
    customSections: m.customSections || [],
  };
}

export async function pushMasterToCloud() {
  const master = getMasterCareerProfile();
  const payload = normalizeToBackend(master);
  const res = await careerAPI.save(payload);
  return res.data;
}

export async function fetchVaultFromCloud() {
  const res = await careerAPI.get();
  const data = res.data;
  if (data && data.personalInfo) {
    saveMasterCareerProfile({
      personalInfo: data.personalInfo || {},
      summary: data.summary || {},
      experience: data.experience || [],
      education: data.education || [],
      projects: data.projects || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      achievements: data.achievements || [],
      languages: data.languages || [],
      publications: data.publications || [],
      openSource: data.openSource || [],
      customSections: data.customSections || [],
      voiceProfile: {
        style: data.summary?.style || 'Professional',
        preserveMetricsOnly: true,
      },
    });
  }
  return data;
}

export { api };