import { Link } from 'react-router-dom'
import { ArrowRight, Play, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ContentGrid, SearchBar } from '@/components/content'
import { useTrendingContent, useAuth, useAddToList } from '@/hooks'

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const { data: trendingMovies, isLoading: isLoadingMovies } = useTrendingContent('movie')
  const { data: trendingTV, isLoading: isLoadingTV } = useTrendingContent('tv')
  const { data: trendingAnime, isLoading: isLoadingAnime } = useTrendingContent('anime')
  const addToList = useAddToList()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-2xl"
        >
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Tu compañero de entretenimiento
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Haz seguimiento de las películas, series y anime que has visto, estás viendo
            o planeas ver. Descubre nuevo contenido y comparte con amigos.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <SearchBar className="max-w-md" placeholder="¿Qué quieres ver hoy?" />
          </div>
          <div className="mt-6 flex gap-4">
            <Link to="/browse">
              <Button size="lg">
                <Play className="mr-2 h-4 w-4" />
                Explorar
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" variant="outline">
                  Crear Cuenta
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Trending Movies */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Películas en Tendencia</h2>
          </div>
          <Link to="/movies" className="flex items-center text-sm text-primary hover:underline">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <ContentGrid
          content={trendingMovies?.data.slice(0, 6) || []}
          isLoading={isLoadingMovies}
          onAddToList={
            isAuthenticated
              ? (contentId, status) => addToList.mutate({ contentId, status })
              : undefined
          }
        />
      </section>

      {/* Trending TV Shows */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Series en Tendencia</h2>
          </div>
          <Link to="/tv" className="flex items-center text-sm text-primary hover:underline">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <ContentGrid
          content={trendingTV?.data.slice(0, 6) || []}
          isLoading={isLoadingTV}
          onAddToList={
            isAuthenticated
              ? (contentId, status) => addToList.mutate({ contentId, status })
              : undefined
          }
        />
      </section>

      {/* Trending Anime */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Anime en Tendencia</h2>
          </div>
          <Link to="/anime" className="flex items-center text-sm text-primary hover:underline">
            Ver todos
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <ContentGrid
          content={trendingAnime?.data.slice(0, 6) || []}
          isLoading={isLoadingAnime}
          onAddToList={
            isAuthenticated
              ? (contentId, status) => addToList.mutate({ contentId, status })
              : undefined
          }
        />
      </section>

      {/* Features Section */}
      {!isAuthenticated && (
        <section className="py-8">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Todo lo que necesitas para tu entretenimiento
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Marca contenido como "Viendo", "Visto" o "Por ver" y nunca pierdas el hilo.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas Detalladas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Descubre tus géneros favoritos, horas vistas y más con tu Wrapped anual.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Listas Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Crea listas temáticas y compártelas con tus amigos.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
