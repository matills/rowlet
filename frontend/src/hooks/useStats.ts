import { useQuery } from '@tanstack/react-query'
import { statsService } from '@/services'

export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: statsService.getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useWrapped(year?: number) {
  return useQuery({
    queryKey: ['wrapped', year],
    queryFn: () => statsService.getWrapped(year),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: year !== undefined,
  })
}
