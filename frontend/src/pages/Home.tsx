import { Link } from 'react-router-dom'
import { ArrowRight, Play, TrendingUp, Film, Tv, Clapperboard } from 'lucide-react'
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
    <div className="space-y-10">
      {/* Hero Section with Background Image */}
      <section className="relative -mx-4 -mt-4 overflow-hidden md:-mx-6 lg:-mx-8">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="relative z-10 px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="gradient-text">Trackea</span> tu entretenimiento favorito
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Lleva un seguimiento de las películas, series y anime que has visto,
              estás viendo o planeas ver. Descubre nuevo contenido y comparte con amigos.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <Play className="h-5 w-5" />
                      Comenzar Ahora
                    </Button>
                  </Link>
                  <Link to="/browse">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                      Explorar Contenido
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <SearchBar className="max-w-md" placeholder="¿Qué quieres ver hoy?" />
                  <Link to="/browse">
                    <Button size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Explorar
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Stats for non-authenticated users */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 flex flex-wrap gap-8"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">10K+</p>
                    <p className="text-sm text-muted-foreground">Películas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                    <Tv className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5K+</p>
                    <p className="text-sm text-muted-foreground">Series</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <Clapperboard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3K+</p>
                    <p className="text-sm text-muted-foreground">Anime</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Trending Movies */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold md:text-2xl">Películas en Tendencia</h2>
          </div>
          <Link
            to="/movies"
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ContentGrid
          content={trendingMovies?.data.slice(0, 6) || []}
          isLoading={isLoadingMovies}
          onAddToList={
            isAuthenticated
              ? (content, status) => addToList.mutate({ content, status })
              : undefined
          }
        />
      </section>

      {/* Trending TV Shows */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <TrendingUp className="h-4 w-4 text-secondary" />
            </div>
            <h2 className="text-xl font-bold md:text-2xl">Series en Tendencia</h2>
          </div>
          <Link
            to="/tv"
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ContentGrid
          content={trendingTV?.data.slice(0, 6) || []}
          isLoading={isLoadingTV}
          onAddToList={
            isAuthenticated
              ? (content, status) => addToList.mutate({ content, status })
              : undefined
          }
        />
      </section>

      {/* Trending Anime */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-xl font-bold md:text-2xl">Anime en Tendencia</h2>
          </div>
          <Link
            to="/anime"
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ContentGrid
          content={trendingAnime?.data.slice(0, 6) || []}
          isLoading={isLoadingAnime}
          onAddToList={
            isAuthenticated
              ? (content, status) => addToList.mutate({ content, status })
              : undefined
          }
        />
      </section>

      {/* Features Section */}
      {!isAuthenticated && (
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold md:text-3xl">
              Todo lo que necesitas para tu entretenimiento
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Owlist te ayuda a organizar y descubrir el mejor contenido
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="card-hover h-full">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Film className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Tracking Personalizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Marca contenido como "Viendo", "Completado" o "Planeado" y nunca pierdas el hilo de lo que estás viendo.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="card-hover h-full">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Estadísticas Detalladas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Descubre tus géneros favoritos, horas vistas y más con estadísticas detalladas y tu Wrapped anual.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="card-hover h-full">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                    <Clapperboard className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Listas Personalizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crea listas temáticas para organizar tu contenido y compártelas con tus amigos.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
