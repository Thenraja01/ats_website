import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/signup', data),
  sendOtp: (email, purpose = 'signup') => api.post('/auth/send-otp', { email, purpose }),
  verifyOtp: (email, code, purpose = 'signup') => api.post('/auth/verify-otp', { email, code, purpose }),
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
};

export const recruiterAPI = {
  getJobs: () => api.get('/recruiter/jobs'),
  createJob: (data) => api.post('/recruiter/jobs', data),
  updateJob: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/recruiter/jobs/${id}`),
  optimizeJob: (id) => api.post(`/recruiter/jobs/${id}/optimize`),
  getApplications: (jobId) => api.get(`/recruiter/jobs/${jobId}/applications`),
  getAllApplications: () => api.get('/recruiter/applications'),
  updateApplicationStatus: (id, status) => api.put(`/recruiter/applications/${id}/status`, { status }),
  getFilteredCandidates: (params) => api.get('/recruiter/candidates/filter', { params }),
  getJobRankings: (jobId) => api.get(`/recruiter/jobs/${jobId}/rankings`),
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

export default api;
