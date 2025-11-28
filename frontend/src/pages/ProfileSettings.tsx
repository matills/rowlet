import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui'
import { useAuth } from '@/hooks'

const profileSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').max(30),
  bio: z.string().max(200, 'La biografía no puede tener más de 200 caracteres').optional(),
  email: z.string().email('Email inválido'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      email: user?.email || '',
    },
  })

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">Configuración de Perfil</h1>
        <p className="mb-4 text-muted-foreground">
          Inicia sesión para editar tu perfil
        </p>
        <Button asChild>
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = async (data: ProfileForm) => {
    try {
      setError(null)
      setSuccess(false)
      setIsLoading(true)

      // TODO: Implement profile update API call
      // await authService.updateProfile(data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)

      // Redirect back to profile after 1.5 seconds
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // TODO: Upload avatar to server
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">
            Actualiza tu información personal
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} alt={user.displayName} />
                  <AvatarFallback className="text-2xl">
                    {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => document.getElementById('avatar')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Cambiar Foto
                    </Button>
                  </label>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Nombre de Visualización
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Tu nombre"
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Nombre de Usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Cuéntanos sobre ti..."
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-xs text-destructive">{errors.bio.message}</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                  ¡Perfil actualizado exitosamente! Redirigiendo...
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/profile')}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              ¿Necesitas cambiar tu contraseña?
            </p>
            <Link to="/forgot-password">
              <Button variant="outline">
                Solicitar Cambio de Contraseña
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
