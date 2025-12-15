import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, X, Eye, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, Badge } from '@/components/ui'
import { ContentCardMenu } from './ContentCardMenu'
import { cn } from '@/lib/utils'
import type { Content, WatchStatus } from '@/types'

interface ContentCardProps {
  content: Content
  userStatus?: WatchStatus
  onAddToList?: (status: WatchStatus) => void
  onRemoveFromList?: () => void
  showQuickActions?: boolean
  onToggleLike?: () => void
  isLiked?: boolean
  onMarkAsWatched?: () => void
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

const typeLabels: Record<string, string> = {
  movie: 'Película',
  tv: 'Serie',
  anime: 'Anime',
}

const typeVariants: Record<string, 'movie' | 'tv' | 'anime'> = {
  movie: 'movie',
  tv: 'tv',
  anime: 'anime',
}

const statusLabels: Record<WatchStatus, string> = {
  watching: 'Viendo',
  completed: 'Completado',
  plan_to_watch: 'Planeado',
  on_hold: 'En espera',
  dropped: 'Abandonado',
}

export function ContentCard({
  content,
  userStatus,
  onAddToList,
  onRemoveFromList,
  showQuickActions = true,
  onToggleLike,
  isLiked = false,
  onMarkAsWatched,
}: ContentCardProps) {
  const [isInList, setIsInList] = useState(!!userStatus)
  const [isHovered, setIsHovered] = useState(false)
  const [liked, setLiked] = useState(isLiked)
  const [watched, setWatched] = useState(userStatus === 'completed')
  const [isWatchedAnimating, setIsWatchedAnimating] = useState(false)

  // Check if posterPath is a full URL (for anime from Jikan) or a path (for TMDB)
  const imageUrl = content.posterPath
    ? content.posterPath.startsWith('http')
      ? content.posterPath
      : `${TMDB_IMAGE_BASE}${content.posterPath}`
    : '/placeholder-poster.jpg'

  const handleAddToList = (e: React.MouseEvent, status: WatchStatus) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToList) {
      onAddToList(status)
      setIsInList(true)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRemoveFromList) {
      onRemoveFromList()
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    onToggleLike?.()
  }

  const handleMarkWatched = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Toggle el estado de watched
    const newWatchedState = !watched
    setWatched(newWatchedState)

    // Activar animación solo cuando se marca como visto
    if (newWatchedState) {
      setIsWatchedAnimating(true)
      setTimeout(() => setIsWatchedAnimating(false), 600)
    }

    // Solo llamar a los handlers cuando se marca como visto (no cuando se desmarca)
    if (newWatchedState) {
      if (onMarkAsWatched) {
        onMarkAsWatched()
      } else if (onAddToList) {
        onAddToList('completed')
      }
    }
  }

  // Validate that we have the required data for the link
  const hasValidLink = content.type && content.externalId
  const linkPath = hasValidLink ? `/${content.type}/${content.externalId}` : '#'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="group relative overflow-hidden card-hover">
        <Link to={linkPath} onClick={(e) => !hasValidLink && e.preventDefault()}>
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={content.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {/* Gradient overlay on hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )} />

            {/* Action icons - top right */}
            <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
              {/* Remove button - visible on hover when in list */}
              {onRemoveFromList && (
                <motion.button
                  onClick={handleRemove}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                  transition={{ duration: 0.2 }}
                  title="Quitar de mi lista"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}

              {/* Rating Badge - When not in list */}
              {content.rating && !onRemoveFromList && (
                <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{content.rating.toFixed(1)}</span>
                </div>
              )}

              {/* Quick action icons - always visible */}
              <motion.button
                onClick={handleMarkWatched}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300",
                  watched
                    ? "bg-green-500/90 text-white hover:bg-green-600 shadow-lg shadow-green-500/50"
                    : "bg-black/70 text-white hover:bg-black/90"
                )}
                animate={
                  isWatchedAnimating
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
                title={watched ? "Marcado como visto" : "Marcar como visto"}
              >
                <Eye className="h-4 w-4" />
              </motion.button>

              <motion.button
                onClick={handleLike}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
                  liked
                    ? "bg-red-500/90 text-white hover:bg-red-600"
                    : "bg-black/70 text-white hover:bg-black/90"
                )}
                title="Me gusta"
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              </motion.button>

              {/* Menu de opciones */}
              <div className="relative">
                <ContentCardMenu
                  content={content}
                  onAddToList={onAddToList}
                  onMarkAsWatched={handleMarkWatched}
                />
              </div>
            </div>

            {/* Type Badge - Always visible */}
            <Badge
              variant={typeVariants[content.type]}
              className="absolute left-2 top-2 z-10 backdrop-blur-sm text-xs px-3 py-1"
            >
              {typeLabels[content.type]}
            </Badge>


            {/* User Status Badge */}
            {userStatus && !isHovered && (
              <div className="absolute bottom-2 left-2">
                <Badge
                  variant={
                    userStatus === 'watching'
                      ? 'watching'
                      : userStatus === 'completed'
                      ? 'completed'
                      : userStatus === 'on_hold'
                      ? 'onHold'
                      : userStatus === 'dropped'
                      ? 'dropped'
                      : 'planToWatch'
                  }
                >
                  {statusLabels[userStatus]}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        {/* Card content below image - always visible */}
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-medium group-hover:text-primary transition-colors">
            {content.title}
          </h3>
          {content.releaseDate && (
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(content.releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
