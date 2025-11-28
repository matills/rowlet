import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Calendar, Clock, Plus, Check, Eye, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui'
import { useContentDetails, useAuth, useAddToList } from '@/hooks'
import type { ContentType, WatchStatus } from '@/types'
import { useState } from 'react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original'
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

const typeLabels: Record<string, string> = {
  movie: 'Película',
  tv: 'Serie',
  anime: 'Anime',
}

const statusLabels: Record<WatchStatus, string> = {
  watching: 'Viendo',
  completed: 'Completado',
  plan_to_watch: 'Planeado',
  on_hold: 'En espera',
  dropped: 'Abandonado',
}

export function ContentDetailsPage() {
  const { type, id } = useParams<{ type: ContentType; id: string }>()
  const { isAuthenticated } = useAuth()
  const { data: content, isLoading, error } = useContentDetails(type!, id!)
  const addToList = useAddToList()
  const [selectedStatus, setSelectedStatus] = useState<WatchStatus | null>(null)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold">Contenido no encontrado</h2>
        <p className="mt-2 text-muted-foreground">
          No pudimos encontrar la información de este contenido
        </p>
        <Link to="/" className="mt-6">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  const backdropUrl =
    content.backdropPath && content.backdropPath.startsWith('http')
      ? content.backdropPath
      : content.backdropPath
      ? `${TMDB_IMAGE_BASE}${content.backdropPath}`
      : null

  const posterUrl =
    content.posterPath && content.posterPath.startsWith('http')
      ? content.posterPath
      : content.posterPath
      ? `${TMDB_POSTER_BASE}${content.posterPath}`
      : '/placeholder-poster.jpg'

  const handleAddToList = (status: WatchStatus) => {
    if (!isAuthenticated) return

    addToList.mutate(
      {
        content: {
          externalId: content.externalId,
          type: content.type,
          title: content.title,
          posterPath: content.posterPath,
        },
        status,
      },
      {
        onSuccess: () => {
          setSelectedStatus(status)
        },
      }
    )
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      {/* Hero Section with Backdrop */}
      <div className="relative -mx-4 -mt-4 overflow-hidden rounded-b-2xl md:-mx-6 lg:-mx-8">
        {/* Backdrop Image */}
        {backdropUrl && (
          <div className="absolute inset-0">
            <img
              src={backdropUrl}
              alt={content.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
          </div>
        )}

        <div className="relative z-10 px-4 py-8 md:px-6 md:py-12 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <img
                src={posterUrl}
                alt={content.title}
                className="w-48 rounded-xl shadow-2xl md:w-64"
              />
            </motion.div>

            {/* Content Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-1 flex-col justify-center"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={content.type as any}>{typeLabels[content.type]}</Badge>
                {content.status && (
                  <Badge variant="secondary">{content.status}</Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                {content.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                {content.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{content.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">/10</span>
                  </div>
                )}

                {content.releaseDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(content.releaseDate).getFullYear()}
                  </div>
                )}

                {content.runtime && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {content.runtime} min
                  </div>
                )}
              </div>

              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.genres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {content.overview && (
                <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
                  {content.overview}
                </p>
              )}

              {/* Action Buttons */}
              {isAuthenticated && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {selectedStatus ? (
                    <Button size="lg" variant="secondary" disabled>
                      <Check className="mr-2 h-5 w-5" />
                      {statusLabels[selectedStatus]}
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        onClick={() => handleAddToList('watching')}
                        disabled={addToList.isPending}
                      >
                        <Eye className="mr-2 h-5 w-5" />
                        Viendo
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => handleAddToList('plan_to_watch')}
                        disabled={addToList.isPending}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Agregar a lista
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleAddToList('completed')}
                        disabled={addToList.isPending}
                      >
                        <Check className="mr-2 h-5 w-5" />
                        Completado
                      </Button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Production Info */}
        {(content.studios || content.productionCompanies) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Producción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {(content.studios || content.productionCompanies)?.map((company) => (
                  <p key={company} className="text-muted-foreground">
                    {company}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {content.originalLanguage && (
                <div>
                  <p className="font-medium">Idioma Original</p>
                  <p className="text-muted-foreground">
                    {content.originalLanguage.toUpperCase()}
                  </p>
                </div>
              )}
              {content.popularity && (
                <div>
                  <p className="font-medium">Popularidad</p>
                  <p className="text-muted-foreground">
                    {content.popularity.toFixed(0)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
