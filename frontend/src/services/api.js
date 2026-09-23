import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.hiremind.ai' : 'http://localhost:8000');
const API_URL = `${API_BASE}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear auth state on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role = 'candidate', organization_id = null) =>
    api.post('/auth/register', { name, email, password, role, organization_id }),
  googleAuth: (credential, role = 'candidate') => api.post('/auth/google', { credential, role }),
  getProfile: () => api.get('/auth/me'),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: (data) => api.post('/resume/analyze', data),
  getResult: (id) => api.get(`/resume/result/${id}`),
  getHistory: (skip = 0, limit = 20) => api.get(`/resume/history?skip=${skip}&limit=${limit}`),
  getHistoryStats: () => api.get('/resume/history/stats'),
};

export const candidateAPI = {
  getResumes: () => api.get('/candidate/resumes'),
  uploadResume: (formData) => api.post('/candidate/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteResume: (id) => api.delete(`/candidate/resumes/${id}`),
  getApplications: () => api.get('/candidate/applications'),
  getApplication: (id) => api.get(`/candidate/applications/${id}`),
  updateApplicationStatus: (id, status) => api.patch(`/candidate/applications/${id}/status`, { status }),
  applyToJob: (jobId, resumeId, resumeVersionId) => {
    const params = new URLSearchParams();
    if (resumeId) params.set('resume_id', resumeId);
    if (resumeVersionId) params.set('resume_version_id', resumeVersionId);
    return api.post(`/candidate/jobs/${jobId}/apply?${params.toString()}`);
  },
  generateCoverLetter: (data) => api.post('/candidate/cover-letter', data),
  browseJobs: (params) => api.get('/recruiter/jobs/browse', { params }),
};

export const publicAPI = {
  getOrgJobs: (orgId) => api.get(`/public/organizations/${orgId}/jobs`),
  getJobDetails: (orgId, jobId) => api.get(`/public/organizations/${orgId}/jobs/${jobId}`),
  applyPublic: (orgId, jobId, formData) => api.post(`/public/organizations/${orgId}/jobs/${jobId}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const recruiterAPI = {
  getJobs: () => api.get('/recruiter/jobs'),
  getJob: (id) => api.get(`/recruiter/jobs/${id}`),
  createJob: (data) => api.post('/recruiter/jobs', data),
  updateJob: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruiter/jobs/${id}`),
  optimizeJobText: (text) => api.post('/recruiter/jobs/optimize-text', { text }),
  getApplications: (jobId) => api.get(`/recruiter/jobs/${jobId}/applications`),
  getAllApplications: () => api.get('/recruiter/applications'),
  updateApplicationStatus: (id, status) => api.put(`/recruiter/applications/${id}/status`, { status }),
  getFilteredCandidates: (params) => api.get('/recruiter/candidates/filter', { params }),
  getJobRankings: (jobId) => api.get(`/recruiter/jobs/${jobId}/rankings`),
  batchScreen: (jobId, formData) => api.post(`/recruiter/jobs/${jobId}/batch-screen`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAnalytics: () => api.get('/recruiter/analytics'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getCandidates: () => api.get('/admin/candidates'),
  getTopCandidates: () => api.get('/admin/top-candidates'),
  getOrganizations: () => api.get('/admin/organizations'),
  createOrganization: (data) => api.post('/admin/organizations', data),
  updateOrganization: (id, data) => api.put(`/admin/organizations/${id}`, data),
  deleteOrganization: (id) => api.delete(`/admin/organizations/${id}`),
  getRecruiters: () => api.get('/admin/recruiters'),
  updateRecruiter: (id, data) => api.put(`/admin/recruiters/${id}`, data),
};

export const careerAPI = {
  get: () => api.get('/career'),
  save: (data) => api.put('/career', data),
  updateSection: (section, data) => api.patch(`/career/section/${section}`, data),
  completion: () => api.get('/career/completion'),
};

export const studioAPI = {
  templates: () => api.get('/studio/templates'),
  listResumes: (skip = 0, limit = 50) => api.get(`/studio/resumes?skip=${skip}&limit=${limit}`),
  getResume: (id) => api.get(`/studio/resumes/${id}`),
  createResume: (data) => api.post('/studio/resumes', data),
  updateResume: (id, data) => api.put(`/studio/resumes/${id}`, data),
  deleteResume: (id) => api.delete(`/studio/resumes/${id}`),
  duplicateResume: (id) => api.post(`/studio/resumes/${id}/duplicate`),
  runAts: (id) => api.post(`/studio/resumes/${id}/ats`),
  analyzeJd: ({ jdText }) => api.post('/studio/analyze-jd', { jd_text: jdText }),
  match: ({ resumeId, jdText, resumeText }) =>
    api.post('/studio/match', {
      resume_id: resumeId,
      jd_text: jdText,
      resume_text: resumeText,
    }),
  tailorAssess: (data) => api.post('/studio/tailor/assess', data),
  tailorCreate: (data) => api.post('/studio/tailor/create', data),
};

export const jobsAPI = {
  browse: (params) => api.get('/recruiter/jobs/browse', { params }),
  analyze: ({ jdText }) => api.post('/studio/analyze-jd', { jd_text: jdText }),
  match: ({ resumeId, jdText, resumeText }) =>
    api.post('/studio/match', {
      resume_id: resumeId,
      jd_text: jdText,
      resume_text: resumeText,
    }),
  getJob: (id) => api.get(`/recruiter/jobs/${id}`),
};

export const interviewAPI = {
  meta: () => api.get('/interview/meta'),
  questions: ({ category, difficulty, savedOnly, search, limit, offset } = {}) =>
    api.get('/interview/questions', {
      params: {
        category: category || 'All',
        difficulty: difficulty || 'All',
        saved_only: Boolean(savedOnly),
        search: search || '',
        limit: limit || 100,
        offset: offset || 0,
      },
    }),
  createQuestion: (data) => api.post('/interview/questions', data),
  saveQuestion: (id, saved = true) => api.put(`/interview/questions/${id}/save`, { saved }),
  deleteQuestion: (id) => api.delete(`/interview/questions/${id}`),
  generateProjectQuestions: (data) => api.post('/interview/project-questions', data),
  sessions: () => api.get('/interview/sessions'),
  createSession: ({ sessionType = 'mock', title, jobTitle, category, difficulty, count, questionIds, resumeVersionId } = {}) =>
    api.post('/interview/sessions', {
      session_type: sessionType,
      title,
      job_title: jobTitle,
      category: category || 'All',
      difficulty: difficulty || 'All',
      count: count || 10,
      question_ids: questionIds,
      resume_version_id: resumeVersionId,
    }),
  getSession: (id) => api.get(`/interview/sessions/${id}`),
  answer: (id, data) => api.post(`/interview/sessions/${id}/answer`, data),
  complete: (id) => api.post(`/interview/sessions/${id}/complete`),
};

export const documentsAPI = {
  categories: () => api.get('/documents/categories'),
  list: (params) => api.get('/documents', { params }),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  remove: (id) => api.delete(`/documents/${id}`),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const intelligenceAPI = {
  overview: () => api.get('/intelligence/overview'),
  activity: () => api.get('/intelligence/activity'),
};

export default api;
