import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Plus, Check, Eye, Clock, CheckCircle, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Content, WatchStatus } from '@/types'

interface ContentCardProps {
  content: Content
  userStatus?: WatchStatus
  onAddToList?: (status: WatchStatus) => void
  onRemoveFromList?: () => void
  showQuickActions?: boolean
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
}: ContentCardProps) {
  const [isInList, setIsInList] = useState(!!userStatus)
  const [isHovered, setIsHovered] = useState(false)

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

            {/* Remove button - visible on hover when in list */}
            {onRemoveFromList && (
              <motion.button
                onClick={handleRemove}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
                title="Quitar de mi lista"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}

            {/* Rating Badge - Always visible */}
            {content.rating && !onRemoveFromList && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{content.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Type Badge - Always visible */}
            <Badge
              variant={typeVariants[content.type]}
              className="absolute left-2 top-2 z-10"
            >
              {typeLabels[content.type]}
            </Badge>

            {/* Quick actions on hover */}
            {showQuickActions && onAddToList && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-3 space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                transition={{ duration: 0.2 }}
              >
                {isInList || userStatus ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full gap-2"
                    disabled
                  >
                    <Check className="h-3.5 w-3.5" />
                    En mi lista
                  </Button>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 px-2 text-xs h-8"
                      onClick={(e) => handleAddToList(e, 'watching')}
                      title="Viendo"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Viendo</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 px-2 text-xs h-8"
                      onClick={(e) => handleAddToList(e, 'completed')}
                      title="Completado"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Visto</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 px-2 text-xs h-8"
                      onClick={(e) => handleAddToList(e, 'plan_to_watch')}
                      title="Ver más tarde"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Luego</span>
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

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
