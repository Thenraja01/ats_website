import { useMutation } from '@tanstack/react-query';
import { ragApi } from '../services/ragApi';

export const useUploadResume = () => {
  return useMutation({
    mutationFn: (file) => ragApi.uploadResume(file),
  });
};

export const useAnalyzeResume = () => {
  return useMutation({
    mutationFn: ({ resumeText, jdText }) => ragApi.analyzeResume({ resumeText, jdText }),
  });
};
