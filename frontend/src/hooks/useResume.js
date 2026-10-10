import { useMutation } from '@tanstack/react-query';
import { resumeAPI } from '../services/api';

export const useUploadResume = () => {
  return useMutation({
    mutationFn: async (file) => {
      const res = await resumeAPI.upload(file);
      return res.data;
    },
  });
};

export const useAnalyzeResume = () => {
  return useMutation({
    mutationFn: async ({ resumeText, jdText }) => {
      const res = await resumeAPI.analyze({ resume_text: resumeText, jd_text: jdText });
      return res.data;
    },
  });
};