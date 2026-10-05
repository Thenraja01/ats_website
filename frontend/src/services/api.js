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
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getProfile: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  parseStructured: (formData) => api.post('/resume/parse-structured', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: (data) => api.post('/resume/analyze', data),
  getFonts: (params) => api.get('/resume/fonts', { params }),
  exportDocx: (data) => api.post('/resume/export-docx', data, { responseType: 'blob' }),
  getResult: (id) => api.get(`/resume/result/${id}`),
  getHistory: (skip = 0, limit = 20) => api.get(`/resume/history?skip=${skip}&limit=${limit}`),
  getHistoryStats: () => api.get('/resume/history/stats'),
};

export const applicationsAPI = {
  list: (params) => api.get('/applications', { params }),
  get: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

export const jdAPI = {
  analyze: (data) => api.post('/jd/analyze', data),
  match: (data) => api.post('/jd/match', data),
  generateCoverLetter: (data) => api.post('/jd/cover-letter', data),
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

// Aliases for compatibility with any legacy helper components
export const candidateAPI = {
  getResumes: () => studioAPI.listResumes(),
  uploadResume: (formData) => resumeAPI.upload(formData),
  deleteResume: (id) => studioAPI.deleteResume(id),
  getApplications: () => applicationsAPI.list(),
  getApplication: (id) => applicationsAPI.get(id),
  updateApplicationStatus: (id, status) => applicationsAPI.update(id, { status }),
  generateCoverLetter: (data) => jdAPI.generateCoverLetter(data),
  browseJobs: () => Promise.resolve({ data: [] }),
};

export const recruiterAPI = {
  getApplications: () => applicationsAPI.list(),
  updateApplicationStatus: (id, status) => applicationsAPI.update(id, { status }),
  batchScreen: () => Promise.resolve({ data: [] }),
};

export const adminAPI = {
  getStats: () => dashboardAPI.get(),
};

export default api;
