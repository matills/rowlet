import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Film,
  Tv,
  Clapperboard,
  Star,
  TrendingUp,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui'
import { useAuth, useWrapped } from '@/hooks'

const CURRENT_YEAR = new Date().getFullYear()

export function WrappedPage() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const { user, isAuthenticated } = useAuth()
  const { data: wrapped, isLoading } = useWrapped(selectedYear)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Tu Resumen Anual</h1>
          <p className="mb-4 text-muted-foreground">
            Inicia sesión para ver tu resumen de contenido del año
          </p>
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const availableYears = Array.from(
    { length: CURRENT_YEAR - 2023 + 1 },
    (_, i) => 2023 + i
  )

  const canGoBack = selectedYear > Math.min(...availableYears)
  const canGoForward = selectedYear < CURRENT_YEAR

  return (
    <div className="space-y-8">
      {/* Header with Year Selector */}
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text">
            Tu Resumen {selectedYear}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Descubre todo lo que has visto este año
          </p>
        </motion.div>

        {/* Year Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedYear(selectedYear - 1)}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            {availableYears.map((year) => (
              <Button
                key={year}
                variant={year === selectedYear ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedYear(selectedYear + 1)}
            disabled={!canGoForward}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : wrapped?.totalContentWatched === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            No hay datos para {selectedYear}
          </h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            No has marcado contenido como completado este año. ¡Empieza a ver y
            trackear tu contenido!
          </p>
          <Button asChild>
            <Link to="/browse">Explorar Contenido</Link>
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Main Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Visto
                      </p>
                      <p className="text-3xl font-bold">
                        {wrapped?.totalContentWatched || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                      <Film className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Películas
                      </p>
                      <p className="text-3xl font-bold">
                        {wrapped?.contentByType?.movies || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                      <Tv className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Series</p>
                      <p className="text-3xl font-bold">
                        {wrapped?.contentByType?.tvShows || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                      <Clapperboard className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Anime</p>
                      <p className="text-3xl font-bold">
                        {wrapped?.contentByType?.anime || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hours Watched */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tiempo Total de Visualización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold">
                    {wrapped?.totalHoursWatched || 0}
                  </p>
                  <p className="text-2xl text-muted-foreground">horas</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Eso es aproximadamente{' '}
                  {Math.round((wrapped?.totalHoursWatched || 0) / 24)} días de
                  contenido
                </p>
              </CardContent>
            </Card>

            {/* Top Genres */}
            {wrapped?.topGenres && wrapped.topGenres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Géneros Más Vistos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wrapped.topGenres.slice(0, 5).map((genre, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    ¡Comparte tu Resumen!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Muéstrales a tus amigos lo que has visto este año
                  </p>
                </div>
                <Button className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartir
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
