import { api } from './api'
import type { User, LoginCredentials, RegisterCredentials } from '@/types'

interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/profile')
    return data
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile', updates)
    return data
  },

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${api.defaults.baseURL}/auth/google`
  },
}
