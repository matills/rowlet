import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores'
import { authService } from '@/services'

export function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // We just need to get the session and sync with our backend
        const response = await authService.handleOAuthCallback()

        if (response && response.user && response.token) {
          // Store user and token
          setUser(response.user)
          setToken(response.token)

          // Redirect to home
          navigate('/', { replace: true })
        } else {
          throw new Error('No se pudo completar la autenticación')
        }
      } catch (err) {
        console.error('OAuth error:', err)
        setError('Error al iniciar sesión con Google. Por favor intenta de nuevo.')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate, setUser, setToken])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
              <p className="text-lg font-medium">{error}</p>
              <p className="mt-2 text-sm">Redirigiendo al inicio de sesión...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Completando inicio de sesión...</p>
            <p className="text-sm text-muted-foreground">Por favor espera un momento</p>
          </div>
        )}
      </div>
    </div>
  )
}
