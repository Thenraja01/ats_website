import { useMutation } from '@tanstack/react-query';
import { resumeAPI } from '../services/api';

export const useUploadResume = () => {
  return useMutation({
    mutationFn: (file) => resumeAPI.upload(file),
  });
};

export const useAnalyzeResume = () => {
  return useMutation({
    mutationFn: ({ resumeText, jdText }) => resumeAPI.analyze({ resume_text: resumeText, jd_text: jdText }),
  });
};