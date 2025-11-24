import { Link } from 'react-router-dom'
import { Star, Plus, Check, Clock, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, Badge, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Content, WatchStatus } from '@/types'

interface ContentCardProps {
  content: Content
  userStatus?: WatchStatus
  onAddToList?: (status: WatchStatus) => void
  showQuickActions?: boolean
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

const statusLabels: Record<WatchStatus, string> = {
  watching: 'Viendo',
  completed: 'Visto',
  plan_to_watch: 'Por ver',
  dropped: 'Abandonado',
  on_hold: 'En pausa',
}

const statusIcons: Record<WatchStatus, typeof Eye> = {
  watching: Eye,
  completed: Check,
  plan_to_watch: Clock,
  dropped: Clock,
  on_hold: Clock,
}

export function ContentCard({
  content,
  userStatus,
  onAddToList,
  showQuickActions = true,
}: ContentCardProps) {
  const imageUrl = content.posterPath
    ? `${TMDB_IMAGE_BASE}${content.posterPath}`
    : '/placeholder-poster.jpg'

  const typeLabel = content.type === 'movie' ? 'Película' : content.type === 'tv' ? 'Serie' : 'Anime'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden">
        <Link to={`/${content.type}/${content.externalId}`}>
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={imageUrl}
              alt={content.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Rating Badge */}
            {content.rating && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{content.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Type Badge */}
            <Badge
              variant="secondary"
              className="absolute left-2 top-2 text-xs"
            >
              {typeLabel}
            </Badge>

            {/* User Status Badge */}
            {userStatus && (
              <Badge
                variant={
                  userStatus === 'watching'
                    ? 'watching'
                    : userStatus === 'completed'
                    ? 'completed'
                    : 'planToWatch'
                }
                className="absolute bottom-2 left-2"
              >
                {statusLabels[userStatus]}
              </Badge>
            )}
          </div>
        </Link>

        <div className="p-3">
          <Link to={`/${content.type}/${content.externalId}`}>
            <h3 className="line-clamp-2 text-sm font-medium hover:text-primary">
              {content.title}
            </h3>
          </Link>
          {content.releaseDate && (
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(content.releaseDate).getFullYear()}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        {showQuickActions && onAddToList && !userStatus && (
          <div className="absolute bottom-16 right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                onAddToList('plan_to_watch')
              }}
              title="Agregar a Por Ver"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                onAddToList('watching')
              }}
              title="Marcar como Viendo"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                onAddToList('completed')
              }}
              title="Marcar como Visto"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
