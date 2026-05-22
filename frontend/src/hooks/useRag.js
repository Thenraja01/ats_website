import { useMutation, useQuery } from '@tanstack/react-query';
import { ragApi } from '../services/ragApi';

export const useIngestData = () => {
  return useMutation({
    mutationFn: (filePath) => ragApi.ingestData(filePath),
  });
};

export const useRagQuery = () => {
  return useMutation({
    mutationFn: ({ query, topK }) => ragApi.queryRag(query, topK),
  });
};
