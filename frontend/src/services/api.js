import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: (data) => api.post('/resume/analyze', data),
  getResult: (id) => api.get(`/resume/result/${id}`),
};

export const adminAPI = {
  getCandidates: () => api.get('/admin/candidates'),
  getTopCandidates: () => api.get('/admin/top-candidates'),
};

export default api;
