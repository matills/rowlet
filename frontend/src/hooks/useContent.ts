import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contentService } from '@/services'
import type { ContentType, SearchFilters, WatchStatus } from '@/types'

export function useContentSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['content', 'search', filters],
    queryFn: () => contentService.search(filters),
    enabled: !!filters.query && filters.query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useContentDetails(type: ContentType, externalId: string) {
  return useQuery({
    queryKey: ['content', type, externalId],
    queryFn: () => contentService.getById(type, externalId),
    enabled: !!externalId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useTrendingContent(type?: ContentType) {
  return useQuery({
    queryKey: ['content', 'trending', type],
    queryFn: () => contentService.getTrending(type),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useUserContent(status?: WatchStatus) {
  return useQuery({
    queryKey: ['userContent', status],
    queryFn: () => contentService.getUserContent(status),
  })
}

export function useAddToList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contentId, status }: { contentId: string; status: WatchStatus }) =>
      contentService.addToList(contentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userContent'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
  })
}

export function useUpdateUserContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userContentId,
      updates,
    }: {
      userContentId: string
      updates: Parameters<typeof contentService.updateUserContent>[1]
    }) => contentService.updateUserContent(userContentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userContent'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
  })
}

export function useRemoveFromList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: contentService.removeFromList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userContent'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })
    },
  })
}
