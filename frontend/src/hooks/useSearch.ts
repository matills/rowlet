import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchParams } from '@/lib/api';

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => api.search(params),
    enabled: params.query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useContentDetails(
  source: 'tmdb' | 'anilist',
  externalId: string,
  type?: 'movie' | 'series' | 'anime'
) {
  return useQuery({
    queryKey: ['content', source, externalId, type],
    queryFn: () => api.getContentDetails(source, externalId, type),
    enabled: !!externalId,
  });
}
