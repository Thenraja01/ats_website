import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  resumeData: null,
  isProcessing: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setResumeData: (data) => set({ resumeData: data }),
  setIsProcessing: (status) => set({ isProcessing: status }),
}));

export default useAppStore;
