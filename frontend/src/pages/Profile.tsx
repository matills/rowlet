import { Link } from 'react-router-dom'
import { Settings, BarChart3, Calendar, Film, Tv, Clapperboard } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { ContentGrid } from '@/components/content'
import { useAuth, useUserContent, useUserStats } from '@/hooks'

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { data: stats, isLoading: isLoadingStats } = useUserStats()
  const { data: recentContent, isLoading: isLoadingContent } = useUserContent()

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">Perfil</h1>
        <p className="mb-4 text-muted-foreground">
          Inicia sesión para ver tu perfil
        </p>
        <Button asChild>
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    )
  }

  const recentWatched = recentContent
    ?.filter((c) => c.status === 'completed')
    .slice(0, 6)
    .map((c) => c.content) || []

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 md:flex-row md:items-start"
      >
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          <AvatarFallback className="text-2xl">
            {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-2">{user.bio}</p>}

          <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
            <Link to="/profile/settings">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </Link>
            <Link to="/stats">
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Estadísticas
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Películas</p>
              <p className="text-2xl font-bold">{stats?.movieCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Tv className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Series</p>
              <p className="text-2xl font-bold">{stats?.tvCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clapperboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anime</p>
              <p className="text-2xl font-bold">{stats?.animeCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horas vistas</p>
              <p className="text-2xl font-bold">{stats?.totalHoursWatched || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Vistos Recientemente</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="lists">Mis Listas</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          {recentWatched.length > 0 ? (
            <ContentGrid content={recentWatched} isLoading={isLoadingContent} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                Aún no has marcado contenido como visto
              </p>
              <Button className="mt-4" asChild>
                <Link to="/browse">Explorar Contenido</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Los favoritos estarán disponibles próximamente
            </p>
          </div>
        </TabsContent>

        <TabsContent value="lists" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Aún no has creado ninguna lista
            </p>
            <Button className="mt-4" variant="outline">
              Crear Lista
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Favorite Genres */}
      {stats?.favoriteGenres && stats.favoriteGenres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Géneros Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.favoriteGenres.slice(0, 5).map((genreStat) => (
                <div key={genreStat.genre.id} className="flex items-center gap-4">
                  <span className="w-24 text-sm">{genreStat.genre.name}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${genreStat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {genreStat.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
