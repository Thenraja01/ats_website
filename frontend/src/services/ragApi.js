import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const ragApi = {
  ingestData: async (filePath = '../data/jobs.csv') => {
    const response = await axios.post(`${API_URL}/rag/ingest`, { file_path: filePath });
    return response.data;
  },
  
  queryRag: async (query, topK = 5) => {
    const response = await axios.post(`${API_URL}/rag/query`, { query, top_k: topK });
    return response.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/resume/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  analyzeResume: async ({ resumeText, jdText }) => {
    const response = await axios.post(`${API_URL}/resume/analyze`, {
      resume_text: resumeText,
      jd_text: jdText,
    });
    return response.data;
  }
};
