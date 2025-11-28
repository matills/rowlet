import { api } from './api'
import { supabase } from '@/config/supabase'
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
    // Sign out from Supabase
    await supabase.auth.signOut()
    // Also call backend logout if using traditional auth
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore backend logout errors
    }
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  },

  async handleOAuthCallback(): Promise<AuthResponse | null> {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    // Get or create user in backend
    try {
      const { data } = await api.post<AuthResponse>('/auth/oauth', {
        supabaseToken: session.access_token,
        email: session.user.email,
        name: session.user.user_metadata.full_name || session.user.user_metadata.name,
        avatarUrl: session.user.user_metadata.avatar_url,
      })

      return data
    } catch (error) {
      console.error('Error syncing user with backend:', error)
      return null
    }
  },
}
