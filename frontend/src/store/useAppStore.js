import { create } from 'zustand';

const token = localStorage.getItem('token');

const useAppStore = create((set) => ({
  user: token ? { token } : null,
  isAuthenticated: !!token,
  resumeData: null,
  isProcessing: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setResumeData: (data) => set({ resumeData: data }),
  setIsProcessing: (status) => set({ isProcessing: status }),
}));

export default useAppStore;
