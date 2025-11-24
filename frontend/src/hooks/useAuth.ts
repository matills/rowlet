import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services'
import { useAuthStore } from '@/stores'
import type { LoginCredentials, RegisterCredentials } from '@/types'

export function useAuth() {
  const queryClient = useQueryClient()
  const { user, token, isAuthenticated, setUser, setToken, setLoading, logout } = useAuthStore()

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: !!token,
    onSuccess: (data) => {
      setUser(data)
      setLoading(false)
    },
    onError: () => {
      logout()
      setLoading(false)
    },
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      setUser(data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading: profileQuery.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    loginWithGoogle: authService.loginWithGoogle,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
