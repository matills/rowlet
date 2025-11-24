import { Link } from 'react-router-dom'
import { TrendingUp, Clock, Film, Tv, Clapperboard, Calendar, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { useAuth, useUserStats, useWrapped } from '@/hooks'

export function StatsPage() {
  const { isAuthenticated } = useAuth()
  const { data: stats, isLoading: isLoadingStats } = useUserStats()
  const currentYear = new Date().getFullYear()
  const { data: wrapped, isLoading: isLoadingWrapped } = useWrapped(currentYear)

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">Estadísticas</h1>
        <p className="mb-4 text-muted-foreground">
          Inicia sesión para ver tus estadísticas personalizadas
        </p>
        <Button asChild>
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Estadísticas</h1>
          <p className="text-muted-foreground">
            Tu actividad de entretenimiento en números
          </p>
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Ver Wrapped {currentYear}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Visto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalWatched || 0}</div>
              <p className="text-xs text-muted-foreground">contenidos completados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalHoursWatched || 0}</div>
              <p className="text-xs text-muted-foreground">
                ~{Math.round((stats?.totalHoursWatched || 0) / 24)} días
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Viendo Ahora</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalWatching || 0}</div>
              <p className="text-xs text-muted-foreground">en progreso</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Por Ver</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPlanToWatch || 0}</div>
              <p className="text-xs text-muted-foreground">en la lista</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content by Type */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Film className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle>Películas</CardTitle>
              <CardDescription>{stats?.movieCount || 0} vistas</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Tv className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <CardTitle>Series</CardTitle>
              <CardDescription>{stats?.tvCount || 0} vistas</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Clapperboard className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle>Anime</CardTitle>
              <CardDescription>{stats?.animeCount || 0} vistos</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Favorite Genres & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Favorite Genres */}
        <Card>
          <CardHeader>
            <CardTitle>Géneros Favoritos</CardTitle>
            <CardDescription>Basado en tu historial de visualización</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.favoriteGenres && stats.favoriteGenres.length > 0 ? (
              <div className="space-y-4">
                {stats.favoriteGenres.slice(0, 5).map((genreStat, index) => (
                  <div key={genreStat.genre.id} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="w-28 text-sm font-medium">
                      {genreStat.genre.name}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${genreStat.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {genreStat.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Ve más contenido para ver tus géneros favoritos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Mensual</CardTitle>
            <CardDescription>Contenido visto por mes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.monthlyActivity && stats.monthlyActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.monthlyActivity.slice(-6).map((month) => (
                  <div key={month.month} className="flex items-center gap-4">
                    <span className="w-20 text-sm">{month.month}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (month.count / Math.max(...stats.monthlyActivity.map((m) => m.count))) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {month.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Aún no hay datos de actividad
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wrapped CTA */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-background">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <h3 className="text-xl font-bold">Tu Wrapped {currentYear}</h3>
            <p className="text-muted-foreground">
              Descubre tu año en entretenimiento con estadísticas detalladas,
              gráficos visuales y más.
            </p>
          </div>
          <Button size="lg">
            Ver Mi Wrapped
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
