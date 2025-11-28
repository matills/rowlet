import { ContentCard } from './ContentCard'
import { Skeleton } from '@/components/ui'
import type { Content, WatchStatus } from '@/types'

interface ContentGridProps {
  content: Content[]
  isLoading?: boolean
  onAddToList?: (content: Content, status: WatchStatus) => void
  userContentStatus?: Record<string, WatchStatus>
}

export function ContentGrid({
  content,
  isLoading,
  onAddToList,
  userContentStatus = {},
}: ContentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No se encontró contenido</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {content.map((item) => (
        <ContentCard
          key={`${item.type}-${item.externalId}`}
          content={item}
          userStatus={userContentStatus[item.id]}
          onAddToList={onAddToList ? (status) => onAddToList(item, status) : undefined}
        />
      ))}
    </div>
  )
}
