import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { likeService } from '@/services'
import type { Content } from '@/types'

// Hook to get all user's likes
export function useUserLikes() {
  return useQuery({
    queryKey: ['userLikes'],
    queryFn: () => likeService.getLikes(),
  })
}

// Hook to check if a content is liked
export function useIsLiked(externalId: string, type: string) {
  return useQuery({
    queryKey: ['isLiked', externalId, type],
    queryFn: () => likeService.checkLike(externalId, type),
    enabled: !!externalId && !!type,
  })
}

// Hook to toggle like
export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: {
      externalId: string
      type: 'movie' | 'tv' | 'anime'
      title: string
      posterPath?: string
    }) => likeService.toggleLike(content),
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['userLikes'] })
      queryClient.invalidateQueries({
        queryKey: ['isLiked', variables.externalId, variables.type],
      })
    },
  })
}
